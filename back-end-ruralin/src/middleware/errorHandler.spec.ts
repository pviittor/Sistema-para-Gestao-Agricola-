/**
 * Testes para ErrorHandler Middleware
 * 
 * NOTA: Estes testes requerem framework de testes (Jest, Mocha, etc.)
 * Para executar, configure o framework de testes primeiro.
 */

import { Request, Response, NextFunction } from 'express';
import { errorHandler, asyncHandler } from './errorHandler';
import {
  BusinessException,
  ValidationException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '../core/exceptions';

// Mock do Express Request, Response e NextFunction
const createMockRequest = (path: string = '/api/test'): Partial<Request> => ({
  path,
  method: 'GET',
  headers: {},
  body: {},
  query: {},
  params: {},
});

const createMockResponse = (): Partial<Response> => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    headersSent: false,
  };
  return res;
};

const createMockNext = (): NextFunction => {
  return jest.fn();
};

describe('errorHandler', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    next = createMockNext();
  });

  describe('BusinessException', () => {
    it('deve capturar BusinessException e retornar 400', () => {
      const error = new BusinessException('Erro de negócio', 'BUSINESS_ERROR');
      errorHandler(error as Error, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'BUSINESS_ERROR',
          message: 'Erro de negócio',
        },
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('deve incluir details quando fornecido', () => {
      const error = new BusinessException(
        'Saldo insuficiente',
        'INSUFFICIENT_BALANCE',
        { saldo: 100, valor: 200 }
      );
      errorHandler(error as Error, req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: { saldo: 100, valor: 200 },
          }),
        })
      );
    });
  });

  describe('ValidationException', () => {
    it('deve capturar ValidationException e retornar 400', () => {
      const error = new ValidationException('Dados inválidos');
      errorHandler(error as Error, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos',
          },
        })
      );
    });
  });

  describe('NotFoundException', () => {
    it('deve capturar NotFoundException e retornar 404', () => {
      const error = new NotFoundException('Usuário', 123);
      errorHandler(error as Error, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            code: 'NOT_FOUND',
            message: 'Usuário com id 123 não encontrado',
          },
        })
      );
    });
  });

  describe('UnauthorizedException', () => {
    it('deve capturar UnauthorizedException e retornar 401', () => {
      const error = new UnauthorizedException('Token inválido');
      errorHandler(error as Error, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token inválido',
          },
        })
      );
    });
  });

  describe('ForbiddenException', () => {
    it('deve capturar ForbiddenException e retornar 403', () => {
      const error = new ForbiddenException('Acesso negado');
      errorHandler(error as Error, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            code: 'FORBIDDEN',
            message: 'Acesso negado',
          },
        })
      );
    });
  });

  describe('Erro genérico', () => {
    it('deve capturar erro genérico e retornar 500', () => {
      const error = new Error('Erro interno');
      errorHandler(error, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            code: 'INTERNAL_ERROR',
            message: expect.any(String),
          },
        })
      );
    });

    it('deve ocultar stack trace em produção', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Erro interno');
      errorHandler(error, req as Request, res as Response, next);

      const call = (res.json as jest.Mock).mock.calls[0][0];
      expect(call.error.details).toBeUndefined();
    });

    it('deve mostrar stack trace em desenvolvimento', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Erro interno');
      errorHandler(error, req as Request, res as Response, next);

      const call = (res.json as jest.Mock).mock.calls[0][0];
      expect(call.error.details).toBeDefined();
      expect(call.error.details.stack).toBeDefined();
    });
  });

  describe('Request ID', () => {
    it('deve incluir requestId quando presente nos headers', () => {
      req.headers = { 'x-request-id': 'req-123' };
      const error = new BusinessException('Erro');
      errorHandler(error as Error, req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'req-123',
        })
      );
    });
  });

  describe('Headers já enviados', () => {
    it('deve delegar para next quando headers já foram enviados', () => {
      res.headersSent = true;
      const error = new BusinessException('Erro');
      errorHandler(error as Error, req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});

describe('asyncHandler', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    next = createMockNext();
  });

  it('deve executar função assíncrona com sucesso', async () => {
    const handler = asyncHandler(async (req, res) => {
      res.json({ success: true });
    });

    await handler(req as Request, res as Response, next);

    expect(res.json).toHaveBeenCalledWith({ success: true });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve capturar erro e passar para next', async () => {
    const error = new BusinessException('Erro');
    const handler = asyncHandler(async (req, res) => {
      throw error;
    });

    await handler(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('deve capturar erro genérico e passar para next', async () => {
    const error = new Error('Erro genérico');
    const handler = asyncHandler(async (req, res) => {
      throw error;
    });

    await handler(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
