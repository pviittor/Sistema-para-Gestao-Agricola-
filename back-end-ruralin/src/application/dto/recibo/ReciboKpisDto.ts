export class ReciboKpisDto {
  totalEmitidos!: number;
  totalCancelados!: number;
  valorTotalEmitido!: number;
  quantidadePorFormaPagamento!: Record<string, number>;
}
