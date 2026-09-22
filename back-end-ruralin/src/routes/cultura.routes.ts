import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { ICulturaController } from '../controllers/interfaces/ICulturaController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateCulturaDto, UpdateCulturaDto } from '../application/dto/cultura';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

const getCulturaController = (): ICulturaController => {
  return container.resolve<ICulturaController>(TYPES.ICulturaController);
};

/**
 * @swagger
 * /api/culturas:
 *   get:
 *     tags:
 *       - Culturas
 *     summary: Lista culturas
 *     description: Retorna uma lista paginada de culturas do tenant atual
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
 *         description: Lista de culturas
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
 *                         $ref: '#/components/schemas/CulturaResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *   post:
 *     tags:
 *       - Culturas
 *     summary: Cria uma nova cultura
 *     description: Cria uma nova cultura no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCulturaDto'
 *           examples:
 *             create:
 *               summary: Criar cultura
 *               value:
 *                 descricao_clt: Soja
 *                 idProduto: 1
 *     responses:
 *       201:
 *         description: Cultura criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CulturaResponseDto'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão ou produto não pertence ao tenant
 */
router.get('/', requirePermission('cultura.read'), asyncHandler(async (req, res) => {
  await getCulturaController().index(req, res);
}));

/**
 * @swagger
 * /api/culturas/produto/{idProduto}:
 *   get:
 *     tags:
 *       - Culturas
 *     summary: Busca culturas por produto
 *     description: Retorna todas as culturas de um produto específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idProduto
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto (id_prod)
 *     responses:
 *       200:
 *         description: Lista de culturas do produto
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CulturaResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/produto/:idProduto', requirePermission('cultura.read'), asyncHandler(async (req, res) => {
  await getCulturaController().findByProduto(req, res);
}));

/**
 * @swagger
 * /api/culturas/{id}:
 *   get:
 *     tags:
 *       - Culturas
 *     summary: Busca cultura por ID
 *     description: Retorna uma cultura específica por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da cultura
 *     responses:
 *       200:
 *         description: Cultura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CulturaResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Cultura não encontrada
 *   put:
 *     tags:
 *       - Culturas
 *     summary: Atualiza uma cultura
 *     description: Atualiza uma cultura existente
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
 *             $ref: '#/components/schemas/UpdateCulturaDto'
 *     responses:
 *       200:
 *         description: Cultura atualizada com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Cultura não encontrada
 *   delete:
 *     tags:
 *       - Culturas
 *     summary: Remove uma cultura
 *     description: Remove uma cultura do sistema
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
 *         description: Cultura removida com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Cultura não encontrada
 */
router.get('/:id', requirePermission('cultura.read'), asyncHandler(async (req, res) => {
  await getCulturaController().show(req, res);
}));

router.post(
  '/',
  requirePermission('cultura.create'),
  validateDto(CreateCulturaDto),
  asyncHandler(async (req, res) => {
    await getCulturaController().create(req, res);
  })
);

router.put(
  '/:id',
  requirePermission('cultura.update'),
  validateDtoUpdate(UpdateCulturaDto),
  asyncHandler(async (req, res) => {
    await getCulturaController().update(req, res);
  })
);

router.delete('/:id', requirePermission('cultura.delete'), asyncHandler(async (req, res) => {
  await getCulturaController().delete(req, res);
}));

export default router;
