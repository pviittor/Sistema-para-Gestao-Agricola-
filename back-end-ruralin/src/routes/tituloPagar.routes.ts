import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { ITituloPagarController } from '../controllers/interfaces/ITituloPagarController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateTituloPagarDto, UpdateTituloPagarDto } from '../application/dto/tituloPagar';
import { CreateTituloPagarCompletoDto } from '../application/dto/tituloPagar/CreateTituloPagarCompletoDto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TituloPagarResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *           description: ID único do título a pagar
 *         tenantId:
 *           type: integer
 *           example: 1
 *           description: ID do tenant (multi-tenancy)
 *         numeroTitulo:
 *           type: string
 *           example: "TP-2024-001"
 *           description: Número único do título no tenant
 *         idFornecedor:
 *           type: integer
 *           example: 1
 *           description: ID do fornecedor (pessoa)
 *         idPortador:
 *           type: integer
 *           example: 2
 *           description: ID do portador (pessoa)
 *         idProdutor:
 *           type: integer
 *           example: 3
 *           description: ID do produtor (pessoa)
 *         idFazenda:
 *           type: integer
 *           nullable: true
 *           example: 1
 *           description: ID da fazenda (opcional)
 *         idSafra:
 *           type: integer
 *           nullable: true
 *           example: 1
 *           description: ID da safra (opcional)
 *         idMoeda:
 *           type: integer
 *           example: 1
 *           description: ID da moeda
 *         dataLancamento:
 *           type: string
 *           format: date
 *           example: '2024-01-15'
 *           description: Data de lançamento do título (YYYY-MM-DD)
 *         valorTitulo:
 *           type: number
 *           format: decimal
 *           example: 10000.00
 *           description: Valor total do título
 *         valorTituloMoedaOriginal:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           example: 10000.00
 *           description: Valor do título na moeda original
 *         valorTituloMoedaPadrao:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           example: 10000.00
 *           description: Valor do título convertido para moeda padrão (BRL)
 *         quantidadeParcelas:
 *           type: integer
 *           example: 3
 *           description: Quantidade de parcelas do título
 *         status:
 *           type: string
 *           enum: [ABERTO, PARCIAL, BAIXADO, CANCELADO]
 *           example: ABERTO
 *           description: Status do título
 *         impostoRenda:
 *           type: boolean
 *           example: false
 *           description: Se o título está sujeito a imposto de renda
 *         observacao:
 *           type: string
 *           nullable: true
 *           example: "Título referente à compra de insumos"
 *           description: Observações sobre o título
 *         usercreation:
 *           type: integer
 *           example: 1
 *           description: ID do usuário que criou o título
 *         datecreation:
 *           type: string
 *           format: date-time
 *           example: '2024-01-15T10:00:00.000Z'
 *           description: Data e hora de criação
 *         fornecedor:
 *           type: object
 *           nullable: true
 *           description: Dados do fornecedor (quando incluído)
 *         portador:
 *           type: object
 *           nullable: true
 *           description: Dados do portador (quando incluído)
 *         produtor:
 *           type: object
 *           nullable: true
 *           description: Dados do produtor (quando incluído)
 *         fazenda:
 *           type: object
 *           nullable: true
 *           description: Dados da fazenda (quando incluído)
 *         safra:
 *           type: object
 *           nullable: true
 *           description: Dados da safra (quando incluído)
 *         moeda:
 *           type: object
 *           nullable: true
 *           description: Dados da moeda (quando incluído)
 *         parcelas:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ParcelaTituloPagarResponseDto'
 *           description: Lista de parcelas do título (quando incluído)
 *     ParcelaTituloPagarResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         idTituloPagar:
 *           type: integer
 *           example: 1
 *         numeroParcela:
 *           type: integer
 *           example: 1
 *         dataVencimento:
 *           type: string
 *           format: date
 *           example: '2024-02-15'
 *         valorParcela:
 *           type: number
 *           format: decimal
 *           example: 10000.00
 *         status:
 *           type: string
 *           enum: [ABERTA, BAIXADA, CANCELADA]
 *           example: ABERTA
 *     RateioPlanoContaTituloPagarResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         idTituloPagar:
 *           type: integer
 *           example: 1
 *         idPlanoContaGerencial:
 *           type: integer
 *           example: 10
 *         valorRateio:
 *           type: number
 *           format: decimal
 *           example: 18000.00
 *         percentualRateio:
 *           type: number
 *           format: decimal
 *           example: 60.00
 *         observacao:
 *           type: string
 *           nullable: true
 *     RateioCentroCustoTituloPagarResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         idTituloPagar:
 *           type: integer
 *           example: 1
 *         idCentroCusto:
 *           type: integer
 *           example: 5
 *         valorRateio:
 *           type: number
 *           format: decimal
 *           example: 15000.00
 *         percentualRateio:
 *           type: number
 *           format: decimal
 *           example: 50.00
 *         observacao:
 *           type: string
 *           nullable: true
 *     CreateTituloPagarCompletoRequest:
 *       type: object
 *       required:
 *         - numeroTitulo
 *         - idFornecedor
 *         - idPortador
 *         - idProdutor
 *         - idFazenda
 *         - idSafra
 *         - idMoeda
 *         - dataLancamento
 *         - valorTitulo
 *         - parcelas
 *       properties:
 *         numeroTitulo:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "TP-2024-001"
 *           description: Número único do título no tenant
 *         idFornecedor:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *           description: ID do fornecedor (pessoa marcada como fornecedor)
 *         idPortador:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *           description: ID do portador (pessoa marcada como portador)
 *         idProdutor:
 *           type: integer
 *           minimum: 1
 *           example: 3
 *           description: ID do produtor (pessoa marcada como produtor)
 *         idFazenda:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *           description: ID da fazenda
 *         idSafra:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *           description: ID da safra
 *         idMoeda:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *           description: ID da moeda
 *         dataLancamento:
 *           type: string
 *           format: date
 *           example: '2024-01-15'
 *           description: Data de lançamento (YYYY-MM-DD)
 *         valorTitulo:
 *           type: number
 *           format: decimal
 *           minimum: 0.01
 *           example: 30000.00
 *           description: Valor total do título (deve ser igual à soma das parcelas)
 *         observacao:
 *           type: string
 *           nullable: true
 *           example: "Título referente à compra de insumos"
 *         impostoRenda:
 *           type: boolean
 *           default: false
 *           example: false
 *         status:
 *           type: string
 *           enum: [ABERTO, PARCIAL, BAIXADO, CANCELADO]
 *           default: ABERTO
 *           example: ABERTO
 *         parcelas:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/ParcelaTituloPagarRequest'
 *           description: Array de parcelas (soma dos valores deve ser igual a valorTitulo)
 *         rateiosPlanoConta:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RateioPlanoContaRequest'
 *           description: Array de rateios por plano de contas (opcional, soma deve ser igual a valorTitulo)
 *         rateiosCentroCusto:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RateioCentroCustoRequest'
 *           description: Array de rateios por centro de custo (opcional, soma deve ser igual a valorTitulo)
 *     ParcelaTituloPagarRequest:
 *       type: object
 *       required:
 *         - numeroParcela
 *         - dataVencimento
 *         - valorParcela
 *       properties:
 *         numeroParcela:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *           description: Número sequencial da parcela (1, 2, 3...)
 *         dataVencimento:
 *           type: string
 *           format: date
 *           example: '2024-02-15'
 *           description: Data de vencimento da parcela (YYYY-MM-DD)
 *         valorParcela:
 *           type: number
 *           format: decimal
 *           minimum: 0.01
 *           example: 10000.00
 *           description: Valor da parcela
 *         observacao:
 *           type: string
 *           nullable: true
 *           example: "Primeira parcela"
 *         status:
 *           type: string
 *           enum: [ABERTA, BAIXADA, CANCELADA]
 *           default: ABERTA
 *           example: ABERTA
 *     RateioPlanoContaRequest:
 *       type: object
 *       required:
 *         - idPlanoContaGerencial
 *         - valorRateio
 *       properties:
 *         idPlanoContaGerencial:
 *           type: integer
 *           minimum: 1
 *           example: 10
 *           description: ID do plano de contas gerencial
 *         valorRateio:
 *           type: number
 *           format: decimal
 *           minimum: 0.01
 *           example: 18000.00
 *           description: Valor do rateio (soma deve ser igual a valorTitulo)
 *         percentualRateio:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           maximum: 100
 *           example: 60.00
 *           description: Percentual do rateio (calculado automaticamente se não informado)
 *         observacao:
 *           type: string
 *           nullable: true
 *           example: "60% em insumos agrícolas"
 *     RateioCentroCustoRequest:
 *       type: object
 *       required:
 *         - idCentroCusto
 *         - valorRateio
 *       properties:
 *         idCentroCusto:
 *           type: integer
 *           minimum: 1
 *           example: 5
 *           description: ID do centro de custo
 *         valorRateio:
 *           type: number
 *           format: decimal
 *           minimum: 0.01
 *           example: 15000.00
 *           description: Valor do rateio (soma deve ser igual a valorTitulo)
 *         percentualRateio:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           maximum: 100
 *           example: 50.00
 *           description: Percentual do rateio (calculado automaticamente se não informado)
 *         observacao:
 *           type: string
 *           nullable: true
 *           example: "50% no centro de custo Fazenda Norte"
 */

