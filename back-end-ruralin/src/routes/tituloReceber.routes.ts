import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { ITituloReceberController } from '../controllers/interfaces/ITituloReceberController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateTituloReceberDto, CreateTituloReceberCompletoDto, UpdateTituloReceberDto } from '../application/dto/tituloReceber';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TituloReceberResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         tenantId:
 *           type: integer
 *           example: 1
 *         numeroTitulo:
 *           type: string
 *           example: "TR-2024-001"
 *         idCliente:
 *           type: integer
 *           example: 1
 *         idFazenda:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         idSafra:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         dataLancamento:
 *           type: string
 *           format: date
 *           example: '2024-01-15'
 *         dataVencimento:
 *           type: string
 *           format: date
 *           example: '2024-02-15'
 *         valorTitulo:
 *           type: number
 *           format: decimal
 *           example: 10000.00
 *         valorRecebido:
 *           type: number
 *           format: decimal
 *           example: 0.00
 *         idMoeda:
 *           type: integer
 *           example: 1
 *         status:
 *           type: string
 *           enum: [ABERTO, PARCIAL, BAIXADO, CANCELADO]
 *           example: ABERTO
 *         observacao:
 *           type: string
 *           nullable: true
 *           example: "Título referente à venda de produtos"
 *         usercreation:
 *           type: integer
 *           example: 1
 *         datecreation:
 *           type: string
 *           format: date-time
 *           example: '2024-01-15T10:00:00.000Z'
 *         cliente:
 *           type: object
 *           nullable: true
 *         fazenda:
 *           type: object
 *           nullable: true
 *         safra:
 *           type: object
 *           nullable: true
 *         moeda:
 *           type: object
 *           nullable: true
 *         parcelas:
 *           type: array
 *           items:
 *             type: object
 */

function getTituloReceberController(): ITituloReceberController {
  return container.resolve<ITituloReceberController>(TYPES.ITituloReceberController);
}

/**
 * @swagger
 * /api/titulosReceber:
 *   get:
 *     tags:
 *       - Títulos a Receber
 *     summary: Lista títulos a receber
 *     description: Retorna uma lista paginada de títulos a receber do tenant atual
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
 *         description: Quantidade de itens por página
 *     responses:
 *       200:
 *         description: Lista de títulos a receber
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
 *                         $ref: '#/components/schemas/TituloReceberResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('tituloReceber.read'), asyncHandler(async (req, res) => {
  await getTituloReceberController().index(req, res);
}));

/**
 * @swagger
 * /api/titulosReceber/safra/{idSafra}:
 *   get:
 *     tags:
 *       - Títulos a Receber
 *     summary: Busca títulos a receber por safra
 *     description: Retorna uma lista paginada de títulos a receber de uma safra específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idSafra
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da safra
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
 *         description: Lista de títulos a receber
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
 *                         $ref: '#/components/schemas/TituloReceberResponseDto'
 *       404:
 *         description: Safra não encontrada
 */
router.get('/safra/:idSafra', requirePermission('tituloReceber.read'), asyncHandler(async (req, res) => {
  await getTituloReceberController().findBySafra(req, res);
}));

/**
 * @swagger
 * /api/titulosReceber/fazenda/{idFazenda}:
 *   get:
 *     tags:
 *       - Títulos a Receber
 *     summary: Busca títulos a receber por fazenda
 *     description: Retorna uma lista paginada de títulos a receber de uma fazenda específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idFazenda
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da fazenda
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
 *         description: Lista de títulos a receber
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
 *                         $ref: '#/components/schemas/TituloReceberResponseDto'
 *       404:
 *         description: Fazenda não encontrada
 */
router.get('/fazenda/:idFazenda', requirePermission('tituloReceber.read'), asyncHandler(async (req, res) => {
  await getTituloReceberController().findByFazenda(req, res);
}));

/**
 * @swagger
 * /api/titulosReceber/cliente/{idCliente}:
 *   get:
 *     tags:
 *       - Títulos a Receber
 *     summary: Busca títulos a receber por cliente
 *     description: Retorna uma lista paginada de títulos a receber de um cliente específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCliente
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cliente
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
 *         description: Lista de títulos a receber
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
 *                         $ref: '#/components/schemas/TituloReceberResponseDto'
 *       404:
 *         description: Cliente não encontrado
 */
