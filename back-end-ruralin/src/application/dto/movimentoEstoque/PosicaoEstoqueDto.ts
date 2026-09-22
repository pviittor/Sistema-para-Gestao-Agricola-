/**
 * PosicaoEstoqueDto - DTO para relatório de posição de estoque
 */
export class PosicaoEstoqueDto {
  idProduto!: number;
  descricaoProduto!: string;
  idFazenda!: number;
  descricaoFazenda!: string;
  saldoDisponivel!: number;
  custoMedio!: number;
  valorTotal!: number;
}