function getTituloPagarController(): ITituloPagarController {
  return container.resolve<ITituloPagarController>(TYPES.ITituloPagarController);
}

/**
 * @swagger
 * /api/titulosPagar:
 *   get:
 *     tags:
 *       - Títulos a Pagar
 *     summary: Lista títulos a pagar
 *     description: Retorna uma lista paginada de títulos a pagar do tenant atual
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
 *         description: Lista de títulos a pagar retornada com sucesso
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
 *                         $ref: '#/components/schemas/TituloPagarResponseDto'
 *       401:
 *         description: Não autenticado - Token de autenticação ausente ou inválido
 *       403:
 *         description: Sem permissão - Usuário não possui permissão 'tituloPagar.read'
 */
router.get('/', requirePermission('tituloPagar.read'), asyncHandler(async (req, res) => {
  await getTituloPagarController().index(req, res);
}));

/**
 * @swagger
 * /api/titulosPagar/safra/{idSafra}:
 *   get:
 *     tags:
 *       - Títulos a Pagar
 *     summary: Busca títulos a pagar por safra
 *     description: Retorna uma lista paginada de títulos a pagar de uma safra específica
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
 *         description: Lista de títulos a pagar
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
 *                         $ref: '#/components/schemas/TituloPagarResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Safra não encontrada ou não pertence ao tenant atual
 */
