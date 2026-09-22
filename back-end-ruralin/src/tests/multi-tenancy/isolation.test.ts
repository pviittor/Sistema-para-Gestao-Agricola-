/**
 * Testes de Isolamento Multi-Tenancy
 * 
 * Estes testes garantem que o isolamento de dados entre tenants está funcionando corretamente:
 * - Tenant A não pode acessar dados de Tenant B
 * - Queries retornam apenas dados do tenant atual
 * - Creates/updates validam tenant
 * - Deletes validam tenant
 */

import { Model, ModelStatic } from 'sequelize';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { ITenantService } from '../../core/tenant/ITenantService';
import { ICacheService } from '../../core/cache/ICacheService';
import { ForbiddenException, NotFoundException } from '../../core/exceptions';

// Mock do modelo Sequelize
class MockModel extends Model {
  public id!: number;
  public tenantId!: number;
  public nome!: string;
}

// Criar uma classe de teste que estende BaseRepository
class TestRepository extends BaseRepository<MockModel> {
  constructor(
    model: ModelStatic<MockModel>,
    cacheService: ICacheService,
    tenantService: ITenantService
  ) {
    super(model, cacheService, tenantService);
  }
}

describe('Multi-Tenancy - Isolamento', () => {
  let mockModel: ModelStatic<MockModel>;
  let mockCacheService: jest.Mocked<ICacheService>;
  let mockTenantService: jest.Mocked<ITenantService>;
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

    // Mock do CacheService
    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      exists: jest.fn(),
      deleteByPattern: jest.fn(),
    } as any;

    // Mock do TenantService
    mockTenantService = {
      getCurrentTenantId: jest.fn(),
      setCurrentTenantId: jest.fn(),
      clear: jest.fn(),
      validateTenant: jest.fn(),
    } as any;

    repository = new TestRepository(mockModel, mockCacheService, mockTenantService);
  });

  describe('findById - Isolamento', () => {
    it('deve retornar entidade quando pertence ao tenant atual', async () => {
      // Arrange
      const tenantId = 1;
      const entity = { id: 1, tenantId, nome: 'Teste' } as MockModel;
      mockTenantService.getCurrentTenantId.mockReturnValue(tenantId);
      mockCacheService.get.mockResolvedValue(null);
      (mockModel.findOne as jest.Mock).mockResolvedValue(entity);

      // Act
      const result = await repository.findById(1);

      // Assert
      expect(result).toBe(entity);
      expect(mockModel.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          tenantId,
        },
      });
    });

    it('deve retornar null quando entidade não pertence ao tenant atual', async () => {
      // Arrange
      const tenantId = 1;
      const otherTenantId = 2;
      mockTenantService.getCurrentTenantId.mockReturnValue(tenantId);
      mockCacheService.get.mockResolvedValue(null);
      (mockModel.findOne as jest.Mock).mockResolvedValue(null); // Não encontrado devido ao filtro

      // Act
      const result = await repository.findById(1);

      // Assert
      expect(result).toBeNull();
      expect(mockModel.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          tenantId,
        },
      });
    });

    it('deve retornar null quando não há tenantId definido', async () => {
      // Arrange
      mockTenantService.getCurrentTenantId.mockReturnValue(null);

      // Act
      const result = await repository.findById(1);

      // Assert
      expect(result).toBeNull();
      expect(mockModel.findOne).not.toHaveBeenCalled();
    });

    it('deve validar cache por tenant', async () => {
      // Arrange
      const tenantId = 1;
      const entity = { id: 1, tenantId, nome: 'Teste' } as MockModel;
      const cachedEntity = { id: 1, tenantId, nome: 'Teste' } as MockModel;
      mockTenantService.getCurrentTenantId.mockReturnValue(tenantId);
      mockCacheService.get.mockResolvedValue(cachedEntity);

      // Act
      const result = await repository.findById(1);

      // Assert
      expect(result).toBe(cachedEntity);
      expect(mockModel.findOne).not.toHaveBeenCalled(); // Não deve chamar banco
      expect(mockCacheService.get).toHaveBeenCalledWith('mockmodel:tenant:1:findById:1');
    });

    it('deve remover cache inválido de outro tenant', async () => {
      // Arrange
      const tenantId = 1;
      const otherTenantId = 2;
      const cachedEntity = { id: 1, tenantId: otherTenantId, nome: 'Teste' } as MockModel;
      const correctEntity = { id: 1, tenantId, nome: 'Teste' } as MockModel;
      mockTenantService.getCurrentTenantId.mockReturnValue(tenantId);
      mockCacheService.get.mockResolvedValue(cachedEntity);
      (mockModel.findOne as jest.Mock).mockResolvedValue(correctEntity);

      // Act
      const result = await repository.findById(1);

      // Assert
      expect(result).toBe(correctEntity);
      expect(mockCacheService.delete).toHaveBeenCalledWith('mockmodel:tenant:1:findById:1');
      expect(mockModel.findOne).toHaveBeenCalled(); // Deve chamar banco após remover cache inválido
    });
  });

  describe('findAll - Isolamento', () => {
    it('deve retornar apenas entidades do tenant atual', async () => {
      // Arrange
      const tenantId = 1;
      const entities = [
        { id: 1, tenantId, nome: 'Teste 1' },
        { id: 2, tenantId, nome: 'Teste 2' },
      ] as MockModel[];
      mockTenantService.getCurrentTenantId.mockReturnValue(tenantId);
      (mockModel.findAll as jest.Mock).mockResolvedValue(entities);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toBe(entities);
      expect(mockModel.findAll).toHaveBeenCalledWith({
        where: { tenantId },
        include: undefined,
        order: undefined,
        attributes: undefined,
      });
    });

    it('deve combinar filtro de tenant com filtros do usuário', async () => {
      // Arrange
      const tenantId = 1;
      const entities = [{ id: 1, tenantId, nome: 'Teste' }] as MockModel[];
      mockTenantService.getCurrentTenantId.mockReturnValue(tenantId);
      (mockModel.findAll as jest.Mock).mockResolvedValue(entities);

      // Act
      const result = await repository.findAll({
        where: { nome: 'Teste' },
      });

      // Assert
      expect(result).toBe(entities);
      expect(mockModel.findAll).toHaveBeenCalledWith({
        where: {
          nome: 'Teste',
          tenantId,
        },
        include: undefined,
        order: undefined,
        attributes: undefined,
      });
    });

    it('deve retornar array vazio quando não há tenantId', async () => {
      // Arrange
      mockTenantService.getCurrentTenantId.mockReturnValue(null);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(mockModel.findAll).not.toHaveBeenCalled();
    });
  });

  describe('create - Isolamento', () => {
    it('deve adicionar tenantId automaticamente ao criar', async () => {
      // Arrange
      const tenantId = 1;
      const entityData = { nome: 'Teste' };
      const createdEntity = { id: 1, tenantId, nome: 'Teste' } as MockModel;
      mockTenantService.getCurrentTenantId.mockReturnValue(tenantId);
      (mockModel.create as jest.Mock).mockResolvedValue(createdEntity);

      // Act
      const result = await repository.create(entityData as any);

      // Assert
      expect(result).toBe(createdEntity);
      expect(mockModel.create).toHaveBeenCalledWith({
        nome: 'Teste',
        tenantId,
      });
    });

    it('deve lançar ForbiddenException quando não há tenantId', async () => {
      // Arrange
      mockTenantService.getCurrentTenantId.mockReturnValue(null);

      // Act & Assert
      await expect(repository.create({ nome: 'Teste' } as any)).rejects.toThrow(
        ForbiddenException
      );
      expect(mockModel.create).not.toHaveBeenCalled();
    });

    it('deve ignorar tenantId fornecido e usar o do contexto', async () => {
      // Arrange
      const tenantId = 1;
      const wrongTenantId = 2;
      const entityData = { nome: 'Teste', tenantId: wrongTenantId };
      const createdEntity = { id: 1, tenantId, nome: 'Teste' } as MockModel;
      mockTenantService.getCurrentTenantId.mockReturnValue(tenantId);
      (mockModel.create as jest.Mock).mockResolvedValue(createdEntity);

      // Act
      const result = await repository.create(entityData as any);

      // Assert
      expect(result).toBe(createdEntity);
      expect(mockModel.create).toHaveBeenCalledWith({
        nome: 'Teste',
        tenantId, // Deve usar tenantId do contexto, não o fornecido
      });
    });
  });

  describe('update - Isolamento', () => {
    it('deve atualizar apenas entidades do tenant atual', async () => {
      // Arrange
      const tenantId = 1;
      const entity = { id: 1, tenantId, nome: 'Teste' } as MockModel;
      const updatedEntity = { id: 1, tenantId, nome: 'Teste Atualizado' } as MockModel;
      mockTenantService.getCurrentTenantId.mockReturnValue(tenantId);
      (mockModel.findOne as jest.Mock).mockResolvedValue(entity);
      (entity.update as jest.Mock) = jest.fn().mockResolvedValue(updatedEntity);

      // Act
      const result = await repository.update(1, { nome: 'Teste Atualizado' } as any);

      // Assert
      expect(result).toBe(entity);
      expect(mockModel.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          tenantId,
        },
      });
      expect(entity.update).toHaveBeenCalledWith({ nome: 'Teste Atualizado' });
    });

    it('deve lançar NotFoundException quando entidade não pertence ao tenant', async () => {
      // Arrange
      const tenantId = 1;
      mockTenantService.getCurrentTenantId.mockReturnValue(tenantId);
      (mockModel.findOne as jest.Mock).mockResolvedValue(null); // Não encontrado devido ao filtro

      // Act & Assert
      await expect(repository.update(1, { nome: 'Teste' } as any)).rejects.toThrow(
        NotFoundException
      );
    });

    it('deve lançar ForbiddenException quando não há tenantId', async () => {
      // Arrange
      mockTenantService.getCurrentTenantId.mockReturnValue(null);

      // Act & Assert
      await expect(repository.update(1, { nome: 'Teste' } as any)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('deve prevenir alteração de tenantId', async () => {
      // Arrange
      const tenantId = 1;
      const entity = { id: 1, tenantId, nome: 'Teste' } as MockModel;
      mockTenantService.getCurrentTenantId.mockReturnValue(tenantId);
      (mockModel.findOne as jest.Mock).mockResolvedValue(entity);
      (entity.update as jest.Mock) = jest.fn().mockResolvedValue(entity);

      // Act
      await repository.update(1, { nome: 'Teste', tenantId: 2 } as any);

      // Assert
      expect(entity.update).toHaveBeenCalledWith({ nome: 'Teste' }); // tenantId removido
    });
  });

  describe('delete - Isolamento', () => {
    it('deve deletar apenas entidades do tenant atual', async () => {
      // Arrange
      const tenantId = 1;
      const entity = { id: 1, tenantId, nome: 'Teste', destroy: jest.fn() } as any;
      mockTenantService.getCurrentTenantId.mockReturnValue(tenantId);
      (mockModel.findOne as jest.Mock).mockResolvedValue(entity);
      entity.destroy.mockResolvedValue(undefined);

      // Act
      const result = await repository.delete(1);

      // Assert
      expect(result).toBe(true);
      expect(mockModel.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          tenantId,
        },
      });
      expect(entity.destroy).toHaveBeenCalled();
    });

    it('deve retornar false quando entidade não pertence ao tenant', async () => {
      // Arrange
      const tenantId = 1;
      mockTenantService.getCurrentTenantId.mockReturnValue(tenantId);
      (mockModel.findOne as jest.Mock).mockResolvedValue(null); // Não encontrado devido ao filtro

      // Act
      const result = await repository.delete(1);

      // Assert
      expect(result).toBe(false);
    });

    it('deve lançar ForbiddenException quando não há tenantId', async () => {
      // Arrange
      mockTenantService.getCurrentTenantId.mockReturnValue(null);

      // Act & Assert
      await expect(repository.delete(1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllPaginated - Isolamento', () => {
    it('deve retornar apenas entidades do tenant atual', async () => {
      // Arrange
      const tenantId = 1;
      const entities = [
        { id: 1, tenantId, nome: 'Teste 1' },
        { id: 2, tenantId, nome: 'Teste 2' },
      ] as MockModel[];
      mockTenantService.getCurrentTenantId.mockReturnValue(tenantId);
      mockCacheService.get.mockResolvedValue(null);
      (mockModel.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: entities,
        count: 2,
      });

      // Act
      const result = await repository.findAllPaginated(1, 10);

      // Assert
      expect(result.data).toBe(entities);
      expect(result.total).toBe(2);
      expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
        where: { tenantId },
        include: undefined,
        order: undefined,
        attributes: undefined,
        limit: 10,
        offset: 0,
      });
    });

    it('deve retornar resultado vazio quando não há tenantId', async () => {
      // Arrange
      mockTenantService.getCurrentTenantId.mockReturnValue(null);

      // Act
      const result = await repository.findAllPaginated(1, 10);

      // Assert
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(mockModel.findAndCountAll).not.toHaveBeenCalled();
    });
  });

  describe('Cache - Isolamento por Tenant', () => {
    it('deve incluir tenantId nas chaves de cache', async () => {
      // Arrange
      const tenantId = 1;
      const entity = { id: 1, tenantId, nome: 'Teste' } as MockModel;
      mockTenantService.getCurrentTenantId.mockReturnValue(tenantId);
      mockCacheService.get.mockResolvedValue(null);
      (mockModel.findOne as jest.Mock).mockResolvedValue(entity);

      // Act
      await repository.findById(1);

      // Assert
      expect(mockCacheService.get).toHaveBeenCalledWith('mockmodel:tenant:1:findById:1');
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'mockmodel:tenant:1:findById:1',
        entity,
        3600
      );
    });

    it('deve usar tenantId diferente para diferentes tenants', async () => {
      // Arrange
      const tenantId1 = 1;
      const tenantId2 = 2;
      const entity1 = { id: 1, tenantId: tenantId1, nome: 'Teste 1' } as MockModel;
      const entity2 = { id: 1, tenantId: tenantId2, nome: 'Teste 2' } as MockModel;
      mockCacheService.get.mockResolvedValue(null);

      // Act - Tenant 1
      mockTenantService.getCurrentTenantId.mockReturnValue(tenantId1);
      (mockModel.findOne as jest.Mock).mockResolvedValue(entity1);
      await repository.findById(1);

      // Act - Tenant 2
      mockTenantService.getCurrentTenantId.mockReturnValue(tenantId2);
      (mockModel.findOne as jest.Mock).mockResolvedValue(entity2);
      await repository.findById(1);

      // Assert
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'mockmodel:tenant:1:findById:1',
        entity1,
        3600
      );
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'mockmodel:tenant:2:findById:1',
        entity2,
        3600
      );
    });
  });
});
