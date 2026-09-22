/**
 * TenantApplicationService - Application Service para entidade Tenant
 * 
 * Contém a lógica de negócio para operações com tenants.
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { ITenantApplicationService } from './ITenantApplicationService';
import { ITenantRepository } from '../../../infrastructure/repository/ITenantRepository';
import { IConsultoriaRepository } from '../../../infrastructure/repository/IConsultoriaRepository';
import { ITenantActivationService } from '../../../core/tenant/ITenantActivationService';
import { TenantMapper } from '../../mappers/TenantMapper';
import { CreateTenantDto } from '../../dto/tenant/CreateTenantDto';
import { UpdateTenantDto } from '../../dto/tenant/UpdateTenantDto';
import { TenantResponseDto } from '../../dto/tenant/TenantResponseDto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, BusinessException, ForbiddenException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequireRole } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { getRequestContext } from '../../../core/authorization/helpers';
import { IAuditService } from '../../../core/audit/IAuditService';
import Usuario from '../../../models/Usuario';
import Tenant from '../../../models/Tenant';
import Consultoria from '../../../models/Consultoria';

/**
 * Application Service para entidade Tenant
 * 
 * Implementa lógica de negócio para operações com tenants.
 * CONSULTOR pode gerenciar tenants da sua consultoria.
 * GOD pode gerenciar todos os tenants.
 */
@Injectable()
export class TenantApplicationService implements ITenantApplicationService {
  private mapper: TenantMapper;

  constructor(
    @Inject(TYPES.IAuditService)
    private auditService: IAuditService,
    @Inject(TYPES.ITenantRepository)
    private repository: ITenantRepository,
    @Inject(TYPES.IConsultoriaRepository)
    private consultoriaRepository: IConsultoriaRepository,
    @Inject(TYPES.ITenantActivationService)
    private activationService: ITenantActivationService
  ) {
    this.mapper = new TenantMapper();
  }

  /**
   * Valida se o usuário atual é CONSULTOR e tem acesso ao tenant
   */
  private async validarAcessoConsultor(tenantId: number): Promise<void> {
    const context = getRequestContext();
    if (!context || !context.getUserId()) {
      throw new ForbiddenException('Usuário não autenticado', 'USER_NOT_AUTHENTICATED');
    }

    const userId = context.getUserId()!;
    const usuario = await Usuario.findByPk(userId);

    if (!usuario) {
      throw new ForbiddenException('Usuário não encontrado', 'USER_NOT_FOUND');
    }

    // GOD tem acesso total
    if (usuario.tipo === 'GOD') {
      return;
    }

    // CONSULTOR só pode acessar tenants da sua consultoria
    if (usuario.tipo === 'CONSULTOR') {
      if (!usuario.consultoriaId) {
        throw new ForbiddenException('Usuário CONSULTOR não possui consultoria associada', 'CONSULTOR_WITHOUT_CONSULTORIA');
      }

      const tenant = await this.repository.findById(tenantId);
      if (!tenant) {
        throw new NotFoundException('Tenant', tenantId);
      }

      if (tenant.consultoriaId !== usuario.consultoriaId) {
        throw new ForbiddenException('Tenant não pertence à sua consultoria', 'TENANT_NOT_IN_CONSULTORIA');
      }
    } else {
      throw new ForbiddenException('Apenas CONSULTOR ou GOD podem gerenciar tenants', 'ONLY_CONSULTOR_OR_GOD_ALLOWED');
    }
  }

  /**
   * Cria um novo tenant
   * 
   * @param dto - DTO com dados para criação
   * @returns Promise que resolve com o DTO do tenant criado
   */
  @RequireRole(['GOD', 'CONSULTOR'])
  @Transactional()
  @Auditable('Tenant')
  @CacheEvict('tenant:list:*', true)
  @CacheEvict('tenant:findBySlug:*', true)
  @CacheEvict('tenant:findByConsultoria:*', true)
  async create(dto: CreateTenantDto): Promise<TenantResponseDto> {
    const context = getRequestContext();
    if (!context || !context.getUserId()) {
      throw new ForbiddenException('Usuário não autenticado', 'USER_NOT_AUTHENTICATED');
    }
    const userId = context.getUserId()!;

    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      throw new ForbiddenException('Usuário não encontrado', 'USER_NOT_FOUND');
    }

