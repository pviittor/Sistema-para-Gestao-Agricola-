import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IItemPedidoCompraController } from '../controllers/interfaces/IItemPedidoCompraController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateItemPedidoCompraDto, UpdateItemPedidoCompraDto } from '../application/dto/itemPedidoCompra';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

const getItemPedidoCompraController = (): IItemPedidoCompraController => {
  return container.resolve<IItemPedidoCompraController>(TYPES.IItemPedidoCompraController);
};

// ===== Rotas de consulta (ANTES de /:id para evitar conflito) =====

/**
 * @swagger
 * /api/itensPedidoCompra/por-pedido/{pedidoCompraId}:
 *   get:
 *     tags:
 *       - Itens Pedido de Compra
 *     summary: Lista todos os itens de um pedido de compra
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pedidoCompraId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de itens do pedido
 */
router.get('/por-pedido/:pedidoCompraId', requirePermission('item_pedido_compra.read'), asyncHandler(async (req, res) => {
  await getItemPedidoCompraController().findByPedidoCompra(req, res);
}));

/**
 * @swagger
 * /api/itensPedidoCompra/pendentes/{pedidoCompraId}:
 *   get:
 *     tags:
 *       - Itens Pedido de Compra
 *     summary: Lista itens pendentes de um pedido de compra
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pedidoCompraId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de itens pendentes
 */
router.get('/pendentes/:pedidoCompraId', requirePermission('item_pedido_compra.read'), asyncHandler(async (req, res) => {
  await getItemPedidoCompraController().findPendentesByPedido(req, res);
}));

/**
 * @swagger
 * /api/itensPedidoCompra/por-produto/{produtoId}:
 *   get:
 *     tags:
 *       - Itens Pedido de Compra
 *     summary: Busca itens por produto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: produtoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de itens do produto
 */
router.get('/por-produto/:produtoId', requirePermission('item_pedido_compra.read'), asyncHandler(async (req, res) => {
  await getItemPedidoCompraController().findByProduto(req, res);
}));

/**
 * @swagger
 * /api/itensPedidoCompra/total-comprado/{produtoId}:
 *   get:
 *     tags:
 *       - Itens Pedido de Compra
 *     summary: Consolida quantidade e valor comprado por produto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: produtoId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: dataInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dataFim
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Totais consolidados
 */
router.get('/total-comprado/:produtoId', requirePermission('item_pedido_compra.read'), asyncHandler(async (req, res) => {
  await getItemPedidoCompraController().totalCompradoPorProduto(req, res);
}));

// ===== CRUD =====

/**
 * @swagger
 * /api/itensPedidoCompra:
 *   get:
 *     tags:
 *       - Itens Pedido de Compra
 *     summary: Lista itens de pedido de compra
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de itens de pedido de compra
 */
router.get('/', requirePermission('item_pedido_compra.read'), asyncHandler(async (req, res) => {
  await getItemPedidoCompraController().index(req, res);
}));

/**
 * @swagger
 * /api/itensPedidoCompra/{id}:
 *   get:
 *     tags:
 *       - Itens Pedido de Compra
 *     summary: Busca item de pedido de compra por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item encontrado
 *       404:
 *         description: Item nao encontrado
 */
router.get('/:id', requirePermission('item_pedido_compra.read'), asyncHandler(async (req, res) => {
  await getItemPedidoCompraController().show(req, res);
}));

/**
 * @swagger
 * /api/itensPedidoCompra:
 *   post:
 *     tags:
 *       - Itens Pedido de Compra
 *     summary: Cria um novo item de pedido de compra
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItemPedidoCompraDto'
 *     responses:
 *       201:
 *         description: Item criado com sucesso
 *       400:
 *         description: Erro de validacao
 */
router.post(
  '/',
  requirePermission('item_pedido_compra.create'),
  validateDto(CreateItemPedidoCompraDto),
  asyncHandler(async (req, res) => {
    await getItemPedidoCompraController().create(req, res);
  })
);

/**
 * @swagger
 * /api/itensPedidoCompra/{id}:
 *   put:
 *     tags:
 *       - Itens Pedido de Compra
 *     summary: Atualiza um item de pedido de compra
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateItemPedidoCompraDto'
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 *       404:
 *         description: Item nao encontrado
 */
router.put(
  '/:id',
  requirePermission('item_pedido_compra.update'),
  validateDtoUpdate(UpdateItemPedidoCompraDto),
  asyncHandler(async (req, res) => {
    await getItemPedidoCompraController().update(req, res);
  })
);

/**
 * @swagger
 * /api/itensPedidoCompra/{id}:
 *   delete:
 *     tags:
 *       - Itens Pedido de Compra
 *     summary: Remove um item de pedido de compra
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Item removido com sucesso
 *       404:
 *         description: Item nao encontrado
 */
router.delete('/:id', requirePermission('item_pedido_compra.delete'), asyncHandler(async (req, res) => {
  await getItemPedidoCompraController().delete(req, res);
}));

export default router;
