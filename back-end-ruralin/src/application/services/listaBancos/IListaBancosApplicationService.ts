import { IApplicationService } from '../IApplicationService';
import { CreateListaBancosDto } from '../../dto/listaBancos/CreateListaBancosDto';
import { UpdateListaBancosDto } from '../../dto/listaBancos/UpdateListaBancosDto';
import { ListaBancosResponseDto } from '../../dto/listaBancos/ListaBancosResponseDto';

/**
 * Interface para Application Service de ListaBancos
 */
export interface IListaBancosApplicationService extends IApplicationService<ListaBancosResponseDto, CreateListaBancosDto, UpdateListaBancosDto> {
}
