/**
 * Helpers para decorators de auditoria
 * 
 * Funções auxiliares para obter Request e outras informações
 * necessárias para auditoria.
 */

import { Request } from 'express';

/**
 * Obtém o Request dos argumentos do método
 * 
 * Procura por um objeto que tenha propriedades típicas de Request do Express
 * (context, userId, headers, ip, etc.)
 * 
 * @param args - Argumentos do método decorado
 * @returns Request ou undefined se não encontrado
 */
export function getRequestFromArgs(...args: any[]): Request | undefined {
  return args.find((arg) => {
    if (!arg || typeof arg !== 'object') {
      return false;
    }

    // Verificar se tem propriedades típicas de Request
    return (
      'context' in arg ||
      'userId' in arg ||
      'headers' in arg ||
      'ip' in arg ||
      'socket' in arg
    );
  }) as Request | undefined;
}

/**
 * Obtém o nome da entidade a partir do nome da classe
 * 
 * Remove sufixos comuns como 'ApplicationService' para obter o nome da entidade.
 * 
 * @param className - Nome da classe
 * @returns Nome da entidade
 * 
 * @example
 * ```typescript
 * getEntityName('UsuarioApplicationService') // 'Usuario'
 * getEntityName('EventoApplicationService') // 'Evento'
 * ```
 */
export function getEntityName(className: string): string {
  // Remover sufixos comuns
  return className
    .replace(/ApplicationService$/, '')
    .replace(/Service$/, '');
}

/**
 * Obtém o ID da entidade dos argumentos
 * 
 * Tenta obter o ID do primeiro argumento, que geralmente é o ID
 * em métodos update/delete.
 * 
 * @param args - Argumentos do método
 * @returns ID ou undefined se não encontrado
 */
export function getEntityIdFromArgs(...args: any[]): number | string | undefined {
  if (args.length === 0) {
    return undefined;
  }

  const firstArg = args[0];

  // Se primeiro argumento é número ou string, é o ID
  if (typeof firstArg === 'number' || typeof firstArg === 'string') {
    return firstArg;
  }

  // Se primeiro argumento é objeto, tentar obter propriedade 'id'
  if (firstArg && typeof firstArg === 'object') {
    if ('id' in firstArg) {
      return firstArg.id;
    }
  }

  return undefined;
}