router.get('/safra/:idSafra', requirePermission('tituloPagar.read'), asyncHandler(async (req, res) => {
  await getTituloPagarController().findBySafra(req, res);
}));

/**
 * @swagger
 * /api/titulosPagar/fazenda/{idFazenda}:
 *   get:
 *     tags:
 *       - Títulos a Pagar
 *     summary: Busca títulos a pagar por fazenda
 *     description: Retorna uma lista paginada de títulos a pagar de uma fazenda específica
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
 *         description: Lista de títulos a pagar
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
 *                         $ref: '#/components/schemas/TituloPagarResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Fazenda não encontrada ou não pertence ao tenant atual
 */
router.get('/fazenda/:idFazenda', requirePermission('tituloPagar.read'), asyncHandler(async (req, res) => {
  await getTituloPagarController().findByFazenda(req, res);
}));

/**
 * @swagger
 * /api/titulosPagar/fornecedor/{idFornecedor}:
 *   get:
 *     tags:
 *       - Títulos a Pagar
 *     summary: Busca títulos a pagar por fornecedor
 *     description: Retorna uma lista paginada de títulos a pagar de um fornecedor específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idFornecedor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do fornecedor
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
 *         description: Lista de títulos a pagar
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
 *                         $ref: '#/components/schemas/TituloPagarResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Fornecedor não encontrado ou não pertence ao tenant atual
 */
router.get('/fornecedor/:idFornecedor', requirePermission('tituloPagar.read'), asyncHandler(async (req, res) => {
  await getTituloPagarController().findByFornecedor(req, res);
}));

