/**
 * Testes unitários para RoleApplicationService
 * 
 * Estes testes verificam a lógica de negócio do Application Service,
 * incluindo validações, regras de negócio e integração com repositório e mapper.
 */

import { RoleApplicationService } from './RoleApplicationService';
import { IRoleRepository } from '../../../infrastructure/repository/IRoleRepository';
import { RoleMapper } from '../../mappers/RoleMapper';
import { CreateRoleDto } from '../../dto/role/CreateRoleDto';
import { UpdateRoleDto } from '../../dto/role/UpdateRoleDto';
import { RoleResponseDto } from '../../dto/role/RoleResponseDto';
import { NotFoundException } from '../../../core/exceptions';
import Role from '../../../models/Role';

// Mock do repositório
const mockRepository: jest.Mocked<IRoleRepository> = {
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
const mockMapper: jest.Mocked<RoleMapper> = {
  toEntity: jest.fn(),
  toDto: jest.fn(),
} as any;

describe('RoleApplicationService', () => {
  let service: RoleApplicationService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Criar service com repositório mockado
    service = new RoleApplicationService(mockRepository);
    
    // Substituir mapper interno por mock para testes específicos
    (service as any).mapper = mockMapper;
  });

  describe('create', () => {
    const createDto: CreateRoleDto = {
      nome: 'Administrador',
    };

    it('deve criar role com sucesso', async () => {
      // Arrange
      const createdEntity = {
        id: 1,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Role;

      const responseDto: RoleResponseDto = {
        id: 1,
        nome: 'Administrador',
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
    const updateDto: UpdateRoleDto = {
      nome: 'Administrador Atualizado',
    };

    it('deve atualizar role com sucesso', async () => {
      // Arrange
      const existingEntity = {
        id: 1,
        nome: 'Administrador',
      } as Role;

      const updatedEntity = {
        ...existingEntity,
        nome: 'Administrador Atualizado',
      } as Role;

      const responseDto: RoleResponseDto = {
        id: 1,
        nome: 'Administrador Atualizado',
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

    it('deve lançar NotFoundException se role não existir', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve remover role com sucesso', async () => {
      // Arrange
      const existingEntity = { id: 1 } as Role;
      mockRepository.findById.mockResolvedValue(existingEntity);
      mockRepository.delete.mockResolvedValue(true);

      // Act
      const result = await service.delete(1);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('deve retornar false se role não existir', async () => {
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
    it('deve retornar DTO da role encontrada', async () => {
      // Arrange
      const entity = { id: 1, nome: 'Administrador' } as Role;
      const dto: RoleResponseDto = {
        id: 1,
        nome: 'Administrador',
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

    it('deve retornar null se role não existir', async () => {
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
    it('deve retornar lista paginada de roles', async () => {
      // Arrange
      const entities = [
        { id: 1, nome: 'Role 1' } as Role,
        { id: 2, nome: 'Role 2' } as Role,
      ];

      const dtos: RoleResponseDto[] = [
        {
          id: 1,
          nome: 'Role 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          nome: 'Role 2',
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
    it('deve retornar DTO da role encontrada por nome', async () => {
      // Arrange
      const entity = { id: 1, nome: 'ADMIN' } as Role;
      const dto: RoleResponseDto = {
        id: 1,
        nome: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByNome.mockResolvedValue(entity);
      mockMapper.toDto.mockReturnValue(dto);

      // Act
      const result = await service.findByNome('ADMIN');

      // Assert
      expect(mockRepository.findByNome).toHaveBeenCalledWith('ADMIN');
      expect(mockMapper.toDto).toHaveBeenCalledWith(entity);
      expect(result).toEqual(dto);
    });

    it('deve retornar null se role não existir', async () => {
      // Arrange
      mockRepository.findByNome.mockResolvedValue(null);

      // Act
      const result = await service.findByNome('INEXISTENTE');

      // Assert
      expect(result).toBeNull();
      expect(mockMapper.toDto).not.toHaveBeenCalled();
    });
  });
});
