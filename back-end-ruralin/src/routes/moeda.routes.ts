import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IMoedaController } from '../controllers/interfaces/IMoedaController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateMoedaDto, UpdateMoedaDto } from '../application/dto/moeda';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

const getMoedaController = (): IMoedaController => {
  return container.resolve<IMoedaController>(TYPES.IMoedaController);
};

/**
 * @swagger
 * /api/moedas:
 *   get:
 *     tags:
 *       - Moedas
 *     summary: Lista moedas
 *     description: Retorna uma lista paginada de moedas do tenant atual
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
 *         description: Lista de moedas
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
 *                         $ref: '#/components/schemas/MoedaResponseDto'
 *             examples:
 *               success:
 *                 summary: Lista paginada de moedas
 *                 value:
 *                   data:
 *                     - id_moeda: 1
 *                       tenantId: 1
 *                       descricao_moeda: Real Brasileiro
 *                       simbolo_moeda: R$
 *                       siglabc_moeda: BRL
 *                       usercreation: 1
 *                       datecreation: '2026-01-16T12:00:00.000Z'
 *                   page: 1
 *                   limit: 10
 *                   total: 1
 *                   totalPages: 1
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *   post:
 *     tags:
 *       - Moedas
 *     summary: Cria uma nova moeda
 *     description: Cria uma nova moeda no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMoedaDto'
 *           examples:
 *             create:
 *               summary: Criar moeda
 *               value:
 *                 descricao_moeda: Real Brasileiro
 *                 simbolo_moeda: R$
 *                 codigoIntegracaoBancoCentral: BRL001
 *                 siglabc_moeda: BRL
 *     responses:
 *       201:
 *         description: Moeda criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MoedaResponseDto'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('moeda.read'), asyncHandler(async (req, res) => {
  await getMoedaController().index(req, res);
}));

/**
 * @swagger
 * /api/moedas/{id}:
 *   get:
 *     tags:
 *       - Moedas
 *     summary: Busca moeda por ID
 *     description: Retorna uma moeda específica por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da moeda (id_moeda)
 *     responses:
 *       200:
 *         description: Moeda encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MoedaResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Moeda não encontrada
 *   put:
 *     tags:
 *       - Moedas
 *     summary: Atualiza uma moeda
 *     description: Atualiza uma moeda existente
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
 *             $ref: '#/components/schemas/UpdateMoedaDto'
 *     responses:
 *       200:
 *         description: Moeda atualizada com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Moeda não encontrada
 *   delete:
 *     tags:
 *       - Moedas
 *     summary: Remove uma moeda
 *     description: Remove uma moeda do sistema
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
 *         description: Moeda removida com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Moeda não encontrada
 */
router.get('/:id', requirePermission('moeda.read'), asyncHandler(async (req, res) => {
  await getMoedaController().show(req, res);
}));

router.post(
  '/',
  requirePermission('moeda.create'),
  validateDto(CreateMoedaDto),
  asyncHandler(async (req, res) => {
    await getMoedaController().create(req, res);
  })
);

router.put(
  '/:id',
  requirePermission('moeda.update'),
  validateDtoUpdate(UpdateMoedaDto),
  asyncHandler(async (req, res) => {
    await getMoedaController().update(req, res);
  })
);

router.delete('/:id', requirePermission('moeda.delete'), asyncHandler(async (req, res) => {
  await getMoedaController().delete(req, res);
}));

export default router;
