/**
 * Enums para Recibo Financeiro
 */

/**
 * Status do recibo
 *
 * EMITIDO   - Recibo emitido e válido
 * CANCELADO - Recibo cancelado (com motivo obrigatório)
 */
export enum StatusRecibo {
  EMITIDO = 'EMITIDO',
  CANCELADO = 'CANCELADO',
}

/**
 * Forma de pagamento do recibo
 */
export enum FormaPagamentoRecibo {
  DINHEIRO = 'DINHEIRO',
  PIX = 'PIX',
  TRANSFERENCIA = 'TRANSFERENCIA',
  CHEQUE = 'CHEQUE',
  BOLETO = 'BOLETO',
  CARTAO = 'CARTAO',
  OUTROS = 'OUTROS',
}

/**
 * Tipo de vínculo do recibo com títulos financeiros
 *
 * AVULSO         - Recibo sem vínculo a título
 * TITULO_PAGAR   - Vinculado a um título a pagar
 * TITULO_RECEBER - Vinculado a um título a receber
 */
export enum TipoVinculoRecibo {
  AVULSO = 'AVULSO',
  TITULO_PAGAR = 'TITULO_PAGAR',
  TITULO_RECEBER = 'TITULO_RECEBER',
}
