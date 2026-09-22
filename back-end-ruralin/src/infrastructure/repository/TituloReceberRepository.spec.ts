/**
 * Testes unitários para TituloReceberRepository
 * 
 * Estes testes verificam os métodos customizados do TituloReceberRepository
 * além dos métodos herdados do BaseRepository.
 */

import { Model, ModelStatic } from 'sequelize';
import { TituloReceberRepository } from './TituloReceberRepository';
import TituloReceber from '../../models/TituloReceber';
import { StatusTituloReceber } from '../../models/TituloReceber';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';

// Mock do modelo TituloReceber
jest.mock('../../models/TituloReceber', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

// Mock do CacheService
const mockCacheService: jest.Mocked<ICacheService> = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  exists: jest.fn(),
};

// Mock do TenantService
const mockTenantService: jest.Mocked<ITenantService> = {
  getTenantId: jest.fn(),
  setTenantId: jest.fn(),
  clearTenantId: jest.fn(),
};

describe('TituloReceberRepository', () => {
  let repository: TituloReceberRepository;
  let mockModel: ModelStatic<TituloReceber>;
  let mockFindAll: jest.Mock;
  let mockFindOne: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFindAll = jest.fn();
    mockFindOne = jest.fn();
    mockModel = {
      findAll: mockFindAll,
      findOne: mockFindOne,
      findByPk: jest.fn(),
      findAndCountAll: jest.fn(),
      create: jest.fn(),
      name: 'TituloReceber',
    } as any;

    (TituloReceber as any).findAll = mockFindAll;
    (TituloReceber as any).findOne = mockFindOne;

    mockTenantService.getTenantId.mockReturnValue(1);

    repository = new TituloReceberRepository(mockCacheService, mockTenantService);
    (repository as any).model = mockModel;
    (repository as any).DEFAULT_CACHE_TTL = 3600;
  });

  describe('findBySafra', () => {
    it('deve retornar títulos quando encontrados por safra', async () => {
      const mockTitulos = [
        { id: 1, idSafra: 1, numeroTitulo: 'TR-001' },
      ] as TituloReceber[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockTitulos);

      const result = await repository.findBySafra(1);

      expect(result).toBe(mockTitulos);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ idSafra: 1, tenantId: 1 }),
        })
      );
    });

    it('deve retornar do cache quando disponível', async () => {
      const mockTitulos = [{ id: 1, idSafra: 1 }] as TituloReceber[];
      mockCacheService.get.mockResolvedValueOnce(mockTitulos);

      const result = await repository.findBySafra(1);

      expect(result).toBe(mockTitulos);
      expect(mockFindAll).not.toHaveBeenCalled();
    });
  });

  describe('findByFazenda', () => {
    it('deve retornar títulos quando encontrados por fazenda', async () => {
      const mockTitulos = [{ id: 1, idFazenda: 1 }] as TituloReceber[];
      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockTitulos);

      const result = await repository.findByFazenda(1);

      expect(result).toBe(mockTitulos);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ idFazenda: 1 }),
        })
      );
    });
  });

  describe('findByCliente', () => {
    it('deve retornar títulos quando encontrados por cliente', async () => {
      const mockTitulos = [{ id: 1, idCliente: 1 }] as TituloReceber[];
      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockTitulos);

      const result = await repository.findByCliente(1);

      expect(result).toBe(mockTitulos);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ idCliente: 1 }),
        })
      );
    });
  });

  describe('findByStatus', () => {
    it('deve retornar títulos quando encontrados por status', async () => {
      const mockTitulos = [
        { id: 1, status: StatusTituloReceber.ABERTO },
      ] as TituloReceber[];
      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockTitulos);

      const result = await repository.findByStatus(StatusTituloReceber.ABERTO);

      expect(result).toBe(mockTitulos);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: StatusTituloReceber.ABERTO }),
        })
      );
    });
  });

  describe('findByNumeroTitulo', () => {
    it('deve retornar título quando encontrado por número', async () => {
      const mockTitulo = { id: 1, numeroTitulo: 'TR-001', tenantId: 1 } as TituloReceber;
      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindOne.mockResolvedValue(mockTitulo);

      const result = await repository.findByNumeroTitulo('TR-001');

      expect(result).toBe(mockTitulo);
      expect(mockFindOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { numeroTitulo: 'TR-001', tenantId: 1 },
        })
      );
    });

    it('deve lançar erro quando tenantId não estiver disponível', async () => {
      mockTenantService.getTenantId.mockReturnValueOnce(null);

      await expect(repository.findByNumeroTitulo('TR-001')).rejects.toThrow(
        'Tenant ID é obrigatório para buscar por número do título'
      );
    });
  });

  describe('findByDataLancamento', () => {
    it('deve retornar títulos quando encontrados por período', async () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-12-31');
      const mockTitulos = [{ id: 1 }] as TituloReceber[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockTitulos);

      const result = await repository.findByDataLancamento(dataInicio, dataFim);

      expect(result).toBe(mockTitulos);
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