    let consultoriaId: number;
    let consultoria: Consultoria | null = null;

    // CONSULTOR cria tenant na sua consultoria
    if (usuario.tipo === 'CONSULTOR') {
      if (!usuario.consultoriaId) {
        throw new ForbiddenException('Usuário CONSULTOR não possui consultoria associada', 'CONSULTOR_WITHOUT_CONSULTORIA');
      }

      consultoriaId = usuario.consultoriaId;

      // Verificar se consultoria está ativa
      consultoria = await this.consultoriaRepository.findById(consultoriaId);
      if (!consultoria) {
        throw new NotFoundException('Consultoria', consultoriaId);
      }
      if (!consultoria.ativo) {
        throw new BusinessException('Consultoria está inativa', 'CONSULTORIA_INACTIVE');
      }

      // Verificar limite de tenants
      if (consultoria.tenantCount >= consultoria.limiteTenants) {
        throw new BusinessException(
          `Limite de tenants (${consultoria.limiteTenants}) atingido para esta consultoria`,
          'TENANT_LIMIT_REACHED'
        );
      }
    } else if (usuario.tipo === 'GOD') {
      // GOD pode criar tenant para qualquer consultoria (deve especificar consultoriaId)
      if (!dto.consultoriaId) {
        throw new BusinessException('GOD deve especificar consultoriaId ao criar tenant', 'CONSULTORIA_ID_REQUIRED');
      }

      consultoriaId = dto.consultoriaId;

      // Verificar se consultoria existe e está ativa
      consultoria = await this.consultoriaRepository.findById(consultoriaId);
      if (!consultoria) {
        throw new NotFoundException('Consultoria', consultoriaId);
      }
      if (!consultoria.ativo) {
        throw new BusinessException('Consultoria está inativa', 'CONSULTORIA_INACTIVE');
      }

      // Verificar limite de tenants
      if (consultoria.tenantCount >= consultoria.limiteTenants) {
        throw new BusinessException(
          `Limite de tenants (${consultoria.limiteTenants}) atingido para esta consultoria`,
          'TENANT_LIMIT_REACHED'
        );
      }
    } else {
      throw new ForbiddenException('Apenas CONSULTOR ou GOD podem criar tenants', 'ONLY_CONSULTOR_OR_GOD_ALLOWED');
    }

