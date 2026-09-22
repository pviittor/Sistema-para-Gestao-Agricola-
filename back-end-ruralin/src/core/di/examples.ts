/**
 * Exemplos práticos de uso dos decorators de Dependency Injection
 * 
 * Este arquivo contém exemplos de como usar os decorators @Injectable
 * e @Inject no projeto. Use como referência ao implementar novas features.
 * 
 * NOTA: Este arquivo é apenas para documentação/exemplos, não deve ser
 * importado em produção.
 */

import 'reflect-metadata';
import { Injectable, Inject } from './decorators';
import { TYPES } from './types';
import { container } from './container';

// ============================================
// EXEMPLO 1: Service Singleton Simples
// ============================================

export interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

@Injectable() // Singleton por padrão
export class EmailService implements IEmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(`Enviando email para ${to}: ${subject}`);
    // Implementação...
  }
}

// ============================================
// EXEMPLO 2: Service com Dependências
// ============================================

export interface ILogger {
  info(message: string): void;
  error(message: string): void;
}

@Injectable()
export class LoggerService implements ILogger {
  info(message: string): void {
    console.log(`[INFO] ${message}`);
  }

  error(message: string): void {
    console.error(`[ERROR] ${message}`);
  }
}

@Injectable()
export class NotificationService {
  constructor(
    @Inject(TYPES.ILogger) private logger: ILogger,
    private emailService: EmailService // Injeção automática por classe
  ) {}

  async notifyUser(userId: number, message: string): Promise<void> {
    this.logger.info(`Notificando usuário ${userId}`);
    // Lógica de notificação...
  }
}

// ============================================
// EXEMPLO 3: Service Transient
// ============================================

@Injectable({ scope: 'transient' })
export class RequestContextService {
  private requestId: string;

  constructor() {
    this.requestId = `req-${Date.now()}-${Math.random()}`;
  }

  getRequestId(): string {
    return this.requestId;
  }
}

// ============================================
// EXEMPLO 4: Injeção Automática por Classe
// ============================================

@Injectable()
export class UserService {
  // TSyringe resolve automaticamente se LoggerService estiver registrado
  constructor(
    private logger: LoggerService
  ) {}

  getUser(id: number): void {
    this.logger.info(`Buscando usuário ${id}`);
  }
}

// ============================================
// EXEMPLO 5: Registro Manual com Token
// ============================================

// Registrar implementação com token
// container.registerSingleton<IEmailService>(TYPES.IEmailService, EmailService);
container.registerSingleton<ILogger>(TYPES.ILogger, LoggerService);

// Resolver
// const emailService = container.resolve<IEmailService>(TYPES.IEmailService);
const logger = container.resolve<ILogger>(TYPES.ILogger);

// ============================================
// EXEMPLO 6: Controller com DI
// ============================================

import { Request, Response } from 'express';

@Injectable()
export class UsuarioController {
  constructor(
    @Inject(TYPES.IUsuarioApplicationService) 
    private usuarioService: any // Substituir por tipo correto quando implementado
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.usuarioService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }
}

// ============================================
// EXEMPLO 7: Service com Múltiplas Dependências
// ============================================

@Injectable()
export class OrderService {
  constructor(
    @Inject(TYPES.ILogger) private logger: ILogger,
    private emailService: EmailService, // Injeção automática por classe
    private paymentService: any // Exemplo - substituir por tipo correto
  ) {}

  async processOrder(orderId: number): Promise<void> {
    this.logger.info(`Processando pedido ${orderId}`);
    // Lógica de processamento...
  }
}
