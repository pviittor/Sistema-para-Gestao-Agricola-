/**
 * ICacheSyncService - Interface para Sincronização de Cache Distribuído
 * 
 * Este serviço fornece sincronização de cache entre múltiplas instâncias
 * da aplicação usando Redis Pub/Sub.
 * 
 * Quando uma instância invalida cache, outras instâncias são notificadas
 * para também invalidar o cache local (se houver).
 * 
 * @example
 * ```typescript
 * const syncService = container.resolve<ICacheSyncService>(TYPES.ICacheSyncService);
 * 
 * // Notificar outras instâncias sobre invalidação
 * await syncService.notifyInvalidation('usuario:getById:1');
 * ```
 */

/**
 * Tipos de eventos de sincronização
 */
export enum CacheSyncEventType {
  INVALIDATE_KEY = 'invalidate:key',
  INVALIDATE_PATTERN = 'invalidate:pattern',
  INVALIDATE_TAG = 'invalidate:tag',
  CLEAR = 'clear',
}

/**
 * Mensagem de sincronização
 */
export interface CacheSyncMessage {
  /**
   * Tipo do evento
   */
  type: CacheSyncEventType;

  /**
   * Chave, padrão ou tag a ser invalidada
   */
  target: string;

  /**
   * ID da instância que originou o evento (para evitar loops)
   */
  instanceId: string;

  /**
   * Timestamp do evento
   */
  timestamp: number;
}

/**
 * Interface para CacheSyncService
 */
export interface ICacheSyncService {
  /**
   * Inicia o serviço de sincronização
   * Deve ser chamado após inicializar o Redis
   */
  start(): Promise<void>;

  /**
   * Para o serviço de sincronização
   * Deve ser chamado durante shutdown
   */
  stop(): Promise<void>;

  /**
   * Notifica outras instâncias sobre invalidação de uma chave
   * 
   * @param key - Chave a ser invalidada
   */
  notifyInvalidation(key: string): Promise<void>;

  /**
   * Notifica outras instâncias sobre invalidação por padrão
   * 
   * @param pattern - Padrão a ser invalidado
   */
  notifyPatternInvalidation(pattern: string): Promise<void>;

  /**
   * Notifica outras instâncias sobre invalidação por tag
   * 
   * @param tag - Tag a ser invalidada
   */
  notifyTagInvalidation(tag: string): Promise<void>;

  /**
   * Notifica outras instâncias sobre limpeza completa do cache
   */
  notifyClear(): Promise<void>;

  /**
   * Obtém o ID da instância atual
   */
  getInstanceId(): string;
}
