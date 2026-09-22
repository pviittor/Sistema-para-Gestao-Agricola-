/**
 * IRepository - Interface genérica para repositórios
 * 
 * Esta interface define o contrato que todos os repositórios do sistema devem seguir,
 * abstraindo o acesso a dados e facilitando testes e manutenção.
 * 
 * @template T - Tipo da entidade gerenciada pelo repositório
 * 
 * @example
 * ```typescript
 * interface IUsuarioRepository extends IRepository<Usuario> {
 *   findByEmail(email: string): Promise<Usuario | null>;
 *   findByUsername(username: string): Promise<Usuario | null>;
 * }
 * ```
 */

import { FindOptions, PaginatedResult } from './types';

/**
 * Interface genérica para repositórios
 * 
 * Define métodos padrão CRUD e de consulta que todos os repositórios devem implementar.
 * Repositórios específicos podem estender esta interface para adicionar métodos customizados.
 * 
 * @template T - Tipo da entidade gerenciada pelo repositório
 */
export interface IRepository<T> {
  /**
   * Busca uma entidade por ID
   * 
   * @param id - ID da entidade (número ou string)
   * @returns Promise que resolve com a entidade encontrada ou null se não existir
   * 
   * @example
   * ```typescript
   * const usuario = await usuarioRepository.findById(1);
   * if (usuario) {
   *   console.log(usuario.nome);
   * }
   * ```
   */
  findById(id: number | string): Promise<T | null>;

  /**
   * Busca todas as entidades, opcionalmente com filtros
   * 
   * @param options - Opções de busca (filtros, ordenação, relacionamentos)
   * @returns Promise que resolve com array de entidades
   * 
   * @example
   * ```typescript
   * const usuarios = await usuarioRepository.findAll({
   *   where: { tipo: 'ROOT' },
   *   order: [['nome', 'ASC']]
   * });
   * ```
   */
  findAll(options?: FindOptions): Promise<T[]>;

  /**
   * Busca uma única entidade que atenda aos critérios
   * 
   * @param options - Opções de busca (filtros, relacionamentos)
   * @returns Promise que resolve com a entidade encontrada ou null
   * 
   * @example
   * ```typescript
   * const usuario = await usuarioRepository.findOne({
   *   where: { email: 'usuario@example.com' }
   * });
   * ```
   */
  findOne(options: FindOptions): Promise<T | null>;

  /**
   * Busca múltiplas entidades que atendam aos critérios
   * 
   * @param options - Opções de busca (filtros, ordenação, relacionamentos)
   * @returns Promise que resolve com array de entidades
   * 
   * @example
   * ```typescript
   * const eventos = await eventoRepository.findMany({
   *   where: { usuarioId: 1 },
   *   order: [['data', 'DESC']]
   * });
   * ```
   */
  findMany(options: FindOptions): Promise<T[]>;

  /**
   * Busca entidades com paginação
   * 
   * @param page - Número da página (1-indexed)
   * @param limit - Limite de registros por página
   * @param options - Opções de busca adicionais (filtros, ordenação, relacionamentos)
   * @returns Promise que resolve com resultado paginado
   * 
   * @example
   * ```typescript
   * const result = await usuarioRepository.findAllPaginated(1, 10, {
   *   where: { tipo: 'ROOT' },
   *   order: [['nome', 'ASC']]
   * });
   * 
   * console.log(`Total: ${result.total}, Página: ${result.page}/${result.totalPages}`);
   * ```
   */
  findAllPaginated(
    page: number,
    limit: number,
    options?: FindOptions
  ): Promise<PaginatedResult<T>>;

  /**
   * Cria uma nova entidade
   * 
   * @param entity - Dados parciais da entidade a ser criada
   * @returns Promise que resolve com a entidade criada
   * 
   * @example
   * ```typescript
   * const novoUsuario = await usuarioRepository.create({
   *   nome: 'João Silva',
   *   email: 'joao@example.com',
   *   username: 'joao.silva'
   * });
   * ```
   */
  create(entity: Partial<T>): Promise<T>;

  /**
   * Atualiza uma entidade existente
   * 
   * @param id - ID da entidade a ser atualizada
   * @param entity - Dados parciais a serem atualizados
   * @returns Promise que resolve com a entidade atualizada
   * @throws NotFoundException se a entidade não for encontrada
   * 
   * @example
   * ```typescript
   * const usuarioAtualizado = await usuarioRepository.update(1, {
   *   nome: 'João Silva Atualizado'
   * });
   * ```
   */
  update(id: number | string, entity: Partial<T>): Promise<T>;

