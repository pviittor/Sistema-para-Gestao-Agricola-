/**
 * RedisCacheService - Implementação de Cache com Redis
 * 
 * Implementação de cache usando Redis para produção.
 * Redis é um banco de dados em memória que permite cache distribuído
 * entre múltiplas instâncias da aplicação.
 * 
 * Características:
 * - Cache distribuído (compartilhado entre instâncias)
 * - Persistência opcional
 * - Alta performance
 * - Suporta TTL (Time To Live)
 * - Suporta padrões para invalidação em massa
 * 
 * @example
 * ```typescript
 * const cacheService = new RedisCacheService();
 * 
 * await cacheService.set('key', { data: 'value' }, 3600);
 * const value = await cacheService.get('key');
 * ```
 */

import { Injectable } from '../../core/di';
import { ICacheService } from '../../core/cache/ICacheService';
import { ICacheSyncService } from '../../core/cache/ICacheSyncService';
import { ICacheMetricsService } from '../../core/cache/ICacheMetricsService';
import Redis, { RedisOptions } from 'ioredis';
import { ILogger } from '../../core/logger/ILogger';
import { TYPES } from '../../core/di/types';
import { inject } from 'tsyringe';
import { container } from '../../core/di/container';

/**
 * Implementação de cache usando Redis
 */
@Injectable()
export class RedisCacheService implements ICacheService {
  private client: Redis;
  private isConnected: boolean = false;
  private syncService: ICacheSyncService | null = null;
  private metricsService: ICacheMetricsService | null = null;

  constructor(
    @inject(TYPES.ILogger) private logger: ILogger
  ) {
    // Tentar resolver syncService opcionalmente (pode não estar disponível em todas as configurações)
    try {
      this.syncService = container.resolve<ICacheSyncService>(TYPES.ICacheSyncService);
    } catch (error) {
      // SyncService não está disponível (Redis pode não estar configurado)
      this.syncService = null;
    }

    // Tentar resolver metricsService opcionalmente
    try {
      this.metricsService = container.resolve<ICacheMetricsService>(TYPES.ICacheMetricsService);
    } catch (error) {
      // MetricsService pode não estar disponível
      this.metricsService = null;
    }
    const redisConfig = this.getRedisConfig();
    
    // ioredis aceita URL string ou opções RedisOptions
    if (typeof redisConfig === 'string') {
      this.client = new Redis(redisConfig, {
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        keepAlive: 30000,
      });
    } else {
      this.client = new Redis({
        ...redisConfig,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        keepAlive: 30000,
      });
    }

    this.setupEventHandlers();
    this.connect();
  }

  /**
   * Obtém configuração do Redis (URL string ou opções)
   * 
   * Configurado com connection pooling para melhor performance
   */
  private getRedisConfig(): string | RedisOptions {
    const url = process.env.REDIS_URL;
    
    if (url) {
      return url; // ioredis aceita URL diretamente como string
    }

    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD;
    const db = parseInt(process.env.REDIS_DB || '0', 10);

    // Connection pooling configuration
    const poolSize = parseInt(process.env.REDIS_POOL_SIZE || '10', 10);
    const connectTimeout = parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10);
    const commandTimeout = parseInt(process.env.REDIS_COMMAND_TIMEOUT || '5000', 10);

