import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IAtividadeOperacaoController } from '../controllers/interfaces/IAtividadeOperacaoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateAtividadeOperacaoDto, UpdateAtividadeOperacaoDto } from '../application/dto/atividadeOperacao';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getAtividadeOperacaoController = (): IAtividadeOperacaoController => {
  return container.resolve<IAtividadeOperacaoController>(TYPES.IAtividadeOperacaoController);
};

/**
 * @swagger
 * /api/atividadesOperacao:
 *   get:
 *     tags:
 *       - Operações de Atividade
 *     summary: Lista operações de atividade
 *     description: Retorna uma lista paginada de operações de atividade do tenant atual
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
 *         description: Lista de operações de atividade
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('atividadeOperacao.read'), asyncHandler(async (req, res) => {
  await getAtividadeOperacaoController().index(req, res);
}));

/**
 * @swagger
 * /api/atividadesOperacao/{id}:
 *   get:
 *     tags:
 *       - Operações de Atividade
 *     summary: Busca operação de atividade por ID
 *     description: Retorna uma operação de atividade específica por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da operação
 *     responses:
 *       200:
 *         description: Operação encontrada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Operação não encontrada
 */
router.get('/:id', requirePermission('atividadeOperacao.read'), asyncHandler(async (req, res) => {
  await getAtividadeOperacaoController().show(req, res);
}));

/**
 * @swagger
 * /api/atividadesOperacao:
 *   post:
 *     tags:
 *       - Operações de Atividade
 *     summary: Cria uma nova operação de atividade
 *     description: Cria uma nova operação de atividade no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAtividadeOperacaoDto'
 *     responses:
 *       201:
 *         description: Operação criada com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/',
  requirePermission('atividadeOperacao.create'),
  validateDto(CreateAtividadeOperacaoDto),
  asyncHandler(async (req, res) => {
    await getAtividadeOperacaoController().create(req, res);
  })
);

/**
 * @swagger
 * /api/atividadesOperacao/{id}:
 *   put:
 *     tags:
 *       - Operações de Atividade
 *     summary: Atualiza uma operação de atividade
 *     description: Atualiza uma operação de atividade existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da operação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAtividadeOperacaoDto'
 *     responses:
 *       200:
 *         description: Operação atualizada com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Operação não encontrada
 */
router.put(
  '/:id',
  requirePermission('atividadeOperacao.update'),
  validateDtoUpdate(UpdateAtividadeOperacaoDto),
  asyncHandler(async (req, res) => {
    await getAtividadeOperacaoController().update(req, res);
  })
);

/**
 * @swagger
 * /api/atividadesOperacao/{id}:
 *   delete:
 *     tags:
 *       - Operações de Atividade
 *     summary: Remove uma operação de atividade
 *     description: Remove uma operação de atividade do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da operação
 *     responses:
 *       204:
 *         description: Operação removida com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Operação não encontrada
 */
router.delete('/:id', requirePermission('atividadeOperacao.delete'), asyncHandler(async (req, res) => {
  await getAtividadeOperacaoController().delete(req, res);
}));

export default router;
