/**
 * LoggerWithContext - Wrapper do Logger com integração de RequestContext
 * 
 * Este helper adiciona automaticamente requestId e userId aos logs
 * quando o RequestContext estiver disponível no Request.
 */

import { Request } from 'express';
import { ILogger } from './ILogger';
import { RequestContext } from '../context/RequestContext';

/**
 * Adiciona contexto de requisição aos metadados do log
 * 
 * @param req - Request do Express (opcional)
 * @param meta - Metadados originais do log
 * @returns Metadados com contexto adicionado
 */
export function addContextToMeta(
  req?: Request,
  meta?: Record<string, any>
): Record<string, any> {
  const enrichedMeta: Record<string, any> = { ...meta };

  if (req?.context) {
    const context = req.context;
    
    // Adicionar requestId sempre que disponível
    if (context.getRequestId()) {
      enrichedMeta.requestId = context.getRequestId();
    }

    // Adicionar userId quando disponível
    const userId = context.getUserId();
    if (userId !== undefined) {
      enrichedMeta.userId = userId;
    }
  }

  return enrichedMeta;
}

/**
 * Helper para criar logger com contexto automático
 * 
 * @param logger - Instância do Logger
 * @param req - Request do Express (opcional)
 * @returns Logger com métodos que incluem contexto automaticamente
 */
export function createLoggerWithContext(
  logger: ILogger,
  req?: Request
): ILogger {
  return {
    debug: (message: string, meta?: Record<string, any>) => {
      logger.debug(message, addContextToMeta(req, meta));
    },
    info: (message: string, meta?: Record<string, any>) => {
      logger.info(message, addContextToMeta(req, meta));
    },
    warn: (message: string, meta?: Record<string, any>) => {
      logger.warn(message, addContextToMeta(req, meta));
    },
    error: (message: string, meta?: Record<string, any>) => {
      logger.error(message, addContextToMeta(req, meta));
    },
  };
}
