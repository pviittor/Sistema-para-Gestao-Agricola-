import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IPrincipioAtivoController } from '../controllers/interfaces/IPrincipioAtivoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreatePrincipioAtivoDto, UpdatePrincipioAtivoDto } from '../application/dto/principioAtivo';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getPrincipioAtivoController = (): IPrincipioAtivoController => {
  return container.resolve<IPrincipioAtivoController>(TYPES.IPrincipioAtivoController);
};

/**
 * @swagger
 * /api/principiosAtivo:
 *   get:
 *     tags:
 *       - Princípios Ativos
 *     summary: Lista princípios ativos
 *     description: Retorna uma lista paginada de princípios ativos do tenant atual
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
 *         description: Lista de princípios ativos
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResult'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PrincipioAtivoResponseDto'
 *             examples:
 *               success:
 *                 summary: Lista paginada de princípios ativos
 *                 value:
 *                   data:
 *                     - id_principio: 1
 *                       tenantId: 1
 *                       descricao_principio: Nitrogênio
 *                       classe_principio: Macronutriente
 *                       usercreation: 1
 *                       datecreation: '2026-01-16T12:00:00.000Z'
 *                   page: 1
 *                   limit: 10
 *                   total: 1
 *                   totalPages: 1
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sem permissão
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', requirePermission('principioAtivo.read'), asyncHandler(async (req, res) => {
  await getPrincipioAtivoController().index(req, res);
}));

/**
 * @swagger
 * /api/principiosAtivo/{id}:
 *   get:
 *     tags:
 *       - Princípios Ativos
 *     summary: Busca princípio ativo por ID
 *     description: Retorna um princípio ativo específico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do princípio ativo
 *     responses:
 *       200:
 *         description: Princípio ativo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrincipioAtivoResponseDto'
 *             examples:
 *               success:
 *                 summary: Princípio ativo encontrado
 *                 value:
 *                   id_principio: 1
 *                   tenantId: 1
 *                   descricao_principio: Nitrogênio
 *                   classe_principio: Macronutriente
 *                   usercreation: 1
 *                   datecreation: '2026-01-16T12:00:00.000Z'
 *                   usuarioCriador:
 *                     id: 1
 *                     nome: João Silva
 *                     email: joao@example.com
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Princípio ativo não encontrado
 */
router.get('/:id', requirePermission('principioAtivo.read'), asyncHandler(async (req, res) => {
  await getPrincipioAtivoController().show(req, res);
}));

/**
 * @swagger
 * /api/principiosAtivo:
 *   post:
 *     tags:
 *       - Princípios Ativos
 *     summary: Cria um novo princípio ativo
 *     description: Cria um novo princípio ativo no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePrincipioAtivoDto'
 *           examples:
 *             create:
 *               summary: Criar princípio ativo
 *               value:
 *                 descricao_principio: Nitrogênio
 *                 classe_principio: Macronutriente
 *     responses:
 *       201:
 *         description: Princípio ativo criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrincipioAtivoResponseDto'
 *             examples:
 *               created:
 *                 summary: Princípio ativo criado
 *                 value:
 *                   id_principio: 1
 *                   tenantId: 1
 *                   descricao_principio: Nitrogênio
 *                   classe_principio: Macronutriente
 *                   usercreation: 1
 *                   datecreation: '2026-01-16T12:00:00.000Z'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/',
  requirePermission('principioAtivo.create'),
  validateDto(CreatePrincipioAtivoDto),
  asyncHandler(async (req, res) => {
    await getPrincipioAtivoController().create(req, res);
  })
);

/**
 * @swagger
 * /api/principiosAtivo/{id}:
 *   put:
 *     tags:
 *       - Princípios Ativos
 *     summary: Atualiza um princípio ativo
 *     description: Atualiza um princípio ativo existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do princípio ativo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePrincipioAtivoDto'
 *           examples:
 *             update:
 *               summary: Atualizar princípio ativo
 *               value:
 *                 descricao_principio: Nitrogênio Atualizado
 *                 classe_principio: Macronutriente Primário
 *     responses:
 *       200:
 *         description: Princípio ativo atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrincipioAtivoResponseDto'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Princípio ativo não encontrado
 *   delete:
 *     tags:
 *       - Princípios Ativos
 *     summary: Remove um princípio ativo
 *     description: Remove um princípio ativo do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do princípio ativo
 *     responses:
 *       204:
 *         description: Princípio ativo removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Princípio ativo não encontrado
 */
router.put(
  '/:id',
  requirePermission('principioAtivo.update'),
  validateDtoUpdate(UpdatePrincipioAtivoDto),
  asyncHandler(async (req, res) => {
    await getPrincipioAtivoController().update(req, res);
  })
);

router.delete('/:id', requirePermission('principioAtivo.delete'), asyncHandler(async (req, res) => {
  await getPrincipioAtivoController().delete(req, res);
}));

export default router;
