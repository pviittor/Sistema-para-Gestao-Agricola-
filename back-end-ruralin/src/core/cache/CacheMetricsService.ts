/**
 * CacheMetricsService - Serviço de Monitoramento de Cache
 * 
 * Implementa coleta de métricas de cache, incluindo:
 * - Contadores de hit/miss
 * - Taxa de hit
 * - Estatísticas de operações
 * 
 * @example
 * ```typescript
 * const metricsService = container.resolve<ICacheMetricsService>(TYPES.ICacheMetricsService);
 * 
 * // Registrar eventos
 * metricsService.recordHit();
 * metricsService.recordMiss();
 * 
 * // Obter métricas
 * const metrics = metricsService.getMetrics();
 * console.log(`Hit rate: ${metrics.hitRate * 100}%`);
 * ```
 */

import { injectable, inject } from 'tsyringe';
import { ICacheMetricsService, CacheMetrics, DetailedCacheMetrics } from './ICacheMetricsService';
import { TYPES } from '../di/types';
import { ILogger } from '../logger/ILogger';

/**
 * Serviço de métricas de cache
 */
@injectable()
export class CacheMetricsService implements ICacheMetricsService {
  /**
   * Contador de hits
   */
  private hits: number = 0;

  /**
   * Contador de misses
   */
  private misses: number = 0;

  /**
   * Contador de sets
   */
  private sets: number = 0;

  /**
   * Contador de deletes
   */
  private deletes: number = 0;

  /**
   * Contador de invalidações por padrão
   */
  private patternInvalidations: number = 0;

  /**
   * Contador de invalidações por tag
   */
  private tagInvalidations: number = 0;

  /**
   * Timestamp da última métrica registrada
   */
  private lastUpdated: number = Date.now();

  /**
   * Métricas detalhadas por chave (opcional)
   */
  private byKey: Map<string, { hits: number; misses: number }> = new Map();

  /**
   * Flag para habilitar métricas detalhadas
   */
  private enableDetailedMetrics: boolean;

  constructor(
    @inject(TYPES.ILogger) private logger: ILogger
  ) {
    // Habilitar métricas detalhadas se configurado
    this.enableDetailedMetrics = process.env.CACHE_DETAILED_METRICS === 'true';
  }

  /**
   * Registra um hit (cache encontrado)
   */
  recordHit(key?: string): void {
    this.hits++;
    this.lastUpdated = Date.now();

    if (this.enableDetailedMetrics && key) {
      const keyMetrics = this.byKey.get(key) || { hits: 0, misses: 0 };
      keyMetrics.hits++;
      this.byKey.set(key, keyMetrics);
    }

    // Log periódico (a cada 100 hits)
    if (this.hits % 100 === 0) {
      this.logMetrics();
    }
  }

  /**
   * Registra um miss (cache não encontrado)
   */
  recordMiss(key?: string): void {
    this.misses++;
    this.lastUpdated = Date.now();

    if (this.enableDetailedMetrics && key) {
      const keyMetrics = this.byKey.get(key) || { hits: 0, misses: 0 };
      keyMetrics.misses++;
      this.byKey.set(key, keyMetrics);
    }

    // Log periódico (a cada 100 misses)
    if (this.misses % 100 === 0) {
      this.logMetrics();
    }
  }

  /**
   * Registra uma escrita no cache (set)
   */
  recordSet(): void {
    this.sets++;
    this.lastUpdated = Date.now();
  }

  /**
   * Registra uma remoção do cache (delete)
   */
  recordDelete(): void {
    this.deletes++;
    this.lastUpdated = Date.now();
  }

  /**
   * Registra uma invalidação por padrão
   */
  recordPatternInvalidation(): void {
    this.patternInvalidations++;
    this.lastUpdated = Date.now();
  }

  /**
   * Registra uma invalidação por tag
   */
  recordTagInvalidation(): void {
    this.tagInvalidations++;
    this.lastUpdated = Date.now();
  }

  /**
   * Obtém métricas atuais
   */
  getMetrics(detailed?: boolean): CacheMetrics | DetailedCacheMetrics {
    const totalAccesses = this.hits + this.misses;
    const hitRate = totalAccesses > 0 ? this.hits / totalAccesses : 0;
    const missRate = totalAccesses > 0 ? this.misses / totalAccesses : 0;

    const baseMetrics: CacheMetrics = {
      hits: this.hits,
      misses: this.misses,
      totalAccesses,
      hitRate,
      missRate,
      sets: this.sets,
      deletes: this.deletes,
      patternInvalidations: this.patternInvalidations,
      tagInvalidations: this.tagInvalidations,
      lastUpdated: this.lastUpdated,
    };

    if (detailed && this.enableDetailedMetrics) {
      return {
        ...baseMetrics,
        byKey: this.byKey,
      } as DetailedCacheMetrics;
    }

    return baseMetrics;
  }

  /**
   * Reseta todas as métricas
   */
  reset(): void {
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
    this.patternInvalidations = 0;
    this.tagInvalidations = 0;
    this.lastUpdated = Date.now();
    this.byKey.clear();

    this.logger.info('Cache metrics reset');
  }

  /**
   * Obtém métricas em formato JSON
   */
  getMetricsAsJSON(detailed?: boolean): any {
    const metrics = this.getMetrics(detailed);

    if (detailed && this.enableDetailedMetrics && 'byKey' in metrics) {
      // Converter Map para objeto JSON
      const byKeyObj: Record<string, { hits: number; misses: number }> = {};
      (metrics as DetailedCacheMetrics).byKey.forEach((value, key) => {
        byKeyObj[key] = value;
      });

      return {
        ...metrics,
        byKey: byKeyObj,
      };
    }

    return metrics;
  }

  /**
   * Loga métricas periodicamente
   */
  private logMetrics(): void {
    const metrics = this.getMetrics();
    this.logger.info('Cache metrics', {
      hits: metrics.hits,
      misses: metrics.misses,
      totalAccesses: metrics.totalAccesses,
      hitRate: `${(metrics.hitRate * 100).toFixed(2)}%`,
      missRate: `${(metrics.missRate * 100).toFixed(2)}%`,
      sets: metrics.sets,
      deletes: metrics.deletes,
    });
  }
}
