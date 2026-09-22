import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { INumeracaoNfeController } from '../controllers/interfaces/INumeracaoNfeController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateNumeracaoNfeDto } from '../application/dto/numeracaoNfe/CreateNumeracaoNfeDto';
import { UpdateNumeracaoNfeDto } from '../application/dto/numeracaoNfe/UpdateNumeracaoNfeDto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

const getNumeracaoNfeController = (): INumeracaoNfeController => {
  return container.resolve<INumeracaoNfeController>(TYPES.INumeracaoNfeController);
};

// Consulta de próximo número (ANTES de /:id)
router.get(
  '/proximo',
  requirePermission('numeracao_nfe.read'),
  asyncHandler(async (req, res) => {
    await getNumeracaoNfeController().consultarProximo(req, res);
  })
);

// CRUD
router.get(
  '/',
  requirePermission('numeracao_nfe.read'),
  asyncHandler(async (req, res) => {
    await getNumeracaoNfeController().index(req, res);
  })
);

router.get(
  '/:id',
  requirePermission('numeracao_nfe.read'),
  asyncHandler(async (req, res) => {
    await getNumeracaoNfeController().show(req, res);
  })
);

router.post(
  '/',
  requirePermission('numeracao_nfe.create'),
  validateDto(CreateNumeracaoNfeDto),
  asyncHandler(async (req, res) => {
    await getNumeracaoNfeController().create(req, res);
  })
);

router.put(
  '/:id',
  requirePermission('numeracao_nfe.update'),
  validateDtoUpdate(UpdateNumeracaoNfeDto),
  asyncHandler(async (req, res) => {
    await getNumeracaoNfeController().update(req, res);
  })
);

router.delete(
  '/:id',
  requirePermission('numeracao_nfe.delete'),
  asyncHandler(async (req, res) => {
    await getNumeracaoNfeController().delete(req, res);
  })
);

export default router;
