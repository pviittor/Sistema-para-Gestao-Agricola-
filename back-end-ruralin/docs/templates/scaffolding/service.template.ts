/**
 * TEMPLATE: Application Service Implementation
 * 
 * Variáveis de substituição:
 * - {{EntityName}}: Nome da entidade em PascalCase
 * - {{entityName}}: Nome da entidade em camelCase
 * - {{permissions}}: Permissões (geradas a partir da especificação)
 */

import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { I{{EntityName}}ApplicationService } from './I{{EntityName}}ApplicationService';
import { I{{EntityName}}Repository } from '../../infrastructure/repository/I{{EntityName}}Repository';
import { Create{{EntityName}}Dto } from '../dto/{{entityName}}/Create{{EntityName}}Dto';
import { Update{{EntityName}}Dto } from '../dto/{{entityName}}/Update{{EntityName}}Dto';
import { {{EntityName}}ResponseDto } from '../dto/{{entityName}}/{{EntityName}}ResponseDto';
import { {{EntityName}}Mapper } from '../../mappers/{{EntityName}}Mapper';
{{#if auditable}}
import { Auditable } from '../../core/audit/Auditable';
{{/if}}
{{#if cacheable}}
import { Cacheable, CacheEvict } from '../../core/cache/decorators';
{{/if}}
import { RequirePermission } from '../../core/authorization/RequirePermission';
import { Transactional } from '../../core/database/Transactional';
import { NotFoundException } from '../../core/exceptions/NotFoundException';
import { ValidationException } from '../../core/exceptions/ValidationException';

/**
 * Application Service para {{EntityName}}
 * 
 * Implementa a lógica de negócio para operações com {{entityName}}.
 */
@Injectable()
export class {{EntityName}}ApplicationService implements I{{EntityName}}ApplicationService {
  constructor(
    @Inject(TYPES.I{{EntityName}}Repository) private {{entityName}}Repository: I{{EntityName}}Repository,
    private mapper: {{EntityName}}Mapper
  ) {}

  /**
   * Lista todas as {{entityName}}s com paginação
   */
  @RequirePermission('{{permissions.read}}')
  {{#if cacheable}}
  @Cacheable('{{entityNameLower}}:list', 3600)
  {{/if}}
  async list(page: number = 1, limit: number = 10): Promise<{ data: {{EntityName}}ResponseDto[]; total: number; page: number; limit: number }> {
    // TODO: Implementar lógica de listagem com paginação
    const result = await this.{{entityName}}Repository.findAllPaginated({ page, limit });
    return {
      data: result.data.map(item => this.mapper.toResponseDto(item)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /**
   * Busca uma {{entityName}} por ID
   */
  @RequirePermission('{{permissions.read}}')
  {{#if cacheable}}
  @Cacheable('{{entityNameLower}}:findById', 3600)
  {{/if}}
  async findById(id: number): Promise<{{EntityName}}ResponseDto> {
    // TODO: Implementar lógica de busca por ID
    const {{entityName}} = await this.{{entityName}}Repository.findById(id);
    if (!{{entityName}}) {
      throw new NotFoundException('{{EntityName}} não encontrada');
    }
    return this.mapper.toResponseDto({{entityName}});
  }

  /**
   * Cria uma nova {{entityName}}
   */
  @RequirePermission('{{permissions.create}}')
  {{#if auditable}}
  @Auditable('{{EntityName}}')
  {{/if}}
  {{#if cacheable}}
  @CacheEvict('{{entityNameLower}}:list')
  {{/if}}
  @Transactional()
  async create(dto: Create{{EntityName}}Dto): Promise<{{EntityName}}ResponseDto> {
    // TODO: Implementar validações de negócio
    {{#if hasBusinessRules}}
    // TODO: Aplicar regras de negócio baseadas na especificação
    {{/if}}
    {{#if hasCrossTenantRules}}
    // TODO: Validar relacionamentos cross-tenant
    {{/if}}
    
    const {{entityName}} = await this.{{entityName}}Repository.create(this.mapper.toEntity(dto));
    return this.mapper.toResponseDto({{entityName}});
  }

  /**
   * Atualiza uma {{entityName}} existente
   */
  @RequirePermission('{{permissions.update}}')
  {{#if auditable}}
  @Auditable('{{EntityName}}')
  {{/if}}
  {{#if cacheable}}
  @CacheEvict(['{{entityNameLower}}:list', '{{entityNameLower}}:findById'])
  {{/if}}
  @Transactional()
  async update(id: number, dto: Update{{EntityName}}Dto): Promise<{{EntityName}}ResponseDto> {
    // TODO: Implementar validações de negócio
    const {{entityName}} = await this.{{entityName}}Repository.findById(id);
    if (!{{entityName}}) {
      throw new NotFoundException('{{EntityName}} não encontrada');
    }
    
    {{#if hasBusinessRules}}
    // TODO: Aplicar regras de negócio baseadas na especificação
    {{/if}}
    {{#if hasCrossTenantRules}}
    // TODO: Validar relacionamentos cross-tenant
    {{/if}}
    
    const updated = await this.{{entityName}}Repository.update(id, this.mapper.toEntity(dto));
    return this.mapper.toResponseDto(updated);
  }

  /**
   * Remove uma {{entityName}}
   */
  @RequirePermission('{{permissions.delete}}')
  {{#if auditable}}
  @Auditable('{{EntityName}}')
  {{/if}}
  {{#if cacheable}}
  @CacheEvict(['{{entityNameLower}}:list', '{{entityNameLower}}:findById'])
  {{/if}}
  @Transactional()
  async delete(id: number): Promise<void> {
    // TODO: Implementar validações de negócio
    const {{entityName}} = await this.{{entityName}}Repository.findById(id);
    if (!{{entityName}}) {
      throw new NotFoundException('{{EntityName}} não encontrada');
    }
    
    // TODO: Validar se pode deletar (ex: verificar dependências)
    
    await this.{{entityName}}Repository.delete(id);
  }

  // TODO: Implementar métodos customizados baseados na especificação
  // Exemplo:
  // @RequirePermission('{{permissions.read}}')
  // async findByCampo(campo: string): Promise<{{EntityName}}ResponseDto[]> {
  //   const {{entityName}}s = await this.{{entityName}}Repository.findByCampo(campo);
  //   return {{entityName}}s.map(item => this.mapper.toResponseDto(item));
  // }
}
