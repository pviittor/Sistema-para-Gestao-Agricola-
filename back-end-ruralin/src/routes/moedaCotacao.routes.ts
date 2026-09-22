import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IMoedaCotacaoController } from '../controllers/interfaces/IMoedaCotacaoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateMoedaCotacaoDto, UpdateMoedaCotacaoDto } from '../application/dto/moedaCotacao';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

const getMoedaCotacaoController = (): IMoedaCotacaoController => {
  return container.resolve<IMoedaCotacaoController>(TYPES.IMoedaCotacaoController);
};

/**
 * @swagger
 * /api/moedasCotacao:
 *   get:
 *     tags:
 *       - Cotações de Moeda
 *     summary: Lista cotações de moeda
 *     description: Retorna uma lista paginada de cotações de moeda do tenant atual
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
 *         description: Lista de cotações
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
 *                         $ref: '#/components/schemas/MoedaCotacaoResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *   post:
 *     tags:
 *       - Cotações de Moeda
 *     summary: Cria uma nova cotação de moeda
 *     description: Cria uma nova cotação de moeda no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMoedaCotacaoDto'
 *           examples:
 *             create:
 *               summary: Criar cotação
 *               value:
 *                 idMoeda: 1
 *                 data_cotacao: '2026-01-16'
 *                 valor_cotacao: 5.25
 *                 fechamento_cotaca: true
 *     responses:
 *       201:
 *         description: Cotação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MoedaCotacaoResponseDto'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão ou moeda não pertence ao tenant
 */
router.get('/', requirePermission('moedaCotacao.read'), asyncHandler(async (req, res) => {
  await getMoedaCotacaoController().index(req, res);
}));

/**
 * @swagger
 * /api/moedasCotacao/moeda/{idMoeda}:
 *   get:
 *     tags:
 *       - Cotações de Moeda
 *     summary: Busca cotações por moeda
 *     description: Retorna todas as cotações de uma moeda específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idMoeda
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da moeda
 *     responses:
 *       200:
 *         description: Lista de cotações da moeda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MoedaCotacaoResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/moeda/:idMoeda', requirePermission('moedaCotacao.read'), asyncHandler(async (req, res) => {
  await getMoedaCotacaoController().findByMoeda(req, res);
}));

/**
 * @swagger
 * /api/moedasCotacao/data/{data}:
 *   get:
 *     tags:
 *       - Cotações de Moeda
 *     summary: Busca cotações por data
 *     description: Retorna todas as cotações de uma data específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data da cotação no formato YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Lista de cotações da data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MoedaCotacaoResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/data/:data', requirePermission('moedaCotacao.read'), asyncHandler(async (req, res) => {
  await getMoedaCotacaoController().findByData(req, res);
}));

/**
 * @swagger
 * /api/moedasCotacao/{id}:
 *   get:
 *     tags:
 *       - Cotações de Moeda
 *     summary: Busca cotação por ID
 *     description: Retorna uma cotação específica por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da cotação (id_cotacao)
 *     responses:
 *       200:
 *         description: Cotação encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MoedaCotacaoResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Cotação não encontrada
 *   put:
 *     tags:
 *       - Cotações de Moeda
 *     summary: Atualiza uma cotação
 *     description: Atualiza uma cotação existente
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
 *             $ref: '#/components/schemas/UpdateMoedaCotacaoDto'
 *     responses:
 *       200:
 *         description: Cotação atualizada com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Cotação não encontrada
 *   delete:
 *     tags:
 *       - Cotações de Moeda
 *     summary: Remove uma cotação
 *     description: Remove uma cotação do sistema
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
 *         description: Cotação removida com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Cotação não encontrada
 */
router.get('/:id', requirePermission('moedaCotacao.read'), asyncHandler(async (req, res) => {
  await getMoedaCotacaoController().show(req, res);
}));

router.post(
  '/',
  requirePermission('moedaCotacao.create'),
  validateDto(CreateMoedaCotacaoDto),
  asyncHandler(async (req, res) => {
    await getMoedaCotacaoController().create(req, res);
  })
);

router.put(
  '/:id',
  requirePermission('moedaCotacao.update'),
  validateDtoUpdate(UpdateMoedaCotacaoDto),
  asyncHandler(async (req, res) => {
    await getMoedaCotacaoController().update(req, res);
  })
);

router.delete('/:id', requirePermission('moedaCotacao.delete'), asyncHandler(async (req, res) => {
  await getMoedaCotacaoController().delete(req, res);
}));

export default router;
