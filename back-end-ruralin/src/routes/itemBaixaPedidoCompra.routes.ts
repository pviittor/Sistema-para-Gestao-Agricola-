import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IItemBaixaPedidoCompraController } from '../controllers/interfaces/IItemBaixaPedidoCompraController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateItemBaixaPedidoCompraDto, UpdateItemBaixaPedidoCompraDto } from '../application/dto/itemBaixaPedidoCompra';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

const getItemBaixaPedidoCompraController = (): IItemBaixaPedidoCompraController => {
  return container.resolve<IItemBaixaPedidoCompraController>(TYPES.IItemBaixaPedidoCompraController);
};

// ===== Rotas de consulta (ANTES de /:id para evitar conflito) =====

router.get('/por-baixa/:baixaPedidoCompraId', requirePermission('baixa_pedido_compra.read'), asyncHandler(async (req, res) => {
  await getItemBaixaPedidoCompraController().findByBaixaPedidoCompra(req, res);
}));

router.get('/por-item-pedido/:itemPedidoCompraId', requirePermission('baixa_pedido_compra.read'), asyncHandler(async (req, res) => {
  await getItemBaixaPedidoCompraController().findByItemPedidoCompra(req, res);
}));

// ===== CRUD =====

router.get('/', requirePermission('baixa_pedido_compra.read'), asyncHandler(async (req, res) => {
  await getItemBaixaPedidoCompraController().index(req, res);
}));

router.get('/:id', requirePermission('baixa_pedido_compra.read'), asyncHandler(async (req, res) => {
  await getItemBaixaPedidoCompraController().show(req, res);
}));

router.post(
  '/',
  requirePermission('baixa_pedido_compra.create'),
  validateDto(CreateItemBaixaPedidoCompraDto),
  asyncHandler(async (req, res) => {
    await getItemBaixaPedidoCompraController().create(req, res);
  })
);

router.put(
  '/:id',
  requirePermission('baixa_pedido_compra.create'),
  validateDtoUpdate(UpdateItemBaixaPedidoCompraDto),
  asyncHandler(async (req, res) => {
    await getItemBaixaPedidoCompraController().update(req, res);
  })
);

router.delete('/:id', requirePermission('baixa_pedido_compra.create'), asyncHandler(async (req, res) => {
  await getItemBaixaPedidoCompraController().delete(req, res);
}));

export default router;
