/**
 * @Cacheable - Decorator para cachear resultado de métodos
 * 
 * Este decorator aplica cache automático em métodos, verificando o cache
 * antes de executar o método e armazenando o resultado após execução.
 * 
 * Características:
 * - Verifica cache antes de executar método
 * - Retorna valor do cache se disponível
 * - Cacheia resultado após execução
 * - Suporta TTL configurável
 * - Geração automática de keys
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class UsuarioApplicationService {
 *   @Cacheable('usuario:getById:{0}', 3600)
 *   async getById(id: number): Promise<UsuarioResponseDto> {
 *     // Resultado será cacheado por 1 hora
 *   }
 * 
 *   @Cacheable(undefined, 1800) // Key gerada automaticamente
 *   async findByEmail(email: string): Promise<UsuarioResponseDto> {
 *     // Key será: 'usuario:findByEmail:email@example.com'
 *   }
 * }
 * ```
 */

import { container } from '../di/container';
import { TYPES } from '../di/types';
import { ICacheService } from './ICacheService';
import { generateCacheKey, generateCacheKeyFromPattern, isCacheDisabled } from './helpers';

/**
 * Opções para o decorator @Cacheable
 */
export interface CacheableOptions {
  /**
   * Chave do cache (opcional)
   * Se não fornecido, será gerada automaticamente
   * Suporta placeholders: {0}, {1}, etc. para argumentos
   */
  key?: string;

  /**
   * Time to live em segundos (padrão: 3600 = 1 hora)
   */
  ttl?: number;

  /**
   * Tags para agrupar entradas relacionadas (opcional)
   * Útil para invalidação em cascata
   */
  tags?: string[];
}

/**
 * Decorator para cachear resultado de métodos
 * 
 * @param keyOrOptions - Chave do cache ou opções completas
 * @param ttl - Time to live em segundos (se primeiro parâmetro for string)
 * @returns Decorator function
 * 
 * @example
 * ```typescript
 * // Sintaxe simples: apenas key
 * @Cacheable('usuario:getById:{0}')
 * 
 * // Sintaxe simples: key e ttl
 * @Cacheable('usuario:getById:{0}', 3600)
 * 
 * // Sintaxe completa: opções
 * @Cacheable({ key: 'usuario:getById:{0}', ttl: 3600 })
 * 
 * // Key automática
 * @Cacheable() // ou @Cacheable(undefined, 3600)
 * ```
 */
export function Cacheable(keyOrOptions?: string | CacheableOptions, ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    if (!originalMethod || typeof originalMethod !== 'function') {
      throw new Error(`@Cacheable can only be applied to methods. Property "${propertyName}" is not a method.`);
    }

    // Normalizar opções
    let options: CacheableOptions;
    if (typeof keyOrOptions === 'string') {
      options = { key: keyOrOptions, ttl: ttl };
    } else if (keyOrOptions && typeof keyOrOptions === 'object') {
      options = keyOrOptions;
      // Se ttl foi fornecido como segundo parâmetro, sobrescrever
      if (ttl !== undefined) {
        options.ttl = ttl;
      }
    } else {
      options = { ttl: ttl };
    }

    const cacheKey = options.key;
    const cacheTtl = options.ttl || 3600; // Padrão: 1 hora

    // Substituir método por wrapper com cache
    descriptor.value = async function (...args: any[]) {
      // Se cache desativado globalmente, executar método direto
      if (isCacheDisabled()) {
        return originalMethod.apply(this, args);
      }

      // Resolver CacheService do container
      const cacheService = container.resolve<ICacheService>(TYPES.ICacheService);

      // Gerar chave de cache
      let key: string;
      if (cacheKey) {
        // Usar chave fornecida (com substituição de placeholders)
        key = generateCacheKeyFromPattern(cacheKey, args);
      } else {
        // Gerar chave automaticamente
        key = generateCacheKey(target.constructor.name, propertyName, args);
      }

      // Verificar cache
      const cached = await cacheService.get(key);
      if (cached !== null) {
        return cached;
      }

      // Executar método original
      const result = await originalMethod.apply(this, args);

      // Cachear resultado (apenas se não for null/undefined)
      if (result !== null && result !== undefined) {
        // Se tags foram fornecidas, usar setWithTags
        if (options.tags && options.tags.length > 0) {
          // Processar tags substituindo placeholders
          const processedTags = options.tags.map(tag => generateCacheKeyFromPattern(tag, args));
          await cacheService.setWithTags(key, result, cacheTtl, processedTags);
        } else {
          await cacheService.set(key, result, cacheTtl);
        }
      }

      return result;
    };

    return descriptor;
  };
}
