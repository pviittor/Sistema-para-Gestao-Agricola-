/**
 * Helpers para decorators de cache
 *
 * Funções auxiliares para geração de chaves de cache e outras operações.
 */

/**
 * Verifica se o cache está globalmente desativado via variável de ambiente.
 * Quando DISABLE_CACHE=true, os decorators @Cacheable, @CachePut e @CacheEvict
 * são ignorados — métodos executam normalmente sem ler/escrever no cache.
 */
export function isCacheDisabled(): boolean {
  return process.env.DISABLE_CACHE === 'true'
}

/**
 * Gera uma chave de cache baseada no nome da classe, método e argumentos
 * 
 * @param className - Nome da classe
 * @param methodName - Nome do método
 * @param args - Argumentos do método
 * @returns Chave de cache gerada
 * 
 * @example
 * ```typescript
 * generateCacheKey('UsuarioApplicationService', 'getById', [1])
 * // Retorna: 'UsuarioApplicationService:getById:1'
 * ```
 */
export function generateCacheKey(className: string, methodName: string, args: any[]): string {
  // Normalizar nome da classe (remover 'ApplicationService' se presente)
  const entityName = className.replace('ApplicationService', '').toLowerCase();
  
  // Serializar argumentos de forma consistente
  const argsKey = args
    .map(arg => {
      if (arg === null || arg === undefined) {
        return 'null';
      }
      if (typeof arg === 'object') {
        // Para objetos, usar JSON.stringify ordenado
        try {
          return JSON.stringify(arg, Object.keys(arg).sort());
        } catch {
          // Se não conseguir serializar, usar string do objeto
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(':');

  return `${entityName}:${methodName}:${argsKey}`;
}

/**
 * Gera uma chave de cache baseada em um padrão
 * 
 * @param pattern - Padrão da chave (ex: 'usuario:*')
 * @param args - Argumentos para substituir no padrão
 * @returns Chave de cache gerada
 * 
 * @example
 * ```typescript
 * generateCacheKeyFromPattern('usuario:getById:{id}', [1])
 * // Retorna: 'usuario:getById:1'
 * ```
 */
export function generateCacheKeyFromPattern(pattern: string, args: any[]): string {
  let key = pattern;
  let argIndex = 0;

  // Substituir placeholders {0}, {1}, etc. pelos argumentos
  key = key.replace(/\{(\d+)\}/g, (match, index) => {
    const idx = parseInt(index, 10);
    if (idx < args.length) {
      return String(args[idx]);
    }
    return match;
  });

  // Substituir {*} pelos argumentos restantes
  if (key.includes('{*}')) {
    const remainingArgs = args.slice(argIndex).map(arg => String(arg)).join(':');
    key = key.replace('{*}', remainingArgs);
  }

  return key;
}

/**
 * Extrai ID de argumentos para uso em chaves de cache
 * 
 * @param args - Argumentos do método
 * @param idProperty - Nome da propriedade que contém o ID (padrão: 'id')
 * @param idParamIndex - Índice do parâmetro que contém o ID (opcional)
 * @returns ID extraído ou undefined
 */
export function extractIdFromArgs(
  args: any[],
  idProperty: string = 'id',
  idParamIndex?: number
): number | string | undefined {
  if (idParamIndex !== undefined && args[idParamIndex] !== undefined) {
    return args[idParamIndex];
  }

  // Tentar primeiro argumento se for número ou string
  if (args[0] && (typeof args[0] === 'number' || typeof args[0] === 'string')) {
    return args[0];
  }

  // Tentar primeiro argumento se for objeto com propriedade id
  if (args[0] && typeof args[0] === 'object' && args[0][idProperty] !== undefined) {
    return args[0][idProperty];
  }

  return undefined;
}
