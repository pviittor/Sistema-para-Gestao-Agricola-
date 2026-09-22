import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import ServicoAgricola from '../../models/ServicoAgricola';
import { CreateServicoAgricolaDto } from '../dto/servicoAgricola/CreateServicoAgricolaDto';
import { UpdateServicoAgricolaDto } from '../dto/servicoAgricola/UpdateServicoAgricolaDto';
import { ServicoAgricolaResponseDto } from '../dto/servicoAgricola/ServicoAgricolaResponseDto';

/**
 * Mapper para entidade ServicoAgricola
 */
@Injectable()
export class ServicoAgricolaMapper implements IMapper<ServicoAgricola, ServicoAgricolaResponseDto, CreateServicoAgricolaDto, UpdateServicoAgricolaDto> {
  async toEntity(dto: CreateServicoAgricolaDto | UpdateServicoAgricolaDto): Promise<Partial<ServicoAgricola>> {
    const entity: any = {};

    if ('descricao_srv' in dto && dto.descricao_srv !== undefined) {
      entity.descricao_srv = dto.descricao_srv;
    }
    if ('financeiro_srv' in dto && dto.financeiro_srv !== undefined) {
      entity.financeiro_srv = dto.financeiro_srv;
    }
    if ('observacao_srv' in dto && dto.observacao_srv !== undefined) {
      entity.observacao_srv = dto.observacao_srv;
    }

    return entity;
  }

  toDto(entity: ServicoAgricola): ServicoAgricolaResponseDto {
    const dto: ServicoAgricolaResponseDto = {
      id_srv: entity.id_srv,
      tenantId: entity.tenantId,
      descricao_srv: entity.descricao_srv,
      financeiro_srv: entity.financeiro_srv,
      observacao_srv: entity.observacao_srv,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    return dto;
  }
}
