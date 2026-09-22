import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IMovimentoEstoqueController } from '../controllers/interfaces/IMovimentoEstoqueController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateMovimentoEstoqueDto, UpdateMovimentoEstoqueDto } from '../application/dto/movimentoEstoque';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getMovimentoEstoqueController = (): IMovimentoEstoqueController => {
  return container.resolve<IMovimentoEstoqueController>(TYPES.IMovimentoEstoqueController);
};

/**
 * @swagger
 * /api/movimentosEstoque:
 *   get:
 *     tags:
 *       - Movimentos de Estoque
 *     summary: Lista movimentos de estoque
 *     description: Retorna uma lista paginada de movimentos de estoque do tenant atual
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de registros por página
 *     responses:
 *       200:
 *         description: Lista de movimentos de estoque
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('movimentoEstoque.read'), asyncHandler(async (req, res) => {
  await getMovimentoEstoqueController().index(req, res);
}));

/**
 * @swagger
 * /api/movimentosEstoque/saldo/produto/{idProduto}/fazenda/{idFazenda}:
 *   get:
 *     tags:
 *       - Movimentos de Estoque
 *     summary: Consulta saldo do produto na fazenda
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idProduto
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: idFazenda
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Saldo do produto
 */
router.get('/saldo/produto/:idProduto/fazenda/:idFazenda', requirePermission('movimentoEstoque.read'), asyncHandler(async (req, res) => {
  await getMovimentoEstoqueController().getSaldoProduto(req, res);
}));

/**
 * @swagger
 * /api/movimentosEstoque/saldo/operacao:
 *   get:
 *     tags:
 *       - Movimentos de Estoque
 *     summary: Consulta saldo por operação
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idProduto
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: idFazenda
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: operacao
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Saldo por operação
 */
router.get('/saldo/operacao', requirePermission('movimentoEstoque.read'), asyncHandler(async (req, res) => {
  await getMovimentoEstoqueController().getSaldoPorOperacao(req, res);
}));

/**
 * @swagger
 * /api/movimentosEstoque/validar-disponibilidade:
 *   post:
 *     tags:
 *       - Movimentos de Estoque
 *     summary: Valida disponibilidade de produto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idProduto:
 *                 type: integer
 *               idFazenda:
 *                 type: integer
 *               quantidade:
 *                 type: number
 *     responses:
 *       200:
 *         description: Resultado da validação
 */
router.post('/validar-disponibilidade', requirePermission('movimentoEstoque.read'), asyncHandler(async (req, res) => {
  await getMovimentoEstoqueController().validarDisponibilidade(req, res);
}));

/**
 * @swagger
 * /api/movimentosEstoque/relatorios/posicao-estoque:
 *   get:
 *     tags:
 *       - Movimentos de Estoque
 *     summary: Relatório de posição de estoque
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Posição de estoque
 */
router.get('/relatorios/posicao-estoque', requirePermission('movimentoEstoque.read'), asyncHandler(async (req, res) => {
  await getMovimentoEstoqueController().posicaoEstoque(req, res);
}));

/**
 * @swagger
 * /api/movimentosEstoque/relatorios/kardex:
 *   get:
 *     tags:
 *       - Movimentos de Estoque
 *     summary: Relatório Kardex de produtos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dtInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dtFim
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Relatório Kardex
 */
router.get('/relatorios/kardex', requirePermission('movimentoEstoque.read'), asyncHandler(async (req, res) => {
  await getMovimentoEstoqueController().kardex(req, res);
}));

/**
 * @swagger
 * /api/movimentosEstoque/relatorios/posicao-produto/{idProduto}/fazenda/{idFazenda}:
 *   get:
 *     tags:
 *       - Movimentos de Estoque
 *     summary: Posição de estoque de um produto na fazenda
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idProduto
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: idFazenda
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Posição do produto
 */
router.get('/relatorios/posicao-produto/:idProduto/fazenda/:idFazenda', requirePermission('movimentoEstoque.read'), asyncHandler(async (req, res) => {
  await getMovimentoEstoqueController().posicaoProduto(req, res);
}));

/**
 * @swagger
 * /api/movimentosEstoque/relatorios/extrato:
 *   get:
 *     tags:
 *       - Movimentos de Estoque
 *     summary: Extrato de movimentos por data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Extrato de movimentos
 */
router.get('/relatorios/extrato', requirePermission('movimentoEstoque.read'), asyncHandler(async (req, res) => {
  await getMovimentoEstoqueController().extrato(req, res);
}));

/**
 * @swagger
 * /api/movimentosEstoque/historico-precos/produto/{idProduto}:
 *   get:
 *     tags:
 *       - Movimentos de Estoque
 *     summary: Histórico de preços de um produto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idProduto
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Histórico de preços
 */
router.get('/historico-precos/produto/:idProduto', requirePermission('movimentoEstoque.read'), asyncHandler(async (req, res) => {
  await getMovimentoEstoqueController().historicoPrecos(req, res);
}));

/**
 * @swagger
 * /api/movimentosEstoque/{id}:
 *   get:
 *     tags:
 *       - Movimentos de Estoque
 *     summary: Busca movimento de estoque por ID
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
 *         description: Movimento encontrado
 *       404:
 *         description: Movimento não encontrado
 */
router.get('/:id', requirePermission('movimentoEstoque.read'), asyncHandler(async (req, res) => {
  await getMovimentoEstoqueController().show(req, res);
}));

/**
 * @swagger
 * /api/movimentosEstoque:
 *   post:
 *     tags:
 *       - Movimentos de Estoque
 *     summary: Cria um novo movimento de estoque
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMovimentoEstoqueDto'
 *     responses:
 *       201:
 *         description: Movimento criado com sucesso
 *       400:
 *         description: Erro de validação
 */
router.post(
  '/',
  requirePermission('movimentoEstoque.create'),
  validateDto(CreateMovimentoEstoqueDto),
  asyncHandler(async (req, res) => {
    await getMovimentoEstoqueController().create(req, res);
  })
);

/**
 * @swagger
 * /api/movimentosEstoque/{id}:
 *   put:
 *     tags:
 *       - Movimentos de Estoque
 *     summary: Atualiza um movimento de estoque
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
 *             $ref: '#/components/schemas/UpdateMovimentoEstoqueDto'
 *     responses:
 *       200:
 *         description: Movimento atualizado com sucesso
 *       404:
 *         description: Movimento não encontrado
 */
router.put(
  '/:id',
  requirePermission('movimentoEstoque.update'),
  validateDtoUpdate(UpdateMovimentoEstoqueDto),
  asyncHandler(async (req, res) => {
    await getMovimentoEstoqueController().update(req, res);
  })
);

/**
 * @swagger
 * /api/movimentosEstoque/{id}:
 *   delete:
 *     tags:
 *       - Movimentos de Estoque
 *     summary: Remove um movimento de estoque
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
 *         description: Movimento removido com sucesso
 *       404:
 *         description: Movimento não encontrado
 */
router.delete('/:id', requirePermission('movimentoEstoque.delete'), asyncHandler(async (req, res) => {
  await getMovimentoEstoqueController().delete(req, res);
}));

export default router;
