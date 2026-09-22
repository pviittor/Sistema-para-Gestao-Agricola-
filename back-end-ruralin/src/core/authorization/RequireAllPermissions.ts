/**
 * @RequireAllPermissions - Decorator para verificação de múltiplas permissões (AND)
 * 
 * Este decorator aplica verificação automática de permissões em métodos
 * de Application Services, lançando ForbiddenException se o usuário não
 * tiver todas as permissões especificadas.
 * 
 * Características:
 * - Verifica se usuário tem todas as permissões (AND)
 * - Extrai userId do RequestContext
 * - Lança ForbiddenException se não tiver todas as permissões
 * - Integrado com AuthorizationService via DI
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class UsuarioApplicationService {
 *   @RequireAllPermissions(['usuario.read', 'usuario.write'])
 *   async complexOperation(dto: Dto): Promise<ResponseDto> {
 *     // Método será executado apenas se usuário tiver 'usuario.read' E 'usuario.write'
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
 * Decorator para verificar se usuário tem todas as permissões (AND)
 * 
 * Intercepta a chamada do método e verifica se o usuário tem todas
 * as permissões especificadas. Se não tiver todas, lança ForbiddenException.
 * 
 * @param permissions - Array de nomes de permissões (todas necessárias)
 * @returns Decorator function
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @RequireAllPermissions(['usuario.read', 'usuario.write'])
 *   async complexOperation(data: any): Promise<any> {
 *     // Método executado apenas se tiver todas as permissões
 *   }
 * }
 * ```
 */
export function RequireAllPermissions(permissions: string[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    // Guardar método original
    const originalMethod = descriptor.value;

    // Verificar se método é assíncrono
    if (!originalMethod || typeof originalMethod !== 'function') {
      throw new Error(`@RequireAllPermissions can only be applied to methods. Property "${propertyName}" is not a method.`);
    }

    // Validar que permissions é um array
    if (!Array.isArray(permissions) || permissions.length === 0) {
      throw new Error('@RequireAllPermissions requires a non-empty array of permissions');
    }

    // Substituir método por wrapper com verificação de permissões
    descriptor.value = async function (...args: any[]) {
      // Resolver AuthorizationService do container
      const authService = container.resolve<IAuthorizationService>(TYPES.IAuthorizationService);

      // Obter userId do contexto
      const userId = getUserIdFromContext(...args);

      // Se não houver userId, não pode verificar permissões
      if (!userId) {
        throw new ForbiddenException('Usuário não autenticado');
      }

      // Verificar se usuário tem todas as permissões
      const permissionChecks = await Promise.all(
        permissions.map(permission => authService.hasPermission(userId!, permission))
      );

      const hasAllPermissions = permissionChecks.every(result => result === true);

      if (!hasAllPermissions) {
        // Identificar quais permissões estão faltando
        const missingPermissions: string[] = [];
        permissionChecks.forEach((hasPermission, index) => {
          if (!hasPermission) {
            missingPermissions.push(permissions[index]);
          }
        });
        throw new ForbiddenException(
          `Todas as seguintes permissões são necessárias: ${permissions.join(', ')}. Faltando: ${missingPermissions.join(', ')}`
        );
      }

      // Se tiver todas as permissões, executar método original
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
