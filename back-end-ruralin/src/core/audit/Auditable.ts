/**
 * @Auditable - Decorator para auditoria automática
 * 
 * Este decorator aplica auditoria automática em métodos de Application Services,
 * registrando logs de auditoria para operações CREATE, UPDATE e DELETE.
 * 
 * Características:
 * - Captura estado antes (para UPDATE/DELETE)
 * - Executa método original
 * - Captura estado depois
 * - Registra no AuditService automaticamente
 * - Integra com Request para IP e UserAgent
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class UsuarioApplicationService {
 *   @Auditable('Usuario')
 *   async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
 *     // Auditoria será registrada automaticamente após criação
 *   }
 * 
 *   @Auditable('Usuario')
 *   async update(id: number, dto: UpdateUsuarioDto): Promise<UsuarioResponseDto> {
 *     // Estado antes será capturado automaticamente
 *     // Auditoria será registrada após atualização
 *   }
 * }
 * ```
 */

import { container } from '../di/container';
import { TYPES } from '../di/types';
import { IAuditService } from './IAuditService';
import { IRepository } from '../repository/IRepository';
import { Request } from 'express';
import { getRequestFromArgs, getEntityName, getEntityIdFromArgs } from './helpers';
import { getRequestContext } from '../authorization/helpers';

/**
 * Opções para o decorator @Auditable
 */
export interface AuditableOptions {
  /**
   * Nome da entidade (ex: 'Usuario', 'Evento')
   * Se não fornecido, será inferido do nome da classe
   */
  entityName?: string;

  /**
   * Nome do método do repositório para buscar estado antes
   * (padrão: 'findById')
   */
  repositoryFindMethod?: string;

  /**
   * Nome da propriedade que contém o ID no resultado
   * (padrão: 'id')
   */
  idProperty?: string;

  /**
   * Função customizada para obter o ID dos argumentos
   * Útil quando o ID não está no primeiro argumento
   */
  getIdFromArgs?: (...args: any[]) => number | string | undefined;

  /**
   * Função customizada para obter o estado antes
   * Útil quando precisa de lógica especial para buscar estado
   */
  getBeforeState?: (service: any, ...args: any[]) => Promise<any> | any;
}

/**
 * Decorator para aplicar auditoria automática em métodos
 * 
 * Intercepta a chamada do método e registra auditoria automaticamente:
 * - CREATE: Registra após criação
 * - UPDATE: Captura estado antes, executa método, registra mudanças
 * - DELETE: Captura estado antes, executa método, registra exclusão
 * 
 * @param entityNameOrOptions - Nome da entidade ou opções completas
 * @returns Decorator function
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @Auditable('Usuario')
 *   async create(data: any): Promise<any> {
 *     // Auditoria registrada automaticamente
 *   }
 * 
 *   @Auditable({ entityName: 'Usuario', repositoryFindMethod: 'findById' })
 *   async update(id: number, data: any): Promise<any> {
 *     // Estado antes capturado automaticamente
 *     // Auditoria registrada automaticamente
 *   }
 * }
 * ```
 */
export function Auditable(entityNameOrOptions?: string | AuditableOptions) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    // Guardar método original
    const originalMethod = descriptor.value;

    // Verificar se método é assíncrono
    if (!originalMethod || typeof originalMethod !== 'function') {
      throw new Error(`@Auditable can only be applied to methods. Property "${propertyName}" is not a method.`);
    }

    // Processar opções
    const options: AuditableOptions = typeof entityNameOrOptions === 'string'
      ? { entityName: entityNameOrOptions }
      : (entityNameOrOptions || {});

    // Determinar nome da entidade
    const entityName = options.entityName || getEntityName(target.constructor.name);
    const repositoryFindMethod = options.repositoryFindMethod || 'findById';
    const idProperty = options.idProperty || 'id';

    // Substituir método por wrapper com auditoria
    descriptor.value = async function (...args: any[]) {
      // Resolver AuditService do container
      const auditService = container.resolve<IAuditService>(TYPES.IAuditService);

      // Obter Request dos argumentos (se disponível)
      const req = getRequestFromArgs(...args);

      // Detectar tipo de operação pelo nome do método
      const methodName = propertyName.toLowerCase();
      const isCreate = methodName === 'create';
      const isUpdate = methodName === 'update';
      const isDelete = methodName === 'delete';

      // Para UPDATE e DELETE: capturar estado antes
      let beforeState: any = null;
      let entityId: number | string | undefined;

      if (isUpdate || isDelete) {
        // Obter ID dos argumentos
        if (options.getIdFromArgs) {
          entityId = options.getIdFromArgs(...args);
        } else {
          entityId = getEntityIdFromArgs(...args);
        }

        if (entityId) {
          // Obter estado antes
          if (options.getBeforeState) {
            beforeState = await options.getBeforeState(this, ...args);
          } else {
            // Tentar obter repositório da instância do serviço
            // Assumimos que o serviço tem uma propriedade 'repository'
            const repository = (this as any).repository as IRepository<any> | undefined;

            if (repository && typeof (repository as any)[repositoryFindMethod] === 'function') {
              beforeState = await (repository as any)[repositoryFindMethod](entityId);
            }
          }
        }
      }

      // Executar método original
      const result = await originalMethod.apply(this, args);

      // Registrar auditoria
      try {
        if (isCreate) {
          // Para CREATE: usar ID do resultado
          const createdId = result?.[idProperty] || result?.id;
          if (createdId) {
            await auditService.logCreate(entityName, createdId, result, req);
          }
        } else if (isUpdate && entityId) {
          // Para UPDATE: registrar mudanças
          const updateId = typeof entityId === 'number' ? entityId : Number(entityId);
          if (!isNaN(updateId)) {
            await auditService.logUpdate(entityName, updateId, beforeState, result, req);
          }
        } else if (isDelete && entityId) {
          // Para DELETE: registrar exclusão
          const deleteId = typeof entityId === 'number' ? entityId : Number(entityId);
          if (!isNaN(deleteId)) {
            await auditService.logDelete(entityName, deleteId, beforeState, req);
          }
        }
      } catch (error) {
        // Não lançar erro para não interromper o fluxo principal
        // Erro já foi logado pelo AuditService
        console.error('Failed to register audit log:', error);
      }

      return result;
    };

    return descriptor;
  };
}
