import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { ISafraController } from '../controllers/interfaces/ISafraController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateSafraDto, UpdateSafraDto } from '../application/dto/safra';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SafraResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         tenantId:
 *           type: integer
 *           example: 1
 *         culturaId:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: Safra 2024/2025
 *         dataInicio:
 *           type: string
 *           format: date
 *           example: '2024-09-01'
 *         dataFim:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: '2025-03-31'
 *         status:
 *           type: string
 *           enum: [PLANEJADA, EM_ANDAMENTO, CONCLUIDA, CANCELADA]
 *           example: PLANEJADA
 *         usercreation:
 *           type: integer
 *           example: 1
 *         datecreation:
 *           type: string
 *           format: date-time
 *           example: '2026-01-17T12:00:00.000Z'
 *         usuarioCriador:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             nome:
 *               type: string
 *             email:
 *               type: string
 *         cultura:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             descricao_clt:
 *               type: string
 *             idProduto:
 *               type: integer
 */

function getSafraController(): ISafraController {
  return container.resolve<ISafraController>(TYPES.ISafraController);
}

/**
 * @swagger
 * /api/safras:
 *   get:
 *     tags:
 *       - Safras
 *     summary: Lista safras
 *     description: Retorna uma lista paginada de safras do tenant atual
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
 *         description: Lista de safras
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
 *                         $ref: '#/components/schemas/SafraResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('safra.read'), asyncHandler(async (req, res) => {
  await getSafraController().index(req, res);
}));

/**
 * @swagger
 * /api/safras/all:
 *   get:
 *     tags:
 *       - Safras
 *     summary: Lista todas as safras (sem paginação)
 *     description: Retorna todas as safras do tenant atual sem paginação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de safras
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SafraResponseDto'
 */
router.get('/all', requirePermission('safra.read'), asyncHandler(async (req, res) => {
  await getSafraController().listAll(req, res);
}));

/**
 * @swagger
 * /api/safras/{id}:
 *   get:
 *     tags:
 *       - Safras
 *     summary: Busca uma safra por ID
 *     description: Retorna uma safra específica pelo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da safra
 *     responses:
 *       200:
 *         description: Safra encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SafraResponseDto'
 *       404:
 *         description: Safra não encontrada
 */
router.get('/:id', requirePermission('safra.read'), asyncHandler(async (req, res) => {
  await getSafraController().show(req, res);
}));

/**
 * @swagger
 * /api/safras/cultura/{culturaId}:
 *   get:
 *     tags:
 *       - Safras
 *     summary: Busca safras por cultura
 *     description: Retorna todas as safras de uma cultura específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: culturaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da cultura
 *     responses:
 *       200:
 *         description: Lista de safras
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SafraResponseDto'
 *       404:
 *         description: Cultura não encontrada
 */
router.get('/cultura/:culturaId', requirePermission('safra.read'), asyncHandler(async (req, res) => {
  await getSafraController().findByCultura(req, res);
}));

/**
 * @swagger
 * /api/safras/status/{status}:
 *   get:
 *     tags:
 *       - Safras
 *     summary: Busca safras por status
 *     description: Retorna todas as safras com um status específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PLANEJADA, EM_ANDAMENTO, CONCLUIDA, CANCELADA]
 *         description: Status da safra
 *     responses:
 *       200:
 *         description: Lista de safras
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SafraResponseDto'
 */
router.get('/status/:status', requirePermission('safra.read'), asyncHandler(async (req, res) => {
  await getSafraController().findByStatus(req, res);
}));

/**
 * @swagger
 * /api/safras:
 *   post:
 *     tags:
 *       - Safras
 *     summary: Cria uma nova safra
 *     description: Cria uma nova safra no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - culturaId
 *               - nome
 *               - dataInicio
 *             properties:
 *               culturaId:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 example: Safra 2024/2025
 *               dataInicio:
 *                 type: string
 *                 format: date
 *                 example: '2024-09-01'
 *               dataFim:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: '2025-03-31'
 *               status:
 *                 type: string
 *                 enum: [PLANEJADA, EM_ANDAMENTO, CONCLUIDA, CANCELADA]
 *                 default: PLANEJADA
 *                 example: PLANEJADA
 *     responses:
 *       201:
 *         description: Safra criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SafraResponseDto'
 *       400:
 *         description: Erro de validação ou data de fim anterior à data de início
 *       403:
 *         description: Sem permissão ou cultura não pertence ao tenant
 */
router.post('/', requirePermission('safra.create'), validateDto(CreateSafraDto), asyncHandler(async (req, res) => {
  await getSafraController().create(req, res);
}));

/**
 * @swagger
 * /api/safras/{id}:
 *   put:
 *     tags:
 *       - Safras
 *     summary: Atualiza uma safra
 *     description: Atualiza uma safra existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da safra
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               culturaId:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 example: Safra 2024/2025
 *               dataInicio:
 *                 type: string
 *                 format: date
 *                 example: '2024-09-01'
 *               dataFim:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: '2025-03-31'
 *               status:
 *                 type: string
 *                 enum: [PLANEJADA, EM_ANDAMENTO, CONCLUIDA, CANCELADA]
 *                 example: EM_ANDAMENTO
 *     responses:
 *       200:
 *         description: Safra atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SafraResponseDto'
 *       400:
 *         description: Erro de validação ou data de fim anterior à data de início
 *       403:
 *         description: Sem permissão ou cultura não pertence ao tenant
 *       404:
 *         description: Safra não encontrada
 */
router.put('/:id', requirePermission('safra.update'), validateDtoUpdate(UpdateSafraDto), asyncHandler(async (req, res) => {
  await getSafraController().update(req, res);
}));

/**
 * @swagger
 * /api/safras/{id}:
 *   delete:
 *     tags:
 *       - Safras
 *     summary: Deleta uma safra
 *     description: Deleta uma safra existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da safra
 *     responses:
 *       204:
 *         description: Safra deletada com sucesso
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Safra não encontrada
 */
router.delete('/:id', requirePermission('safra.delete'), asyncHandler(async (req, res) => {
  await getSafraController().delete(req, res);
}));

export default router;
