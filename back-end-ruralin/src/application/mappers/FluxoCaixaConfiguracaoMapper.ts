/**
 * FluxoCaixaConfiguracaoMapper - Mapper para entidade FluxoCaixaConfiguracao
 *
 * Responsável por converter entre DTOs e entidades do domínio para FluxoCaixaConfiguracao.
 *
 * Regras importantes:
 * - Converter campos numéricos armazenados como DECIMAL
 * - Tratar campos opcionais (JSON) corretamente
 * - Fornecer valores padrão quando não houver configuração no banco
 *
 * @example
 * ```typescript
 * const mapper = new FluxoCaixaConfiguracaoMapper();
 *
 * // Converter DTO para entidade
 * const entity = mapper.toEntity(updateDto);
 *
 * // Converter entidade para DTO
 * const dto = mapper.toDto(configuracao);
 *
 * // Obter valores padrão
 * const defaults = mapper.toDefaults(tenantId);
 * ```
 */

import { Injectable } from '../../core/di';
import FluxoCaixaConfiguracao from '../../models/FluxoCaixaConfiguracao';
import { UpdateFluxoCaixaConfiguracaoDto } from '../dto/fluxoCaixaConfiguracao/UpdateFluxoCaixaConfiguracaoDto';
import type { FluxoCaixaConfiguracaoResponseDto } from '../dto/fluxoCaixaConfiguracao/FluxoCaixaConfiguracaoResponseDto';

@Injectable()
export class FluxoCaixaConfiguracaoMapper {
  toEntity(dto: UpdateFluxoCaixaConfiguracaoDto): Partial<FluxoCaixaConfiguracao> {
    const entity: any = {};
    if (dto.saldoMinimoAlerta !== undefined) entity.saldoMinimoAlerta = dto.saldoMinimoAlerta;
    if (dto.diasProjecaoPadrao !== undefined) entity.diasProjecaoPadrao = dto.diasProjecaoPadrao;
    if (dto.periodicidadePadrao !== undefined) entity.periodicidadePadrao = dto.periodicidadePadrao;
    if (dto.incluirAgreements !== undefined) entity.incluirAgreements = dto.incluirAgreements;
    if (dto.incluirTitulos !== undefined) entity.incluirTitulos = dto.incluirTitulos;
    if (dto.incluirRecorrentes !== undefined) entity.incluirRecorrentes = dto.incluirRecorrentes;
    if (dto.contasBancariasFiltro !== undefined) entity.contasBancariasFiltro = dto.contasBancariasFiltro;
    if (dto.coresConfiguracao !== undefined) entity.coresConfiguracao = dto.coresConfiguracao;
    return entity;
  }

  toDto(entity: FluxoCaixaConfiguracao): FluxoCaixaConfiguracaoResponseDto {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      saldoMinimoAlerta: Number(entity.saldoMinimoAlerta),
      diasProjecaoPadrao: entity.diasProjecaoPadrao,
      periodicidadePadrao: entity.periodicidadePadrao,
      incluirAgreements: entity.incluirAgreements,
      incluirTitulos: entity.incluirTitulos,
      incluirRecorrentes: entity.incluirRecorrentes,
      contasBancariasFiltro: entity.contasBancariasFiltro,
      coresConfiguracao: entity.coresConfiguracao,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  /**
   * Retorna configuração padrão quando não existe registro no banco para o tenant
   */
  toDefaults(tenantId: number): FluxoCaixaConfiguracaoResponseDto {
    return {
      id: 0,
      tenantId,
      saldoMinimoAlerta: 0,
      diasProjecaoPadrao: 90,
      periodicidadePadrao: 'mensal',
      incluirAgreements: true,
      incluirTitulos: true,
      incluirRecorrentes: true,
      contasBancariasFiltro: null,
      coresConfiguracao: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
