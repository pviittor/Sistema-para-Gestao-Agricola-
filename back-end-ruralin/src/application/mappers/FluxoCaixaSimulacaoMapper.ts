/**
 * FluxoCaixaSimulacaoMapper - Mapper para entidade FluxoCaixaSimulacao (master-detail)
 *
 * Responsável por converter entre DTOs e entidades do domínio para FluxoCaixaSimulacao.
 * Inclui mapeamento dos itens (detail) quando presentes via Sequelize include.
 *
 * Regras importantes:
 * - Mapear itens aninhados quando incluídos (master-detail pattern)
 * - Converter valores DECIMAL para Number nos itens
 * - Tratar campos opcionais corretamente
 *
 * @example
 * ```typescript
 * const mapper = new FluxoCaixaSimulacaoMapper();
 *
 * // Converter DTO para entidade
 * const entity = mapper.toEntity(createDto);
 *
 * // Converter entidade para DTO (com itens)
 * const dto = mapper.toDto(simulacao);
 *
 * // Converter item individual
 * const itemDto = mapper.itemToDto(item);
 * ```
 */

import { Injectable } from '../../core/di';
import FluxoCaixaSimulacao from '../../models/FluxoCaixaSimulacao';
import FluxoCaixaSimulacaoItem from '../../models/FluxoCaixaSimulacaoItem';
import { CreateFluxoCaixaSimulacaoDto } from '../dto/fluxoCaixaSimulacao/CreateFluxoCaixaSimulacaoDto';
import { UpdateFluxoCaixaSimulacaoDto } from '../dto/fluxoCaixaSimulacao/UpdateFluxoCaixaSimulacaoDto';
import type { FluxoCaixaSimulacaoResponseDto, FluxoCaixaSimulacaoDetailResponseDto } from '../dto/fluxoCaixaSimulacao/FluxoCaixaSimulacaoResponseDto';
import type { FluxoCaixaSimulacaoItemResponseDto } from '../dto/fluxoCaixaSimulacao/FluxoCaixaSimulacaoItemResponseDto';

@Injectable()
export class FluxoCaixaSimulacaoMapper {
  toEntity(dto: CreateFluxoCaixaSimulacaoDto | UpdateFluxoCaixaSimulacaoDto): Partial<FluxoCaixaSimulacao> {
    const entity: any = {};
    if (dto.nome !== undefined) entity.nome = dto.nome;
    if (dto.descricao !== undefined) entity.descricao = dto.descricao;
    if (dto.dataInicio !== undefined) entity.dataInicio = dto.dataInicio;
    if (dto.dataFim !== undefined) entity.dataFim = dto.dataFim;
    if ('status' in dto && dto.status !== undefined) entity.status = dto.status;
    return entity;
  }

  toDto(entity: FluxoCaixaSimulacao): FluxoCaixaSimulacaoDetailResponseDto {
    const dto: FluxoCaixaSimulacaoDetailResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      nome: entity.nome,
      descricao: entity.descricao,
      dataInicio: entity.dataInicio,
      dataFim: entity.dataFim,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    if ((entity as any).itens && Array.isArray((entity as any).itens)) {
      dto.itens = (entity as any).itens.map((item: FluxoCaixaSimulacaoItem) => this.itemToDto(item));
    }

    return dto;
  }

  itemToDto(item: FluxoCaixaSimulacaoItem): FluxoCaixaSimulacaoItemResponseDto {
    return {
      id: item.id,
      simulacaoId: item.simulacaoId,
      tipoOverride: item.tipoOverride || '',
      referenciaTipo: item.referenciaTipo,
      referenciaId: item.referenciaId,
      descricao: item.descricao,
      tipoFluxo: item.tipoFluxo,
      dataOriginal: item.dataOriginal,
      dataNova: item.dataNova,
      valorOriginal: item.valorOriginal !== null ? Number(item.valorOriginal) : null,
      valorNovo: Number(item.valorNovo),
      contaBancariaId: item.contaBancariaId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
