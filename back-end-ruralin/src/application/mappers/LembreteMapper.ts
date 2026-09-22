/**
 * LembreteMapper - Mapper para entidade Lembrete
 * 
 * Responsável por converter entre DTOs e entidades do domínio para Lembrete.
 * 
 * Regras importantes:
 * - Tratar campos opcionais corretamente
 * - Não incluir relacionamentos LembreteDataHora no toEntity (será tratado separadamente)
 * 
 * @example
 * ```typescript
 * const mapper = new LembreteMapper();
 * 
 * // Converter DTO para entidade
 * const entity = await mapper.toEntity(createDto);
 * 
 * // Converter entidade para DTO
 * const dto = mapper.toDto(lembrete);
 * ```
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Lembrete from '../../models/Lembrete';
import { CreateLembreteDto } from '../dto/lembrete/CreateLembreteDto';
import { UpdateLembreteDto } from '../dto/lembrete/UpdateLembreteDto';
import { LembreteResponseDto } from '../dto/lembrete/LembreteResponseDto';

/**
 * Mapper para entidade Lembrete
 * 
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Campos opcionais sejam tratados corretamente
 * - Relacionamentos LembreteDataHora sejam tratados separadamente
 */
@Injectable()
export class LembreteMapper implements IMapper<Lembrete, LembreteResponseDto, CreateLembreteDto, UpdateLembreteDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * NOTA: LembreteDataHora não é incluído aqui, pois será tratado
   * separadamente no controller ou service.
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateLembreteDto | UpdateLembreteDto): Promise<Partial<Lembrete>> {
    const entity: any = {};

    // Campos básicos
    if ('desc_simples' in dto && dto.desc_simples !== undefined) entity.desc_simples = dto.desc_simples;
    if ('desc_completa' in dto && dto.desc_completa !== undefined) entity.desc_completa = dto.desc_completa;

    // NOTA: lembrete_data_hora não é incluído aqui
    // Será tratado separadamente no controller ou service

    return entity;
  }

  /**
   * Converte entidade do domínio para DTO
   * 
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: Lembrete): LembreteResponseDto {
    return {
      id: entity.id,
      usuarioId: entity.usuarioId,
      desc_simples: entity.desc_simples,
      desc_completa: entity.desc_completa,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      // NOTA: lembrete_data_hora será incluído no controller se necessário
    };
  }
}
