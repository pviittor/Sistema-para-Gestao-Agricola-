import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IFazendaController } from '../controllers/interfaces/IFazendaController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateFazendaDto, UpdateFazendaDto } from '../application/dto/fazenda';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FazendaResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         tenantId:
 *           type: integer
 *           example: 1
 *         idPessoa:
 *           type: integer
 *           example: 1
 *         descricao:
 *           type: string
 *           example: Fazenda Santa Maria
 *         endereco:
 *           type: string
 *           nullable: true
 *           example: Rodovia BR-101, km 45
 *         complemento:
 *           type: string
 *           nullable: true
 *         idMunicipio:
 *           type: integer
 *           example: 1
 *         inscricaoEstadual:
 *           type: string
 *           nullable: true
 *         areaTotal:
 *           type: number
 *           format: decimal
 *           example: 1000.50
 *         areaCultivada:
 *           type: number
 *           format: decimal
 *           example: 800.00
 *         reservaLegal:
 *           type: number
 *           format: decimal
 *           example: 200.50
 *         telefone:
 *           type: string
 *           nullable: true
 *         gerente:
 *           type: string
 *           nullable: true
 *         matricula:
 *           type: string
 *           nullable: true
 *         livro:
 *           type: string
 *           nullable: true
 *         folha:
 *           type: string
 *           nullable: true
 *         itr:
 *           type: string
 *           nullable: true
 *         cei:
 *           type: string
 *           nullable: true
 *         lcdprTipoExploracao:
 *           type: integer
 *           nullable: true
 *           enum: [1, 2, 3, 4, 5]
 *         lcdprParticipacao:
 *           type: number
 *           format: decimal
 *           example: 100.00
 *         arrendada:
 *           type: boolean
 *           example: false
 *         idPessoaArrendamento:
 *           type: integer
 *           nullable: true
 *         documento:
 *           type: string
 *           nullable: true
 *         dataInicio:
 *           type: string
 *           format: date
 *           nullable: true
 *         dataFim:
 *           type: string
 *           format: date
 *           nullable: true
 *         observacoes:
 *           type: string
 *           nullable: true
 *         movimentaLCDPR:
 *           type: boolean
 *           example: true
 *         movimentaGado:
 *           type: boolean
 *           example: false
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
 *         pessoa:
 *           type: object
 *           nullable: true
 *         municipio:
 *           type: object
 *           nullable: true
 *         pessoaArrendamento:
 *           type: object
 *           nullable: true
 */

function getFazendaController(): IFazendaController {
  return container.resolve<IFazendaController>(TYPES.IFazendaController);
}

/**
 * @swagger
 * /api/fazendas:
 *   get:
 *     tags:
 *       - Fazendas
 *     summary: Lista fazendas
 *     description: Retorna uma lista paginada de fazendas do tenant atual
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
 *         description: Lista de fazendas
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
 *                         $ref: '#/components/schemas/FazendaResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('fazenda.read'), asyncHandler(async (req, res) => {
  await getFazendaController().index(req, res);
}));

/**
 * @swagger
 * /api/fazendas/all:
 *   get:
 *     tags:
 *       - Fazendas
 *     summary: Lista todas as fazendas (sem paginação)
 *     description: Retorna todas as fazendas do tenant atual sem paginação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de fazendas
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
 *                     $ref: '#/components/schemas/FazendaResponseDto'
 */
router.get('/all', requirePermission('fazenda.read'), asyncHandler(async (req, res) => {
  await getFazendaController().listAll(req, res);
}));

/**
 * @swagger
 * /api/fazendas/{id}:
 *   get:
 *     tags:
 *       - Fazendas
 *     summary: Busca uma fazenda por ID
 *     description: Retorna uma fazenda específica pelo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da fazenda
 *     responses:
 *       200:
 *         description: Fazenda encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FazendaResponseDto'
 *       404:
 *         description: Fazenda não encontrada
 */
