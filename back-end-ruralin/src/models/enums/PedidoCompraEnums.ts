/**
 * Enums para Pedido de Compra
 */

/**
 * Status do pedido de compra
 *
 * rascunho               - Em elaboracao
 * aguardando_aprovacao   - Aguardando aprovacao de responsavel
 * aprovado               - Aprovado para compra
 * parcialmente_atendido  - Parte dos itens ja foram entregues
 * atendido               - Todos os itens foram entregues
 * cancelado              - Pedido cancelado
 */
export enum StatusPedidoCompra {
  RASCUNHO = 'rascunho',
  AGUARDANDO_APROVACAO = 'aguardando_aprovacao',
  APROVADO = 'aprovado',
  PARCIALMENTE_ATENDIDO = 'parcialmente_atendido',
  ATENDIDO = 'atendido',
  CANCELADO = 'cancelado',
}

/**
 * Status do item do pedido de compra
 *
 * pendente               - Aguardando entrega
 * parcialmente_atendido  - Parte da quantidade foi entregue
 * atendido               - Quantidade total entregue
 * cancelado              - Item cancelado
 */
export enum StatusItemPedidoCompra {
  PENDENTE = 'pendente',
  PARCIALMENTE_ATENDIDO = 'parcialmente_atendido',
  ATENDIDO = 'atendido',
  CANCELADO = 'cancelado',
}

/**
 * Status da baixa do pedido de compra
 *
 * pendente    - Aguardando processamento
 * processada  - Baixa processada/efetivada
 * cancelada   - Baixa cancelada
 */
export enum StatusBaixaPedidoCompra {
  PENDENTE = 'pendente',
  PROCESSADA = 'processada',
  CANCELADA = 'cancelada',
}

/**
 * Forma de pagamento
 *
 * boleto         - Boleto bancario
 * transferencia  - Transferencia bancaria
 * cheque         - Cheque
 * cartao         - Cartao de credito/debito
 * dinheiro       - Dinheiro em especie
 * pix            - PIX
 */
export enum FormaPagamento {
  BOLETO = 'boleto',
  TRANSFERENCIA = 'transferencia',
  CHEQUE = 'cheque',
  CARTAO = 'cartao',
  DINHEIRO = 'dinheiro',
  PIX = 'pix',
}
