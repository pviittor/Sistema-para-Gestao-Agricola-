/**
 * SaldoEstoqueDto - DTO para resposta de saldo de estoque
 */
export class SaldoEstoqueDto {
  idProduto!: number;
  idFazenda!: number;
  saldo!: number;
  disponivel!: number;
}
