/**
 * LoggerService - Implementação do Logger usando Pino
 * 
 * Pino é uma biblioteca de logging rápida e eficiente que produz
 * logs em formato JSON estruturado, facilitando parsing e análise.
 * 
 * Em desenvolvimento, usa pino-pretty para formatação legível.
 * Em produção, usa formato JSON puro para melhor performance.
 */

import pino, { Logger } from 'pino';
import { Injectable } from '../di';
import { ILogger } from './ILogger';

/**
 * Configuração do Logger
 */
interface LoggerConfig {
  /**
   * Nível mínimo de log (debug, info, warn, error)
   * Padrão: 'info'
   */
  level?: string;

  /**
   * Ambiente de execução
   * 'development' usa pretty print
   * 'production' usa JSON
   */
  environment?: string;

  /**
   * Nome da aplicação (aparece nos logs)
   */
  appName?: string;

  /**
   * Habilitar rotação de logs em arquivo
   * Padrão: false
   */
  enableFileRotation?: boolean;

  /**
   * Diretório para logs
   * Padrão: './logs'
   */
  logDirectory?: string;
}

/**
 * Implementação do Logger usando Pino
 */
@Injectable()
export class LoggerService implements ILogger {
  private logger: Logger;

  constructor() {
    // Criar config a partir de variáveis de ambiente
    // Não usar injeção de dependência para config para evitar problemas com TSyringe
    const level = process.env.LOG_LEVEL || 'info';
    const environment = process.env.NODE_ENV || 'development';
    const appName = process.env.APP_NAME || 'ruralin-backend';
    const enableFileRotation = process.env.LOG_FILE_ROTATION === 'true';
    const logDirectory = process.env.LOG_DIRECTORY || './logs';

    // Configuração base do Pino
    const pinoConfig: pino.LoggerOptions = {
      level,
      base: {
        name: appName,
        env: environment,
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level: (label) => {
          return { level: label };
        },
      },
    };

    // Configurar transports baseado no ambiente e rotação
    const transports: Array<pino.TransportTargetOptions | pino.TransportPipelineOptions> = [];

    // Em desenvolvimento, adicionar pretty print
    if (environment === 'development') {
      transports.push({
        target: 'pino-pretty',
        level: level as pino.Level,
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      });
    }

    // Adicionar rotação de arquivo se habilitada
    if (enableFileRotation && environment !== 'development') {
      transports.push({
        target: 'pino/file',
        level: level as pino.Level,
        options: {
          destination: `${logDirectory}/app.log`,
          mkdir: true,
        },
      });

      // Log de erros em arquivo separado
      transports.push({
        target: 'pino/file',
        level: 'error' as pino.Level,
        options: {
          destination: `${logDirectory}/error.log`,
          mkdir: true,
        },
      });
    }

    // Criar logger com transports ou padrão
    if (transports.length > 0) {
      this.logger = pino(pinoConfig, pino.transport({
        targets: transports as pino.TransportMultiOptions['targets'],
      }));
    } else {
      // Em produção sem rotação, usar JSON puro para melhor performance
      this.logger = pino(pinoConfig);
    }
  }

  /**
   * Log de debug
   */
  debug(message: string, meta?: Record<string, any>): void {
    if (meta) {
      this.logger.debug(meta, message);
    } else {
      this.logger.debug(message);
    }
  }

  /**
   * Log de informação
   */
  info(message: string, meta?: Record<string, any>): void {
    if (meta) {
      this.logger.info(meta, message);
    } else {
      this.logger.info(message);
    }
  }

  /**
   * Log de aviso
   */
  warn(message: string, meta?: Record<string, any>): void {
    if (meta) {
      this.logger.warn(meta, message);
    } else {
      this.logger.warn(message);
    }
  }

  /**
   * Log de erro
   */
  error(message: string, meta?: Record<string, any>): void {
    if (meta) {
      this.logger.error(meta, message);
    } else {
      this.logger.error(message);
    }
  }

  /**
   * Obtém a instância do logger Pino (para casos avançados)
   * 
   * @returns Instância do logger Pino
   */
  getPinoLogger(): Logger {
    return this.logger;
  }
}
