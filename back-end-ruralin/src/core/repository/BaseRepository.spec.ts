/**
 * Testes unitários para BaseRepository
 * 
 * Estes testes verificam a implementação padrão dos métodos CRUD
 * fornecidos pela classe BaseRepository.
 */

import { Model, ModelStatic } from 'sequelize';
import { BaseRepository } from './BaseRepository';
import { NotFoundException } from '../exceptions';
import { ICacheService } from '../cache/ICacheService';

// Mock do modelo Sequelize
class MockModel extends Model {
  public id!: number;
  public nome!: string;
}

// Mock do CacheService
const mockCacheService: jest.Mocked<ICacheService> = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  exists: jest.fn(),
  deleteByPattern: jest.fn(),
};

// Criar uma classe de teste que estende BaseRepository
class TestRepository extends BaseRepository<MockModel> {
  constructor(model: ModelStatic<MockModel>, cacheService: ICacheService) {
    super(model, cacheService);
  }
}

describe('BaseRepository', () => {
  let mockModel: ModelStatic<MockModel>;
  let repository: TestRepository;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock do modelo Sequelize
    mockModel = {
      findByPk: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findAndCountAll: jest.fn(),
      create: jest.fn(),
      name: 'MockModel',
    } as any;

    repository = new TestRepository(mockModel, mockCacheService);
  });

  describe('findById', () => {
    it('deve retornar a entidade quando encontrada', async () => {
      const mockEntity = { id: 1, nome: 'Teste' } as MockModel;
      mockCacheService.get.mockResolvedValueOnce(null); // Cache miss
      (mockModel.findByPk as jest.Mock).mockResolvedValue(mockEntity);

      const result = await repository.findById(1);

      expect(result).toBe(mockEntity);
      expect(mockModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockCacheService.get).toHaveBeenCalledWith('mockmodel:findById:1');
      expect(mockCacheService.set).toHaveBeenCalledWith('mockmodel:findById:1', mockEntity, 3600);
    });

    it('deve retornar do cache quando disponível', async () => {
      const mockEntity = { id: 1, nome: 'Teste' } as MockModel;
      mockCacheService.get.mockResolvedValueOnce(mockEntity); // Cache hit

      const result = await repository.findById(1);

      expect(result).toBe(mockEntity);
      expect(mockModel.findByPk).not.toHaveBeenCalled(); // Não deve chamar banco
      expect(mockCacheService.set).not.toHaveBeenCalled(); // Não deve atualizar cache
    });

    it('deve retornar null quando entidade não encontrada', async () => {
      mockCacheService.get.mockResolvedValueOnce(null); // Cache miss
      (mockModel.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById(1);

      expect(result).toBeNull();
      expect(mockModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockCacheService.set).not.toHaveBeenCalled(); // Não cacheia null
    });
  });

  describe('findAll', () => {
    it('deve retornar array de entidades', async () => {
      const mockEntities = [
        { id: 1, nome: 'Teste 1' },
        { id: 2, nome: 'Teste 2' },
      ] as MockModel[];
      (mockModel.findAll as jest.Mock).mockResolvedValue(mockEntities);

      const result = await repository.findAll();

      expect(result).toBe(mockEntities);
      expect(mockModel.findAll).toHaveBeenCalledWith({
        where: undefined,
        include: undefined,
        order: undefined,
        attributes: undefined,
      });
    });

    it('deve passar opções de busca para findAll', async () => {
      const options = {
        where: { tipo: 'ROOT' },
        order: [['nome', 'ASC']],
      };
      (mockModel.findAll as jest.Mock).mockResolvedValue([]);

      await repository.findAll(options);

      expect(mockModel.findAll).toHaveBeenCalledWith({
        where: options.where,
        include: undefined,
        order: options.order,
        attributes: undefined,
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar a entidade quando encontrada', async () => {
      const mockEntity = { id: 1, nome: 'Teste' } as MockModel;
      const options = { where: { nome: 'Teste' } };
      (mockModel.findOne as jest.Mock).mockResolvedValue(mockEntity);

      const result = await repository.findOne(options);

      expect(result).toBe(mockEntity);
      expect(mockModel.findOne).toHaveBeenCalledWith({
        where: options.where,
        include: undefined,
        order: undefined,
        attributes: undefined,
      });
    });

    it('deve retornar null quando entidade não encontrada', async () => {
      const options = { where: { nome: 'Inexistente' } };
      (mockModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.findOne(options);

      expect(result).toBeNull();
    });
  });

  describe('findAllPaginated', () => {
    it('deve retornar resultado paginado corretamente', async () => {
      const mockEntities = [
        { id: 1, nome: 'Teste 1' },
        { id: 2, nome: 'Teste 2' },
      ] as MockModel[];
      mockCacheService.get.mockResolvedValueOnce(null); // Cache miss
      (mockModel.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: mockEntities,
        count: 20,
      });

      const result = await repository.findAllPaginated(1, 10);

      expect(result.data).toBe(mockEntities);
      expect(result.total).toBe(20);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(2);
      expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
        where: undefined,
        include: undefined,
        order: undefined,
        attributes: undefined,
        limit: 10,
        offset: 0,
      });
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('deve retornar do cache quando disponível', async () => {
      const cachedResult = {
        data: [{ id: 1, nome: 'Teste 1' }],
        total: 20,
        page: 1,
        limit: 10,
        totalPages: 2,
      };
      mockCacheService.get.mockResolvedValueOnce(cachedResult); // Cache hit

      const result = await repository.findAllPaginated(1, 10);

      expect(result).toBe(cachedResult);
      expect(mockModel.findAndCountAll).not.toHaveBeenCalled(); // Não deve chamar banco
    });

    it('deve calcular offset corretamente para página 2', async () => {
      mockCacheService.get.mockResolvedValueOnce(null); // Cache miss
      (mockModel.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: [],
        count: 0,
      });

      await repository.findAllPaginated(2, 10);

      expect(mockModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 10,
        })
      );
    });
  });

  describe('create', () => {
    it('deve criar nova entidade e invalidar cache de findAll', async () => {
      const entityData = { nome: 'Novo Teste' };
      const mockEntity = { id: 1, ...entityData } as MockModel;
      (mockModel.create as jest.Mock).mockResolvedValue(mockEntity);
      mockCacheService.deleteByPattern.mockResolvedValueOnce(5);

      const result = await repository.create(entityData);

      expect(result).toBe(mockEntity);
      expect(mockModel.create).toHaveBeenCalledWith(entityData);
      expect(mockCacheService.deleteByPattern).toHaveBeenCalledWith('mockmodel:findAllPaginated:*');
    });
  });

  describe('update', () => {
    it('deve atualizar entidade existente e invalidar cache', async () => {
      const mockEntity = {
        id: 1,
        nome: 'Teste',
        update: jest.fn().mockResolvedValue(undefined),
      } as any;
      (mockModel.findByPk as jest.Mock).mockResolvedValue(mockEntity);
      mockCacheService.delete.mockResolvedValueOnce(undefined);
      mockCacheService.deleteByPattern.mockResolvedValueOnce(5);

      const updateData = { nome: 'Teste Atualizado' };
      const result = await repository.update(1, updateData);

      expect(result).toBe(mockEntity);
      expect(mockModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockEntity.update).toHaveBeenCalledWith(updateData);
      expect(mockCacheService.delete).toHaveBeenCalledWith('mockmodel:findById:1');
      expect(mockCacheService.deleteByPattern).toHaveBeenCalledWith('mockmodel:findAllPaginated:*');
    });

    it('deve lançar NotFoundException quando entidade não encontrada', async () => {
      (mockModel.findByPk as jest.Mock).mockResolvedValue(null);
      (mockModel as any).name = 'MockModel';

      await expect(repository.update(999, { nome: 'Teste' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('delete', () => {
    it('deve remover entidade existente e invalidar cache', async () => {
      const mockEntity = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
      } as any;
      (mockModel.findByPk as jest.Mock).mockResolvedValue(mockEntity);
      mockCacheService.delete.mockResolvedValueOnce(undefined);
      mockCacheService.deleteByPattern.mockResolvedValueOnce(5);

      const result = await repository.delete(1);

      expect(result).toBe(true);
      expect(mockModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockEntity.destroy).toHaveBeenCalled();
      expect(mockCacheService.delete).toHaveBeenCalledWith('mockmodel:findById:1');
      expect(mockCacheService.deleteByPattern).toHaveBeenCalledWith('mockmodel:findAllPaginated:*');
    });

    it('deve retornar false quando entidade não encontrada', async () => {
      (mockModel.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await repository.delete(999);

      expect(result).toBe(false);
      expect(mockModel.findByPk).toHaveBeenCalledWith(999);
      expect(mockCacheService.delete).not.toHaveBeenCalled(); // Não invalida se não encontrado
    });
  });
});
