/**
 * Testes unitários para decorator @RequirePermission
 * 
 * Estes testes verificam o comportamento do decorator,
 * incluindo interceptação de métodos, verificação de permissões,
 * e lançamento de exceções quando necessário.
 */

import { RequirePermission } from './RequirePermission';
import { IAuthorizationService } from './IAuthorizationService';
import { container } from '../di/container';
import { TYPES } from '../di/types';
import { ForbiddenException } from '../exceptions';
import { RequestContext } from '../context/RequestContext';

// Mock do container
jest.mock('../di/container', () => ({
  container: {
    resolve: jest.fn(),
  },
}));

// Mock do TYPES
jest.mock('../di/types', () => ({
  TYPES: {
    IAuthorizationService: Symbol.for('IAuthorizationService'),
    RequestContext: Symbol.for('RequestContext'),
  },
}));

describe('@RequirePermission decorator', () => {
  let mockAuthService: jest.Mocked<IAuthorizationService>;
  let mockRequestContext: jest.Mocked<RequestContext>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Criar mock de RequestContext
    mockRequestContext = {
      getUserId: jest.fn().mockReturnValue(1),
      getRequestId: jest.fn().mockReturnValue('test-request-id'),
      setUserId: jest.fn(),
      setRequestId: jest.fn(),
      getStartTime: jest.fn().mockReturnValue(Date.now()),
      getDuration: jest.fn().mockReturnValue(100),
      clear: jest.fn(),
      toJSON: jest.fn().mockReturnValue({}),
    } as any;

    // Criar mock de AuthorizationService
    mockAuthService = {
      hasPermission: jest.fn().mockResolvedValue(true),
      hasRole: jest.fn().mockResolvedValue(true),
      hasAnyRole: jest.fn().mockResolvedValue(true),
      hasAllRoles: jest.fn().mockResolvedValue(true),
    } as any;

    // Mock do container.resolve
    (container.resolve as jest.Mock) = jest.fn().mockImplementation((token) => {
      if (token === TYPES.IAuthorizationService) {
        return mockAuthService;
      }
      if (token === TYPES.RequestContext) {
        return mockRequestContext;
      }
      throw new Error(`Unknown token: ${token.toString()}`);
    });
  });

  describe('aplicação do decorator', () => {
    it('deve interceptar método e verificar permissão', async () => {
      // Arrange
      class TestService {
        @RequirePermission('usuario.create')
        async testMethod(): Promise<string> {
          return 'resultado';
        }
      }

      const service = new TestService();

      // Act
      const result = await service.testMethod();

      // Assert
      expect(container.resolve).toHaveBeenCalledWith(TYPES.IAuthorizationService);
      expect(mockAuthService.hasPermission).toHaveBeenCalledWith(1, 'usuario.create');
      expect(result).toBe('resultado');
    });

    it('deve passar argumentos corretamente para método original', async () => {
      // Arrange
      class TestService {
        @RequirePermission('usuario.create')
        async testMethod(arg1: string, arg2: number): Promise<string> {
          return `${arg1}-${arg2}`;
        }
      }

      const service = new TestService();

      // Act
      const result = await service.testMethod('teste', 123);

      // Assert
      expect(result).toBe('teste-123');
    });

    it('deve manter contexto (this) do método original', async () => {
      // Arrange
      class TestService {
        private value = 'contexto';

        @RequirePermission('usuario.create')
        async testMethod(): Promise<string> {
          return this.value;
        }
      }

      const service = new TestService();

      // Act
      const result = await service.testMethod();

      // Assert
      expect(result).toBe('contexto');
    });
  });

  describe('verificação de permissão', () => {
    it('deve permitir execução quando usuário tem permissão', async () => {
      // Arrange
      mockAuthService.hasPermission.mockResolvedValue(true);

      class TestService {
        @RequirePermission('usuario.create')
        async testMethod(): Promise<string> {
          return 'sucesso';
        }
      }

      const service = new TestService();

      // Act
      const result = await service.testMethod();

      // Assert
      expect(result).toBe('sucesso');
      expect(mockAuthService.hasPermission).toHaveBeenCalledWith(1, 'usuario.create');
    });

    it('deve lançar ForbiddenException quando usuário não tem permissão', async () => {
      // Arrange
      mockAuthService.hasPermission.mockResolvedValue(false);

      class TestService {
        @RequirePermission('usuario.create')
        async testMethod(): Promise<string> {
          return 'sucesso';
        }
      }

      const service = new TestService();

      // Act & Assert
      await expect(service.testMethod()).rejects.toThrow(ForbiddenException);
      await expect(service.testMethod()).rejects.toThrow("Permissão 'usuario.create' necessária");
    });

    it('deve lançar ForbiddenException quando usuário não está autenticado', async () => {
      // Arrange
      mockRequestContext.getUserId.mockReturnValue(undefined);

      class TestService {
        @RequirePermission('usuario.create')
        async testMethod(): Promise<string> {
          return 'sucesso';
        }
      }

      const service = new TestService();

      // Act & Assert
      await expect(service.testMethod()).rejects.toThrow(ForbiddenException);
      await expect(service.testMethod()).rejects.toThrow('Usuário não autenticado');
    });
  });

  describe('métodos assíncronos', () => {
    it('deve suportar métodos assíncronos', async () => {
      // Arrange
      class TestService {
        @RequirePermission('usuario.create')
        async testMethod(): Promise<string> {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'assíncrono';
        }
      }

      const service = new TestService();

      // Act
      const result = await service.testMethod();

      // Assert
      expect(result).toBe('assíncrono');
    });
  });

  describe('validação de uso', () => {
    it('deve lançar erro se aplicado a propriedade que não é método', () => {
      // Arrange & Act & Assert
      expect(() => {
        class TestService {
          @RequirePermission('usuario.create')
          notAMethod: string = 'teste';
        }
      }).toThrow('@RequirePermission can only be applied to methods');
    });
  });
});
