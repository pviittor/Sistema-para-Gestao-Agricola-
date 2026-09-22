/**
 * Testes unitários para ParcelaTituloPagarRepository
 * 
 * Estes testes verificam os métodos customizados do ParcelaTituloPagarRepository
 * além dos métodos herdados do BaseRepository.
 */

import { Model, ModelStatic } from 'sequelize';
import { ParcelaTituloPagarRepository } from './ParcelaTituloPagarRepository';
import ParcelaTituloPagar from '../../models/ParcelaTituloPagar';
import { StatusParcela } from '../../models/ParcelaTituloPagar';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';

jest.mock('../../models/ParcelaTituloPagar', () => {
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

describe('ParcelaTituloPagarRepository', () => {
  let repository: ParcelaTituloPagarRepository;
  let mockModel: ModelStatic<ParcelaTituloPagar>;
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
      name: 'ParcelaTituloPagar',
    } as any;

    (ParcelaTituloPagar as any).findAll = mockFindAll;

    mockTenantService.getTenantId.mockReturnValue(1);

    repository = new ParcelaTituloPagarRepository(mockCacheService, mockTenantService);
    (repository as any).model = mockModel;
    (repository as any).DEFAULT_CACHE_TTL = 3600;
  });

  describe('findByTituloPagar', () => {
    it('deve retornar parcelas quando encontradas por título', async () => {
      const mockParcelas = [
        { id: 1, idTituloPagar: 1, numeroParcela: 1 },
      ] as ParcelaTituloPagar[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockParcelas);

      const result = await repository.findByTituloPagar(1);

      expect(result).toBe(mockParcelas);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ idTituloPagar: 1 }),
          order: [['numeroParcela', 'ASC']],
        })
      );
    });

    it('deve retornar do cache quando disponível', async () => {
      const mockParcelas = [{ id: 1 }] as ParcelaTituloPagar[];
      mockCacheService.get.mockResolvedValueOnce(mockParcelas);

      const result = await repository.findByTituloPagar(1);

      expect(result).toBe(mockParcelas);
      expect(mockFindAll).not.toHaveBeenCalled();
    });
  });

  describe('findByStatus', () => {
    it('deve retornar parcelas quando encontradas por status', async () => {
      const mockParcelas = [
        { id: 1, status: StatusParcela.ABERTA },
      ] as ParcelaTituloPagar[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockParcelas);

      const result = await repository.findByStatus(StatusParcela.ABERTA);

      expect(result).toBe(mockParcelas);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: StatusParcela.ABERTA }),
          order: [['dataVencimento', 'ASC']],
        })
      );
    });
  });

  describe('findByDataVencimento', () => {
    it('deve retornar parcelas quando encontradas por período', async () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-12-31');
      const mockParcelas = [{ id: 1 }] as ParcelaTituloPagar[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockParcelas);

      const result = await repository.findByDataVencimento(dataInicio, dataFim);

      expect(result).toBe(mockParcelas);
      expect(mockFindAll).toHaveBeenCalled();
    });
  });

  describe('findVencidas', () => {
    it('deve retornar parcelas vencidas', async () => {
      const mockParcelas = [{ id: 1, dataVencimento: new Date('2023-01-01') }] as ParcelaTituloPagar[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockParcelas);

      const result = await repository.findVencidas();

      expect(result).toBe(mockParcelas);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            dataVencimento: expect.any(Object),
            status: expect.any(Object),
          }),
        })
      );
    });
  });

  describe('findAVencer', () => {
    it('deve retornar parcelas a vencer', async () => {
      const dataLimite = new Date('2024-12-31');
      const mockParcelas = [{ id: 1 }] as ParcelaTituloPagar[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockParcelas);

      const result = await repository.findAVencer(dataLimite);

      expect(result).toBe(mockParcelas);
      expect(mockFindAll).toHaveBeenCalled();
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
