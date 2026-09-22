/**
 * InMemoryCacheService - Implementação de Cache em Memória
 * 
 * Implementação simples de cache em memória para desenvolvimento e testes.
 * Em produção, deve ser substituída por RedisCacheService (T15.1).
 * 
 * Características:
 * - Armazena dados em memória (Map)
 * - Suporta TTL (Time To Live)
 * - Limpeza automática de entradas expiradas
 * - Thread-safe (para uso em Node.js single-threaded)
 * 
 * @example
 * ```typescript
 * const cacheService = new InMemoryCacheService();
 * 
 * await cacheService.set('key', { data: 'value' }, 3600);
 * const value = await cacheService.get('key');
 * ```
 */

import { ICacheService } from '../../core/cache/ICacheService';
import { ICacheMetricsService } from '../../core/cache/ICacheMetricsService';
import { container } from '../../core/di/container';
import { TYPES } from '../../core/di/types';

/**
 * Entrada do cache com metadados
 */
interface CacheEntry<T> {
  value: T;
  expiresAt?: number; // Timestamp em milissegundos
  tags?: string[]; // Tags associadas à entrada
}

/**
 * Implementação de cache em memória
 */
export class InMemoryCacheService implements ICacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map(); // Tag -> Set de chaves
  private cleanupInterval: NodeJS.Timeout | null = null;
  private metricsService: ICacheMetricsService | null = null;

  constructor() {
    // Tentar resolver metricsService opcionalmente
    try {
      this.metricsService = container.resolve<ICacheMetricsService>(TYPES.ICacheMetricsService);
    } catch (error) {
      // MetricsService pode não estar disponível
      this.metricsService = null;
    }

    // Iniciar limpeza automática de entradas expiradas a cada minuto
    this.startCleanup();
  }

  /**
   * Inicia limpeza automática de entradas expiradas
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60000); // Limpar a cada 1 minuto
  }

  /**
   * Para limpeza automática (útil para testes)
   */
  public stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Remove entradas expiradas do cache
   */
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Recupera um valor do cache
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      // Registrar miss
      if (this.metricsService) {
        this.metricsService.recordMiss(key);
      }
      return null;
    }

    // Verificar se entrada expirou
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      // Registrar miss (entrada expirada)
      if (this.metricsService) {
        this.metricsService.recordMiss(key);
      }
      return null;
    }

    // Registrar hit
    if (this.metricsService) {
      this.metricsService.recordHit(key);
    }

    return entry.value as T;
  }

  /**
   * Armazena um valor no cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const entry: CacheEntry<any> = {
      value,
    };

    // Se TTL foi fornecido, calcular timestamp de expiração
    if (ttl) {
      entry.expiresAt = Date.now() + (ttl * 1000); // Converter segundos para milissegundos
    }

    this.cache.set(key, entry);

    // Registrar set
    if (this.metricsService) {
      this.metricsService.recordSet();
    }
  }

  /**
   * Armazena um valor no cache com tags
   */
  async setWithTags(key: string, value: any, ttl?: number, tags?: string[]): Promise<void> {
    const entry: CacheEntry<any> = {
      value,
      tags: tags || [],
    };

    // Se TTL foi fornecido, calcular timestamp de expiração
    if (ttl) {
      entry.expiresAt = Date.now() + (ttl * 1000);
    }

    this.cache.set(key, entry);

    // Atualizar índice de tags
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(key);
      }
    }
  }

  /**
   * Remove um valor do cache
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);

    // Registrar delete
    if (this.metricsService) {
      this.metricsService.recordDelete();
    }
  }

  /**
   * Remove todas as entradas do cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.tagIndex.clear();

    // Registrar múltiplos deletes (aproximação)
    if (this.metricsService) {
      // Não temos contagem exata, mas podemos registrar como delete
      this.metricsService.recordDelete();
    }
  }

  /**
   * Verifica se uma chave existe no cache
   */
  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Verificar se entrada expirou
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove múltiplas chaves do cache baseado em padrão
   * 
   * Suporta padrões simples:
   * - 'prefix:*' - Remove todas as chaves que começam com 'prefix:'
   * - '*suffix' - Remove todas as chaves que terminam com 'suffix'
   * - '*pattern*' - Remove todas as chaves que contêm 'pattern'
   */
  async deleteByPattern(pattern: string): Promise<number> {
    let deletedCount = 0;

    // Converter padrão simples em regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');

    const regex = new RegExp(`^${regexPattern}$`);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    // Registrar invalidação por padrão
    if (this.metricsService && deletedCount > 0) {
      this.metricsService.recordPatternInvalidation();
    }

    return deletedCount;
  }

  /**
   * Invalida todas as entradas do cache que possuem uma tag específica
   */
  async invalidateByTag(tag: string): Promise<number> {
    const keys = this.tagIndex.get(tag);
    
    if (!keys || keys.size === 0) {
      return 0;
    }

    let deletedCount = 0;
    const keysArray = Array.from(keys);

    // Deletar todas as chaves com essa tag
    for (const key of keysArray) {
      if (this.cache.delete(key)) {
        deletedCount++;
      }
    }

    // Remover tag do índice
    this.tagIndex.delete(tag);

    // Registrar invalidação por tag
    if (this.metricsService && deletedCount > 0) {
      this.metricsService.recordTagInvalidation();
    }

    return deletedCount;
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

  /**
   * Retorna estatísticas do cache (útil para debugging)
   */
  getStats(): { size: number; keys: string[]; tags: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      tags: Array.from(this.tagIndex.keys()),
    };
  }
}
