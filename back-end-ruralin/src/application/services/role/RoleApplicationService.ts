/**
 * RoleApplicationService - Application Service para entidade Role
 * 
 * Contém a lógica de negócio para operações com roles, separando
 * controllers (HTTP) da lógica de aplicação.
 * 
 * Responsabilidades:
 * - Validações de negócio
 * - Regras de negócio
 * - Orquestração de repositórios e mappers
 * - Transformações de dados
 * 
 * @example
 * ```typescript
 * const service = container.resolve<IRoleApplicationService>(TYPES.IRoleApplicationService);
 * 
 * const role = await service.create({
 *   nome: 'Administrador',
 * });
 * ```
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IRoleApplicationService } from './IRoleApplicationService';
import { IRoleRepository } from '../../../infrastructure/repository/IRoleRepository';
import { RoleMapper } from '../../mappers/RoleMapper';
import { CreateRoleDto } from '../../dto/role/CreateRoleDto';
import { UpdateRoleDto } from '../../dto/role/UpdateRoleDto';
import { RoleResponseDto } from '../../dto/role/RoleResponseDto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';

/**
 * Application Service para entidade Role
 * 
 * Implementa lógica de negócio para operações com roles, usando
 * repositório para acesso a dados e mapper para conversão DTO-Entidade.
 */
@Injectable()
export class RoleApplicationService implements IRoleApplicationService {
  private mapper: RoleMapper;

  constructor(
    @Inject(TYPES.IRoleRepository)
    private repository: IRoleRepository
  ) {
    // Criar instância do mapper (pode ser injetado no futuro se necessário)
    this.mapper = new RoleMapper();
  }

  /**
   * Cria uma nova role
   * 
   * @param dto - DTO com dados para criação
   * @returns Promise que resolve com o DTO da role criada
   * @throws ForbiddenException se usuário não tiver permissão 'role.create'
   */
  @RequirePermission('role.create')
  @Transactional()
  @Auditable('Role')
  @CacheEvict('role:list:*', true)
  @CacheEvict('role:findByNome:*', true)
  async create(dto: CreateRoleDto): Promise<RoleResponseDto> {
    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);

    // Criar via repositório
    const created = await this.repository.create(entity as any);

    // Retornar como DTO
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza uma role existente
   * 
   * @param id - ID da role
   * @param dto - DTO com dados para atualização
   * @returns Promise que resolve com o DTO da role atualizada
   * @throws NotFoundException se role não for encontrada
   * @throws ForbiddenException se usuário não tiver permissão 'role.update'
   */
  @RequirePermission('role.update')
  @Transactional()
  @Auditable('Role')
  @CacheEvict('role:getById:{0}')
  @CacheEvict('role:list:*', true)
  @CacheEvict('role:findByNome:*', true)
  async update(id: number | string, dto: UpdateRoleDto): Promise<RoleResponseDto> {
    // Verificar se role existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Role', id);
    }

    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);

    // Atualizar via repositório
    const updated = await this.repository.update(id, entity as any);

    // Retornar como DTO
    return this.mapper.toDto(updated);
  }

  /**
   * Remove uma role
   * 
   * @param id - ID da role
   * @returns Promise que resolve com true se removida, false caso contrário
   * @throws ForbiddenException se usuário não tiver permissão 'role.delete'
   */
  @RequirePermission('role.delete')
  @Transactional()
  @Auditable('Role')
  @CacheEvict('role:getById:{0}')
  @CacheEvict('role:list:*', true)
  @CacheEvict('role:findByNome:*', true)
  async delete(id: number | string): Promise<boolean> {
    // Verificar se role existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      return false;
    }

    // Remover via repositório
    return await this.repository.delete(id);
  }

  /**
   * Busca uma role por ID
   * 
   * @param id - ID da role
   * @returns Promise que resolve com o DTO da role encontrada ou null
   * @throws ForbiddenException se usuário não tiver permissão 'role.read'
   */
  @RequirePermission('role.read')
  @Cacheable('role:getById:{0}', 3600)
  async getById(id: number | string): Promise<RoleResponseDto | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Lista roles com paginação
   * 
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   * @throws ForbiddenException se usuário não tiver permissão 'role.read'
   */
  @RequirePermission('role.read')
  @Cacheable('role:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<RoleResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(entity => this.mapper.toDto(entity)),
    };
  }

  /**
   * Busca uma role por nome
   * 
   * @param nome - Nome da role
   * @returns Promise que resolve com o DTO da role encontrada ou null
   * @throws ForbiddenException se usuário não tiver permissão 'role.read'
   */
  @RequirePermission('role.read')
  @Cacheable('role:findByNome:{0}', 3600)
  async findByNome(nome: string): Promise<RoleResponseDto | null> {
    const entity = await this.repository.findByNome(nome);
    return entity ? this.mapper.toDto(entity) : null;
  }
}
