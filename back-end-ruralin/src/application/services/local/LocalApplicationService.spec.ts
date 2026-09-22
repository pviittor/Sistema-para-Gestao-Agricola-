/**
 * Testes unitários para LocalApplicationService
 * 
 * Estes testes verificam a lógica de negócio do Application Service,
 * incluindo validações, regras de negócio e integração com repositório e mapper.
 */

import { LocalApplicationService } from './LocalApplicationService';
import { ILocalRepository } from '../../../infrastructure/repository/ILocalRepository';
import { LocalMapper } from '../../mappers/LocalMapper';
import { CreateLocalDto } from '../../dto/local/CreateLocalDto';
import { UpdateLocalDto } from '../../dto/local/UpdateLocalDto';
import { LocalResponseDto } from '../../dto/local/LocalResponseDto';
import { NotFoundException } from '../../../core/exceptions';
import Local from '../../../models/Local';

// Mock do repositório
const mockRepository: jest.Mocked<ILocalRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findMany: jest.fn(),
  findAllPaginated: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByUsuario: jest.fn(),
};

// Mock do mapper
const mockMapper: jest.Mocked<LocalMapper> = {
  toEntity: jest.fn(),
  toDto: jest.fn(),
} as any;

describe('LocalApplicationService', () => {
  let service: LocalApplicationService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Criar service com repositório mockado
    service = new LocalApplicationService(mockRepository);
    
    // Substituir mapper interno por mock para testes específicos
    (service as any).mapper = mockMapper;
  });

  describe('create', () => {
    const createDto: CreateLocalDto = {
      desc_simples: 'Sala de Reuniões',
      desc_completa: 'Sala de reuniões principal no primeiro andar, capacidade para 20 pessoas',
    };

    it('deve criar local com sucesso', async () => {
      // Arrange
      const createdEntity = {
        id: 1,
        ...createDto,
        usuarioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Local;

      const responseDto: LocalResponseDto = {
        id: 1,
        desc_simples: 'Sala de Reuniões',
        desc_completa: 'Sala de reuniões principal no primeiro andar, capacidade para 20 pessoas',
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
    const updateDto: UpdateLocalDto = {
      desc_simples: 'Sala Atualizada',
    };

    it('deve atualizar local com sucesso', async () => {
      // Arrange
      const existingEntity = {
        id: 1,
        desc_simples: 'Sala',
        desc_completa: 'Descrição',
      } as Local;

      const updatedEntity = {
        ...existingEntity,
        desc_simples: 'Sala Atualizada',
      } as Local;

      const responseDto: LocalResponseDto = {
        id: 1,
        desc_simples: 'Sala Atualizada',
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

    it('deve lançar NotFoundException se local não existir', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve remover local com sucesso', async () => {
      // Arrange
      const existingEntity = { id: 1 } as Local;
      mockRepository.findById.mockResolvedValue(existingEntity);
      mockRepository.delete.mockResolvedValue(true);

      // Act
      const result = await service.delete(1);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('deve retornar false se local não existir', async () => {
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
    it('deve retornar DTO do local encontrado', async () => {
      // Arrange
      const entity = { id: 1, desc_simples: 'Sala' } as Local;
      const dto: LocalResponseDto = {
        id: 1,
        desc_simples: 'Sala',
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

    it('deve retornar null se local não existir', async () => {
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
    it('deve retornar lista paginada de locais', async () => {
      // Arrange
      const entities = [
        { id: 1, desc_simples: 'Local 1' } as Local,
        { id: 2, desc_simples: 'Local 2' } as Local,
      ];

      const dtos: LocalResponseDto[] = [
        {
          id: 1,
          desc_simples: 'Local 1',
          desc_completa: 'Descrição 1',
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          desc_simples: 'Local 2',
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
    it('deve retornar array de DTOs de locais do usuário', async () => {
      // Arrange
      const entities = [
        { id: 1, usuarioId: 1 } as Local,
        { id: 2, usuarioId: 1 } as Local,
      ];

      const dtos: LocalResponseDto[] = [
        {
          id: 1,
          desc_simples: 'Local 1',
          desc_completa: 'Descrição 1',
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          desc_simples: 'Local 2',
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
});
