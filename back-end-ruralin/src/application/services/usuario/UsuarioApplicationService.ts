/**
 * UsuarioApplicationService - Application Service para entidade Usuario
 * 
 * Contém a lógica de negócio para operações com usuários, separando
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
 * const service = container.resolve<IUsuarioApplicationService>(TYPES.IUsuarioApplicationService);
 * 
 * const usuario = await service.create({
 *   nome: 'João Silva',
 *   email: 'joao@example.com',
 *   // ...
 * });
 * ```
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IUsuarioApplicationService } from './IUsuarioApplicationService';
import { IUsuarioRepository } from '../../../infrastructure/repository/IUsuarioRepository';
import { UsuarioMapper } from '../../mappers/UsuarioMapper';
import { CreateUsuarioDto } from '../../dto/usuario/CreateUsuarioDto';
import { UpdateUsuarioDto } from '../../dto/usuario/UpdateUsuarioDto';
import { UsuarioResponseDto } from '../../dto/usuario/UsuarioResponseDto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, BusinessException, ForbiddenException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para entidade Usuario
 * 
 * Implementa lógica de negócio para operações com usuários, usando
 * repositório para acesso a dados e mapper para conversão DTO-Entidade.
 */
@Injectable()
export class UsuarioApplicationService implements IUsuarioApplicationService {
  private mapper: UsuarioMapper;

  constructor(
    @Inject(TYPES.IUsuarioRepository)
    private repository: IUsuarioRepository
  ) {
    // Criar instância do mapper (pode ser injetado no futuro se necessário)
    this.mapper = new UsuarioMapper();
  }

  /**
   * Cria um novo usuário
   * 
   * @param dto - DTO com dados para criação
   * @returns Promise que resolve com o DTO do usuário criado
   * @throws BusinessException se email ou username já estiverem em uso
   * @throws ForbiddenException se usuário não tiver permissão 'usuario.create'
   */
  @RequirePermission('usuario.create')
  @Auditable('Usuario')
  @CacheEvict('usuario:list:*', true)
  async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    // Obter tenantId do contexto
    const context = getRequestContext();
    if (!context || !context.getTenantId()) {
      throw new ForbiddenException(
        'Tenant não identificado. Não é possível criar usuário sem tenantId.',
        'TENANT_NOT_IDENTIFIED'
      );
    }
    const tenantId = context.getTenantId()!;

    // Validação de negócio: verificar se email já existe
    const existingByEmail = await this.repository.findByEmail(dto.email);
    if (existingByEmail) {
      throw new BusinessException('Email já está em uso');
    }

    // Validação de negócio: verificar se username já existe
    const existingByUsername = await this.repository.findByUsername(dto.username);
    if (existingByUsername) {
      throw new BusinessException('Username já está em uso');
    }

    // Converter DTO para entidade (mapper aplica hash de senha)
    const entity = await this.mapper.toEntity(dto);

    // Adicionar tenantId à entidade
    const entityWithTenant = {
      ...entity,
      tenantId,
    } as any;

    // Criar via repositório
    const created = await this.repository.create(entityWithTenant);

    // Retornar como DTO
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza um usuário existente
   * 
   * @param id - ID do usuário
   * @param dto - DTO com dados para atualização
   * @returns Promise que resolve com o DTO do usuário atualizado
   * @throws NotFoundException se usuário não for encontrado
   * @throws BusinessException se email ou username já estiverem em uso
   * @throws ForbiddenException se usuário não tiver permissão 'usuario.update'
   */
  @RequirePermission('usuario.update')
  @Auditable('Usuario')
  @CacheEvict('usuario:getById:{0}')
  @CacheEvict('usuario:list:*', true)
  @CacheEvict('usuario:findByEmail:*', true)
  @CacheEvict('usuario:findByUsername:*', true)
  async update(id: number | string, dto: UpdateUsuarioDto): Promise<UsuarioResponseDto> {
    // Verificar se usuário existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Usuário', id);
    }

