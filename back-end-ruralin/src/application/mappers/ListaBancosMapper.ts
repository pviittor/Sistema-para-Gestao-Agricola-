import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import ListaBancos from '../../models/ListaBancos';
import { CreateListaBancosDto } from '../dto/listaBancos/CreateListaBancosDto';
import { UpdateListaBancosDto } from '../dto/listaBancos/UpdateListaBancosDto';
import { ListaBancosResponseDto } from '../dto/listaBancos/ListaBancosResponseDto';

/**
 * Mapper para entidade ListaBancos
 */
@Injectable()
export class ListaBancosMapper implements IMapper<ListaBancos, ListaBancosResponseDto, CreateListaBancosDto, UpdateListaBancosDto> {
  async toEntity(dto: CreateListaBancosDto | UpdateListaBancosDto): Promise<Partial<ListaBancos>> {
    const entity: any = {};

    if ('codigo' in dto && dto.codigo !== undefined) {
      entity.codigo = dto.codigo;
    }
    
    if ('nome' in dto && dto.nome !== undefined) {
      entity.nome = dto.nome;
    }

    return entity;
  }

  toDto(entity: ListaBancos): ListaBancosResponseDto {
    const dto: ListaBancosResponseDto = {
      id: entity.id,
      codigo: entity.codigo,
      nome: entity.nome,
    };

    return dto;
  }
}
