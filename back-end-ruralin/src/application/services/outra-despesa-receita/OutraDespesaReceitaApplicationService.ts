import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IOutraDespesaReceitaApplicationService } from './IOutraDespesaReceitaApplicationService';
import { IOutraDespesaReceitaRepository } from '../../../infrastructure/repository/IOutraDespesaReceitaRepository';
import { IPlanoContaGerencialRepository } from '../../../infrastructure/repository/IPlanoContaGerencialRepository';
import { IConfiguradorCicloRepository } from '../../../infrastructure/repository/IConfiguradorCicloRepository';
import { CreateOutraDespesaReceitaDto } from '../../dto/outraDespesaReceita/CreateOutraDespesaReceitaDto';
import { UpdateOutraDespesaReceitaDto } from '../../dto/outraDespesaReceita/UpdateOutraDespesaReceitaDto';
import { OutraDespesaReceitaResponseDto } from '../../dto/outraDespesaReceita/OutraDespesaReceitaResponseDto';
import { OutraDespesaReceitaMapper } from '../../mappers/OutraDespesaReceitaMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { ForbiddenException } from '../../../core/exceptions/ForbiddenException';
import { getRequestContext } from '../../../core/authorization/helpers';
import OutraDespesaReceita from '../../../models/OutraDespesaReceita';

/**
 * Application Service para OutraDespesaReceita
 *
 * Implementa a lógica de negócio para operações de outras despesas e receitas.
 */
@Injectable()
export class OutraDespesaReceitaApplicationService implements IOutraDespesaReceitaApplicationService {
  constructor(
    @Inject(TYPES.IOutraDespesaReceitaRepository) private repository: IOutraDespesaReceitaRepository,
    @Inject(TYPES.IPlanoContaGerencialRepository) private planoGerencialRepository: IPlanoContaGerencialRepository,
    @Inject(TYPES.IConfiguradorCicloRepository) private configuradorCicloRepository: IConfiguradorCicloRepository,
    private mapper: OutraDespesaReceitaMapper
  ) {}

  /**
   * Valida regras de negócio para criação e atualização
   *
   * Regras:
   * 1. Se tipo_alocacao = CONFIGURADOR_CICLO, configurador_ciclo_id é obrigatório
   * 2. Se tipo_alocacao = PROPRIEDADE, configurador_ciclo_id deve ser nulo
   * 3. PlanoGerencial referenciado deve ter tipo = ANALITICA
   * 4. PlanoGerencial deve pertencer ao mesmo tenant (crossTenant check)
   * 5. ConfiguradorCiclo (quando informado) deve pertencer ao mesmo tenant (crossTenant check)
   * 6. valor > 0 (DTO também valida)
   * 7. RN-ODR-01: tipoFluxo da conta gerencial deve coincidir com o tipo do lançamento
   */
  private async validarRegrasNegocio(
    tipoAlocacao: string,
    planoGerencialId: number,
    configuradorCicloId: number | undefined | null,
    valor: number,
    tenantId: number,
    tipoLancamento?: string
  ): Promise<void> {
    // Regra 6: valor deve ser positivo
    if (valor <= 0) {
      throw new BadRequestException('O valor deve ser maior que zero');
    }

    // Regra 1: Se tipo_alocacao = CONFIGURADOR_CICLO, configurador_ciclo_id é obrigatório
    if (tipoAlocacao === 'CONFIGURADOR_CICLO' && !configuradorCicloId) {
      throw new BadRequestException('Quando o tipo de alocação é CONFIGURADOR_CICLO, o configurador de ciclo é obrigatório');
    }

    // Regra 2: Se tipo_alocacao = PROPRIEDADE, configurador_ciclo_id deve ser nulo
    if (tipoAlocacao === 'PROPRIEDADE' && configuradorCicloId) {
      throw new BadRequestException('Quando o tipo de alocação é PROPRIEDADE, o configurador de ciclo deve ser nulo');
    }

    // Regra 3 e 4: Validar PlanoGerencial
    const planoGerencial = await this.planoGerencialRepository.findById(planoGerencialId);
    if (!planoGerencial) {
      throw new NotFoundException('Plano Gerencial não encontrado');
    }

    // Regra 4: CrossTenant check do PlanoGerencial
    if (planoGerencial.tenantId !== tenantId) {
      throw new ForbiddenException('Plano Gerencial não pertence ao mesmo tenant', 'CROSS_TENANT_VIOLATION');
    }

    // Regra 3: PlanoGerencial deve ser do tipo ANALITICA
    if (planoGerencial.tipo !== 'ANALITICA') {
      throw new BadRequestException('O Plano Gerencial referenciado deve ser do tipo ANALITICA');
    }

    // Regra 7 (RN-ODR-01): tipoFluxo da conta gerencial deve coincidir com o tipo do lançamento
    if (tipoLancamento && planoGerencial.tipoFluxo && planoGerencial.tipoFluxo !== tipoLancamento) {
      throw new BadRequestException(
        `A conta gerencial selecionada é do tipo ${planoGerencial.tipoFluxo} e não pode ser usada em lançamentos do tipo ${tipoLancamento}`
      );
    }

    // Regra 5: CrossTenant check do ConfiguradorCiclo (quando informado)
    if (configuradorCicloId) {
      const configuradorCiclo = await this.configuradorCicloRepository.findById(configuradorCicloId);
      if (!configuradorCiclo) {
        throw new NotFoundException('Configurador de Ciclo não encontrado');
      }

      if (configuradorCiclo.tenantId !== tenantId) {
        throw new ForbiddenException('Configurador de Ciclo não pertence ao mesmo tenant', 'CROSS_TENANT_VIOLATION');
      }
    }
  }

