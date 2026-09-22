import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IApontamentoController } from '../controllers/interfaces/IApontamentoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateApontamentoDto, UpdateApontamentoDto } from '../application/dto/apontamento';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getApontamentoController = (): IApontamentoController => {
  return container.resolve<IApontamentoController>(TYPES.IApontamentoController);
};

/**
 * @swagger
 * /api/apontamentos:
 *   get:
 *     tags:
 *       - Apontamentos
 *     summary: Lista apontamentos
 *     description: Retorna uma lista paginada de apontamentos do tenant atual
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero da pagina
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de registros por pagina
 *     responses:
 *       200:
 *         description: Lista de apontamentos
 *       401:
 *         description: Nao autenticado
 *       403:
 *         description: Sem permissao
 */
router.get('/', requirePermission('apontamento.read'), asyncHandler(async (req, res) => {
  await getApontamentoController().index(req, res);
}));

/**
 * @swagger
 * /api/apontamentos/{id}:
 *   get:
 *     tags:
 *       - Apontamentos
 *     summary: Busca apontamento por ID
 *     description: Retorna um apontamento especifico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do apontamento
 *     responses:
 *       200:
 *         description: Apontamento encontrado
 *       401:
 *         description: Nao autenticado
 *       403:
 *         description: Sem permissao
 *       404:
 *         description: Apontamento nao encontrado
 */
router.get('/:id', requirePermission('apontamento.read'), asyncHandler(async (req, res) => {
  await getApontamentoController().show(req, res);
}));

/**
 * @swagger
 * /api/apontamentos:
 *   post:
 *     tags:
 *       - Apontamentos
 *     summary: Cria um novo apontamento
 *     description: Cria um novo apontamento no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateApontamentoDto'
 *     responses:
 *       201:
 *         description: Apontamento criado com sucesso
 *       400:
 *         description: Erro de validacao
 *       401:
 *         description: Nao autenticado
 *       403:
 *         description: Sem permissao
 */
router.post(
  '/',
  requirePermission('apontamento.create'),
  validateDto(CreateApontamentoDto),
  asyncHandler(async (req, res) => {
    await getApontamentoController().create(req, res);
  })
);

/**
 * @swagger
 * /api/apontamentos/{id}:
 *   put:
 *     tags:
 *       - Apontamentos
 *     summary: Atualiza um apontamento
 *     description: Atualiza um apontamento existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do apontamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateApontamentoDto'
 *     responses:
 *       200:
 *         description: Apontamento atualizado com sucesso
 *       400:
 *         description: Erro de validacao
 *       401:
 *         description: Nao autenticado
 *       403:
 *         description: Sem permissao
 *       404:
 *         description: Apontamento nao encontrado
 */
router.put(
  '/:id',
  requirePermission('apontamento.update'),
  validateDtoUpdate(UpdateApontamentoDto),
  asyncHandler(async (req, res) => {
    await getApontamentoController().update(req, res);
  })
);

/**
 * @swagger
 * /api/apontamentos/{id}:
 *   delete:
 *     tags:
 *       - Apontamentos
 *     summary: Remove um apontamento
 *     description: Remove um apontamento do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do apontamento
 *     responses:
 *       204:
 *         description: Apontamento removido com sucesso
 *       401:
 *         description: Nao autenticado
 *       403:
 *         description: Sem permissao
 *       404:
 *         description: Apontamento nao encontrado
 */
router.delete('/:id', requirePermission('apontamento.delete'), asyncHandler(async (req, res) => {
  await getApontamentoController().delete(req, res);
}));

export default router;
