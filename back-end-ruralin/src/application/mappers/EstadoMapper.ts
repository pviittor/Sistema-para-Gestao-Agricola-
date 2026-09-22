import { Injectable } from '../../core/di';
import Estado from '../../models/Estado';
import { CreateEstadoDto, UpdateEstadoDto, EstadoResponseDto } from '../dto/estado';

/**
 * Mapper para conversão entre DTOs e entidade Estado
 */
@Injectable()
export class EstadoMapper {
  /**
   * Converte CreateEstadoDto para entidade Estado
   */
  toEntity(dto: CreateEstadoDto, userId: number): Partial<Estado> {
    return {
      sigla: dto.sigla.toUpperCase(),
      nome: dto.nome,
      codigoIBGE: dto.codigoIBGE || null,
      ativo: dto.ativo !== undefined ? dto.ativo : true,
      usercreation: userId,
    };
  }

  /**
   * Converte UpdateEstadoDto para entidade Estado
   */
  toUpdateEntity(dto: UpdateEstadoDto): Partial<Estado> {
    const entity: Partial<Estado> = {};

    if (dto.sigla !== undefined) {
      entity.sigla = dto.sigla.toUpperCase();
    }
    if (dto.nome !== undefined) {
      entity.nome = dto.nome;
    }
    if (dto.codigoIBGE !== undefined) {
      entity.codigoIBGE = dto.codigoIBGE;
    }
    if (dto.ativo !== undefined) {
      entity.ativo = dto.ativo;
    }

    return entity;
  }

  /**
   * Converte entidade Estado para EstadoResponseDto
   */
  toDto(entity: Estado): EstadoResponseDto {
    return {
      id: entity.id,
      sigla: entity.sigla,
      nome: entity.nome,
      codigoIBGE: entity.codigoIBGE || null,
      ativo: entity.ativo,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
      usuarioCriador: entity.usuarioCriador
        ? {
            id: entity.usuarioCriador.id,
            nome: entity.usuarioCriador.nome,
            email: entity.usuarioCriador.email,
          }
        : null,
      municipios: entity.municipios || null,
    };
  }
}
