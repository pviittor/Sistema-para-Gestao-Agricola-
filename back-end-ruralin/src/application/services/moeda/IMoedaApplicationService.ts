import { IApplicationService } from '../IApplicationService';
import { CreateMoedaDto } from '../../dto/moeda/CreateMoedaDto';
import { UpdateMoedaDto } from '../../dto/moeda/UpdateMoedaDto';
import { MoedaResponseDto } from '../../dto/moeda/MoedaResponseDto';

/**
 * Interface para Application Service de Moeda
 */
export interface IMoedaApplicationService extends IApplicationService<MoedaResponseDto, CreateMoedaDto, UpdateMoedaDto> {
  // TODO: Adicionar métodos customizados se necessário
}
