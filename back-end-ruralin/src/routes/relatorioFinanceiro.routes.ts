import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IRelatorioFinanceiroController } from '../controllers/interfaces/IRelatorioFinanceiroController';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FiltroPlanejadoRealizadoDto:
 *       type: object
 *       required:
 *         - dataInicio
 *         - dataFim
 *       properties:
 *         dataInicio:
 *           type: string
 *           format: date
 *           example: '2024-01-01'
 *           description: Data inicial do período (YYYY-MM-DD)
 *         dataFim:
 *           type: string
 *           format: date
 *           example: '2024-12-31'
 *           description: Data final do período (YYYY-MM-DD)
 *         idSafra:
 *           type: integer
 *           nullable: true
 *           example: 1
 *           description: ID da safra (filtro opcional)
 *         idFazenda:
 *           type: integer
 *           nullable: true
 *           example: 1
 *           description: ID da fazenda (filtro opcional)
 *         idPlanoContaGerencial:
 *           type: integer
 *           nullable: true
 *           example: 1
 *           description: ID do plano de contas gerencial (filtro opcional)
 *         idCentroCusto:
 *           type: integer
 *           nullable: true
 *           example: 1
 *           description: ID do centro de custo (filtro opcional)
 *         tipo:
 *           type: string
 *           enum: [PAGAR, RECEBER, TODOS]
 *           default: TODOS
 *           example: TODOS
 *           description: Tipo de título (PAGAR, RECEBER ou TODOS)
 *     PlanejadoRealizadoDto:
 *       type: object
 *       properties:
 *         idPlanoContaGerencial:
 *           type: integer
 *           example: 1
 *         itemPlanoConta:
 *           type: string
 *           example: "1.1.2.0"
 *         descricaoPlanoConta:
 *           type: string
 *           example: "Insumos Agrícolas"
 *         idCentroCusto:
 *           type: integer
 *           example: 1
 *         codigoCentroCusto:
 *           type: string
 *           example: "CC001"
 *         nomeCentroCusto:
 *           type: string
 *           example: "Fazenda Santa Maria"
 *         valorPlanejado:
 *           type: number
 *           format: decimal
 *           example: 100000.00
 *           description: Valor planejado (soma dos rateios de títulos não baixados)
 *         valorRealizado:
 *           type: number
 *           format: decimal
 *           example: 75000.00
 *           description: Valor realizado (soma dos movimentos financeiros)
 *         diferenca:
 *           type: number
 *           format: decimal
 *           example: -25000.00
 *           description: Diferença entre realizado e planejado (realizado - planejado)
 *         percentualRealizacao:
 *           type: number
 *           format: decimal
 *           example: 75.00
 *           description: Percentual de realização (realizado / planejado * 100)
 *         idSafra:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         nomeSafra:
 *           type: string
 *           nullable: true
 *           example: "Safra 2024/2025"
 *         dataInicio:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: '2024-01-01'
 *         dataFim:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: '2024-12-31'
 */

function getRelatorioFinanceiroController(): IRelatorioFinanceiroController {
  return container.resolve<IRelatorioFinanceiroController>(TYPES.IRelatorioFinanceiroController);
}

