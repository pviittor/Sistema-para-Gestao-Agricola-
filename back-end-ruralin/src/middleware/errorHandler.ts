/**
 * ErrorHandler Middleware
 * 
 * Middleware global para captura e tratamento padronizado de exceções.
 * Deve ser adicionado como último middleware no Express app.
 * 
 * Formato de resposta padronizado:
 * {
 *   success: false,
 *   error: {
 *     code: string,
 *     message: string,
 *     details?: any
 *   },
 *   timestamp: string,
 *   path: string
 * }
 */

/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { BaseException } from '../core/exceptions';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { ILogger } from '../core/logger/ILogger';
import { addContextToMeta } from '../core/logger/LoggerWithContext';

/**
 * Interface para resposta de erro padronizada
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path: string;
  requestId?: string;
}

/**
 * Middleware de tratamento de erros
 * 
 * Captura todas as exceções não tratadas e formata respostas padronizadas.
 * 
 * @param err - Erro capturado
 * @param req - Request do Express
 * @param res - Response do Express
 * @param next - NextFunction do Express
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Se já foi enviada uma resposta, delegar para o handler padrão do Express
  if (res.headersSent) {
    return next(err);
  }

  // Verificar se é uma exceção customizada
  if (err instanceof BaseException) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
      timestamp: new Date().toISOString(),
      path: req.path,
      ...(req.context?.getRequestId() && { requestId: req.context.getRequestId() }),
    };

    // Log do erro usando Logger com contexto
    try {
      const logger = container.resolve<ILogger>(TYPES.ILogger);
      logger.warn('Business error', addContextToMeta(req, {
        code: err.code,
        message: err.message,
        path: req.path,
        method: req.method,
        statusCode: err.statusCode,
        details: err.details,
      }));
    } catch (loggerError) {
      // Fallback se Logger não estiver disponível
      console.warn('[ErrorHandler] Business error:', {
        code: err.code,
        message: err.message,
        path: req.path,
        method: req.method,
        statusCode: err.statusCode,
        requestId: req.context?.getRequestId(),
        userId: req.context?.getUserId(),
      });
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Erro não tratado (exceção genérica ou erro inesperado)
  const response: ErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : err.message || 'Erro interno do servidor',
      ...(process.env.NODE_ENV !== 'production' && err.stack && {
        details: {
          stack: err.stack,
          name: err.name,
        },
      }),
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(req.headers['x-request-id'] && { requestId: req.headers['x-request-id'] as string }),
  };

  // Log do erro usando Logger com contexto
  try {
    const logger = container.resolve<ILogger>(TYPES.ILogger);
    logger.error('Unhandled error', addContextToMeta(req, {
      message: err.message,
      name: err.name,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
    }));
  } catch (loggerError) {
    // Fallback se Logger não estiver disponível
    console.error('[ErrorHandler] Unhandled error:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      path: req.path,
      method: req.method,
      requestId: req.context?.getRequestId(),
      userId: req.context?.getUserId(),
    });
  }

  res.status(500).json(response);
};

/**
 * Middleware para capturar erros assíncronos
 * 
 * Wrapper para rotas assíncronas que não capturam erros automaticamente.
 * 
 * @example
 * ```typescript
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await userService.findAll();
 *   res.json(users);
 * }));
 * ```
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
