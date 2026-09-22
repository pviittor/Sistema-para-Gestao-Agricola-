/**
 * ParcelaTituloPagarMapper - Mapper para entidade ParcelaTituloPagar
 * 
 * Responsável por converter entre DTOs e entidades do domínio para ParcelaTituloPagar.
 * 
 * Regras importantes:
 * - Converter datas corretamente (dataVencimento, dataBaixa)
 * - Tratar campos opcionais corretamente
 * - Preservar valores numéricos e booleanos
 * - Mapear relacionamentos quando incluídos
 * 
 * @example
 * ```typescript
 * const mapper = new ParcelaTituloPagarMapper();
 * 
 * // Converter DTO para entidade
 * const entity = await mapper.toEntity(createDto);
 * 
 * // Converter entidade para DTO
 * const dto = mapper.toDto(parcelaTituloPagar);
 * ```
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import ParcelaTituloPagar, { StatusParcela } from '../../models/ParcelaTituloPagar';
import { CreateParcelaTituloPagarDto } from '../dto/parcelaTituloPagar/CreateParcelaTituloPagarDto';
import { UpdateParcelaTituloPagarDto } from '../dto/parcelaTituloPagar/UpdateParcelaTituloPagarDto';
import { ParcelaTituloPagarResponseDto } from '../dto/parcelaTituloPagar/ParcelaTituloPagarResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade ParcelaTituloPagar
 * 
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Datas sejam convertidas corretamente
 * - Campos opcionais sejam tratados corretamente
 * - Valores booleanos sejam preservados
 * - Relacionamentos sejam mapeados quando disponíveis
 */
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

@Injectable()
export class ParcelaTituloPagarMapper implements IMapper<ParcelaTituloPagar, ParcelaTituloPagarResponseDto, CreateParcelaTituloPagarDto, UpdateParcelaTituloPagarDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateParcelaTituloPagarDto | UpdateParcelaTituloPagarDto): Promise<Partial<ParcelaTituloPagar>> {
    const entity: any = {};

    // Campos de relacionamento (FKs)
    if ('idTituloPagar' in dto && dto.idTituloPagar !== undefined) entity.idTituloPagar = dto.idTituloPagar;

    // Campos numéricos
    if ('numeroParcela' in dto && dto.numeroParcela !== undefined) entity.numeroParcela = dto.numeroParcela;
    if ('valorParcela' in dto && dto.valorParcela !== undefined) entity.valorParcela = dto.valorParcela;
    if ('valorParcelaMoedaOriginal' in dto && dto.valorParcelaMoedaOriginal !== undefined) {
      entity.valorParcelaMoedaOriginal = dto.valorParcelaMoedaOriginal;
    }
    if ('valorParcelaMoedaPadrao' in dto && dto.valorParcelaMoedaPadrao !== undefined) {
      entity.valorParcelaMoedaPadrao = dto.valorParcelaMoedaPadrao;
    }
    if ('valorBaixa' in dto && dto.valorBaixa !== undefined) entity.valorBaixa = dto.valorBaixa;

    // Campos de data
    if ('dataVencimento' in dto && dto.dataVencimento !== undefined) {
      entity.dataVencimento = dto.dataVencimento ? new Date(dto.dataVencimento) : null;
    }
    if ('dataBaixa' in dto && dto.dataBaixa !== undefined) {
      entity.dataBaixa = dto.dataBaixa ? new Date(dto.dataBaixa) : null;
    }

    // Campos de texto
    if ('observacao' in dto && dto.observacao !== undefined) entity.observacao = dto.observacao;

    // Campos enum
    if ('status' in dto && dto.status !== undefined) entity.status = dto.status;

    return entity;
  }

  /**
   * Converte entidade do domínio para DTO
   * 
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: ParcelaTituloPagar): ParcelaTituloPagarResponseDto {
    const dto: ParcelaTituloPagarResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      idTituloPagar: entity.idTituloPagar,
      numeroParcela: entity.numeroParcela,
      dataVencimento: formatDate((entity as any).dataVencimento),
      valorParcela: entity.valorParcela,
      valorParcelaMoedaOriginal: entity.valorParcelaMoedaOriginal,
      valorParcelaMoedaPadrao: entity.valorParcelaMoedaPadrao,
      dataBaixa: formatDateNullable((entity as any).dataBaixa),
      valorBaixa: entity.valorBaixa,
      status: entity.status,
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

    if (entity.usuarioCriador) {
      dto.usuarioCriador = {
        id: entity.usuarioCriador.id,
        nome: entity.usuarioCriador.nome,
        email: entity.usuarioCriador.email,
      };
    }

    adicionarCamposFormatados(dto, ['valorParcela', 'valorParcelaMoedaOriginal', 'valorParcelaMoedaPadrao', 'valorBaixa']);

    return dto;
  }
}
