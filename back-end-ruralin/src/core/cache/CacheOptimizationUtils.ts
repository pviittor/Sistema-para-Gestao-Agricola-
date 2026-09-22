/**
 * CacheOptimizationUtils - Utilitários para Otimização de Cache
 * 
 * Fornece funções auxiliares para análise e otimização de cache,
 * incluindo análise de métricas, recomendações de TTL e otimização de chaves.
 * 
 * @example
 * ```typescript
 * const utils = new CacheOptimizationUtils(metricsService);
 * 
 * // Analisar métricas
 * const analysis = utils.analyzeMetrics();
 * 
 * // Obter recomendações de TTL
 * const recommendations = utils.getTTLRecommendations(analysis);
 * ```
 */

import { ICacheMetricsService, DetailedCacheMetrics } from './ICacheMetricsService';

/**
 * Análise de métricas de cache
 */
export interface CacheAnalysis {
  /**
   * Taxa de hit geral
   */
  overallHitRate: number;

  /**
   * Taxa de miss geral
   */
  overallMissRate: number;

  /**
   * Total de acessos
   */
  totalAccesses: number;

  /**
   * Chaves com maior número de hits
   */
  topHitKeys: Array<{ key: string; hits: number; misses: number; hitRate: number }>;

  /**
   * Chaves com maior número de misses
   */
  topMissKeys: Array<{ key: string; hits: number; misses: number; hitRate: number }>;

  /**
   * Chaves problemáticas (alta taxa de miss)
   */
  problematicKeys: Array<{ key: string; hits: number; misses: number; hitRate: number }>;

  /**
   * Recomendações gerais
   */
  recommendations: string[];
}

/**
 * Recomendação de TTL
 */
export interface TTLRecommendation {
  /**
   * Chave ou padrão de chave
   */
  keyPattern: string;

  /**
   * TTL atual (segundos)
   */
  currentTTL?: number;

  /**
   * TTL recomendado (segundos)
   */
  recommendedTTL: number;

  /**
   * Razão da recomendação
   */
  reason: string;

  /**
   * Prioridade (1 = alta, 2 = média, 3 = baixa)
   */
  priority: number;
}

/**
 * Utilitários para otimização de cache
 */
export class CacheOptimizationUtils {
  constructor(
    private metricsService: ICacheMetricsService
  ) {}

  /**
   * Analisa métricas de cache e retorna insights
   */
  analyzeMetrics(): CacheAnalysis {
    const metrics = this.metricsService.getMetrics(true) as DetailedCacheMetrics;
    
    const overallHitRate = metrics.hitRate;
    const overallMissRate = metrics.missRate;
    const totalAccesses = metrics.totalAccesses;

    // Analisar chaves individuais (se disponível)
    const keyMetrics: Array<{ key: string; hits: number; misses: number; hitRate: number }> = [];
    
    if (metrics.byKey && metrics.byKey.size > 0) {
      metrics.byKey.forEach((value, key) => {
        const total = value.hits + value.misses;
        const hitRate = total > 0 ? value.hits / total : 0;
        keyMetrics.push({
          key,
          hits: value.hits,
          misses: value.misses,
          hitRate,
        });
      });
    }

    // Ordenar por hits (mais acessados)
    const topHitKeys = [...keyMetrics]
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);

    // Ordenar por misses (mais misses)
    const topMissKeys = [...keyMetrics]
      .sort((a, b) => b.misses - a.misses)
      .slice(0, 10);

    // Chaves problemáticas (alta taxa de miss e muitos acessos)
    const problematicKeys = keyMetrics
      .filter(km => km.hitRate < 0.3 && (km.hits + km.misses) > 10)
      .sort((a, b) => {
        // Priorizar por número de misses
        const missDiff = b.misses - a.misses;
        if (missDiff !== 0) return missDiff;
        // Depois por taxa de miss
        return (1 - a.hitRate) - (1 - b.hitRate);
      })
      .slice(0, 10);

    // Gerar recomendações
    const recommendations: string[] = [];

    if (overallHitRate < 0.4) {
      recommendations.push('Taxa de hit baixa (< 40%). Considere aumentar TTLs ou revisar estratégias de invalidação.');
    } else if (overallHitRate < 0.6) {
      recommendations.push('Taxa de hit moderada (40-60%). Há espaço para otimização.');
    } else if (overallHitRate >= 0.8) {
      recommendations.push('Taxa de hit excelente (≥ 80%). Cache está funcionando muito bem.');
    }

    if (problematicKeys.length > 0) {
      recommendations.push(`${problematicKeys.length} chave(s) com alta taxa de miss. Considere aumentar TTLs específicos.`);
    }

    if (metrics.sets > metrics.deletes * 10) {
      recommendations.push('Muitas escritas no cache. Verifique se há escrita excessiva.');
    }

