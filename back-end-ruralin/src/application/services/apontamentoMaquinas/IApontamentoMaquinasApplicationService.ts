import { IApplicationService } from '../IApplicationService';
import { CreateApontamentoMaquinasDto } from '../../dto/apontamentoMaquinas/CreateApontamentoMaquinasDto';
import { UpdateApontamentoMaquinasDto } from '../../dto/apontamentoMaquinas/UpdateApontamentoMaquinasDto';
import { ApontamentoMaquinasResponseDto } from '../../dto/apontamentoMaquinas/ApontamentoMaquinasResponseDto';

/**
 * Interface para Application Service de ApontamentoMaquinas
 */
export interface IApontamentoMaquinasApplicationService extends IApplicationService<ApontamentoMaquinasResponseDto, CreateApontamentoMaquinasDto, UpdateApontamentoMaquinasDto> {}
