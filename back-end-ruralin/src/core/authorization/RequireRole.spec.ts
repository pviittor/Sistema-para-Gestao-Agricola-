/**
 * Testes unitários para decorator @RequireRole
 */

import { RequireRole } from './RequireRole';
import { IAuthorizationService } from './IAuthorizationService';
import { container } from '../di/container';
import { TYPES } from '../di/types';
import { ForbiddenException } from '../exceptions';
import { RequestContext } from '../context/RequestContext';

jest.mock('../di/container', () => ({
  container: {
    resolve: jest.fn(),
  },
}));

jest.mock('../di/types', () => ({
  TYPES: {
    IAuthorizationService: Symbol.for('IAuthorizationService'),
    RequestContext: Symbol.for('RequestContext'),
  },
}));

describe('@RequireRole decorator', () => {
  let mockAuthService: jest.Mocked<IAuthorizationService>;
  let mockRequestContext: jest.Mocked<RequestContext>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequestContext = {
      getUserId: jest.fn().mockReturnValue(1),
    } as any;

    mockAuthService = {
      hasAnyRole: jest.fn().mockResolvedValue(true),
    } as any;

    (container.resolve as jest.Mock) = jest.fn().mockImplementation((token) => {
      if (token === TYPES.IAuthorizationService) return mockAuthService;
      if (token === TYPES.RequestContext) return mockRequestContext;
      throw new Error(`Unknown token`);
    });
  });

  it('deve permitir execução quando usuário tem role', async () => {
    class TestService {
      @RequireRole('ADMIN')
      async testMethod(): Promise<string> {
        return 'sucesso';
      }
    }

    const service = new TestService();
    const result = await service.testMethod();

    expect(result).toBe('sucesso');
    expect(mockAuthService.hasAnyRole).toHaveBeenCalledWith(1, ['ADMIN']);
  });

  it('deve permitir execução quando usuário tem pelo menos uma das roles', async () => {
    class TestService {
      @RequireRole(['ADMIN', 'MANAGER'])
      async testMethod(): Promise<string> {
        return 'sucesso';
      }
    }

    const service = new TestService();
    const result = await service.testMethod();

    expect(result).toBe('sucesso');
    expect(mockAuthService.hasAnyRole).toHaveBeenCalledWith(1, ['ADMIN', 'MANAGER']);
  });

  it('deve lançar ForbiddenException quando usuário não tem role', async () => {
    mockAuthService.hasAnyRole.mockResolvedValue(false);

    class TestService {
      @RequireRole('ADMIN')
      async testMethod(): Promise<string> {
        return 'sucesso';
      }
    }

    const service = new TestService();

    await expect(service.testMethod()).rejects.toThrow(ForbiddenException);
    await expect(service.testMethod()).rejects.toThrow("Role 'ADMIN' necessária");
  });
});