router.get('/:id', requirePermission('fazenda.read'), asyncHandler(async (req, res) => {
  await getFazendaController().show(req, res);
}));

/**
 * @swagger
 * /api/fazendas/pessoa/{idPessoa}:
 *   get:
 *     tags:
 *       - Fazendas
 *     summary: Busca fazendas por pessoa (produtor)
 *     description: Retorna todas as fazendas de uma pessoa específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idPessoa
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pessoa (produtor)
 *     responses:
 *       200:
 *         description: Lista de fazendas
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
 *                     $ref: '#/components/schemas/FazendaResponseDto'
 *       404:
 *         description: Pessoa não encontrada
 */
router.get('/pessoa/:idPessoa', requirePermission('fazenda.read'), asyncHandler(async (req, res) => {
  await getFazendaController().findByPessoa(req, res);
}));

/**
 * @swagger
 * /api/fazendas/municipio/{idMunicipio}:
 *   get:
 *     tags:
 *       - Fazendas
 *     summary: Busca fazendas por município
 *     description: Retorna todas as fazendas de um município específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idMunicipio
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do município
 *     responses:
 *       200:
 *         description: Lista de fazendas
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
 *                     $ref: '#/components/schemas/FazendaResponseDto'
 *       404:
 *         description: Município não encontrado
 */
router.get('/municipio/:idMunicipio', requirePermission('fazenda.read'), asyncHandler(async (req, res) => {
  await getFazendaController().findByMunicipio(req, res);
}));

/**
 * @swagger
 * /api/fazendas:
 *   post:
 *     tags:
 *       - Fazendas
 *     summary: Cria uma nova fazenda
 *     description: Cria uma nova fazenda no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idPessoa
 *               - descricao
 *               - idMunicipio
 *               - areaTotal
 *               - areaCultivada
 *               - reservaLegal
 *             properties:
 *               idPessoa:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               descricao:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 example: Fazenda Santa Maria
 *               endereco:
 *                 type: string
 *                 maxLength: 255
 *               idMunicipio:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               areaTotal:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0
 *                 example: 1000.50
 *               areaCultivada:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0
 *                 example: 800.00
 *               reservaLegal:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0
 *                 example: 200.50
 *     responses:
 *       201:
 *         description: Fazenda criada com sucesso
 *       400:
 *         description: Erro de validação
 *       403:
 *         description: Sem permissão ou pessoa não pertence ao tenant
 */
router.post('/', requirePermission('fazenda.create'), validateDto(CreateFazendaDto), asyncHandler(async (req, res) => {
  await getFazendaController().create(req, res);
}));

/**
 * @swagger
 * /api/fazendas/{id}:
 *   put:
 *     tags:
 *       - Fazendas
 *     summary: Atualiza uma fazenda
 *     description: Atualiza uma fazenda existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da fazenda
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Todos os campos são opcionais para atualização parcial
 *     responses:
 *       200:
 *         description: Fazenda atualizada com sucesso
 *       400:
 *         description: Erro de validação
 *       403:
 *         description: Sem permissão ou pessoa não pertence ao tenant
 *       404:
 *         description: Fazenda não encontrada
 */
router.put('/:id', requirePermission('fazenda.update'), validateDtoUpdate(UpdateFazendaDto), asyncHandler(async (req, res) => {
  await getFazendaController().update(req, res);
}));

/**
 * @swagger
 * /api/fazendas/{id}:
 *   delete:
 *     tags:
 *       - Fazendas
 *     summary: Deleta uma fazenda
 *     description: Deleta uma fazenda existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da fazenda
 *     responses:
 *       204:
 *         description: Fazenda deletada com sucesso
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Fazenda não encontrada
 */
router.delete('/:id', requirePermission('fazenda.delete'), asyncHandler(async (req, res) => {
  await getFazendaController().delete(req, res);
}));

export default router;
