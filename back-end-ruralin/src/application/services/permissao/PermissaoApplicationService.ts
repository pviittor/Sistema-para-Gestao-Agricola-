/**
 * PermissaoApplicationService - Application Service para entidade Permissao
 * 
 * Contém a lógica de negócio para operações com permissões, separando
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
 * const service = container.resolve<IPermissaoApplicationService>(TYPES.IPermissaoApplicationService);
 * 
 * const permissao = await service.create({
 *   nome: 'usuarios.criar',
 * });
 * ```
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IPermissaoApplicationService } from './IPermissaoApplicationService';
import { IPermissaoRepository } from '../../../infrastructure/repository/IPermissaoRepository';
import { PermissaoMapper } from '../../mappers/PermissaoMapper';
import { CreatePermissaoDto } from '../../dto/permissao/CreatePermissaoDto';
import { UpdatePermissaoDto } from '../../dto/permissao/UpdatePermissaoDto';
import { PermissaoResponseDto } from '../../dto/permissao/PermissaoResponseDto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';

/**
 * Application Service para entidade Permissao
 * 
 * Implementa lógica de negócio para operações com permissões, usando
 * repositório para acesso a dados e mapper para conversão DTO-Entidade.
 */
@Injectable()
export class PermissaoApplicationService implements IPermissaoApplicationService {
  private mapper: PermissaoMapper;

  constructor(
    @Inject(TYPES.IPermissaoRepository)
    private repository: IPermissaoRepository
  ) {
    // Criar instância do mapper (pode ser injetado no futuro se necessário)
    this.mapper = new PermissaoMapper();
  }

  /**
   * Cria uma nova permissão
   * 
   * @param dto - DTO com dados para criação
   * @returns Promise que resolve com o DTO da permissão criada
   * @throws ForbiddenException se usuário não tiver permissão 'permissao.create'
   */
  @RequirePermission('permissao.create')
  @Transactional()
  @Auditable('Permissao')
  @CacheEvict('permissao:list:*', true)
  @CacheEvict('permissao:findByNome:*', true)
  async create(dto: CreatePermissaoDto): Promise<PermissaoResponseDto> {
    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);

    // Criar via repositório
    const created = await this.repository.create(entity as any);

    // Retornar como DTO
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza uma permissão existente
   * 
   * @param id - ID da permissão
   * @param dto - DTO com dados para atualização
   * @returns Promise que resolve com o DTO da permissão atualizada
   * @throws NotFoundException se permissão não for encontrada
   * @throws ForbiddenException se usuário não tiver permissão 'permissao.update'
   */
  @RequirePermission('permissao.update')
  @Transactional()
  @Auditable('Permissao')
  @CacheEvict('permissao:getById:{0}')
  @CacheEvict('permissao:list:*', true)
  @CacheEvict('permissao:findByNome:*', true)
  async update(id: number | string, dto: UpdatePermissaoDto): Promise<PermissaoResponseDto> {
    // Verificar se permissão existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Permissão', id);
    }

    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);

    // Atualizar via repositório
    const updated = await this.repository.update(id, entity as any);

    // Retornar como DTO
    return this.mapper.toDto(updated);
  }

  /**
   * Remove uma permissão
   * 
   * @param id - ID da permissão
   * @returns Promise que resolve com true se removida, false caso contrário
   * @throws ForbiddenException se usuário não tiver permissão 'permissao.delete'
   */
  @RequirePermission('permissao.delete')
  @Transactional()
  @Auditable('Permissao')
  @CacheEvict('permissao:getById:{0}')
  @CacheEvict('permissao:list:*', true)
  @CacheEvict('permissao:findByNome:*', true)
  async delete(id: number | string): Promise<boolean> {
    // Verificar se permissão existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      return false;
    }

    // Remover via repositório
    return await this.repository.delete(id);
  }

  /**
   * Busca uma permissão por ID
   * 
   * @param id - ID da permissão
   * @returns Promise que resolve com o DTO da permissão encontrada ou null
   * @throws ForbiddenException se usuário não tiver permissão 'permissao.read'
   */
  @RequirePermission('permissao.read')
  @Cacheable('permissao:getById:{0}', 3600)
  async getById(id: number | string): Promise<PermissaoResponseDto | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Lista permissões com paginação
   * 
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   * @throws ForbiddenException se usuário não tiver permissão 'permissao.read'
   */
  @RequirePermission('permissao.read')
  @Cacheable('permissao:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<PermissaoResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(entity => this.mapper.toDto(entity)),
    };
  }

  /**
   * Busca uma permissão por nome
   * 
   * @param nome - Nome da permissão
   * @returns Promise que resolve com o DTO da permissão encontrada ou null
   * @throws ForbiddenException se usuário não tiver permissão 'permissao.read'
   */
  @RequirePermission('permissao.read')
  @Cacheable('permissao:findByNome:{0}', 3600)
  async findByNome(nome: string): Promise<PermissaoResponseDto | null> {
    const entity = await this.repository.findByNome(nome);
    return entity ? this.mapper.toDto(entity) : null;
  }
}
