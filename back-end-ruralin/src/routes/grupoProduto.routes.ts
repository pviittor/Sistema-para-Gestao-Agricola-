import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IGrupoProdutoController } from '../controllers/interfaces/IGrupoProdutoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateGrupoProdutoDto, UpdateGrupoProdutoDto } from '../application/dto/grupoProduto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getGrupoProdutoController = (): IGrupoProdutoController => {
  return container.resolve<IGrupoProdutoController>(TYPES.IGrupoProdutoController);
};

/**
 * @swagger
 * /api/gruposProduto:
 *   get:
 *     tags:
 *       - Grupos de Produto
 *     summary: Lista grupos de produto
 *     description: Retorna uma lista paginada de grupos de produto do tenant atual
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
 *         description: Lista de grupos de produto
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
 *                         $ref: '#/components/schemas/GrupoProdutoResponseDto'
 *             examples:
 *               success:
 *                 summary: Lista paginada de grupos
 *                 value:
 *                   data:
 *                     - id: 1
 *                       tenantId: 1
 *                       descricao_grupo: Fertilizantes
 *                       abreviacao_grupo: FERT
 *                       createdAt: '2026-01-16T12:00:00.000Z'
 *                       updatedAt: '2026-01-16T12:00:00.000Z'
 *                   page: 1
 *                   limit: 10
 *                   total: 1
 *                   totalPages: 1
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sem permissão
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', requirePermission('grupoProduto.read'), asyncHandler(async (req, res) => {
  await getGrupoProdutoController().index(req, res);
}));

/**
 * @swagger
 * /api/gruposProduto/{id}:
 *   get:
 *     tags:
 *       - Grupos de Produto
 *     summary: Busca grupo de produto por ID
 *     description: Retorna um grupo de produto específico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do grupo de produto
 *     responses:
 *       200:
 *         description: Grupo de produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GrupoProdutoResponseDto'
 *             examples:
 *               success:
 *                 summary: Grupo encontrado
 *                 value:
 *                   id: 1
 *                   tenantId: 1
 *                   descricao_grupo: Fertilizantes
 *                   abreviacao_grupo: FERT
 *                   createdAt: '2026-01-16T12:00:00.000Z'
 *                   updatedAt: '2026-01-16T12:00:00.000Z'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sem permissão
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Grupo de produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', requirePermission('grupoProduto.read'), asyncHandler(async (req, res) => {
  await getGrupoProdutoController().show(req, res);
}));

/**
 * @swagger
 * /api/gruposProduto:
 *   post:
 *     tags:
 *       - Grupos de Produto
 *     summary: Cria um novo grupo de produto
 *     description: Cria um novo grupo de produto no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGrupoProdutoDto'
 *           examples:
 *             create:
 *               summary: Criar grupo de produto
 *               value:
 *                 descricao_grupo: Fertilizantes
 *                 abreviacao_grupo: FERT
 *     responses:
 *       201:
 *         description: Grupo de produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GrupoProdutoResponseDto'
 *             examples:
 *               created:
 *                 summary: Grupo criado
 *                 value:
 *                   id: 1
 *                   tenantId: 1
 *                   descricao_grupo: Fertilizantes
 *                   abreviacao_grupo: FERT
 *                   createdAt: '2026-01-16T12:00:00.000Z'
 *                   updatedAt: '2026-01-16T12:00:00.000Z'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/',
  requirePermission('grupoProduto.create'),
  validateDto(CreateGrupoProdutoDto),
  asyncHandler(async (req, res) => {
    await getGrupoProdutoController().create(req, res);
  })
);

/**
 * @swagger
 * /api/gruposProduto/{id}:
 *   put:
 *     tags:
 *       - Grupos de Produto
 *     summary: Atualiza um grupo de produto
 *     description: Atualiza um grupo de produto existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do grupo de produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGrupoProdutoDto'
 *           examples:
 *             update:
 *               summary: Atualizar grupo de produto
 *               value:
 *                 descricao_grupo: Fertilizantes Atualizado
 *                 abreviacao_grupo: FERT_UPD
 *     responses:
 *       200:
 *         description: Grupo de produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GrupoProdutoResponseDto'
 *             examples:
 *               updated:
 *                 summary: Grupo atualizado
 *                 value:
 *                   id: 1
 *                   tenantId: 1
 *                   descricao_grupo: Fertilizantes Atualizado
 *                   abreviacao_grupo: FERT_UPD
 *                   createdAt: '2026-01-16T12:00:00.000Z'
 *                   updatedAt: '2026-01-16T13:00:00.000Z'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Grupo de produto não encontrado
 *   delete:
 *     tags:
 *       - Grupos de Produto
 *     summary: Remove um grupo de produto
 *     description: Remove um grupo de produto do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do grupo de produto
 *     responses:
 *       204:
 *         description: Grupo de produto removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Grupo de produto não encontrado
 */
router.put(
  '/:id',
  requirePermission('grupoProduto.update'),
  validateDtoUpdate(UpdateGrupoProdutoDto),
  asyncHandler(async (req, res) => {
    await getGrupoProdutoController().update(req, res);
  })
);

router.delete('/:id', requirePermission('grupoProduto.delete'), asyncHandler(async (req, res) => {
  await getGrupoProdutoController().delete(req, res);
}));

export default router;
