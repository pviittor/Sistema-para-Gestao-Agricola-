import { IApplicationService } from '../IApplicationService';
import { CreateAbastecimentoDto } from '../../dto/abastecimento/CreateAbastecimentoDto';
import { UpdateAbastecimentoDto } from '../../dto/abastecimento/UpdateAbastecimentoDto';
import { AbastecimentoResponseDto } from '../../dto/abastecimento/AbastecimentoResponseDto';

/**
 * Interface para Application Service de Abastecimento
 */
export interface IAbastecimentoApplicationService extends IApplicationService<AbastecimentoResponseDto, CreateAbastecimentoDto, UpdateAbastecimentoDto> {
  /**
   * Busca abastecimentos por máquina
   */
  findByMaquina(idMaquina: number): Promise<AbastecimentoResponseDto[]>;

  /**
   * Busca abastecimentos por período
   */
  findByPeriodo(dataInicio: string, dataFim: string): Promise<AbastecimentoResponseDto[]>;
}
