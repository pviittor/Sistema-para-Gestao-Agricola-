import { Injectable } from '../../core/di';
import NumeracaoNfe from '../../models/NumeracaoNfe';
import { NumeracaoNfeResponseDto } from '../dto/numeracaoNfe';

/**
 * Mapper para NumeracaoNfe
 */
@Injectable()
export class NumeracaoNfeMapper {
  toEntity(dto: any): Partial<NumeracaoNfe> {
    return {
      serie: dto.serie,
      modelo: dto.modelo,
      ultimo_numero: dto.ultimo_numero ?? 0,
      ativo: dto.ativo ?? true,
    } as Partial<NumeracaoNfe>;
  }

  toResponseDto(entity: NumeracaoNfe): NumeracaoNfeResponseDto {
    const dto = new NumeracaoNfeResponseDto();
    dto.id = entity.id;
    dto.tenantId = entity.tenantId;
    dto.serie = entity.serie;
    dto.modelo = entity.modelo;
    dto.ultimo_numero = entity.ultimo_numero;
    dto.ativo = entity.ativo;
    dto.createdAt = entity.createdAt?.toISOString?.() || String(entity.createdAt);
    dto.updatedAt = entity.updatedAt?.toISOString?.() || String(entity.updatedAt);
    return dto;
  }
}
