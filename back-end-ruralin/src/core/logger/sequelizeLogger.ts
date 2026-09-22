/**
 * Sequelize Logger Integration
 * 
 * Configuração de logging para Sequelize usando o Logger Service.
 * Permite registrar queries SQL de forma estruturada.
 */

import { Sequelize } from 'sequelize';
import { container } from '../di';
import { TYPES } from '../di/types';
import { ILogger } from './ILogger';

/**
 * Configuração de logging para Sequelize
 * 
 * @param sequelize - Instância do Sequelize
 */
export function configureSequelizeLogging(sequelize: Sequelize): void {
  const enableSqlLogging = process.env.LOG_SQL === 'true' || process.env.NODE_ENV === 'development';
  
  if (!enableSqlLogging) {
    return;
  }

  try {
    const logger = container.resolve<ILogger>(TYPES.ILogger);

    // Usar type assertion para acessar options
    const sequelizeAny = sequelize as any;
    sequelizeAny.options = sequelizeAny.options || {};
    sequelizeAny.options.logging = (sql: string, timing?: number | object) => {
      // Extrair informações da query
      const queryInfo: Record<string, any> = {
        type: 'sql',
        sql: sql.trim(),
      };

      // Adicionar timing se disponível
      if (timing !== undefined) {
        if (typeof timing === 'number') {
          queryInfo.duration = `${timing}ms`;
          queryInfo.durationMs = timing;
        } else if (typeof timing === 'object') {
          queryInfo.timing = timing;
        }
      }

      // Determinar nível de log baseado na duração
      const duration = typeof timing === 'number' ? timing : 0;
      const isSlowQuery = duration > 100; // Mais de 100ms

      if (isSlowQuery) {
        logger.warn('Slow SQL query detected', queryInfo);
      } else {
        logger.debug('SQL query executed', queryInfo);
      }
    };
  } catch (error) {
    // Fallback se Logger não estiver disponível
    const sequelizeAny = sequelize as any;
    sequelizeAny.options = sequelizeAny.options || {};
    sequelizeAny.options.logging = console.log;
  }
}

/**
 * Hook para logar queries lentas
 * 
 * @param sequelize - Instância do Sequelize
 * @param thresholdMs - Threshold em milissegundos (padrão: 1000ms)
 */
export function setupSlowQueryLogging(
  sequelize: Sequelize,
  thresholdMs: number = 1000
): void {
  const enableSlowQueryLogging = process.env.LOG_SLOW_QUERIES === 'true';

  if (!enableSlowQueryLogging) {
    return;
  }

  try {
    const logger = container.resolve<ILogger>(TYPES.ILogger);

    // Hook antes da query
    sequelize.addHook('beforeQuery', (options: any) => {
      (options as any).__startTime = Date.now();
    });

    // Hook após a query
    sequelize.addHook('afterQuery', (options: any, result: any) => {
      const startTime = (options as any).__startTime;
      if (startTime) {
        const duration = Date.now() - startTime;

        if (duration > thresholdMs) {
          logger.warn('Slow SQL query detected', {
            type: 'slow_query',
            sql: options.sql || 'N/A',
            duration: `${duration}ms`,
            durationMs: duration,
            threshold: `${thresholdMs}ms`,
            bind: options.bind,
          });
        }
      }
    });
  } catch (error) {
    console.warn('Failed to setup slow query logging:', error);
  }
}
