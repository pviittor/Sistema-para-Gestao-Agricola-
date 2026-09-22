import { IApplicationService } from '../IApplicationService';
import { CreateUnidadeMedidaDto } from '../../dto/unidadeMedida/CreateUnidadeMedidaDto';
import { UpdateUnidadeMedidaDto } from '../../dto/unidadeMedida/UpdateUnidadeMedidaDto';
import { UnidadeMedidaResponseDto } from '../../dto/unidadeMedida/UnidadeMedidaResponseDto';

/**
 * Interface para Application Service de UnidadeMedida
 * 
 * Define os métodos disponíveis para operações de negócio com unidade de medida.
 */
export interface IUnidadeMedidaApplicationService extends IApplicationService<UnidadeMedidaResponseDto, CreateUnidadeMedidaDto, UpdateUnidadeMedidaDto> {
  // TODO: Adicionar métodos customizados se necessário
}