    // Validação de negócio: verificar se novo email já existe (se fornecido)
    if (dto.email && dto.email !== existing.email) {
      const emailExists = await this.repository.findByEmail(dto.email);
      if (emailExists) {
        throw new BusinessException('Email já está em uso');
      }
    }

    // Validação de negócio: verificar se novo username já existe (se fornecido)
    if (dto.username && dto.username !== existing.username) {
      const usernameExists = await this.repository.findByUsername(dto.username);
      if (usernameExists) {
        throw new BusinessException('Username já está em uso');
      }
    }

    // Converter DTO para entidade (mapper aplica hash de senha se fornecida)
    const entity = await this.mapper.toEntity(dto);
    
    // Garantir que tenantId não seja alterado (remover se estiver no DTO)
    if ('tenantId' in entity) {
      delete (entity as any).tenantId;
    }

    // Atualizar via repositório
    const updated = await this.repository.update(id, entity as any);

    // Retornar como DTO
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um usuário
   * 
   * @param id - ID do usuário
   * @returns Promise que resolve com true se removido, false caso contrário
   * @throws ForbiddenException se usuário não tiver permissão 'usuario.delete'
   */
  @RequirePermission('usuario.delete')
  @Auditable('Usuario')
  @CacheEvict('usuario:getById:{0}')
  @CacheEvict('usuario:list:*', true)
  @CacheEvict('usuario:findByEmail:*', true)
  @CacheEvict('usuario:findByUsername:*', true)
  async delete(id: number | string): Promise<boolean> {
    // Verificar se usuário existe
    // Usar findByIdWithoutTenant para permitir deletar mesmo sem tenant definido
    // (método opcional na interface, mas sempre disponível no BaseRepository)
    if (this.repository.findByIdWithoutTenant) {
      const existing = await this.repository.findByIdWithoutTenant(id);
      if (!existing) {
        return false;
      }
    } else {
      // Fallback para findById se método não estiver disponível
      const existing = await this.repository.findById(id);
      if (!existing) {
        return false;
      }
    }

    // TODO: Adicionar validações de dependências (ex: verificar se tem eventos, etc.)
    // if (await this.hasRelatedData(existing)) {
    //   throw new BusinessException('Não é possível remover usuário com dados relacionados');
    // }

    // Remover via repositório
    return await this.repository.delete(id);
  }

  /**
   * Busca um usuário por ID
   * 
   * @param id - ID do usuário
   * @returns Promise que resolve com o DTO do usuário encontrado ou null
   * @throws ForbiddenException se usuário não tiver permissão 'usuario.read'
   */
  @RequirePermission('usuario.read')
  @Cacheable('usuario:getById:{0}', 3600)
  async getById(id: number | string): Promise<UsuarioResponseDto | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Lista usuários com paginação
   * 
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   * @throws ForbiddenException se usuário não tiver permissão 'usuario.read'
   */
  @RequirePermission('usuario.read')
  @Cacheable('usuario:list:{0}:{1}', 300)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<UsuarioResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(entity => this.mapper.toDto(entity)),
    };
  }

  /**
   * Busca um usuário por email
   * 
   * @param email - Email do usuário
   * @returns Promise que resolve com o DTO do usuário encontrado ou null
   * @throws ForbiddenException se usuário não tiver permissão 'usuario.read'
   */
  @RequirePermission('usuario.read')
  @Cacheable('usuario:findByEmail:{0}', 1800)
  async findByEmail(email: string): Promise<UsuarioResponseDto | null> {
    const entity = await this.repository.findByEmail(email);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Busca um usuário por username
   * 
   * @param username - Username do usuário
   * @returns Promise que resolve com o DTO do usuário encontrado ou null
   * @throws ForbiddenException se usuário não tiver permissão 'usuario.read'
   */
  @RequirePermission('usuario.read')
  @Cacheable('usuario:findByUsername:{0}', 1800)
  async findByUsername(username: string): Promise<UsuarioResponseDto | null> {
    const entity = await this.repository.findByUsername(username);
    return entity ? this.mapper.toDto(entity) : null;
  }
}
