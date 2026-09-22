/**
 * Testes unitários para AuthorizationService
 */

import { AuthorizationService } from './AuthorizationService';
import { IUsuarioRepository } from '../../../infrastructure/repository/IUsuarioRepository';
import { IRoleRepository } from '../../../infrastructure/repository/IRoleRepository';
import { IPermissaoRepository } from '../../../infrastructure/repository/IPermissaoRepository';
import UsuarioHasRole from '../../../models/UsuarioHasRole';
import RoleHasPermissao from '../../../models/RoleHasPermissao';
import Usuario from '../../../models/Usuario';
import Role from '../../../models/Role';
import Permissao from '../../../models/Permissao';

// Mock dos modelos
jest.mock('../../../models/UsuarioHasRole');
jest.mock('../../../models/RoleHasPermissao');

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let mockUsuarioRepository: jest.Mocked<IUsuarioRepository>;
  let mockRoleRepository: jest.Mocked<IRoleRepository>;
  let mockPermissaoRepository: jest.Mocked<IPermissaoRepository>;

  const mockUsuario: Usuario = {
    id: 1,
    nome: 'Test User',
    email: 'test@example.com',
    username: 'testuser',
    apiKey: 'test-key',
    apiUrl: 'https://test.com',
    tipo: 'ROOT',
    whatsapp: '123456789',
    roleIds: [],
    senha: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Usuario;

  const mockRole: Role = {
    id: 1,
    nome: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Role;

  const mockPermissao: Permissao = {
    id: 1,
    nome: 'usuario.create',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Permissao;

  beforeEach(() => {
    // Criar mocks dos repositórios
    mockUsuarioRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockRoleRepository = {
      findByNome: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockPermissaoRepository = {
      findByNome: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    // Criar instância do serviço
    service = new AuthorizationService(
      mockUsuarioRepository,
      mockRoleRepository,
      mockPermissaoRepository
    );

    // Limpar mocks
    jest.clearAllMocks();
  });

  describe('hasPermission', () => {
    it('deve retornar true se usuário tem a permissão', async () => {
      // Arrange
      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockPermissaoRepository.findByNome.mockResolvedValue(mockPermissao);
      (UsuarioHasRole.findAll as jest.Mock).mockResolvedValue([
        { usuarioId: 1, roleId: 1 } as UsuarioHasRole,
      ]);
      (RoleHasPermissao.findAll as jest.Mock).mockResolvedValue([
        { roleId: 1, permissaoId: 1 } as RoleHasPermissao,
      ]);

      // Act
      const result = await service.hasPermission(1, 'usuario.create');

      // Assert
      expect(result).toBe(true);
      expect(mockUsuarioRepository.findById).toHaveBeenCalledWith(1);
      expect(mockPermissaoRepository.findByNome).toHaveBeenCalledWith('usuario.create');
      expect(UsuarioHasRole.findAll).toHaveBeenCalled();
      expect(RoleHasPermissao.findAll).toHaveBeenCalled();
    });

    it('deve retornar false se usuário não existe', async () => {
      // Arrange
      mockUsuarioRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.hasPermission(999, 'usuario.create');

      // Assert
      expect(result).toBe(false);
      expect(mockUsuarioRepository.findById).toHaveBeenCalledWith(999);
      expect(mockPermissaoRepository.findByNome).not.toHaveBeenCalled();
    });

    it('deve retornar false se permissão não existe', async () => {
      // Arrange
      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockPermissaoRepository.findByNome.mockResolvedValue(null);

      // Act
      const result = await service.hasPermission(1, 'permissao.inexistente');

      // Assert
      expect(result).toBe(false);
      expect(mockPermissaoRepository.findByNome).toHaveBeenCalledWith('permissao.inexistente');
    });

    it('deve retornar false se usuário não tem roles', async () => {
      // Arrange
      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockPermissaoRepository.findByNome.mockResolvedValue(mockPermissao);
      (UsuarioHasRole.findAll as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await service.hasPermission(1, 'usuario.create');

      // Assert
      expect(result).toBe(false);
    });

    it('deve retornar false se usuário não tem a permissão', async () => {
      // Arrange
      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockPermissaoRepository.findByNome.mockResolvedValue(mockPermissao);
      (UsuarioHasRole.findAll as jest.Mock).mockResolvedValue([
        { usuarioId: 1, roleId: 1 } as UsuarioHasRole,
      ]);
      (RoleHasPermissao.findAll as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await service.hasPermission(1, 'usuario.create');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('deve retornar true se usuário tem a role', async () => {
      // Arrange
      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockRoleRepository.findByNome.mockResolvedValue(mockRole);
      const findOneMock = UsuarioHasRole.findOne as jest.MockedFunction<typeof UsuarioHasRole.findOne>;
      findOneMock.mockResolvedValue({
        usuarioId: 1,
        roleId: 1,
      } as any);

      // Act
      const result = await service.hasRole(1, 'ADMIN');

      // Assert
      expect(result).toBe(true);
      expect(mockUsuarioRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRoleRepository.findByNome).toHaveBeenCalledWith('ADMIN');
      expect(findOneMock).toHaveBeenCalled();
    });

    it('deve retornar false se usuário não existe', async () => {
      // Arrange
      mockUsuarioRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.hasRole(999, 'ADMIN');

      // Assert
      expect(result).toBe(false);
    });

    it('deve retornar false se role não existe', async () => {
      // Arrange
      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockRoleRepository.findByNome.mockResolvedValue(null);

      // Act
      const result = await service.hasRole(1, 'ROLE_INEXISTENTE');

      // Assert
      expect(result).toBe(false);
    });

    it('deve retornar false se usuário não tem a role', async () => {
      // Arrange
      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockRoleRepository.findByNome.mockResolvedValue(mockRole);
      const findOneMock = UsuarioHasRole.findOne as jest.MockedFunction<typeof UsuarioHasRole.findOne>;
      findOneMock.mockResolvedValue(null);

      // Act
      const result = await service.hasRole(1, 'ADMIN');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('deve retornar true se usuário tem pelo menos uma das roles', async () => {
      // Arrange
      const mockRole2: Role = { id: 2, nome: 'MANAGER' } as Role;
      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockRoleRepository.findAll.mockResolvedValue([mockRole, mockRole2]);
      (UsuarioHasRole.findAll as jest.Mock).mockResolvedValue([
        { usuarioId: 1, roleId: 1 } as UsuarioHasRole,
      ]);

      // Act
      const result = await service.hasAnyRole(1, ['ADMIN', 'MANAGER']);

      // Assert
      expect(result).toBe(true);
      expect(mockRoleRepository.findAll).toHaveBeenCalled();
      expect(UsuarioHasRole.findAll).toHaveBeenCalled();
    });

    it('deve retornar false se usuário não existe', async () => {
      // Arrange
      mockUsuarioRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.hasAnyRole(999, ['ADMIN']);

      // Assert
      expect(result).toBe(false);
    });

    it('deve retornar false se array de roles está vazio', async () => {
      // Arrange
      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);

      // Act
      const result = await service.hasAnyRole(1, []);

      // Assert
      expect(result).toBe(false);
    });

    it('deve retornar false se nenhuma role existe', async () => {
      // Arrange
      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockRoleRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.hasAnyRole(1, ['ROLE_INEXISTENTE']);

      // Assert
      expect(result).toBe(false);
    });

    it('deve retornar false se usuário não tem nenhuma das roles', async () => {
      // Arrange
      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockRoleRepository.findAll.mockResolvedValue([mockRole]);
      (UsuarioHasRole.findAll as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await service.hasAnyRole(1, ['ADMIN']);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasAllRoles', () => {
    it('deve retornar true se usuário tem todas as roles', async () => {
      // Arrange
      const mockRole2: Role = { id: 2, nome: 'MANAGER' } as Role;
      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockRoleRepository.findAll.mockResolvedValue([mockRole, mockRole2]);
      (UsuarioHasRole.findAll as jest.Mock).mockResolvedValue([
        { usuarioId: 1, roleId: 1 } as UsuarioHasRole,
        { usuarioId: 1, roleId: 2 } as UsuarioHasRole,
      ]);

      // Act
      const result = await service.hasAllRoles(1, ['ADMIN', 'MANAGER']);

      // Assert
      expect(result).toBe(true);
    });

    it('deve retornar true se array de roles está vazio', async () => {
      // Arrange
      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);

      // Act
      const result = await service.hasAllRoles(1, []);

      // Assert
      expect(result).toBe(true);
    });

    it('deve retornar false se usuário não existe', async () => {
      // Arrange
      mockUsuarioRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.hasAllRoles(999, ['ADMIN']);

      // Assert
      expect(result).toBe(false);
    });

    it('deve retornar false se alguma role não existe', async () => {
      // Arrange
      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockRoleRepository.findAll.mockResolvedValue([mockRole]); // Apenas uma role encontrada

      // Act
      const result = await service.hasAllRoles(1, ['ADMIN', 'MANAGER']);

      // Assert
      expect(result).toBe(false);
    });

    it('deve retornar false se usuário não tem todas as roles', async () => {
      // Arrange
      const mockRole2: Role = { id: 2, nome: 'MANAGER' } as Role;
      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockRoleRepository.findAll.mockResolvedValue([mockRole, mockRole2]);
      (UsuarioHasRole.findAll as jest.Mock).mockResolvedValue([
        { usuarioId: 1, roleId: 1 } as UsuarioHasRole, // Apenas uma role
      ]);

      // Act
      const result = await service.hasAllRoles(1, ['ADMIN', 'MANAGER']);

      // Assert
      expect(result).toBe(false);
    });
  });
});
