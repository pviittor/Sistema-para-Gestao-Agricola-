import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { ILocalController } from '../controllers/interfaces/ILocalController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateLocalDto, UpdateLocalDto } from '../application/dto/local';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission, requireRole } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getLocalController = (): ILocalController => {
  return container.resolve<ILocalController>(TYPES.ILocalController);
};

/**
 * @swagger
 * /api/locais:
 *   get:
 *     tags:
 *       - Locais
 *     summary: Lista locais
 *     description: Retorna uma lista paginada de locais do tenant atual
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
 *         description: Lista de locais
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResult'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requireRole('local'), asyncHandler(async (req, res) => {
  await getLocalController().index(req, res);
}));

/**
 * @swagger
 * /api/locais/{id}:
 *   get:
 *     tags:
 *       - Locais
 *     summary: Busca local por ID
 *     description: Retorna um local específico por ID
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
 *         description: Local encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Local não encontrado
 */
router.get('/:id', requireRole('local'), asyncHandler(async (req, res) => {
  await getLocalController().show(req, res);
}));

/**
 * POST /api/locais
 * 
 * Cria um novo local.
 * 
 * Body: CreateLocalDto
 * Response: LocalResponseDto
 * Permissão necessária: local.create
 */
router.post(
  '/',
  requirePermission('local.create'),
  validateDto(CreateLocalDto),
  asyncHandler(async (req, res) => {
    await getLocalController().create(req, res);
  })
);

/**
 * PUT /api/locais/:id
 * 
 * Atualiza um local existente.
 * 
 * Body: UpdateLocalDto
 * Response: LocalResponseDto
 * Permissão necessária: local.update
 */
router.put(
  '/:id',
  requirePermission('local.update'),
  validateDtoUpdate(UpdateLocalDto),
  asyncHandler(async (req, res) => {
    await getLocalController().update(req, res);
  })
);

/**
 * DELETE /api/locais/:id
 * 
 * Remove um local.
 * 
 * Permissão necessária: local.delete
 */
router.delete('/:id', requirePermission('local.delete'), asyncHandler(async (req, res) => {
  await getLocalController().delete(req, res);
}));

export default router;
