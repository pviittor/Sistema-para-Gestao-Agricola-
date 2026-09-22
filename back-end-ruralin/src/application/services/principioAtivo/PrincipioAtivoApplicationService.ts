import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IPrincipioAtivoApplicationService } from './IPrincipioAtivoApplicationService';
import { IPrincipioAtivoRepository } from '../../../infrastructure/repository/IPrincipioAtivoRepository';
import { CreatePrincipioAtivoDto } from '../../dto/principioAtivo/CreatePrincipioAtivoDto';
import { UpdatePrincipioAtivoDto } from '../../dto/principioAtivo/UpdatePrincipioAtivoDto';
import { PrincipioAtivoResponseDto } from '../../dto/principioAtivo/PrincipioAtivoResponseDto';
import { PrincipioAtivoMapper } from '../../mappers/PrincipioAtivoMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { ForbiddenException, NotFoundException } from '../../../core/exceptions';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para PrincipioAtivo
 * 
 * Implementa a lógica de negócio para operações com princípios ativos.
 */
@Injectable()
export class PrincipioAtivoApplicationService implements IPrincipioAtivoApplicationService {
  constructor(
    @Inject(TYPES.IPrincipioAtivoRepository) private principioAtivoRepository: IPrincipioAtivoRepository,
    private mapper: PrincipioAtivoMapper
  ) {}

  /**
   * Lista todas as princípios ativos com paginação
   */
  @RequirePermission('principioAtivo.read')
  @Cacheable('principioAtivo:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<PrincipioAtivoResponseDto>> {
    const result = await this.principioAtivoRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca um princípio ativo por ID
   */
  @RequirePermission('principioAtivo.read')
  @Cacheable('principioAtivo:getById', 3600)
  async getById(id: number | string): Promise<PrincipioAtivoResponseDto | null> {
    const principioAtivo = await this.principioAtivoRepository.findById(id);
    return principioAtivo ? this.mapper.toDto(principioAtivo) : null;
  }

  /**
   * Cria um novo princípio ativo
   */
  @RequirePermission('principioAtivo.create')
  @Auditable('PrincipioAtivo')
  @CacheEvict('principioAtivo:list:*', true)
  @Transactional()
  async create(dto: CreatePrincipioAtivoDto): Promise<PrincipioAtivoResponseDto> {
      // Obter userId do contexto
      const context = getRequestContext();
      if (!context || !context.getUserId()) {
        throw new ForbiddenException(
          'Usuário não autenticado. Não é possível criar pessoa sem userId.',
          'USER_NOT_AUTHENTICATED'
        );
      }
      const userId = context.getUserId()!;
  
      // Obter tenantId do contexto
      const tenantId = context.getTenantId();
      if (!tenantId) {
        throw new ForbiddenException(
          'Tenant não identificado. Não é possível criar pessoa sem tenantId.',
          'TENANT_NOT_IDENTIFIED'
        );
      }

    const entityData = await this.mapper.toEntity(dto);
    
    // Adicionar campos de auditoria
    const entityWithAudit = {
      ...entityData,
      usercreation: userId,
      datecreation: new Date(),
    };

    const principioAtivo = await this.principioAtivoRepository.create(entityWithAudit);
    return this.mapper.toDto(principioAtivo);
  }

  /**
   * Atualiza um princípio ativo existente
   */
  @RequirePermission('principioAtivo.update')
  @Auditable('PrincipioAtivo')
  @CacheEvict('principioAtivo:list:*', true)
  @CacheEvict('principioAtivo:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdatePrincipioAtivoDto): Promise<PrincipioAtivoResponseDto> {
    const principioAtivo = await this.principioAtivoRepository.findById(id);
    if (!principioAtivo) {
      throw new NotFoundException('Princípio ativo não encontrado');
    }
    
    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.principioAtivoRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um princípio ativo
   */
  @RequirePermission('principioAtivo.delete')
  @Auditable('PrincipioAtivo')
  @CacheEvict('principioAtivo:list:*', true)
  @CacheEvict('principioAtivo:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const principioAtivo = await this.principioAtivoRepository.findById(id);
    if (!principioAtivo) {
      return false;
    }
    
    await this.principioAtivoRepository.delete(id);
    return true;
  }
}
