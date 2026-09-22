/**
 * Testes unitários para AuditService
 */

import { AuditService } from './AuditService';
import { IAuditLogRepository } from '../../infrastructure/repository/IAuditLogRepository';
import { ILogger } from '../../core/logger/ILogger';
import { Request } from 'express';
import { RequestContext } from '../../core/context/RequestContext';

describe('AuditService', () => {
  let auditService: AuditService;
  let mockAuditLogRepository: jest.Mocked<IAuditLogRepository>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    // Mock do repositório
    mockAuditLogRepository = {
      create: jest.fn().mockResolvedValue({}),
      findById: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findMany: jest.fn(),
      findAllPaginated: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByUsuario: jest.fn(),
      findByEntity: jest.fn(),
      findByAction: jest.fn(),
      findByPeriodo: jest.fn(),
      findByUsuarioAndPeriodo: jest.fn(),
    };

    // Mock do logger
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    auditService = new AuditService(mockAuditLogRepository, mockLogger);
  });

  describe('logCreate', () => {
    it('deve registrar log de criação com sucesso', async () => {
      const req = createMockRequest(1, '192.168.1.1', 'Mozilla/5.0');

      await auditService.logCreate('Usuario', 123, { nome: 'João', email: 'joao@example.com' }, req);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          action: 'CREATE',
          entity: 'Usuario',
          entityId: 123,
          changes: { after: { nome: 'João', email: 'joao@example.com' } },
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        })
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('deve sanitizar dados sensíveis', async () => {
      const req = createMockRequest(1);

      await auditService.logCreate('Usuario', 123, {
        nome: 'João',
        senha: 'senha123',
        apiKey: 'key123',
      }, req);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          changes: {
            after: {
              nome: 'João',
              senha: '[REDACTED]',
              apiKey: '[REDACTED]',
            },
          },
        })
      );
    });

    it('deve funcionar sem Request', async () => {
      await auditService.logCreate('Usuario', 123, { nome: 'João' });

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 0,
          action: 'CREATE',
          entity: 'Usuario',
          entityId: 123,
          ip: null,
          userAgent: null,
        })
      );
    });
  });

  describe('logUpdate', () => {
    it('deve registrar log de atualização com mudanças', async () => {
      const req = createMockRequest(1, '192.168.1.1', 'Mozilla/5.0');
      const before = { nome: 'João', email: 'joao@example.com' };
      const after = { nome: 'João Silva', email: 'joao.silva@example.com' };

      await auditService.logUpdate('Usuario', 123, before, after, req);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          action: 'UPDATE',
          entity: 'Usuario',
          entityId: 123,
          changes: expect.objectContaining({
            before,
            after,
            changes: expect.objectContaining({
              nome: { from: 'João', to: 'João Silva' },
              email: { from: 'joao@example.com', to: 'joao.silva@example.com' },
            }),
          }),
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        })
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('deve calcular apenas mudanças relevantes', async () => {
      const before = { nome: 'João', email: 'joao@example.com', idade: 30 };
      const after = { nome: 'João', email: 'joao@example.com', idade: 31 };

      await auditService.logUpdate('Usuario', 123, before, after);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          changes: expect.objectContaining({
            changes: {
              idade: { from: 30, to: 31 },
            },
          }),
        })
      );
    });
  });

  describe('logDelete', () => {
    it('deve registrar log de exclusão com sucesso', async () => {
      const req = createMockRequest(1, '192.168.1.1', 'Mozilla/5.0');
      const data = { nome: 'João', email: 'joao@example.com' };

      await auditService.logDelete('Usuario', 123, data, req);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          action: 'DELETE',
          entity: 'Usuario',
          entityId: 123,
          changes: { before: data },
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        })
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('logRead', () => {
    it('deve registrar log de leitura com sucesso', async () => {
      const req = createMockRequest(1, '192.168.1.1', 'Mozilla/5.0');

      await auditService.logRead('Usuario', 123, req);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          action: 'READ',
          entity: 'Usuario',
          entityId: 123,
          changes: null,
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        })
      );
      expect(mockLogger.debug).toHaveBeenCalled();
    });
  });

  describe('logLogin', () => {
    it('deve registrar log de login com sucesso', async () => {
      const req = createMockRequest(1, '192.168.1.1', 'Mozilla/5.0');

      await auditService.logLogin(1, req);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          action: 'LOGIN',
          entity: 'Usuario',
          entityId: 1,
          changes: null,
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        })
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('logLogout', () => {
    it('deve registrar log de logout com sucesso', async () => {
      const req = createMockRequest(1, '192.168.1.1', 'Mozilla/5.0');

      await auditService.logLogout(1, req);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          action: 'LOGOUT',
          entity: 'Usuario',
          entityId: 1,
          changes: null,
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        })
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('extractRequestInfo', () => {
    it('deve extrair IP de req.ip', async () => {
      const req = createMockRequest(1, '192.168.1.1');

      await auditService.logCreate('Usuario', 123, { nome: 'João' }, req);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ ip: '192.168.1.1' })
      );
    });

    it('deve extrair IP de x-forwarded-for', async () => {
      const req = {
        ip: undefined,
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
        userId: 1,
      } as any;

      await auditService.logCreate('Usuario', 123, { nome: 'João' }, req);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ ip: '192.168.1.1' })
      );
    });

    it('deve extrair IP de x-real-ip', async () => {
      const req = {
        ip: undefined,
        headers: {
          'x-real-ip': '192.168.1.1',
        },
        userId: 1,
      } as any;

      await auditService.logCreate('Usuario', 123, { nome: 'João' }, req);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ ip: '192.168.1.1' })
      );
    });

    it('deve extrair UserAgent do header', async () => {
      const req = {
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
        userId: 1,
      } as any;

      await auditService.logCreate('Usuario', 123, { nome: 'João' }, req);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userAgent: 'Mozilla/5.0' })
      );
    });
  });

  describe('getUserId', () => {
    it('deve obter userId do RequestContext', async () => {
      const context = new RequestContext();
      context.setUserId(1);
      const req = { context, userId: undefined } as any;

      await auditService.logCreate('Usuario', 123, { nome: 'João' }, req);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 1 })
      );
    });

    it('deve usar req.userId como fallback', async () => {
      const req = { userId: 1 } as any;

      await auditService.logCreate('Usuario', 123, { nome: 'João' }, req);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 1 })
      );
    });

    it('deve retornar 0 se não houver userId', async () => {
      await auditService.logCreate('Usuario', 123, { nome: 'João' });

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 0 })
      );
    });
  });

  describe('error handling', () => {
    it('não deve lançar erro se o repositório falhar', async () => {
      mockAuditLogRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(
        auditService.logCreate('Usuario', 123, { nome: 'João' })
      ).resolves.not.toThrow();

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});

/**
 * Helper para criar mock de Request
 */
function createMockRequest(
  userId?: number,
  ip?: string,
  userAgent?: string
): Request {
  const context = new RequestContext();
  if (userId) {
    context.setUserId(userId);
  }

  return {
    ip,
    headers: {
      'user-agent': userAgent,
    },
    userId,
    context,
  } as any;
}
