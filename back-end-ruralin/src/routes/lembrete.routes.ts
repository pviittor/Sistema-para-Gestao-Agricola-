import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { ILembreteController } from '../controllers/interfaces/ILembreteController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateLembreteDto, UpdateLembreteDto } from '../application/dto/lembrete';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission, requireRole } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getLembreteController = (): ILembreteController => {
  return container.resolve<ILembreteController>(TYPES.ILembreteController);
};

/**
 * @swagger
 * /api/lembretes:
 *   get:
 *     tags:
 *       - Lembretes
 *     summary: Lista lembretes
 *     description: Retorna uma lista paginada de lembretes do usuário autenticado
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
 *         description: Lista de lembretes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResult'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requireRole('lembrete'), asyncHandler(async (req, res) => {
  await getLembreteController().index(req, res);
}));

/**
 * @swagger
 * /api/lembretes/{id}:
 *   get:
 *     tags:
 *       - Lembretes
 *     summary: Busca lembrete por ID
 *     description: Retorna um lembrete específico por ID
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
 *         description: Lembrete encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Lembrete não encontrado
 */
router.get('/:id', requireRole('lembrete'), asyncHandler(async (req, res) => {
  await getLembreteController().show(req, res);
}));

/**
 * POST /api/lembretes
 * 
 * Cria um novo lembrete.
 * 
 * Body: CreateLembreteDto
 * Response: LembreteDetailResponseDto
 * Permissão necessária: lembrete.create
 */
router.post(
  '/',
  requirePermission('lembrete.create'),
  validateDto(CreateLembreteDto),
  asyncHandler(async (req, res) => {
    await getLembreteController().create(req, res);
  })
);

/**
 * PUT /api/lembretes/:id
 * 
 * Atualiza um lembrete existente.
 * 
 * Body: UpdateLembreteDto
 * Response: LembreteDetailResponseDto
 * Permissão necessária: lembrete.update
 */
router.put(
  '/:id',
  requirePermission('lembrete.update'),
  validateDtoUpdate(UpdateLembreteDto),
  asyncHandler(async (req, res) => {
    await getLembreteController().update(req, res);
  })
);

/**
 * DELETE /api/lembretes/:id
 * 
 * Remove um lembrete.
 * 
 * Permissão necessária: lembrete.delete
 */
router.delete('/:id', requirePermission('lembrete.delete'), asyncHandler(async (req, res) => {
  await getLembreteController().delete(req, res);
}));

export default router;
