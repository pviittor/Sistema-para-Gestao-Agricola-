import { Injectable } from '../../core/di';
import Municipio from '../../models/Municipio';
import { CreateMunicipioDto, UpdateMunicipioDto, MunicipioResponseDto } from '../dto/municipio';

/**
 * Mapper para conversão entre DTOs e entidade Municipio
 */
@Injectable()
export class MunicipioMapper {
  /**
   * Converte CreateMunicipioDto para entidade Municipio
   */
  toEntity(dto: CreateMunicipioDto, userId: number): Partial<Municipio> {
    return {
      nome: dto.nome,
      idEstado: dto.idEstado,
      codigoIBGE: dto.codigoIBGE || null,
      ativo: dto.ativo !== undefined ? dto.ativo : true,
      usercreation: userId,
    };
  }

  /**
   * Converte UpdateMunicipioDto para entidade Municipio
   */
  toUpdateEntity(dto: UpdateMunicipioDto): Partial<Municipio> {
    const entity: Partial<Municipio> = {};

    if (dto.nome !== undefined) {
      entity.nome = dto.nome;
    }
    if (dto.idEstado !== undefined) {
      entity.idEstado = dto.idEstado;
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
   * Converte entidade Municipio para MunicipioResponseDto
   */
  toDto(entity: Municipio): MunicipioResponseDto {
    return {
      id: entity.id,
      nome: entity.nome,
      idEstado: entity.idEstado,
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
      estado: entity.estado
        ? {
            id: entity.estado.id,
            sigla: entity.estado.sigla,
            nome: entity.estado.nome,
          }
        : null,
    };
  }
}
