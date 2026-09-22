/**
 * RateioCentroCustoTituloReceberMapper - Mapper para entidade RateioCentroCustoTituloReceber
 * 
 * Responsável por converter entre DTOs e entidades do domínio para RateioCentroCustoTituloReceber.
 * 
 * Regras importantes:
 * - Tratar campos opcionais corretamente
 * - Preservar valores numéricos
 * - Mapear relacionamentos quando incluídos
 * 
 * @example
 * ```typescript
 * const mapper = new RateioCentroCustoTituloReceberMapper();
 * 
 * // Converter DTO para entidade
 * const entity = await mapper.toEntity(createDto);
 * 
 * // Converter entidade para DTO
 * const dto = mapper.toDto(rateioCentroCustoTituloReceber);
 * ```
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import RateioCentroCustoTituloReceber from '../../models/RateioCentroCustoTituloReceber';
import { CreateRateioCentroCustoTituloReceberDto } from '../dto/rateioCentroCustoTituloReceber/CreateRateioCentroCustoTituloReceberDto';
import { UpdateRateioCentroCustoTituloReceberDto } from '../dto/rateioCentroCustoTituloReceber/UpdateRateioCentroCustoTituloReceberDto';
import { RateioCentroCustoTituloReceberResponseDto } from '../dto/rateioCentroCustoTituloReceber/RateioCentroCustoTituloReceberResponseDto';
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
 * Mapper para entidade RateioCentroCustoTituloReceber
 * 
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Campos opcionais sejam tratados corretamente
 * - Valores numéricos sejam preservados
 * - Relacionamentos sejam mapeados quando disponíveis
 */
@Injectable()
export class RateioCentroCustoTituloReceberMapper implements IMapper<RateioCentroCustoTituloReceber, RateioCentroCustoTituloReceberResponseDto, CreateRateioCentroCustoTituloReceberDto, UpdateRateioCentroCustoTituloReceberDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateRateioCentroCustoTituloReceberDto | UpdateRateioCentroCustoTituloReceberDto): Promise<Partial<RateioCentroCustoTituloReceber>> {
    const entity: any = {};

    // Campos de relacionamento (FKs)
    if ('idTituloReceber' in dto && dto.idTituloReceber !== undefined) entity.idTituloReceber = dto.idTituloReceber;
    if ('idCentroCusto' in dto && dto.idCentroCusto !== undefined) entity.idCentroCusto = dto.idCentroCusto;

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
  toDto(entity: RateioCentroCustoTituloReceber): RateioCentroCustoTituloReceberResponseDto {
    const dto: RateioCentroCustoTituloReceberResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      idTituloReceber: entity.idTituloReceber,
      idCentroCusto: entity.idCentroCusto,
      valorRateio: entity.valorRateio,
      percentualRateio: entity.percentualRateio,
      observacao: entity.observacao,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Mapear relacionamentos quando disponíveis
    if (entity.tituloReceber) {
      dto.tituloReceber = {
        id: entity.tituloReceber.id,
        numeroTitulo: entity.tituloReceber.numeroTitulo,
        valorTitulo: entity.tituloReceber.valorTitulo,
        dataLancamento: formatDate((entity.tituloReceber as any).dataLancamento),
        status: entity.tituloReceber.status,
      };
    }

    if (entity.centroCusto) {
      dto.centroCusto = {
        id: entity.centroCusto.id,
        codigo: entity.centroCusto.codigo,
        nome: entity.centroCusto.nome,
        ativo: entity.centroCusto.ativo,
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
