/**
 * LocalMapper - Mapper para entidade Local
 * 
 * Responsável por converter entre DTOs e entidades do domínio para Local.
 * 
 * @example
 * ```typescript
 * const mapper = new LocalMapper();
 * 
 * // Converter DTO para entidade
 * const entity = await mapper.toEntity(createDto);
 * 
 * // Converter entidade para DTO
 * const dto = mapper.toDto(local);
 * ```
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Local from '../../models/Local';
import { CreateLocalDto } from '../dto/local/CreateLocalDto';
import { UpdateLocalDto } from '../dto/local/UpdateLocalDto';
import { LocalResponseDto } from '../dto/local/LocalResponseDto';

/**
 * Mapper para entidade Local
 * 
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Campos opcionais sejam tratados corretamente
 * - Dados sejam convertidos adequadamente
 */
@Injectable()
export class LocalMapper implements IMapper<Local, LocalResponseDto, CreateLocalDto, UpdateLocalDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateLocalDto | UpdateLocalDto): Promise<Partial<Local>> {
    const entity: any = {};

    // Campos básicos
    if ('desc_simples' in dto && dto.desc_simples !== undefined) {
      entity.desc_simples = dto.desc_simples;
    }
    if ('desc_completa' in dto && dto.desc_completa !== undefined) {
      entity.desc_completa = dto.desc_completa;
    }

    return entity;
  }

  /**
   * Converte entidade do domínio para DTO
   * 
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: Local): LocalResponseDto {
    return {
      id: entity.id,
      usuarioId: entity.usuarioId,
      desc_simples: entity.desc_simples,
      desc_completa: entity.desc_completa,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
