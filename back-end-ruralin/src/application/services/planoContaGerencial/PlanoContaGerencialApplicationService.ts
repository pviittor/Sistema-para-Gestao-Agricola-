import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IPlanoContaGerencialApplicationService } from './IPlanoContaGerencialApplicationService';
import { IPlanoContaGerencialRepository } from '../../../infrastructure/repository/IPlanoContaGerencialRepository';
import { CreatePlanoContaGerencialDto } from '../../dto/planoContaGerencial/CreatePlanoContaGerencialDto';
import { UpdatePlanoContaGerencialDto } from '../../dto/planoContaGerencial/UpdatePlanoContaGerencialDto';
import { PlanoContaGerencialResponseDto } from '../../dto/planoContaGerencial/PlanoContaGerencialResponseDto';
import { PlanoContaGerencialMapper } from '../../mappers/PlanoContaGerencialMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, ForbiddenException, BadRequestException } from '../../../core/exceptions';
import { getRequestContext } from '../../../core/authorization/helpers';
import PlanoContaGerencial from '../../../models/PlanoContaGerencial';

/**
 * Application Service para PlanoContaGerencial
 */
@Injectable()
export class PlanoContaGerencialApplicationService implements IPlanoContaGerencialApplicationService {
  constructor(
    @Inject(TYPES.IPlanoContaGerencialRepository) private repository: IPlanoContaGerencialRepository,
    private mapper: PlanoContaGerencialMapper
  ) {}

  /**
   * Calcula o nível hierárquico baseado no formato do item
   * Exemplo: 1.0.0.0 = nível 1, 1.1.0.0 = nível 2, 1.1.1.0 = nível 3, 1.1.1.1 = nível 4
   */
  private calcularNivel(item: string): number {
    const partes = item.split('.');
    let nivel = 1;
    for (let i = 1; i < partes.length; i++) {
      if (parseInt(partes[i], 10) > 0) {
        nivel = i + 1;
      }
    }
    return nivel;
  }

  /**
   * Valida se a conta pai pertence ao mesmo tenant e se o tipoFluxo é consistente (RN-PCG-02)
   */
  private async validarContaPai(contaPaiId: number | undefined, tenantId: number, tipoFluxo?: 'RECEITA' | 'DESPESA'): Promise<void> {
    if (!contaPaiId) {
      return;
    }

    const contaPai = await this.repository.findById(contaPaiId);
    if (!contaPai) {
      throw new NotFoundException('Conta pai não encontrada');
    }

    if (contaPai.tenantId !== tenantId) {
      throw new ForbiddenException('Conta pai não pertence ao mesmo tenant', 'CROSS_TENANT_VIOLATION');
    }

    // Validar que contas analíticas não podem ter filhos
    if (contaPai.tipo === 'ANALITICA') {
      throw new BadRequestException('Não é possível criar filha de conta analítica. Apenas contas sintéticas podem ter filhos.');
    }

    // RN-PCG-02: tipoFluxo do filho deve ser igual ao do pai
    if (tipoFluxo && contaPai.tipoFluxo !== tipoFluxo) {
      throw new BadRequestException(
        `O tipo de fluxo da conta filha (${tipoFluxo}) deve ser igual ao da conta pai (${contaPai.tipoFluxo})`
      );
    }
  }

  /**
   * RN-PCG-03: Propaga tipoFluxo recursivamente para todos os descendentes
   */
  private async propagarTipoFluxoDescendentes(contaId: number, tipoFluxo: 'RECEITA' | 'DESPESA'): Promise<void> {
    const filhas = await this.repository.findByContaPai(contaId);
    for (const filha of filhas) {
      if (filha.tipoFluxo !== tipoFluxo) {
        await this.repository.update(filha.id, { tipoFluxo } as any);
        await this.propagarTipoFluxoDescendentes(filha.id, tipoFluxo);
      }
    }
  }

  /**
   * Valida se a conta não possui filhos antes de alterar para analítica
   */
  private async validarAlteracaoParaAnalitica(contaId: number): Promise<void> {
    const contasFilhas = await this.repository.findByContaPai(contaId);
    if (contasFilhas.length > 0) {
      throw new BadRequestException('Não é possível alterar conta para analítica pois ela possui contas filhas');
    }
  }

