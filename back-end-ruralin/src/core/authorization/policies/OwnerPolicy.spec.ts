/**
 * Testes unitários para OwnerPolicy
 */

import { OwnerPolicy } from './OwnerPolicy';
import { AuthorizationContext } from '../IAuthorizationPolicy';

describe('OwnerPolicy', () => {
  let policy: OwnerPolicy;

  beforeEach(() => {
    policy = new OwnerPolicy();
  });

  describe('check', () => {
    it('deve retornar true se usuário é dono do recurso (userId)', async () => {
      // Arrange
      const context: AuthorizationContext = {
        userId: 1,
        resource: {
          id: 100,
          userId: 1,
          nome: 'Recurso',
        },
      };

      // Act
      const result = await policy.check(context);

      // Assert
      expect(result).toBe(true);
    });

    it('deve retornar true se usuário é dono do recurso (usuarioId)', async () => {
      // Arrange
      const context: AuthorizationContext = {
        userId: 1,
        resource: {
          id: 100,
          usuarioId: 1,
          nome: 'Recurso',
        },
      };

      // Act
      const result = await policy.check(context);

      // Assert
      expect(result).toBe(true);
    });

    it('deve retornar false se usuário não é dono do recurso', async () => {
      // Arrange
      const context: AuthorizationContext = {
        userId: 1,
        resource: {
          id: 100,
          userId: 2, // Diferente do userId do contexto
          nome: 'Recurso',
        },
      };

      // Act
      const result = await policy.check(context);

      // Assert
      expect(result).toBe(false);
    });

    it('deve retornar false se recurso não existe', async () => {
      // Arrange
      const context: AuthorizationContext = {
        userId: 1,
        // resource não definido
      };

      // Act
      const result = await policy.check(context);

      // Assert
      expect(result).toBe(false);
    });

    it('deve retornar false se recurso não tem userId', async () => {
      // Arrange
      const context: AuthorizationContext = {
        userId: 1,
        resource: {
          id: 100,
          nome: 'Recurso',
          // userId não definido
        },
      };

      // Act
      const result = await policy.check(context);

      // Assert
      expect(result).toBe(false);
    });

    it('deve retornar false se userId do recurso é null', async () => {
      // Arrange
      const context: AuthorizationContext = {
        userId: 1,
        resource: {
          id: 100,
          userId: null,
          nome: 'Recurso',
        },
      };

      // Act
      const result = await policy.check(context);

      // Assert
      expect(result).toBe(false);
    });

    it('deve retornar false se userId do recurso é undefined', async () => {
      // Arrange
      const context: AuthorizationContext = {
        userId: 1,
        resource: {
          id: 100,
          userId: undefined,
          nome: 'Recurso',
        },
      };

      // Act
      const result = await policy.check(context);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('name', () => {
    it('deve ter nome "owner"', () => {
      expect(policy.name).toBe('owner');
    });
  });
});
