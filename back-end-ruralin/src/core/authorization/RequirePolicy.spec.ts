/**
 * Testes unitários para RequirePolicy decorator
 */

import { RequirePolicy } from './RequirePolicy';
import { PolicyRegistry } from './PolicyRegistry';
import { IAuthorizationPolicy, AuthorizationContext } from './IAuthorizationPolicy';
import { ForbiddenException } from '../exceptions';
import { OwnerPolicy } from './policies/OwnerPolicy';

// Mock do PolicyRegistry
jest.mock('./PolicyRegistry', () => ({
  PolicyRegistry: {
    resolve: jest.fn(),
  },
}));

describe('RequirePolicy', () => {
  let mockPolicy: jest.Mocked<IAuthorizationPolicy>;
  let mockTarget: any;
  let mockDescriptor: PropertyDescriptor;

  beforeEach(() => {
    jest.clearAllMocks();

    // Criar mock da política
    mockPolicy = {
      name: 'owner',
      check: jest.fn(),
    } as any;

    // Mock do PolicyRegistry.resolve
    (PolicyRegistry.resolve as jest.Mock).mockReturnValue(mockPolicy);

    // Criar mock do target e descriptor
    mockTarget = {};
    mockDescriptor = {
      value: jest.fn().mockResolvedValue('result'),
      writable: true,
      enumerable: false,
      configurable: true,
    };
  });

  describe('Registro de Política', () => {
    it('deve lançar erro se política não estiver registrada', () => {
      // Arrange
      (PolicyRegistry.resolve as jest.Mock).mockReturnValue(undefined);

      // Act & Assert
      const decorator = RequirePolicy('inexistente');
      expect(() => {
        decorator(mockTarget, 'testMethod', mockDescriptor);
      }).toThrow("Política 'inexistente' não encontrada");
    });

    it('deve resolver política do registro corretamente', () => {
      // Act
      const decorator = RequirePolicy('owner');
      decorator(mockTarget, 'testMethod', mockDescriptor);

      // Assert
      expect(PolicyRegistry.resolve).toHaveBeenCalledWith('owner');
    });
  });

  describe('Verificação de Política', () => {
    it('deve executar método se política for satisfeita', async () => {
      // Arrange
      mockPolicy.check.mockResolvedValue(true);
      const decorator = RequirePolicy('owner');
      const wrappedMethod = decorator(mockTarget, 'testMethod', mockDescriptor).value;

      // Act
      const result = await wrappedMethod(1, { data: 'test' });

      // Assert
      expect(mockPolicy.check).toHaveBeenCalled();
      expect(mockDescriptor.value).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('deve lançar ForbiddenException se política não for satisfeita', async () => {
      // Arrange
      mockPolicy.check.mockResolvedValue(false);
      const decorator = RequirePolicy('owner');
      const wrappedMethod = decorator(mockTarget, 'testMethod', mockDescriptor).value;

      // Act & Assert
      await expect(wrappedMethod(1, { data: 'test' })).rejects.toThrow(ForbiddenException);
      expect(mockPolicy.check).toHaveBeenCalled();
      expect(mockDescriptor.value).not.toHaveBeenCalled();
    });

    it('deve lançar ForbiddenException se usuário não estiver autenticado', async () => {
      // Arrange
      // Mock getUserIdFromContext para retornar undefined
      jest.doMock('./helpers', () => ({
        getUserIdFromContext: jest.fn().mockReturnValue(undefined),
      }));

      const decorator = RequirePolicy('owner');
      const wrappedMethod = decorator(mockTarget, 'testMethod', mockDescriptor).value;

      // Act & Assert
      await expect(wrappedMethod(1, { data: 'test' })).rejects.toThrow(ForbiddenException);
      expect(mockPolicy.check).not.toHaveBeenCalled();
    });
  });

  describe('Construção de Contexto', () => {
    it('deve extrair resourceId do primeiro argumento numérico', async () => {
      // Arrange
      mockPolicy.check.mockResolvedValue(true);
      const decorator = RequirePolicy('owner');
      const wrappedMethod = decorator(mockTarget, 'testMethod', mockDescriptor).value;

      // Act
      await wrappedMethod(123, { data: 'test' });

      // Assert
      expect(mockPolicy.check).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.any(Number),
          resourceId: 123,
        })
      );
    });

    it('deve extrair resourceId de objeto com propriedade id', async () => {
      // Arrange
      mockPolicy.check.mockResolvedValue(true);
      const decorator = RequirePolicy('owner');
      const wrappedMethod = decorator(mockTarget, 'testMethod', mockDescriptor).value;

      // Act
      await wrappedMethod({ id: 456, data: 'test' });

      // Assert
      expect(mockPolicy.check).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceId: 456,
        })
      );
    });

    it('deve usar getResource se fornecido', async () => {
      // Arrange
      const mockResource = { id: 1, userId: 100 };
      const getResource = jest.fn().mockResolvedValue(mockResource);
      mockPolicy.check.mockResolvedValue(true);
      
      const decorator = RequirePolicy('owner', { getResource });
      const wrappedMethod = decorator(mockTarget, 'testMethod', mockDescriptor).value;

      // Act
      await wrappedMethod(1);

      // Assert
      expect(getResource).toHaveBeenCalledWith(1);
      expect(mockPolicy.check).toHaveBeenCalledWith(
        expect.objectContaining({
          resource: mockResource,
        })
      );
    });

    it('deve usar resourceParam se fornecido', async () => {
      // Arrange
      const mockResource = { id: 1, userId: 100 };
      mockPolicy.check.mockResolvedValue(true);
      
      const decorator = RequirePolicy('owner', { resourceParam: 'entity' });
      const wrappedMethod = decorator(mockTarget, 'testMethod', mockDescriptor).value;

      // Act
      await wrappedMethod({ entity: mockResource });

      // Assert
      expect(mockPolicy.check).toHaveBeenCalledWith(
        expect.objectContaining({
          resource: mockResource,
        })
      );
    });
  });

  describe('Validações', () => {
    it('deve lançar erro se aplicado a não-método', () => {
      // Arrange
      const invalidDescriptor = {
        value: 'not a function',
      } as any;

      // Act & Assert
      const decorator = RequirePolicy('owner');
      expect(() => {
        decorator(mockTarget, 'notMethod', invalidDescriptor);
      }).toThrow('@RequirePolicy can only be applied to methods');
    });
  });
});
