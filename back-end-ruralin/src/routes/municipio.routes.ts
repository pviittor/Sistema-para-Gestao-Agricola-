import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IMunicipioController } from '../controllers/interfaces/IMunicipioController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateMunicipioDto, UpdateMunicipioDto } from '../application/dto/municipio';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { requireRole } from '../middleware/authorization';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MunicipioResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: São Paulo
 *         idEstado:
 *           type: integer
 *           example: 1
 *         codigoIBGE:
 *           type: integer
 *           nullable: true
 *           example: 3550308
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
 *         estado:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             sigla:
 *               type: string
 *             nome:
 *               type: string
 */

function getMunicipioController(): IMunicipioController {
  return container.resolve<IMunicipioController>(TYPES.IMunicipioController);
}

/**
 * @swagger
 * /api/municipios:
 *   get:
 *     summary: Lista todos os municípios (paginação)
 *     description: Retorna uma lista paginada de municípios. Disponível para todos os usuários autenticados.
 *     tags: [Municípios]
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
 *         description: Lista de municípios retornada com sucesso
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
 *                         $ref: '#/components/schemas/MunicipioResponseDto'
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
  await getMunicipioController().index(req, res);
}));

/**
 * @swagger
 * /api/municipios/all:
 *   get:
 *     summary: Lista todos os municípios (sem paginação)
 *     description: Retorna todos os municípios sem paginação. Disponível para todos os usuários autenticados.
 *     tags: [Municípios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de municípios retornada com sucesso
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
 *                     $ref: '#/components/schemas/MunicipioResponseDto'
 */
router.get('/all', authMiddleware, asyncHandler(async (req, res) => {
  await getMunicipioController().listAll(req, res);
}));

/**
 * @swagger
 * /api/municipios/{id}:
 *   get:
 *     summary: Busca um município por ID
 *     description: Retorna um município específico pelo ID. Disponível para todos os usuários autenticados.
 *     tags: [Municípios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do município
 *     responses:
 *       200:
 *         description: Município encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MunicipioResponseDto'
 *       404:
 *         description: Município não encontrado
 */
router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  await getMunicipioController().show(req, res);
}));

/**
 * @swagger
 * /api/municipios/estado/{idEstado}:
 *   get:
 *     summary: Busca municípios por estado
 *     description: Retorna todos os municípios de um estado específico. Disponível para todos os usuários autenticados.
 *     tags: [Municípios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idEstado
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do estado
 *     responses:
 *       200:
 *         description: Lista de municípios retornada com sucesso
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
 *                     $ref: '#/components/schemas/MunicipioResponseDto'
 */
router.get('/estado/:idEstado', authMiddleware, asyncHandler(async (req, res) => {
  await getMunicipioController().findByEstado(req, res);
}));

/**
 * @swagger
 * /api/municipios/ibge/{codigoIBGE}:
 *   get:
 *     summary: Busca um município pelo código IBGE
 *     description: Retorna um município específico pelo código IBGE. Disponível para todos os usuários autenticados.
 *     tags: [Municípios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigoIBGE
 *         required: true
 *         schema:
 *           type: integer
 *           example: 3550308
 *         description: Código IBGE do município
 *     responses:
 *       200:
 *         description: Município encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MunicipioResponseDto'
 *       404:
 *         description: Município não encontrado
 */
router.get('/ibge/:codigoIBGE', authMiddleware, asyncHandler(async (req, res) => {
  await getMunicipioController().findByCodigoIBGE(req, res);
}));

/**
 * @swagger
 * /api/municipios:
 *   post:
 *     summary: Cria um novo município
 *     description: Cria um novo município. Apenas usuários GOD podem criar municípios.
 *     tags: [Municípios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - idEstado
 *             properties:
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 example: São Paulo
 *               idEstado:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               codigoIBGE:
 *                 type: integer
 *                 minimum: 1000000
 *                 maximum: 9999999
 *                 example: 3550308
 *               ativo:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *     responses:
 *       201:
 *         description: Município criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MunicipioResponseDto'
 *       400:
 *         description: Dados inválidos ou município já existe
 *       403:
 *         description: Acesso negado - apenas GOD pode criar municípios
 */
router.post('/', authMiddleware, requireRole(['GOD']), validateDto(CreateMunicipioDto), asyncHandler(async (req, res) => {
  await getMunicipioController().create(req, res);
}));

/**
 * @swagger
 * /api/municipios/{id}:
 *   put:
 *     summary: Atualiza um município
 *     description: Atualiza um município existente. Apenas usuários GOD podem atualizar municípios.
 *     tags: [Municípios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do município
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 example: São Paulo
 *               idEstado:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               codigoIBGE:
 *                 type: integer
 *                 minimum: 1000000
 *                 maximum: 9999999
 *                 example: 3550308
 *               ativo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Município atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MunicipioResponseDto'
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado - apenas GOD pode atualizar municípios
 *       404:
 *         description: Município não encontrado
 */
router.put('/:id', authMiddleware, requireRole(['GOD']), validateDtoUpdate(UpdateMunicipioDto), asyncHandler(async (req, res) => {
  await getMunicipioController().update(req, res);
}));

/**
 * @swagger
 * /api/municipios/{id}:
 *   delete:
 *     summary: Deleta um município
 *     description: Deleta um município existente. Apenas usuários GOD podem deletar municípios.
 *     tags: [Municípios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do município
 *     responses:
 *       204:
 *         description: Município deletado com sucesso
 *       403:
 *         description: Acesso negado - apenas GOD pode deletar municípios
 *       404:
 *         description: Município não encontrado
 */
router.delete('/:id', authMiddleware, requireRole(['GOD']), asyncHandler(async (req, res) => {
  await getMunicipioController().delete(req, res);
}));

export default router;
