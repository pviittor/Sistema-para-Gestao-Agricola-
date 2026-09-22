import { IApplicationService } from '../IApplicationService';
import { CreateUnidadeDepositoDto } from '../../dto/unidadeDeposito/CreateUnidadeDepositoDto';
import { UpdateUnidadeDepositoDto } from '../../dto/unidadeDeposito/UpdateUnidadeDepositoDto';
import { UnidadeDepositoResponseDto } from '../../dto/unidadeDeposito/UnidadeDepositoResponseDto';
import { UnidadeDepositoComSaldoDto } from '../../dto/unidadeDeposito/UnidadeDepositoComSaldoDto';

/**
 * Interface para Application Service de UnidadeDeposito
 */
export interface IUnidadeDepositoApplicationService extends IApplicationService<UnidadeDepositoResponseDto, CreateUnidadeDepositoDto, UpdateUnidadeDepositoDto> {
  /**
   * Busca todas as unidades de depósito de um produto específico
   */
  findByProduto(idProduto: number): Promise<UnidadeDepositoResponseDto[]>;

  /**
   * Busca todas as unidades de depósito com saldo calculado
   */
  findComSaldo(): Promise<UnidadeDepositoComSaldoDto[]>;
}
