import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IApontamentoServicoController } from '../controllers/interfaces/IApontamentoServicoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateApontamentoServicoDto, UpdateApontamentoServicoDto } from '../application/dto/apontamentoServico';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getApontamentoServicoController = (): IApontamentoServicoController => {
  return container.resolve<IApontamentoServicoController>(TYPES.IApontamentoServicoController);
};

/**
 * @swagger
 * /api/apontamentosServico:
 *   get:
 *     tags:
 *       - ApontamentosServico
 *     summary: Lista apontamentos de serviço
 *     description: Retorna uma lista paginada de apontamentos de serviço do tenant atual
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
 *         description: Lista de apontamentos de serviço
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('apontamentoServico.read'), asyncHandler(async (req, res) => {
  await getApontamentoServicoController().index(req, res);
}));

/**
 * @swagger
 * /api/apontamentosServico/{id}:
 *   get:
 *     tags:
 *       - ApontamentosServico
 *     summary: Busca apontamento de serviço por ID
 *     description: Retorna um apontamento de serviço específico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do apontamento de serviço
 *     responses:
 *       200:
 *         description: Apontamento de serviço encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Apontamento de serviço não encontrado
 */
router.get('/:id', requirePermission('apontamentoServico.read'), asyncHandler(async (req, res) => {
  await getApontamentoServicoController().show(req, res);
}));

/**
 * @swagger
 * /api/apontamentosServico:
 *   post:
 *     tags:
 *       - ApontamentosServico
 *     summary: Cria um novo apontamento de serviço
 *     description: Cria um novo apontamento de serviço no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateApontamentoServicoDto'
 *     responses:
 *       201:
 *         description: Apontamento de serviço criado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/',
  requirePermission('apontamentoServico.create'),
  validateDto(CreateApontamentoServicoDto),
  asyncHandler(async (req, res) => {
    await getApontamentoServicoController().create(req, res);
  })
);

/**
 * @swagger
 * /api/apontamentosServico/{id}:
 *   put:
 *     tags:
 *       - ApontamentosServico
 *     summary: Atualiza um apontamento de serviço
 *     description: Atualiza um apontamento de serviço existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do apontamento de serviço
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateApontamentoServicoDto'
 *     responses:
 *       200:
 *         description: Apontamento de serviço atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Apontamento de serviço não encontrado
 */
router.put(
  '/:id',
  requirePermission('apontamentoServico.update'),
  validateDtoUpdate(UpdateApontamentoServicoDto),
  asyncHandler(async (req, res) => {
    await getApontamentoServicoController().update(req, res);
  })
);

/**
 * @swagger
 * /api/apontamentosServico/{id}:
 *   delete:
 *     tags:
 *       - ApontamentosServico
 *     summary: Remove um apontamento de serviço
 *     description: Remove um apontamento de serviço do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do apontamento de serviço
 *     responses:
 *       204:
 *         description: Apontamento de serviço removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Apontamento de serviço não encontrado
 */
router.delete('/:id', requirePermission('apontamentoServico.delete'), asyncHandler(async (req, res) => {
  await getApontamentoServicoController().delete(req, res);
}));

export default router;
