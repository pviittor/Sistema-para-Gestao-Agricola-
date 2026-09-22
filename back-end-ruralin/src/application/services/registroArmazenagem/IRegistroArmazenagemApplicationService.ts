import { IApplicationService } from '../IApplicationService';
import { CreateRegistroArmazenagemDto } from '../../dto/registroArmazenagem/CreateRegistroArmazenagemDto';
import { UpdateRegistroArmazenagemDto } from '../../dto/registroArmazenagem/UpdateRegistroArmazenagemDto';
import { RegistroArmazenagemResponseDto } from '../../dto/registroArmazenagem/RegistroArmazenagemResponseDto';

/**
 * Interface para Application Service de RegistroArmazenagem
 */
export interface IRegistroArmazenagemApplicationService extends IApplicationService<RegistroArmazenagemResponseDto, CreateRegistroArmazenagemDto, UpdateRegistroArmazenagemDto> {
  /**
   * Busca todos os registros de uma unidade de depósito específica
   */
  findByUnidadeDeposito(idUnidadeDeposito: number): Promise<RegistroArmazenagemResponseDto[]>;

  /**
   * Busca registros por período
   */
  findByPeriodo(dataInicio: string, dataFim: string): Promise<RegistroArmazenagemResponseDto[]>;

  /**
   * Busca todos os registros de um produto específico
   */
  findByProduto(idProduto: number): Promise<RegistroArmazenagemResponseDto[]>;

  /**
   * Calcula o saldo atual de uma unidade de depósito
   */
  getSaldoByUnidade(idUnidadeDeposito: number): Promise<number>;
}