router.get('/cliente/:idCliente', requirePermission('tituloReceber.read'), asyncHandler(async (req, res) => {
  await getTituloReceberController().findByCliente(req, res);
}));

/**
 * @swagger
 * /api/titulosReceber/status/{status}:
 *   get:
 *     tags:
 *       - Títulos a Receber
 *     summary: Busca títulos a receber por status
 *     description: Retorna uma lista paginada de títulos a receber com um status específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ABERTO, PARCIAL, BAIXADO, CANCELADO]
 *         description: Status do título
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
 *         description: Lista de títulos a receber
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
 *                         $ref: '#/components/schemas/TituloReceberResponseDto'
 *       400:
 *         description: Status inválido
 */
router.get('/status/:status', requirePermission('tituloReceber.read'), asyncHandler(async (req, res) => {
  await getTituloReceberController().findByStatus(req, res);
}));

/**
 * @swagger
 * /api/titulosReceber/dataLancamento:
 *   get:
 *     tags:
 *       - Títulos a Receber
 *     summary: Busca títulos a receber por período de lançamento
 *     description: Retorna uma lista paginada de títulos a receber lançados em um período específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do período (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período (YYYY-MM-DD)
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
 *         description: Lista de títulos a receber
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
 *                         $ref: '#/components/schemas/TituloReceberResponseDto'
 *       400:
 *         description: Parâmetros de data inválidos
 */
router.get('/dataLancamento', requirePermission('tituloReceber.read'), asyncHandler(async (req, res) => {
  await getTituloReceberController().findByDataLancamento(req, res);
}));

/**
 * @swagger
 * /api/titulosReceber/kpis:
 *   get:
 *     tags:
 *       - Títulos a Receber
 *     summary: Retorna KPIs consolidados dos títulos a receber
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idFazenda
 *         schema:
 *           type: integer
 *         description: Filtrar por fazenda
 *       - in: query
 *         name: idSafra
 *         schema:
 *           type: integer
 *         description: Filtrar por safra
 *     responses:
 *       200:
 *         description: KPIs calculados com sucesso
 */
router.get('/kpis', requirePermission('tituloReceber.read'), asyncHandler(async (req, res) => {
  await getTituloReceberController().getKpis(req, res);
}));

/**
 * @swagger
 * /api/titulosReceber/{id}:
 *   get:
 *     tags:
 *       - Títulos a Receber
 *     summary: Busca um título a receber por ID
 *     description: Retorna um título a receber específico pelo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do título a receber
 *     responses:
 *       200:
 *         description: Título a receber encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TituloReceberResponseDto'
 *       404:
 *         description: Título a receber não encontrado
 */
router.get('/:id', requirePermission('tituloReceber.read'), asyncHandler(async (req, res) => {
  await getTituloReceberController().show(req, res);
}));

/**
 * @swagger
 * /api/titulosReceber:
 *   post:
 *     tags:
 *       - Títulos a Receber
 *     summary: Cria um novo título a receber
 *     description: Cria um novo título a receber no tenant atual, incluindo parcelas e rateios
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numeroTitulo
 *               - idCliente
 *               - dataLancamento
 *               - dataVencimento
 *               - valorTitulo
 *               - idMoeda
 *               - parcelas
 *             properties:
 *               numeroTitulo:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 example: "TR-2024-001"
 *               idCliente:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               idFazenda:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *               idSafra:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *               dataLancamento:
 *                 type: string
 *                 format: date
 *                 example: '2024-01-15'
 *               dataVencimento:
 *                 type: string
 *                 format: date
 *                 example: '2024-02-15'
 *               valorTitulo:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0.01
 *                 example: 10000.00
 *               idMoeda:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               observacao:
 *                 type: string
 *                 nullable: true
 *                 example: "Título referente à venda de produtos"
 *               parcelas:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - numeroParcela
 *                     - dataVencimento
 *                     - valorParcela
 *                   properties:
 *                     numeroParcela:
 *                       type: integer
 *                       minimum: 1
 *                     dataVencimento:
 *                       type: string
 *                       format: date
 *                     valorParcela:
 *                       type: number
 *                       format: decimal
 *                       minimum: 0.01
 *               rateiosPlanoConta:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - idPlanoContaGerencial
 *                     - percentualRateio
 *                   properties:
 *                     idPlanoContaGerencial:
 *                       type: integer
 *                       minimum: 1
 *                     percentualRateio:
 *                       type: number
 *                       format: decimal
 *                       minimum: 0
 *                       maximum: 100
 *               rateiosCentroCusto:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - idCentroCusto
 *                     - percentualRateio
 *                   properties:
 *                     idCentroCusto:
 *                       type: integer
 *                       minimum: 1
 *                     percentualRateio:
 *                       type: number
 *                       format: decimal
 *                       minimum: 0
 *                       maximum: 100
 *     responses:
 *       201:
 *         description: Título a receber criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TituloReceberResponseDto'
 *       400:
 *         description: Erro de validação
 *       403:
 *         description: Sem permissão ou relacionamento não pertence ao tenant
 */
