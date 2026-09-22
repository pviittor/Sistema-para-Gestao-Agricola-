import { IApplicationService } from '../IApplicationService';
import { CreateServicoAgricolaDto } from '../../dto/servicoAgricola/CreateServicoAgricolaDto';
import { UpdateServicoAgricolaDto } from '../../dto/servicoAgricola/UpdateServicoAgricolaDto';
import { ServicoAgricolaResponseDto } from '../../dto/servicoAgricola/ServicoAgricolaResponseDto';

/**
 * Interface para Application Service de ServicoAgricola
 */
export interface IServicoAgricolaApplicationService extends IApplicationService<ServicoAgricolaResponseDto, CreateServicoAgricolaDto, UpdateServicoAgricolaDto> {}
