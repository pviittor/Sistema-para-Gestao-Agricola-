import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IProdutoBenfeitoriaController } from '../controllers/interfaces/IProdutoBenfeitoriaController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateProdutoBenfeitoriaDto, UpdateProdutoBenfeitoriaDto } from '../application/dto/produtoBenfeitoria';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getProdutoBenfeitoriaController = (): IProdutoBenfeitoriaController => {
  return container.resolve<IProdutoBenfeitoriaController>(TYPES.IProdutoBenfeitoriaController);
};

/**
 * @swagger
 * /api/produtosBenfeitoria:
 *   get:
 *     tags:
 *       - ProdutosBenfeitoria
 *     summary: Lista produtos benfeitoria
 *     description: Retorna uma lista paginada de produtos benfeitoria do tenant atual
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
 *         description: Lista de produtos benfeitoria
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('produtoBenfeitoria.read'), asyncHandler(async (req, res) => {
  await getProdutoBenfeitoriaController().index(req, res);
}));

/**
 * @swagger
 * /api/produtosBenfeitoria/{id}:
 *   get:
 *     tags:
 *       - ProdutosBenfeitoria
 *     summary: Busca produto benfeitoria por ID
 *     description: Retorna um produto benfeitoria específico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto benfeitoria
 *     responses:
 *       200:
 *         description: Produto benfeitoria encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Produto benfeitoria não encontrado
 */
router.get('/:id', requirePermission('produtoBenfeitoria.read'), asyncHandler(async (req, res) => {
  await getProdutoBenfeitoriaController().show(req, res);
}));

/**
 * @swagger
 * /api/produtosBenfeitoria:
 *   post:
 *     tags:
 *       - ProdutosBenfeitoria
 *     summary: Cria um novo produto benfeitoria
 *     description: Cria um novo produto benfeitoria no tenant atual. Valida saldo disponível e gera movimentos de estoque.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProdutoBenfeitoriaDto'
 *     responses:
 *       201:
 *         description: Produto benfeitoria criado com sucesso
 *       400:
 *         description: Erro de validação ou saldo insuficiente
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/',
  requirePermission('produtoBenfeitoria.create'),
  validateDto(CreateProdutoBenfeitoriaDto),
  asyncHandler(async (req, res) => {
    await getProdutoBenfeitoriaController().create(req, res);
  })
);

/**
 * @swagger
 * /api/produtosBenfeitoria/{id}:
 *   put:
 *     tags:
 *       - ProdutosBenfeitoria
 *     summary: Atualiza um produto benfeitoria
 *     description: Atualiza um produto benfeitoria existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto benfeitoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProdutoBenfeitoriaDto'
 *     responses:
 *       200:
 *         description: Produto benfeitoria atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Produto benfeitoria não encontrado
 */
router.put(
  '/:id',
  requirePermission('produtoBenfeitoria.update'),
  validateDtoUpdate(UpdateProdutoBenfeitoriaDto),
  asyncHandler(async (req, res) => {
    await getProdutoBenfeitoriaController().update(req, res);
  })
);

/**
 * @swagger
 * /api/produtosBenfeitoria/{id}:
 *   delete:
 *     tags:
 *       - ProdutosBenfeitoria
 *     summary: Remove um produto benfeitoria
 *     description: Remove um produto benfeitoria e seus movimentos de estoque vinculados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto benfeitoria
 *     responses:
 *       204:
 *         description: Produto benfeitoria removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Produto benfeitoria não encontrado
 */
router.delete('/:id', requirePermission('produtoBenfeitoria.delete'), asyncHandler(async (req, res) => {
  await getProdutoBenfeitoriaController().delete(req, res);
}));

export default router;
