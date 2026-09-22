/**
 * Testes unitários para Logger Service
 * 
 * NOTA: Estes testes requerem framework de testes (Jest, Mocha, etc.)
 * Para executar, configure o framework de testes primeiro.
 */

import { LoggerService } from './LoggerService';
import { ILogger } from './ILogger';

describe('LoggerService', () => {
  let logger: LoggerService;

  beforeEach(() => {
    logger = new LoggerService({
      level: 'debug',
      environment: 'test',
    });
  });

  describe('Níveis de log', () => {
    it('deve implementar ILogger', () => {
      expect(logger).toBeInstanceOf(LoggerService);
      expect(logger).toHaveProperty('debug');
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('warn');
      expect(logger).toHaveProperty('error');
    });

    it('deve logar debug sem erros', () => {
      expect(() => {
        logger.debug('Debug message');
      }).not.toThrow();
    });

    it('deve logar info sem erros', () => {
      expect(() => {
        logger.info('Info message');
      }).not.toThrow();
    });

    it('deve logar warn sem erros', () => {
      expect(() => {
        logger.warn('Warning message');
      }).not.toThrow();
    });

    it('deve logar error sem erros', () => {
      expect(() => {
        logger.error('Error message');
      }).not.toThrow();
    });
  });

  describe('Logs com metadados', () => {
    it('deve logar com metadados', () => {
      expect(() => {
        logger.info('User created', { userId: 123, email: 'test@example.com' });
      }).not.toThrow();
    });

    it('deve logar erro com stack trace', () => {
      const error = new Error('Test error');
      expect(() => {
        logger.error('Error occurred', {
          error: error.message,
          stack: error.stack,
        });
      }).not.toThrow();
    });
  });

  describe('Configuração', () => {
    it('deve usar nível de log do ambiente', () => {
      const loggerInfo = new LoggerService({
        level: 'info',
        environment: 'test',
      });
      expect(loggerInfo).toBeDefined();
    });

    it('deve usar nível de log padrão quando não fornecido', () => {
      const loggerDefault = new LoggerService({
        environment: 'test',
      });
      expect(loggerDefault).toBeDefined();
    });
  });

  describe('getPinoLogger', () => {
    it('deve retornar instância do logger Pino', () => {
      const pinoLogger = logger.getPinoLogger();
      expect(pinoLogger).toBeDefined();
      expect(pinoLogger).toHaveProperty('debug');
      expect(pinoLogger).toHaveProperty('info');
      expect(pinoLogger).toHaveProperty('warn');
      expect(pinoLogger).toHaveProperty('error');
    });
  });
});

describe('ILogger interface', () => {
  it('deve ter todos os métodos necessários', () => {
    const logger: ILogger = new LoggerService();
    
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });
});
