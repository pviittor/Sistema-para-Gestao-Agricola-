import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IPedidoCompraController } from '../controllers/interfaces/IPedidoCompraController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreatePedidoCompraDto, UpdatePedidoCompraDto } from '../application/dto/pedidoCompra';
import { CreatePedidoCompraCompletoDto } from '../application/dto/pedidoCompra/CreatePedidoCompraCompletoDto';
import { UpdatePedidoCompraCompletoDto } from '../application/dto/pedidoCompra/UpdatePedidoCompraCompletoDto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

const getPedidoCompraController = (): IPedidoCompraController => {
  return container.resolve<IPedidoCompraController>(TYPES.IPedidoCompraController);
};

// ===== Rotas de consulta (ANTES de /:id para evitar conflito) =====

/**
 * @swagger
 * /api/pedidosCompra/por-fornecedor:
 *   get:
 *     tags:
 *       - Pedidos de Compra
 *     summary: Lista pedidos de compra por fornecedor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fornecedorId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [rascunho, aguardando_aprovacao, aprovado, parcialmente_atendido, atendido, cancelado]
 *     responses:
 *       200:
 *         description: Lista de pedidos de compra
 */
router.get('/por-fornecedor', requirePermission('pedido_compra.read'), asyncHandler(async (req, res) => {
  await getPedidoCompraController().findByFornecedor(req, res);
}));

/**
 * @swagger
 * /api/pedidosCompra/por-periodo:
 *   get:
 *     tags:
 *       - Pedidos de Compra
 *     summary: Lista pedidos de compra por periodo de emissao
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de pedidos de compra
 */
router.get('/por-periodo', requirePermission('pedido_compra.read'), asyncHandler(async (req, res) => {
  await getPedidoCompraController().findByPeriodo(req, res);
}));

/**
 * @swagger
 * /api/pedidosCompra/pendentes-entrega:
 *   get:
 *     tags:
 *       - Pedidos de Compra
 *     summary: Lista pedidos pendentes de entrega
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataPrevisaoAte
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de pedidos pendentes
 */
router.get('/pendentes-entrega', requirePermission('pedido_compra.read'), asyncHandler(async (req, res) => {
  await getPedidoCompraController().findPendentesEntrega(req, res);
}));

/**
 * @swagger
 * /api/pedidosCompra/por-numero:
 *   get:
 *     tags:
 *       - Pedidos de Compra
 *     summary: Busca pedido de compra por numero
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: numero
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: empresaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pedido de compra encontrado
 */
router.get('/por-numero', requirePermission('pedido_compra.read'), asyncHandler(async (req, res) => {
  await getPedidoCompraController().findByNumero(req, res);
}));

/**
 * @swagger
 * /api/pedidosCompra/total-por-periodo:
 *   get:
 *     tags:
 *       - Pedidos de Compra
 *     summary: Retorna totais agrupados por fornecedor e periodo
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Totais por periodo
 */
router.get('/total-por-periodo', requirePermission('pedido_compra.read'), asyncHandler(async (req, res) => {
  await getPedidoCompraController().totalPorPeriodo(req, res);
}));

// ===== Master-Detail (completo) =====

/**
 * @swagger
 * /api/pedidosCompra/completo:
 *   post:
 *     tags:
 *       - Pedidos de Compra
 *     summary: Cria um pedido de compra completo com itens em operacao atomica
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePedidoCompraCompletoDto'
 *     responses:
 *       201:
 *         description: Pedido de compra criado com sucesso (com itens)
 *       400:
 *         description: Erro de validacao
 */
router.post(
  '/completo',
  requirePermission('pedido_compra.create'),
  validateDto(CreatePedidoCompraCompletoDto),
  asyncHandler(async (req, res) => {
    await getPedidoCompraController().createCompleto(req, res);
  })
);

// ===== CRUD =====

/**
 * @swagger
 * /api/pedidosCompra:
 *   get:
 *     tags:
 *       - Pedidos de Compra
 *     summary: Lista pedidos de compra
 *     description: Retorna uma lista paginada de pedidos de compra do tenant atual
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
 *         description: Lista de pedidos de compra
 */
router.get('/', requirePermission('pedido_compra.read'), asyncHandler(async (req, res) => {
  await getPedidoCompraController().index(req, res);
}));

