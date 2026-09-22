/**
 * AuditService - Serviço de Auditoria
 * 
 * Centraliza a lógica de registro de logs de auditoria do sistema.
 * Captura informações sobre quem fez o quê, quando, e quais mudanças foram realizadas.
 * 
 * @example
 * ```typescript
 * import { container } from '../core/di';
 * import { TYPES } from '../core/di/types';
 * import { IAuditService } from '../core/audit/IAuditService';
 * 
 * const auditService = container.resolve<IAuditService>(TYPES.IAuditService);
 * await auditService.logCreate('Usuario', 123, { nome: 'João' }, req);
 * ```
 */

import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { IAuditService } from '../../core/audit/IAuditService';
import { IAuditLogRepository } from '../../infrastructure/repository/IAuditLogRepository';
import { ILogger } from '../../core/logger/ILogger';
import { Request } from 'express';
import { RequestContext } from '../../core/context/RequestContext';
import { getRequestContext } from '../../core/authorization/helpers';

/**
 * Serviço de auditoria
 * 
 * Implementa IAuditService para registrar logs de auditoria de todas as ações importantes do sistema.
 * Captura automaticamente informações do RequestContext (userId) e do Request (IP, UserAgent).
 */
@Injectable()
export class AuditService implements IAuditService {
  constructor(
    @Inject(TYPES.IAuditLogRepository) private auditLogRepository: IAuditLogRepository,
    @Inject(TYPES.ILogger) private logger: ILogger
  ) {}

  /**
   * Registra uma ação de criação
   * 
   * @param entity - Nome da entidade (ex: 'Usuario', 'Evento')
   * @param entityId - ID da entidade criada
   * @param data - Dados da entidade criada
   * @param req - Request do Express (opcional, para capturar IP e UserAgent)
   */
  async logCreate(entity: string, entityId: number, data: any, req?: Request): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const tenantId = this.getTenantId(req);
      const { ip, userAgent } = this.extractRequestInfo(req);

      // Sanitizar dados sensíveis antes de salvar
      const sanitizedData = this.sanitizeData(data);

      const auditData: any = {
        userId,
        action: 'CREATE',
        entity,
        entityId,
        changes: { after: sanitizedData },
        ip,
        userAgent,
        timestamp: new Date(),
      };

      // Adicionar tenantId apenas se estiver disponível
      // Caso contrário, o BaseRepository aplicará automaticamente via getTenantFilter()
      if (tenantId !== undefined && tenantId > 0) {
        auditData.tenantId = tenantId;
      }

      await this.auditLogRepository.create(auditData);

