/**
 * CacheSyncService - Serviço de Sincronização de Cache Distribuído
 * 
 * Implementa sincronização de cache entre múltiplas instâncias usando Redis Pub/Sub.
 * Quando uma instância invalida cache, outras instâncias são notificadas.
 * 
 * Características:
 * - Usa Redis Pub/Sub para notificações
 * - Evita loops (instância que originou evento não processa novamente)
 * - Suporta invalidação por chave, padrão e tag
 * - Connection pooling configurado
 * 
 * @example
 * ```typescript
 * const syncService = container.resolve<ICacheSyncService>(TYPES.ICacheSyncService);
 * await syncService.start();
 * 
 * // Notificar outras instâncias
 * await syncService.notifyInvalidation('usuario:getById:1');
 * ```
 */

import { injectable, inject } from 'tsyringe';
import { ICacheSyncService, CacheSyncMessage, CacheSyncEventType } from '../../core/cache/ICacheSyncService';
import { ICacheService } from '../../core/cache/ICacheService';
import { TYPES } from '../../core/di/types';
import { ILogger } from '../../core/logger/ILogger';
import Redis, { RedisOptions } from 'ioredis';
import { randomUUID } from 'crypto';

/**
 * Canal Redis para sincronização de cache
 */
const CACHE_SYNC_CHANNEL = 'cache:sync';

/**
 * Serviço de sincronização de cache distribuído
 */
@injectable()
export class CacheSyncService implements ICacheSyncService {
  /**
   * Cliente Redis para operações normais (publish)
   */
  private publisher: Redis;

  /**
   * Cliente Redis para assinatura (subscribe)
   */
  private subscriber: Redis;

  /**
   * ID único da instância atual
   */
  private instanceId: string;

  /**
   * Flag indicando se o serviço está ativo
   */
  private isActive: boolean = false;

  /**
   * Configuração do Redis
   */
  private redisConfig: string | RedisOptions;

  constructor(
    @inject(TYPES.ICacheService) private cacheService: ICacheService,
    @inject(TYPES.ILogger) private logger: ILogger
  ) {
    // Gerar ID único para esta instância
    this.instanceId = randomUUID();

    // Obter configuração do Redis
    this.redisConfig = this.getRedisConfig();

    // Criar cliente publisher (para enviar notificações)
    this.publisher = this.createRedisClient('publisher');

    // Criar cliente subscriber (para receber notificações)
    this.subscriber = this.createRedisClient('subscriber');
  }

  /**
   * Obtém configuração do Redis
   */
  private getRedisConfig(): string | RedisOptions {
    const url = process.env.REDIS_URL;

    if (url) {
      return url;
    }

    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD;
    const db = parseInt(process.env.REDIS_DB || '0', 10);

    return {
      host,
      port,
      password,
      db,
      // Connection pooling
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };
  }

