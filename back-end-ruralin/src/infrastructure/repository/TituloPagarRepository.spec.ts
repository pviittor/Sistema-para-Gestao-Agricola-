/**
 * Testes unitários para TituloPagarRepository
 * 
 * Estes testes verificam os métodos customizados do TituloPagarRepository
 * além dos métodos herdados do BaseRepository.
 */

import { Model, ModelStatic } from 'sequelize';
import { TituloPagarRepository } from './TituloPagarRepository';
import TituloPagar from '../../models/TituloPagar';
import { StatusTituloPagar } from '../../models/TituloPagar';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';

// Mock do modelo TituloPagar
jest.mock('../../models/TituloPagar', () => {
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

describe('TituloPagarRepository', () => {
  let repository: TituloPagarRepository;
  let mockModel: ModelStatic<TituloPagar>;
  let mockFindAll: jest.Mock;
  let mockFindOne: jest.Mock;

  beforeEach(() => {
    // Resetar mocks
    jest.clearAllMocks();

    // Mock do modelo Sequelize
    mockFindAll = jest.fn();
    mockFindOne = jest.fn();
    mockModel = {
      findAll: mockFindAll,
      findOne: mockFindOne,
      findByPk: jest.fn(),
      findAndCountAll: jest.fn(),
      create: jest.fn(),
      name: 'TituloPagar',
    } as any;

    // Mock do modelo estático
    (TituloPagar as any).findAll = mockFindAll;
    (TituloPagar as any).findOne = mockFindOne;

    // Configurar tenant service para retornar tenantId
    mockTenantService.getTenantId.mockReturnValue(1);

    // Criar instância do repositório
    repository = new TituloPagarRepository(mockCacheService, mockTenantService);
    
    // Substituir modelo
    (repository as any).model = mockModel;
    (repository as any).DEFAULT_CACHE_TTL = 3600;
  });

  describe('findBySafra', () => {
    it('deve retornar títulos quando encontrados por safra', async () => {
      const mockTitulos = [
        { id: 1, idSafra: 1, numeroTitulo: 'TP-001' },
        { id: 2, idSafra: 1, numeroTitulo: 'TP-002' },
      ] as TituloPagar[];

      mockCacheService.get.mockResolvedValueOnce(null); // Cache miss
      mockFindAll.mockResolvedValue(mockTitulos);

      const result = await repository.findBySafra(1);

      expect(result).toBe(mockTitulos);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ idSafra: 1, tenantId: 1 }),
          order: [['dataLancamento', 'DESC']],
        })
      );
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('deve retornar do cache quando disponível', async () => {
      const mockTitulos = [
        { id: 1, idSafra: 1, numeroTitulo: 'TP-001' },
      ] as TituloPagar[];

      mockCacheService.get.mockResolvedValueOnce(mockTitulos); // Cache hit

      const result = await repository.findBySafra(1);

      expect(result).toBe(mockTitulos);
      expect(mockFindAll).not.toHaveBeenCalled();
      expect(mockCacheService.set).not.toHaveBeenCalled();
    });

    it('deve retornar array vazio quando não encontrar títulos', async () => {
      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue([]);

      const result = await repository.findBySafra(999);

      expect(result).toEqual([]);
    });
  });

  describe('findByFazenda', () => {
    it('deve retornar títulos quando encontrados por fazenda', async () => {
      const mockTitulos = [
        { id: 1, idFazenda: 1, numeroTitulo: 'TP-001' },
      ] as TituloPagar[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockTitulos);

      const result = await repository.findByFazenda(1);

      expect(result).toBe(mockTitulos);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ idFazenda: 1, tenantId: 1 }),
        })
      );
    });
  });

  describe('findByFornecedor', () => {
    it('deve retornar títulos quando encontrados por fornecedor', async () => {
      const mockTitulos = [
        { id: 1, idFornecedor: 1, numeroTitulo: 'TP-001' },
      ] as TituloPagar[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockTitulos);

      const result = await repository.findByFornecedor(1);

      expect(result).toBe(mockTitulos);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ idFornecedor: 1, tenantId: 1 }),
        })
      );
    });
  });

  describe('findByStatus', () => {
    it('deve retornar títulos quando encontrados por status', async () => {
      const mockTitulos = [
        { id: 1, status: StatusTituloPagar.ABERTO, numeroTitulo: 'TP-001' },
      ] as TituloPagar[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockTitulos);

      const result = await repository.findByStatus(StatusTituloPagar.ABERTO);

      expect(result).toBe(mockTitulos);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: StatusTituloPagar.ABERTO, tenantId: 1 }),
        })
      );
    });
  });

  describe('findByNumeroTitulo', () => {
    it('deve retornar título quando encontrado por número', async () => {
      const mockTitulo = {
        id: 1,
        numeroTitulo: 'TP-001',
        tenantId: 1,
      } as TituloPagar;

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindOne.mockResolvedValue(mockTitulo);

      const result = await repository.findByNumeroTitulo('TP-001');

      expect(result).toBe(mockTitulo);
      expect(mockFindOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            numeroTitulo: 'TP-001',
            tenantId: 1,
          },
        })
      );
    });

    it('deve retornar null quando título não encontrado', async () => {
      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindOne.mockResolvedValue(null);

      const result = await repository.findByNumeroTitulo('TP-999');

      expect(result).toBeNull();
    });

    it('deve lançar erro quando tenantId não estiver disponível', async () => {
      mockTenantService.getTenantId.mockReturnValueOnce(null);

      await expect(repository.findByNumeroTitulo('TP-001')).rejects.toThrow(
        'Tenant ID é obrigatório para buscar por número do título'
      );
    });
  });

  describe('findByDataLancamento', () => {
    it('deve retornar títulos quando encontrados por período', async () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-12-31');
      const mockTitulos = [
        { id: 1, dataLancamento: new Date('2024-06-15'), numeroTitulo: 'TP-001' },
      ] as TituloPagar[];

      mockCacheService.get.mockResolvedValueOnce(null);
      mockFindAll.mockResolvedValue(mockTitulos);

      const result = await repository.findByDataLancamento(dataInicio, dataFim);

      expect(result).toBe(mockTitulos);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            dataLancamento: expect.any(Object),
            tenantId: 1,
          }),
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
