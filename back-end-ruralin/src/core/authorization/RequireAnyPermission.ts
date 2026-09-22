/**
 * @RequireAnyPermission - Decorator para verificação de múltiplas permissões (OR)
 * 
 * Este decorator aplica verificação automática de permissões em métodos
 * de Application Services, lançando ForbiddenException se o usuário não
 * tiver pelo menos uma das permissões especificadas.
 * 
 * Características:
 * - Verifica se usuário tem pelo menos uma das permissões (OR)
 * - Extrai userId do RequestContext
 * - Lança ForbiddenException se não tiver nenhuma permissão
 * - Integrado com AuthorizationService via DI
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class UsuarioApplicationService {
 *   @RequireAnyPermission(['usuario.create', 'usuario.update'])
 *   async modify(dto: Dto): Promise<ResponseDto> {
 *     // Método será executado se usuário tiver 'usuario.create' OU 'usuario.update'
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
 * Decorator para verificar se usuário tem pelo menos uma das permissões (OR)
 * 
 * Intercepta a chamada do método e verifica se o usuário tem pelo menos
 * uma das permissões especificadas. Se não tiver nenhuma, lança ForbiddenException.
 * 
 * @param permissions - Array de nomes de permissões (pelo menos uma necessária)
 * @returns Decorator function
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @RequireAnyPermission(['usuario.create', 'usuario.update'])
 *   async modify(data: any): Promise<any> {
 *     // Método executado se tiver pelo menos uma das permissões
 *   }
 * }
 * ```
 */
export function RequireAnyPermission(permissions: string[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    // Guardar método original
    const originalMethod = descriptor.value;

    // Verificar se método é assíncrono
    if (!originalMethod || typeof originalMethod !== 'function') {
      throw new Error(`@RequireAnyPermission can only be applied to methods. Property "${propertyName}" is not a method.`);
    }

    // Validar que permissions é um array
    if (!Array.isArray(permissions) || permissions.length === 0) {
      throw new Error('@RequireAnyPermission requires a non-empty array of permissions');
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

      // Verificar se usuário tem pelo menos uma das permissões
      const hasAnyPermission = await Promise.all(
        permissions.map(permission => authService.hasPermission(userId!, permission))
      ).then(results => results.some(result => result === true));

      if (!hasAnyPermission) {
        throw new ForbiddenException(`Pelo menos uma das permissões é necessária: ${permissions.join(', ')}`);
      }

      // Se tiver pelo menos uma permissão, executar método original
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
