/**
 * Middleware de Contexto de Requisição
 * 
 * Cria uma nova instância de RequestContext para cada requisição HTTP
 * e a armazena no Express Request para acesso posterior.
 * Também define o contexto no AsyncLocalStorage para acesso pelos decorators.
 * 
 * Deve ser adicionado ANTES de outros middlewares que precisam do contexto.
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RequestContext } from '../core/context/RequestContext';
import { runWithContext } from '../core/authorization/helpers';

/**
 * Middleware para criar e configurar RequestContext
 * 
 * Cria uma nova instância de RequestContext para cada requisição,
 * gera um requestId único (UUID) e extrai userId do token JWT
 * (se disponível através do authMiddleware).
 * 
 * Define o contexto no AsyncLocalStorage para que os decorators
 * de autorização possam acessá-lo.
 * 
 * @param req - Request do Express
 * @param res - Response do Express
 * @param next - NextFunction do Express
 */
/**
 * Extrai o endereço IP do Request
 * 
 * Ordem de prioridade:
 * 1. req.ip (se Express estiver configurado com trust proxy)
 * 2. req.headers['x-forwarded-for'] (primeiro IP da cadeia)
 * 3. req.headers['x-real-ip']
 * 4. req.socket.remoteAddress
 * 
 * @param req - Request do Express
 * @returns IP address ou null se não encontrado
 */
function extractIp(req: Request): string | null {
  // 1. Tentar req.ip (requer app.set('trust proxy', true))
  if (req.ip) {
    return req.ip;
  }

  // 2. Tentar x-forwarded-for (primeiro IP da cadeia)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const forwardedForStr = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor;
    // Pegar o primeiro IP da cadeia (IP real do cliente)
    return forwardedForStr.split(',')[0].trim();
  }

  // 3. Tentar x-real-ip
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  // 4. Fallback para socket.remoteAddress
  if (req.socket?.remoteAddress) {
    return req.socket.remoteAddress;
  }

  return null;
}

export const requestContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Criar nova instância de RequestContext para esta requisição
  const context = new RequestContext();

  // Gerar requestId único
  const requestId = uuidv4();
  context.setRequestId(requestId);

  // Extrair userId se disponível (definido pelo authMiddleware)
  if (req.userId) {
    context.setUserId(req.userId);
  }

  // Extrair e armazenar IP e UserAgent
  const ip = extractIp(req);
  context.setIp(ip);
  
  const userAgent = req.headers['user-agent'] || null;
  context.setUserAgent(userAgent);

  // Armazenar contexto no Request para acesso posterior
  req.context = context;

  // Adicionar requestId ao header de resposta (opcional, útil para debugging)
  res.setHeader('X-Request-ID', requestId);

  // Adicionar requestId ao header de request (para logs)
  req.headers['x-request-id'] = requestId;

  // Executar próximos middlewares e handlers dentro do contexto assíncrono
  // Isso permite que os decorators acessem o RequestContext via AsyncLocalStorage
  runWithContext(context, () => {
    next();
  });
};
