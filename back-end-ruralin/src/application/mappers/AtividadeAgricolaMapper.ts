import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import AtividadeAgricola from '../../models/AtividadeAgricola';
import { CreateAtividadeAgricolaDto } from '../dto/atividadeAgricola/CreateAtividadeAgricolaDto';
import { UpdateAtividadeAgricolaDto } from '../dto/atividadeAgricola/UpdateAtividadeAgricolaDto';
import { AtividadeAgricolaResponseDto } from '../dto/atividadeAgricola/AtividadeAgricolaResponseDto';

/**
 * Mapper para entidade AtividadeAgricola
 */
@Injectable()
export class AtividadeAgricolaMapper implements IMapper<AtividadeAgricola, AtividadeAgricolaResponseDto, CreateAtividadeAgricolaDto, UpdateAtividadeAgricolaDto> {
  async toEntity(dto: CreateAtividadeAgricolaDto | UpdateAtividadeAgricolaDto): Promise<Partial<AtividadeAgricola>> {
    const entity: any = {};

    if ('descricao' in dto && dto.descricao !== undefined) {
      entity.descricao = dto.descricao;
    }
    if ('tipo' in dto && dto.tipo !== undefined) {
      entity.tipo = dto.tipo;
    }

    return entity;
  }

  toDto(entity: AtividadeAgricola): AtividadeAgricolaResponseDto {
    const dto: AtividadeAgricolaResponseDto = {
      id_atv: entity.id_atv,
      tenantId: entity.tenantId,
      descricao: entity.descricao,
      tipo: entity.tipo,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
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
