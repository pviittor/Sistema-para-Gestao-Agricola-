import { IApplicationService } from '../IApplicationService';
import { CreateGrupoEquipamentoDto } from '../../dto/grupoEquipamento/CreateGrupoEquipamentoDto';
import { UpdateGrupoEquipamentoDto } from '../../dto/grupoEquipamento/UpdateGrupoEquipamentoDto';
import { GrupoEquipamentoResponseDto } from '../../dto/grupoEquipamento/GrupoEquipamentoResponseDto';

/**
 * Interface para Application Service de GrupoEquipamento
 *
 * Define os métodos disponíveis para operações de negócio com grupo de equipamento.
 */
export interface IGrupoEquipamentoApplicationService extends IApplicationService<GrupoEquipamentoResponseDto, CreateGrupoEquipamentoDto, UpdateGrupoEquipamentoDto> {
  // TODO: Adicionar métodos customizados se necessário
}
