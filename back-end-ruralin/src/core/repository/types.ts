/**
 * Tipos auxiliares para repositórios
 * 
 * Este arquivo define tipos comuns usados por todos os repositórios do sistema.
 */

/**
 * Opções de busca para queries em repositórios
 * 
 * @example
 * ```typescript
 * const options: FindOptions = {
 *   where: { status: 'ACTIVE' },
 *   include: [{ model: Role }],
 *   order: [['createdAt', 'DESC']],
 *   attributes: ['id', 'nome', 'email']
 * };
 * ```
 */
export interface FindOptions {
  /**
   * Condições WHERE para filtrar resultados
   * 
   * @example
   * ```typescript
   * where: { status: 'ACTIVE', tipo: 'ROOT' }
   * ```
   */
  where?: Record<string, any>;

  /**
   * Relacionamentos (associações) a incluir na query
   * 
   * @example
   * ```typescript
   * include: [
   *   { model: Role, as: 'roles' },
   *   { model: Local, as: 'locais' }
   * ]
   * ```
   */
  include?: any[];

  /**
   * Ordenação dos resultados
   * 
   * @example
   * ```typescript
   * order: [['createdAt', 'DESC'], ['nome', 'ASC']]
   * ```
   */
  order?: [string, 'ASC' | 'DESC'][];

  /**
   * Atributos específicos a retornar (projeção)
   * 
   * @example
   * ```typescript
   * attributes: ['id', 'nome', 'email']
   * ```
   */
  attributes?: string[];

  /**
   * Limite de resultados (opcional, usado internamente)
   */
  limit?: number;

  /**
   * Offset para paginação (opcional, usado internamente)
   */
  offset?: number;
}

/**
 * Resultado paginado de uma query
 * 
 * @template T - Tipo da entidade retornada
 * 
 * @example
 * ```typescript
 * const result: PaginatedResult<Usuario> = {
 *   data: [usuario1, usuario2, ...],
 *   total: 100,
 *   page: 1,
 *   limit: 10,
 *   totalPages: 10
 * };
 * ```
 */
export interface PaginatedResult<T> {
  /**
   * Array de entidades retornadas
   */
  data: T[];

  /**
   * Total de registros encontrados (sem paginação)
   */
  total: number;

  /**
   * Página atual (1-indexed)
   */
  page: number;

  /**
   * Limite de registros por página
   */
  limit: number;

  /**
   * Total de páginas disponíveis
   */
  totalPages: number;
}
