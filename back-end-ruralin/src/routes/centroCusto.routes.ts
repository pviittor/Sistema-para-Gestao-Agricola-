import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { ICentroCustoController } from '../controllers/interfaces/ICentroCustoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateCentroCustoDto, UpdateCentroCustoDto } from '../application/dto/centroCusto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CentroCustoResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         tenantId:
 *           type: integer
 *           example: 1
 *         codigo:
 *           type: string
 *           example: CC001
 *         nome:
 *           type: string
 *           example: Centro de Custo Principal
 *         centroCustoPaiId:
 *           type: integer
 *           nullable: true
 *           example: null
 *         ativo:
 *           type: boolean
 *           example: true
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
 *         centroCustoPai:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             codigo:
 *               type: string
 *             nome:
 *               type: string
 */

function getCentroCustoController(): ICentroCustoController {
  return container.resolve<ICentroCustoController>(TYPES.ICentroCustoController);
}

/**
 * @swagger
 * /api/centrosCusto:
 *   get:
 *     tags:
 *       - Centros de Custo
 *     summary: Lista centros de custo
 *     description: Retorna uma lista paginada de centros de custo do tenant atual
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
 *         description: Lista de centros de custo
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
 *                         $ref: '#/components/schemas/CentroCustoResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('centroCusto.read'), asyncHandler(async (req, res) => {
  await getCentroCustoController().index(req, res);
}));

/**
 * @swagger
 * /api/centrosCusto/all:
 *   get:
 *     tags:
 *       - Centros de Custo
 *     summary: Lista todos os centros de custo (sem paginação)
 *     description: Retorna todos os centros de custo do tenant atual sem paginação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de centros de custo
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
 *                     $ref: '#/components/schemas/CentroCustoResponseDto'
 */
router.get('/all', requirePermission('centroCusto.read'), asyncHandler(async (req, res) => {
  await getCentroCustoController().listAll(req, res);
}));

/**
 * @swagger
 * /api/centrosCusto/{id}:
 *   get:
 *     tags:
 *       - Centros de Custo
 *     summary: Busca um centro de custo por ID
 *     description: Retorna um centro de custo específico pelo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do centro de custo
 *     responses:
 *       200:
 *         description: Centro de custo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CentroCustoResponseDto'
 *       404:
 *         description: Centro de custo não encontrado
 */
router.get('/:id', requirePermission('centroCusto.read'), asyncHandler(async (req, res) => {
  await getCentroCustoController().show(req, res);
}));

/**
 * @swagger
 * /api/centrosCusto/pai/{centroCustoPaiId}:
 *   get:
 *     tags:
 *       - Centros de Custo
 *     summary: Busca centros de custo filhos de um pai
 *     description: Retorna todos os centros de custo filhos de um centro de custo pai específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: centroCustoPaiId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do centro de custo pai
 *     responses:
 *       200:
 *         description: Lista de centros de custo filhos
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
 *                     $ref: '#/components/schemas/CentroCustoResponseDto'
 *       404:
 *         description: Centro de custo pai não encontrado
 */
router.get('/pai/:centroCustoPaiId', requirePermission('centroCusto.read'), asyncHandler(async (req, res) => {
  await getCentroCustoController().findByPai(req, res);
}));

/**
 * @swagger
 * /api/centrosCusto:
 *   post:
 *     tags:
 *       - Centros de Custo
 *     summary: Cria um novo centro de custo
 *     description: Cria um novo centro de custo no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - nome
 *             properties:
 *               codigo:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: CC001
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 example: Centro de Custo Principal
 *               centroCustoPaiId:
 *                 type: integer
 *                 nullable: true
 *                 example: null
 *               ativo:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *     responses:
 *       201:
 *         description: Centro de custo criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CentroCustoResponseDto'
 *       400:
 *         description: Erro de validação ou ciclo circular detectado
 *       403:
 *         description: Sem permissão ou centro de custo pai não pertence ao tenant
 */
router.post('/', requirePermission('centroCusto.create'), validateDto(CreateCentroCustoDto), asyncHandler(async (req, res) => {
  await getCentroCustoController().create(req, res);
}));

/**
 * @swagger
 * /api/centrosCusto/{id}:
 *   put:
 *     tags:
 *       - Centros de Custo
 *     summary: Atualiza um centro de custo
 *     description: Atualiza um centro de custo existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do centro de custo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: CC001
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 example: Centro de Custo Principal
 *               centroCustoPaiId:
 *                 type: integer
 *                 nullable: true
 *                 example: null
 *               ativo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Centro de custo atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CentroCustoResponseDto'
 *       400:
 *         description: Erro de validação ou ciclo circular detectado
 *       403:
 *         description: Sem permissão ou centro de custo pai não pertence ao tenant
 *       404:
 *         description: Centro de custo não encontrado
 */
router.put('/:id', requirePermission('centroCusto.update'), validateDtoUpdate(UpdateCentroCustoDto), asyncHandler(async (req, res) => {
  await getCentroCustoController().update(req, res);
}));

/**
 * @swagger
 * /api/centrosCusto/{id}:
 *   delete:
 *     tags:
 *       - Centros de Custo
 *     summary: Deleta um centro de custo
 *     description: Deleta um centro de custo existente. Não é possível deletar se houver centros de custo filhos.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do centro de custo
 *     responses:
 *       204:
 *         description: Centro de custo deletado com sucesso
 *       400:
 *         description: Não é possível deletar pois existem centros de custo filhos
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Centro de custo não encontrado
 */
router.delete('/:id', requirePermission('centroCusto.delete'), asyncHandler(async (req, res) => {
  await getCentroCustoController().delete(req, res);
}));

export default router;
