/**
 * Interface para Logger Service
 * 
 * Define o contrato para serviços de logging no sistema.
 * Permite diferentes implementações (Pino, Winston, etc.) mantendo
 * a mesma interface.
 */

/**
 * Níveis de log disponíveis
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Interface para Logger Service
 */
export interface ILogger {
  /**
   * Log de debug - informações detalhadas para desenvolvimento
   * 
   * @param message - Mensagem de log
   * @param meta - Metadados adicionais (opcional)
   */
  debug(message: string, meta?: Record<string, any>): void;

  /**
   * Log de informação - eventos normais da aplicação
   * 
   * @param message - Mensagem de log
   * @param meta - Metadados adicionais (opcional)
   */
  info(message: string, meta?: Record<string, any>): void;

  /**
   * Log de aviso - situações que merecem atenção mas não são erros
   * 
   * @param message - Mensagem de log
   * @param meta - Metadados adicionais (opcional)
   */
  warn(message: string, meta?: Record<string, any>): void;

  /**
   * Log de erro - erros e exceções
   * 
   * @param message - Mensagem de log
   * @param meta - Metadados adicionais (opcional)
   */
  error(message: string, meta?: Record<string, any>): void;
}
