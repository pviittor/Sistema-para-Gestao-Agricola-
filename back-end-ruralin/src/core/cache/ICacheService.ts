/**
 * ICacheService - Interface para Serviço de Cache
 * 
 * Define o contrato para serviços de cache, permitindo diferentes implementações
 * (in-memory, Redis, etc.) sem acoplar o código à implementação específica.
 * 
 * Esta interface será implementada por:
 * - InMemoryCacheService (implementação simples para desenvolvimento)
 * - RedisCacheService (implementação com Redis para produção - T15.1)
 * 
 * @example
 * ```typescript
 * const cacheService = container.resolve<ICacheService>(TYPES.ICacheService);
 * 
 * // Armazenar valor
 * await cacheService.set('key', { data: 'value' }, 3600);
 * 
 * // Recuperar valor
 * const value = await cacheService.get<MyType>('key');
 * 
 * // Verificar existência
 * const exists = await cacheService.exists('key');
 * 
 * // Remover valor
 * await cacheService.delete('key');
 * ```
 */

/**
 * Interface para Serviço de Cache
 */
export interface ICacheService {
  /**
   * Recupera um valor do cache
   * 
   * @param key - Chave do cache
   * @returns Promise que resolve com o valor ou null se não existir
   * 
   * @example
   * ```typescript
   * const value = await cacheService.get<MyType>('user:1');
   * if (value) {
   *   // Usar valor do cache
   * }
   * ```
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Armazena um valor no cache
   * 
   * @param key - Chave do cache
   * @param value - Valor a ser armazenado
   * @param ttl - Time to live em segundos (opcional)
   * @returns Promise que resolve quando valor for armazenado
   * 
   * @example
   * ```typescript
   * await cacheService.set('user:1', userData, 3600); // Cache por 1 hora
   * ```
   */
  set(key: string, value: any, ttl?: number): Promise<void>;

  /**
   * Remove um valor do cache
   * 
   * @param key - Chave do cache
   * @returns Promise que resolve quando valor for removido
   * 
   * @example
   * ```typescript
   * await cacheService.delete('user:1');
   * ```
   */
  delete(key: string): Promise<void>;

  /**
   * Remove todas as entradas do cache
   * 
   * @returns Promise que resolve quando cache for limpo
   * 
   * @example
   * ```typescript
   * await cacheService.clear();
   * ```
   */
  clear(): Promise<void>;

  /**
   * Verifica se uma chave existe no cache
   * 
   * @param key - Chave do cache
   * @returns Promise que resolve com true se chave existe, false caso contrário
   * 
   * @example
   * ```typescript
   * const exists = await cacheService.exists('user:1');
   * ```
   */
  exists(key: string): Promise<boolean>;

  /**
   * Remove múltiplas chaves do cache baseado em padrão
   * 
   * @param pattern - Padrão para buscar chaves (ex: 'user:*')
   * @returns Promise que resolve com número de chaves removidas
   * 
   * @example
   * ```typescript
   * await cacheService.deleteByPattern('user:*'); // Remove todas as chaves que começam com 'user:'
   * ```
   */
  deleteByPattern(pattern: string): Promise<number>;

  /**
   * Armazena um valor no cache com tags
   * 
   * @param key - Chave do cache
   * @param value - Valor a ser armazenado
   * @param ttl - Time to live em segundos (opcional)
   * @param tags - Array de tags para agrupar entradas relacionadas
   * @returns Promise que resolve quando valor for armazenado
   * 
   * @example
   * ```typescript
   * await cacheService.setWithTags('usuario:1', userData, 3600, ['usuario', 'usuario:1']);
   * ```
   */
  setWithTags(key: string, value: any, ttl?: number, tags?: string[]): Promise<void>;

  /**
   * Invalida todas as entradas do cache que possuem uma tag específica
   * 
   * @param tag - Tag a ser invalidada
   * @returns Promise que resolve com número de chaves removidas
   * 
   * @example
   * ```typescript
   * await cacheService.invalidateByTag('usuario'); // Remove todas as entradas com tag 'usuario'
   * await cacheService.invalidateByTag('usuario:1'); // Remove todas as entradas com tag 'usuario:1'
   * ```
   */
  invalidateByTag(tag: string): Promise<number>;

  /**
   * Invalida todas as entradas do cache que possuem qualquer uma das tags fornecidas
   * 
   * @param tags - Array de tags a serem invalidadas
   * @returns Promise que resolve com número total de chaves removidas
   * 
   * @example
   * ```typescript
   * await cacheService.invalidateByTags(['usuario', 'evento']); // Remove entradas com tag 'usuario' ou 'evento'
   * ```
   */
  invalidateByTags(tags: string[]): Promise<number>;
}
