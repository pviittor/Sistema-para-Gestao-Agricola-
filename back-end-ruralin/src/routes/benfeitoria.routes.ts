import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IBenfeitoriaController } from '../controllers/interfaces/IBenfeitoriaController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateBenfeitoriaDto, UpdateBenfeitoriaDto } from '../application/dto/benfeitoria';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getBenfeitoriaController = (): IBenfeitoriaController => {
  return container.resolve<IBenfeitoriaController>(TYPES.IBenfeitoriaController);
};

/**
 * @swagger
 * /api/benfeitorias:
 *   get:
 *     tags:
 *       - Benfeitorias
 *     summary: Lista benfeitorias
 *     description: Retorna uma lista paginada de benfeitorias do tenant atual
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
 *         description: Lista de benfeitorias
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('benfeitoria.read'), asyncHandler(async (req, res) => {
  await getBenfeitoriaController().index(req, res);
}));

/**
 * @swagger
 * /api/benfeitorias/{id}:
 *   get:
 *     tags:
 *       - Benfeitorias
 *     summary: Busca benfeitoria por ID
 *     description: Retorna uma benfeitoria específica por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da benfeitoria
 *     responses:
 *       200:
 *         description: Benfeitoria encontrada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Benfeitoria não encontrada
 */
router.get('/:id', requirePermission('benfeitoria.read'), asyncHandler(async (req, res) => {
  await getBenfeitoriaController().show(req, res);
}));

/**
 * @swagger
 * /api/benfeitorias:
 *   post:
 *     tags:
 *       - Benfeitorias
 *     summary: Cria uma nova benfeitoria
 *     description: Cria uma nova benfeitoria no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBenfeitoriaDto'
 *     responses:
 *       201:
 *         description: Benfeitoria criada com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/',
  requirePermission('benfeitoria.create'),
  validateDto(CreateBenfeitoriaDto),
  asyncHandler(async (req, res) => {
    await getBenfeitoriaController().create(req, res);
  })
);

/**
 * @swagger
 * /api/benfeitorias/{id}:
 *   put:
 *     tags:
 *       - Benfeitorias
 *     summary: Atualiza uma benfeitoria
 *     description: Atualiza uma benfeitoria existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da benfeitoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBenfeitoriaDto'
 *     responses:
 *       200:
 *         description: Benfeitoria atualizada com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Benfeitoria não encontrada
 */
router.put(
  '/:id',
  requirePermission('benfeitoria.update'),
  validateDtoUpdate(UpdateBenfeitoriaDto),
  asyncHandler(async (req, res) => {
    await getBenfeitoriaController().update(req, res);
  })
);

/**
 * @swagger
 * /api/benfeitorias/{id}:
 *   delete:
 *     tags:
 *       - Benfeitorias
 *     summary: Remove uma benfeitoria
 *     description: Remove uma benfeitoria do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da benfeitoria
 *     responses:
 *       204:
 *         description: Benfeitoria removida com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Benfeitoria não encontrada
 */
router.delete('/:id', requirePermission('benfeitoria.delete'), asyncHandler(async (req, res) => {
  await getBenfeitoriaController().delete(req, res);
}));

export default router;
