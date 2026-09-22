/**
 * @CacheEvict - Decorator para invalidar cache
 * 
 * Este decorator invalida entradas do cache quando um método é executado,
 * útil para métodos de escrita (create, update, delete) que modificam dados.
 * 
 * Características:
 * - Remove entrada específica do cache
 * - Opção de limpar todo o cache ou por padrão
 * - Executa antes ou depois do método (configurável)
 * - Suporta múltiplas chaves
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class UsuarioApplicationService {
 *   @CacheEvict('usuario:getById:{0}')
 *   async update(id: number, dto: UpdateUsuarioDto): Promise<UsuarioResponseDto> {
 *     // Cache será invalidado após atualização
 *   }
 * 
 *   @CacheEvict({ key: 'usuario:*', allEntries: true })
 *   async delete(id: number): Promise<boolean> {
 *     // Todos os caches de 'usuario:*' serão invalidados
 *   }
 * }
 * ```
 */

import { container } from '../di/container';
import { TYPES } from '../di/types';
import { ICacheService } from './ICacheService';
import { ICacheInvalidationService } from './CacheInvalidationService';
import { generateCacheKeyFromPattern, generateCacheKey, isCacheDisabled } from './helpers';

/**
 * Opções para o decorator @CacheEvict
 */
export interface CacheEvictOptions {
  /**
   * Chave do cache a ser invalidada (opcional)
   * Se não fornecido, será gerada automaticamente
   * Suporta padrões: 'usuario:*' para invalidar múltiplas chaves
   */
  key?: string;

  /**
   * Se true, invalida todas as entradas que correspondem ao padrão
   * (padrão: false)
   */
  allEntries?: boolean;

  /**
   * Se true, invalida antes de executar o método
   * Se false, invalida após executar o método (padrão)
   */
  beforeInvocation?: boolean;

  /**
   * Tags a serem invalidadas (opcional)
   * Se fornecido, invalida todas as entradas com essas tags
   */
  tags?: string[];

  /**
   * Se true, invalida em cascata (entidades relacionadas)
   * Requer que entityName e entityId sejam fornecidos
   */
  cascade?: boolean;

  /**
   * Nome da entidade para invalidação em cascata (opcional)
   */
  entityName?: string;

  /**
   * Função para extrair ID da entidade dos argumentos (opcional)
   * Útil quando ID não está no primeiro argumento
   */
  getEntityId?: (...args: any[]) => number | string | undefined;
}

/**
 * Decorator para invalidar cache quando método é executado
 * 
 * @param keyOrOptions - Chave do cache ou opções completas
 * @param allEntries - Se true, invalida todas as entradas do padrão (se primeiro parâmetro for string)
 * @returns Decorator function
 * 
 * @example
 * ```typescript
 * // Sintaxe simples: apenas key
 * @CacheEvict('usuario:getById:{0}')
 * 
 * // Sintaxe simples: key e allEntries
 * @CacheEvict('usuario:*', true)
 * 
 * // Sintaxe completa: opções
 * @CacheEvict({ key: 'usuario:*', allEntries: true, beforeInvocation: false })
 * 
 * // Key automática
 * @CacheEvict() // ou @CacheEvict(undefined, false)
 * ```
 */
