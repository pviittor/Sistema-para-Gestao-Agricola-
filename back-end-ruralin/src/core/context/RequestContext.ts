/**
 * RequestContext - Contexto de Requisição
 * 
 * Armazena informações específicas de cada requisição HTTP, como:
 * - requestId: Identificador único da requisição
 * - userId: ID do usuário autenticado (quando disponível)
 * 
 * IMPORTANTE: Este service deve ser criado como uma nova instância por requisição
 * através do middleware requestContextMiddleware.
 */

import { Injectable } from '../di';

/**
 * Service para armazenar contexto de requisição
 * 
 * Cada requisição HTTP deve ter sua própria instância deste service,
 * criada pelo middleware requestContextMiddleware.
 */
@Injectable()
export class RequestContext {
  private requestId: string;
  private userId?: number;
  private tenantId?: number;
  private consultoriaId?: number;
  private startTime: number;
  private ip?: string | null;
  private userAgent?: string | null;

  constructor() {
    // requestId será definido pelo middleware
    this.requestId = '';
    this.startTime = Date.now();
  }

  /**
   * Define o ID único da requisição
   * 
   * @param id - UUID da requisição
   */
  setRequestId(id: string): void {
    this.requestId = id;
  }

  /**
   * Obtém o ID único da requisição
   * 
   * @returns UUID da requisição
   */
  getRequestId(): string {
    return this.requestId;
  }

  /**
   * Define o ID do usuário autenticado
   * 
   * @param id - ID do usuário
   */
  setUserId(id: number): void {
    this.userId = id;
  }

  /**
   * Obtém o ID do usuário autenticado
   * 
   * @returns ID do usuário ou undefined se não autenticado
   */
  getUserId(): number | undefined {
    return this.userId;
  }

  /**
   * Define o ID do tenant da requisição
   * 
   * @param id - ID do tenant
   */
  setTenantId(id: number): void {
    this.tenantId = id;
  }

  /**
   * Obtém o ID do tenant da requisição
   * 
   * @returns ID do tenant ou undefined se não definido
   */
  getTenantId(): number | undefined {
    return this.tenantId;
  }

  /**
   * Define o ID da consultoria da requisição
   * 
   * @param id - ID da consultoria
   */
  setConsultoriaId(id: number): void {
    this.consultoriaId = id;
  }

  /**
   * Obtém o ID da consultoria da requisição
   * 
   * @returns ID da consultoria ou undefined se não definido
   */
  getConsultoriaId(): number | undefined {
    return this.consultoriaId;
  }

  /**
   * Obtém o tempo de início da requisição em milissegundos
   * 
   * @returns Timestamp de início da requisição
   */
  getStartTime(): number {
    return this.startTime;
  }

  /**
   * Obtém a duração da requisição em milissegundos
   * 
   * @returns Duração em milissegundos
   */
  getDuration(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Define o endereço IP da requisição
   * 
   * @param ip - Endereço IP
   */
  setIp(ip: string | null): void {
    this.ip = ip;
  }

  /**
   * Obtém o endereço IP da requisição
   * 
   * @returns Endereço IP ou undefined se não disponível
   */
  getIp(): string | null | undefined {
    return this.ip;
  }

  /**
   * Define o User Agent da requisição
   * 
   * @param userAgent - User Agent string
   */
  setUserAgent(userAgent: string | null): void {
    this.userAgent = userAgent;
  }

  /**
   * Obtém o User Agent da requisição
   * 
   * @returns User Agent ou undefined se não disponível
   */
  getUserAgent(): string | null | undefined {
    return this.userAgent;
  }

  /**
   * Limpa o contexto (útil para testes)
   */
  clear(): void {
    this.requestId = '';
    this.userId = undefined;
    this.tenantId = undefined;
    this.consultoriaId = undefined;
    this.startTime = Date.now();
    this.ip = undefined;
    this.userAgent = undefined;
  }

  /**
   * Converte o contexto para um objeto JSON
   * 
   * @returns Objeto com informações do contexto
   */
  toJSON(): {
    requestId: string;
    userId?: number;
    tenantId?: number;
    consultoriaId?: number;
    startTime: number;
    duration: number;
    ip?: string | null;
    userAgent?: string | null;
  } {
    return {
      requestId: this.requestId,
      ...(this.userId && { userId: this.userId }),
      ...(this.tenantId && { tenantId: this.tenantId }),
      ...(this.consultoriaId && { consultoriaId: this.consultoriaId }),
      startTime: this.startTime,
      duration: this.getDuration(),
      ...(this.ip !== undefined && { ip: this.ip }),
      ...(this.userAgent !== undefined && { userAgent: this.userAgent }),
    };
  }
}
