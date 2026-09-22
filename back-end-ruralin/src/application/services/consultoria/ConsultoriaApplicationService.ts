/**
 * ConsultoriaApplicationService - Application Service para entidade Consultoria
 * 
 * Contém a lógica de negócio para operações com consultorias.
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IConsultoriaApplicationService } from './IConsultoriaApplicationService';
import { IConsultoriaRepository } from '../../../infrastructure/repository/IConsultoriaRepository';
import { ITenantRepository } from '../../../infrastructure/repository/ITenantRepository';
import { ConsultoriaMapper } from '../../mappers/ConsultoriaMapper';
import { CreateConsultoriaDto } from '../../dto/consultoria/CreateConsultoriaDto';
import { UpdateConsultoriaDto } from '../../dto/consultoria/UpdateConsultoriaDto';
import { ConsultoriaResponseDto } from '../../dto/consultoria/ConsultoriaResponseDto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, BusinessException, ForbiddenException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequireRole } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { getRequestContext } from '../../../core/authorization/helpers';
import { IAuditService } from '../../../core/audit/IAuditService';
import Usuario from '../../../models/Usuario';
import Consultoria from '../../../models/Consultoria';

/**
 * Application Service para entidade Consultoria
 * 
 * Implementa lógica de negócio para operações com consultorias.
 * Apenas usuários GOD podem gerenciar consultorias.
 */
@Injectable()
export class ConsultoriaApplicationService implements IConsultoriaApplicationService {
  private mapper: ConsultoriaMapper;

  constructor(
    @Inject(TYPES.IAuditService)
    private auditService: IAuditService,
    @Inject(TYPES.IConsultoriaRepository)
    private repository: IConsultoriaRepository,
    @Inject(TYPES.ITenantRepository)
    private tenantRepository: ITenantRepository
  ) {
    this.mapper = new ConsultoriaMapper();
  }

  /**
   * Valida se o usuário atual é GOD
   */
  private async validarUsuarioGod(): Promise<void> {
    const context = getRequestContext();
    if (!context || !context.getUserId()) {
      throw new ForbiddenException('Usuário não autenticado', 'USER_NOT_AUTHENTICATED');
    }

    const userId = context.getUserId()!;
    const usuario = await Usuario.findByPk(userId);
    
    if (!usuario || usuario.tipo !== 'GOD') {
      throw new ForbiddenException('Apenas usuários GOD podem gerenciar consultorias', 'ONLY_GOD_ALLOWED');
    }
  }

  /**
   * Cria uma nova consultoria
   * 
   * @param dto - DTO com dados para criação
   * @returns Promise que resolve com o DTO da consultoria criada
   */
  @RequireRole('GOD')
  @Transactional()
  @Auditable('Consultoria')
  @CacheEvict('consultoria:list:*', true)
  @CacheEvict('consultoria:findByCnpj:*', true)
  async create(dto: CreateConsultoriaDto): Promise<ConsultoriaResponseDto> {
    await this.validarUsuarioGod();

    const context = getRequestContext();
    if (!context || !context.getUserId()) {
      throw new ForbiddenException('Usuário não autenticado', 'USER_NOT_AUTHENTICATED');
    }
    const userId = context.getUserId()!;

    // Validar CNPJ único
    const cnpjLimpo = dto.cnpj.replace(/[.\-\/]/g, '');
    const existente = await this.repository.findByCnpj(cnpjLimpo);
    if (existente) {
      throw new BusinessException('CNPJ já cadastrado', 'CNPJ_ALREADY_EXISTS');
    }

    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);
    
    // Adicionar campos automáticos
    (entity as any).usercreation = userId;
    (entity as any).datecreation = new Date();
    (entity as any).ativo = true;
    (entity as any).dataAtivacao = new Date();
    (entity as any).tenantCount = 0;
    if (!(entity as any).limiteTenants) {
      (entity as any).limiteTenants = 10;
    }

    // Criar via repositório
    const created = await this.repository.create(entity as any);

    // Registrar auditoria
    await this.auditService.logCreate('consultoria', userId, dto);

    // Retornar como DTO
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza uma consultoria existente
   * 
   * @param id - ID da consultoria
   * @param dto - DTO com dados para atualização
   * @returns Promise que resolve com o DTO da consultoria atualizada
   */
  @RequireRole('GOD')
  @Transactional()
  @Auditable('Consultoria')
  @CacheEvict('consultoria:getById:{0}')
  @CacheEvict('consultoria:list:*', true)
  @CacheEvict('consultoria:findByCnpj:*', true)
  async update(id: number | string, dto: UpdateConsultoriaDto): Promise<ConsultoriaResponseDto> {
    await this.validarUsuarioGod();

    // Verificar se consultoria existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Consultoria', id);
    }

    // Validar CNPJ único (se alterado)
    if (dto.cnpj !== undefined) {
      const cnpjLimpo = dto.cnpj.replace(/[.\-\/]/g, '');
      const existente = await this.repository.findByCnpj(cnpjLimpo);
      if (existente && existente.id !== Number(id)) {
        throw new BusinessException('CNPJ já cadastrado', 'CNPJ_ALREADY_EXISTS');
      }
    }

