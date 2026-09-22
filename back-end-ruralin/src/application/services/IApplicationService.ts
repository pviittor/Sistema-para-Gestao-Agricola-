/**
 * IApplicationService - Interface genérica para Application Services
 * 
 * Esta interface define o contrato padrão para Application Services,
 * garantindo consistência e facilitando testes e manutenção.
 * 
 * Application Services contêm a lógica de negócio da aplicação,
 * separando controllers (HTTP) da lógica de aplicação.
 * 
 * @template TDto - Tipo do DTO de resposta
 * @template TCreateDto - Tipo do DTO de criação
 * @template TUpdateDto - Tipo do DTO de atualização
 * 
 * @example
 * ```typescript
 * interface IUsuarioApplicationService extends IApplicationService<
 *   UsuarioResponseDto,
 *   CreateUsuarioDto,
 *   UpdateUsuarioDto
 * > {
 *   // Métodos customizados específicos do usuário
 *   findByEmail(email: string): Promise<UsuarioResponseDto | null>;
 * }
 * ```
 */

import { PaginatedResult } from '../../core/repository/types';

/**
 * Interface genérica para Application Services
 * 
 * Define métodos padrão CRUD que todos os Application Services devem implementar.
 * Services específicos podem estender esta interface e adicionar métodos customizados.
 * 
 * @template TDto - Tipo do DTO de resposta
 * @template TCreateDto - Tipo do DTO de criação
 * @template TUpdateDto - Tipo do DTO de atualização
 */
export interface IApplicationService<TDto, TCreateDto, TUpdateDto> {
  /**
   * Cria uma nova entidade
   * 
   * @param dto - DTO com dados para criação
   * @returns Promise que resolve com o DTO da entidade criada
   * 
   * @example
   * ```typescript
   * const usuario = await usuarioService.create({
   *   nome: 'João Silva',
   *   email: 'joao@example.com',
   *   // ...
   * });
   * ```
   */
  create(dto: TCreateDto): Promise<TDto>;

  /**
   * Atualiza uma entidade existente
   * 
   * @param id - ID da entidade a ser atualizada
   * @param dto - DTO com dados para atualização
   * @returns Promise que resolve com o DTO da entidade atualizada
   * 
   * @example
   * ```typescript
   * const usuario = await usuarioService.update(1, {
   *   nome: 'João Silva Atualizado',
   * });
   * ```
   */
  update(id: number | string, dto: TUpdateDto): Promise<TDto>;

  /**
   * Remove uma entidade
   * 
   * @param id - ID da entidade a ser removida
   * @returns Promise que resolve com true se removido com sucesso, false caso contrário
   * 
   * @example
   * ```typescript
   * const deleted = await usuarioService.delete(1);
   * if (deleted) {
   *   console.log('Usuário removido com sucesso');
   * }
   * ```
   */
  delete(id: number | string): Promise<boolean>;

  /**
   * Busca uma entidade por ID
   * 
   * @param id - ID da entidade
   * @returns Promise que resolve com o DTO da entidade encontrada ou null se não existir
   * 
   * @example
   * ```typescript
   * const usuario = await usuarioService.getById(1);
   * if (usuario) {
   *   console.log(`Usuário encontrado: ${usuario.nome}`);
   * }
   * ```
   */
  getById(id: number | string): Promise<TDto | null>;

  /**
   * Lista entidades com paginação
   * 
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   * 
   * @example
   * ```typescript
   * const result = await usuarioService.list(1, 10);
   * console.log(`Total: ${result.total}, Página: ${result.page}`);
   * ```
   */
  list(page?: number, limit?: number): Promise<PaginatedResult<TDto>>;
}
