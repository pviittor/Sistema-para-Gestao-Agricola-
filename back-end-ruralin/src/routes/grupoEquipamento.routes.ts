import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IGrupoEquipamentoController } from '../controllers/interfaces/IGrupoEquipamentoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateGrupoEquipamentoDto, UpdateGrupoEquipamentoDto } from '../application/dto/grupoEquipamento';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getGrupoEquipamentoController = (): IGrupoEquipamentoController => {
  return container.resolve<IGrupoEquipamentoController>(TYPES.IGrupoEquipamentoController);
};

/**
 * @swagger
 * /api/gruposEquipamento:
 *   get:
 *     tags:
 *       - Grupos de Equipamento
 *     summary: Lista grupos de equipamento
 *     description: Retorna uma lista paginada de grupos de equipamento do tenant atual
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
 *         description: Lista de grupos de equipamento
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('grupoEquipamento.read'), asyncHandler(async (req, res) => {
  await getGrupoEquipamentoController().index(req, res);
}));

/**
 * @swagger
 * /api/gruposEquipamento/{id}:
 *   get:
 *     tags:
 *       - Grupos de Equipamento
 *     summary: Busca grupo de equipamento por ID
 *     description: Retorna um grupo de equipamento específico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do grupo de equipamento
 *     responses:
 *       200:
 *         description: Grupo de equipamento encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Grupo de equipamento não encontrado
 */
router.get('/:id', requirePermission('grupoEquipamento.read'), asyncHandler(async (req, res) => {
  await getGrupoEquipamentoController().show(req, res);
}));

/**
 * @swagger
 * /api/gruposEquipamento:
 *   post:
 *     tags:
 *       - Grupos de Equipamento
 *     summary: Cria um novo grupo de equipamento
 *     description: Cria um novo grupo de equipamento no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGrupoEquipamentoDto'
 *     responses:
 *       201:
 *         description: Grupo de equipamento criado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/',
  requirePermission('grupoEquipamento.create'),
  validateDto(CreateGrupoEquipamentoDto),
  asyncHandler(async (req, res) => {
    await getGrupoEquipamentoController().create(req, res);
  })
);

/**
 * @swagger
 * /api/gruposEquipamento/{id}:
 *   put:
 *     tags:
 *       - Grupos de Equipamento
 *     summary: Atualiza um grupo de equipamento
 *     description: Atualiza um grupo de equipamento existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do grupo de equipamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGrupoEquipamentoDto'
 *     responses:
 *       200:
 *         description: Grupo de equipamento atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Grupo de equipamento não encontrado
 *   delete:
 *     tags:
 *       - Grupos de Equipamento
 *     summary: Remove um grupo de equipamento
 *     description: Remove um grupo de equipamento do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do grupo de equipamento
 *     responses:
 *       204:
 *         description: Grupo de equipamento removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Grupo de equipamento não encontrado
 */
router.put(
  '/:id',
  requirePermission('grupoEquipamento.update'),
  validateDtoUpdate(UpdateGrupoEquipamentoDto),
  asyncHandler(async (req, res) => {
    await getGrupoEquipamentoController().update(req, res);
  })
);

router.delete('/:id', requirePermission('grupoEquipamento.delete'), asyncHandler(async (req, res) => {
  await getGrupoEquipamentoController().delete(req, res);
}));

export default router;
