import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IFluxoCaixaConfiguracaoApplicationService } from './IFluxoCaixaConfiguracaoApplicationService';
import { IFluxoCaixaConfiguracaoRepository } from '../../../infrastructure/repository/IFluxoCaixaConfiguracaoRepository';
import { FluxoCaixaConfiguracaoResponseDto } from '../../dto/fluxoCaixaConfiguracao/FluxoCaixaConfiguracaoResponseDto';
import { UpdateFluxoCaixaConfiguracaoDto } from '../../dto/fluxoCaixaConfiguracao/UpdateFluxoCaixaConfiguracaoDto';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { Auditable } from '../../../core/audit';
import { CacheEvict } from '../../../core/cache';
import FluxoCaixaConfiguracao from '../../../models/FluxoCaixaConfiguracao';

/**
 * Application Service para entidade FluxoCaixaConfiguracao
 *
 * Implementa lógica de negócio para operações com configuração do fluxo de caixa.
 * Cada tenant possui no máximo uma configuração (singleton por tenant).
 */
@Injectable()
export class FluxoCaixaConfiguracaoApplicationService implements IFluxoCaixaConfiguracaoApplicationService {
  constructor(
    @Inject(TYPES.IFluxoCaixaConfiguracaoRepository)
    private repository: IFluxoCaixaConfiguracaoRepository,
  ) {}

  /**
   * Busca a configuração de fluxo de caixa do tenant
   *
   * Se não existir configuração persistida, retorna os valores padrão sem persistir (RN-16).
   *
   * @param tenantId - ID do tenant
   * @returns Promise que resolve com o DTO da configuração
   */
  async getByTenant(tenantId: number): Promise<FluxoCaixaConfiguracaoResponseDto> {
    const config = await this.repository.findByTenant(tenantId);
    if (!config) {
      return this.toDefaults(tenantId);
    }
    return this.toDto(config);
  }

  /**
   * Cria ou atualiza a configuração de fluxo de caixa do tenant (upsert)
   *
   * Se já existir configuração para o tenant, atualiza os campos informados.
   * Se não existir, cria uma nova configuração com os valores informados.
   *
   * @param tenantId - ID do tenant
   * @param dto - DTO com dados para atualização/criação
   * @returns Promise que resolve com o DTO da configuração atualizada
   */
  @Transactional()
  @Auditable('FluxoCaixaConfiguracao')
  @CacheEvict('fluxo_caixa_configuracao:byTenant:*', true)
  async upsertByTenant(tenantId: number, dto: UpdateFluxoCaixaConfiguracaoDto): Promise<FluxoCaixaConfiguracaoResponseDto> {
    const entityData = this.toEntity(dto);

    let config = await this.repository.findByTenant(tenantId);
    if (config) {
      await config.update(entityData);
    } else {
      config = await this.repository.create({ ...entityData, tenantId } as any);
    }

    return this.toDto(config);
  }

  /**
   * Retorna valores padrão sem persistir (RN-16)
   *
   * @param tenantId - ID do tenant
   * @returns DTO com valores padrão da configuração
   */
  private toDefaults(tenantId: number): FluxoCaixaConfiguracaoResponseDto {
    return {
      id: 0,
      tenantId,
      saldoMinimoAlerta: 0,
      diasProjecaoPadrao: 30,
      periodicidadePadrao: 'DIARIO',
      incluirAgreements: true,
      incluirTitulos: true,
      incluirRecorrentes: true,
      contasBancariasFiltro: null,
      coresConfiguracao: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Converte entidade para DTO de resposta
   *
   * @param entity - Entidade FluxoCaixaConfiguracao
   * @returns DTO de resposta
   */
  private toDto(entity: FluxoCaixaConfiguracao): FluxoCaixaConfiguracaoResponseDto {
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
   * Converte DTO de atualização para dados de entidade
   *
   * @param dto - DTO de atualização
   * @returns Objeto parcial com campos para persistência
   */
  private toEntity(dto: UpdateFluxoCaixaConfiguracaoDto): Partial<FluxoCaixaConfiguracao> {
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
}
