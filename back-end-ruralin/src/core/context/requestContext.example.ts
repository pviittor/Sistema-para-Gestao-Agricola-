/**
 * Exemplos de uso do RequestContext
 * 
 * Este arquivo contém exemplos de como usar o RequestContext
 * no projeto.
 * 
 * NOTA: Este arquivo é apenas para documentação/exemplos, não deve ser
 * importado em produção.
 */

import { Request, Response } from 'express';
import { RequestContext } from './RequestContext';
import { container } from '../di';
import { TYPES } from '../di/types';
import { ILogger } from '../logger/ILogger';
import { createLoggerWithContext, addContextToMeta } from '../logger/LoggerWithContext';

// ============================================
// EXEMPLO 1: Acessar RequestContext do Request
// ============================================

export function exemploAcessoContexto(req: Request, res: Response): void {
  // RequestContext está disponível em req.context após requestContextMiddleware
  const context = req.context!;

  const requestId = context.getRequestId();
  const userId = context.getUserId();
  const duration = context.getDuration();

  res.json({
    requestId,
    userId,
    duration: `${duration}ms`,
  });
}

// ============================================
// EXEMPLO 2: Usar RequestContext com Logger
// ============================================

export function exemploLoggerComContexto(req: Request, res: Response): void {
  const logger = container.resolve<ILogger>(TYPES.ILogger);
  const context = req.context!;

  // Opção 1: Usar helper createLoggerWithContext
  const loggerWithContext = createLoggerWithContext(logger, req);
  loggerWithContext.info('Processing request');
  // Log incluirá automaticamente requestId e userId

  // Opção 2: Usar addContextToMeta manualmente
  logger.info('User action', addContextToMeta(req, {
    action: 'create',
    resource: 'usuario',
  }));
  // Log incluirá requestId, userId, action e resource
}

// ============================================
// EXEMPLO 3: Log em Service com Contexto
// ============================================

import { Injectable, Inject } from '../di';

@Injectable()
export class OrderService {
  constructor(
    @Inject(TYPES.ILogger) private logger: ILogger
  ) {}

  async processOrder(orderId: number, req?: Request): Promise<void> {
    // Adicionar contexto aos logs
    this.logger.info('Processing order', addContextToMeta(req, {
      orderId,
      operation: 'processOrder',
    }));

    try {
      // Processar pedido...
      this.logger.info('Order processed', addContextToMeta(req, {
        orderId,
        status: 'success',
      }));
    } catch (error: any) {
      this.logger.error('Order processing failed', addContextToMeta(req, {
        orderId,
        error: error.message,
        stack: error.stack,
      }));
      throw error;
    }
  }
}

// ============================================
// EXEMPLO 4: Log em Controller com Contexto
// ============================================

@Injectable()
export class UsuarioController {
  constructor(
    @Inject(TYPES.ILogger) private logger: ILogger
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const context = req.context!;
    
    // Criar logger com contexto automático
    const loggerWithContext = createLoggerWithContext(this.logger, req);

    loggerWithContext.info('Creating user', {
      email: req.body.email,
    });
    // Log incluirá requestId e userId automaticamente

    try {
      // Criar usuário...
      loggerWithContext.info('User created successfully', {
        userId: 123,
        email: req.body.email,
      });

      res.status(201).json({
        success: true,
        requestId: context.getRequestId(),
      });
    } catch (error: any) {
      loggerWithContext.error('Failed to create user', {
        email: req.body.email,
        error: error.message,
      });
      throw error;
    }
  }
}

// ============================================
// EXEMPLO 5: Middleware de Performance com Contexto
// ============================================

import { NextFunction } from 'express';

export function performanceLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const context = req.context!;
  const logger = container.resolve<ILogger>(TYPES.ILogger);
  const loggerWithContext = createLoggerWithContext(logger, req);

  const startTime = context.getStartTime();

  res.on('finish', () => {
    const duration = context.getDuration();
    
    loggerWithContext.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
}

// ============================================
// EXEMPLO 6: Rastreamento de Requisições
// ============================================

export function exemploRastreamento(req: Request, res: Response): void {
  const context = req.context!;

  // Retornar requestId na resposta para rastreamento
  res.json({
    data: { /* dados da resposta */ },
    meta: {
      requestId: context.getRequestId(),
      userId: context.getUserId(),
      timestamp: new Date().toISOString(),
    },
  });
}

// ============================================
// EXEMPLO 7: Log de Erros com Contexto Completo
// ============================================

export function exemploErroComContexto(
  error: Error,
  req: Request,
  res: Response
): void {
  const logger = container.resolve<ILogger>(TYPES.ILogger);
  const context = req.context!;

  logger.error('Operation failed', addContextToMeta(req, {
    error: error.message,
    stack: error.stack,
    operation: 'processPayment',
    path: req.path,
    method: req.method,
  }));

  // Resposta inclui requestId para rastreamento
  res.status(500).json({
    error: 'Internal server error',
    requestId: context.getRequestId(),
  });
}
