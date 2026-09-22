import { IApplicationService } from '../IApplicationService';
import { CreateAtividadeAgricolaDto } from '../../dto/atividadeAgricola/CreateAtividadeAgricolaDto';
import { UpdateAtividadeAgricolaDto } from '../../dto/atividadeAgricola/UpdateAtividadeAgricolaDto';
import { AtividadeAgricolaResponseDto } from '../../dto/atividadeAgricola/AtividadeAgricolaResponseDto';

/**
 * Interface para Application Service de AtividadeAgricola
 */
export interface IAtividadeAgricolaApplicationService extends IApplicationService<AtividadeAgricolaResponseDto, CreateAtividadeAgricolaDto, UpdateAtividadeAgricolaDto> {
}
