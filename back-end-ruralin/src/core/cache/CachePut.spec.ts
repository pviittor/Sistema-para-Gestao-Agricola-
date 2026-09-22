/**
 * Testes unitários para decorator @CachePut
 */

import { CachePut } from './CachePut';
import { ICacheService } from './ICacheService';
import { container } from '../di/container';
import { TYPES } from '../di/types';

// Mock do CacheService
const mockCacheService: jest.Mocked<ICacheService> = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  exists: jest.fn(),
  deleteByPattern: jest.fn(),
};

// Mock do container
jest.mock('../di/container', () => ({
  container: {
    resolve: jest.fn(),
  },
}));

describe('@CachePut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (container.resolve as jest.Mock).mockReturnValue(mockCacheService);
  });

  it('deve sempre executar método e atualizar cache', async () => {
    class TestService {
      callCount = 0;

      @CachePut('test:method:{0}')
      async refreshData(id: number): Promise<string> {
        this.callCount++;
        return `data-${id}`;
      }
    }

    const service = new TestService();

    // Primeira chamada
    const result1 = await service.refreshData(1);

    expect(result1).toBe('data-1');
    expect(service.callCount).toBe(1);
    expect(mockCacheService.set).toHaveBeenCalledWith('test:method:1', 'data-1', 3600);
    expect(mockCacheService.get).not.toHaveBeenCalled(); // Não verifica cache

    // Segunda chamada: ainda executa método
    const result2 = await service.refreshData(1);

    expect(result2).toBe('data-1');
    expect(service.callCount).toBe(2); // Executou novamente
    expect(mockCacheService.set).toHaveBeenCalledTimes(2); // Atualizou cache novamente
  });

  it('deve gerar key automaticamente se não fornecida', async () => {
    class TestService {
      @CachePut()
      async refreshData(id: number): Promise<string> {
        return `data-${id}`;
      }
    }

    const service = new TestService();
    await service.refreshData(1);

    expect(mockCacheService.set).toHaveBeenCalled();
    const callArgs = (mockCacheService.set as jest.Mock).mock.calls[0][0];
    expect(callArgs).toContain('test:refreshData:');
  });

  it('deve usar TTL configurado', async () => {
    class TestService {
      @CachePut('test:method:{0}', 1800)
      async refreshData(id: number): Promise<string> {
        return `data-${id}`;
      }
    }

    const service = new TestService();
    await service.refreshData(1);

    expect(mockCacheService.set).toHaveBeenCalledWith('test:method:1', 'data-1', 1800);
  });

  it('deve usar opções completas', async () => {
    class TestService {
      @CachePut({ key: 'test:method:{0}', ttl: 7200 })
      async refreshData(id: number): Promise<string> {
        return `data-${id}`;
      }
    }

    const service = new TestService();
    await service.refreshData(1);

    expect(mockCacheService.set).toHaveBeenCalledWith('test:method:1', 'data-1', 7200);
  });

  it('não deve atualizar cache se resultado for null', async () => {
    class TestService {
      @CachePut('test:method:{0}')
      async refreshData(id: number): Promise<string | null> {
        return null;
      }
    }

    const service = new TestService();
    const result = await service.refreshData(1);

    expect(result).toBeNull();
    expect(mockCacheService.set).not.toHaveBeenCalled();
  });

  it('deve lançar erro se aplicado a não-método', () => {
    expect(() => {
      class TestService {
        @CachePut('test:property')
        property: string = 'test';
      }
    }).toThrow('@CachePut can only be applied to methods');
  });
});
