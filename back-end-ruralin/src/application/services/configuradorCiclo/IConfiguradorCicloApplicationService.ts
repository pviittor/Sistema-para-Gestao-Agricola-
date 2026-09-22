import { IApplicationService } from '../IApplicationService';
import { CreateConfiguradorCicloDto } from '../../dto/configuradorCiclo/CreateConfiguradorCicloDto';
import { UpdateConfiguradorCicloDto } from '../../dto/configuradorCiclo/UpdateConfiguradorCicloDto';
import { ConfiguradorCicloResponseDto } from '../../dto/configuradorCiclo/ConfiguradorCicloResponseDto';

/**
 * Interface para Application Service de ConfiguradorCiclo
 */
export interface IConfiguradorCicloApplicationService extends IApplicationService<ConfiguradorCicloResponseDto, CreateConfiguradorCicloDto, UpdateConfiguradorCicloDto> {
  /**
   * Busca configuradores de ciclo por fazenda e safra
   */
  getByFazendaAndSafra(fazendaId: number, safraId: number): Promise<ConfiguradorCicloResponseDto[]>;
}
