/**
 * @RequireRole - Decorator para verificação de role
 * 
 * Este decorator aplica verificação automática de role em métodos
 * de Application Services, lançando ForbiddenException se o usuário não
 * tiver a role necessária.
 * 
 * Características:
 * - Verifica role antes de executar o método
 * - Suporta múltiplas roles (OR - pelo menos uma)
 * - Extrai userId do RequestContext
 * - Lança ForbiddenException se não tiver role
 * - Integrado com AuthorizationService via DI
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class UsuarioApplicationService {
 *   @RequireRole('ADMIN')
 *   async delete(id: number): Promise<boolean> {
 *     // Método só será executado se usuário tiver role 'ADMIN'
 *     // ...
 *   }
 * 
 *   @RequireRole(['ADMIN', 'MANAGER'])
 *   async update(id: number, dto: UpdateDto): Promise<ResponseDto> {
 *     // Método será executado se usuário tiver role 'ADMIN' OU 'MANAGER'
 *     // ...
 *   }
 * }
 * ```
 */

import { container } from '../di/container';
import { TYPES } from '../di/types';
import { IAuthorizationService } from './IAuthorizationService';
import { ForbiddenException } from '../exceptions';
import { getUserIdFromContext } from './helpers';

/**
 * Decorator para verificar role antes de executar método
 * 
 * Intercepta a chamada do método e verifica se o usuário tem a role
 * especificada (ou pelo menos uma das roles, se array). Se não tiver,
 * lança ForbiddenException.
 * 
 * @param role - Nome da role necessária ou array de roles (OR)
 * @returns Decorator function
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @RequireRole('ADMIN')
 *   async delete(id: number): Promise<boolean> {
 *     // Método executado apenas se tiver role ADMIN
 *   }
 * 
 *   @RequireRole(['ADMIN', 'MANAGER'])
 *   async update(id: number, dto: UpdateDto): Promise<ResponseDto> {
 *     // Método executado se tiver role ADMIN OU MANAGER
 *   }
 * }
 * ```
 */
export function RequireRole(role: string | string[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    // Guardar método original
    const originalMethod = descriptor.value;

    // Verificar se método é assíncrono
    if (!originalMethod || typeof originalMethod !== 'function') {
      throw new Error(`@RequireRole can only be applied to methods. Property "${propertyName}" is not a method.`);
    }

    // Normalizar role para array
    const roles = Array.isArray(role) ? role : [role];

    // Substituir método por wrapper com verificação de role
    descriptor.value = async function (...args: any[]) {
      // Resolver AuthorizationService do container
      const authService = container.resolve<IAuthorizationService>(TYPES.IAuthorizationService);

      // Obter userId do contexto
      const userId = getUserIdFromContext(...args);

      // Se não houver userId, não pode verificar role
      if (!userId) {
        throw new ForbiddenException('Usuário não autenticado');
      }

      // Verificar se usuário tem pelo menos uma das roles (OR)
      const hasRole = await authService.hasAnyRole(userId, roles);
      if (!hasRole) {
        const rolesStr = roles.length === 1 ? roles[0] : roles.join(' ou ');
        throw new ForbiddenException(`Role '${rolesStr}' necessária`);
      }

      // Se tiver role, executar método original
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
