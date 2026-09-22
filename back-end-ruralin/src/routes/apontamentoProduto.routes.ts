import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IApontamentoProdutoController } from '../controllers/interfaces/IApontamentoProdutoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateApontamentoProdutoDto, UpdateApontamentoProdutoDto } from '../application/dto/apontamentoProduto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getApontamentoProdutoController = (): IApontamentoProdutoController => {
  return container.resolve<IApontamentoProdutoController>(TYPES.IApontamentoProdutoController);
};

/**
 * @swagger
 * /api/apontamentosProduto:
 *   get:
 *     tags:
 *       - ApontamentosProduto
 *     summary: Lista apontamentos de produto
 *     description: Retorna uma lista paginada de apontamentos de produto do tenant atual
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
 *         description: Lista de apontamentos de produto
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('apontamentoProduto.read'), asyncHandler(async (req, res) => {
  await getApontamentoProdutoController().index(req, res);
}));

/**
 * @swagger
 * /api/apontamentosProduto/{id}:
 *   get:
 *     tags:
 *       - ApontamentosProduto
 *     summary: Busca apontamento de produto por ID
 *     description: Retorna um apontamento de produto específico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do apontamento de produto
 *     responses:
 *       200:
 *         description: Apontamento de produto encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Apontamento de produto não encontrado
 */
router.get('/:id', requirePermission('apontamentoProduto.read'), asyncHandler(async (req, res) => {
  await getApontamentoProdutoController().show(req, res);
}));

/**
 * @swagger
 * /api/apontamentosProduto:
 *   post:
 *     tags:
 *       - ApontamentosProduto
 *     summary: Cria um novo apontamento de produto
 *     description: Cria um novo apontamento de produto no tenant atual. Gera automaticamente um MovimentoEstoque.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateApontamentoProdutoDto'
 *     responses:
 *       201:
 *         description: Apontamento de produto criado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/',
  requirePermission('apontamentoProduto.create'),
  validateDto(CreateApontamentoProdutoDto),
  asyncHandler(async (req, res) => {
    await getApontamentoProdutoController().create(req, res);
  })
);

/**
 * @swagger
 * /api/apontamentosProduto/{id}:
 *   put:
 *     tags:
 *       - ApontamentosProduto
 *     summary: Atualiza um apontamento de produto
 *     description: Atualiza um apontamento de produto existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do apontamento de produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateApontamentoProdutoDto'
 *     responses:
 *       200:
 *         description: Apontamento de produto atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Apontamento de produto não encontrado
 */
router.put(
  '/:id',
  requirePermission('apontamentoProduto.update'),
  validateDtoUpdate(UpdateApontamentoProdutoDto),
  asyncHandler(async (req, res) => {
    await getApontamentoProdutoController().update(req, res);
  })
);

/**
 * @swagger
 * /api/apontamentosProduto/{id}:
 *   delete:
 *     tags:
 *       - ApontamentosProduto
 *     summary: Remove um apontamento de produto
 *     description: Remove um apontamento de produto do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do apontamento de produto
 *     responses:
 *       204:
 *         description: Apontamento de produto removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Apontamento de produto não encontrado
 */
router.delete('/:id', requirePermission('apontamentoProduto.delete'), asyncHandler(async (req, res) => {
  await getApontamentoProdutoController().delete(req, res);
}));

export default router;
