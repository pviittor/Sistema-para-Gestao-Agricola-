import { Injectable } from '../../core/di';
import CentroCusto from '../../models/CentroCusto';
import { CreateCentroCustoDto, UpdateCentroCustoDto, CentroCustoResponseDto } from '../dto/centroCusto';

/**
 * Mapper para conversão entre DTOs e entidade CentroCusto
 */
@Injectable()
export class CentroCustoMapper {
  /**
   * Converte CreateCentroCustoDto para entidade CentroCusto
   */
  toEntity(dto: CreateCentroCustoDto, userId: number, tenantId: number): Partial<CentroCusto> {
    return {
      codigo: dto.codigo,
      nome: dto.nome,
      centroCustoPaiId: dto.centroCustoPaiId || null,
      ativo: dto.ativo !== undefined ? dto.ativo : true,
      tenantId,
      usercreation: userId,
    };
  }

  /**
   * Converte UpdateCentroCustoDto para entidade CentroCusto
   */
  toUpdateEntity(dto: UpdateCentroCustoDto): Partial<CentroCusto> {
    const entity: Partial<CentroCusto> = {};

    if (dto.codigo !== undefined) {
      entity.codigo = dto.codigo;
    }
    if (dto.nome !== undefined) {
      entity.nome = dto.nome;
    }
    if (dto.centroCustoPaiId !== undefined) {
      entity.centroCustoPaiId = dto.centroCustoPaiId;
    }
    if (dto.ativo !== undefined) {
      entity.ativo = dto.ativo;
    }

    return entity;
  }

  /**
   * Converte entidade CentroCusto para CentroCustoResponseDto
   */
  toDto(entity: CentroCusto): CentroCustoResponseDto {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      codigo: entity.codigo,
      nome: entity.nome,
      centroCustoPaiId: entity.centroCustoPaiId || null,
      ativo: entity.ativo,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
      usuarioCriador: (entity as any).usuarioCriador
        ? {
            id: (entity as any).usuarioCriador.id,
            nome: (entity as any).usuarioCriador.nome,
            email: (entity as any).usuarioCriador.email,
          }
        : null,
      centroCustoPai: (entity as any).centroCustoPai
        ? {
            id: (entity as any).centroCustoPai.id,
            codigo: (entity as any).centroCustoPai.codigo,
            nome: (entity as any).centroCustoPai.nome,
          }
        : null,
      centrosCustoFilhos: (entity as any).centrosCustoFilhos
        ? (entity as any).centrosCustoFilhos.map((filho: CentroCusto) => ({
            id: filho.id,
            codigo: filho.codigo,
            nome: filho.nome,
          }))
        : null,
    };
  }
}
