import { IApplicationService } from '../IApplicationService';
import { CreateAtividadeOperacaoDto } from '../../dto/atividadeOperacao/CreateAtividadeOperacaoDto';
import { UpdateAtividadeOperacaoDto } from '../../dto/atividadeOperacao/UpdateAtividadeOperacaoDto';
import { AtividadeOperacaoResponseDto } from '../../dto/atividadeOperacao/AtividadeOperacaoResponseDto';

/**
 * Interface para Application Service de AtividadeOperacao
 */
export interface IAtividadeOperacaoApplicationService extends IApplicationService<AtividadeOperacaoResponseDto, CreateAtividadeOperacaoDto, UpdateAtividadeOperacaoDto> {
}
