/**
 * IAuditService - Interface para serviço de auditoria
 * 
 * Define o contrato para serviços de auditoria que registram ações do sistema.
 * O serviço captura informações sobre quem fez o quê, quando, e quais mudanças foram realizadas.
 * 
 * @example
 * ```typescript
 * import { IAuditService } from './IAuditService';
 * 
 * @Injectable()
 * class MeuService {
 *   constructor(
 *     @Inject(TYPES.IAuditService)
 *     private auditService: IAuditService
 *   ) {}
 * 
 *   async criarUsuario(dados: any) {
 *     const usuario = await this.repository.create(dados);
 *     await this.auditService.logCreate('Usuario', usuario.id, dados);
 *     return usuario;
 *   }
 * }
 * ```
 */

import { Request } from 'express';

/**
 * Interface para serviço de auditoria
 * 
 * Define métodos para registrar diferentes tipos de ações de auditoria:
 * - CREATE: Criação de entidades
 * - UPDATE: Atualização de entidades
 * - DELETE: Exclusão de entidades
 * - READ: Leitura de entidades (opcional)
 * - LOGIN: Login de usuário
 * - LOGOUT: Logout de usuário
 */
export interface IAuditService {
  /**
   * Registra uma ação de criação
   * 
   * @param entity - Nome da entidade (ex: 'Usuario', 'Evento')
   * @param entityId - ID da entidade criada
   * @param data - Dados da entidade criada
   * @param req - Request do Express (opcional, para capturar IP e UserAgent)
   * @returns Promise que resolve quando o log foi registrado
   * 
   * @example
   * ```typescript
   * await auditService.logCreate('Usuario', 123, { nome: 'João', email: 'joao@example.com' }, req);
   * ```
   */
  logCreate(entity: string, entityId: number, data: any, req?: Request): Promise<void>;

  /**
   * Registra uma ação de atualização
   * 
   * @param entity - Nome da entidade (ex: 'Usuario', 'Evento')
   * @param entityId - ID da entidade atualizada
   * @param before - Estado anterior da entidade
   * @param after - Estado novo da entidade
   * @param req - Request do Express (opcional, para capturar IP e UserAgent)
   * @returns Promise que resolve quando o log foi registrado
   * 
   * @example
   * ```typescript
   * await auditService.logUpdate(
   *   'Usuario',
   *   123,
   *   { nome: 'João' },
   *   { nome: 'João Silva' },
   *   req
   * );
   * ```
   */
  logUpdate(entity: string, entityId: number, before: any, after: any, req?: Request): Promise<void>;

  /**
   * Registra uma ação de exclusão
   * 
   * @param entity - Nome da entidade (ex: 'Usuario', 'Evento')
   * @param entityId - ID da entidade excluída
   * @param data - Dados da entidade excluída (antes da exclusão)
   * @param req - Request do Express (opcional, para capturar IP e UserAgent)
   * @returns Promise que resolve quando o log foi registrado
   * 
   * @example
   * ```typescript
   * await auditService.logDelete('Usuario', 123, { nome: 'João', email: 'joao@example.com' }, req);
   * ```
   */
  logDelete(entity: string, entityId: number, data: any, req?: Request): Promise<void>;

  /**
   * Registra uma ação de leitura (opcional, para auditoria de acesso)
   * 
   * @param entity - Nome da entidade (ex: 'Usuario', 'Evento')
   * @param entityId - ID da entidade lida
   * @param req - Request do Express (opcional, para capturar IP e UserAgent)
   * @returns Promise que resolve quando o log foi registrado
   * 
   * @example
   * ```typescript
   * await auditService.logRead('Usuario', 123, req);
   * ```
   */
  logRead(entity: string, entityId: number, req?: Request): Promise<void>;

  /**
   * Registra uma ação de login
   * 
   * @param userId - ID do usuário que fez login
   * @param req - Request do Express (opcional, para capturar IP e UserAgent)
   * @returns Promise que resolve quando o log foi registrado
   * 
   * @example
   * ```typescript
   * await auditService.logLogin(123, req);
   * ```
   */
  logLogin(userId: number, req?: Request): Promise<void>;

  /**
   * Registra uma ação de logout
   * 
   * @param userId - ID do usuário que fez logout
   * @param req - Request do Express (opcional, para capturar IP e UserAgent)
   * @returns Promise que resolve quando o log foi registrado
   * 
   * @example
   * ```typescript
   * await auditService.logLogout(123, req);
   * ```
   */
  logLogout(userId: number, req?: Request): Promise<void>;
}
