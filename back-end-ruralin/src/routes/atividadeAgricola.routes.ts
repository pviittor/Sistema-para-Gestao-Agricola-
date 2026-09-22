import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IAtividadeAgricolaController } from '../controllers/interfaces/IAtividadeAgricolaController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateAtividadeAgricolaDto, UpdateAtividadeAgricolaDto } from '../application/dto/atividadeAgricola';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getAtividadeAgricolaController = (): IAtividadeAgricolaController => {
  return container.resolve<IAtividadeAgricolaController>(TYPES.IAtividadeAgricolaController);
};

/**
 * @swagger
 * /api/atividadesAgricola:
 *   get:
 *     tags:
 *       - Atividades Agrícolas
 *     summary: Lista atividades agrícolas
 *     description: Retorna uma lista paginada de atividades agrícolas do tenant atual
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
 *         description: Lista de atividades agrícolas
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('atividadeAgricola.read'), asyncHandler(async (req, res) => {
  await getAtividadeAgricolaController().index(req, res);
}));

/**
 * @swagger
 * /api/atividadesAgricola/{id}:
 *   get:
 *     tags:
 *       - Atividades Agrícolas
 *     summary: Busca atividade agrícola por ID
 *     description: Retorna uma atividade agrícola específica por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da atividade agrícola
 *     responses:
 *       200:
 *         description: Atividade agrícola encontrada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Atividade agrícola não encontrada
 */
router.get('/:id', requirePermission('atividadeAgricola.read'), asyncHandler(async (req, res) => {
  await getAtividadeAgricolaController().show(req, res);
}));

/**
 * @swagger
 * /api/atividadesAgricola:
 *   post:
 *     tags:
 *       - Atividades Agrícolas
 *     summary: Cria uma nova atividade agrícola
 *     description: Cria uma nova atividade agrícola no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAtividadeAgricolaDto'
 *     responses:
 *       201:
 *         description: Atividade agrícola criada com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/',
  requirePermission('atividadeAgricola.create'),
  validateDto(CreateAtividadeAgricolaDto),
  asyncHandler(async (req, res) => {
    await getAtividadeAgricolaController().create(req, res);
  })
);

/**
 * @swagger
 * /api/atividadesAgricola/{id}:
 *   put:
 *     tags:
 *       - Atividades Agrícolas
 *     summary: Atualiza uma atividade agrícola
 *     description: Atualiza uma atividade agrícola existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da atividade agrícola
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAtividadeAgricolaDto'
 *     responses:
 *       200:
 *         description: Atividade agrícola atualizada com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Atividade agrícola não encontrada
 */
router.put(
  '/:id',
  requirePermission('atividadeAgricola.update'),
  validateDtoUpdate(UpdateAtividadeAgricolaDto),
  asyncHandler(async (req, res) => {
    await getAtividadeAgricolaController().update(req, res);
  })
);

/**
 * @swagger
 * /api/atividadesAgricola/{id}:
 *   delete:
 *     tags:
 *       - Atividades Agrícolas
 *     summary: Remove uma atividade agrícola
 *     description: Remove uma atividade agrícola do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da atividade agrícola
 *     responses:
 *       204:
 *         description: Atividade agrícola removida com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Atividade agrícola não encontrada
 */
router.delete('/:id', requirePermission('atividadeAgricola.delete'), asyncHandler(async (req, res) => {
  await getAtividadeAgricolaController().delete(req, res);
}));

export default router;
