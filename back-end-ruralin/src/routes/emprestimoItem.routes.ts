import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IEmprestimoItemController } from '../controllers/interfaces/IEmprestimoItemController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateEmprestimoItemDto, UpdateEmprestimoItemDto } from '../application/dto/emprestimoItem';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getEmprestimoItemController = (): IEmprestimoItemController => {
  return container.resolve<IEmprestimoItemController>(TYPES.IEmprestimoItemController);
};

// ===== Rotas customizadas (ANTES de /:id para evitar conflito) =====

/**
 * @swagger
 * /api/emprestimoItens/por-emprestimo/{emprestimoId}:
 *   get:
 *     tags:
 *       - Itens de Empréstimo
 *     summary: Lista todos os itens de um empréstimo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: emprestimoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de itens do empréstimo
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get(
  '/por-emprestimo/:emprestimoId',
  requirePermission('emprestimo.read'),
  asyncHandler(async (req, res) => {
    await getEmprestimoItemController().findByEmprestimo(req, res);
  })
);

// ===== CRUD =====

/**
 * @swagger
 * /api/emprestimoItens:
 *   get:
 *     tags:
 *       - Itens de Empréstimo
 *     summary: Lista itens de empréstimo
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
 *         description: Lista de itens de empréstimo paginada
 */
router.get('/', requirePermission('emprestimo.read'), asyncHandler(async (req, res) => {
  await getEmprestimoItemController().index(req, res);
}));

/**
 * @swagger
 * /api/emprestimoItens/{id}:
 *   get:
 *     tags:
 *       - Itens de Empréstimo
 *     summary: Busca item de empréstimo por ID
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
 *         description: Item encontrado
 *       404:
 *         description: Item não encontrado
 */
router.get('/:id', requirePermission('emprestimo.read'), asyncHandler(async (req, res) => {
  await getEmprestimoItemController().show(req, res);
}));

/**
 * @swagger
 * /api/emprestimoItens:
 *   post:
 *     tags:
 *       - Itens de Empréstimo
 *     summary: Cria um novo item de empréstimo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEmprestimoItemDto'
 *     responses:
 *       201:
 *         description: Item criado com sucesso
 *       400:
 *         description: Erro de validação
 */
router.post(
  '/',
  requirePermission('emprestimo.create'),
  validateDto(CreateEmprestimoItemDto),
  asyncHandler(async (req, res) => {
    await getEmprestimoItemController().create(req, res);
  })
);

/**
 * @swagger
 * /api/emprestimoItens/{id}:
 *   put:
 *     tags:
 *       - Itens de Empréstimo
 *     summary: Atualiza um item de empréstimo
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
 *             $ref: '#/components/schemas/UpdateEmprestimoItemDto'
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 *       404:
 *         description: Item não encontrado
 */
router.put(
  '/:id',
  requirePermission('emprestimo.update'),
  validateDtoUpdate(UpdateEmprestimoItemDto),
  asyncHandler(async (req, res) => {
    await getEmprestimoItemController().update(req, res);
  })
);

/**
 * @swagger
 * /api/emprestimoItens/{id}:
 *   delete:
 *     tags:
 *       - Itens de Empréstimo
 *     summary: Remove um item de empréstimo
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
 *         description: Item removido com sucesso
 *       404:
 *         description: Item não encontrado
 *       422:
 *         description: Item possui devoluções registradas e não pode ser excluído
 */
router.delete('/:id', requirePermission('emprestimo.delete'), asyncHandler(async (req, res) => {
  await getEmprestimoItemController().delete(req, res);
}));

export default router;