      this.logger.info('Audit log created', {
        entity,
        entityId,
        action: 'CREATE',
        userId,
        tenantId,
      });
    } catch (error) {
      // Não lançar erro para não interromper o fluxo principal
      // Mas logar o erro para monitoramento
      this.logger.error('Failed to create audit log', {
        entity,
        entityId,
        action: 'CREATE',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Registra uma ação de atualização
   * 
   * @param entity - Nome da entidade (ex: 'Usuario', 'Evento')
   * @param entityId - ID da entidade atualizada
   * @param before - Estado anterior da entidade
   * @param after - Estado novo da entidade
   * @param req - Request do Express (opcional, para capturar IP e UserAgent)
   */
  async logUpdate(entity: string, entityId: number, before: any, after: any, req?: Request): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const tenantId = this.getTenantId(req);
      const { ip, userAgent } = this.extractRequestInfo(req);

      // Sanitizar dados sensíveis antes de salvar
      const sanitizedBefore = this.sanitizeData(before);
      const sanitizedAfter = this.sanitizeData(after);

      // Calcular apenas as mudanças relevantes
      const changes = this.calculateChanges(sanitizedBefore, sanitizedAfter);

      const auditData: any = {
        userId,
        action: 'UPDATE',
        entity,
        entityId,
        changes: {
          before: sanitizedBefore,
          after: sanitizedAfter,
          changes, // Mudanças calculadas
        },
        ip,
        userAgent,
        timestamp: new Date(),
      };

      // Adicionar tenantId apenas se estiver disponível
      // Caso contrário, o BaseRepository aplicará automaticamente via getTenantFilter()
      if (tenantId !== undefined && tenantId > 0) {
        auditData.tenantId = tenantId;
      }

      await this.auditLogRepository.create(auditData);

      this.logger.info('Audit log created', {
        entity,
        entityId,
        action: 'UPDATE',
        userId,
        tenantId,
        changesCount: Object.keys(changes).length,
      });
    } catch (error) {
      // Não lançar erro para não interromper o fluxo principal
      this.logger.error('Failed to create audit log', {
        entity,
        entityId,
        action: 'UPDATE',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Registra uma ação de exclusão
   * 
   * @param entity - Nome da entidade (ex: 'Usuario', 'Evento')
   * @param entityId - ID da entidade excluída
   * @param data - Dados da entidade excluída (antes da exclusão)
   * @param req - Request do Express (opcional, para capturar IP e UserAgent)
   */
  async logDelete(entity: string, entityId: number, data: any, req?: Request): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const tenantId = this.getTenantId(req);
      const { ip, userAgent } = this.extractRequestInfo(req);

      // Sanitizar dados sensíveis antes de salvar
      const sanitizedData = this.sanitizeData(data);

      const auditData: any = {
        userId,
        action: 'DELETE',
        entity,
        entityId,
        changes: { before: sanitizedData },
        ip,
        userAgent,
        timestamp: new Date(),
      };

      // Adicionar tenantId apenas se estiver disponível
      // Caso contrário, o BaseRepository aplicará automaticamente via getTenantFilter()
      if (tenantId !== undefined && tenantId > 0) {
        auditData.tenantId = tenantId;
      }

      await this.auditLogRepository.create(auditData);

      this.logger.info('Audit log created', {
        entity,
        entityId,
        action: 'DELETE',
        userId,
        tenantId,
      });
    } catch (error) {
      // Não lançar erro para não interromper o fluxo principal
      this.logger.error('Failed to create audit log', {
        entity,
        entityId,
        action: 'DELETE',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Registra uma ação de leitura (opcional, para auditoria de acesso)
   * 
   * @param entity - Nome da entidade (ex: 'Usuario', 'Evento')
   * @param entityId - ID da entidade lida
   * @param req - Request do Express (opcional, para capturar IP e UserAgent)
   */
  async logRead(entity: string, entityId: number, req?: Request): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const tenantId = this.getTenantId(req);
      const { ip, userAgent } = this.extractRequestInfo(req);

      const auditData: any = {
        userId,
        action: 'READ',
        entity,
        entityId,
        changes: null,
        ip,
        userAgent,
        timestamp: new Date(),
      };

      // Adicionar tenantId apenas se estiver disponível
      // Caso contrário, o BaseRepository aplicará automaticamente via getTenantFilter()
      if (tenantId !== undefined && tenantId > 0) {
        auditData.tenantId = tenantId;
      }

      await this.auditLogRepository.create(auditData);

      this.logger.debug('Audit log created', {
        entity,
        entityId,
        action: 'READ',
        userId,
        tenantId,
      });
    } catch (error) {
      // Não lançar erro para não interromper o fluxo principal
      this.logger.error('Failed to create audit log', {
        entity,
        entityId,
        action: 'READ',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Registra uma ação de login
   * 
   * @param userId - ID do usuário que fez login
   * @param req - Request do Express (opcional, para capturar IP e UserAgent)
   */
  async logLogin(userId: number, req?: Request): Promise<void> {
    try {
      const tenantId = this.getTenantId(req);
      const { ip, userAgent } = this.extractRequestInfo(req);

      const auditData: any = {
        userId,
        action: 'LOGIN',
        entity: 'Usuario',
        entityId: userId,
        changes: null,
        ip,
        userAgent,
        timestamp: new Date(),
      };

      // Adicionar tenantId apenas se estiver disponível
      // Caso contrário, o BaseRepository aplicará automaticamente via getTenantFilter()
      if (tenantId !== undefined && tenantId > 0) {
        auditData.tenantId = tenantId;
      }

      await this.auditLogRepository.create(auditData);

      this.logger.info('Audit log created', {
        entity: 'Usuario',
        entityId: userId,
        action: 'LOGIN',
        userId,
        tenantId,
      });
    } catch (error) {
      // Não lançar erro para não interromper o fluxo principal
      this.logger.error('Failed to create audit log', {
        entity: 'Usuario',
        entityId: userId,
        action: 'LOGIN',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Registra uma ação de logout
   * 
   * @param userId - ID do usuário que fez logout
   * @param req - Request do Express (opcional, para capturar IP e UserAgent)
   */
  async logLogout(userId: number, req?: Request): Promise<void> {
    try {
      const tenantId = this.getTenantId(req);
      const { ip, userAgent } = this.extractRequestInfo(req);

      const auditData: any = {
        userId,
        action: 'LOGOUT',
        entity: 'Usuario',
        entityId: userId,
        changes: null,
        ip,
        userAgent,
        timestamp: new Date(),
      };

      // Adicionar tenantId apenas se estiver disponível
      // Caso contrário, o BaseRepository aplicará automaticamente via getTenantFilter()
      if (tenantId !== undefined && tenantId > 0) {
        auditData.tenantId = tenantId;
      }

      await this.auditLogRepository.create(auditData);

      this.logger.info('Audit log created', {
        entity: 'Usuario',
        entityId: userId,
        action: 'LOGOUT',
        userId,
        tenantId,
      });
    } catch (error) {
      // Não lançar erro para não interromper o fluxo principal
      this.logger.error('Failed to create audit log', {
        entity: 'Usuario',
        entityId: userId,
        action: 'LOGOUT',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Obtém o userId do RequestContext (via AsyncLocalStorage) ou do Request
   * 
   * Prioridade:
   * 1. RequestContext do AsyncLocalStorage (definido pelo middleware)
   * 2. req.context (RequestContext do Express)
   * 3. req.userId (definido pelo authMiddleware)
   * 
   * @param req - Request do Express (opcional)
   * @returns ID do usuário ou 0 se não disponível
   */
  private getUserId(req?: Request): number {
    // 1. Tentar obter do AsyncLocalStorage (mais confiável e thread-safe)
    const context = getRequestContext();
    if (context) {
      const userId = context.getUserId();
      if (userId !== undefined && userId > 0) {
        return userId;
      }
    }

    // 2. Fallback: tentar obter do req.context (RequestContext do Express)
    if (req?.context) {
      const userId = req.context.getUserId();
      if (userId !== undefined && userId > 0) {
        return userId;
      }
    }

    // 3. Fallback: tentar obter do req.userId (definido pelo authMiddleware)
    if (req?.userId && typeof req.userId === 'number' && req.userId > 0) {
      return req.userId;
    }

    // Retornar 0 se não houver usuário autenticado
    // Isso permite registrar logs mesmo sem autenticação (ex: login)
    return 0;
  }

  /**
   * Obtém o tenantId do RequestContext (via AsyncLocalStorage) ou do Request
   * 
   * Prioridade:
   * 1. RequestContext do AsyncLocalStorage (definido pelo middleware)
   * 2. req.context (RequestContext do Express)
   * 
   * @param req - Request do Express (opcional)
   * @returns ID do tenant ou undefined se não disponível (BaseRepository aplicará automaticamente)
   */
  private getTenantId(req?: Request): number | undefined {
    // 1. Tentar obter do AsyncLocalStorage (mais confiável e thread-safe)
    const context = getRequestContext();
    if (context) {
      const tenantId = context.getTenantId();
      if (tenantId !== undefined && tenantId > 0) {
        return tenantId;
      }
    }

    // 2. Fallback: tentar obter do req.context (RequestContext do Express)
    if (req?.context) {
      const tenantId = req.context.getTenantId();
      if (tenantId !== undefined && tenantId > 0) {
        return tenantId;
      }
    }

    // Retornar undefined se não houver tenant definido
    // O BaseRepository irá aplicar o filtro de tenant automaticamente via getTenantFilter()
    return undefined;
  }

  /**
   * Extrai informações do Request (IP e UserAgent)
   * 
   * Prioridade:
   * 1. RequestContext do AsyncLocalStorage (já extraído pelo middleware)
   * 2. req (Request do Express) - extração direta
   * 
   * @param req - Request do Express (opcional)
   * @returns Objeto com ip e userAgent
   */
  private extractRequestInfo(req?: Request): { ip: string | null; userAgent: string | null } {
    // 1. Tentar obter do RequestContext (via AsyncLocalStorage)
    const context = getRequestContext();
    if (context) {
      const contextIp = context.getIp();
      const contextUserAgent = context.getUserAgent();
      
      // Se ambos estiverem disponíveis no contexto, usar eles
      if (contextIp !== undefined || contextUserAgent !== undefined) {
        return {
          ip: contextIp ?? null,
          userAgent: contextUserAgent ?? null,
        };
      }
    }

    // 2. Fallback: extrair diretamente do Request
    if (!req) {
      return { ip: null, userAgent: null };
    }

    // Obter IP (considerando proxies e load balancers)
    let ip: string | null = null;
    
    // Ordem de prioridade para IP:
    // 1. req.ip (se Express estiver configurado com trust proxy)
    if (req.ip) {
      ip = req.ip;
    }
    // 2. x-forwarded-for (primeiro IP da cadeia)
    else if (req.headers['x-forwarded-for']) {
      const forwardedFor = Array.isArray(req.headers['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : req.headers['x-forwarded-for'];
      // Pegar o primeiro IP da cadeia (IP real do cliente)
      ip = forwardedFor.split(',')[0].trim();
    }
    // 3. x-real-ip
    else if (req.headers['x-real-ip']) {
      ip = Array.isArray(req.headers['x-real-ip'])
        ? req.headers['x-real-ip'][0]
        : req.headers['x-real-ip'];
    }
    // 4. socket.remoteAddress (fallback)
    else if (req.socket?.remoteAddress) {
      ip = req.socket.remoteAddress;
    }

    // Obter UserAgent
    const userAgent = req.headers['user-agent'] || null;

    return { ip, userAgent };
  }

  /**
   * Calcula as mudanças entre dois objetos
   * 
   * @param before - Estado anterior
   * @param after - Estado novo
   * @returns Objeto com apenas as propriedades que mudaram
   */
  private calculateChanges(before: any, after: any): Record<string, any> {
    const changes: Record<string, any> = {};

    if (!before || !after) {
      return changes;
    }

    // Verificar propriedades que mudaram ou foram adicionadas
    for (const key in after) {
      if (before[key] !== after[key]) {
        changes[key] = {
          from: before[key],
          to: after[key],
        };
      }
    }

    // Verificar propriedades que foram removidas
    for (const key in before) {
      if (!(key in after)) {
        changes[key] = {
          from: before[key],
          to: undefined,
        };
      }
    }

    return changes;
  }

  /**
   * Sanitiza dados removendo informações sensíveis
   * 
   * @param data - Dados a serem sanitizados
   * @returns Dados sanitizados (sem senhas, tokens, etc.)
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Campos sensíveis que não devem ser armazenados em logs
    const sensitiveFields = [
      'senha',
      'password',
      'token',
      'apiKey',
      'secret',
      'secretKey',
      'accessToken',
      'refreshToken',
    ];

    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    for (const key in sanitized) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }
}