router.post('/completo', requirePermission('tituloReceber.create'), validateDto(CreateTituloReceberCompletoDto), asyncHandler(async (req, res) => {
  await getTituloReceberController().createCompleto(req, res);
}));

router.post('/', requirePermission('tituloReceber.create'), validateDto(CreateTituloReceberDto), asyncHandler(async (req, res) => {
  await getTituloReceberController().create(req, res);
}));

/**
 * @swagger
 * /api/titulosReceber/{id}:
 *   put:
 *     tags:
 *       - Títulos a Receber
 *     summary: Atualiza um título a receber
 *     description: Atualiza um título a receber existente. Não permite atualizar se já tiver parcelas baixadas.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do título a receber
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Todos os campos são opcionais para atualização parcial
 *             properties:
 *               numeroTitulo:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               idCliente:
 *                 type: integer
 *                 minimum: 1
 *               idFazenda:
 *                 type: integer
 *                 nullable: true
 *               idSafra:
 *                 type: integer
 *                 nullable: true
 *               dataLancamento:
 *                 type: string
 *                 format: date
 *               dataVencimento:
 *                 type: string
 *                 format: date
 *               valorTitulo:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0.01
 *               idMoeda:
 *                 type: integer
 *                 minimum: 1
 *               observacao:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Título a receber atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TituloReceberResponseDto'
 *       400:
 *         description: Erro de validação ou tentativa de atualizar título com parcelas baixadas
 *       403:
 *         description: Sem permissão ou relacionamento não pertence ao tenant
 *       404:
 *         description: Título a receber não encontrado
 */
router.put('/:id', requirePermission('tituloReceber.update'), validateDtoUpdate(UpdateTituloReceberDto), asyncHandler(async (req, res) => {
  await getTituloReceberController().update(req, res);
}));

/**
 * @swagger
 * /api/titulosReceber/{id}:
 *   delete:
 *     tags:
 *       - Títulos a Receber
 *     summary: Deleta um título a receber
 *     description: Deleta um título a receber existente. Não permite deletar se já tiver parcelas baixadas.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do título a receber
 *     responses:
 *       204:
 *         description: Título a receber deletado com sucesso
 *       403:
 *         description: Sem permissão ou título possui parcelas baixadas
 *       404:
 *         description: Título a receber não encontrado
 */
router.delete('/:id', requirePermission('tituloReceber.delete'), asyncHandler(async (req, res) => {
  await getTituloReceberController().delete(req, res);
}));

/**
 * @swagger
 * /api/titulosReceber/{id}/cancelar:
 *   post:
 *     tags:
 *       - Títulos a Receber
 *     summary: Cancela um título a receber
 *     description: Cancela um título a receber, alterando seu status para CANCELADO
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do título a receber
 *     responses:
 *       200:
 *         description: Título a receber cancelado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TituloReceberResponseDto'
 *       403:
 *         description: Sem permissão ou título não pode ser cancelado
 *       404:
 *         description: Título a receber não encontrado
 */
router.post('/:id/cancelar', requirePermission('tituloReceber.delete'), asyncHandler(async (req, res) => {
  await getTituloReceberController().cancelar(req, res);
}));

export default router;
