/**
 * ICacheMetricsService - Interface para Monitoramento de Cache
 * 
 * Este serviço fornece métricas de cache, incluindo contadores de hit/miss,
 * taxa de hit, e outras estatísticas úteis para monitoramento.
 * 
 * @example
 * ```typescript
 * const metricsService = container.resolve<ICacheMetricsService>(TYPES.ICacheMetricsService);
 * 
 * // Registrar hit
 * metricsService.recordHit('usuario:getById:1');
 * 
 * // Registrar miss
 * metricsService.recordMiss('usuario:getById:1');
 * 
 * // Obter métricas
 * const metrics = metricsService.getMetrics();
 * ```
 */

/**
 * Métricas de cache
 */
export interface CacheMetrics {
  /**
   * Número total de hits (cache encontrado)
   */
  hits: number;

  /**
   * Número total de misses (cache não encontrado)
   */
  misses: number;

  /**
   * Número total de acessos (hits + misses)
   */
  totalAccesses: number;

  /**
   * Taxa de hit (0.0 a 1.0)
   */
  hitRate: number;

  /**
   * Taxa de miss (0.0 a 1.0)
   */
  missRate: number;

  /**
   * Número de sets (escritas no cache)
   */
  sets: number;

  /**
   * Número de deletes (remoções do cache)
   */
  deletes: number;

  /**
   * Número de invalidações por padrão
   */
  patternInvalidations: number;

  /**
   * Número de invalidações por tag
   */
  tagInvalidations: number;

  /**
   * Timestamp da última métrica registrada
   */
  lastUpdated: number;
}

/**
 * Métricas detalhadas por chave (opcional)
 */
export interface DetailedCacheMetrics extends CacheMetrics {
  /**
   * Métricas por chave (chave -> { hits, misses })
   */
  byKey: Map<string, { hits: number; misses: number }>;
}

/**
 * Interface para CacheMetricsService
 */
export interface ICacheMetricsService {
  /**
   * Registra um hit (cache encontrado)
   * 
   * @param key - Chave do cache (opcional, para métricas detalhadas)
   */
  recordHit(key?: string): void;

  /**
   * Registra um miss (cache não encontrado)
   * 
   * @param key - Chave do cache (opcional, para métricas detalhadas)
   */
  recordMiss(key?: string): void;

  /**
   * Registra uma escrita no cache (set)
   */
  recordSet(): void;

  /**
   * Registra uma remoção do cache (delete)
   */
  recordDelete(): void;

  /**
   * Registra uma invalidação por padrão
   */
  recordPatternInvalidation(): void;

  /**
   * Registra uma invalidação por tag
   */
  recordTagInvalidation(): void;

  /**
   * Obtém métricas atuais
   * 
   * @param detailed - Se true, retorna métricas detalhadas por chave
   * @returns Métricas de cache
   */
  getMetrics(detailed?: boolean): CacheMetrics | DetailedCacheMetrics;

  /**
   * Reseta todas as métricas
   */
  reset(): void;

  /**
   * Obtém métricas em formato JSON (útil para APIs)
   */
  getMetricsAsJSON(detailed?: boolean): any;
}
