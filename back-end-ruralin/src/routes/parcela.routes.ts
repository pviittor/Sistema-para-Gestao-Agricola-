import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IParcelaController } from '../controllers/interfaces/IParcelaController';
import { validateDto } from '../middleware/validation';
import { BaixaParcelaTituloPagarDto } from '../application/dto/parcelaTituloPagar/BaixaParcelaTituloPagarDto';
import { BaixaParcelaTituloReceberDto } from '../application/dto/parcelaTituloReceber/BaixaParcelaTituloReceberDto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     BaixaParcelaTituloPagarDto:
 *       type: object
 *       required:
 *         - dataBaixa
 *         - valorBaixa
 *       properties:
 *         dataBaixa:
 *           type: string
 *           format: date
 *           example: '2024-02-15'
 *           description: Data da baixa da parcela
 *         valorBaixa:
 *           type: number
 *           format: decimal
 *           minimum: 0.01
 *           example: 5000.00
 *           description: Valor da baixa (pode ser parcial ou total)
 *         observacao:
 *           type: string
 *           nullable: true
 *           example: "Baixa realizada via transferência bancária"
 *           description: Observações sobre a baixa
 *     BaixaParcelaTituloReceberDto:
 *       type: object
 *       required:
 *         - dataBaixa
 *         - valorBaixa
 *       properties:
 *         dataBaixa:
 *           type: string
 *           format: date
 *           example: '2024-02-15'
 *           description: Data da baixa da parcela
 *         valorBaixa:
 *           type: number
 *           format: decimal
 *           minimum: 0.01
 *           example: 5000.00
 *           description: Valor da baixa (pode ser parcial ou total)
 *         observacao:
 *           type: string
 *           nullable: true
 *           example: "Recebimento realizado via depósito"
 *           description: Observações sobre a baixa
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
 *         valorBaixa:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           example: 5000.00
 *         dataBaixa:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: '2024-02-15'
 *         status:
 *           type: string
 *           enum: [ABERTA, BAIXADA, CANCELADA]
 *           example: PARCIAL
 *         observacao:
 *           type: string
 *           nullable: true
 *     ParcelaTituloReceberResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         idTituloReceber:
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
 *         valorBaixa:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           example: 5000.00
 *         dataBaixa:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: '2024-02-15'
 *         status:
 *           type: string
 *           enum: [ABERTA, BAIXADA, CANCELADA]
 *           example: PARCIAL
 *         observacao:
 *           type: string
 *           nullable: true
 *     MovimentoFinanceiroTituloPagarResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         idParcelaTituloPagar:
 *           type: integer
 *           example: 1
 *         idTituloPagar:
 *           type: integer
 *           example: 1
 *         idPlanoContaGerencial:
 *           type: integer
 *           example: 1
 *         idCentroCusto:
 *           type: integer
 *           example: 1
 *         dataMovimento:
 *           type: string
 *           format: date
 *           example: '2024-02-15'
 *         valorMovimento:
 *           type: number
 *           format: decimal
 *           example: 5000.00
 *         percentualRateioPlanoConta:
 *           type: number
 *           format: decimal
 *           example: 50.00
 *         percentualRateioCentroCusto:
 *           type: number
 *           format: decimal
 *           example: 100.00
 *     MovimentoFinanceiroTituloReceberResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         idParcelaTituloReceber:
 *           type: integer
 *           example: 1
 *         idTituloReceber:
 *           type: integer
 *           example: 1
 *         idPlanoContaGerencial:
 *           type: integer
 *           example: 1
 *         idCentroCusto:
 *           type: integer
 *           example: 1
 *         dataMovimento:
 *           type: string
 *           format: date
 *           example: '2024-02-15'
 *         valorMovimento:
 *           type: number
 *           format: decimal
 *           example: 5000.00
 *         percentualRateioPlanoConta:
 *           type: number
 *           format: decimal
 *           example: 50.00
 *         percentualRateioCentroCusto:
 *           type: number
 *           format: decimal
 *           example: 100.00
 */