  /**
   * Cria cliente Redis com configuração apropriada
   */
  private createRedisClient(type: 'publisher' | 'subscriber'): Redis {
    const options: RedisOptions = {
      maxRetriesPerRequest: type === 'subscriber' ? null : 3, // Subscriber não deve retry
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    if (typeof this.redisConfig === 'string') {
      return new Redis(this.redisConfig, options);
    } else {
      return new Redis({
        ...this.redisConfig,
        ...options,
      });
    }
  }

  /**
   * Inicia o serviço de sincronização
   */
  async start(): Promise<void> {
    if (this.isActive) {
      this.logger.warn('CacheSyncService is already active');
      return;
    }

    try {
      // Conectar publisher
      await this.publisher.connect();
      this.logger.info('CacheSyncService publisher connected');

      // Conectar subscriber
      await this.subscriber.connect();
      this.logger.info('CacheSyncService subscriber connected');

      // Subscrever ao canal de sincronização
      await this.subscriber.subscribe(CACHE_SYNC_CHANNEL);
      this.logger.info(`CacheSyncService subscribed to channel: ${CACHE_SYNC_CHANNEL}`);

      // Configurar handler de mensagens
      this.subscriber.on('message', (channel: string, message: string) => {
        if (channel === CACHE_SYNC_CHANNEL) {
          this.handleSyncMessage(message);
        }
      });

      this.isActive = true;
      this.logger.info(`CacheSyncService started (instanceId: ${this.instanceId})`);
    } catch (error: any) {
      this.logger.error(`Failed to start CacheSyncService: ${error.message}`, { error });
      throw error;
    }
  }

  /**
   * Para o serviço de sincronização
   */
  async stop(): Promise<void> {
    if (!this.isActive) {
      return;
    }

    try {
      // Desinscrever do canal
      await this.subscriber.unsubscribe(CACHE_SYNC_CHANNEL);

      // Fechar conexões
      await this.subscriber.quit();
      await this.publisher.quit();

      this.isActive = false;
      this.logger.info('CacheSyncService stopped');
    } catch (error: any) {
      this.logger.error(`Error stopping CacheSyncService: ${error.message}`, { error });
    }
  }

  /**
   * Processa mensagem de sincronização recebida
   */
  private async handleSyncMessage(message: string): Promise<void> {
    try {
      const syncMessage: CacheSyncMessage = JSON.parse(message);

      // Ignorar mensagens da própria instância (evitar loops)
      if (syncMessage.instanceId === this.instanceId) {
        return;
      }

      this.logger.debug(`Received cache sync message: ${syncMessage.type} - ${syncMessage.target}`);

      // Processar evento baseado no tipo
      switch (syncMessage.type) {
        case CacheSyncEventType.INVALIDATE_KEY:
          await this.cacheService.delete(syncMessage.target);
          break;

        case CacheSyncEventType.INVALIDATE_PATTERN:
          await this.cacheService.deleteByPattern(syncMessage.target);
          break;

        case CacheSyncEventType.INVALIDATE_TAG:
          await this.cacheService.invalidateByTag(syncMessage.target);
          break;

        case CacheSyncEventType.CLEAR:
          await this.cacheService.clear();
          break;

        default:
          this.logger.warn(`Unknown cache sync event type: ${syncMessage.type}`);
      }
    } catch (error: any) {
      this.logger.error(`Error handling cache sync message: ${error.message}`, { error, message });
    }
  }

  /**
   * Publica mensagem de sincronização
   */
  private async publishMessage(message: CacheSyncMessage): Promise<void> {
    try {
      const messageStr = JSON.stringify(message);
      await this.publisher.publish(CACHE_SYNC_CHANNEL, messageStr);
      this.logger.debug(`Published cache sync message: ${message.type} - ${message.target}`);
    } catch (error: any) {
      this.logger.error(`Error publishing cache sync message: ${error.message}`, { error, message });
    }
  }

  /**
   * Notifica outras instâncias sobre invalidação de uma chave
   */
  async notifyInvalidation(key: string): Promise<void> {
    if (!this.isActive) {
      return;
    }

    const message: CacheSyncMessage = {
      type: CacheSyncEventType.INVALIDATE_KEY,
      target: key,
      instanceId: this.instanceId,
      timestamp: Date.now(),
    };

    await this.publishMessage(message);
  }

  /**
   * Notifica outras instâncias sobre invalidação por padrão
   */
  async notifyPatternInvalidation(pattern: string): Promise<void> {
    if (!this.isActive) {
      return;
    }

    const message: CacheSyncMessage = {
      type: CacheSyncEventType.INVALIDATE_PATTERN,
      target: pattern,
      instanceId: this.instanceId,
      timestamp: Date.now(),
    };

    await this.publishMessage(message);
  }

  /**
   * Notifica outras instâncias sobre invalidação por tag
   */
  async notifyTagInvalidation(tag: string): Promise<void> {
    if (!this.isActive) {
      return;
    }

    const message: CacheSyncMessage = {
      type: CacheSyncEventType.INVALIDATE_TAG,
      target: tag,
      instanceId: this.instanceId,
      timestamp: Date.now(),
    };

    await this.publishMessage(message);
  }

  /**
   * Notifica outras instâncias sobre limpeza completa do cache
   */
  async notifyClear(): Promise<void> {
    if (!this.isActive) {
      return;
    }

    const message: CacheSyncMessage = {
      type: CacheSyncEventType.CLEAR,
      target: '*',
      instanceId: this.instanceId,
      timestamp: Date.now(),
    };

    await this.publishMessage(message);
  }

  /**
   * Obtém o ID da instância atual
   */
  getInstanceId(): string {
    return this.instanceId;
  }
}
