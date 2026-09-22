import { IApplicationService } from '../IApplicationService';
import { CreateServicoBenfeitoriaDto } from '../../dto/servicoBenfeitoria/CreateServicoBenfeitoriaDto';
import { UpdateServicoBenfeitoriaDto } from '../../dto/servicoBenfeitoria/UpdateServicoBenfeitoriaDto';
import { ServicoBenfeitoriaResponseDto } from '../../dto/servicoBenfeitoria/ServicoBenfeitoriaResponseDto';

/**
 * Interface para Application Service de ServicoBenfeitoria
 */
export interface IServicoBenfeitoriaApplicationService extends IApplicationService<ServicoBenfeitoriaResponseDto, CreateServicoBenfeitoriaDto, UpdateServicoBenfeitoriaDto> {}
