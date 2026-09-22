/**
 * @RequirePermission - Decorator para verificação de permissão
 * 
 * Este decorator aplica verificação automática de permissão em métodos
 * de Application Services, lançando ForbiddenException se o usuário não
 * tiver a permissão necessária.
 * 
 * Características:
 * - Verifica permissão antes de executar o método
 * - Extrai userId do RequestContext
 * - Lança ForbiddenException se não tiver permissão
 * - Integrado com AuthorizationService via DI
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class UsuarioApplicationService {
 *   @RequirePermission('usuario.create')
 *   async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
 *     // Método só será executado se usuário tiver permissão 'usuario.create'
 *     // ...
 *   }
 * }
 * ```
 */

import { container } from '../di/container';
import { TYPES } from '../di/types';
import { IAuthorizationService } from './IAuthorizationService';
import { ForbiddenException } from '../exceptions';
import { getUserIdFromContext, getRequestContext } from './helpers';
import { IUsuarioRepository } from '../../infrastructure/repository/IUsuarioRepository';

/**
 * Decorator para verificar permissão antes de executar método
 * 
 * Intercepta a chamada do método e verifica se o usuário tem a permissão
 * especificada. Se não tiver, lança ForbiddenException.
 * 
 * @param permission - Nome da permissão necessária (ex: 'usuario.create')
 * @returns Decorator function
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @RequirePermission('usuario.create')
 *   async create(data: any): Promise<any> {
 *     // Método executado apenas se tiver permissão
 *   }
 * }
 * ```
 */
export function RequirePermission(permission: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    // Guardar método original
    const originalMethod = descriptor.value;

    // Verificar se método é assíncrono
    if (!originalMethod || typeof originalMethod !== 'function') {
      throw new Error(`@RequirePermission can only be applied to methods. Property "${propertyName}" is not a method.`);
    }

    // Substituir método por wrapper com verificação de permissão
    descriptor.value = async function (...args: any[]) {
      // Obter contexto da requisição
      const context = getRequestContext();
      
      // Se houver contexto, verificar tipo de usuário para bypass GOD
      if (context) {
        const userId = context.getUserId();
        
        if (userId) {
          // Buscar usuário para verificar tipo
          const usuarioRepository = container.resolve<IUsuarioRepository>(TYPES.IUsuarioRepository);
          
          // Usar findByIdWithoutTenant se disponível, senão usar findById
          const usuario = usuarioRepository.findByIdWithoutTenant
            ? await usuarioRepository.findByIdWithoutTenant(userId)
            : await usuarioRepository.findById(userId);
          
          // Bypass para GOD - não verifica permissão
          if (usuario && usuario.tipo === 'GOD') {
            return await originalMethod.apply(this, args);
          }
        }
      }

      // Resolver AuthorizationService do container
      const authService = container.resolve<IAuthorizationService>(TYPES.IAuthorizationService);

      // Obter userId do contexto
      const userId = getUserIdFromContext(...args);

      // Se não houver userId, não pode verificar permissão
      if (!userId) {
        throw new ForbiddenException('Usuário não autenticado');
      }

      // Verificar permissão
      const hasPermission = await authService.hasPermission(userId, permission);
      if (!hasPermission) {
        throw new ForbiddenException(`Permissão '${permission}' necessária`);
      }

      // Se tiver permissão, executar método original
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
