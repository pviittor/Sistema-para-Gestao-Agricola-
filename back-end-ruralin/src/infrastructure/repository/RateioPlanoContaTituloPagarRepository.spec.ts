/**
 * Testes unitários para RateioPlanoContaTituloPagarRepository
 * 
 * Estes testes verificam os métodos customizados do RateioPlanoContaTituloPagarRepository
 * além dos métodos herdados do BaseRepository.
 */

import { Model, ModelStatic } from 'sequelize';
import { RateioPlanoContaTituloPagarRepository } from './RateioPlanoContaTituloPagarRepository';
import RateioPlanoContaTituloPagar from '../../models/RateioPlanoContaTituloPagar';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';

jest.mock('../../models/RateioPlanoContaTituloPagar', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

const mockCacheService: jest.Mocked<ICacheService> = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  exists: jest.fn(),
};

const mockTenantService: jest.Mocked<ITenantService> = {
  getTenantId: jest.fn(),
  setTenantId: jest.fn(),
  clearTenantId: jest.fn(),
};

describe('RateioPlanoContaTituloPagarRepository', () => {
  let repository: RateioPlanoContaTituloPagarRepository;
  let mockModel: ModelStatic<RateioPlanoContaTituloPagar>;
  let mockFindAll: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFindAll = jest.fn();
    mockModel = {
      findAll: mockFindAll,
      findOne: jest.fn(),
      findByPk: jest.fn(),
      findAndCountAll: jest.fn(),
      create: jest.fn(),
      name: 'RateioPlanoContaTituloPagar',
    } as any;

    (RateioPlanoContaTituloPagar as any).findAll = mockFindAll;

    mockTenantService.getTenantId.mockReturnValue(1);

    repository = new RateioPlanoContaTituloPagarRepository(mockCacheService, mockTenantService);
    (repository as any).model = mockModel;
    (repository as any).DEFAULT_CACHE_TTL = 3600;
  });

  describe('findByTituloPagar', () => {
    it('deve retornar rateios quando encontrados por título', async () => {
      const mockRateios = [
        { id: 1, idTituloPagar: 1, idPlanoContaGerencial: 1 },
      ] as RateioPlanoContaTituloPagar[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockRateios);

      const result = await repository.findByTituloPagar(1);

      expect(result).toBe(mockRateios);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ idTituloPagar: 1 }),
          order: [['idPlanoContaGerencial', 'ASC']],
        })
      );
    });

    it('deve retornar do cache quando disponível', async () => {
      const mockRateios = [{ id: 1 }] as RateioPlanoContaTituloPagar[];
      mockCacheService.get.mockResolvedValueOnce(mockRateios);

      const result = await repository.findByTituloPagar(1);

      expect(result).toBe(mockRateios);
      expect(mockFindAll).not.toHaveBeenCalled();
    });
  });

  describe('findByPlanoContaGerencial', () => {
    it('deve retornar rateios quando encontrados por plano de contas', async () => {
      const mockRateios = [
        { id: 1, idPlanoContaGerencial: 1 },
      ] as RateioPlanoContaTituloPagar[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockRateios);

      const result = await repository.findByPlanoContaGerencial(1);

      expect(result).toBe(mockRateios);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ idPlanoContaGerencial: 1 }),
        })
      );
    });
  });

  describe('Métodos herdados do BaseRepository', () => {
    it('deve ter acesso aos métodos do BaseRepository', () => {
      expect(repository.findById).toBeDefined();
      expect(repository.findAll).toBeDefined();
      expect(repository.create).toBeDefined();
      expect(repository.update).toBeDefined();
      expect(repository.delete).toBeDefined();
    });
  });
});
