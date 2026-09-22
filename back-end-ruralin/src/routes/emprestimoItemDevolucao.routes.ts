import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IEmprestimoItemDevolucaoController } from '../controllers/interfaces/IEmprestimoItemDevolucaoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import {
  CreateEmprestimoItemDevolucaoDto,
  UpdateEmprestimoItemDevolucaoDto,
} from '../application/dto/emprestimoItemDevolucao';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getEmprestimoItemDevolucaoController = (): IEmprestimoItemDevolucaoController => {
  return container.resolve<IEmprestimoItemDevolucaoController>(TYPES.IEmprestimoItemDevolucaoController);
};

// ===== Rotas customizadas (ANTES de /:id para evitar conflito) =====

/**
 * @swagger
 * /api/emprestimoItemDevolucoes/por-item/{itemId}:
 *   get:
 *     tags:
 *       - Devoluções de Itens de Empréstimo
 *     summary: Lista todas as devoluções de um item de empréstimo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de devoluções do item
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get(
  '/por-item/:itemId',
  requirePermission('emprestimo.read'),
  asyncHandler(async (req, res) => {
    await getEmprestimoItemDevolucaoController().findByItem(req, res);
  })
);

// ===== CRUD =====

/**
 * @swagger
 * /api/emprestimoItemDevolucoes:
 *   get:
 *     tags:
 *       - Devoluções de Itens de Empréstimo
 *     summary: Lista devoluções de itens de empréstimo
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
 *         description: Lista de devoluções paginada
 */
router.get('/', requirePermission('emprestimo.read'), asyncHandler(async (req, res) => {
  await getEmprestimoItemDevolucaoController().index(req, res);
}));

/**
 * @swagger
 * /api/emprestimoItemDevolucoes/{id}:
 *   get:
 *     tags:
 *       - Devoluções de Itens de Empréstimo
 *     summary: Busca devolução de item de empréstimo por ID
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
 *         description: Devolução encontrada
 *       404:
 *         description: Devolução não encontrada
 */
router.get('/:id', requirePermission('emprestimo.read'), asyncHandler(async (req, res) => {
  await getEmprestimoItemDevolucaoController().show(req, res);
}));

/**
 * @swagger
 * /api/emprestimoItemDevolucoes:
 *   post:
 *     tags:
 *       - Devoluções de Itens de Empréstimo
 *     summary: Registra uma nova devolução de item de empréstimo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEmprestimoItemDevolucaoDto'
 *     responses:
 *       201:
 *         description: Devolução registrada com sucesso
 *       400:
 *         description: Erro de validação
 *       422:
 *         description: Quantidade devolvida excede o saldo restante
 */
router.post(
  '/',
  requirePermission('emprestimo.create'),
  validateDto(CreateEmprestimoItemDevolucaoDto),
  asyncHandler(async (req, res) => {
    await getEmprestimoItemDevolucaoController().create(req, res);
  })
);

/**
 * @swagger
 * /api/emprestimoItemDevolucoes/{id}:
 *   put:
 *     tags:
 *       - Devoluções de Itens de Empréstimo
 *     summary: Atualiza uma devolução de item de empréstimo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEmprestimoItemDevolucaoDto'
 *     responses:
 *       200:
 *         description: Devolução atualizada com sucesso
 *       404:
 *         description: Devolução não encontrada
 */
router.put(
  '/:id',
  requirePermission('emprestimo.update'),
  validateDtoUpdate(UpdateEmprestimoItemDevolucaoDto),
  asyncHandler(async (req, res) => {
    await getEmprestimoItemDevolucaoController().update(req, res);
  })
);

/**
 * @swagger
 * /api/emprestimoItemDevolucoes/{id}:
 *   delete:
 *     tags:
 *       - Devoluções de Itens de Empréstimo
 *     summary: Remove uma devolução de item de empréstimo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Devolução removida com sucesso
 *       404:
 *         description: Devolução não encontrada
 */
router.delete('/:id', requirePermission('emprestimo.delete'), asyncHandler(async (req, res) => {
  await getEmprestimoItemDevolucaoController().delete(req, res);
}));

export default router;