    // Não permitir alterar campos calculados ou de auditoria
    const dtoLimpo = { ...dto };
    delete (dtoLimpo as any).tenantCount;
    delete (dtoLimpo as any).usercreation;
    delete (dtoLimpo as any).datecreation;

    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dtoLimpo);

    // Atualizar via repositório
    const updated = await this.repository.update(id, entity as any);

    // Registrar auditoria
    const context = getRequestContext();
    const userId = context?.getUserId();
    if (userId) {
      await this.auditService.logUpdate('consultoria', existing.id, existing, dtoLimpo);
    }

    // Retornar como DTO
    return this.mapper.toDto(updated);
  }

  /**
   * Remove uma consultoria (soft delete - desativa)
   * 
   * @param id - ID da consultoria
   * @returns Promise que resolve com true se removido, false caso contrário
   */
  @RequireRole('GOD')
  @Transactional()
  @Auditable('Consultoria')
  @CacheEvict('consultoria:getById:{0}')
  @CacheEvict('consultoria:list:*', true)
  async delete(id: number | string): Promise<boolean> {
    await this.validarUsuarioGod();

    // Verificar se consultoria existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Consultoria', id);
    }

    // Desativar consultoria (soft delete)
    await this.desativar(Number(id));

    return true;
  }

  /**
   * Busca uma consultoria por ID
   * 
   * @param id - ID da consultoria
   * @returns Promise que resolve com o DTO da consultoria encontrada ou null
   */
  @RequireRole('GOD')
  @Cacheable('consultoria:getById:{0}')
  async getById(id: number | string): Promise<ConsultoriaResponseDto | null> {
    const consultoria = await this.repository.findById(id);
    if (!consultoria) {
      return null;
    }
    return this.mapper.toDto(consultoria);
  }

  /**
   * Lista consultorias com paginação
   * 
   * @param page - Número da página
   * @param limit - Limite de registros por página
   * @returns Promise que resolve com resultado paginado
   */
  @RequireRole('GOD')
  @Cacheable('consultoria:list:{0}:{1}')
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<ConsultoriaResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    
    return {
      ...result,
      data: result.data.map((item: Consultoria) => this.mapper.toDto(item)),
    };
  }

  /**
   * Desativa uma consultoria
   * 
   * @param id - ID da consultoria
   * @returns Promise que resolve com o DTO da consultoria desativada
   */
  @RequireRole('GOD')
  @Transactional()
  @Auditable('Consultoria')
  @CacheEvict('consultoria:getById:{0}')
  @CacheEvict('consultoria:list:*', true)
  async desativar(id: number): Promise<ConsultoriaResponseDto> {
    await this.validarUsuarioGod();

    const consultoria = await this.repository.findById(id);
    if (!consultoria) {
      throw new NotFoundException('Consultoria', id);
    }

    if (!consultoria.ativo) {
      throw new BusinessException('Consultoria já está desativada', 'ALREADY_INACTIVE');
    }

    // Desativar consultoria
    const updated = await this.repository.update(id, {
      ativo: false,
      dataDesativacao: new Date(),
    } as any);

    // Desativar todos os tenants da consultoria (cascade)
    const tenants = await this.tenantRepository.findByConsultoria(id);
    for (const tenant of tenants) {
      if (tenant.ativo) {
        await this.tenantRepository.update(tenant.id, {
          ativo: false,
          dataDesativacao: new Date(),
        } as any);
      }
    }

    // Registrar auditoria
    const context = getRequestContext();
    const userId = context?.getUserId();
    if (userId) {
      await this.auditService.logUpdate('consultoria', id, consultoria, { ativo: false });
    }

    return this.mapper.toDto(updated);
  }

  /**
   * Ativa uma consultoria
   * 
   * @param id - ID da consultoria
   * @returns Promise que resolve com o DTO da consultoria ativada
   */
  @RequireRole('GOD')
  @Transactional()
  @Auditable('Consultoria')
  @CacheEvict('consultoria:getById:{0}')
  @CacheEvict('consultoria:list:*', true)
  async ativar(id: number): Promise<ConsultoriaResponseDto> {
    await this.validarUsuarioGod();

    const consultoria = await this.repository.findById(id);
    if (!consultoria) {
      throw new NotFoundException('Consultoria', id);
    }

    if (consultoria.ativo) {
      throw new BusinessException('Consultoria já está ativa', 'ALREADY_ACTIVE');
    }

    // Ativar consultoria
    const updated = await this.repository.update(id, {
      ativo: true,
      dataAtivacao: new Date(),
      dataDesativacao: null,
    } as any);

    // Registrar auditoria
    const context = getRequestContext();
    const userId = context?.getUserId();
    if (userId) {
      await this.auditService.logUpdate('consultoria', id, consultoria, { ativo: true });
    }

    return this.mapper.toDto(updated);
  }

  /**
   * Aumenta o limite de tenants de uma consultoria
   * 
   * @param id - ID da consultoria
   * @param novoLimite - Novo limite de tenants
   * @returns Promise que resolve com o DTO da consultoria atualizada
   */
  @RequireRole('GOD')
  @Transactional()
  @Auditable('Consultoria')
  @CacheEvict('consultoria:getById:{0}')
  async aumentarLimiteTenants(id: number, novoLimite: number): Promise<ConsultoriaResponseDto> {
    await this.validarUsuarioGod();

    const consultoria = await this.repository.findById(id);
    if (!consultoria) {
      throw new NotFoundException('Consultoria', id);
    }

    if (novoLimite < consultoria.tenantCount) {
      throw new BusinessException(
        `Novo limite (${novoLimite}) não pode ser menor que a quantidade atual de tenants (${consultoria.tenantCount})`,
        'LIMIT_TOO_LOW'
      );
    }

    if (novoLimite < 1) {
      throw new BusinessException('Limite deve ser no mínimo 1', 'INVALID_LIMIT');
    }

    // Atualizar limite
    const updated = await this.repository.update(id, {
      limiteTenants: novoLimite,
    } as any);

    // Registrar auditoria
    const context = getRequestContext();
    const userId = context?.getUserId();
    if (userId) {
      await this.auditService.logUpdate('consultoria', id, consultoria, { limiteTenants: novoLimite });
    }

    return this.mapper.toDto(updated);
  }
}
