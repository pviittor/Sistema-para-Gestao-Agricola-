import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { ICertificadoDigitalApplicationService } from './ICertificadoDigitalApplicationService';
import { ICertificadoDigitalRepository } from '../../../infrastructure/repository/ICertificadoDigitalRepository';
import { CreateCertificadoDigitalDto } from '../../dto/certificadoDigital/CreateCertificadoDigitalDto';
import { UpdateCertificadoDigitalDto } from '../../dto/certificadoDigital/UpdateCertificadoDigitalDto';
import { CertificadoDigitalResponseDto } from '../../dto/certificadoDigital/CertificadoDigitalResponseDto';
import { CertificadoDigitalMapper } from '../../mappers/CertificadoDigitalMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { ForbiddenException } from '../../../core/exceptions/ForbiddenException';
import { getRequestContext } from '../../../core/authorization/helpers';
import CertificadoDigital from '../../../models/CertificadoDigital';

/**
 * Application Service para CertificadoDigital
 *
 * Implementa a lógica de negócio para operações de certificados digitais.
 *
 * Regras de negócio:
 * 1. Na criação: rejeitar se data_validade <= hoje
 * 2. No setPadrao: limpar padrão de todos os outros certificados do tenant, então definir o selecionado
 * 3. Na exclusão: se for o certificado padrão, prosseguir normalmente (apenas aviso em log)
 */
@Injectable()
export class CertificadoDigitalApplicationService implements ICertificadoDigitalApplicationService {
  constructor(
    @Inject(TYPES.ICertificadoDigitalRepository) private repository: ICertificadoDigitalRepository,
    private mapper: CertificadoDigitalMapper
  ) {}

  /**
   * Lista todos os certificados digitais com paginação
   */
  @RequirePermission('certificado_digital.read')
  @Cacheable('certificado_digital:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<CertificadoDigitalResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map((item: CertificadoDigital) => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca um certificado digital por ID
   */
  @RequirePermission('certificado_digital.read')
  @Cacheable('certificado_digital:getById:{0}', 3600)
  async getById(id: number | string): Promise<CertificadoDigitalResponseDto | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Busca o certificado padrão do tenant atual
   */
  @RequirePermission('certificado_digital.read')
  async findPadrao(): Promise<CertificadoDigitalResponseDto | null> {
    const context = getRequestContext();
    if (!context || !context.getTenantId()) {
      throw new ForbiddenException('Tenant não identificado');
    }
    const tenantId = context.getTenantId()!;

    const entity = await this.repository.findPadraoByTenant(tenantId);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Cria um novo certificado digital
   *
   * Regra de negócio: rejeitar se data_validade <= hoje
   */
  @RequirePermission('certificado_digital.create')
  @Auditable('CertificadoDigital')
  @CacheEvict('certificado_digital:list:*', true)
  @Transactional()
  async create(dto: CreateCertificadoDigitalDto): Promise<CertificadoDigitalResponseDto> {
    const context = getRequestContext();
    if (!context || !context.getUserId() || !context.getTenantId()) {
      throw new ForbiddenException('Usuário não autenticado ou tenant não identificado.', 'USER_NOT_AUTHENTICATED');
    }
    const userId = context.getUserId()!;
    const tenantId = context.getTenantId()!;

    // Regra 1: rejeitar se data_validade <= hoje
    const dataValidade = new Date(dto.data_validade);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dataValidade <= hoje) {
      throw new BadRequestException('A data de validade do certificado deve ser posterior à data atual');
    }

    // Se o certificado está sendo criado como padrão, limpar os outros
    if (dto.padrao === true) {
      await this.repository.clearPadraoByTenant(tenantId);
    }

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
   * Atualiza um certificado digital existente
   */
  @RequirePermission('certificado_digital.update')
  @Auditable('CertificadoDigital')
  @CacheEvict('certificado_digital:list:*', true)
  @CacheEvict('certificado_digital:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateCertificadoDigitalDto): Promise<CertificadoDigitalResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Certificado Digital não encontrado');
    }

    const context = getRequestContext();
    if (!context || !context.getTenantId()) {
      throw new ForbiddenException('Tenant não identificado');
    }
    const tenantId = context.getTenantId()!;

    // Se a data de validade está sendo atualizada, validar
    if (dto.data_validade) {
      const dataValidade = new Date(dto.data_validade);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      if (dataValidade <= hoje) {
        throw new BadRequestException('A data de validade do certificado deve ser posterior à data atual');
      }
    }

    // Se o certificado está sendo definido como padrão, limpar os outros
    if (dto.padrao === true) {
      await this.repository.clearPadraoByTenant(tenantId);
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.repository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um certificado digital
   *
   * Nota: se for o certificado padrão, prossegue normalmente
   */
  @RequirePermission('certificado_digital.delete')
  @Auditable('CertificadoDigital')
  @CacheEvict('certificado_digital:list:*', true)
  @CacheEvict('certificado_digital:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      return false;
    }

    // Aviso se for o certificado padrão (não bloqueia exclusão)
    if (entity.padrao) {
      console.warn(`[CertificadoDigital] Excluindo certificado padrão id=${id} do tenant=${entity.tenantId}`);
    }

    await this.repository.delete(id);
    return true;
  }

  /**
   * Define um certificado como padrão do tenant
   *
   * Regra: limpa o padrão de todos os outros certificados do tenant,
   * então define o certificado selecionado como padrão.
   */
  @RequirePermission('certificado_digital.update')
  @Auditable('CertificadoDigital')
  @CacheEvict('certificado_digital:list:*', true)
  @CacheEvict('certificado_digital:getById:*', true)
  @Transactional()
  async setPadrao(id: number): Promise<CertificadoDigitalResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException('Certificado Digital não encontrado');
    }

    const context = getRequestContext();
    if (!context || !context.getTenantId()) {
      throw new ForbiddenException('Tenant não identificado');
    }
    const tenantId = context.getTenantId()!;

    // Limpar todos os outros padrões do tenant
    await this.repository.clearPadraoByTenant(tenantId);

    // Definir este certificado como padrão
    const updated = await this.repository.update(id, { padrao: true } as any);
    return this.mapper.toDto(updated);
  }
}
