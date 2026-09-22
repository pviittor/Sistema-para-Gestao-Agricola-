/**
 * CacheMetricsController - Controller para Métricas de Cache
 * 
 * Expõe endpoint opcional para consultar métricas de cache.
 * Útil para monitoramento e debugging.
 * 
 * @example
 * GET /api/cache/metrics - Retorna métricas gerais
 * GET /api/cache/metrics?detailed=true - Retorna métricas detalhadas por chave
 */

import { Request, Response } from 'express';
import { container } from '../core/di/container';
import { TYPES } from '../core/di/types';
import { ICacheMetricsService } from '../core/cache/ICacheMetricsService';

/**
 * Controller para métricas de cache
 */
export class CacheMetricsController {
  /**
   * Obtém métricas de cache
   * 
   * GET /api/cache/metrics
   * Query params:
   * - detailed: boolean (opcional) - Se true, retorna métricas detalhadas por chave
   */
  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metricsService = container.resolve<ICacheMetricsService>(TYPES.ICacheMetricsService);
      const detailed = req.query.detailed === 'true';

      const metrics = metricsService.getMetricsAsJSON(detailed);

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error retrieving cache metrics',
      });
    }
  }

  /**
   * Reseta métricas de cache
   * 
   * POST /api/cache/metrics/reset
   */
  async resetMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metricsService = container.resolve<ICacheMetricsService>(TYPES.ICacheMetricsService);
      metricsService.reset();

      res.json({
        success: true,
        message: 'Cache metrics reset successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error resetting cache metrics',
      });
    }
  }
}
