import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { ISubGrupoProdutoController } from '../controllers/interfaces/ISubGrupoProdutoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateSubGrupoProdutoDto, UpdateSubGrupoProdutoDto } from '../application/dto/subGrupoProduto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getSubGrupoProdutoController = (): ISubGrupoProdutoController => {
  return container.resolve<ISubGrupoProdutoController>(TYPES.ISubGrupoProdutoController);
};

/**
 * @swagger
 * /api/subGruposProduto:
 *   get:
 *     tags:
 *       - Subgrupos de Produto
 *     summary: Lista subgrupos de produto
 *     description: Retorna uma lista paginada de subgrupos de produto do tenant atual
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
 *         description: Lista de subgrupos de produto
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
 *                         $ref: '#/components/schemas/SubGrupoProdutoResponseDto'
 *             examples:
 *               success:
 *                 summary: Lista paginada de subgrupos
 *                 value:
 *                   data:
 *                     - id_sub: 1
 *                       tenantId: 1
 *                       descricao_sub: Fertilizantes Nitrogenados
 *                       idGrupo: 1
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
router.get('/', requirePermission('subGrupoProduto.read'), asyncHandler(async (req, res) => {
  await getSubGrupoProdutoController().index(req, res);
}));

/**
 * @swagger
 * /api/subGruposProduto/grupo/{idGrupo}:
 *   get:
 *     tags:
 *       - Subgrupos de Produto
 *     summary: Busca subgrupos por grupo
 *     description: Retorna todos os subgrupos de um grupo de produto específico
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
 *         description: Lista de subgrupos do grupo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubGrupoProdutoResponseDto'
 *             examples:
 *               success:
 *                 summary: Subgrupos encontrados
 *                 value:
 *                   - id_sub: 1
 *                     tenantId: 1
 *                     descricao_sub: Fertilizantes Nitrogenados
 *                     idGrupo: 1
 *                     createdAt: '2026-01-16T12:00:00.000Z'
 *                     updatedAt: '2026-01-16T12:00:00.000Z'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/grupo/:idGrupo', requirePermission('subGrupoProduto.read'), asyncHandler(async (req, res) => {
  await getSubGrupoProdutoController().findByGrupo(req, res);
}));

/**
 * @swagger
 * /api/subGruposProduto/{id}:
 *   get:
 *     tags:
 *       - Subgrupos de Produto
 *     summary: Busca subgrupo por ID
 *     description: Retorna um subgrupo de produto específico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do subgrupo de produto
 *     responses:
 *       200:
 *         description: Subgrupo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubGrupoProdutoResponseDto'
 *             examples:
 *               success:
 *                 summary: Subgrupo encontrado
 *                 value:
 *                   id_sub: 1
 *                   tenantId: 1
 *                   descricao_sub: Fertilizantes Nitrogenados
 *                   idGrupo: 1
 *                   createdAt: '2026-01-16T12:00:00.000Z'
 *                   updatedAt: '2026-01-16T12:00:00.000Z'
 *                   grupo:
 *                     id: 1
 *                     descricao_grupo: Fertilizantes
 *                     abreviacao_grupo: FERT
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Subgrupo não encontrado
 */
router.get('/:id', requirePermission('subGrupoProduto.read'), asyncHandler(async (req, res) => {
  await getSubGrupoProdutoController().show(req, res);
}));

/**
 * @swagger
 * /api/subGruposProduto:
 *   post:
 *     tags:
 *       - Subgrupos de Produto
 *     summary: Cria um novo subgrupo de produto
 *     description: Cria um novo subgrupo de produto no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubGrupoProdutoDto'
 *           examples:
 *             create:
 *               summary: Criar subgrupo de produto
 *               value:
 *                 descricao_sub: Fertilizantes Nitrogenados
 *                 idGrupo: 1
 *     responses:
 *       201:
 *         description: Subgrupo criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubGrupoProdutoResponseDto'
 *             examples:
 *               created:
 *                 summary: Subgrupo criado
 *                 value:
 *                   id_sub: 1
 *                   tenantId: 1
 *                   descricao_sub: Fertilizantes Nitrogenados
 *                   idGrupo: 1
 *                   createdAt: '2026-01-16T12:00:00.000Z'
 *                   updatedAt: '2026-01-16T12:00:00.000Z'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão ou grupo não pertence ao tenant
 */
router.post(
  '/',
  requirePermission('subGrupoProduto.create'),
  validateDto(CreateSubGrupoProdutoDto),
  asyncHandler(async (req, res) => {
    await getSubGrupoProdutoController().create(req, res);
  })
);

/**
 * @swagger
 * /api/subGruposProduto/{id}:
 *   put:
 *     tags:
 *       - Subgrupos de Produto
 *     summary: Atualiza um subgrupo de produto
 *     description: Atualiza um subgrupo de produto existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do subgrupo de produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSubGrupoProdutoDto'
 *           examples:
 *             update:
 *               summary: Atualizar subgrupo
 *               value:
 *                 descricao_sub: Fertilizantes Nitrogenados Atualizado
 *                 idGrupo: 1
 *     responses:
 *       200:
 *         description: Subgrupo atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubGrupoProdutoResponseDto'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Subgrupo não encontrado
 *   delete:
 *     tags:
 *       - Subgrupos de Produto
 *     summary: Remove um subgrupo de produto
 *     description: Remove um subgrupo de produto do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do subgrupo de produto
 *     responses:
 *       204:
 *         description: Subgrupo removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Subgrupo não encontrado
 */
router.put(
  '/:id',
  requirePermission('subGrupoProduto.update'),
  validateDtoUpdate(UpdateSubGrupoProdutoDto),
  asyncHandler(async (req, res) => {
    await getSubGrupoProdutoController().update(req, res);
  })
);

router.delete('/:id', requirePermission('subGrupoProduto.delete'), asyncHandler(async (req, res) => {
  await getSubGrupoProdutoController().delete(req, res);
}));

export default router;
