import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IEventoController } from '../controllers/interfaces/IEventoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateEventoDto, UpdateEventoDto } from '../application/dto/evento';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getEventoController = (): IEventoController => {
  return container.resolve<IEventoController>(TYPES.IEventoController);
};

/**
 * @swagger
 * /api/eventos:
 *   get:
 *     tags:
 *       - Eventos
 *     summary: Lista eventos
 *     description: Retorna uma lista paginada de eventos do usuário autenticado
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
 *         description: Lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResult'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *   post:
 *     tags:
 *       - Eventos
 *     summary: Cria um novo evento
 *     description: Cria um novo evento agendado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - descricao
 *               - data
 *               - horario_inicio
 *               - horario_fim
 *               - localId
 *             properties:
 *               titulo:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 example: Reunião de planejamento
 *               descricao:
 *                 type: string
 *                 example: Reunião para planejar safra 2026
 *               data:
 *                 type: string
 *                 format: date
 *                 example: '2026-02-01'
 *               horario_inicio:
 *                 type: string
 *                 format: time
 *                 example: '09:00:00'
 *               horario_fim:
 *                 type: string
 *                 format: time
 *                 example: '11:00:00'
 *               localId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Evento criado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão ou local não pertence ao tenant
 */
router.get('/', requirePermission('evento.read'), asyncHandler(async (req, res) => {
  await getEventoController().index(req, res);
}));

/**
 * @swagger
 * /api/eventos/{id}:
 *   get:
 *     tags:
 *       - Eventos
 *     summary: Busca evento por ID
 *     description: Retorna um evento específico por ID
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
 *         description: Evento encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Evento não encontrado
 */
router.get('/:id', requirePermission('evento.read'), asyncHandler(async (req, res) => {
  await getEventoController().show(req, res);
}));

router.post(
  '/',
  requirePermission('evento.create'),
  validateDto(CreateEventoDto),
  asyncHandler(async (req, res) => {
    await getEventoController().create(req, res);
  })
);

/**
 * PUT /api/eventos/:id
 * 
 * Atualiza um evento existente.
 * 
 * Body: UpdateEventoDto
 * Response: EventoResponseDto
 * Permissão necessária: evento.update
 */
router.put(
  '/:id',
  requirePermission('evento.update'),
  validateDtoUpdate(UpdateEventoDto),
  asyncHandler(async (req, res) => {
    await getEventoController().update(req, res);
  })
);

/**
 * DELETE /api/eventos/:id
 * 
 * Remove um evento.
 * 
 * Permissão necessária: evento.delete
 */
router.delete('/:id', requirePermission('evento.delete'), asyncHandler(async (req, res) => {
  await getEventoController().delete(req, res);
}));

export default router;
