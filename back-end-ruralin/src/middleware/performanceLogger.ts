/**
 * Performance Logger Middleware
 * 
 * Middleware para registrar métricas de performance de requisições HTTP.
 * Registra tempo de execução, status code e outras métricas úteis.
 * 
 * Deve ser adicionado após requestContextMiddleware para ter acesso ao contexto.
 */

import { Request, Response, NextFunction } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { ILogger } from '../core/logger/ILogger';
import { addContextToMeta } from '../core/logger/LoggerWithContext';

/**
 * Middleware de performance logging
 * 
 * Registra métricas de performance para cada requisição HTTP:
 * - Tempo de execução (duration)
 * - Método HTTP
 * - Path da requisição
 * - Status code da resposta
 * - Tamanho da resposta (se disponível)
 * 
 * @param req - Request do Express
 * @param res - Response do Express
 * @param next - NextFunction do Express
 */
export const performanceLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  const context = req.context;

  // Registrar métricas quando a resposta terminar
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const durationFromContext = context?.getDuration() || duration;

    try {
      const logger = container.resolve<ILogger>(TYPES.ILogger);

      // Determinar nível de log baseado na duração
      const isSlowRequest = duration > 1000; // Mais de 1 segundo
      const logLevel = isSlowRequest ? 'warn' : 'info';
      const logMessage = isSlowRequest 
        ? 'Slow request detected' 
        : 'Request completed';

      const performanceData = addContextToMeta(req, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        durationMs: duration,
        ...(req.query && Object.keys(req.query).length > 0 && { 
          queryParams: Object.keys(req.query).length 
        }),
      });

      if (logLevel === 'warn') {
        logger.warn(logMessage, performanceData);
      } else {
        logger.info(logMessage, performanceData);
      }

      // Log adicional para requisições muito lentas (> 5 segundos)
      if (duration > 5000) {
        logger.error('Very slow request detected', addContextToMeta(req, {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          durationMs: duration,
          threshold: '5000ms',
        }));
      }
    } catch (loggerError) {
      // Fallback se Logger não estiver disponível
      console.log(`[Performance] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    }
  });

  next();
};
