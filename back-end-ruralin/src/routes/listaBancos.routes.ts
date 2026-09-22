import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IListaBancosController } from '../controllers/interfaces/IListaBancosController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateListaBancosDto, UpdateListaBancosDto } from '../application/dto/listaBancos';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

const getListaBancosController = (): IListaBancosController => {
  return container.resolve<IListaBancosController>(TYPES.IListaBancosController);
};

/**
 * @swagger
 * /api/listaBancos:
 *   get:
 *     tags:
 *       - ListaBancos
 *     summary: Lista bancos
 *     description: Retorna uma lista paginada de bancos (dados globais)
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
 *         description: Lista de bancos
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
 *                         $ref: '#/components/schemas/ListaBancosResponseDto'
 *             examples:
 *               success:
 *                 summary: Lista paginada de bancos
 *                 value:
 *                   data:
 *                     - id: 1
 *                       codigo: "001"
 *                       nome: "Banco do Brasil"
 *                   page: 1
 *                   limit: 10
 *                   total: 1
 *                   totalPages: 1
 *       401:
 *         description: Não autenticado
 *   post:
 *     tags:
 *       - ListaBancos
 *     summary: Cria um novo banco (Apenas GOD)
 *     description: Cria um novo banco na lista global
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateListaBancosDto'
 *           examples:
 *             create:
 *               summary: Criar banco
 *               value:
 *                 codigo: "001"
 *                 nome: "Banco do Brasil"
 *     responses:
 *       201:
 *         description: Banco criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListaBancosResponseDto'
 *       400:
 *         description: Erro de validação
 *       403:
 *         description: Sem permissão
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    await getListaBancosController().index(req, res);
  })
);

router.post(
  '/',
  validateDto(CreateListaBancosDto),
  asyncHandler(async (req, res) => {
    await getListaBancosController().create(req, res);
  })
);

/**
 * @swagger
 * /api/listaBancos/{id}:
 *   get:
 *     tags:
 *       - ListaBancos
 *     summary: Busca um banco por ID
 *     description: Retorna os detalhes de um banco específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do banco
 *     responses:
 *       200:
 *         description: Detalhes do banco
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListaBancosResponseDto'
 *       404:
 *         description: Banco não encontrado
 *   put:
 *     tags:
 *       - ListaBancos
 *     summary: Atualiza um banco (Apenas GOD)
 *     description: Atualiza os dados de um banco existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do banco
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateListaBancosDto'
 *     responses:
 *       200:
 *         description: Banco atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListaBancosResponseDto'
 *       404:
 *         description: Banco não encontrado
 *   delete:
 *     tags:
 *       - ListaBancos
 *     summary: Remove um banco (Apenas GOD)
 *     description: Remove um banco da lista global
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do banco
 *     responses:
 *       204:
 *         description: Banco removido com sucesso
 *       404:
 *         description: Banco não encontrado
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    await getListaBancosController().show(req, res);
  })
);

router.put(
  '/:id',
  validateDtoUpdate(UpdateListaBancosDto),
  asyncHandler(async (req, res) => {
    await getListaBancosController().update(req, res);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await getListaBancosController().delete(req, res);
  })
);

export default router;