function getParcelaController(): IParcelaController {
  return container.resolve<IParcelaController>(TYPES.IParcelaController);
}

/**
 * @swagger
 * /api/parcelas/tituloPagar/{idParcela}/baixar:
 *   post:
 *     tags:
 *       - Parcelas
 *     summary: Baixa uma parcela de título a pagar
 *     description: Realiza a baixa parcial ou total de uma parcela de título a pagar. Cria movimentos financeiros automaticamente baseados nos rateios do título.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idParcela
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da parcela de título a pagar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BaixaParcelaTituloPagarDto'
 *     responses:
 *       200:
 *         description: Parcela baixada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParcelaTituloPagarResponseDto'
 *       400:
 *         description: Erro de validação ou regra de negócio violada
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
 *         description: Sem permissão ou parcela não pode ser baixada
 *       404:
 *         description: Parcela não encontrada
 */
router.post(
  '/tituloPagar/:idParcela/baixar',
  requirePermission('tituloPagar.baixar'),
  validateDto(BaixaParcelaTituloPagarDto),
  asyncHandler(async (req, res) => {
    await getParcelaController().baixarParcelaTituloPagar(req, res);
  })
);

/**
 * @swagger
 * /api/parcelas/tituloReceber/{idParcela}/baixar:
 *   post:
 *     tags:
 *       - Parcelas
 *     summary: Baixa uma parcela de título a receber
 *     description: Realiza a baixa parcial ou total de uma parcela de título a receber. Cria movimentos financeiros automaticamente baseados nos rateios do título.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idParcela
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da parcela de título a receber
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BaixaParcelaTituloReceberDto'
 *     responses:
 *       200:
 *         description: Parcela baixada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParcelaTituloReceberResponseDto'
 *       400:
 *         description: Erro de validação ou regra de negócio violada
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
 *         description: Sem permissão ou parcela não pode ser baixada
 *       404:
 *         description: Parcela não encontrada
 */
router.post(
  '/tituloReceber/:idParcela/baixar',
  requirePermission('tituloReceber.baixar'),
  validateDto(BaixaParcelaTituloReceberDto),
  asyncHandler(async (req, res) => {
    await getParcelaController().baixarParcelaTituloReceber(req, res);
  })
);

/**
 * @swagger
 * /api/parcelas/tituloPagar/{idParcela}/movimentos:
 *   get:
 *     tags:
 *       - Parcelas
 *     summary: Consulta movimentos financeiros de uma parcela de título a pagar
 *     description: Retorna todos os movimentos financeiros gerados a partir da baixa de uma parcela de título a pagar
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idParcela
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da parcela de título a pagar
 *     responses:
 *       200:
 *         description: Lista de movimentos financeiros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MovimentoFinanceiroTituloPagarResponseDto'
 *       404:
 *         description: Parcela não encontrada
 */
router.get('/tituloPagar/:idParcela/movimentos', requirePermission('tituloPagar.read'), asyncHandler(async (req, res) => {
  await getParcelaController().consultarMovimentosParcelaTituloPagar(req, res);
}));

/**
 * @swagger
 * /api/parcelas/tituloReceber/{idParcela}/movimentos:
 *   get:
 *     tags:
 *       - Parcelas
 *     summary: Consulta movimentos financeiros de uma parcela de título a receber
 *     description: Retorna todos os movimentos financeiros gerados a partir da baixa de uma parcela de título a receber
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idParcela
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da parcela de título a receber
 *     responses:
 *       200:
 *         description: Lista de movimentos financeiros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MovimentoFinanceiroTituloReceberResponseDto'
 *       404:
 *         description: Parcela não encontrada
 */
router.get('/tituloReceber/:idParcela/movimentos', requirePermission('tituloReceber.read'), asyncHandler(async (req, res) => {
  await getParcelaController().consultarMovimentosParcelaTituloReceber(req, res);
}));

export default router;
