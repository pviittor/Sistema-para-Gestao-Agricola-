/**
 * BaseApplicationService - Classe base abstrata para Application Services
 * 
 * Esta classe fornece implementação base opcional para Application Services,
 * reduzindo código duplicado e garantindo consistência.
 * 
 * Application Services específicos podem estender esta classe e sobrescrever
 * métodos conforme necessário, ou implementar a interface diretamente.
 * 
 * @template TEntity - Tipo da entidade do domínio (Model do Sequelize)
 * @template TDto - Tipo do DTO de resposta
 * @template TCreateDto - Tipo do DTO de criação
 * @template TUpdateDto - Tipo do DTO de atualização
 * 
 * @example
 * ```typescript
 * export class UsuarioApplicationService
 *   extends BaseApplicationService<Usuario, UsuarioResponseDto, CreateUsuarioDto, UpdateUsuarioDto>
 *   implements IUsuarioApplicationService {
 *   
 *   constructor(
 *     @Inject(TYPES.IUsuarioRepository)
 *     repository: IUsuarioRepository
 *   ) {
 *     super(repository);
 *   }
 * 
 *   // Métodos customizados
 *   async findByEmail(email: string): Promise<UsuarioResponseDto | null> {
 *     const usuario = await this.repository.findByEmail(email);
 *     return usuario ? this.toDto(usuario) : null;
 *   }
 * }
 * ```
 */

import { Model } from 'sequelize';
import { Injectable } from '../../core/di';
import { IRepository } from '../../core/repository/IRepository';
import { IApplicationService } from './IApplicationService';
import { PaginatedResult } from '../../core/repository/types';
import { NotFoundException } from '../../core/exceptions';

/**
 * Classe base abstrata para Application Services
 * 
 * Fornece implementação padrão dos métodos CRUD, delegando para o repositório
 * e convertendo entidades para DTOs. Services específicos devem implementar
 * os métodos `toDto` e `toEntity` para mapeamento.
 * 
 * @template TEntity - Tipo da entidade do domínio
 * @template TDto - Tipo do DTO de resposta
 * @template TCreateDto - Tipo do DTO de criação
 * @template TUpdateDto - Tipo do DTO de atualização
 */
@Injectable()
export abstract class BaseApplicationService<
  TEntity extends Model,
  TDto,
  TCreateDto,
  TUpdateDto
> implements IApplicationService<TDto, TCreateDto, TUpdateDto> {
  /**
   * Repositório injetado para acesso a dados
   */
  protected repository: IRepository<TEntity>;

  /**
   * Construtor da classe base
   * 
   * @param repository - Repositório a ser usado para acesso a dados
   */
  constructor(repository: IRepository<TEntity>) {
    this.repository = repository;
  }

  /**
   * Cria uma nova entidade
   * 
   * @param dto - DTO com dados para criação
   * @returns Promise que resolve com o DTO da entidade criada
   */
  async create(dto: TCreateDto): Promise<TDto> {
    const entity = this.toEntity(dto);
    const created = await this.repository.create(entity as any);
    return this.toDto(created);
  }

  /**
   * Atualiza uma entidade existente
   * 
   * @param id - ID da entidade a ser atualizada
   * @param dto - DTO com dados para atualização
   * @returns Promise que resolve com o DTO da entidade atualizada
   * @throws NotFoundException se a entidade não for encontrada
   */
  async update(id: number | string, dto: TUpdateDto): Promise<TDto> {
    const entity = this.toEntity(dto);
    const updated = await this.repository.update(id, entity as any);
    return this.toDto(updated);
  }

  /**
   * Remove uma entidade
   * 
   * @param id - ID da entidade a ser removida
   * @returns Promise que resolve com true se removido com sucesso, false caso contrário
   */
  async delete(id: number | string): Promise<boolean> {
    return await this.repository.delete(id);
  }

  /**
   * Busca uma entidade por ID
   * 
   * @param id - ID da entidade
   * @returns Promise que resolve com o DTO da entidade encontrada ou null se não existir
   */
  async getById(id: number | string): Promise<TDto | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.toDto(entity) : null;
  }

  /**
   * Lista entidades com paginação
   * 
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   */
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<TDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(entity => this.toDto(entity)),
    };
  }

  /**
   * Converte entidade do domínio para DTO
   * 
   * Deve ser implementado por classes filhas para definir o mapeamento específico.
   * 
   * @param entity - Entidade do domínio
   * @returns DTO correspondente
   */
  protected abstract toDto(entity: TEntity): TDto;

  /**
   * Converte DTO para entidade do domínio
   * 
   * Deve ser implementado por classes filhas para definir o mapeamento específico.
   * 
   * @param dto - DTO de entrada
   * @returns Dados da entidade (parcial, para criação/atualização)
   */
  protected abstract toEntity(dto: TCreateDto | TUpdateDto): Partial<TEntity>;
}
