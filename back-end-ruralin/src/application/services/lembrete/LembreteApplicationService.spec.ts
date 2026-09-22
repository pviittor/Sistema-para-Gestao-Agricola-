/**
 * Testes unitários para LembreteApplicationService
 * 
 * Estes testes verificam a lógica de negócio do Application Service,
 * incluindo validações, regras de negócio e integração com repositório e mapper.
 */

import { LembreteApplicationService } from './LembreteApplicationService';
import { ILembreteRepository } from '../../../infrastructure/repository/ILembreteRepository';
import { LembreteMapper } from '../../mappers/LembreteMapper';
import { CreateLembreteDto } from '../../dto/lembrete/CreateLembreteDto';
import { UpdateLembreteDto } from '../../dto/lembrete/UpdateLembreteDto';
import { LembreteResponseDto } from '../../dto/lembrete/LembreteResponseDto';
import { NotFoundException } from '../../../core/exceptions';
import Lembrete from '../../../models/Lembrete';

// Mock do repositório
const mockRepository: jest.Mocked<ILembreteRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findMany: jest.fn(),
  findAllPaginated: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByUsuario: jest.fn(),
  findProximos: jest.fn(),
};

// Mock do mapper
const mockMapper: jest.Mocked<LembreteMapper> = {
  toEntity: jest.fn(),
  toDto: jest.fn(),
} as any;

describe('LembreteApplicationService', () => {
  let service: LembreteApplicationService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Criar service com repositório mockado
    service = new LembreteApplicationService(mockRepository);
    
    // Substituir mapper interno por mock para testes específicos
    (service as any).mapper = mockMapper;
  });

  describe('create', () => {
    const createDto: CreateLembreteDto = {
      desc_simples: 'Reunião importante',
      desc_completa: 'Reunião com a equipe para discutir o planejamento',
    };

    it('deve criar lembrete com sucesso', async () => {
      // Arrange
      const createdEntity = {
        id: 1,
        ...createDto,
        usuarioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Lembrete;

      const responseDto: LembreteResponseDto = {
        id: 1,
        desc_simples: 'Reunião importante',
        desc_completa: 'Reunião com a equipe para discutir o planejamento',
        usuarioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockMapper.toEntity.mockResolvedValue({ desc_simples: createDto.desc_simples } as any);
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
  });

  describe('update', () => {
    const updateDto: UpdateLembreteDto = {
      desc_simples: 'Reunião Atualizada',
    };

    it('deve atualizar lembrete com sucesso', async () => {
      // Arrange
      const existingEntity = {
        id: 1,
        desc_simples: 'Reunião',
        desc_completa: 'Descrição',
      } as Lembrete;

      const updatedEntity = {
        ...existingEntity,
        desc_simples: 'Reunião Atualizada',
      } as Lembrete;

      const responseDto: LembreteResponseDto = {
        id: 1,
        desc_simples: 'Reunião Atualizada',
        desc_completa: 'Descrição',
        usuarioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(existingEntity);
      mockMapper.toEntity.mockResolvedValue({ desc_simples: updateDto.desc_simples } as any);
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

    it('deve lançar NotFoundException se lembrete não existir', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve remover lembrete com sucesso', async () => {
      // Arrange
      const existingEntity = { id: 1 } as Lembrete;
      mockRepository.findById.mockResolvedValue(existingEntity);
      mockRepository.delete.mockResolvedValue(true);

      // Act
      const result = await service.delete(1);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('deve retornar false se lembrete não existir', async () => {
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
    it('deve retornar DTO do lembrete encontrado', async () => {
      // Arrange
      const entity = { id: 1, desc_simples: 'Reunião' } as Lembrete;
      const dto: LembreteResponseDto = {
        id: 1,
        desc_simples: 'Reunião',
        desc_completa: 'Descrição',
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

    it('deve retornar null se lembrete não existir', async () => {
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
    it('deve retornar lista paginada de lembretes', async () => {
      // Arrange
      const entities = [
        { id: 1, desc_simples: 'Lembrete 1' } as Lembrete,
        { id: 2, desc_simples: 'Lembrete 2' } as Lembrete,
      ];

      const dtos: LembreteResponseDto[] = [
        {
          id: 1,
          desc_simples: 'Lembrete 1',
          desc_completa: 'Descrição 1',
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          desc_simples: 'Lembrete 2',
          desc_completa: 'Descrição 2',
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

  describe('findByUsuario', () => {
    it('deve retornar array de DTOs de lembretes do usuário', async () => {
      // Arrange
      const entities = [
        { id: 1, usuarioId: 1 } as Lembrete,
        { id: 2, usuarioId: 1 } as Lembrete,
      ];

      const dtos: LembreteResponseDto[] = [
        {
          id: 1,
          desc_simples: 'Lembrete 1',
          desc_completa: 'Descrição 1',
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          desc_simples: 'Lembrete 2',
          desc_completa: 'Descrição 2',
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.findByUsuario.mockResolvedValue(entities);
      mockMapper.toDto
        .mockReturnValueOnce(dtos[0])
        .mockReturnValueOnce(dtos[1]);

      // Act
      const result = await service.findByUsuario(1);

      // Assert
      expect(mockRepository.findByUsuario).toHaveBeenCalledWith(1);
      expect(result).toEqual(dtos);
    });
  });

  describe('findProximos', () => {
    it('deve retornar array de DTOs de próximos lembretes', async () => {
      // Arrange
      const entities = [
        { id: 1, desc_simples: 'Lembrete 1' } as Lembrete,
        { id: 2, desc_simples: 'Lembrete 2' } as Lembrete,
      ];

      const dtos: LembreteResponseDto[] = [
        {
          id: 1,
          desc_simples: 'Lembrete 1',
          desc_completa: 'Descrição 1',
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          desc_simples: 'Lembrete 2',
          desc_completa: 'Descrição 2',
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.findProximos.mockResolvedValue(entities);
      mockMapper.toDto
        .mockReturnValueOnce(dtos[0])
        .mockReturnValueOnce(dtos[1]);

      // Act
      const result = await service.findProximos(10);

      // Assert
      expect(mockRepository.findProximos).toHaveBeenCalledWith(10);
      expect(result).toEqual(dtos);
    });

    it('deve usar limite padrão de 10 se não fornecido', async () => {
      // Arrange
      const entities = [] as Lembrete[];
      mockRepository.findProximos.mockResolvedValue(entities);

      // Act
      await service.findProximos();

      // Assert
      expect(mockRepository.findProximos).toHaveBeenCalledWith(10);
    });
  });
});