    // Validar slug único
    const slugNormalizado = dto.slug.toLowerCase();
    const existente = await this.repository.findBySlug(slugNormalizado);
    if (existente) {
      throw new BusinessException('Slug já cadastrado', 'SLUG_ALREADY_EXISTS');
    }

    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);
    
    // Adicionar campos automáticos
    (entity as any).consultoriaId = consultoriaId;
    (entity as any).usercreation = userId;
    (entity as any).datecreation = new Date();
    (entity as any).ativo = true;
    (entity as any).dataAtivacao = new Date();
    if (!(entity as any).limiteUsuarios) {
      (entity as any).limiteUsuarios = 50;
    }

    // Criar via repositório
    const created = await this.repository.create(entity as any);

    // Atualizar contador de tenants na consultoria
    if (consultoria) {
      await this.consultoriaRepository.update(consultoriaId, {
        tenantCount: consultoria.tenantCount + 1,
      } as any);
    }

    // Registrar auditoria
    await this.auditService.logCreate('tenant', userId, dto);

    // Invalidar cache de status
    await this.activationService.invalidateTenantCache(created.id);

    // Retornar como DTO
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza um tenant existente
   * 
   * @param id - ID do tenant
   * @param dto - DTO com dados para atualização
   * @returns Promise que resolve com o DTO do tenant atualizado
   */
  @RequireRole(['GOD', 'CONSULTOR'])
  @Transactional()
  @Auditable('Tenant')
  @CacheEvict('tenant:getById:{0}')
  @CacheEvict('tenant:list:*', true)
  @CacheEvict('tenant:findBySlug:*', true)
  async update(id: number | string, dto: UpdateTenantDto): Promise<TenantResponseDto> {
    await this.validarAcessoConsultor(Number(id));

    // Verificar se tenant existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Tenant', id);
    }

    // Validar slug único (se alterado)
    if (dto.slug !== undefined) {
      const slugNormalizado = dto.slug.toLowerCase();
      const existente = await this.repository.findBySlug(slugNormalizado);
      if (existente && existente.id !== Number(id)) {
        throw new BusinessException('Slug já cadastrado', 'SLUG_ALREADY_EXISTS');
      }
    }

    // Não permitir alterar campos calculados ou de auditoria
    const dtoLimpo = { ...dto };
    delete (dtoLimpo as any).usercreation;
    delete (dtoLimpo as any).datecreation;
    delete (dtoLimpo as any).consultoriaId; // Não permitir mudar consultoria

    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dtoLimpo);

    // Atualizar via repositório
    const updated = await this.repository.update(id, entity as any);

    // Registrar auditoria
    const context = getRequestContext();
    const userId = context?.getUserId();
    if (userId) {
      await this.auditService.logUpdate('tenant', existing.id, existing, dtoLimpo);
    }

    // Invalidar cache
    await this.activationService.invalidateTenantCache(updated.id);

    // Retornar como DTO
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um tenant (soft delete - desativa)
   * 
   * @param id - ID do tenant
   * @returns Promise que resolve com true se removido, false caso contrário
   */
  @RequireRole(['GOD', 'CONSULTOR'])
  @Transactional()
  @Auditable('Tenant')
  @CacheEvict('tenant:getById:{0}')
  @CacheEvict('tenant:list:*', true)
  async delete(id: number | string): Promise<boolean> {
    await this.validarAcessoConsultor(Number(id));

    // Verificar se tenant existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Tenant', id);
    }

    // Desativar tenant (soft delete)
    await this.desativar(Number(id));

    return true;
  }

  /**
   * Busca um tenant por ID
   * 
   * @param id - ID do tenant
   * @returns Promise que resolve com o DTO do tenant encontrado ou null
   */
  @RequireRole(['GOD', 'CONSULTOR', 'ROOT', 'CLIENT'])
  @Cacheable('tenant:getById:{0}')
  async getById(id: number | string): Promise<TenantResponseDto | null> {
    // Validar acesso se não for GOD
    const context = getRequestContext();
    const userId = context?.getUserId();
    if (userId) {
      const usuario = await Usuario.findByPk(userId);
      if (usuario && usuario.tipo !== 'GOD') {
        await this.validarAcessoConsultor(Number(id));
      }
    }

    const tenant = await this.repository.findById(id);
    if (!tenant) {
      return null;
    }
    return this.mapper.toDto(tenant);
  }

  /**
   * Lista tenants com paginação
   * 
   * @param page - Número da página
   * @param limit - Limite de registros por página
   * @returns Promise que resolve com resultado paginado
   */
  @RequireRole(['GOD', 'CONSULTOR'])
  @Cacheable('tenant:list:{0}:{1}')
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<TenantResponseDto>> {
    const context = getRequestContext();
    const userId = context?.getUserId();
    
    let result: PaginatedResult<Tenant>;

    if (userId) {
      const usuario = await Usuario.findByPk(userId);
      
      // CONSULTOR só vê tenants da sua consultoria
      if (usuario && usuario.tipo === 'CONSULTOR' && usuario.consultoriaId) {
        const tenants = await this.repository.findByConsultoria(usuario.consultoriaId);
        result = {
          data: tenants,
          page: 1,
          limit: tenants.length,
          total: tenants.length,
          totalPages: 1,
        };
      } else {
        // GOD vê todos
        result = await this.repository.findAllPaginated(page, limit);
      }
    } else {
      result = await this.repository.findAllPaginated(page, limit);
    }
    
    return {
      ...result,
      data: result.data.map((item: Tenant) => this.mapper.toDto(item)),
    };
  }

  /**
   * Desativa um tenant
   * 
   * @param id - ID do tenant
   * @returns Promise que resolve com o DTO do tenant desativado
   */
  @RequireRole(['GOD', 'CONSULTOR'])
  @Transactional()
  @Auditable('Tenant')
  @CacheEvict('tenant:getById:{0}')
  @CacheEvict('tenant:list:*', true)
  async desativar(id: number): Promise<TenantResponseDto> {
    await this.validarAcessoConsultor(id);

    const tenant = await this.repository.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant', id);
    }

    if (!tenant.ativo) {
      throw new BusinessException('Tenant já está desativado', 'ALREADY_INACTIVE');
    }

    // Desativar tenant
    const updated = await this.repository.update(id, {
      ativo: false,
      dataDesativacao: new Date(),
    } as any);

    // Registrar auditoria
    const context = getRequestContext();
    const userId = context?.getUserId();
    if (userId) {
      await this.auditService.logUpdate('tenant', id, tenant, { ativo: false });
    }

    // Invalidar cache
    await this.activationService.invalidateTenantCache(id);

    return this.mapper.toDto(updated);
  }

  /**
   * Ativa um tenant
   * 
   * @param id - ID do tenant
   * @returns Promise que resolve com o DTO do tenant ativado
   */
  @RequireRole(['GOD', 'CONSULTOR'])
  @Transactional()
  @Auditable('Tenant')
  @CacheEvict('tenant:getById:{0}')
  @CacheEvict('tenant:list:*', true)
  async ativar(id: number): Promise<TenantResponseDto> {
    await this.validarAcessoConsultor(id);

    const tenant = await this.repository.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant', id);
    }

    if (tenant.ativo) {
      throw new BusinessException('Tenant já está ativo', 'ALREADY_ACTIVE');
    }

    // Verificar se consultoria está ativa
    const consultoria = await this.consultoriaRepository.findById(tenant.consultoriaId);
    if (!consultoria) {
      throw new NotFoundException('Consultoria', tenant.consultoriaId);
    }
    if (!consultoria.ativo) {
      throw new BusinessException('Consultoria está inativa. Não é possível ativar o tenant', 'CONSULTORIA_INACTIVE');
    }

    // Ativar tenant
    const updated = await this.repository.update(id, {
      ativo: true,
      dataAtivacao: new Date(),
      dataDesativacao: null,
    } as any);

    // Registrar auditoria
    const context = getRequestContext();
    const userId = context?.getUserId();
    if (userId) {
      await this.auditService.logUpdate('tenant', id, tenant, { ativo: true });
    }

    // Invalidar cache
    await this.activationService.invalidateTenantCache(id);
    await this.activationService.invalidateConsultoriaCache(tenant.consultoriaId);

    return this.mapper.toDto(updated);
  }

  /**
   * Obtém o status de um tenant
   * 
   * @param id - ID do tenant
   * @returns Promise que resolve com informações de status
   */
  @RequireRole(['GOD', 'CONSULTOR', 'ROOT', 'CLIENT'])
  @Cacheable('tenant:status:{0}')
  async getStatus(id: number): Promise<{ id: number; ativo: boolean; dataAtivacao: Date; dataDesativacao: Date | null } | null> {
    // Validar acesso se não for GOD
    const context = getRequestContext();
    const userId = context?.getUserId();
    if (userId) {
      const usuario = await Usuario.findByPk(userId);
      if (usuario && usuario.tipo !== 'GOD') {
        await this.validarAcessoConsultor(id);
      }
    }

    const tenant = await this.repository.findById(id);
    if (!tenant) {
      return null;
    }

    return {
      id: tenant.id,
      ativo: tenant.ativo,
      dataAtivacao: tenant.dataAtivacao,
      dataDesativacao: tenant.dataDesativacao,
    };
  }
}
