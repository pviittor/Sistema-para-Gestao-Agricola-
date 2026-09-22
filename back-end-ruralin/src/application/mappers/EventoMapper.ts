/**
 * EventoMapper - Mapper para entidade Evento
 * 
 * Responsável por converter entre DTOs e entidades do domínio para Evento.
 * 
 * Regras importantes:
 * - Converter datas e horários corretamente
 * - Tratar campos opcionais corretamente
 * 
 * @example
 * ```typescript
 * const mapper = new EventoMapper();
 * 
 * // Converter DTO para entidade
 * const entity = await mapper.toEntity(createDto);
 * 
 * // Converter entidade para DTO
 * const dto = mapper.toDto(evento);
 * ```
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Evento from '../../models/Evento';
import { CreateEventoDto } from '../dto/evento/CreateEventoDto';
import { UpdateEventoDto } from '../dto/evento/UpdateEventoDto';
import { EventoResponseDto } from '../dto/evento/EventoResponseDto';

/**
 * Mapper para entidade Evento
 * 
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Datas e horários sejam convertidos corretamente
 * - Campos opcionais sejam tratados corretamente
 */
@Injectable()
export class EventoMapper implements IMapper<Evento, EventoResponseDto, CreateEventoDto, UpdateEventoDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateEventoDto | UpdateEventoDto): Promise<Partial<Evento>> {
    const entity: any = {};

    // Campos básicos
    if ('titulo' in dto && dto.titulo !== undefined) entity.titulo = dto.titulo;
    if ('descricao' in dto && dto.descricao !== undefined) entity.descricao = dto.descricao;
    if ('data' in dto && dto.data !== undefined) entity.data = dto.data;
    if ('horario_inicio' in dto && dto.horario_inicio !== undefined) entity.horario_inicio = dto.horario_inicio;
    if ('horario_fim' in dto && dto.horario_fim !== undefined) entity.horario_fim = dto.horario_fim;
    if ('localId' in dto && dto.localId !== undefined) entity.localId = dto.localId;

    return entity;
  }

  /**
   * Converte entidade do domínio para DTO
   * 
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: Evento): EventoResponseDto {
    return {
      id: entity.id,
      titulo: entity.titulo,
      descricao: entity.descricao,
      data: entity.data,
      horario_inicio: entity.horario_inicio,
      horario_fim: entity.horario_fim,
      localId: entity.localId,
      usuarioId: entity.usuarioId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
