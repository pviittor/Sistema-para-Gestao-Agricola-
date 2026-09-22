import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IConfiguracaoReciboController } from '../controllers/interfaces/IConfiguracaoReciboController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateConfiguracaoReciboDto } from '../application/dto/configuracaoRecibo/CreateConfiguracaoReciboDto';
import { UpdateConfiguracaoReciboDto } from '../application/dto/configuracaoRecibo/UpdateConfiguracaoReciboDto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();
const getController = (): IConfiguracaoReciboController => {
  return container.resolve<IConfiguracaoReciboController>(TYPES.IConfiguracaoReciboController);
};

// Static route BEFORE /:id to avoid conflict
router.get('/minha-config', requirePermission('configuracaoRecibo.read'), asyncHandler(async (req, res) => {
  await getController().getMinhaConfig(req, res);
}));
router.get('/', requirePermission('configuracaoRecibo.read'), asyncHandler(async (req, res) => {
  await getController().index(req, res);
}));
router.get('/:id', requirePermission('configuracaoRecibo.read'), asyncHandler(async (req, res) => {
  await getController().show(req, res);
}));
router.post('/', requirePermission('configuracaoRecibo.create'), validateDto(CreateConfiguracaoReciboDto), asyncHandler(async (req, res) => {
  await getController().create(req, res);
}));
router.put('/:id', requirePermission('configuracaoRecibo.update'), validateDtoUpdate(UpdateConfiguracaoReciboDto), asyncHandler(async (req, res) => {
  await getController().update(req, res);
}));
router.delete('/:id', requirePermission('configuracaoRecibo.delete'), asyncHandler(async (req, res) => {
  await getController().delete(req, res);
}));

export default router;
