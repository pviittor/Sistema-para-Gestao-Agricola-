/**
 * LocalApplicationService - Application Service para entidade Local
 * 
 * Contém a lógica de negócio para operações com locais, separando
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
 * const service = container.resolve<ILocalApplicationService>(TYPES.ILocalApplicationService);
 * 
 * const local = await service.create({
 *   desc_simples: 'Sala de Reuniões',
 *   desc_completa: 'Sala de reuniões principal',
 *   // ...
 * });
 * ```
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { ILocalApplicationService } from './ILocalApplicationService';
import { ILocalRepository } from '../../../infrastructure/repository/ILocalRepository';
import { LocalMapper } from '../../mappers/LocalMapper';
import { CreateLocalDto } from '../../dto/local/CreateLocalDto';
import { UpdateLocalDto } from '../../dto/local/UpdateLocalDto';
import { LocalResponseDto } from '../../dto/local/LocalResponseDto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';

/**
 * Application Service para entidade Local
 * 
 * Implementa lógica de negócio para operações com locais, usando
 * repositório para acesso a dados e mapper para conversão DTO-Entidade.
 */
@Injectable()
export class LocalApplicationService implements ILocalApplicationService {
  private mapper: LocalMapper;

  constructor(
    @Inject(TYPES.ILocalRepository)
    private repository: ILocalRepository
  ) {
    // Criar instância do mapper (pode ser injetado no futuro se necessário)
    this.mapper = new LocalMapper();
  }

  /**
   * Cria um novo local
   * 
   * @param dto - DTO com dados para criação
   * @returns Promise que resolve com o DTO do local criado
   * @throws ForbiddenException se usuário não tiver permissão 'local.create'
   */
  @RequirePermission('local.create')
  @Transactional()
  @Auditable('Local')
  @CacheEvict('local:list:*', true)
  @CacheEvict('local:findByUsuario:*', true)
  async create(dto: CreateLocalDto): Promise<LocalResponseDto> {
    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);

    // Criar via repositório
    const created = await this.repository.create(entity as any);

    // Retornar como DTO
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza um local existente
   * 
   * @param id - ID do local
   * @param dto - DTO com dados para atualização
   * @returns Promise que resolve com o DTO do local atualizado
   * @throws NotFoundException se local não for encontrado
   * @throws ForbiddenException se usuário não tiver permissão 'local.update'
   */
  @RequirePermission('local.update')
  @Transactional()
  @Auditable('Local')
  @CacheEvict('local:getById:{0}')
  @CacheEvict('local:list:*', true)
  @CacheEvict('local:findByUsuario:*', true)
  async update(id: number | string, dto: UpdateLocalDto): Promise<LocalResponseDto> {
    // Verificar se local existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Local', id);
    }

    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);

    // Atualizar via repositório
    const updated = await this.repository.update(id, entity as any);

    // Retornar como DTO
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um local
   * 
   * @param id - ID do local
   * @returns Promise que resolve com true se removido, false caso contrário
   * @throws ForbiddenException se usuário não tiver permissão 'local.delete'
   */
  @RequirePermission('local.delete')
  @Transactional()
  @Auditable('Local')
  @CacheEvict('local:getById:{0}')
  @CacheEvict('local:list:*', true)
  @CacheEvict('local:findByUsuario:*', true)
  async delete(id: number | string): Promise<boolean> {
    // Verificar se local existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      return false;
    }

    // Remover via repositório
    return await this.repository.delete(id);
  }

  /**
   * Busca um local por ID
   * 
   * @param id - ID do local
   * @returns Promise que resolve com o DTO do local encontrado ou null
   * @throws ForbiddenException se usuário não tiver permissão 'local.read'
   */
  //@RequirePermission('local.read')
  @Cacheable('local:getById:{0}', 3600)
  async getById(id: number | string): Promise<LocalResponseDto | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Lista locais com paginação
   * 
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   * @throws ForbiddenException se usuário não tiver permissão 'local.read'
   */
  //@RequirePermission('local.read')
  @Cacheable('local:list:{0}:{1}', 300)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<LocalResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(entity => this.mapper.toDto(entity)),
    };
  }

  /**
   * Busca locais por usuário
   * 
   * @param usuarioId - ID do usuário
   * @returns Promise que resolve com array de DTOs de locais do usuário
   * @throws ForbiddenException se usuário não tiver permissão 'local.read'
   */
  //@RequirePermission('local.read')
  @Cacheable('local:findByUsuario:{0}', 600)
  async findByUsuario(usuarioId: number): Promise<LocalResponseDto[]> {
    const entities = await this.repository.findByUsuario(usuarioId);
    return entities.map(entity => this.mapper.toDto(entity));
  }
}
