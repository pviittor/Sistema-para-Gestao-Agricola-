import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IUnidadeDepositoController } from '../controllers/interfaces/IUnidadeDepositoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateUnidadeDepositoDto, UpdateUnidadeDepositoDto } from '../application/dto/unidadeDeposito';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

const getUnidadeDepositoController = (): IUnidadeDepositoController => {
  return container.resolve<IUnidadeDepositoController>(TYPES.IUnidadeDepositoController);
};

/**
 * @swagger
 * /api/unidades-deposito:
 *   get:
 *     tags:
 *       - Unidades de Depósito
 *     summary: Lista unidades de depósito
 *     description: Retorna uma lista paginada de unidades de depósito do tenant atual
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
 *         description: Lista de unidades de depósito
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
 *                         $ref: '#/components/schemas/UnidadeDepositoResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *   post:
 *     tags:
 *       - Unidades de Depósito
 *     summary: Cria uma nova unidade de depósito
 *     description: Cria uma nova unidade de depósito no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUnidadeDepositoDto'
 *           examples:
 *             create:
 *               summary: Criar unidade de depósito
 *               value:
 *                 descricao: Silo Principal
 *                 tipo: Silo
 *                 capacidade_total: 50000
 *                 idUnidadeMedida: 1
 *                 idProduto: 1
 *                 saldo_inicial: 0
 *                 ativo: true
 *     responses:
 *       201:
 *         description: Unidade de depósito criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnidadeDepositoResponseDto'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão ou produto/unidade de medida não pertence ao tenant
 */
router.get('/', requirePermission('unidadeDeposito.read'), asyncHandler(async (req, res) => {
  await getUnidadeDepositoController().index(req, res);
}));

/**
 * @swagger
 * /api/unidades-deposito/com-saldo:
 *   get:
 *     tags:
 *       - Unidades de Depósito
 *     summary: Lista unidades de depósito com saldo calculado
 *     description: Retorna todas as unidades de depósito com saldo atual e percentual de utilização
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de unidades de depósito com saldo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UnidadeDepositoComSaldoDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/com-saldo', requirePermission('unidadeDeposito.read'), asyncHandler(async (req, res) => {
  await getUnidadeDepositoController().findComSaldo(req, res);
}));

/**
 * @swagger
 * /api/unidades-deposito/produto/{idProduto}:
 *   get:
 *     tags:
 *       - Unidades de Depósito
 *     summary: Busca unidades de depósito por produto
 *     description: Retorna todas as unidades de depósito de um produto específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idProduto
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto (id_prod)
 *     responses:
 *       200:
 *         description: Lista de unidades de depósito do produto
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UnidadeDepositoResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/produto/:idProduto', requirePermission('unidadeDeposito.read'), asyncHandler(async (req, res) => {
  await getUnidadeDepositoController().findByProduto(req, res);
}));

/**
 * @swagger
 * /api/unidades-deposito/{id}:
 *   get:
 *     tags:
 *       - Unidades de Depósito
 *     summary: Busca unidade de depósito por ID
 *     description: Retorna uma unidade de depósito específica por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da unidade de depósito
 *     responses:
 *       200:
 *         description: Unidade de depósito encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnidadeDepositoResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Unidade de depósito não encontrada
 *   put:
 *     tags:
 *       - Unidades de Depósito
 *     summary: Atualiza uma unidade de depósito
 *     description: Atualiza uma unidade de depósito existente
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
 *             $ref: '#/components/schemas/UpdateUnidadeDepositoDto'
 *     responses:
 *       200:
 *         description: Unidade de depósito atualizada com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Unidade de depósito não encontrada
 *   delete:
 *     tags:
 *       - Unidades de Depósito
 *     summary: Remove uma unidade de depósito
 *     description: Remove uma unidade de depósito do sistema
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
 *         description: Unidade de depósito removida com sucesso
 *       400:
 *         description: Não é possível excluir (registros de armazenagem vinculados)
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Unidade de depósito não encontrada
 */
router.get('/:id', requirePermission('unidadeDeposito.read'), asyncHandler(async (req, res) => {
  await getUnidadeDepositoController().show(req, res);
}));

router.post(
  '/',
  requirePermission('unidadeDeposito.create'),
  validateDto(CreateUnidadeDepositoDto),
  asyncHandler(async (req, res) => {
    await getUnidadeDepositoController().create(req, res);
  })
);

router.put(
  '/:id',
  requirePermission('unidadeDeposito.update'),
  validateDtoUpdate(UpdateUnidadeDepositoDto),
  asyncHandler(async (req, res) => {
    await getUnidadeDepositoController().update(req, res);
  })
);

router.delete('/:id', requirePermission('unidadeDeposito.delete'), asyncHandler(async (req, res) => {
  await getUnidadeDepositoController().delete(req, res);
}));

export default router;
