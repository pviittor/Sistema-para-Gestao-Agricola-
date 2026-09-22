import { UnidadeDepositoResponseDto } from './UnidadeDepositoResponseDto';

/**
 * UnidadeDepositoComSaldoDto - DTO para resposta de unidade de depósito com saldo calculado
 */
export class UnidadeDepositoComSaldoDto extends UnidadeDepositoResponseDto {
  /**
   * Saldo atual calculado: saldo_inicial + entradas - saídas
   */
  saldoAtual!: number;

  /**
   * Percentual de utilização da capacidade total
   */
  percentualUtilizado!: number;
}
