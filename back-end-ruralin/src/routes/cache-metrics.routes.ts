/**
 * Rotas para métricas de cache
 * 
 * Endpoints opcionais para monitoramento de cache.
 * Podem ser desabilitados em produção se necessário.
 */

import { Router } from 'express';
import { CacheMetricsController } from '../controllers/CacheMetricsController';

const router = Router();
const controller = new CacheMetricsController();

/**
 * GET /api/cache/metrics
 * Obtém métricas de cache
 * Query params:
 * - detailed: boolean (opcional) - Se true, retorna métricas detalhadas por chave
 */
router.get('/metrics', (req, res) => controller.getMetrics(req, res));

/**
 * POST /api/cache/metrics/reset
 * Reseta métricas de cache
 */
router.post('/metrics/reset', (req, res) => controller.resetMetrics(req, res));

export default router;
