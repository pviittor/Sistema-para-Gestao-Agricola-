import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { ITipoAtividadeOSController } from '../controllers/interfaces/ITipoAtividadeOSController';
import { validateDto } from '../middleware/validation';
import { CreateTipoAtividadeOSCompletoDto } from '../application/dto/tipoAtividadeOS/CreateTipoAtividadeOSCompletoDto';
import { UpdateTipoAtividadeOSCompletoDto } from '../application/dto/tipoAtividadeOS/UpdateTipoAtividadeOSCompletoDto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

function getTipoAtividadeOSController(): ITipoAtividadeOSController {
  return container.resolve<ITipoAtividadeOSController>(TYPES.ITipoAtividadeOSController);
}

// GET / — Lista tipos de atividade OS com paginação
router.get('/', requirePermission('tipoAtividadeOS.read'), asyncHandler(async (req, res) => {
  await getTipoAtividadeOSController().list(req, res);
}));

// GET /all — Lista todos sem paginação (para selects/combos)
router.get('/all', requirePermission('tipoAtividadeOS.read'), asyncHandler(async (req, res) => {
  await getTipoAtividadeOSController().listAll(req, res);
}));

// GET /:id — Busca por ID
router.get('/:id', requirePermission('tipoAtividadeOS.read'), asyncHandler(async (req, res) => {
  await getTipoAtividadeOSController().getById(req, res);
}));

// POST /completo — Cria tipo de atividade OS completo com campos condicionais
router.post('/completo', requirePermission('tipoAtividadeOS.create'), validateDto(CreateTipoAtividadeOSCompletoDto), asyncHandler(async (req, res) => {
  await getTipoAtividadeOSController().createCompleto(req, res);
}));

// PUT /:id/completo — Atualiza tipo de atividade OS completo com campos condicionais
router.put('/:id/completo', requirePermission('tipoAtividadeOS.update'), validateDto(UpdateTipoAtividadeOSCompletoDto), asyncHandler(async (req, res) => {
  await getTipoAtividadeOSController().updateCompleto(req, res);
}));

// DELETE /:id — Remove tipo de atividade OS
router.delete('/:id', requirePermission('tipoAtividadeOS.delete'), asyncHandler(async (req, res) => {
  await getTipoAtividadeOSController().delete(req, res);
}));

export default router;