  /**
   * Remove uma entidade
   * 
   * @param id - ID da entidade a ser removida
   * @returns Promise que resolve com true se a entidade foi removida, false se não existir
   * 
   * @example
   * ```typescript
   * const removido = await usuarioRepository.delete(1);
   * if (removido) {
   *   console.log('Usuário removido com sucesso');
   * }
   * ```
   */
  delete(id: number | string): Promise<boolean>;

  // ============================================================================
  // Métodos sem filtro de tenant (para uso interno/avançado)
  // ============================================================================
  // ATENÇÃO: Estes métodos não aplicam isolamento de tenant.
  // Use apenas quando absolutamente necessário (ex: login, operações administrativas).
  // ============================================================================

  /**
   * Busca uma entidade por ID sem aplicar filtro de tenant
   * 
   * Use este método apenas quando necessário acessar dados sem filtro de tenant
   * (ex: validações cross-tenant, operações administrativas).
   * 
   * ATENÇÃO: Este método não aplica isolamento de tenant. Use com cuidado.
   * 
   * @param id - ID da entidade (número ou string)
   * @returns Promise que resolve com a entidade encontrada ou null
   * 
   * @example
   * ```typescript
   * // Uso em operação administrativa
   * const usuario = await usuarioRepository.findByIdWithoutTenant(1);
   * ```
   */
  findByIdWithoutTenant?(id: number | string): Promise<T | null>;

  /**
   * Busca todas as entidades sem aplicar filtro de tenant
   * 
   * Use este método apenas quando necessário acessar dados sem filtro de tenant
   * (ex: operações administrativas, relatórios globais).
   * 
   * ATENÇÃO: Este método não aplica isolamento de tenant. Use com cuidado.
   * 
   * @param options - Opções de busca (filtros, ordenação, relacionamentos)
   * @returns Promise que resolve com array de entidades
   * 
   * @example
   * ```typescript
   * // Uso em relatório administrativo
   * const todosUsuarios = await usuarioRepository.findAllWithoutTenant();
   * ```
   */
  findAllWithoutTenant?(options?: FindOptions): Promise<T[]>;

  /**
   * Busca uma única entidade sem aplicar filtro de tenant
   * 
   * Use este método apenas quando necessário acessar dados sem filtro de tenant
   * (ex: login, busca de usuário por email antes de autenticação).
   * 
   * ATENÇÃO: Este método não aplica isolamento de tenant. Use com cuidado.
   * 
   * @param options - Opções de busca (filtros, relacionamentos)
   * @returns Promise que resolve com a entidade encontrada ou null
   * 
   * @example
   * ```typescript
   * // Uso durante login
   * const usuario = await usuarioRepository.findOneWithoutTenant({
   *   where: { email: 'usuario@example.com' }
   * });
   * ```
   */
  findOneWithoutTenant?(options: FindOptions): Promise<T | null>;

  /**
   * Busca múltiplas entidades sem aplicar filtro de tenant
   * 
   * Use este método apenas quando necessário acessar dados sem filtro de tenant
   * (ex: operações administrativas, relatórios globais).
   * 
   * ATENÇÃO: Este método não aplica isolamento de tenant. Use com cuidado.
   * 
   * @param options - Opções de busca (filtros, ordenação, relacionamentos)
   * @returns Promise que resolve com array de entidades
   * 
   * @example
   * ```typescript
   * // Uso em operação administrativa
   * const eventos = await eventoRepository.findManyWithoutTenant({
   *   where: { status: 'ATIVO' }
   * });
   * ```
   */
  findManyWithoutTenant?(options: FindOptions): Promise<T[]>;

  /**
   * Busca entidades com paginação sem aplicar filtro de tenant
   * 
   * Use este método apenas quando necessário acessar dados sem filtro de tenant
   * (ex: operações administrativas, relatórios globais).
   * 
   * ATENÇÃO: Este método não aplica isolamento de tenant. Use com cuidado.
   * 
   * @param page - Número da página (1-indexed)
   * @param limit - Limite de registros por página
   * @param options - Opções de busca adicionais (filtros, ordenação, relacionamentos)
   * @returns Promise que resolve com resultado paginado
   * 
   * @example
   * ```typescript
   * // Uso em relatório administrativo paginado
   * const result = await usuarioRepository.findAllPaginatedWithoutTenant(1, 10);
   * ```
   */
  findAllPaginatedWithoutTenant?(
    page: number,
    limit: number,
    options?: FindOptions
  ): Promise<PaginatedResult<T>>;
}
