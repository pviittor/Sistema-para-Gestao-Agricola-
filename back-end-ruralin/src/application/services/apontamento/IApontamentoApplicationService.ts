import { IApplicationService } from '../IApplicationService';
import { CreateApontamentoDto } from '../../dto/apontamento/CreateApontamentoDto';
import { UpdateApontamentoDto } from '../../dto/apontamento/UpdateApontamentoDto';
import { ApontamentoResponseDto } from '../../dto/apontamento/ApontamentoResponseDto';

/**
 * Interface para Application Service de Apontamento
 */
export interface IApontamentoApplicationService extends IApplicationService<ApontamentoResponseDto, CreateApontamentoDto, UpdateApontamentoDto> {}