  @RequirePermission('planoContaGerencial.read')
  @Cacheable('planoContaGerencial:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<PlanoContaGerencialResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map((item: PlanoContaGerencial) => this.mapper.toDto(item)),
    };
  }

  @RequirePermission('planoContaGerencial.read')
  @Cacheable('planoContaGerencial:getById:{0}', 3600)
  async getById(id: number | string): Promise<PlanoContaGerencialResponseDto | null> {
    const conta = await this.repository.findById(id);
    return conta ? this.mapper.toDto(conta) : null;
  }

  @RequirePermission('planoContaGerencial.read')
  @Cacheable('planoContaGerencial:findByNivel:{0}', 3600)
  async findByNivel(nivel: number): Promise<PlanoContaGerencialResponseDto[]> {
    if (nivel < 1 || nivel > 4) {
      throw new BadRequestException('Nível deve estar entre 1 e 4');
    }
    const contas = await this.repository.findByNivel(nivel);
    return contas.map((item: PlanoContaGerencial) => this.mapper.toDto(item));
  }

  @RequirePermission('planoContaGerencial.read')
  @Cacheable('planoContaGerencial:findByTipo:{0}', 3600)
  async findByTipo(tipo: 'SINTETICA' | 'ANALITICA'): Promise<PlanoContaGerencialResponseDto[]> {
    const contas = await this.repository.findByTipo(tipo);
    return contas.map((item: PlanoContaGerencial) => this.mapper.toDto(item));
  }

  @RequirePermission('planoContaGerencial.read')
  @Cacheable('planoContaGerencial:findByContaPai:{0}', 3600)
  async findByContaPai(contaPaiId: number): Promise<PlanoContaGerencialResponseDto[]> {
    const contas = await this.repository.findByContaPai(contaPaiId);
    return contas.map((item: PlanoContaGerencial) => this.mapper.toDto(item));
  }

  @RequirePermission('planoContaGerencial.read')
  @Cacheable('planoContaGerencial:findArvore:{0}', 3600)
  async findArvore(contaId: number): Promise<PlanoContaGerencialResponseDto | null> {
    const conta = await this.repository.findArvore(contaId);
    return conta ? this.mapper.toDto(conta) : null;
  }

  @RequirePermission('planoContaGerencial.read')
  @Cacheable('planoContaGerencial:findByTipoFluxo:{0}:{1}:{2}', 3600)
  async findByTipoFluxo(tipoFluxo: 'RECEITA' | 'DESPESA', apenasAnaliticas: boolean = false, apenasAtivas: boolean = true): Promise<PlanoContaGerencialResponseDto[]> {
    if (tipoFluxo !== 'RECEITA' && tipoFluxo !== 'DESPESA') {
      throw new BadRequestException('Tipo de fluxo deve ser RECEITA ou DESPESA');
    }
    const contas = await this.repository.findByTipoFluxo(tipoFluxo, apenasAnaliticas, apenasAtivas);
    return contas.map((item: PlanoContaGerencial) => this.mapper.toDto(item));
  }

  @RequirePermission('planoContaGerencial.create')
  @Auditable('PlanoContaGerencial')
  @CacheEvict('planoContaGerencial:list:*', true)
  @CacheEvict('planoContaGerencial:findByNivel:*', true)
  @CacheEvict('planoContaGerencial:findByTipo:*', true)
  @CacheEvict('planoContaGerencial:findByTipoFluxo:*', true)
  @CacheEvict('planoContaGerencial:findByContaPai:*', true)
  @CacheEvict('planoContaGerencial:findArvore:*', true)
  @Transactional()
  async create(dto: CreatePlanoContaGerencialDto): Promise<PlanoContaGerencialResponseDto> {
    const context = getRequestContext();
    if (!context || !context.getUserId() || !context.getTenantId()) {
      throw new ForbiddenException('Usuário não autenticado ou tenant não identificado.', 'USER_NOT_AUTHENTICATED');
    }
    const userId = context.getUserId()!;
    const tenantId = context.getTenantId()!;

    // Calcular nível automaticamente se não fornecido
    const nivel = dto.nivel || this.calcularNivel(dto.item);

    // Validar nível
    if (nivel < 1 || nivel > 4) {
      throw new BadRequestException('Nível deve estar entre 1 e 4');
    }

    // Validar cross-tenant e consistência de tipoFluxo (RN-PCG-02)
    await this.validarContaPai(dto.contaPaiId, tenantId, dto.tipoFluxo);

    const entityData = await this.mapper.toEntity(dto);

    const entityWithAudit = {
      ...entityData,
      nivel,
      usercreation: userId,
      datecreation: new Date(),
    };

    const conta = await this.repository.create(entityWithAudit);
    return this.mapper.toDto(conta);
  }

  @RequirePermission('planoContaGerencial.update')
  @Auditable('PlanoContaGerencial')
  @CacheEvict('planoContaGerencial:list:*', true)
  @CacheEvict('planoContaGerencial:getById:*', true)
  @CacheEvict('planoContaGerencial:findByNivel:*', true)
  @CacheEvict('planoContaGerencial:findByTipo:*', true)
  @CacheEvict('planoContaGerencial:findByTipoFluxo:*', true)
  @CacheEvict('planoContaGerencial:findByContaPai:*', true)
  @CacheEvict('planoContaGerencial:findArvore:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdatePlanoContaGerencialDto): Promise<PlanoContaGerencialResponseDto> {
    const conta = await this.repository.findById(id);
    if (!conta) {
      throw new NotFoundException('Conta não encontrada');
    }

    const context = getRequestContext();
    if (!context || !context.getTenantId()) {
      throw new ForbiddenException('Tenant não identificado');
    }
    const tenantId = context.getTenantId()!;

    // Calcular nível se item estiver sendo atualizado
    let nivel = conta.nivel;
    if (dto.item !== undefined) {
      nivel = this.calcularNivel(dto.item);
      if (nivel < 1 || nivel > 4) {
        throw new BadRequestException('Nível deve estar entre 1 e 4');
      }
    } else if (dto.nivel !== undefined) {
      nivel = dto.nivel;
      if (nivel < 1 || nivel > 4) {
        throw new BadRequestException('Nível deve estar entre 1 e 4');
      }
    }

    // Validar cross-tenant e consistência de tipoFluxo com conta pai (RN-PCG-02)
    if (dto.contaPaiId !== undefined) {
      await this.validarContaPai(dto.contaPaiId, tenantId, dto.tipoFluxo || conta.tipoFluxo);
    } else if (dto.tipoFluxo !== undefined && conta.contaPaiId) {
      // Se alterando tipoFluxo, validar consistência com pai existente
      await this.validarContaPai(conta.contaPaiId, tenantId, dto.tipoFluxo);
    }

    // Validar que não se pode alterar conta sintética com filhos para analítica
    if (dto.tipo === 'ANALITICA' && conta.tipo === 'SINTETICA') {
      await this.validarAlteracaoParaAnalitica(conta.id);
    }

    const entityData = await this.mapper.toEntity(dto);
    if (dto.item !== undefined || dto.nivel !== undefined) {
      entityData.nivel = nivel;
    }

    const updated = await this.repository.update(id, entityData);

    // RN-PCG-03: Se tipoFluxo foi alterado, propagar para descendentes
    if (dto.tipoFluxo !== undefined && dto.tipoFluxo !== conta.tipoFluxo) {
      await this.propagarTipoFluxoDescendentes(conta.id, dto.tipoFluxo);
    }

    return this.mapper.toDto(updated);
  }

  @RequirePermission('planoContaGerencial.delete')
  @Auditable('PlanoContaGerencial')
  @CacheEvict('planoContaGerencial:list:*', true)
  @CacheEvict('planoContaGerencial:getById:*', true)
  @CacheEvict('planoContaGerencial:findByNivel:*', true)
  @CacheEvict('planoContaGerencial:findByTipo:*', true)
  @CacheEvict('planoContaGerencial:findByTipoFluxo:*', true)
  @CacheEvict('planoContaGerencial:findByContaPai:*', true)
  @CacheEvict('planoContaGerencial:findArvore:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const conta = await this.repository.findById(id);
    if (!conta) {
      return false;
    }

    // Validar que conta não possui filhos antes de deletar
    const contasFilhas = await this.repository.findByContaPai(conta.id);
    if (contasFilhas.length > 0) {
      throw new BadRequestException('Não é possível deletar conta que possui contas filhas');
    }

    await this.repository.delete(id);
    return true;
  }
}
