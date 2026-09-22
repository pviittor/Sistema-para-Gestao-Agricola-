import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IAlertaVencimentoConfigController } from '../controllers/interfaces/IAlertaVencimentoConfigController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateAlertaVencimentoConfigDto } from '../application/dto/alertaVencimentoConfig/CreateAlertaVencimentoConfigDto';
import { UpdateAlertaVencimentoConfigDto } from '../application/dto/alertaVencimentoConfig/UpdateAlertaVencimentoConfigDto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

function getController(): IAlertaVencimentoConfigController {
  return container.resolve<IAlertaVencimentoConfigController>(TYPES.IAlertaVencimentoConfigController);
}

// GET /api/alerta-vencimento-config
router.get('/', requirePermission('alertaVencimentoConfig.read'), asyncHandler(async (req, res) => {
  await getController().index(req, res);
}));

// POST /api/alerta-vencimento-config
router.post('/', requirePermission('alertaVencimentoConfig.create'), validateDto(CreateAlertaVencimentoConfigDto), asyncHandler(async (req, res) => {
  await getController().create(req, res);
}));

// PUT /api/alerta-vencimento-config/:id
router.put('/:id', requirePermission('alertaVencimentoConfig.update'), validateDtoUpdate(UpdateAlertaVencimentoConfigDto), asyncHandler(async (req, res) => {
  await getController().update(req, res);
}));

// DELETE /api/alerta-vencimento-config/:id
router.delete('/:id', requirePermission('alertaVencimentoConfig.delete'), asyncHandler(async (req, res) => {
  await getController().destroy(req, res);
}));

export default router;
