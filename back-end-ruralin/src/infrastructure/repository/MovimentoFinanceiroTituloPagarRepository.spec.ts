/**
 * Testes unitários para MovimentoFinanceiroTituloPagarRepository
 * 
 * Estes testes verificam os métodos customizados do MovimentoFinanceiroTituloPagarRepository
 * além dos métodos herdados do BaseRepository.
 */

import { Model, ModelStatic } from 'sequelize';
import { MovimentoFinanceiroTituloPagarRepository } from './MovimentoFinanceiroTituloPagarRepository';
import MovimentoFinanceiroTituloPagar from '../../models/MovimentoFinanceiroTituloPagar';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';

jest.mock('../../models/MovimentoFinanceiroTituloPagar', () => {
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

describe('MovimentoFinanceiroTituloPagarRepository', () => {
  let repository: MovimentoFinanceiroTituloPagarRepository;
  let mockModel: ModelStatic<MovimentoFinanceiroTituloPagar>;
  let mockFindAll: jest.Mock;
  let mockSum: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFindAll = jest.fn();
    mockSum = jest.fn();
    mockModel = {
      findAll: mockFindAll,
      sum: mockSum,
      findOne: jest.fn(),
      findByPk: jest.fn(),
      findAndCountAll: jest.fn(),
      create: jest.fn(),
      name: 'MovimentoFinanceiroTituloPagar',
    } as any;

    (MovimentoFinanceiroTituloPagar as any).findAll = mockFindAll;
    (MovimentoFinanceiroTituloPagar as any).sum = mockSum;

    mockTenantService.getTenantId.mockReturnValue(1);

    repository = new MovimentoFinanceiroTituloPagarRepository(mockCacheService, mockTenantService);
    (repository as any).model = mockModel;
    (repository as any).DEFAULT_CACHE_TTL = 3600;
  });

  describe('findByParcela', () => {
    it('deve retornar movimentos quando encontrados por parcela', async () => {
      const mockMovimentos = [
        { id: 1, idParcelaTituloPagar: 1 },
      ] as MovimentoFinanceiroTituloPagar[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockMovimentos);

      const result = await repository.findByParcela(1);

      expect(result).toBe(mockMovimentos);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ idParcelaTituloPagar: 1 }),
          order: [['dataMovimento', 'DESC']],
        })
      );
    });

    it('deve retornar do cache quando disponível', async () => {
      const mockMovimentos = [{ id: 1 }] as MovimentoFinanceiroTituloPagar[];
      mockCacheService.get.mockResolvedValueOnce(mockMovimentos);

      const result = await repository.findByParcela(1);

      expect(result).toBe(mockMovimentos);
      expect(mockFindAll).not.toHaveBeenCalled();
    });
  });

  describe('findByTituloPagar', () => {
    it('deve retornar movimentos quando encontrados por título', async () => {
      const mockMovimentos = [
        { id: 1, idTituloPagar: 1 },
      ] as MovimentoFinanceiroTituloPagar[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockMovimentos);

      const result = await repository.findByTituloPagar(1);

      expect(result).toBe(mockMovimentos);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ idTituloPagar: 1 }),
        })
      );
    });
  });

  describe('findByDataMovimento', () => {
    it('deve retornar movimentos quando encontrados por período', async () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-12-31');
      const mockMovimentos = [{ id: 1 }] as MovimentoFinanceiroTituloPagar[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockMovimentos);

      const result = await repository.findByDataMovimento(dataInicio, dataFim);

      expect(result).toBe(mockMovimentos);
      expect(mockFindAll).toHaveBeenCalled();
    });
  });

  describe('sumByPlanoConta', () => {
    it('deve retornar soma de valores por plano de contas', async () => {
      mockCacheService.get.mockResolvedValueOnce(null);
      mockSum.mockResolvedValue(1000.50);

      const result = await repository.sumByPlanoConta(1);

      expect(result).toBe(1000.50);
      expect(mockSum).toHaveBeenCalledWith('valorMovimentoMoedaPadrao', {
        where: expect.objectContaining({ idPlanoContaGerencial: 1 }),
      });
    });

    it('deve retornar 0 quando não houver movimentos', async () => {
      mockCacheService.get.mockResolvedValueOnce(null);
      mockSum.mockResolvedValue(null);

      const result = await repository.sumByPlanoConta(1);

      expect(result).toBe(0);
    });

    it('deve filtrar por período quando fornecido', async () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-12-31');

      mockCacheService.get.mockResolvedValueOnce(null);
      mockSum.mockResolvedValue(500.25);

      const result = await repository.sumByPlanoConta(1, dataInicio, dataFim);

      expect(result).toBe(500.25);
      expect(mockSum).toHaveBeenCalledWith('valorMovimentoMoedaPadrao', {
        where: expect.objectContaining({
          idPlanoContaGerencial: 1,
          dataMovimento: expect.any(Object),
        }),
      });
    });

    it('deve retornar do cache quando disponível', async () => {
      mockCacheService.get.mockResolvedValueOnce(2000.75);

      const result = await repository.sumByPlanoConta(1);

      expect(result).toBe(2000.75);
      expect(mockSum).not.toHaveBeenCalled();
    });
  });

  describe('sumByCentroCusto', () => {
    it('deve retornar soma de valores por centro de custo', async () => {
      mockCacheService.get.mockResolvedValueOnce(null);
      mockSum.mockResolvedValue(1500.00);

      const result = await repository.sumByCentroCusto(1);

      expect(result).toBe(1500.00);
      expect(mockSum).toHaveBeenCalledWith('valorMovimentoMoedaPadrao', {
        where: expect.objectContaining({ idCentroCusto: 1 }),
      });
    });
  });

  describe('sumByPlanoContaECentroCusto', () => {
    it('deve retornar soma de valores por plano de contas e centro de custo', async () => {
      mockCacheService.get.mockResolvedValueOnce(null);
      mockSum.mockResolvedValue(750.50);

      const result = await repository.sumByPlanoContaECentroCusto(1, 2);

      expect(result).toBe(750.50);
      expect(mockSum).toHaveBeenCalledWith('valorMovimentoMoedaPadrao', {
        where: expect.objectContaining({
          idPlanoContaGerencial: 1,
          idCentroCusto: 2,
        }),
      });
    });
  });

  describe('aggregateByPlanoConta', () => {
    it('deve retornar agregação agrupada por plano de contas', async () => {
      const mockResult = [
        { idPlanoContaGerencial: 1, total: '1000.50' },
        { idPlanoContaGerencial: 2, total: '2000.75' },
      ];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockResult);

      const result = await repository.aggregateByPlanoConta();

      expect(result).toEqual([
        { idPlanoContaGerencial: 1, total: 1000.50 },
        { idPlanoContaGerencial: 2, total: 2000.75 },
      ]);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.arrayContaining([
            'idPlanoContaGerencial',
            expect.any(Array),
          ]),
          group: ['idPlanoContaGerencial'],
          raw: true,
        })
      );
    });
  });

  describe('aggregateByCentroCusto', () => {
    it('deve retornar agregação agrupada por centro de custo', async () => {
      const mockResult = [
        { idCentroCusto: 1, total: '1500.00' },
      ];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockResult);

      const result = await repository.aggregateByCentroCusto();

      expect(result).toEqual([
        { idCentroCusto: 1, total: 1500.00 },
      ]);
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