/**
 * @swagger
 * /api/pedidosCompra/{id}:
 *   get:
 *     tags:
 *       - Pedidos de Compra
 *     summary: Busca pedido de compra por ID
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
 *         description: Pedido de compra encontrado
 *       404:
 *         description: Pedido de compra nao encontrado
 */
router.get('/:id', requirePermission('pedido_compra.read'), asyncHandler(async (req, res) => {
  await getPedidoCompraController().show(req, res);
}));

/**
 * @swagger
 * /api/pedidosCompra:
 *   post:
 *     tags:
 *       - Pedidos de Compra
 *     summary: Cria um novo pedido de compra
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePedidoCompraDto'
 *     responses:
 *       201:
 *         description: Pedido de compra criado com sucesso
 *       400:
 *         description: Erro de validacao
 */
router.post(
  '/',
  requirePermission('pedido_compra.create'),
  validateDto(CreatePedidoCompraDto),
  asyncHandler(async (req, res) => {
    await getPedidoCompraController().create(req, res);
  })
);

/**
 * @swagger
 * /api/pedidosCompra/{id}/completo:
 *   put:
 *     tags:
 *       - Pedidos de Compra
 *     summary: Atualiza um pedido de compra completo com itens (delete-and-recreate, somente rascunho)
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
 *             $ref: '#/components/schemas/UpdatePedidoCompraCompletoDto'
 *     responses:
 *       200:
 *         description: Pedido de compra atualizado com sucesso (com itens)
 *       400:
 *         description: Erro de validacao ou status nao permite edicao de itens
 *       404:
 *         description: Pedido de compra nao encontrado
 */
router.put(
  '/:id/completo',
  requirePermission('pedido_compra.update'),
  validateDtoUpdate(UpdatePedidoCompraCompletoDto),
  asyncHandler(async (req, res) => {
    await getPedidoCompraController().updateCompleto(req, res);
  })
);

/**
 * @swagger
 * /api/pedidosCompra/{id}:
 *   put:
 *     tags:
 *       - Pedidos de Compra
 *     summary: Atualiza um pedido de compra
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
 *             $ref: '#/components/schemas/UpdatePedidoCompraDto'
 *     responses:
 *       200:
 *         description: Pedido de compra atualizado com sucesso
 *       404:
 *         description: Pedido de compra nao encontrado
 */
router.put(
  '/:id',
  requirePermission('pedido_compra.update'),
  validateDtoUpdate(UpdatePedidoCompraDto),
  asyncHandler(async (req, res) => {
    await getPedidoCompraController().update(req, res);
  })
);

/**
 * @swagger
 * /api/pedidosCompra/{id}:
 *   delete:
 *     tags:
 *       - Pedidos de Compra
 *     summary: Remove um pedido de compra
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
 *         description: Pedido de compra removido com sucesso
 *       404:
 *         description: Pedido de compra nao encontrado
 */
router.delete('/:id', requirePermission('pedido_compra.delete'), asyncHandler(async (req, res) => {
  await getPedidoCompraController().delete(req, res);
}));

// ===== Acoes =====

/**
 * @swagger
 * /api/pedidosCompra/{id}/aprovar:
 *   post:
 *     tags:
 *       - Pedidos de Compra
 *     summary: Aprova um pedido de compra
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
 *         description: Pedido de compra aprovado com sucesso
 *       400:
 *         description: Erro de regra de negocio
 */
router.post('/:id/aprovar', requirePermission('pedido_compra.approve'), asyncHandler(async (req, res) => {
  await getPedidoCompraController().aprovar(req, res);
}));

/**
 * @swagger
 * /api/pedidosCompra/{id}/cancelar:
 *   post:
 *     tags:
 *       - Pedidos de Compra
 *     summary: Cancela um pedido de compra
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
 *             type: object
 *             required:
 *               - motivo
 *             properties:
 *               motivo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pedido de compra cancelado com sucesso
 *       400:
 *         description: Erro de regra de negocio
 */
router.post('/:id/cancelar', requirePermission('pedido_compra.cancel'), asyncHandler(async (req, res) => {
  await getPedidoCompraController().cancelar(req, res);
}));

/**
 * POST /api/pedidosCompra/:id/gerar-financeiro
 * Gera titulos a pagar a partir de um pedido de compra
 */
router.post('/:id/gerar-financeiro', requirePermission('pedido_compra.gerar_financeiro'), asyncHandler(async (req, res) => {
  await getPedidoCompraController().gerarFinanceiro(req, res);
}));

export default router;
