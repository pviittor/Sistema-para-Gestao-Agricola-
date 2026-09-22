import { IApplicationService } from '../IApplicationService';
import { CreateMoedaCotacaoDto } from '../../dto/moedaCotacao/CreateMoedaCotacaoDto';
import { UpdateMoedaCotacaoDto } from '../../dto/moedaCotacao/UpdateMoedaCotacaoDto';
import { MoedaCotacaoResponseDto } from '../../dto/moedaCotacao/MoedaCotacaoResponseDto';

/**
 * Interface para Application Service de MoedaCotacao
 */
export interface IMoedaCotacaoApplicationService extends IApplicationService<MoedaCotacaoResponseDto, CreateMoedaCotacaoDto, UpdateMoedaCotacaoDto> {
  /**
   * Busca todas as cotações de uma moeda específica
   */
  findByMoeda(idMoeda: number): Promise<MoedaCotacaoResponseDto[]>;

  /**
   * Busca cotações em uma data específica
   */
  findByData(data: string | Date): Promise<MoedaCotacaoResponseDto[]>;
}
