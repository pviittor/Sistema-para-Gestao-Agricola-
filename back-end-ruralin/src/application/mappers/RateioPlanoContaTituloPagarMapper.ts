/**
 * RateioPlanoContaTituloPagarMapper - Mapper para entidade RateioPlanoContaTituloPagar
 * 
 * Responsável por converter entre DTOs e entidades do domínio para RateioPlanoContaTituloPagar.
 * 
 * Regras importantes:
 * - Tratar campos opcionais corretamente
 * - Preservar valores numéricos
 * - Mapear relacionamentos quando incluídos
 * 
 * @example
 * ```typescript
 * const mapper = new RateioPlanoContaTituloPagarMapper();
 * 
 * // Converter DTO para entidade
 * const entity = await mapper.toEntity(createDto);
 * 
 * // Converter entidade para DTO
 * const dto = mapper.toDto(rateioPlanoContaTituloPagar);
 * ```
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import RateioPlanoContaTituloPagar from '../../models/RateioPlanoContaTituloPagar';
import { CreateRateioPlanoContaTituloPagarDto } from '../dto/rateioPlanoContaTituloPagar/CreateRateioPlanoContaTituloPagarDto';
import { UpdateRateioPlanoContaTituloPagarDto } from '../dto/rateioPlanoContaTituloPagar/UpdateRateioPlanoContaTituloPagarDto';
import { RateioPlanoContaTituloPagarResponseDto } from '../dto/rateioPlanoContaTituloPagar/RateioPlanoContaTituloPagarResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

// Helper function to format dates safely
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '';
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
  return '';
};

/**
 * Mapper para entidade RateioPlanoContaTituloPagar
 * 
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Campos opcionais sejam tratados corretamente
 * - Valores numéricos sejam preservados
 * - Relacionamentos sejam mapeados quando disponíveis
 */
@Injectable()
export class RateioPlanoContaTituloPagarMapper implements IMapper<RateioPlanoContaTituloPagar, RateioPlanoContaTituloPagarResponseDto, CreateRateioPlanoContaTituloPagarDto, UpdateRateioPlanoContaTituloPagarDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateRateioPlanoContaTituloPagarDto | UpdateRateioPlanoContaTituloPagarDto): Promise<Partial<RateioPlanoContaTituloPagar>> {
    const entity: any = {};

    // Campos de relacionamento (FKs)
    if ('idTituloPagar' in dto && dto.idTituloPagar !== undefined) entity.idTituloPagar = dto.idTituloPagar;
    if ('idPlanoContaGerencial' in dto && dto.idPlanoContaGerencial !== undefined) {
      entity.idPlanoContaGerencial = dto.idPlanoContaGerencial;
    }

    // Campos numéricos
    if ('valorRateio' in dto && dto.valorRateio !== undefined) entity.valorRateio = dto.valorRateio;
    if ('percentualRateio' in dto && dto.percentualRateio !== undefined) {
      entity.percentualRateio = dto.percentualRateio;
    }

    // Campos de texto
    if ('observacao' in dto && dto.observacao !== undefined) entity.observacao = dto.observacao;

    return entity;
  }

  /**
   * Converte entidade do domínio para DTO
   * 
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: RateioPlanoContaTituloPagar): RateioPlanoContaTituloPagarResponseDto {
    const dto: RateioPlanoContaTituloPagarResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      idTituloPagar: entity.idTituloPagar,
      idPlanoContaGerencial: entity.idPlanoContaGerencial,
      valorRateio: entity.valorRateio,
      percentualRateio: entity.percentualRateio,
      observacao: entity.observacao,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Mapear relacionamentos quando disponíveis
    if (entity.tituloPagar) {
      dto.tituloPagar = {
        id: entity.tituloPagar.id,
        numeroTitulo: entity.tituloPagar.numeroTitulo,
        valorTitulo: entity.tituloPagar.valorTitulo,
        dataLancamento: formatDate((entity.tituloPagar as any).dataLancamento),
        status: entity.tituloPagar.status,
      };
    }

    if (entity.planoContaGerencial) {
      dto.planoContaGerencial = {
        id: entity.planoContaGerencial.id,
        item: entity.planoContaGerencial.item,
        descricao: entity.planoContaGerencial.descricao,
        tipo: entity.planoContaGerencial.tipo,
        nivel: entity.planoContaGerencial.nivel,
      };
    }

    if (entity.usuarioCriador) {
      dto.usuarioCriador = {
        id: entity.usuarioCriador.id,
        nome: entity.usuarioCriador.nome,
        email: entity.usuarioCriador.email,
      };
    }

    adicionarCamposFormatados(dto, ['valorRateio']);

    return dto;
  }
}
