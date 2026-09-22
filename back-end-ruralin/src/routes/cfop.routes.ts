import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { ICfopController } from '../controllers/interfaces/ICfopController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateCfopDto, UpdateCfopDto } from '../application/dto/cfop';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getCfopController = (): ICfopController => {
  return container.resolve<ICfopController>(TYPES.ICfopController);
};

router.get('/', requirePermission('cfop.read'), asyncHandler(async (req, res) => {
  await getCfopController().index(req, res);
}));

router.get('/all', requirePermission('cfop.read'), asyncHandler(async (req, res) => {
  await getCfopController().listAll(req, res);
}));

router.get('/:id', requirePermission('cfop.read'), asyncHandler(async (req, res) => {
  await getCfopController().show(req, res);
}));

router.post(
  '/',
  requirePermission('cfop.create'),
  validateDto(CreateCfopDto),
  asyncHandler(async (req, res) => {
    await getCfopController().create(req, res);
  })
);

router.put(
  '/:id',
  requirePermission('cfop.update'),
  validateDtoUpdate(UpdateCfopDto),
  asyncHandler(async (req, res) => {
    await getCfopController().update(req, res);
  })
);

router.delete('/:id', requirePermission('cfop.delete'), asyncHandler(async (req, res) => {
  await getCfopController().delete(req, res);
}));

export default router;
