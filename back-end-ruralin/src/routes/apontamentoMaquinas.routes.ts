import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IApontamentoMaquinasController } from '../controllers/interfaces/IApontamentoMaquinasController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateApontamentoMaquinasDto, UpdateApontamentoMaquinasDto } from '../application/dto/apontamentoMaquinas';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getApontamentoMaquinasController = (): IApontamentoMaquinasController => {
  return container.resolve<IApontamentoMaquinasController>(TYPES.IApontamentoMaquinasController);
};

/**
 * @swagger
 * /api/apontamentosMaquinas:
 *   get:
 *     tags:
 *       - ApontamentoMaquinas
 *     summary: Lista apontamentos de maquinas
 *     description: Retorna uma lista paginada de apontamentos de maquinas do tenant atual
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
 *         description: Lista de apontamentos de maquinas
 *       401:
 *         description: Nao autenticado
 *       403:
 *         description: Sem permissao
 */
router.get('/', requirePermission('apontamentoMaquinas.read'), asyncHandler(async (req, res) => {
  await getApontamentoMaquinasController().index(req, res);
}));

/**
 * @swagger
 * /api/apontamentosMaquinas/{id}:
 *   get:
 *     tags:
 *       - ApontamentoMaquinas
 *     summary: Busca apontamento de maquina por ID
 *     description: Retorna um apontamento de maquina especifico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do apontamento de maquina
 *     responses:
 *       200:
 *         description: Apontamento de maquina encontrado
 *       401:
 *         description: Nao autenticado
 *       403:
 *         description: Sem permissao
 *       404:
 *         description: Apontamento de maquina nao encontrado
 */
router.get('/:id', requirePermission('apontamentoMaquinas.read'), asyncHandler(async (req, res) => {
  await getApontamentoMaquinasController().show(req, res);
}));

/**
 * @swagger
 * /api/apontamentosMaquinas:
 *   post:
 *     tags:
 *       - ApontamentoMaquinas
 *     summary: Cria um novo apontamento de maquina
 *     description: Cria um novo apontamento de maquina no tenant atual. Atualiza automaticamente o horimetro da maquina.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateApontamentoMaquinasDto'
 *     responses:
 *       201:
 *         description: Apontamento de maquina criado com sucesso
 *       400:
 *         description: Erro de validacao
 *       401:
 *         description: Nao autenticado
 *       403:
 *         description: Sem permissao
 */
router.post(
  '/',
  requirePermission('apontamentoMaquinas.create'),
  validateDto(CreateApontamentoMaquinasDto),
  asyncHandler(async (req, res) => {
    await getApontamentoMaquinasController().create(req, res);
  })
);

/**
 * @swagger
 * /api/apontamentosMaquinas/{id}:
 *   put:
 *     tags:
 *       - ApontamentoMaquinas
 *     summary: Atualiza um apontamento de maquina
 *     description: Atualiza um apontamento de maquina existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do apontamento de maquina
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateApontamentoMaquinasDto'
 *     responses:
 *       200:
 *         description: Apontamento de maquina atualizado com sucesso
 *       400:
 *         description: Erro de validacao
 *       401:
 *         description: Nao autenticado
 *       403:
 *         description: Sem permissao
 *       404:
 *         description: Apontamento de maquina nao encontrado
 */
router.put(
  '/:id',
  requirePermission('apontamentoMaquinas.update'),
  validateDtoUpdate(UpdateApontamentoMaquinasDto),
  asyncHandler(async (req, res) => {
    await getApontamentoMaquinasController().update(req, res);
  })
);

/**
 * @swagger
 * /api/apontamentosMaquinas/{id}:
 *   delete:
 *     tags:
 *       - ApontamentoMaquinas
 *     summary: Remove um apontamento de maquina
 *     description: Remove um apontamento de maquina do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do apontamento de maquina
 *     responses:
 *       204:
 *         description: Apontamento de maquina removido com sucesso
 *       401:
 *         description: Nao autenticado
 *       403:
 *         description: Sem permissao
 *       404:
 *         description: Apontamento de maquina nao encontrado
 */
router.delete('/:id', requirePermission('apontamentoMaquinas.delete'), asyncHandler(async (req, res) => {
  await getApontamentoMaquinasController().delete(req, res);
}));

export default router;
