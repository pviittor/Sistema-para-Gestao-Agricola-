/**
 * @RequirePolicy - Decorator para verificação de política de autorização customizada
 * 
 * Este decorator aplica verificação automática de política de autorização em métodos
 * de Application Services, lançando ForbiddenException se a política não for satisfeita.
 * 
 * Políticas permitem regras complexas além de simples verificação de permissões:
 * - Usuário só pode editar seus próprios recursos (OwnerPolicy)
 * - Usuário só pode acessar recursos do mesmo tenant (SameTenantPolicy)
 * - Regras de negócio específicas
 * 
 * Características:
 * - Verifica política antes de executar o método
 * - Extrai userId do RequestContext
 * - Busca recurso se necessário (via resourceId)
 * - Cria AuthorizationContext com informações necessárias
 * - Lança ForbiddenException se política não for satisfeita
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class UsuarioApplicationService {
 *   @RequirePolicy('owner')
 *   async update(id: number, dto: UpdateDto): Promise<ResponseDto> {
 *     // Método só será executado se usuário for dono do recurso
 *     const resource = await this.repository.findById(id);
 *     // ...
 *   }
 * }
 * ```
 */

import { container } from '../di/container';
import { TYPES } from '../di/types';
import { ForbiddenException } from '../exceptions';
import { getUserIdFromContext } from './helpers';
import { PolicyRegistry } from './PolicyRegistry';
import { IAuthorizationPolicy, AuthorizationContext } from './IAuthorizationPolicy';

/**
 * Opções para o decorator @RequirePolicy
 */
export interface RequirePolicyOptions {
  /**
   * Nome da propriedade que contém o ID do recurso no primeiro argumento
   * Padrão: assume que o primeiro argumento é o ID
   */
  resourceIdParam?: string;

  /**
   * Nome da propriedade que contém o recurso completo
   * Se fornecido, o decorator tentará obter o recurso desta propriedade
   */
  resourceParam?: string;

  /**
   * Função para buscar o recurso se não estiver disponível nos argumentos
   * Recebe os argumentos do método e retorna o recurso ou null
   */
  getResource?: (...args: any[]) => Promise<any> | any;
}

/**
 * Decorator para verificar política de autorização antes de executar método
 * 
 * Intercepta a chamada do método e verifica se a política especificada
 * é satisfeita. Se não for, lança ForbiddenException.
 * 
 * @param policyName - Nome da política a ser verificada (ex: 'owner', 'sameTenant')
 * @param options - Opções para configuração do decorator (opcional)
 * @returns Decorator function
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @RequirePolicy('owner')
 *   async update(id: number, dto: UpdateDto): Promise<ResponseDto> {
 *     // Método executado apenas se política 'owner' for satisfeita
 *   }
 * 
 *   @RequirePolicy('owner', {
 *     getResource: async (id: number) => await this.repository.findById(id)
 *   })
 *   async delete(id: number): Promise<boolean> {
 *     // Decorator busca recurso automaticamente
 *   }
 * }
 * ```
 */
export function RequirePolicy(policyName: string, options?: RequirePolicyOptions) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    // Guardar método original
    const originalMethod = descriptor.value;

    // Verificar se método é assíncrono
    if (!originalMethod || typeof originalMethod !== 'function') {
      throw new Error(`@RequirePolicy can only be applied to methods. Property "${propertyName}" is not a method.`);
    }

    // Substituir método por wrapper com verificação de política
    descriptor.value = async function (...args: any[]) {
      // Resolver política do registro
      const policy = PolicyRegistry.resolve(policyName);
      if (!policy) {
        throw new Error(`Política '${policyName}' não encontrada. Certifique-se de que ela foi registrada.`);
      }

      // Obter userId do contexto
      const userId = getUserIdFromContext(...args);
      if (!userId) {
        throw new ForbiddenException('Usuário não autenticado');
      }

      // Construir contexto de autorização
      const context: AuthorizationContext = {
        userId,
      };

      // Tentar obter resourceId do primeiro argumento
      if (args.length > 0) {
        const firstArg = args[0];
        if (typeof firstArg === 'number' || typeof firstArg === 'string') {
          context.resourceId = typeof firstArg === 'number' ? firstArg : parseInt(firstArg);
        } else if (firstArg && typeof firstArg === 'object') {
          // Se primeiro argumento é objeto, tentar obter ID de propriedade específica
          const idParam = options?.resourceIdParam || 'id';
          if (firstArg[idParam] !== undefined) {
            context.resourceId = typeof firstArg[idParam] === 'number' 
              ? firstArg[idParam] 
              : parseInt(firstArg[idParam]);
          }
        }
      }

      // Tentar obter recurso completo
      let resource: any = null;

      // 1. Tentar obter de resourceParam se especificado
      if (options?.resourceParam && args.length > 0) {
        const firstArg = args[0];
        if (firstArg && typeof firstArg === 'object' && firstArg[options.resourceParam]) {
          resource = firstArg[options.resourceParam];
        }
      }

      // 2. Tentar usar função getResource se fornecida
      if (!resource && options?.getResource) {
        resource = await options.getResource(...args);
      }

      // 3. Tentar obter de argumentos (se algum argumento é o recurso)
      if (!resource && args.length > 0) {
        const potentialResource = args.find(arg => 
          arg && 
          typeof arg === 'object' && 
          (arg.userId !== undefined || arg.tenantId !== undefined)
        );
        if (potentialResource) {
          resource = potentialResource;
        }
      }

      // Adicionar recurso ao contexto se encontrado
      if (resource) {
        context.resource = resource;
      }

      // Verificar política
      const allowed = await policy.check(context);
      if (!allowed) {
        throw new ForbiddenException(`Política '${policyName}' não satisfeita`);
      }

      // Se política for satisfeita, executar método original
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
