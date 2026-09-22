import { IApplicationService } from '../IApplicationService';
import { CreateContaDto } from '../../dto/conta/CreateContaDto';
import { UpdateContaDto } from '../../dto/conta/UpdateContaDto';
import { ContaResponseDto } from '../../dto/conta/ContaResponseDto';
import { PaginatedResult } from '../../../core/repository/types';

/**
 * Interface para Application Service de Conta
 * 
 * Define os métodos disponíveis para operações de negócio com contas.
 */
export interface IContaApplicationService extends IApplicationService<ContaResponseDto, CreateContaDto, UpdateContaDto> {
  /**
   * Busca contas por tipo
   * 
   * @param tipo - Tipo da conta (BANCO ou CAIXA)
   * @returns Promise que resolve com array de contas do tipo especificado
   */
  findByTipo(tipo: string): Promise<ContaResponseDto[]>;
}
