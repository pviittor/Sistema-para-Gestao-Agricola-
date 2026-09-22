import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IAgingReportController } from '../controllers/interfaces/IAgingReportController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

function getController() {
  return container.resolve<IAgingReportController>(TYPES.IAgingReportController);
}

/**
 * GET /api/aging
 * Gera relatório de aging com filtros via query string
 * ?tipo=PAGAR|RECEBER|AMBOS&idFazenda=&idSafra=&idFornecedorCliente=&dataBase=
 */
router.get('/', asyncHandler((req, res) => getController().gerarAging(req, res)));

export default router;
