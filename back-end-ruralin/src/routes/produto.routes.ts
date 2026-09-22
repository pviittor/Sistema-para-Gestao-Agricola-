import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IProdutoController } from '../controllers/interfaces/IProdutoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateProdutoDto, UpdateProdutoDto } from '../application/dto/produto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

const getProdutoController = (): IProdutoController => {
  return container.resolve<IProdutoController>(TYPES.IProdutoController);
};

/**
 * @swagger
 * /api/produtos:
 *   get:
 *     tags:
 *       - Produtos
 *     summary: Lista produtos
 *     description: Retorna uma lista paginada de produtos do tenant atual
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
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResult'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProdutoResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *   post:
 *     tags:
 *       - Produtos
 *     summary: Cria um novo produto
 *     description: Cria um novo produto no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProdutoDto'
 *           examples:
 *             create:
 *               summary: Criar produto
 *               value:
 *                 descricao_prod: Fertilizante NPK 10-10-10
 *                 idUnidadeMedida: 1
 *                 pesoliquido_prod: 50.0
 *                 idGrupo: 1
 *                 idSubGrupo: 1
 *                 precomedio_prod: 150.00
 *                 valorultimaentrada_prod: 145.50
 *                 combustivel_prod: false
 *                 custoUltimoCusto_prod: false
 *                 valorUltimoCusto_prod: 145.50
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProdutoResponseDto'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão ou entidades relacionadas não pertencem ao tenant
 */
router.get('/', requirePermission('produto.read'), asyncHandler(async (req, res) => {
  await getProdutoController().index(req, res);
}));

// GET /all — Lista todos sem paginação (para selects/combos)
router.get('/all', requirePermission('produto.read'), asyncHandler(async (req, res) => {
  await getProdutoController().listAll(req, res);
}));

/**
 * @swagger
 * /api/produtos/grupo/{idGrupo}:
 *   get:
 *     tags:
 *       - Produtos
 *     summary: Busca produtos por grupo
 *     description: Retorna todos os produtos de um grupo específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idGrupo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do grupo de produto
 *     responses:
 *       200:
 *         description: Lista de produtos do grupo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProdutoResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/grupo/:idGrupo', requirePermission('produto.read'), asyncHandler(async (req, res) => {
  await getProdutoController().findByGrupo(req, res);
}));

/**
 * @swagger
 * /api/produtos/subgrupo/{idSubGrupo}:
 *   get:
 *     tags:
 *       - Produtos
 *     summary: Busca produtos por subgrupo
 *     description: Retorna todos os produtos de um subgrupo específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idSubGrupo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do subgrupo de produto
 *     responses:
 *       200:
 *         description: Lista de produtos do subgrupo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProdutoResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/subgrupo/:idSubGrupo', requirePermission('produto.read'), asyncHandler(async (req, res) => {
  await getProdutoController().findBySubGrupo(req, res);
}));

/**
 * @swagger
 * /api/produtos/{id}:
 *   get:
 *     tags:
 *       - Produtos
 *     summary: Busca produto por ID
 *     description: Retorna um produto específico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto (id_prod)
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProdutoResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Produto não encontrado
 *   put:
 *     tags:
 *       - Produtos
 *     summary: Atualiza um produto
 *     description: Atualiza um produto existente
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
 *             $ref: '#/components/schemas/UpdateProdutoDto'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Produto não encontrado
 *   delete:
 *     tags:
 *       - Produtos
 *     summary: Remove um produto
 *     description: Remove um produto do sistema
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
 *         description: Produto removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Produto não encontrado
 */
router.get('/:id', requirePermission('produto.read'), asyncHandler(async (req, res) => {
  await getProdutoController().show(req, res);
}));

router.post(
  '/',
  requirePermission('produto.create'),
  validateDto(CreateProdutoDto),
  asyncHandler(async (req, res) => {
    await getProdutoController().create(req, res);
  })
);

router.put(
  '/:id',
  requirePermission('produto.update'),
  validateDtoUpdate(UpdateProdutoDto),
  asyncHandler(async (req, res) => {
    await getProdutoController().update(req, res);
  })
);

router.delete('/:id', requirePermission('produto.delete'), asyncHandler(async (req, res) => {
  await getProdutoController().delete(req, res);
}));

export default router;