/**
 * @swagger
 * /api/titulosPagar/status/{status}:
 *   get:
 *     tags:
 *       - Títulos a Pagar
 *     summary: Busca títulos a pagar por status
 *     description: Retorna uma lista paginada de títulos a pagar com um status específico
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
 *         description: Lista de títulos a pagar
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
 *                         $ref: '#/components/schemas/TituloPagarResponseDto'
 *       400:
 *         description: "Status inválido - Deve ser um dos valores: ABERTO, PARCIAL, BAIXADO, CANCELADO"
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/status/:status', requirePermission('tituloPagar.read'), asyncHandler(async (req, res) => {
  await getTituloPagarController().findByStatus(req, res);
}));

/**
 * @swagger
 * /api/titulosPagar/dataLancamento:
 *   get:
 *     tags:
 *       - Títulos a Pagar
 *     summary: Busca títulos a pagar por período de lançamento
 *     description: Retorna uma lista paginada de títulos a pagar lançados em um período específico
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
 *         description: Lista de títulos a pagar
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
 *                         $ref: '#/components/schemas/TituloPagarResponseDto'
 *       400:
 *         description: Parâmetros de data inválidos - dataInicio e dataFim são obrigatórios e devem estar no formato YYYY-MM-DD
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/dataLancamento', requirePermission('tituloPagar.read'), asyncHandler(async (req, res) => {
  await getTituloPagarController().findByDataLancamento(req, res);
}));

/**
 * @swagger
 * /api/titulosPagar/kpis:
 *   get:
 *     tags:
 *       - Títulos a Pagar
 *     summary: Retorna KPIs consolidados dos títulos a pagar
 *     description: Calcula métricas a nível de parcela (total aberto, vencido, a vencer 30 dias, baixado no mês)
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
router.get('/kpis', requirePermission('tituloPagar.read'), asyncHandler(async (req, res) => {
  await getTituloPagarController().getKpis(req, res);
}));

/**
 * @swagger
 * /api/titulosPagar/{id}:
 *   get:
 *     tags:
 *       - Títulos a Pagar
 *     summary: Busca um título a pagar por ID
 *     description: Retorna um título a pagar específico pelo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do título a pagar
 *     responses:
 *       200:
 *         description: Título a pagar encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TituloPagarResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Título a pagar não encontrado ou não pertence ao tenant atual
 */
router.get('/:id', requirePermission('tituloPagar.read'), asyncHandler(async (req, res) => {
  await getTituloPagarController().show(req, res);
}));

