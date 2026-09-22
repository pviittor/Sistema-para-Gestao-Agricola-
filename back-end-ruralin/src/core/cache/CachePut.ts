/**
 * @CachePut - Decorator para atualizar cache com novo valor
 * 
 * Este decorator atualiza o cache com o resultado do método após execução,
 * útil quando você quer sempre atualizar o cache independente de já existir.
 * 
 * Características:
 * - Sempre executa o método (não verifica cache antes)
 * - Atualiza cache com resultado após execução
 * - Suporta TTL configurável
 * - Geração automática de keys
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class UsuarioApplicationService {
 *   @CachePut('usuario:getById:{0}', 3600)
 *   async refreshCache(id: number): Promise<UsuarioResponseDto> {
 *     // Método sempre executa e atualiza cache
 *   }
 * }
 * ```
 */

import { container } from '../di/container';
import { TYPES } from '../di/types';
import { ICacheService } from './ICacheService';
import { generateCacheKey, generateCacheKeyFromPattern, isCacheDisabled } from './helpers';

/**
 * Opções para o decorator @CachePut
 */
export interface CachePutOptions {
  /**
   * Chave do cache (opcional)
   * Se não fornecido, será gerado automaticamente
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
 * Decorator para atualizar cache com resultado do método
 * 
 * Diferente de @Cacheable, este decorator sempre executa o método
 * e atualiza o cache com o resultado, não verifica cache antes.
 * 
 * @param keyOrOptions - Chave do cache ou opções completas
 * @param ttl - Time to live em segundos (se primeiro parâmetro for string)
 * @returns Decorator function
 * 
 * @example
 * ```typescript
 * // Sintaxe simples: apenas key
 * @CachePut('usuario:getById:{0}')
 * 
 * // Sintaxe simples: key e ttl
 * @CachePut('usuario:getById:{0}', 3600)
 * 
 * // Sintaxe completa: opções
 * @CachePut({ key: 'usuario:getById:{0}', ttl: 3600 })
 * 
 * // Key automática
 * @CachePut() // ou @CachePut(undefined, 3600)
 * ```
 */
export function CachePut(keyOrOptions?: string | CachePutOptions, ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    if (!originalMethod || typeof originalMethod !== 'function') {
      throw new Error(`@CachePut can only be applied to methods. Property "${propertyName}" is not a method.`);
    }

    // Normalizar opções
    let options: CachePutOptions;
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

    // Substituir método por wrapper que atualiza cache
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

      // Sempre executar método original (não verificar cache)
      const result = await originalMethod.apply(this, args);

      // Atualizar cache com resultado (apenas se não for null/undefined)
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
