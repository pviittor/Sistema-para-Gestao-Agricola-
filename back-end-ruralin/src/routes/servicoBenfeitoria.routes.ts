import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IServicoBenfeitoriaController } from '../controllers/interfaces/IServicoBenfeitoriaController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateServicoBenfeitoriaDto, UpdateServicoBenfeitoriaDto } from '../application/dto/servicoBenfeitoria';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getServicoBenfeitoriaController = (): IServicoBenfeitoriaController => {
  return container.resolve<IServicoBenfeitoriaController>(TYPES.IServicoBenfeitoriaController);
};

/**
 * @swagger
 * /api/servicosBenfeitoria:
 *   get:
 *     tags:
 *       - ServicosBenfeitoria
 *     summary: Lista servicos de benfeitoria
 *     description: Retorna uma lista paginada de servicos de benfeitoria do tenant atual
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
 *         description: Lista de servicos de benfeitoria
 *       401:
 *         description: Nao autenticado
 *       403:
 *         description: Sem permissao
 */
router.get('/', requirePermission('servicoBenfeitoria.read'), asyncHandler(async (req, res) => {
  await getServicoBenfeitoriaController().index(req, res);
}));

/**
 * @swagger
 * /api/servicosBenfeitoria/{id}:
 *   get:
 *     tags:
 *       - ServicosBenfeitoria
 *     summary: Busca servico de benfeitoria por ID
 *     description: Retorna um servico de benfeitoria especifico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do servico de benfeitoria
 *     responses:
 *       200:
 *         description: Servico de benfeitoria encontrado
 *       401:
 *         description: Nao autenticado
 *       403:
 *         description: Sem permissao
 *       404:
 *         description: Servico de benfeitoria nao encontrado
 */
router.get('/:id', requirePermission('servicoBenfeitoria.read'), asyncHandler(async (req, res) => {
  await getServicoBenfeitoriaController().show(req, res);
}));

/**
 * @swagger
 * /api/servicosBenfeitoria:
 *   post:
 *     tags:
 *       - ServicosBenfeitoria
 *     summary: Cria um novo servico de benfeitoria
 *     description: Cria um novo servico de benfeitoria no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateServicoBenfeitoriaDto'
 *     responses:
 *       201:
 *         description: Servico de benfeitoria criado com sucesso
 *       400:
 *         description: Erro de validacao
 *       401:
 *         description: Nao autenticado
 *       403:
 *         description: Sem permissao
 */
router.post(
  '/',
  requirePermission('servicoBenfeitoria.create'),
  validateDto(CreateServicoBenfeitoriaDto),
  asyncHandler(async (req, res) => {
    await getServicoBenfeitoriaController().create(req, res);
  })
);

/**
 * @swagger
 * /api/servicosBenfeitoria/{id}:
 *   put:
 *     tags:
 *       - ServicosBenfeitoria
 *     summary: Atualiza um servico de benfeitoria
 *     description: Atualiza um servico de benfeitoria existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do servico de benfeitoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateServicoBenfeitoriaDto'
 *     responses:
 *       200:
 *         description: Servico de benfeitoria atualizado com sucesso
 *       400:
 *         description: Erro de validacao
 *       401:
 *         description: Nao autenticado
 *       403:
 *         description: Sem permissao
 *       404:
 *         description: Servico de benfeitoria nao encontrado
 */
router.put(
  '/:id',
  requirePermission('servicoBenfeitoria.update'),
  validateDtoUpdate(UpdateServicoBenfeitoriaDto),
  asyncHandler(async (req, res) => {
    await getServicoBenfeitoriaController().update(req, res);
  })
);

/**
 * @swagger
 * /api/servicosBenfeitoria/{id}:
 *   delete:
 *     tags:
 *       - ServicosBenfeitoria
 *     summary: Remove um servico de benfeitoria
 *     description: Remove um servico de benfeitoria do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do servico de benfeitoria
 *     responses:
 *       204:
 *         description: Servico de benfeitoria removido com sucesso
 *       401:
 *         description: Nao autenticado
 *       403:
 *         description: Sem permissao
 *       404:
 *         description: Servico de benfeitoria nao encontrado
 */
router.delete('/:id', requirePermission('servicoBenfeitoria.delete'), asyncHandler(async (req, res) => {
  await getServicoBenfeitoriaController().delete(req, res);
}));

export default router;