    if (metrics.patternInvalidations > metrics.tagInvalidations * 2) {
      recommendations.push('Muitas invalidações por padrão. Considere usar tags para invalidação mais eficiente.');
    }

    return {
      overallHitRate,
      overallMissRate,
      totalAccesses,
      topHitKeys,
      topMissKeys,
      problematicKeys,
      recommendations,
    };
  }

  /**
   * Obtém recomendações de TTL baseadas em análise
   */
  getTTLRecommendations(analysis: CacheAnalysis): TTLRecommendation[] {
    const recommendations: TTLRecommendation[] = [];

    // Recomendação geral baseada em hit rate
    if (analysis.overallHitRate < 0.4) {
      recommendations.push({
        keyPattern: '*',
        recommendedTTL: 7200, // 2 horas
        reason: 'Taxa de hit baixa. Aumentar TTL geral pode melhorar performance.',
        priority: 1,
      });
    }

    // Recomendações para chaves problemáticas
    analysis.problematicKeys.forEach(keyMetric => {
      // Extrair padrão da chave (ex: 'usuario:getById:1' -> 'usuario:getById:*')
      const keyPattern = this.extractKeyPattern(keyMetric.key);
      
      recommendations.push({
        keyPattern,
        recommendedTTL: 3600, // 1 hora (padrão)
        reason: `Chave "${keyMetric.key}" tem alta taxa de miss (${(keyMetric.hitRate * 100).toFixed(1)}%). Considere aumentar TTL.`,
        priority: 2,
      });
    });

    // Recomendações para chaves muito acessadas
    analysis.topHitKeys.slice(0, 5).forEach(keyMetric => {
      if (keyMetric.hitRate > 0.8) {
        const keyPattern = this.extractKeyPattern(keyMetric.key);
        
        recommendations.push({
          keyPattern,
          recommendedTTL: 7200, // 2 horas
          reason: `Chave muito acessada com boa taxa de hit. Pode se beneficiar de TTL maior.`,
          priority: 3,
        });
      }
    });

    return recommendations;
  }

  /**
   * Extrai padrão de chave (substitui ID por *)
   */
  private extractKeyPattern(key: string): string {
    // Padrões comuns:
    // 'usuario:getById:1' -> 'usuario:getById:*'
    // 'usuario:list:1:10' -> 'usuario:list:*'
    // 'evento:findByLocal:5' -> 'evento:findByLocal:*'
    
    const parts = key.split(':');
    if (parts.length >= 3) {
      // Substituir última parte (geralmente ID) por *
      const pattern = parts.slice(0, -1).join(':') + ':*';
      return pattern;
    }
    
    return key;
  }

  /**
   * Otimiza geração de chaves de cache
   * 
   * Retorna chave otimizada (mais curta, sem informações desnecessárias)
   */
  optimizeCacheKey(key: string): string {
    // Remover espaços e caracteres especiais desnecessários
    let optimized = key.replace(/\s+/g, '').toLowerCase();
    
    // Normalizar separadores
    optimized = optimized.replace(/[:\-_]+/g, ':');
    
    // Remover duplicatas de separadores
    optimized = optimized.replace(/::+/g, ':');
    
    return optimized;
  }

  /**
   * Gera relatório de otimização
   */
  generateOptimizationReport(): string {
    const analysis = this.analyzeMetrics();
    const recommendations = this.getTTLRecommendations(analysis);

    let report = '=== RELATÓRIO DE OTIMIZAÇÃO DE CACHE ===\n\n';
    
    report += `Taxa de Hit Geral: ${(analysis.overallHitRate * 100).toFixed(2)}%\n`;
    report += `Taxa de Miss Geral: ${(analysis.overallMissRate * 100).toFixed(2)}%\n`;
    report += `Total de Acessos: ${analysis.totalAccesses}\n\n`;

    if (analysis.problematicKeys.length > 0) {
      report += `=== CHAVES PROBLEMÁTICAS ===\n`;
      analysis.problematicKeys.forEach(key => {
        report += `- ${key.key}: ${key.hits} hits, ${key.misses} misses (${(key.hitRate * 100).toFixed(1)}% hit rate)\n`;
      });
      report += '\n';
    }

    if (recommendations.length > 0) {
      report += `=== RECOMENDAÇÕES ===\n`;
      recommendations.forEach(rec => {
        report += `[Prioridade ${rec.priority}] ${rec.keyPattern}: TTL ${rec.recommendedTTL}s - ${rec.reason}\n`;
      });
      report += '\n';
    }

    if (analysis.recommendations.length > 0) {
      report += `=== RECOMENDAÇÕES GERAIS ===\n`;
      analysis.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
    }

    return report;
  }
}
