/**
 * FinanceiroMapper - Mapper para entidade Financeiro
 * 
 * Responsável por converter entre DTOs e entidades do domínio para Financeiro.
 * 
 * Regras importantes:
 * - Converter datas corretamente
 * - Tratar campos opcionais corretamente
 * - Preservar valores numéricos (positivos para receita, negativos para despesa)
 * 
 * @example
 * ```typescript
 * const mapper = new FinanceiroMapper();
 * 
 * // Converter DTO para entidade
 * const entity = await mapper.toEntity(createDto);
 * 
 * // Converter entidade para DTO
 * const dto = mapper.toDto(financeiro);
 * ```
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Financeiro from '../../models/Financeiro';
import { CreateFinanceiroDto } from '../dto/financeiro/CreateFinanceiroDto';
import { UpdateFinanceiroDto } from '../dto/financeiro/UpdateFinanceiroDto';
import { FinanceiroResponseDto } from '../dto/financeiro/FinanceiroResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade Financeiro
 * 
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Datas sejam convertidas corretamente
 * - Campos opcionais sejam tratados corretamente
 * - Valores sejam preservados (positivos para receita, negativos para despesa)
 */
@Injectable()
export class FinanceiroMapper implements IMapper<Financeiro, FinanceiroResponseDto, CreateFinanceiroDto, UpdateFinanceiroDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateFinanceiroDto | UpdateFinanceiroDto): Promise<Partial<Financeiro>> {
    const entity: any = {};

    // Campos opcionais de IDs
    if ('contaId' in dto && dto.contaId !== undefined) entity.contaId = dto.contaId;
    if ('historicoId' in dto && dto.historicoId !== undefined) entity.historicoId = dto.historicoId;
    if ('planoFinanceiroId' in dto && dto.planoFinanceiroId !== undefined) entity.planoFinanceiroId = dto.planoFinanceiroId;
    if ('tipoDocuentoId' in dto && dto.tipoDocuentoId !== undefined) entity.tipoDocuentoId = dto.tipoDocuentoId;
    if ('tipoPagamentoId' in dto && dto.tipoPagamentoId !== undefined) entity.tipoPagamentoId = dto.tipoPagamentoId;

    // Campos opcionais de descrições
    if ('contaDesc' in dto && dto.contaDesc !== undefined) entity.contaDesc = dto.contaDesc;
    if ('historicoDesc' in dto && dto.historicoDesc !== undefined) entity.historicoDesc = dto.historicoDesc;
    if ('planoFinanceiroDesc' in dto && dto.planoFinanceiroDesc !== undefined) entity.planoFinanceiroDesc = dto.planoFinanceiroDesc;
    if ('tipoDocuentoDesc' in dto && dto.tipoDocuentoDesc !== undefined) entity.tipoDocuentoDesc = dto.tipoDocuentoDesc;
    if ('tipoPagamentoDesc' in dto && dto.tipoPagamentoDesc !== undefined) entity.tipoPagamentoDesc = dto.tipoPagamentoDesc;

    // Campos obrigatórios
    if ('dataEmissao' in dto && dto.dataEmissao !== undefined) entity.dataEmissao = dto.dataEmissao;
    if ('dataVencimento' in dto && dto.dataVencimento !== undefined) entity.dataVencimento = dto.dataVencimento;
    if ('valor' in dto && dto.valor !== undefined) entity.valor = dto.valor;
    if ('observacao' in dto && dto.observacao !== undefined) entity.observacao = dto.observacao;

    return entity;
  }

  /**
   * Converte entidade do domínio para DTO
   * 
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: Financeiro): FinanceiroResponseDto {
    const dto: any = {
      id: entity.id,
      usuarioId: entity.usuarioId,
      contaId: entity.contaId,
      historicoId: entity.historicoId,
      planoFinanceiroId: entity.planoFinanceiroId,
      tipoDocuentoId: entity.tipoDocuentoId,
      tipoPagamentoId: entity.tipoPagamentoId,
      contaDesc: entity.contaDesc,
      historicoDesc: entity.historicoDesc,
      planoFinanceiroDesc: entity.planoFinanceiroDesc,
      tipoDocuentoDesc: entity.tipoDocuentoDesc,
      tipoPagamentoDesc: entity.tipoPagamentoDesc,
      dataEmissao: entity.dataEmissao,
      dataVencimento: entity.dataVencimento,
      valor: Number(entity.valor), // Converter DECIMAL para number
      observacao: entity.observacao,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    adicionarCamposFormatados(dto, ['valor']);

    return dto;
  }
}
