/**
 * Testes unitários para UsuarioApplicationService
 * 
 * Estes testes verificam a lógica de negócio do Application Service,
 * incluindo validações, regras de negócio e integração com repositório e mapper.
 */

import { UsuarioApplicationService } from './UsuarioApplicationService';
import { IUsuarioRepository } from '../../../infrastructure/repository/IUsuarioRepository';
import { UsuarioMapper } from '../../mappers/UsuarioMapper';
import { CreateUsuarioDto, UsuarioTipo } from '../../dto/usuario/CreateUsuarioDto';
import { UpdateUsuarioDto } from '../../dto/usuario/UpdateUsuarioDto';
import { UsuarioResponseDto } from '../../dto/usuario/UsuarioResponseDto';
import { BusinessException, NotFoundException } from '../../../core/exceptions';
import Usuario from '../../../models/Usuario';

// Mock do repositório
const mockRepository: jest.Mocked<IUsuarioRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findMany: jest.fn(),
  findAllPaginated: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
};

// Mock do mapper
const mockMapper: jest.Mocked<UsuarioMapper> = {
  toEntity: jest.fn(),
  toDto: jest.fn(),
} as any;

describe('UsuarioApplicationService', () => {
  let service: UsuarioApplicationService;
  let mapper: UsuarioMapper;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Criar instância do mapper real (não mockado)
    mapper = new UsuarioMapper();
    
    // Criar service com repositório mockado
    service = new UsuarioApplicationService(mockRepository);
    
    // Substituir mapper interno por mock para testes específicos
    (service as any).mapper = mockMapper;
  });

  describe('create', () => {
    const createDto: CreateUsuarioDto = {
      nome: 'João Silva',
      username: 'joao.silva',
      email: 'joao@example.com',
      senha: 'Senha123',
      whatsapp: '+5511999999999',
      tipo: UsuarioTipo.ROOT,
      apiKey: 'key123',
      apiUrl: 'https://api.example.com',
    };

    it('deve criar usuário com sucesso', async () => {
      // Arrange
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByUsername.mockResolvedValue(null);
      
      const createdEntity = {
        id: 1,
        ...createDto,
        senha: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Usuario;

      const responseDto: UsuarioResponseDto = {
        id: 1,
        nome: 'João Silva',
        username: 'joao.silva',
        email: 'joao@example.com',
        whatsapp: '+5511999999999',
        tipo: UsuarioTipo.ROOT,
        apiKey: 'key123',
        apiUrl: 'https://api.example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockMapper.toEntity.mockResolvedValue({ nome: createDto.nome } as any);
      mockRepository.create.mockResolvedValue(createdEntity);
      mockMapper.toDto.mockReturnValue(responseDto);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(createDto.email);
      expect(mockRepository.findByUsername).toHaveBeenCalledWith(createDto.username);
      expect(mockMapper.toEntity).toHaveBeenCalledWith(createDto);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockMapper.toDto).toHaveBeenCalledWith(createdEntity);
      expect(result).toEqual(responseDto);
    });

    it('deve lançar BusinessException se email já estiver em uso', async () => {
      // Arrange
      const existingUser = { id: 1, email: createDto.email } as Usuario;
      mockRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(BusinessException);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(createDto.email);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar BusinessException se username já estiver em uso', async () => {
      // Arrange
      mockRepository.findByEmail.mockResolvedValue(null);
      const existingUser = { id: 1, username: createDto.username } as Usuario;
      mockRepository.findByUsername.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(BusinessException);
      expect(mockRepository.findByUsername).toHaveBeenCalledWith(createDto.username);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateUsuarioDto = {
      nome: 'João Silva Atualizado',
    };

    it('deve atualizar usuário com sucesso', async () => {
      // Arrange
      const existingEntity = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@example.com',
        username: 'joao.silva',
      } as Usuario;

      const updatedEntity = {
        ...existingEntity,
        nome: 'João Silva Atualizado',
      } as Usuario;

      const responseDto: UsuarioResponseDto = {
        id: 1,
        nome: 'João Silva Atualizado',
        email: 'joao@example.com',
        username: 'joao.silva',
        whatsapp: '+5511999999999',
        tipo: UsuarioTipo.ROOT,
        apiKey: 'key123',
        apiUrl: 'https://api.example.com',
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

    it('deve lançar NotFoundException se usuário não existir', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('deve lançar BusinessException se novo email já estiver em uso', async () => {
      // Arrange
      const existingEntity = {
        id: 1,
        email: 'joao@example.com',
        username: 'joao.silva',
      } as Usuario;

      const updateWithEmail: UpdateUsuarioDto = {
        email: 'novoemail@example.com',
      };

      const emailExists = { id: 2, email: 'novoemail@example.com' } as Usuario;

      mockRepository.findById.mockResolvedValue(existingEntity);
      mockRepository.findByEmail.mockResolvedValue(emailExists);

      // Act & Assert
      await expect(service.update(1, updateWithEmail)).rejects.toThrow(BusinessException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve remover usuário com sucesso', async () => {
      // Arrange
      const existingEntity = { id: 1 } as Usuario;
      mockRepository.findById.mockResolvedValue(existingEntity);
      mockRepository.delete.mockResolvedValue(true);

      // Act
      const result = await service.delete(1);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('deve retornar false se usuário não existir', async () => {
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
    it('deve retornar DTO do usuário encontrado', async () => {
      // Arrange
      const entity = { id: 1, nome: 'João Silva' } as Usuario;
      const dto: UsuarioResponseDto = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@example.com',
        username: 'joao.silva',
        whatsapp: '+5511999999999',
        tipo: UsuarioTipo.ROOT,
        apiKey: 'key123',
        apiUrl: 'https://api.example.com',
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

    it('deve retornar null se usuário não existir', async () => {
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
    it('deve retornar lista paginada de usuários', async () => {
      // Arrange
      const entities = [
        { id: 1, nome: 'João' } as Usuario,
        { id: 2, nome: 'Maria' } as Usuario,
      ];

      const dtos: UsuarioResponseDto[] = [
        {
          id: 1,
          nome: 'João',
          email: 'joao@example.com',
          username: 'joao',
          whatsapp: '+5511999999999',
          tipo: UsuarioTipo.ROOT,
          apiKey: 'key123',
          apiUrl: 'https://api.example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          nome: 'Maria',
          email: 'maria@example.com',
          username: 'maria',
          whatsapp: '+5511888888888',
          tipo: UsuarioTipo.CLIENT,
          apiKey: 'key456',
          apiUrl: 'https://api2.example.com',
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

  describe('findByEmail', () => {
    it('deve retornar DTO do usuário encontrado por email', async () => {
      // Arrange
      const entity = { id: 1, email: 'joao@example.com' } as Usuario;
      const dto: UsuarioResponseDto = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@example.com',
        username: 'joao.silva',
        whatsapp: '+5511999999999',
        tipo: UsuarioTipo.ROOT,
        apiKey: 'key123',
        apiUrl: 'https://api.example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByEmail.mockResolvedValue(entity);
      mockMapper.toDto.mockReturnValue(dto);

      // Act
      const result = await service.findByEmail('joao@example.com');

      // Assert
      expect(mockRepository.findByEmail).toHaveBeenCalledWith('joao@example.com');
      expect(mockMapper.toDto).toHaveBeenCalledWith(entity);
      expect(result).toEqual(dto);
    });

    it('deve retornar null se usuário não for encontrado', async () => {
      // Arrange
      mockRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.findByEmail('inexistente@example.com');

      // Assert
      expect(result).toBeNull();
      expect(mockMapper.toDto).not.toHaveBeenCalled();
    });
  });

  describe('findByUsername', () => {
    it('deve retornar DTO do usuário encontrado por username', async () => {
      // Arrange
      const entity = { id: 1, username: 'joao.silva' } as Usuario;
      const dto: UsuarioResponseDto = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@example.com',
        username: 'joao.silva',
        whatsapp: '+5511999999999',
        tipo: UsuarioTipo.ROOT,
        apiKey: 'key123',
        apiUrl: 'https://api.example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByUsername.mockResolvedValue(entity);
      mockMapper.toDto.mockReturnValue(dto);

      // Act
      const result = await service.findByUsername('joao.silva');

      // Assert
      expect(mockRepository.findByUsername).toHaveBeenCalledWith('joao.silva');
      expect(mockMapper.toDto).toHaveBeenCalledWith(entity);
      expect(result).toEqual(dto);
    });

    it('deve retornar null se usuário não for encontrado', async () => {
      // Arrange
      mockRepository.findByUsername.mockResolvedValue(null);

      // Act
      const result = await service.findByUsername('inexistente');

      // Assert
      expect(result).toBeNull();
      expect(mockMapper.toDto).not.toHaveBeenCalled();
    });
  });
});