/**
 * @swagger
 * /api/titulosPagar/completo:
 *   post:
 *     tags:
 *       - Títulos a Pagar
 *     summary: Cria um título a pagar completo com parcelas e rateios
 *     description: |
 *       Cria um título a pagar com todas as parcelas e rateios em uma única requisição transacional.
 *       
 *       **Validações importantes:**
 *       - A soma dos valores das parcelas deve ser igual ao valorTitulo
 *       - Se informados, a soma dos rateiosPlanoConta deve ser igual ao valorTitulo
 *       - Se informados, a soma dos rateiosCentroCusto deve ser igual ao valorTitulo
 *       - O idTituloPagar nas parcelas e rateios será preenchido automaticamente
 *       - Todos os relacionamentos (fornecedor, portador, produtor, fazenda, safra, moeda) devem pertencer ao mesmo tenant
 *       - O número do título deve ser único no tenant
 *       
 *       **Conversão de moeda:**
 *       - Se a moeda informada não for a moeda padrão (BRL), os valores serão convertidos automaticamente
 *       - Os valores convertidos serão armazenados em valorTituloMoedaOriginal e valorTituloMoedaPadrao
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTituloPagarCompletoRequest'
 *           examples:
 *             exemploCompleto:
 *               summary: Exemplo completo com parcelas e rateios
 *               value:
 *                 numeroTitulo: "TP-2024-001"
 *                 idFornecedor: 1
 *                 idPortador: 2
 *                 idProdutor: 3
 *                 idFazenda: 1
 *                 idSafra: 1
 *                 idMoeda: 1
 *                 dataLancamento: "2024-01-15"
 *                 valorTitulo: 30000.00
 *                 observacao: "Título referente à compra de insumos agrícolas"
 *                 impostoRenda: false
 *                 status: "ABERTO"
 *                 parcelas:
 *                   - numeroParcela: 1
 *                     dataVencimento: "2024-02-15"
 *                     valorParcela: 10000.00
 *                     observacao: "Primeira parcela"
 *                   - numeroParcela: 2
 *                     dataVencimento: "2024-03-15"
 *                     valorParcela: 10000.00
 *                     observacao: "Segunda parcela"
 *                   - numeroParcela: 3
 *                     dataVencimento: "2024-04-15"
 *                     valorParcela: 10000.00
 *                     observacao: "Terceira parcela"
 *                 rateiosPlanoConta:
 *                   - idPlanoContaGerencial: 10
 *                     valorRateio: 18000.00
 *                     percentualRateio: 60.00
 *                     observacao: "60% em insumos agrícolas"
 *                   - idPlanoContaGerencial: 11
 *                     valorRateio: 12000.00
 *                     percentualRateio: 40.00
 *                     observacao: "40% em serviços agrícolas"
 *                 rateiosCentroCusto:
 *                   - idCentroCusto: 5
 *                     valorRateio: 15000.00
 *                     percentualRateio: 50.00
 *                     observacao: "50% no centro de custo Fazenda Norte"
 *                   - idCentroCusto: 6
 *                     valorRateio: 15000.00
 *                     percentualRateio: 50.00
 *                     observacao: "50% no centro de custo Fazenda Sul"
 *             exemploMinimo:
 *               summary: Exemplo mínimo apenas com parcelas
 *               value:
 *                 numeroTitulo: "TP-2024-002"
 *                 idFornecedor: 1
 *                 idPortador: 2
 *                 idProdutor: 3
 *                 idFazenda: 1
 *                 idSafra: 1
 *                 idMoeda: 1
 *                 dataLancamento: "2024-01-15"
 *                 valorTitulo: 15000.00
 *                 parcelas:
 *                   - numeroParcela: 1
 *                     dataVencimento: "2024-02-15"
 *                     valorParcela: 15000.00
 *     responses:
 *       201:
 *         description: Título a pagar criado com sucesso com todas as parcelas e rateios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TituloPagarResponseDto'
 *             example:
 *               id: 1
 *               tenantId: 1
 *               numeroTitulo: "TP-2024-001"
 *               idFornecedor: 1
 *               idPortador: 2
 *               idProdutor: 3
 *               idFazenda: 1
 *               idSafra: 1
 *               idMoeda: 1
 *               dataLancamento: "2024-01-15"
 *               valorTitulo: 30000.00
 *               quantidadeParcelas: 3
 *               status: "ABERTO"
 *               impostoRenda: false
 *               observacao: "Título referente à compra de insumos agrícolas"
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "SOMA_PARCELAS_DIFERENTE_VALOR_TITULO"
 *                 message:
 *                   type: string
 *                   example: "A soma dos valores das parcelas (30000.00) deve ser igual ao valor do título (30000.00)."
 *             examples:
 *               somaParcelasIncorreta:
 *                 summary: Soma de parcelas diferente do valor do título
 *                 value:
 *                   error: "SOMA_PARCELAS_DIFERENTE_VALOR_TITULO"
 *                   message: "A soma dos valores das parcelas (25000.00) deve ser igual ao valor do título (30000.00)."
 *               numeroTituloDuplicado:
 *                 summary: Número de título já existe
 *                 value:
 *                   error: "NUMERO_TITULO_DUPLICADO"
 *                   message: "Já existe um título com o número \"TP-2024-001\" para este tenant."
 *       403:
 *         description: Sem permissão ou relacionamento não pertence ao tenant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "CROSS_TENANT_ACCESS_DENIED"
 *                 message:
 *                   type: string
 *                   example: "O fornecedor informado não pertence ao tenant atual."
 */
router.post('/completo', requirePermission('tituloPagar.create'), validateDto(CreateTituloPagarCompletoDto), asyncHandler(async (req, res) => {
  await getTituloPagarController().createCompleto(req, res);
}));

