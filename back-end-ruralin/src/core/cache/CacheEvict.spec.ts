/**
 * Testes unitários para decorator @CacheEvict
 */

import { CacheEvict } from './CacheEvict';
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

describe('@CacheEvict', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (container.resolve as jest.Mock).mockReturnValue(mockCacheService);
  });

  it('deve invalidar cache após execução do método', async () => {
    class TestService {
      @CacheEvict('test:method:{0}')
      async updateData(id: number): Promise<string> {
        return `updated-${id}`;
      }
    }

    const service = new TestService();
    const result = await service.updateData(1);

    expect(result).toBe('updated-1');
    expect(mockCacheService.delete).toHaveBeenCalledWith('test:method:1');
  });

  it('deve invalidar antes da execução se configurado', async () => {
    class TestService {
      @CacheEvict({ key: 'test:method:{0}', beforeInvocation: true })
      async updateData(id: number): Promise<string> {
        return `updated-${id}`;
      }
    }

    const service = new TestService();
    await service.updateData(1);

    expect(mockCacheService.delete).toHaveBeenCalledWith('test:method:1');
    expect(mockCacheService.delete).toHaveBeenCalledTimes(1); // Apenas uma vez (antes)
  });

  it('deve invalidar múltiplas chaves com padrão', async () => {
    class TestService {
      @CacheEvict('test:*', true)
      async deleteData(id: number): Promise<boolean> {
        return true;
      }
    }

    const service = new TestService();
    mockCacheService.deleteByPattern.mockResolvedValueOnce(5);

    await service.deleteData(1);

    expect(mockCacheService.deleteByPattern).toHaveBeenCalledWith('test:*');
  });

  it('deve gerar key automaticamente se não fornecida', async () => {
    class TestService {
      @CacheEvict()
      async updateData(id: number): Promise<string> {
        return `updated-${id}`;
      }
    }

    const service = new TestService();
    await service.updateData(1);

    expect(mockCacheService.delete).toHaveBeenCalled();
    const callArgs = (mockCacheService.delete as jest.Mock).mock.calls[0][0];
    expect(callArgs).toContain('test:updateData:');
  });

  it('deve usar opções completas', async () => {
    class TestService {
      @CacheEvict({ key: 'test:*', allEntries: true, beforeInvocation: false })
      async deleteData(id: number): Promise<boolean> {
        return true;
      }
    }

    const service = new TestService();
    await service.deleteData(1);

    expect(mockCacheService.deleteByPattern).toHaveBeenCalledWith('test:*');
  });

  it('deve lançar erro se aplicado a não-método', () => {
    expect(() => {
      class TestService {
        @CacheEvict('test:property')
        property: string = 'test';
      }
    }).toThrow('@CacheEvict can only be applied to methods');
  });
});
