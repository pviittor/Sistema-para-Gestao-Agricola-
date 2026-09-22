import { IApplicationService } from '../IApplicationService';
import { CreateApontamentoServicoDto } from '../../dto/apontamentoServico/CreateApontamentoServicoDto';
import { UpdateApontamentoServicoDto } from '../../dto/apontamentoServico/UpdateApontamentoServicoDto';
import { ApontamentoServicoResponseDto } from '../../dto/apontamentoServico/ApontamentoServicoResponseDto';

/**
 * Interface para Application Service de ApontamentoServico
 */
export interface IApontamentoServicoApplicationService extends IApplicationService<ApontamentoServicoResponseDto, CreateApontamentoServicoDto, UpdateApontamentoServicoDto> {}
