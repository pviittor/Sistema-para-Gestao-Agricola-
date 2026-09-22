/**
 * Testes unitários para decorator @RequireAllPermissions
 */

import { RequireAllPermissions } from './RequireAllPermissions';
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

describe('@RequireAllPermissions decorator', () => {
  let mockAuthService: jest.Mocked<IAuthorizationService>;
  let mockRequestContext: jest.Mocked<RequestContext>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequestContext = {
      getUserId: jest.fn().mockReturnValue(1),
    } as any;

    mockAuthService = {
      hasPermission: jest.fn().mockResolvedValue(true),
    } as any;

    (container.resolve as jest.Mock) = jest.fn().mockImplementation((token) => {
      if (token === TYPES.IAuthorizationService) return mockAuthService;
      if (token === TYPES.RequestContext) return mockRequestContext;
      throw new Error(`Unknown token`);
    });
  });

  it('deve permitir execução quando usuário tem todas as permissões', async () => {
    class TestService {
      @RequireAllPermissions(['usuario.read', 'usuario.write'])
      async testMethod(): Promise<string> {
        return 'sucesso';
      }
    }

    const service = new TestService();
    const result = await service.testMethod();

    expect(result).toBe('sucesso');
    expect(mockAuthService.hasPermission).toHaveBeenCalledTimes(2);
  });

  it('deve lançar ForbiddenException quando usuário não tem todas as permissões', async () => {
    mockAuthService.hasPermission
      .mockResolvedValueOnce(true)  // primeira permissão: true
      .mockResolvedValueOnce(false); // segunda permissão: false

    class TestService {
      @RequireAllPermissions(['usuario.read', 'usuario.write'])
      async testMethod(): Promise<string> {
        return 'sucesso';
      }
    }

    const service = new TestService();

    await expect(service.testMethod()).rejects.toThrow(ForbiddenException);
    await expect(service.testMethod()).rejects.toThrow('Todas as seguintes permissões são necessárias');
  });
});
