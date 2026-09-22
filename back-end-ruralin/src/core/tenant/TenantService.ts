/**
 * TenantService - Serviço para gerenciamento de tenants
 * 
 * Este serviço gerencia a identificação e validação de tenants no sistema.
 * Armazena o tenantId atual por requisição e valida acesso de usuários a tenants.
 * 
 * IMPORTANTE: Este service deve ser criado como uma nova instância por requisição
 * através do middleware tenantMiddleware (a ser implementado em T17.4).
 * 
 * @example
 * ```typescript
 * const tenantService = container.resolve<ITenantService>(TYPES.ITenantService);
 * 
 * // Definir tenant atual
 * tenantService.setCurrentTenantId(1);
 * 
 * // Validar tenant
 * const isValid = await tenantService.validateTenant(1);
 * ```
 */

import { injectable, inject } from 'tsyringe';
import { ITenantService } from './ITenantService';
import { TYPES } from '../di/types';
import { ILogger } from '../logger/ILogger';
import Usuario from '../../models/Usuario';

/**
 * Serviço para gerenciamento de tenants
 * 
 * Responsável por:
 * - Armazenar tenantId atual por requisição
 * - Validar se tenant existe (verificando se há usuários com aquele tenantId)
 * - Validar acesso do usuário ao tenant (verificando se usuário pertence ao tenant)
 * 
 * NOTA: RequestContext não é injetado via DI porque é criado por requisição
 * através do middleware requestContextMiddleware e armazenado em req.context.
 */
@injectable()
export class TenantService implements ITenantService {
  private currentTenantId: number | null = null;
  private requestContext: any = null; // Armazenado externamente via setRequestContext

  constructor(
    @inject(TYPES.ILogger) private logger: ILogger
  ) {}

  /**
   * Obtém o ID do tenant atual da requisição
   * 
   * @returns ID do tenant atual ou null se não definido
   */
  getCurrentTenantId(): number | null {
    return this.currentTenantId;
  }

  /**
   * Define o ID do tenant atual da requisição
   * 
   * @param tenantId - ID do tenant a ser definido
   */
  setCurrentTenantId(tenantId: number): void {
    if (tenantId <= 0) {
      this.logger.warn('Tentativa de definir tenantId inválido', { tenantId });
      throw new Error('tenantId deve ser um número positivo');
    }

    this.currentTenantId = tenantId;
    this.logger.debug('TenantId definido', { tenantId, requestId: this.requestContext?.getRequestId() });
  }

  /**
   * Valida se um tenant existe e se o usuário atual tem acesso a ele
   * 
   * Validações realizadas:
   * 1. Verifica se existe pelo menos um usuário com o tenantId especificado
   * 2. Se há um usuário autenticado, verifica se ele pertence ao tenant
   * 
   * @param tenantId - ID do tenant a ser validado
   * @returns Promise que resolve com true se o tenant é válido e o usuário tem acesso, false caso contrário
   */
  async validateTenant(tenantId: number): Promise<boolean> {
    if (tenantId <= 0) {
      this.logger.warn('Tentativa de validar tenantId inválido', { tenantId });
      return false;
    }

    try {
      // Verificar se existe pelo menos um usuário com este tenantId
      const usuarioComTenant = await Usuario.findOne({
        where: { tenantId },
        attributes: ['id'],
      });

      if (!usuarioComTenant) {
        this.logger.warn('Tenant não encontrado', { tenantId });
        return false;
      }

      // Se há um usuário autenticado, verificar se ele pertence ao tenant
      const userId = this.requestContext?.getUserId();
      if (userId) {
        const usuario = await Usuario.findByPk(userId, {
          attributes: ['id', 'tenantId'],
        });

        if (!usuario) {
          this.logger.warn('Usuário não encontrado para validação de tenant', { userId, tenantId });
          return false;
        }

        if (usuario.tenantId !== tenantId) {
          this.logger.warn('Usuário não pertence ao tenant', { userId, userTenantId: usuario.tenantId, requestedTenantId: tenantId });
          return false;
        }
      }

      this.logger.debug('Tenant validado com sucesso', { tenantId, userId });
      return true;
    } catch (error) {
      this.logger.error('Erro ao validar tenant', { tenantId, error });
      return false;
    }
  }

  /**
   * Define o RequestContext para esta instância
   * 
   * Este método deve ser chamado pelo middleware tenantMiddleware
   * para associar o RequestContext da requisição atual.
   * 
   * @param context - RequestContext da requisição atual
   */
  setRequestContext(context: any): void {
    this.requestContext = context;
  }

  /**
   * Limpa o tenant atual (útil para testes ou mudança de contexto)
   */
  clear(): void {
    this.currentTenantId = null;
    this.requestContext = null;
    this.logger.debug('TenantId limpo');
  }
}
