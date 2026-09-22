import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IBaixaPedidoCompraController } from '../controllers/interfaces/IBaixaPedidoCompraController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateBaixaPedidoCompraDto, UpdateBaixaPedidoCompraDto } from '../application/dto/baixaPedidoCompra';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

const getBaixaPedidoCompraController = (): IBaixaPedidoCompraController => {
  return container.resolve<IBaixaPedidoCompraController>(TYPES.IBaixaPedidoCompraController);
};

// ===== Rotas de consulta (ANTES de /:id para evitar conflito) =====

router.get('/por-nota-fiscal/:notaFiscalId', requirePermission('baixa_pedido_compra.read'), asyncHandler(async (req, res) => {
  await getBaixaPedidoCompraController().findByNotaFiscal(req, res);
}));

router.get('/por-pedido/:pedidoCompraId', requirePermission('baixa_pedido_compra.read'), asyncHandler(async (req, res) => {
  await getBaixaPedidoCompraController().findByPedidoCompra(req, res);
}));

router.get('/por-fornecedor', requirePermission('baixa_pedido_compra.read'), asyncHandler(async (req, res) => {
  await getBaixaPedidoCompraController().findByFornecedor(req, res);
}));

router.get('/pendentes', requirePermission('baixa_pedido_compra.read'), asyncHandler(async (req, res) => {
  await getBaixaPedidoCompraController().findPendentes(req, res);
}));

router.get('/por-periodo', requirePermission('baixa_pedido_compra.read'), asyncHandler(async (req, res) => {
  await getBaixaPedidoCompraController().findByPeriodo(req, res);
}));

// ===== CRUD =====

router.get('/', requirePermission('baixa_pedido_compra.read'), asyncHandler(async (req, res) => {
  await getBaixaPedidoCompraController().index(req, res);
}));

router.get('/:id', requirePermission('baixa_pedido_compra.read'), asyncHandler(async (req, res) => {
  await getBaixaPedidoCompraController().show(req, res);
}));

router.post(
  '/',
  requirePermission('baixa_pedido_compra.create'),
  validateDto(CreateBaixaPedidoCompraDto),
  asyncHandler(async (req, res) => {
    await getBaixaPedidoCompraController().create(req, res);
  })
);

router.put(
  '/:id',
  requirePermission('baixa_pedido_compra.create'),
  validateDtoUpdate(UpdateBaixaPedidoCompraDto),
  asyncHandler(async (req, res) => {
    await getBaixaPedidoCompraController().update(req, res);
  })
);

router.delete('/:id', requirePermission('baixa_pedido_compra.create'), asyncHandler(async (req, res) => {
  await getBaixaPedidoCompraController().delete(req, res);
}));

// ===== Acoes =====

router.post('/:id/processar', requirePermission('baixa_pedido_compra.process'), asyncHandler(async (req, res) => {
  await getBaixaPedidoCompraController().processar(req, res);
}));

router.post('/:id/cancelar', requirePermission('baixa_pedido_compra.cancel'), asyncHandler(async (req, res) => {
  await getBaixaPedidoCompraController().cancelar(req, res);
}));

export default router;
