/**
 * Testes unitários para tenantMiddleware
 * 
 * Testa funcionalidades de identificação e validação de tenant em requisições.
 */

import { Request, Response, NextFunction } from 'express';
import { tenantMiddleware } from './tenant';
import { ITenantService } from '../core/tenant/ITenantService';
import { ForbiddenException } from '../core/exceptions';
import { BadRequestException } from '../core/exceptions/BadRequestException';
import Usuario from '../models/Usuario';

// Mock do container
jest.mock('../core/di/container', () => ({
  container: {
    resolve: jest.fn(),
  },
}));

// Mock do Usuario model
jest.mock('../models/Usuario');

describe('tenantMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockTenantService: jest.Mocked<ITenantService>;

  beforeEach(() => {
    // Mock do TenantService
    mockTenantService = {
      getCurrentTenantId: jest.fn(),
      setCurrentTenantId: jest.fn(),
      validateTenant: jest.fn(),
      clear: jest.fn(),
    };

    // Mock do container.resolve
    const { container } = require('../core/di/container');
    container.resolve.mockReturnValue(mockTenantService);

    // Mock do Request
    mockRequest = {
      userId: 1,
      headers: {},
      context: {
        getRequestId: jest.fn().mockReturnValue('test-request-id'),
        getUserId: jest.fn().mockReturnValue(1),
        setRequestId: jest.fn(),
        setUserId: jest.fn(),
        getStartTime: jest.fn(),
        getDuration: jest.fn(),
        clear: jest.fn(),
        toJSON: jest.fn(),
      } as any,
    };

    // Mock do Response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock do NextFunction
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('extractTenantId', () => {
    it('deve extrair tenantId do usuário autenticado', async () => {
      (Usuario.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        tenantId: 10,
      });
      mockTenantService.validateTenant.mockResolvedValue(true);

      await tenantMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(Usuario.findByPk).toHaveBeenCalledWith(1, {
        attributes: ['id', 'tenantId'],
      });
      expect(mockTenantService.setCurrentTenantId).toHaveBeenCalledWith(10);
      expect(mockNext).toHaveBeenCalled();
    });

    it('deve extrair tenantId do header X-Tenant-ID quando usuário não tem tenantId', async () => {
      (Usuario.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        tenantId: null,
      });
      mockRequest.headers = { 'x-tenant-id': '20' };
      mockTenantService.validateTenant.mockResolvedValue(true);

      await tenantMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTenantService.setCurrentTenantId).toHaveBeenCalledWith(20);
      expect(mockNext).toHaveBeenCalled();
    });

    it('deve retornar erro quando tenantId não é identificado', async () => {
      (Usuario.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        tenantId: null,
      });
      mockRequest.headers = {};
      mockRequest.userId = undefined;

      await tenantMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(BadRequestException)
      );
      expect(mockTenantService.setCurrentTenantId).not.toHaveBeenCalled();
    });
  });

  describe('validateTenant', () => {
    it('deve validar tenant e permitir acesso quando válido', async () => {
      (Usuario.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        tenantId: 10,
      });
      mockTenantService.validateTenant.mockResolvedValue(true);

      await tenantMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTenantService.validateTenant).toHaveBeenCalledWith(10);
      expect(mockTenantService.setCurrentTenantId).toHaveBeenCalledWith(10);
      expect(mockNext).toHaveBeenCalled();
    });

    it('deve retornar erro quando tenant é inválido', async () => {
      (Usuario.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        tenantId: 10,
      });
      mockTenantService.validateTenant.mockResolvedValue(false);

      await tenantMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTenantService.validateTenant).toHaveBeenCalledWith(10);
      expect(mockNext).toHaveBeenCalledWith(
        expect.any(ForbiddenException)
      );
      expect(mockTenantService.setCurrentTenantId).not.toHaveBeenCalled();
    });
  });

  describe('setCurrentTenantId', () => {
    it('deve definir tenantId no TenantService e Request', async () => {
      (Usuario.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        tenantId: 10,
      });
      mockTenantService.validateTenant.mockResolvedValue(true);

      await tenantMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTenantService.setCurrentTenantId).toHaveBeenCalledWith(10);
      expect((mockRequest as any).tenantId).toBe(10);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('RequestContext integration', () => {
    it('deve adicionar tenantId ao RequestContext se disponível', async () => {
      (Usuario.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        tenantId: 10,
      });
      mockTenantService.validateTenant.mockResolvedValue(true);

      await tenantMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect((mockRequest.context as any).tenantId).toBe(10);
    });
  });

  describe('Isolamento de Segurança', () => {
    it('deve bloquear acesso quando tenant não é identificado', async () => {
      (Usuario.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        tenantId: null,
      });
      mockRequest.headers = {};
      mockRequest.userId = undefined;

      await tenantMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'TENANT_NOT_IDENTIFIED',
        })
      );
      expect(mockTenantService.setCurrentTenantId).not.toHaveBeenCalled();
    });

    it('deve bloquear acesso quando tenant é inválido', async () => {
      (Usuario.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        tenantId: 10,
      });
      mockTenantService.validateTenant.mockResolvedValue(false);

      await tenantMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          code: 'TENANT_ACCESS_DENIED',
        })
      );
      expect(mockTenantService.setCurrentTenantId).not.toHaveBeenCalled();
    });

    it('deve permitir acesso quando tenant é válido', async () => {
      (Usuario.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        tenantId: 10,
      });
      mockTenantService.validateTenant.mockResolvedValue(true);

      await tenantMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTenantService.setCurrentTenantId).toHaveBeenCalledWith(10);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
