/**
 * Exemplos de uso do Logger Service
 * 
 * Este arquivo contém exemplos de como usar o Logger
 * no projeto.
 * 
 * NOTA: Este arquivo é apenas para documentação/exemplos, não deve ser
 * importado em produção.
 */

import { Request, Response, NextFunction } from 'express';
import { container } from '../di';
import { TYPES } from '../di/types';
import { ILogger } from './ILogger';

// ============================================
// EXEMPLO 1: Resolver Logger do Container
// ============================================

const logger = container.resolve<ILogger>(TYPES.ILogger);

// ============================================
// EXEMPLO 2: Logs Básicos
// ============================================

logger.debug('Debug message - informações detalhadas');
logger.info('Info message - eventos normais');
logger.warn('Warning message - atenção necessária');
logger.error('Error message - erros e exceções');

// ============================================
// EXEMPLO 3: Logs com Metadados
// ============================================

logger.info('User created', {
  userId: 123,
  email: 'user@example.com',
  timestamp: new Date().toISOString(),
});

logger.warn('Low balance', {
  userId: 123,
  balance: 10.50,
  threshold: 100,
});

logger.error('Database connection failed', {
  host: 'localhost',
  port: 3306,
  error: 'Connection timeout',
  retries: 3,
});

// ============================================
// EXEMPLO 4: Log de Erros com Stack Trace
// ============================================

try {
  // Alguma operação que pode falhar
  throw new Error('Something went wrong');
} catch (error: any) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    operation: 'processPayment',
  });
}

// ============================================
// EXEMPLO 5: Log em Service
// ============================================

import { Injectable, Inject } from '../di';

@Injectable()
export class OrderService {
  constructor(
    @Inject(TYPES.ILogger) private logger: ILogger
  ) {}

  async processOrder(orderId: number): Promise<void> {
    this.logger.info('Processing order', { orderId });

    try {
      // Processar pedido...
      this.logger.info('Order processed successfully', { orderId });
    } catch (error: any) {
      this.logger.error('Failed to process order', {
        orderId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

// ============================================
// EXEMPLO 6: Log em Controller
// ============================================

@Injectable()
export class UsuarioController {
  constructor(
    @Inject(TYPES.ILogger) private logger: ILogger
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    this.logger.info('Creating user', {
      email: req.body.email,
      path: req.path,
      method: req.method,
    });

    try {
      // Criar usuário...
      this.logger.info('User created successfully', {
        userId: 123,
        email: req.body.email,
      });
      res.status(201).json({ success: true });
    } catch (error: any) {
      this.logger.error('Failed to create user', {
        email: req.body.email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

// ============================================
// EXEMPLO 7: Log com Contexto de Requisição
// ============================================

export function logRequest(req: Request, res: Response, next: NextFunction): void {
  const logger = container.resolve<ILogger>(TYPES.ILogger);
  
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.headers['x-request-id'],
    });
  });
  
  next();
}

// ============================================
// EXEMPLO 8: Log de Performance
// ============================================

export async function logPerformance<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const logger = container.resolve<ILogger>(TYPES.ILogger);
  const startTime = Date.now();
  
  logger.debug(`Starting ${operation}`);
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    logger.info(`Completed ${operation}`, {
      operation,
      duration: `${duration}ms`,
    });
    
    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.error(`Failed ${operation}`, {
      operation,
      duration: `${duration}ms`,
      error: error.message,
    });
    
    throw error;
  }
}

// Uso:
// const users = await logPerformance('fetchUsers', () => userService.findAll());
