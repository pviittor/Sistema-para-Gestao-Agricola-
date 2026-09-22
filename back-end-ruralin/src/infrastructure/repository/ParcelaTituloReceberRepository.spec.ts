/**
 * Testes unitários para ParcelaTituloReceberRepository
 * 
 * Estes testes verificam os métodos customizados do ParcelaTituloReceberRepository
 * além dos métodos herdados do BaseRepository.
 */

import { Model, ModelStatic } from 'sequelize';
import { ParcelaTituloReceberRepository } from './ParcelaTituloReceberRepository';
import ParcelaTituloReceber from '../../models/ParcelaTituloReceber';
import { StatusParcela } from '../../models/ParcelaTituloReceber';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';

jest.mock('../../models/ParcelaTituloReceber', () => {
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

describe('ParcelaTituloReceberRepository', () => {
  let repository: ParcelaTituloReceberRepository;
  let mockModel: ModelStatic<ParcelaTituloReceber>;
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
      name: 'ParcelaTituloReceber',
    } as any;

    (ParcelaTituloReceber as any).findAll = mockFindAll;

    mockTenantService.getTenantId.mockReturnValue(1);

    repository = new ParcelaTituloReceberRepository(mockCacheService, mockTenantService);
    (repository as any).model = mockModel;
    (repository as any).DEFAULT_CACHE_TTL = 3600;
  });

  describe('findByTituloReceber', () => {
    it('deve retornar parcelas quando encontradas por título', async () => {
      const mockParcelas = [
        { id: 1, idTituloReceber: 1, numeroParcela: 1 },
      ] as ParcelaTituloReceber[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockParcelas);

      const result = await repository.findByTituloReceber(1);

      expect(result).toBe(mockParcelas);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ idTituloReceber: 1 }),
          order: [['numeroParcela', 'ASC']],
        })
      );
    });

    it('deve retornar do cache quando disponível', async () => {
      const mockParcelas = [{ id: 1 }] as ParcelaTituloReceber[];
      mockCacheService.get.mockResolvedValueOnce(mockParcelas);

      const result = await repository.findByTituloReceber(1);

      expect(result).toBe(mockParcelas);
      expect(mockFindAll).not.toHaveBeenCalled();
    });
  });

  describe('findByStatus', () => {
    it('deve retornar parcelas quando encontradas por status', async () => {
      const mockParcelas = [
        { id: 1, status: StatusParcela.ABERTA },
      ] as ParcelaTituloReceber[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockParcelas);

      const result = await repository.findByStatus(StatusParcela.ABERTA);

      expect(result).toBe(mockParcelas);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: StatusParcela.ABERTA }),
        })
      );
    });
  });

  describe('findByDataVencimento', () => {
    it('deve retornar parcelas quando encontradas por período', async () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-12-31');
      const mockParcelas = [{ id: 1 }] as ParcelaTituloReceber[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockParcelas);

      const result = await repository.findByDataVencimento(dataInicio, dataFim);

      expect(result).toBe(mockParcelas);
      expect(mockFindAll).toHaveBeenCalled();
    });
  });

  describe('findVencidas', () => {
    it('deve retornar parcelas vencidas', async () => {
      const mockParcelas = [{ id: 1 }] as ParcelaTituloReceber[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockParcelas);

      const result = await repository.findVencidas();

      expect(result).toBe(mockParcelas);
      expect(mockFindAll).toHaveBeenCalled();
    });
  });

  describe('findAVencer', () => {
    it('deve retornar parcelas a vencer', async () => {
      const dataLimite = new Date('2024-12-31');
      const mockParcelas = [{ id: 1 }] as ParcelaTituloReceber[];

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
