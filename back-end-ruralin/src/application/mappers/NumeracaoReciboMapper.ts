import { Injectable } from '../../core/di';
import NumeracaoRecibo from '../../models/NumeracaoRecibo';
import { NumeracaoReciboResponseDto } from '../dto/numeracaoRecibo';

@Injectable()
export class NumeracaoReciboMapper {
  toEntity(dto: any): Partial<NumeracaoRecibo> {
    return {
      serie: dto.serie,
      ultimoNumero: dto.ultimoNumero ?? 0,
      ativo: dto.ativo ?? true,
    } as Partial<NumeracaoRecibo>;
  }

  toResponseDto(entity: NumeracaoRecibo): NumeracaoReciboResponseDto {
    const dto = new NumeracaoReciboResponseDto();
    dto.id = entity.id;
    dto.tenantId = entity.tenantId;
    dto.serie = entity.serie;
    dto.ultimoNumero = entity.ultimoNumero;
    dto.ativo = entity.ativo;
    dto.createdAt = entity.createdAt?.toISOString?.() || String(entity.createdAt);
    dto.updatedAt = entity.updatedAt?.toISOString?.() || String(entity.updatedAt);
    return dto;
  }
}
