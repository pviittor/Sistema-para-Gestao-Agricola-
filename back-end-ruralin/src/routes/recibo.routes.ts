import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IReciboController } from '../controllers/interfaces/IReciboController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateReciboDto } from '../application/dto/recibo/CreateReciboDto';
import { UpdateReciboDto } from '../application/dto/recibo/UpdateReciboDto';
import { CancelarReciboDto } from '../application/dto/recibo/CancelarReciboDto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();
const getController = (): IReciboController => {
  return container.resolve<IReciboController>(TYPES.IReciboController);
};

// Static routes BEFORE /:id to avoid conflict
router.get('/kpis', requirePermission('recibo.read'), asyncHandler(async (req, res) => {
  await getController().getKpis(req, res);
}));
router.get('/pre-preencher', requirePermission('recibo.read'), asyncHandler(async (req, res) => {
  await getController().prePreencherDeParcela(req, res);
}));
router.get('/', requirePermission('recibo.read'), asyncHandler(async (req, res) => {
  await getController().index(req, res);
}));
router.get('/:id', requirePermission('recibo.read'), asyncHandler(async (req, res) => {
  await getController().show(req, res);
}));
router.get('/:id/pdf', requirePermission('recibo.print'), asyncHandler(async (req, res) => {
  await getController().gerarPdf(req, res);
}));
router.post('/', requirePermission('recibo.create'), validateDto(CreateReciboDto), asyncHandler(async (req, res) => {
  await getController().create(req, res);
}));
router.post('/:id/cancelar', requirePermission('recibo.cancel'), validateDto(CancelarReciboDto), asyncHandler(async (req, res) => {
  await getController().cancelar(req, res);
}));
router.post('/exportar-lote', requirePermission('recibo.exportBatch'), asyncHandler(async (req, res) => {
  await getController().exportarLote(req, res);
}));
router.put('/:id', requirePermission('recibo.update'), validateDtoUpdate(UpdateReciboDto), asyncHandler(async (req, res) => {
  await getController().update(req, res);
}));
router.delete('/:id', requirePermission('recibo.delete'), asyncHandler(async (req, res) => {
  await getController().delete(req, res);
}));

export default router;
