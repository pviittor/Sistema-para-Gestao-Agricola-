import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IRecorrenciaFinanceiraController } from '../controllers/interfaces/IRecorrenciaFinanceiraController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateRecorrenciaFinanceiraDto } from '../application/dto/recorrenciaFinanceira/CreateRecorrenciaFinanceiraDto';
import { UpdateRecorrenciaFinanceiraDto } from '../application/dto/recorrenciaFinanceira/UpdateRecorrenciaFinanceiraDto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

function getController(): IRecorrenciaFinanceiraController {
  return container.resolve<IRecorrenciaFinanceiraController>(TYPES.IRecorrenciaFinanceiraController);
}

// GET /api/recorrencia-financeira
router.get('/', requirePermission('recorrenciaFinanceira.read'), asyncHandler(async (req, res) => {
  await getController().index(req, res);
}));

// GET /api/recorrencia-financeira/kpis
router.get('/kpis', requirePermission('recorrenciaFinanceira.read'), asyncHandler(async (req, res) => {
  await getController().getKpis(req, res);
}));

// GET /api/recorrencia-financeira/:id
router.get('/:id', requirePermission('recorrenciaFinanceira.read'), asyncHandler(async (req, res) => {
  await getController().show(req, res);
}));

// POST /api/recorrencia-financeira
router.post('/', requirePermission('recorrenciaFinanceira.create'), validateDto(CreateRecorrenciaFinanceiraDto), asyncHandler(async (req, res) => {
  await getController().create(req, res);
}));

// PUT /api/recorrencia-financeira/:id
router.put('/:id', requirePermission('recorrenciaFinanceira.update'), validateDtoUpdate(UpdateRecorrenciaFinanceiraDto), asyncHandler(async (req, res) => {
  await getController().update(req, res);
}));

// PATCH /api/recorrencia-financeira/:id/toggle-ativa
router.patch('/:id/toggle-ativa', requirePermission('recorrenciaFinanceira.update'), asyncHandler(async (req, res) => {
  await getController().toggleAtiva(req, res);
}));

// DELETE /api/recorrencia-financeira/:id
router.delete('/:id', requirePermission('recorrenciaFinanceira.delete'), asyncHandler(async (req, res) => {
  await getController().destroy(req, res);
}));

// GET /api/recorrencia-financeira/:id/lancamentos
router.get('/:id/lancamentos', requirePermission('recorrenciaFinanceira.read'), asyncHandler(async (req, res) => {
  await getController().lancamentos(req, res);
}));

// POST /api/recorrencia-financeira/:id/gerar-agora
router.post('/:id/gerar-agora', requirePermission('recorrenciaFinanceira.create'), asyncHandler(async (req, res) => {
  await getController().gerarAgora(req, res);
}));

// POST /api/recorrencia-financeira/preview
router.post('/preview', requirePermission('recorrenciaFinanceira.read'), asyncHandler(async (req, res) => {
  await getController().preview(req, res);
}));

export default router;
