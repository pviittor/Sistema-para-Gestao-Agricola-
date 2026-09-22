import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { INumeracaoReciboController } from '../controllers/interfaces/INumeracaoReciboController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateNumeracaoReciboDto } from '../application/dto/numeracaoRecibo/CreateNumeracaoReciboDto';
import { UpdateNumeracaoReciboDto } from '../application/dto/numeracaoRecibo/UpdateNumeracaoReciboDto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();
const getController = (): INumeracaoReciboController => {
  return container.resolve<INumeracaoReciboController>(TYPES.INumeracaoReciboController);
};

router.get('/', requirePermission('numeracaoRecibo.read'), asyncHandler(async (req, res) => {
  await getController().index(req, res);
}));
router.get('/:id', requirePermission('numeracaoRecibo.read'), asyncHandler(async (req, res) => {
  await getController().show(req, res);
}));
router.post('/', requirePermission('numeracaoRecibo.create'), validateDto(CreateNumeracaoReciboDto), asyncHandler(async (req, res) => {
  await getController().create(req, res);
}));
router.put('/:id', requirePermission('numeracaoRecibo.update'), validateDtoUpdate(UpdateNumeracaoReciboDto), asyncHandler(async (req, res) => {
  await getController().update(req, res);
}));
router.delete('/:id', requirePermission('numeracaoRecibo.delete'), asyncHandler(async (req, res) => {
  await getController().delete(req, res);
}));

export default router;