    return {
      host,
      port,
      password,
      db,
      // Connection pooling
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      connectTimeout,
      commandTimeout,
      // Retry strategy
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      // Keep alive
      keepAlive: 30000, // 30 segundos
    };
  }

  /**
   * Configura handlers de eventos do Redis
   */
  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      this.logger.info('Redis client connecting...');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      this.logger.info('Redis client ready');
    });

    this.client.on('error', (error: Error) => {
      this.isConnected = false;
      this.logger.error(`Redis client error: ${error.message}`, { error });
    });

    this.client.on('close', () => {
      this.isConnected = false;
      this.logger.warn('Redis client connection closed');
    });

    this.client.on('reconnecting', () => {
      this.logger.info('Redis client reconnecting...');
    });
  }

  /**
   * Verifica conexão com Redis
   * 
   * ioredis conecta automaticamente ao criar a instância.
   * Este método apenas verifica a conexão com ping.
   */
  private async connect(): Promise<void> {
    try {
      // ioredis conecta automaticamente, verificar com ping
      const result = await this.client.ping();
      if (result === 'PONG') {
        this.isConnected = true;
      }
    } catch (error: any) {
      this.logger.error(`Failed to connect to Redis: ${error.message}`, { error });
      // Não lançar erro para permitir fallback
    }
  }

  /**
   * Verifica se está conectado ao Redis
   */
  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.ping();
        this.isConnected = true;
      } catch (error) {
        throw new Error('Redis is not connected');
      }
    }
  }

  /**
   * Recupera um valor do cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      await this.ensureConnected();
      const value = await this.client.get(key);
      
      if (value === null) {
        // Registrar miss
        if (this.metricsService) {
          this.metricsService.recordMiss(key);
        }
        return null;
      }

      // Registrar hit
      if (this.metricsService) {
        this.metricsService.recordHit(key);
      }

      return JSON.parse(value) as T;
    } catch (error: any) {
      this.logger.error(`Error getting cache key "${key}": ${error.message}`, { error, key });
      // Registrar miss em caso de erro
      if (this.metricsService) {
        this.metricsService.recordMiss(key);
      }
      return null; // Retornar null em caso de erro para não quebrar a aplicação
    }
  }

  /**
   * Armazena um valor no cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.ensureConnected();
      const serialized = JSON.stringify(value);

      if (ttl) {
        // setex: set com expiração em segundos
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }

      // Registrar set
      if (this.metricsService) {
        this.metricsService.recordSet();
      }
    } catch (error: any) {
      this.logger.error(`Error setting cache key "${key}": ${error.message}`, { error, key });
      // Não lançar erro para não quebrar a aplicação se cache falhar
    }
  }

  /**
   * Remove um valor do cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.ensureConnected();
      await this.client.del(key);
      
      // Registrar delete
      if (this.metricsService) {
        this.metricsService.recordDelete();
      }
      
      // Notificar outras instâncias sobre invalidação
      if (this.syncService) {
        await this.syncService.notifyInvalidation(key);
      }
    } catch (error: any) {
      this.logger.error(`Error deleting cache key "${key}": ${error.message}`, { error, key });
      // Não lançar erro para não quebrar a aplicação se cache falhar
    }
  }

  /**
   * Remove todas as entradas do cache
   */
  async clear(): Promise<void> {
    try {
      await this.ensureConnected();
      await this.client.flushdb();
      
      // Notificar outras instâncias sobre limpeza
      if (this.syncService) {
        await this.syncService.notifyClear();
      }
    } catch (error: any) {
      this.logger.error(`Error clearing cache: ${error.message}`, { error });
      // Não lançar erro para não quebrar a aplicação se cache falhar
    }
  }

  /**
   * Verifica se uma chave existe no cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      await this.ensureConnected();
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error: any) {
      this.logger.error(`Error checking cache key "${key}": ${error.message}`, { error, key });
      return false; // Retornar false em caso de erro
    }
  }

  /**
   * Remove múltiplas chaves do cache baseado em padrão
   * 
   * Redis suporta padrões usando SCAN e MATCH
   */
  async deleteByPattern(pattern: string): Promise<number> {
    try {
      await this.ensureConnected();
      let deletedCount = 0;
      let cursor = '0';

      do {
        const result = await this.client.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100
        );

        cursor = result[0];
        const keys = result[1];

        if (keys.length > 0) {
          const deleted = await this.client.del(...keys);
          deletedCount += deleted;
        }
      } while (cursor !== '0');

      // Registrar invalidação por padrão
      if (this.metricsService && deletedCount > 0) {
        this.metricsService.recordPatternInvalidation();
      }

      // Notificar outras instâncias sobre invalidação por padrão
      if (this.syncService && deletedCount > 0) {
        await this.syncService.notifyPatternInvalidation(pattern);
      }

      return deletedCount;
    } catch (error: any) {
      this.logger.error(`Error deleting cache pattern "${pattern}": ${error.message}`, { error, pattern });
      return 0; // Retornar 0 em caso de erro
    }
  }

  /**
   * Fecha conexão com Redis (útil para testes e shutdown)
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  /**
   * Obtém estatísticas do Redis (útil para debugging)
   */
  async getStats(): Promise<{ connected: boolean; info?: any }> {
    try {
      await this.ensureConnected();
      const info = await this.client.info('stats');
      return {
        connected: this.isConnected,
        info: this.parseInfo(info),
      };
    } catch (error: any) {
      return {
        connected: false,
      };
    }
  }

  /**
   * Parse Redis INFO command output
   */
  private parseInfo(info: string): Record<string, string> {
    const result: Record<string, string> = {};
    const lines = info.split('\r\n');
    
    for (const line of lines) {
      if (line && !line.startsWith('#') && line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Armazena um valor no cache com tags
   * 
   * Usa Redis Sets para armazenar mapeamento de tags para chaves.
   * Cada tag tem um Set com todas as chaves que possuem essa tag.
   */
  async setWithTags(key: string, value: any, ttl?: number, tags?: string[]): Promise<void> {
    try {
      await this.ensureConnected();
      
      // Armazenar valor normalmente
      await this.set(key, value, ttl);

      // Se tags foram fornecidas, armazenar mapeamento
      if (tags && tags.length > 0) {
        const pipeline = this.client.pipeline();
        
        for (const tag of tags) {
          // Adicionar chave ao Set da tag
          // Formato: tag:cache:{tag} -> Set de chaves
          const tagKey = `tag:cache:${tag}`;
          pipeline.sadd(tagKey, key);
          
          // Se TTL foi fornecido, aplicar TTL também no Set da tag
          // (usar TTL maior para garantir que tag não expire antes da chave)
          if (ttl) {
            pipeline.expire(tagKey, ttl + 60); // TTL + 1 minuto de margem
          }
        }
        
        await pipeline.exec();
      }
    } catch (error: any) {
      this.logger.error(`Error setting cache key "${key}" with tags: ${error.message}`, { error, key, tags });
    }
  }

  /**
   * Invalida todas as entradas do cache que possuem uma tag específica
   */
  async invalidateByTag(tag: string): Promise<number> {
    try {
      await this.ensureConnected();
      const tagKey = `tag:cache:${tag}`;
      
      // Obter todas as chaves com essa tag
      const keys = await this.client.smembers(tagKey);
      
      if (keys.length === 0) {
        return 0;
      }

      // Deletar todas as chaves
      const deleted = await this.client.del(...keys);
      
      // Deletar o Set da tag
      await this.client.del(tagKey);

      this.logger.debug(`Invalidated ${deleted} cache entries by tag: ${tag}`);
      
      // Registrar invalidação por tag
      if (this.metricsService && deleted > 0) {
        this.metricsService.recordTagInvalidation();
      }
      
      // Notificar outras instâncias sobre invalidação por tag
      if (this.syncService && deleted > 0) {
        await this.syncService.notifyTagInvalidation(tag);
      }
      
      return deleted;
    } catch (error: any) {
      this.logger.error(`Error invalidating cache by tag "${tag}": ${error.message}`, { error, tag });
      return 0;
    }
  }

  /**
   * Invalida todas as entradas do cache que possuem qualquer uma das tags fornecidas
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    let totalDeleted = 0;

    for (const tag of tags) {
      const deleted = await this.invalidateByTag(tag);
      totalDeleted += deleted;
    }

    return totalDeleted;
  }
}