/**
 * @swagger
 * /api/relatorios/planejado-realizado:
 *   get:
 *     tags:
 *       - Relatórios Financeiros
 *     summary: Calcula relatório de Planejado vs Realizado
 *     description: |
 *       Retorna um relatório comparando valores planejados (títulos não baixados) 
 *       com valores realizados (movimentos financeiros de parcelas baixadas), 
 *       agrupado por Plano de Contas Gerencial e Centro de Custo.
 *       
 *       O relatório permite filtrar por:
 *       - Período (obrigatório)
 *       - Safra (opcional)
 *       - Fazenda (opcional)
 *       - Plano de Contas Gerencial (opcional)
 *       - Centro de Custo (opcional)
 *       - Tipo de título - PAGAR, RECEBER ou TODOS (opcional)
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
 *         example: '2024-01-01'
 *       - in: query
 *         name: dataFim
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período (YYYY-MM-DD)
 *         example: '2024-12-31'
 *       - in: query
 *         name: idSafra
 *         schema:
 *           type: integer
 *         description: ID da safra (filtro opcional)
 *         example: 1
 *       - in: query
 *         name: idFazenda
 *         schema:
 *           type: integer
 *         description: ID da fazenda (filtro opcional)
 *         example: 1
 *       - in: query
 *         name: idPlanoContaGerencial
 *         schema:
 *           type: integer
 *         description: ID do plano de contas gerencial (filtro opcional)
 *         example: 1
 *       - in: query
 *         name: idCentroCusto
 *         schema:
 *           type: integer
 *         description: ID do centro de custo (filtro opcional)
 *         example: 1
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [PAGAR, RECEBER, TODOS]
 *           default: TODOS
 *         description: Tipo de título (PAGAR, RECEBER ou TODOS)
 *         example: TODOS
 *     responses:
 *       200:
 *         description: Relatório calculado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlanejadoRealizadoDto'
 *             example:
 *               - idPlanoContaGerencial: 1
 *                 itemPlanoConta: "1.1.2.0"
 *                 descricaoPlanoConta: "Insumos Agrícolas"
 *                 idCentroCusto: 1
 *                 codigoCentroCusto: "CC001"
 *                 nomeCentroCusto: "Fazenda Santa Maria"
 *                 valorPlanejado: 100000.00
 *                 valorRealizado: 75000.00
 *                 diferenca: -25000.00
 *                 percentualRealizacao: 75.00
 *       400:
 *         description: Parâmetros inválidos ou ausentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Parâmetros obrigatórios ausentes"
 *                 message:
 *                   type: string
 *                   example: "Os parâmetros dataInicio e dataFim são obrigatórios"
 *       403:
 *         description: Sem permissão
 */
router.get('/planejado-realizado', requirePermission('financeiro.relatorio.planejadoRealizado'), asyncHandler(async (req, res) => {
  await getRelatorioFinanceiroController().planejadoRealizado(req, res);
}));

/**
 * @swagger
 * /api/relatorios/planejado-realizado/exportar:
 *   get:
 *     tags:
 *       - Relatórios Financeiros
 *     summary: Exporta relatório de Planejado vs Realizado
 *     description: |
 *       Exporta o relatório de Planejado vs Realizado em formato JSON para download.
 *       Por enquanto, apenas formato JSON é suportado. Futuramente pode ser estendido 
 *       para Excel, PDF, etc.
 *       
 *       Aceita os mesmos filtros do endpoint de consulta.
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
 *         example: '2024-01-01'
 *       - in: query
 *         name: dataFim
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período (YYYY-MM-DD)
 *         example: '2024-12-31'
 *       - in: query
 *         name: idSafra
 *         schema:
 *           type: integer
 *         description: ID da safra (filtro opcional)
 *         example: 1
 *       - in: query
 *         name: idFazenda
 *         schema:
 *           type: integer
 *         description: ID da fazenda (filtro opcional)
 *         example: 1
 *       - in: query
 *         name: idPlanoContaGerencial
 *         schema:
 *           type: integer
 *         description: ID do plano de contas gerencial (filtro opcional)
 *         example: 1
 *       - in: query
 *         name: idCentroCusto
 *         schema:
 *           type: integer
 *         description: ID do centro de custo (filtro opcional)
 *         example: 1
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [PAGAR, RECEBER, TODOS]
 *           default: TODOS
 *         description: Tipo de título (PAGAR, RECEBER ou TODOS)
 *         example: TODOS
 *       - in: query
 *         name: formato
 *         schema:
 *           type: string
 *           enum: [json]
 *           default: json
 *         description: Formato de exportação (por enquanto apenas JSON)
 *         example: json
 *     responses:
 *       200:
 *         description: Arquivo JSON para download
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlanejadoRealizadoDto'
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: 'attachment; filename="planejado-realizado-2024-01-01-2024-12-31.json"'
 *       400:
 *         description: Parâmetros inválidos ou formato não suportado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Formato de exportação não suportado"
 *                 message:
 *                   type: string
 *                   example: 'Formato "excel" não é suportado. Use "json".'
 *       403:
 *         description: Sem permissão
 */
router.get('/planejado-realizado/exportar', requirePermission('financeiro.relatorio.planejadoRealizado'), asyncHandler(async (req, res) => {
  await getRelatorioFinanceiroController().exportarRelatorio(req, res);
}));

export default router;
