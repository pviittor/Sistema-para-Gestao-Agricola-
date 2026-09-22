/**
 * Testes unitários para decorator @Auditable
 */

import { Auditable } from './Auditable';
import { IAuditService } from './IAuditService';
import { IRepository } from '../repository/IRepository';
import { Request } from 'express';
import { container } from '../di/container';
import { TYPES } from '../di/types';

// Mock do container
jest.mock('../di/container', () => ({
  container: {
    resolve: jest.fn(),
  },
}));

// Mock do AuditService
const mockAuditService: jest.Mocked<IAuditService> = {
  logCreate: jest.fn().mockResolvedValue(undefined),
  logUpdate: jest.fn().mockResolvedValue(undefined),
  logDelete: jest.fn().mockResolvedValue(undefined),
  logRead: jest.fn().mockResolvedValue(undefined),
  logLogin: jest.fn().mockResolvedValue(undefined),
  logLogout: jest.fn().mockResolvedValue(undefined),
};

describe('@Auditable decorator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (container.resolve as jest.Mock).mockReturnValue(mockAuditService);
  });

  describe('CREATE operation', () => {
    it('deve registrar auditoria após criação', async () => {
      class TestService {
        @Auditable('Usuario')
        async create(dto: any): Promise<any> {
          return { id: 123, nome: 'João' };
        }
      }

      const service = new TestService();
      const result = await service.create({ nome: 'João' });

      expect(result).toEqual({ id: 123, nome: 'João' });
      expect(mockAuditService.logCreate).toHaveBeenCalledWith(
        'Usuario',
        123,
        { id: 123, nome: 'João' },
        undefined
      );
    });

    it('deve usar nome da entidade inferido da classe', async () => {
      class UsuarioApplicationService {
        @Auditable()
        async create(dto: any): Promise<any> {
          return { id: 123 };
        }
      }

      const service = new UsuarioApplicationService();
      await service.create({});

      expect(mockAuditService.logCreate).toHaveBeenCalledWith(
        'Usuario',
        123,
        { id: 123 },
        undefined
      );
    });

    it('deve passar Request se disponível', async () => {
      const req = { userId: 1, headers: {} } as Request;

      class TestService {
        @Auditable('Usuario')
        async create(dto: any, request?: Request): Promise<any> {
          return { id: 123 };
        }
      }

      const service = new TestService();
      await service.create({}, req);

      expect(mockAuditService.logCreate).toHaveBeenCalledWith(
        'Usuario',
        123,
        { id: 123 },
        req
      );
    });
  });

  describe('UPDATE operation', () => {
    it('deve capturar estado antes e registrar auditoria', async () => {
      const mockRepository: jest.Mocked<IRepository<any>> = {
        findById: jest.fn().mockResolvedValue({ id: 123, nome: 'João' }),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findMany: jest.fn(),
        findAllPaginated: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      };

      class TestService {
        repository = mockRepository;

        @Auditable('Usuario')
        async update(id: number, dto: any): Promise<any> {
          return { id: 123, nome: 'João Silva' };
        }
      }

      const service = new TestService();
      const result = await service.update(123, { nome: 'João Silva' });

      expect(mockRepository.findById).toHaveBeenCalledWith(123);
      expect(result).toEqual({ id: 123, nome: 'João Silva' });
      expect(mockAuditService.logUpdate).toHaveBeenCalledWith(
        'Usuario',
        123,
        { id: 123, nome: 'João' },
        { id: 123, nome: 'João Silva' },
        undefined
      );
    });

    it('deve usar getBeforeState customizado se fornecido', async () => {
      const customGetBeforeState = jest.fn().mockResolvedValue({ id: 123, nome: 'João' });

      class TestService {
        @Auditable({
          entityName: 'Usuario',
          getBeforeState: customGetBeforeState,
        })
        async update(id: number, dto: any): Promise<any> {
          return { id: 123, nome: 'João Silva' };
        }
      }

      const service = new TestService();
      await service.update(123, { nome: 'João Silva' });

      expect(customGetBeforeState).toHaveBeenCalledWith(service, 123, { nome: 'João Silva' });
      expect(mockAuditService.logUpdate).toHaveBeenCalled();
    });
  });

  describe('DELETE operation', () => {
    it('deve capturar estado antes e registrar auditoria', async () => {
      const mockRepository: jest.Mocked<IRepository<any>> = {
        findById: jest.fn().mockResolvedValue({ id: 123, nome: 'João' }),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findMany: jest.fn(),
        findAllPaginated: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn().mockResolvedValue(true),
      };

      class TestService {
        repository = mockRepository;

        @Auditable('Usuario')
        async delete(id: number): Promise<boolean> {
          return true;
        }
      }

      const service = new TestService();
      const result = await service.delete(123);

      expect(mockRepository.findById).toHaveBeenCalledWith(123);
      expect(result).toBe(true);
      expect(mockAuditService.logDelete).toHaveBeenCalledWith(
        'Usuario',
        123,
        { id: 123, nome: 'João' },
        undefined
      );
    });
  });

  describe('error handling', () => {
    it('não deve lançar erro se auditoria falhar', async () => {
      mockAuditService.logCreate.mockRejectedValue(new Error('Audit error'));

      class TestService {
        @Auditable('Usuario')
        async create(dto: any): Promise<any> {
          return { id: 123 };
        }
      }

      const service = new TestService();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Não deve lançar erro
      await expect(service.create({})).resolves.toEqual({ id: 123 });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('options', () => {
    it('deve usar repositoryFindMethod customizado', async () => {
      const mockRepository: jest.Mocked<IRepository<any>> = {
        findByPk: jest.fn().mockResolvedValue({ id: 123, nome: 'João' }),
        findById: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findMany: jest.fn(),
        findAllPaginated: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      };

      class TestService {
        repository = mockRepository;

        @Auditable({
          entityName: 'Usuario',
          repositoryFindMethod: 'findByPk',
        })
        async update(id: number, dto: any): Promise<any> {
          return { id: 123, nome: 'João Silva' };
        }
      }

      const service = new TestService();
      await service.update(123, {});

      expect(mockRepository.findByPk).toHaveBeenCalledWith(123);
    });

    it('deve usar getIdFromArgs customizado', async () => {
      const mockRepository: jest.Mocked<IRepository<any>> = {
        findById: jest.fn().mockResolvedValue({ id: 123 }),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findMany: jest.fn(),
        findAllPaginated: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      };

      class TestService {
        repository = mockRepository;

        @Auditable({
          entityName: 'Usuario',
          getIdFromArgs: (dto: any) => dto.usuarioId,
        })
        async update(dto: any): Promise<any> {
          return { id: dto.usuarioId };
        }
      }

      const service = new TestService();
      await service.update({ usuarioId: 123 });

      expect(mockRepository.findById).toHaveBeenCalledWith(123);
    });
  });
});
