/**
 * Testes unitários para FinanceiroApplicationService
 * 
 * Estes testes verificam a lógica de negócio do Application Service,
 * incluindo validações, regras de negócio e integração com repositório e mapper.
 */

import { FinanceiroApplicationService } from './FinanceiroApplicationService';
import { IFinanceiroRepository } from '../../../infrastructure/repository/IFinanceiroRepository';
import { FinanceiroMapper } from '../../mappers/FinanceiroMapper';
import { CreateFinanceiroDto } from '../../dto/financeiro/CreateFinanceiroDto';
import { UpdateFinanceiroDto } from '../../dto/financeiro/UpdateFinanceiroDto';
import { FinanceiroResponseDto } from '../../dto/financeiro/FinanceiroResponseDto';
import { BusinessException, NotFoundException } from '../../../core/exceptions';
import Financeiro from '../../../models/Financeiro';

// Mock do repositório
const mockRepository: jest.Mocked<IFinanceiroRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findMany: jest.fn(),
  findAllPaginated: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByPeriodo: jest.fn(),
  findByTipo: jest.fn(),
};

// Mock do mapper
const mockMapper: jest.Mocked<FinanceiroMapper> = {
  toEntity: jest.fn(),
  toDto: jest.fn(),
} as any;

describe('FinanceiroApplicationService', () => {
  let service: FinanceiroApplicationService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Criar service com repositório mockado
    service = new FinanceiroApplicationService(mockRepository);
    
    // Substituir mapper interno por mock para testes específicos
    (service as any).mapper = mockMapper;
  });

  describe('create', () => {
    const createDto: CreateFinanceiroDto = {
      dataEmissao: '2025-01-20',
      dataVencimento: '2025-01-25',
      valor: 1500.50,
    };

    it('deve criar registro financeiro com sucesso', async () => {
      // Arrange
      const createdEntity = {
        id: 1,
        ...createDto,
        usuarioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Financeiro;

      const responseDto: FinanceiroResponseDto = {
        id: 1,
        dataEmissao: '2025-01-20',
        dataVencimento: '2025-01-25',
        valor: 1500.50,
        usuarioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockMapper.toEntity.mockResolvedValue({ valor: createDto.valor } as any);
      mockRepository.create.mockResolvedValue(createdEntity);
      mockMapper.toDto.mockReturnValue(responseDto);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(mockMapper.toEntity).toHaveBeenCalledWith(createDto);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockMapper.toDto).toHaveBeenCalledWith(createdEntity);
      expect(result).toEqual(responseDto);
    });

    it('deve lançar BusinessException se data de vencimento for anterior à data de emissão', async () => {
      // Arrange
      const dtoComDataInvalida: CreateFinanceiroDto = {
        ...createDto,
        dataEmissao: '2025-01-25',
        dataVencimento: '2025-01-20', // Vencimento antes da emissão
      };

      // Act & Assert
      await expect(service.create(dtoComDataInvalida)).rejects.toThrow(BusinessException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar BusinessException se valor for zero', async () => {
      // Arrange
      const dtoComValorZero: CreateFinanceiroDto = {
        ...createDto,
        valor: 0,
      };

      // Act & Assert
      await expect(service.create(dtoComValorZero)).rejects.toThrow(BusinessException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateFinanceiroDto = {
      valor: 2000.00,
    };

    it('deve atualizar registro financeiro com sucesso', async () => {
      // Arrange
      const existingEntity = {
        id: 1,
        dataEmissao: '2025-01-20',
        dataVencimento: '2025-01-25',
        valor: 1500.50,
      } as Financeiro;

      const updatedEntity = {
        ...existingEntity,
        valor: 2000.00,
      } as Financeiro;

      const responseDto: FinanceiroResponseDto = {
        id: 1,
        dataEmissao: '2025-01-20',
        dataVencimento: '2025-01-25',
        valor: 2000.00,
        usuarioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(existingEntity);
      mockMapper.toEntity.mockResolvedValue({ valor: updateDto.valor } as any);
      mockRepository.update.mockResolvedValue(updatedEntity);
      mockMapper.toDto.mockReturnValue(responseDto);

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockMapper.toEntity).toHaveBeenCalledWith(updateDto);
      expect(mockRepository.update).toHaveBeenCalled();
      expect(mockMapper.toDto).toHaveBeenCalledWith(updatedEntity);
      expect(result).toEqual(responseDto);
    });

    it('deve lançar NotFoundException se registro não existir', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('deve lançar BusinessException se novo valor for zero', async () => {
      // Arrange
      const existingEntity = {
        id: 1,
        valor: 1500.50,
      } as Financeiro;

      const updateComValorZero: UpdateFinanceiroDto = {
        valor: 0,
      };

      mockRepository.findById.mockResolvedValue(existingEntity);

      // Act & Assert
      await expect(service.update(1, updateComValorZero)).rejects.toThrow(BusinessException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve remover registro financeiro com sucesso', async () => {
      // Arrange
      const existingEntity = { id: 1 } as Financeiro;
      mockRepository.findById.mockResolvedValue(existingEntity);
      mockRepository.delete.mockResolvedValue(true);

      // Act
      const result = await service.delete(1);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('deve retornar false se registro não existir', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.delete(1);

      // Assert
      expect(result).toBe(false);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('deve retornar DTO do registro encontrado', async () => {
      // Arrange
      const entity = { id: 1, valor: 1500.50 } as Financeiro;
      const dto: FinanceiroResponseDto = {
        id: 1,
        dataEmissao: '2025-01-20',
        dataVencimento: '2025-01-25',
        valor: 1500.50,
        usuarioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(entity);
      mockMapper.toDto.mockReturnValue(dto);

      // Act
      const result = await service.getById(1);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockMapper.toDto).toHaveBeenCalledWith(entity);
      expect(result).toEqual(dto);
    });

    it('deve retornar null se registro não existir', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.getById(1);

      // Assert
      expect(result).toBeNull();
      expect(mockMapper.toDto).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('deve retornar lista paginada de registros financeiros', async () => {
      // Arrange
      const entities = [
        { id: 1, valor: 1500.50 } as Financeiro,
        { id: 2, valor: -500.00 } as Financeiro,
      ];

      const dtos: FinanceiroResponseDto[] = [
        {
          id: 1,
          dataEmissao: '2025-01-20',
          dataVencimento: '2025-01-25',
          valor: 1500.50,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          dataEmissao: '2025-01-21',
          dataVencimento: '2025-01-26',
          valor: -500.00,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.findAllPaginated.mockResolvedValue({
        data: entities,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      mockMapper.toDto
        .mockReturnValueOnce(dtos[0])
        .mockReturnValueOnce(dtos[1]);

      // Act
      const result = await service.list(1, 10);

      // Assert
      expect(mockRepository.findAllPaginated).toHaveBeenCalledWith(1, 10);
      expect(result.data).toEqual(dtos);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('findByPeriodo', () => {
    it('deve retornar array de DTOs de registros no período', async () => {
      // Arrange
      const entities = [
        { id: 1, dataEmissao: '2025-01-15' } as Financeiro,
        { id: 2, dataEmissao: '2025-01-20' } as Financeiro,
      ];

      const dtos: FinanceiroResponseDto[] = [
        {
          id: 1,
          dataEmissao: '2025-01-15',
          dataVencimento: '2025-01-20',
          valor: 1500.50,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          dataEmissao: '2025-01-20',
          dataVencimento: '2025-01-25',
          valor: -500.00,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.findByPeriodo.mockResolvedValue(entities);
      mockMapper.toDto
        .mockReturnValueOnce(dtos[0])
        .mockReturnValueOnce(dtos[1]);

      // Act
      const result = await service.findByPeriodo('2025-01-01', '2025-01-31');

      // Assert
      expect(mockRepository.findByPeriodo).toHaveBeenCalledWith('2025-01-01', '2025-01-31');
      expect(result).toEqual(dtos);
    });
  });

  describe('findByTipo', () => {
    it('deve retornar array de DTOs de receitas', async () => {
      // Arrange
      const entities = [
        { id: 1, valor: 1500.50 } as Financeiro,
        { id: 2, valor: 2000.00 } as Financeiro,
      ];

      const dtos: FinanceiroResponseDto[] = [
        {
          id: 1,
          dataEmissao: '2025-01-20',
          dataVencimento: '2025-01-25',
          valor: 1500.50,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          dataEmissao: '2025-01-21',
          dataVencimento: '2025-01-26',
          valor: 2000.00,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.findByTipo.mockResolvedValue(entities);
      mockMapper.toDto
        .mockReturnValueOnce(dtos[0])
        .mockReturnValueOnce(dtos[1]);

      // Act
      const result = await service.findByTipo('RECEITA');

      // Assert
      expect(mockRepository.findByTipo).toHaveBeenCalledWith('RECEITA');
      expect(result).toEqual(dtos);
    });

    it('deve retornar array de DTOs de despesas', async () => {
      // Arrange
      const entities = [
        { id: 1, valor: -500.00 } as Financeiro,
        { id: 2, valor: -1000.00 } as Financeiro,
      ];

      const dtos: FinanceiroResponseDto[] = [
        {
          id: 1,
          dataEmissao: '2025-01-20',
          dataVencimento: '2025-01-25',
          valor: -500.00,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          dataEmissao: '2025-01-21',
          dataVencimento: '2025-01-26',
          valor: -1000.00,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.findByTipo.mockResolvedValue(entities);
      mockMapper.toDto
        .mockReturnValueOnce(dtos[0])
        .mockReturnValueOnce(dtos[1]);

      // Act
      const result = await service.findByTipo('DESPESA');

      // Assert
      expect(mockRepository.findByTipo).toHaveBeenCalledWith('DESPESA');
      expect(result).toEqual(dtos);
    });
  });
});
