/**
 * Testes unitários para TenantService
 * 
 * Testa funcionalidades de gerenciamento de tenantId e validação de tenants.
 */

import { TenantService } from './TenantService';
import { ILogger } from '../logger/ILogger';
import { RequestContext } from '../context/RequestContext';
import Usuario from '../../models/Usuario';

// Mock do Usuario model
jest.mock('../../models/Usuario');

describe('TenantService', () => {
  let tenantService: TenantService;
  let mockLogger: jest.Mocked<ILogger>;
  let mockRequestContext: jest.Mocked<RequestContext>;

  beforeEach(() => {
    // Mock do logger
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as any;

    // Mock do RequestContext
    mockRequestContext = {
      getRequestId: jest.fn().mockReturnValue('test-request-id'),
      getUserId: jest.fn().mockReturnValue(1),
      setRequestId: jest.fn(),
      setUserId: jest.fn(),
      getStartTime: jest.fn(),
      getDuration: jest.fn(),
      clear: jest.fn(),
      toJSON: jest.fn(),
    } as any;

    tenantService = new TenantService(mockLogger, mockRequestContext);
  });

  afterEach(() => {
    tenantService.clear();
    jest.clearAllMocks();
  });

  describe('getCurrentTenantId', () => {
    it('deve retornar null quando tenantId não foi definido', () => {
      expect(tenantService.getCurrentTenantId()).toBeNull();
    });

    it('deve retornar o tenantId definido', () => {
      tenantService.setCurrentTenantId(1);
      expect(tenantService.getCurrentTenantId()).toBe(1);
    });
  });

  describe('setCurrentTenantId', () => {
    it('deve definir o tenantId corretamente', () => {
      tenantService.setCurrentTenantId(1);
      expect(tenantService.getCurrentTenantId()).toBe(1);
      expect(mockLogger.debug).toHaveBeenCalledWith('TenantId definido', {
        tenantId: 1,
        requestId: 'test-request-id',
      });
    });

    it('deve lançar erro ao tentar definir tenantId inválido (zero)', () => {
      expect(() => tenantService.setCurrentTenantId(0)).toThrow('tenantId deve ser um número positivo');
      expect(mockLogger.warn).toHaveBeenCalledWith('Tentativa de definir tenantId inválido', { tenantId: 0 });
    });

    it('deve lançar erro ao tentar definir tenantId inválido (negativo)', () => {
      expect(() => tenantService.setCurrentTenantId(-1)).toThrow('tenantId deve ser um número positivo');
      expect(mockLogger.warn).toHaveBeenCalledWith('Tentativa de definir tenantId inválido', { tenantId: -1 });
    });
  });

  describe('validateTenant', () => {
    it('deve retornar false para tenantId inválido (zero)', async () => {
      const result = await tenantService.validateTenant(0);
      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith('Tentativa de validar tenantId inválido', { tenantId: 0 });
    });

    it('deve retornar false para tenantId inválido (negativo)', async () => {
      const result = await tenantService.validateTenant(-1);
      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith('Tentativa de validar tenantId inválido', { tenantId: -1 });
    });

    it('deve retornar false quando tenant não existe', async () => {
      (Usuario.findOne as jest.Mock).mockResolvedValue(null);

      const result = await tenantService.validateTenant(999);
      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith('Tenant não encontrado', { tenantId: 999 });
    });

    it('deve retornar true quando tenant existe e usuário não está autenticado', async () => {
      (Usuario.findOne as jest.Mock).mockResolvedValueOnce({ id: 1, tenantId: 1 });
      mockRequestContext.getUserId.mockReturnValue(undefined);

      const result = await tenantService.validateTenant(1);
      expect(result).toBe(true);
      expect(mockLogger.debug).toHaveBeenCalledWith('Tenant validado com sucesso', { tenantId: 1, userId: undefined });
    });

    it('deve retornar true quando tenant existe e usuário pertence ao tenant', async () => {
      (Usuario.findOne as jest.Mock).mockResolvedValueOnce({ id: 1, tenantId: 1 });
      (Usuario.findByPk as jest.Mock).mockResolvedValueOnce({ id: 1, tenantId: 1 });
      mockRequestContext.getUserId.mockReturnValue(1);

      const result = await tenantService.validateTenant(1);
      expect(result).toBe(true);
      expect(mockLogger.debug).toHaveBeenCalledWith('Tenant validado com sucesso', { tenantId: 1, userId: 1 });
    });

    it('deve retornar false quando usuário não pertence ao tenant', async () => {
      (Usuario.findOne as jest.Mock).mockResolvedValueOnce({ id: 1, tenantId: 1 });
      (Usuario.findByPk as jest.Mock).mockResolvedValueOnce({ id: 1, tenantId: 2 });
      mockRequestContext.getUserId.mockReturnValue(1);

      const result = await tenantService.validateTenant(1);
      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith('Usuário não pertence ao tenant', {
        userId: 1,
        userTenantId: 2,
        requestedTenantId: 1,
      });
    });

    it('deve retornar false quando usuário não existe', async () => {
      (Usuario.findOne as jest.Mock).mockResolvedValueOnce({ id: 1, tenantId: 1 });
      (Usuario.findByPk as jest.Mock).mockResolvedValueOnce(null);
      mockRequestContext.getUserId.mockReturnValue(999);

      const result = await tenantService.validateTenant(1);
      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith('Usuário não encontrado para validação de tenant', {
        userId: 999,
        tenantId: 1,
      });
    });

    it('deve retornar false quando ocorre erro na validação', async () => {
      (Usuario.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await tenantService.validateTenant(1);
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith('Erro ao validar tenant', {
        tenantId: 1,
        error: expect.any(Error),
      });
    });
  });

  describe('clear', () => {
    it('deve limpar o tenantId atual', () => {
      tenantService.setCurrentTenantId(1);
      expect(tenantService.getCurrentTenantId()).toBe(1);

      tenantService.clear();
      expect(tenantService.getCurrentTenantId()).toBeNull();
      expect(mockLogger.debug).toHaveBeenCalledWith('TenantId limpo', { requestId: 'test-request-id' });
    });
  });
});
