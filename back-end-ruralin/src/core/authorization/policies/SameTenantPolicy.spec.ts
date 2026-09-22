/**
 * Testes unitários para SameTenantPolicy
 */

import { SameTenantPolicy } from './SameTenantPolicy';
import { AuthorizationContext } from '../IAuthorizationPolicy';

describe('SameTenantPolicy', () => {
  let policy: SameTenantPolicy;

  beforeEach(() => {
    policy = new SameTenantPolicy();
  });

  describe('check', () => {
    it('deve retornar true se usuário e recurso têm mesmo tenantId', async () => {
      // Arrange
      const context: AuthorizationContext = {
        userId: 1,
        tenantId: 10,
        resource: {
          id: 100,
          tenantId: 10,
          nome: 'Recurso',
        },
      };

      // Act
      const result = await policy.check(context);

      // Assert
      expect(result).toBe(true);
    });

    it('deve retornar false se usuário e recurso têm tenantId diferente', async () => {
      // Arrange
      const context: AuthorizationContext = {
        userId: 1,
        tenantId: 10,
        resource: {
          id: 100,
          tenantId: 20, // Diferente do tenantId do contexto
          nome: 'Recurso',
        },
      };

      // Act
      const result = await policy.check(context);

      // Assert
      expect(result).toBe(false);
    });

    it('deve retornar true se recurso não tem tenantId (sem multi-tenancy)', async () => {
      // Arrange
      const context: AuthorizationContext = {
        userId: 1,
        tenantId: 10,
        resource: {
          id: 100,
          nome: 'Recurso',
          // tenantId não definido
        },
      };

      // Act
      const result = await policy.check(context);

      // Assert
      expect(result).toBe(true);
    });

    it('deve retornar true se usuário não tem tenantId (sem multi-tenancy)', async () => {
      // Arrange
      const context: AuthorizationContext = {
        userId: 1,
        // tenantId não definido
        resource: {
          id: 100,
          tenantId: 10,
          nome: 'Recurso',
        },
      };

      // Act
      const result = await policy.check(context);

      // Assert
      expect(result).toBe(true);
    });

    it('deve retornar true se nem usuário nem recurso têm tenantId', async () => {
      // Arrange
      const context: AuthorizationContext = {
        userId: 1,
        resource: {
          id: 100,
          nome: 'Recurso',
        },
      };

      // Act
      const result = await policy.check(context);

      // Assert
      expect(result).toBe(true);
    });

    it('deve retornar false se recurso não existe', async () => {
      // Arrange
      const context: AuthorizationContext = {
        userId: 1,
        tenantId: 10,
        // resource não definido
      };

      // Act
      const result = await policy.check(context);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('name', () => {
    it('deve ter nome "sameTenant"', () => {
      expect(policy.name).toBe('sameTenant');
    });
  });
});