/**
 * @swagger
 * /api/titulosPagar:
 *   post:
 *     tags:
 *       - Títulos a Pagar
 *     summary: Cria um novo título a pagar
 *     description: |
 *       Cria um novo título a pagar no tenant atual.
 *       
 *       **Nota:** Para criar um título com parcelas e rateios em uma única requisição transacional,
 *       use o endpoint `/api/titulosPagar/completo` que garante atomicidade na criação.
 *       
 *       Este endpoint cria apenas o título. As parcelas e rateios devem ser criados em requisições separadas.
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
 *               - idFornecedor
 *               - idPortador
 *               - idProdutor
 *               - idFazenda
 *               - idSafra
 *               - idMoeda
 *               - dataLancamento
 *               - valorTitulo
 *             properties:
 *               numeroTitulo:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "TP-2024-001"
 *                 description: Número único do título no tenant
 *               idFornecedor:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: ID do fornecedor (pessoa marcada como fornecedor)
 *               idPortador:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *                 description: ID do portador (pessoa marcada como portador)
 *               idProdutor:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *                 description: ID do produtor (pessoa marcada como produtor)
 *               idFazenda:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: ID da fazenda
 *               idSafra:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: ID da safra
 *               idMoeda:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: ID da moeda
 *               dataLancamento:
 *                 type: string
 *                 format: date
 *                 example: '2024-01-15'
 *                 description: Data de lançamento (YYYY-MM-DD)
 *               valorTitulo:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0.01
 *                 example: 10000.00
 *                 description: Valor total do título
 *               observacao:
 *                 type: string
 *                 nullable: true
 *                 example: "Título referente à compra de insumos"
 *                 description: Observações sobre o título
 *               impostoRenda:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *                 description: Se o título está sujeito a imposto de renda
 *               status:
 *                 type: string
 *                 enum: [ABERTO, PARCIAL, BAIXADO, CANCELADO]
 *                 default: ABERTO
 *                 example: ABERTO
 *                 description: Status inicial do título
 *     responses:
 *       201:
 *         description: Título a pagar criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TituloPagarResponseDto'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *       403:
 *         description: Sem permissão ou relacionamento não pertence ao tenant
 *       401:
 *         description: Não autenticado
 */
router.post('/', requirePermission('tituloPagar.create'), validateDto(CreateTituloPagarDto), asyncHandler(async (req, res) => {
  await getTituloPagarController().create(req, res);
}));

/**
 * @swagger
 * /api/titulosPagar/{id}:
 *   put:
 *     tags:
 *       - Títulos a Pagar
 *     summary: Atualiza um título a pagar
 *     description: Atualiza um título a pagar existente. Não permite atualizar se já tiver parcelas baixadas.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do título a pagar
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
 *               idFornecedor:
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
 *         description: Título a pagar atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TituloPagarResponseDto'
 *       400:
 *         description: Erro de validação ou tentativa de atualizar título com parcelas baixadas
 *       403:
 *         description: Sem permissão ou relacionamento não pertence ao tenant
 *       404:
 *         description: Título a pagar não encontrado
 */
router.put('/:id', requirePermission('tituloPagar.update'), validateDtoUpdate(UpdateTituloPagarDto), asyncHandler(async (req, res) => {
  await getTituloPagarController().update(req, res);
}));

/**
 * @swagger
 * /api/titulosPagar/{id}:
 *   delete:
 *     tags:
 *       - Títulos a Pagar
 *     summary: Deleta um título a pagar
 *     description: Deleta um título a pagar existente. Não permite deletar se já tiver parcelas baixadas.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do título a pagar
 *     responses:
 *       204:
 *         description: Título a pagar deletado com sucesso
 *       403:
 *         description: Sem permissão ou título possui parcelas baixadas
 *       404:
 *         description: Título a pagar não encontrado
 */
router.delete('/:id', requirePermission('tituloPagar.delete'), asyncHandler(async (req, res) => {
  await getTituloPagarController().delete(req, res);
}));

/**
 * @swagger
 * /api/titulosPagar/{id}/cancelar:
 *   post:
 *     tags:
 *       - Títulos a Pagar
 *     summary: Cancela um título a pagar
 *     description: Cancela um título a pagar, alterando seu status para CANCELADO
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do título a pagar
 *     responses:
 *       200:
 *         description: Título a pagar cancelado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TituloPagarResponseDto'
 *       403:
 *         description: Sem permissão ou título não pode ser cancelado
 *       404:
 *         description: Título a pagar não encontrado
 */
router.post('/:id/cancelar', requirePermission('tituloPagar.delete'), asyncHandler(async (req, res) => {
  await getTituloPagarController().cancelar(req, res);
}));

export default router;
