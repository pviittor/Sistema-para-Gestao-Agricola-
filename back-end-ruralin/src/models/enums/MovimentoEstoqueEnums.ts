/**
 * Enums para Movimento de Estoque
 */

/**
 * Tipo de movimentação de estoque
 *
 * 0 - Pedido de Compra
 * 1 - Estoque Físico
 * 2 - Emprestado
 * 3 - Tomado Empréstimo
 * 4 - Estoque Inicial
 * 5 - Contrato Receber
 */
export enum TipoMovimento {
  PEDIDO_COMPRA = 0,
  ESTOQUE_FISICO = 1,
  EMPRESTADO = 2,
  TOMADO_EMPRESTIMO = 3,
  ESTOQUE_INICIAL = 4,
  CONTRATO_RECEBER = 5,
}

/**
 * Operação de estoque
 *
 * 1 - Estoque Físico
 * 2 - Pedido de Compra
 * 4 - Compra Entrega Futura
 * 5 - Venda Futura
 * 6 - Trading
 * 7 - Disponível
 * 8 - Consumo OS (saída por ordem de serviço)
 * 71 - Disponível Uso
 * 9 - Balcão
 * 10 - Estorno OS (reversão de consumo OS)
 * 51 - Terceiro
 */
export enum OperacaoEstoque {
  ESTOQUE_FISICO = 1,
  PEDIDO_COMPRA = 2,
  COMPRA_ENTREGA_FUTURA = 4,
  VENDA_FUTURA = 5,
  TRADING = 6,
  DISPONIVEL = 7,
  DISPONIVEL_USO = 71,
  CONSUMO_OS = 8,
  BALCAO = 9,
  ESTORNO_OS = 10,
  TERCEIRO = 51,
}
