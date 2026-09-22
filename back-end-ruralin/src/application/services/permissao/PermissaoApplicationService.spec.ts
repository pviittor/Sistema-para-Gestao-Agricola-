/**
 * Testes unitários para PermissaoApplicationService
 * 
 * Estes testes verificam a lógica de negócio do Application Service,
 * incluindo validações, regras de negócio e integração com repositório e mapper.
 */

import { PermissaoApplicationService } from './PermissaoApplicationService';
import { IPermissaoRepository } from '../../../infrastructure/repository/IPermissaoRepository';
import { PermissaoMapper } from '../../mappers/PermissaoMapper';
import { CreatePermissaoDto } from '../../dto/permissao/CreatePermissaoDto';
import { UpdatePermissaoDto } from '../../dto/permissao/UpdatePermissaoDto';
import { PermissaoResponseDto } from '../../dto/permissao/PermissaoResponseDto';
import { NotFoundException } from '../../../core/exceptions';
import Permissao from '../../../models/Permissao';

// Mock do repositório
const mockRepository: jest.Mocked<IPermissaoRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findMany: jest.fn(),
  findAllPaginated: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByNome: jest.fn(),
};

// Mock do mapper
const mockMapper: jest.Mocked<PermissaoMapper> = {
  toEntity: jest.fn(),
  toDto: jest.fn(),
} as any;

describe('PermissaoApplicationService', () => {
  let service: PermissaoApplicationService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Criar service com repositório mockado
    service = new PermissaoApplicationService(mockRepository);
    
    // Substituir mapper interno por mock para testes específicos
    (service as any).mapper = mockMapper;
  });

  describe('create', () => {
    const createDto: CreatePermissaoDto = {
      nome: 'usuarios.criar',
    };

    it('deve criar permissão com sucesso', async () => {
      // Arrange
      const createdEntity = {
        id: 1,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Permissao;

      const responseDto: PermissaoResponseDto = {
        id: 1,
        nome: 'usuarios.criar',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockMapper.toEntity.mockResolvedValue({ nome: createDto.nome } as any);
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
    const updateDto: UpdatePermissaoDto = {
      nome: 'usuarios.atualizar',
    };

    it('deve atualizar permissão com sucesso', async () => {
      // Arrange
      const existingEntity = {
        id: 1,
        nome: 'usuarios.criar',
      } as Permissao;

      const updatedEntity = {
        ...existingEntity,
        nome: 'usuarios.atualizar',
      } as Permissao;

      const responseDto: PermissaoResponseDto = {
        id: 1,
        nome: 'usuarios.atualizar',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(existingEntity);
      mockMapper.toEntity.mockResolvedValue({ nome: updateDto.nome } as any);
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

    it('deve lançar NotFoundException se permissão não existir', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve remover permissão com sucesso', async () => {
      // Arrange
      const existingEntity = { id: 1 } as Permissao;
      mockRepository.findById.mockResolvedValue(existingEntity);
      mockRepository.delete.mockResolvedValue(true);

      // Act
      const result = await service.delete(1);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('deve retornar false se permissão não existir', async () => {
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
    it('deve retornar DTO da permissão encontrada', async () => {
      // Arrange
      const entity = { id: 1, nome: 'usuarios.criar' } as Permissao;
      const dto: PermissaoResponseDto = {
        id: 1,
        nome: 'usuarios.criar',
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

    it('deve retornar null se permissão não existir', async () => {
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
    it('deve retornar lista paginada de permissões', async () => {
      // Arrange
      const entities = [
        { id: 1, nome: 'permissao.1' } as Permissao,
        { id: 2, nome: 'permissao.2' } as Permissao,
      ];

      const dtos: PermissaoResponseDto[] = [
        {
          id: 1,
          nome: 'permissao.1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          nome: 'permissao.2',
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

  describe('findByNome', () => {
    it('deve retornar DTO da permissão encontrada por nome', async () => {
      // Arrange
      const entity = { id: 1, nome: 'usuarios.criar' } as Permissao;
      const dto: PermissaoResponseDto = {
        id: 1,
        nome: 'usuarios.criar',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByNome.mockResolvedValue(entity);
      mockMapper.toDto.mockReturnValue(dto);

      // Act
      const result = await service.findByNome('usuarios.criar');

      // Assert
      expect(mockRepository.findByNome).toHaveBeenCalledWith('usuarios.criar');
      expect(mockMapper.toDto).toHaveBeenCalledWith(entity);
      expect(result).toEqual(dto);
    });

    it('deve retornar null se permissão não existir', async () => {
      // Arrange
      mockRepository.findByNome.mockResolvedValue(null);

      // Act
      const result = await service.findByNome('inexistente');

      // Assert
      expect(result).toBeNull();
      expect(mockMapper.toDto).not.toHaveBeenCalled();
    });
  });
});
