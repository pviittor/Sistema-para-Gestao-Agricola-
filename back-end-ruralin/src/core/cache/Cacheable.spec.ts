/**
 * Testes unitários para decorator @Cacheable
 */

import { Cacheable } from './Cacheable';
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

describe('@Cacheable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (container.resolve as jest.Mock).mockReturnValue(mockCacheService);
  });

  it('deve cachear resultado do método', async () => {
    class TestService {
      callCount = 0;

      @Cacheable('test:method:{0}')
      async getData(id: number): Promise<string> {
        this.callCount++;
        return `data-${id}`;
      }
    }

    const service = new TestService();

    // Primeira chamada: não há cache, executa método
    mockCacheService.get.mockResolvedValueOnce(null);
    const result1 = await service.getData(1);

    expect(result1).toBe('data-1');
    expect(service.callCount).toBe(1);
    expect(mockCacheService.get).toHaveBeenCalledWith('test:method:1');
    expect(mockCacheService.set).toHaveBeenCalledWith('test:method:1', 'data-1', 3600);

    // Segunda chamada: retorna do cache
    mockCacheService.get.mockResolvedValueOnce('data-1');
    const result2 = await service.getData(1);

    expect(result2).toBe('data-1');
    expect(service.callCount).toBe(1); // Não executou novamente
    expect(mockCacheService.set).toHaveBeenCalledTimes(1); // Não setou novamente
  });

  it('deve gerar key automaticamente se não fornecida', async () => {
    class TestService {
      @Cacheable()
      async getData(id: number): Promise<string> {
        return `data-${id}`;
      }
    }

    const service = new TestService();
    mockCacheService.get.mockResolvedValueOnce(null);

    await service.getData(1);

    // Verificar que key foi gerada automaticamente
    expect(mockCacheService.get).toHaveBeenCalled();
    const callArgs = (mockCacheService.get as jest.Mock).mock.calls[0][0];
    expect(callArgs).toContain('test:getData:');
  });

  it('deve usar TTL configurado', async () => {
    class TestService {
      @Cacheable('test:method:{0}', 1800)
      async getData(id: number): Promise<string> {
        return `data-${id}`;
      }
    }

    const service = new TestService();
    mockCacheService.get.mockResolvedValueOnce(null);

    await service.getData(1);

    expect(mockCacheService.set).toHaveBeenCalledWith('test:method:1', 'data-1', 1800);
  });

  it('deve usar opções completas', async () => {
    class TestService {
      @Cacheable({ key: 'test:method:{0}', ttl: 7200 })
      async getData(id: number): Promise<string> {
        return `data-${id}`;
      }
    }

    const service = new TestService();
    mockCacheService.get.mockResolvedValueOnce(null);

    await service.getData(1);

    expect(mockCacheService.set).toHaveBeenCalledWith('test:method:1', 'data-1', 7200);
  });

  it('não deve cachear se resultado for null', async () => {
    class TestService {
      @Cacheable('test:method:{0}')
      async getData(id: number): Promise<string | null> {
        return null;
      }
    }

    const service = new TestService();
    mockCacheService.get.mockResolvedValueOnce(null);

    const result = await service.getData(1);

    expect(result).toBeNull();
    expect(mockCacheService.set).not.toHaveBeenCalled();
  });

  it('deve lançar erro se aplicado a não-método', () => {
    expect(() => {
      class TestService {
        @Cacheable('test:property')
        property: string = 'test';
      }
    }).toThrow('@Cacheable can only be applied to methods');
  });
});
