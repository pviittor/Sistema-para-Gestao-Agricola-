import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IItemNotaFiscalController } from '../controllers/interfaces/IItemNotaFiscalController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateItemNotaFiscalDto, UpdateItemNotaFiscalDto } from '../application/dto/itemNotaFiscal';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getItemNotaFiscalController = (): IItemNotaFiscalController => {
  return container.resolve<IItemNotaFiscalController>(TYPES.IItemNotaFiscalController);
};

/**
 * @swagger
 * /api/itensNotaFiscal:
 *   get:
 *     tags:
 *       - Itens de Nota Fiscal
 *     summary: Lista itens de nota fiscal
 *     description: Retorna uma lista paginada de itens de nota fiscal do tenant atual
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero da pagina
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de registros por pagina
 *     responses:
 *       200:
 *         description: Lista de itens de nota fiscal
 *       401:
 *         description: Nao autenticado
 *       403:
 *         description: Sem permissao
 */
router.get('/', requirePermission('item_nota_fiscal.read'), asyncHandler(async (req, res) => {
  await getItemNotaFiscalController().index(req, res);
}));

/**
 * @swagger
 * /api/itensNotaFiscal/nota-fiscal/{notaFiscalId}:
 *   get:
 *     tags:
 *       - Itens de Nota Fiscal
 *     summary: Lista itens de uma nota fiscal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notaFiscalId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de itens da nota fiscal
 */
router.get('/nota-fiscal/:notaFiscalId', requirePermission('item_nota_fiscal.read'), asyncHandler(async (req, res) => {
  await getItemNotaFiscalController().findByNotaFiscal(req, res);
}));

/**
 * @swagger
 * /api/itensNotaFiscal/produto/{produtoId}:
 *   get:
 *     tags:
 *       - Itens de Nota Fiscal
 *     summary: Busca itens por produto
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
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Itens do produto
 */
router.get('/produto/:produtoId', requirePermission('item_nota_fiscal.read'), asyncHandler(async (req, res) => {
  await getItemNotaFiscalController().findByProduto(req, res);
}));

/**
 * @swagger
 * /api/itensNotaFiscal/lote/{numeroLote}:
 *   get:
 *     tags:
 *       - Itens de Nota Fiscal
 *     summary: Rastreabilidade por lote
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: numeroLote
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: produtoId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Itens do lote
 */
router.get('/lote/:numeroLote', requirePermission('item_nota_fiscal.read'), asyncHandler(async (req, res) => {
  await getItemNotaFiscalController().findByLote(req, res);
}));

/**
 * @swagger
 * /api/itensNotaFiscal/serie/{numeroSerie}:
 *   get:
 *     tags:
 *       - Itens de Nota Fiscal
 *     summary: Rastreabilidade por numero de serie
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: numeroSerie
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item encontrado
 *       404:
 *         description: Item nao encontrado
 */
router.get('/serie/:numeroSerie', requirePermission('item_nota_fiscal.read'), asyncHandler(async (req, res) => {
  await getItemNotaFiscalController().findByNumeroSerie(req, res);
}));

/**
 * @swagger
 * /api/itensNotaFiscal/total-vendido/{produtoId}:
 *   get:
 *     tags:
 *       - Itens de Nota Fiscal
 *     summary: Total vendido por produto em um periodo
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
 *         description: Total vendido
 */
router.get('/total-vendido/:produtoId', requirePermission('item_nota_fiscal.read'), asyncHandler(async (req, res) => {
  await getItemNotaFiscalController().totalVendidoPorProduto(req, res);
}));

/**
 * @swagger
 * /api/itensNotaFiscal/{id}:
 *   get:
 *     tags:
 *       - Itens de Nota Fiscal
 *     summary: Busca item de nota fiscal por ID
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
router.get('/:id', requirePermission('item_nota_fiscal.read'), asyncHandler(async (req, res) => {
  await getItemNotaFiscalController().show(req, res);
}));

/**
 * @swagger
 * /api/itensNotaFiscal:
 *   post:
 *     tags:
 *       - Itens de Nota Fiscal
 *     summary: Cria um novo item de nota fiscal
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItemNotaFiscalDto'
 *     responses:
 *       201:
 *         description: Item criado com sucesso
 *       400:
 *         description: Erro de validacao
 */
router.post(
  '/',
  requirePermission('item_nota_fiscal.create'),
  validateDto(CreateItemNotaFiscalDto),
  asyncHandler(async (req, res) => {
    await getItemNotaFiscalController().create(req, res);
  })
);

/**
 * @swagger
 * /api/itensNotaFiscal/{id}:
 *   put:
 *     tags:
 *       - Itens de Nota Fiscal
 *     summary: Atualiza um item de nota fiscal
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
 *             $ref: '#/components/schemas/UpdateItemNotaFiscalDto'
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 *       404:
 *         description: Item nao encontrado
 */
router.put(
  '/:id',
  requirePermission('item_nota_fiscal.update'),
  validateDtoUpdate(UpdateItemNotaFiscalDto),
  asyncHandler(async (req, res) => {
    await getItemNotaFiscalController().update(req, res);
  })
);

/**
 * @swagger
 * /api/itensNotaFiscal/{id}:
 *   delete:
 *     tags:
 *       - Itens de Nota Fiscal
 *     summary: Remove um item de nota fiscal
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
router.delete('/:id', requirePermission('item_nota_fiscal.delete'), asyncHandler(async (req, res) => {
  await getItemNotaFiscalController().delete(req, res);
}));

export default router;