  /**
   * Lista todas as outras despesas/receitas com paginação
   */
  @RequirePermission('outra_despesa_receita.read')
  @Cacheable('outra_despesa_receita:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<OutraDespesaReceitaResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map((item: OutraDespesaReceita) => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca uma outra despesa/receita por ID
   */
  @RequirePermission('outra_despesa_receita.read')
  @Cacheable('outra_despesa_receita:getById:{0}', 3600)
  async getById(id: number | string): Promise<OutraDespesaReceitaResponseDto | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Busca outras despesas/receitas por filtros combinados
   */
  @RequirePermission('outra_despesa_receita.read')
  @Cacheable('outra_despesa_receita:findByFilters:{0}:{1}:{2}:{3}:{4}', 3600)
  async findByFilters(
    planoGerencialId?: number,
    dataInicio?: string,
    dataFim?: string,
    configuradorCicloId?: number,
    cultura?: string
  ): Promise<OutraDespesaReceitaResponseDto[]> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId() ?? 0;
    const result = await this.repository.findByFilters(tenantId, planoGerencialId, dataInicio, dataFim, configuradorCicloId, cultura);
    return result.map((item: OutraDespesaReceita) => this.mapper.toDto(item));
  }

  /**
   * Busca outras despesas/receitas por cultura
   */
  @RequirePermission('outra_despesa_receita.read')
  @Cacheable('outra_despesa_receita:findByCultura:{0}', 3600)
  async findByCultura(cultura: string): Promise<OutraDespesaReceitaResponseDto[]> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId() ?? 0;
    const result = await this.repository.findByCultura(tenantId, cultura);
    return result.map((item: OutraDespesaReceita) => this.mapper.toDto(item));
  }

  /**
   * Cria uma nova outra despesa/receita
   */
  @RequirePermission('outra_despesa_receita.create')
  @Auditable('OutraDespesaReceita')
  @CacheEvict('outra_despesa_receita:list:*', true)
  @CacheEvict('outra_despesa_receita:findByFilters:*', true)
  @CacheEvict('outra_despesa_receita:findByCultura:*', true)
  @Transactional()
  async create(dto: CreateOutraDespesaReceitaDto): Promise<OutraDespesaReceitaResponseDto> {
    const context = getRequestContext();
    if (!context || !context.getUserId() || !context.getTenantId()) {
      throw new ForbiddenException('Usuário não autenticado ou tenant não identificado.', 'USER_NOT_AUTHENTICATED');
    }
    const userId = context.getUserId()!;
    const tenantId = context.getTenantId()!;

    // Validar regras de negócio
    await this.validarRegrasNegocio(
      dto.tipoAlocacao,
      dto.planoGerencialId,
      dto.configuradorCicloId,
      dto.valor,
      tenantId,
      dto.tipo
    );

    const entityData = await this.mapper.toEntity(dto);

    const entityWithAudit = {
      ...entityData,
      usercreation: userId,
      datecreation: new Date(),
    };

    const entity = await this.repository.create(entityWithAudit);
    return this.mapper.toDto(entity);
  }

  /**
   * Atualiza uma outra despesa/receita existente
   */
  @RequirePermission('outra_despesa_receita.update')
  @Auditable('OutraDespesaReceita')
  @CacheEvict('outra_despesa_receita:list:*', true)
  @CacheEvict('outra_despesa_receita:getById:*', true)
  @CacheEvict('outra_despesa_receita:findByFilters:*', true)
  @CacheEvict('outra_despesa_receita:findByCultura:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateOutraDespesaReceitaDto): Promise<OutraDespesaReceitaResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Outra Despesa/Receita não encontrada');
    }

    const context = getRequestContext();
    if (!context || !context.getTenantId()) {
      throw new ForbiddenException('Tenant não identificado');
    }
    const tenantId = context.getTenantId()!;

    // Montar valores finais para validação (usar existente se não informado no DTO)
    const tipoAlocacao = dto.tipoAlocacao !== undefined ? dto.tipoAlocacao : existing.tipoAlocacao;
    const planoGerencialId = dto.planoGerencialId !== undefined ? dto.planoGerencialId : existing.planoGerencialId;
    const configuradorCicloId = dto.configuradorCicloId !== undefined ? dto.configuradorCicloId : existing.configuradorCicloId;
    const valor = dto.valor !== undefined ? dto.valor : existing.valor;
    const tipoLancamento = dto.tipo !== undefined ? dto.tipo : existing.tipo;

    // Validar regras de negócio com os valores finais
    await this.validarRegrasNegocio(
      tipoAlocacao,
      planoGerencialId,
      configuradorCicloId,
      valor,
      tenantId,
      tipoLancamento
    );

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.repository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove uma outra despesa/receita
   */
  @RequirePermission('outra_despesa_receita.delete')
  @Auditable('OutraDespesaReceita')
  @CacheEvict('outra_despesa_receita:list:*', true)
  @CacheEvict('outra_despesa_receita:getById:*', true)
  @CacheEvict('outra_despesa_receita:findByFilters:*', true)
  @CacheEvict('outra_despesa_receita:findByCultura:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      return false;
    }

    await this.repository.delete(id);
    return true;
  }
}
