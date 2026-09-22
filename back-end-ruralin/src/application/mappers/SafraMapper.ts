import { Injectable } from '../../core/di';
import Safra, { StatusSafra } from '../../models/Safra';
import { CreateSafraDto, UpdateSafraDto, SafraResponseDto } from '../dto/safra';

// Helper function to format dates safely
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  if (typeof date === 'string') {
    // Assume it's already in YYYY-MM-DD format or can be parsed
    try {
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    } catch (e) {
      return date.split('T')[0]; // Return date part if parsing fails
    }
  }
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return '';
};

// Helper function to format dates for nullable fields
const formatDateNullable = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  if (typeof date === 'string') {
    try {
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    } catch (e) {
      return date.split('T')[0];
    }
  }
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return null;
};

/**
 * Mapper para conversão entre DTOs e entidade Safra
 */
@Injectable()
export class SafraMapper {
  /**
   * Converte CreateSafraDto para entidade Safra
   */
  toEntity(dto: CreateSafraDto, userId: number, tenantId: number): Partial<Safra> {
    return {
      culturaId: dto.culturaId,
      nome: dto.nome,
      dataInicio: new Date(dto.dataInicio),
      dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
      status: dto.status || StatusSafra.PLANEJADA,
      tenantId,
      usercreation: userId,
    };
  }

  /**
   * Converte UpdateSafraDto para entidade Safra
   */
  toUpdateEntity(dto: UpdateSafraDto): Partial<Safra> {
    const entity: Partial<Safra> = {};

    if (dto.culturaId !== undefined) {
      entity.culturaId = dto.culturaId;
    }
    if (dto.nome !== undefined) {
      entity.nome = dto.nome;
    }
    if (dto.dataInicio !== undefined) {
      entity.dataInicio = new Date(dto.dataInicio);
    }
    if (dto.dataFim !== undefined) {
      entity.dataFim = dto.dataFim ? new Date(dto.dataFim) : null;
    }
    if (dto.status !== undefined) {
      entity.status = dto.status;
    }

    return entity;
  }

  /**
   * Converte entidade Safra para SafraResponseDto
   */
  toDto(entity: Safra): SafraResponseDto {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      culturaId: entity.culturaId,
      nome: entity.nome,
      dataInicio: formatDate((entity as any).dataInicio),
      dataFim: formatDateNullable((entity as any).dataFim),
      status: entity.status,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
      usuarioCriador: (entity as any).usuarioCriador
        ? {
            id: (entity as any).usuarioCriador.id,
            nome: (entity as any).usuarioCriador.nome,
            email: (entity as any).usuarioCriador.email,
          }
        : null,
      cultura: (entity as any).cultura
        ? {
            id: (entity as any).cultura.id,
            descricao_clt: (entity as any).cultura.descricao_clt,
            idProduto: (entity as any).cultura.idProduto,
          }
        : null,
    };
  }
}
