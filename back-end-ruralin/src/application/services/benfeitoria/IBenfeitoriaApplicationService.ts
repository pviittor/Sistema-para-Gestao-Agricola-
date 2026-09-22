import { IApplicationService } from '../IApplicationService';
import { CreateBenfeitoriaDto } from '../../dto/benfeitoria/CreateBenfeitoriaDto';
import { UpdateBenfeitoriaDto } from '../../dto/benfeitoria/UpdateBenfeitoriaDto';
import { BenfeitoriaResponseDto } from '../../dto/benfeitoria/BenfeitoriaResponseDto';

/**
 * Interface para Application Service de Benfeitoria
 */
export interface IBenfeitoriaApplicationService extends IApplicationService<BenfeitoriaResponseDto, CreateBenfeitoriaDto, UpdateBenfeitoriaDto> {}
