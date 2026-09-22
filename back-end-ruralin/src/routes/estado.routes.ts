import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IEstadoController } from '../controllers/interfaces/IEstadoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateEstadoDto, UpdateEstadoDto } from '../application/dto/estado';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { requireRole } from '../middleware/authorization';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     EstadoResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         sigla:
 *           type: string
 *           example: SP
 *         nome:
 *           type: string
 *           example: São Paulo
 *         codigoIBGE:
 *           type: integer
 *           nullable: true
 *           example: 35
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
 */

function getEstadoController(): IEstadoController {
  return container.resolve<IEstadoController>(TYPES.IEstadoController);
}

/**
 * @swagger
 * /api/estados:
 *   get:
 *     summary: Lista todos os estados (paginação)
 *     description: Retorna uma lista paginada de estados. Disponível para todos os usuários autenticados.
 *     tags: [Estados]
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
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de estados retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/EstadoResponseDto'
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  await getEstadoController().index(req, res);
}));

/**
 * @swagger
 * /api/estados/all:
 *   get:
 *     summary: Lista todos os estados (sem paginação)
 *     description: Retorna todos os estados sem paginação. Disponível para todos os usuários autenticados.
 *     tags: [Estados]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estados retornada com sucesso
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
 *                     $ref: '#/components/schemas/EstadoResponseDto'
 */
router.get('/all', authMiddleware, asyncHandler(async (req, res) => {
  await getEstadoController().listAll(req, res);
}));

/**
 * @swagger
 * /api/estados/{id}:
 *   get:
 *     summary: Busca um estado por ID
 *     description: Retorna um estado específico pelo ID. Disponível para todos os usuários autenticados.
 *     tags: [Estados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do estado
 *     responses:
 *       200:
 *         description: Estado encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EstadoResponseDto'
 *       404:
 *         description: Estado não encontrado
 */
router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  await getEstadoController().show(req, res);
}));

/**
 * @swagger
 * /api/estados/sigla/{sigla}:
 *   get:
 *     summary: Busca um estado pela sigla
 *     description: "Retorna um estado específico pela sigla (ex: SP, RJ). Disponível para todos os usuários autenticados."
 *     tags: [Estados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sigla
 *         required: true
 *         schema:
 *           type: string
 *           example: SP
 *         description: Sigla do estado
 *     responses:
 *       200:
 *         description: Estado encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EstadoResponseDto'
 *       404:
 *         description: Estado não encontrado
 */
router.get('/sigla/:sigla', authMiddleware, asyncHandler(async (req, res) => {
  await getEstadoController().findBySigla(req, res);
}));

/**
 * @swagger
 * /api/estados:
 *   post:
 *     summary: Cria um novo estado
 *     description: Cria um novo estado. Apenas usuários GOD podem criar estados.
 *     tags: [Estados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sigla
 *               - nome
 *             properties:
 *               sigla:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 2
 *                 example: SP
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: São Paulo
 *               codigoIBGE:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 99
 *                 example: 35
 *               ativo:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *     responses:
 *       201:
 *         description: Estado criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EstadoResponseDto'
 *       400:
 *         description: Dados inválidos ou estado já existe
 *       403:
 *         description: Acesso negado - apenas GOD pode criar estados
 */
router.post('/', authMiddleware, requireRole(['GOD']), validateDto(CreateEstadoDto), asyncHandler(async (req, res) => {
  await getEstadoController().create(req, res);
}));

/**
 * @swagger
 * /api/estados/{id}:
 *   put:
 *     summary: Atualiza um estado
 *     description: Atualiza um estado existente. Apenas usuários GOD podem atualizar estados.
 *     tags: [Estados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do estado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sigla:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 2
 *                 example: SP
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: São Paulo
 *               codigoIBGE:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 99
 *                 example: 35
 *               ativo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Estado atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EstadoResponseDto'
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado - apenas GOD pode atualizar estados
 *       404:
 *         description: Estado não encontrado
 */
router.put('/:id', authMiddleware, requireRole(['GOD']), validateDtoUpdate(UpdateEstadoDto), asyncHandler(async (req, res) => {
  await getEstadoController().update(req, res);
}));

/**
 * @swagger
 * /api/estados/{id}:
 *   delete:
 *     summary: Deleta um estado
 *     description: Deleta um estado existente. Apenas usuários GOD podem deletar estados. Não é possível deletar estados que possuem municípios vinculados.
 *     tags: [Estados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do estado
 *     responses:
 *       204:
 *         description: Estado deletado com sucesso
 *       400:
 *         description: Não é possível deletar estado com municípios vinculados
 *       403:
 *         description: Acesso negado - apenas GOD pode deletar estados
 *       404:
 *         description: Estado não encontrado
 */
router.delete('/:id', authMiddleware, requireRole(['GOD']), asyncHandler(async (req, res) => {
  await getEstadoController().delete(req, res);
}));

export default router;