export function CacheEvict(keyOrOptions?: string | CacheEvictOptions, allEntries?: boolean) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    if (!originalMethod || typeof originalMethod !== 'function') {
      throw new Error(`@CacheEvict can only be applied to methods. Property "${propertyName}" is not a method.`);
    }

    // Normalizar opções
    let options: CacheEvictOptions;
    if (typeof keyOrOptions === 'string') {
      options = { key: keyOrOptions, allEntries: allEntries || false };
    } else if (keyOrOptions && typeof keyOrOptions === 'object') {
      options = keyOrOptions;
    } else {
      options = { allEntries: false };
    }

    const cacheKey = options.key;
    const allEntriesFlag = options.allEntries || false;
    const beforeInvocation = options.beforeInvocation || false;
    const tags = options.tags;
    const cascade = options.cascade || false;
    const entityName = options.entityName;
    const getEntityId = options.getEntityId;

    // Substituir método por wrapper com invalidação de cache
    descriptor.value = async function (...args: any[]) {
      // Se cache desativado globalmente, executar método direto
      if (isCacheDisabled()) {
        return originalMethod.apply(this, args);
      }

      // Resolver CacheService do container
      const cacheService = container.resolve<ICacheService>(TYPES.ICacheService);
      
      // Resolver CacheInvalidationService se necessário
      let invalidationService: ICacheInvalidationService | null = null;
      if (cascade || tags) {
        try {
          invalidationService = container.resolve<ICacheInvalidationService>(TYPES.ICacheInvalidationService);
        } catch (error) {
          // Se não estiver registrado, continuar sem invalidação avançada
        }
      }

      // Gerar chave de cache
      let key: string;
      if (cacheKey) {
        // Usar chave fornecida (com substituição de placeholders)
        key = generateCacheKeyFromPattern(cacheKey, args);
      } else {
        // Gerar chave automaticamente
        key = generateCacheKey(target.constructor.name, propertyName, args);
      }

      // Invalidar cache antes se configurado
      if (beforeInvocation) {
        await invalidateCacheAdvanced(cacheService, invalidationService, key, allEntriesFlag, tags, cascade, entityName, getEntityId, args);
      }

      // Executar método original
      const result = await originalMethod.apply(this, args);

      // Invalidar cache após execução (padrão)
      if (!beforeInvocation) {
        await invalidateCacheAdvanced(cacheService, invalidationService, key, allEntriesFlag, tags, cascade, entityName, getEntityId, args);
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Processa tags substituindo placeholders pelos argumentos
 */
function processTags(tags: string[], args: any[]): string[] {
  return tags.map(tag => generateCacheKeyFromPattern(tag, args));
}

/**
 * Invalida cache baseado na chave e opções (versão avançada com tags e cascata)
 */
async function invalidateCacheAdvanced(
  cacheService: ICacheService,
  invalidationService: ICacheInvalidationService | null,
  key: string,
  allEntries: boolean,
  tags?: string[],
  cascade?: boolean,
  entityName?: string,
  getEntityId?: (...args: any[]) => number | string | undefined,
  args?: any[]
): Promise<void> {
  // Invalidação por tags (prioridade)
  if (tags && tags.length > 0 && args) {
    // Processar tags substituindo placeholders
    const processedTags = processTags(tags, args);
    await cacheService.invalidateByTags(processedTags);
    return;
  }

  // Invalidação em cascata
  if (cascade && invalidationService && entityName) {
    let entityId: number | string | undefined;
    
    if (getEntityId && args) {
      entityId = getEntityId(...args);
    } else if (args && args.length > 0) {
      // Tentar extrair ID do primeiro argumento
      entityId = args[0];
    }

    if (entityId !== undefined) {
      await invalidationService.invalidateCascade(entityName, entityId);
      return;
    }
  }

  // Invalidação padrão (por chave ou padrão)
  if (allEntries) {
    // Se allEntries é true, usar padrão para invalidar múltiplas chaves
    if (key.includes('*')) {
      // Já é um padrão
      await cacheService.deleteByPattern(key);
    } else {
      // Criar padrão baseado na chave
      // Ex: 'usuario:getById:1' -> 'usuario:*'
      const pattern = key.split(':').slice(0, 2).join(':') + ':*';
      await cacheService.deleteByPattern(pattern);
    }
  } else {
    // Invalidar apenas a chave específica
    if (key.includes('*')) {
      // Se key contém *, usar deleteByPattern
      await cacheService.deleteByPattern(key);
    } else {
      // Chave específica
      await cacheService.delete(key);
    }
  }
}
