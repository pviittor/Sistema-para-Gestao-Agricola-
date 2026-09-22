# Tarefas Detalhadas - Fase 5: Funcionalidades Avançadas

## Formato de Ticket

Cada tarefa abaixo pode ser copiada diretamente para criação de tickets em ferramentas de gestão (Jira, Trello, GitHub Issues, etc.).

**Template de Ticket**:
- **Título**: [ID] - [Nome da Tarefa]
- **Tipo**: Task/Feature/Refactoring
- **Prioridade**: P0/P1/P2/P3
- **Story Points**: X
- **Sprint**: X
- **Descrição**: [Conteúdo abaixo]
- **Critérios de Aceite**: [Lista abaixo]
- **Dependências**: [Listadas abaixo]

---

## FASE 5: FUNCIONALIDADES AVANÇADAS

### SPRINT 19: Localization

---

#### T19.1 - Setup i18n

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 5  
**Sprint**: 19  
**Estimativa**: 20 horas

**Descrição**:
Configurar sistema de internacionalização (i18n) para suportar múltiplos idiomas no sistema.

**Contexto Técnico**:
- i18n permite traduzir mensagens do sistema
- Suporte inicial para pt-BR e en-US
- Biblioteca i18next é recomendada para Node.js
- Configuração centralizada facilita manutenção

**Tarefas Específicas**:
1. Instalar biblioteca i18n: `npm install i18next i18next-fs-backend`
2. Criar estrutura de traduções: `src/locales/{locale}/translation.json`
3. Criar arquivos de tradução:
   - `src/locales/pt-BR/translation.json`
   - `src/locales/en-US/translation.json`
4. Configurar i18n service:
   ```typescript
   import i18next from 'i18next';
   import Backend from 'i18next-fs-backend';
   
   i18next.use(Backend).init({
     lng: 'pt-BR',
     fallbackLng: 'pt-BR',
     backend: {
       loadPath: './src/locales/{{lng}}/{{ns}}.json'
     }
   });
   ```
5. Integrar com DI container
6. Configurar locale padrão via variável de ambiente

**Código de Referência**:
```typescript
// src/core/i18n/I18nService.ts
import { injectable } from 'tsyringe';
import i18next from 'i18next';

@injectable()
export class I18nService {
  translate(key: string, options?: any): string {
    return i18next.t(key, options);
  }

  setLocale(locale: string): void {
    i18next.changeLanguage(locale);
  }

  getLocale(): string {
    return i18next.language;
  }
}
```

**Dependências**:
- T1.1 (Setup do Container de DI)

**Critérios de Aceite**:
- [ ] i18next instalado e configurado
- [ ] Estrutura de traduções criada
- [ ] Arquivos de tradução criados (pt-BR, en-US)
- [ ] I18nService criado e funcionando
- [ ] Integrado com DI
- [ ] Locale padrão configurável
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/core/i18n/I18nService.ts`
- `src/locales/pt-BR/translation.json`
- `src/locales/en-US/translation.json`

---

#### T19.2 - Integração com Validação

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 5  
**Sprint**: 19  
**Estimativa**: 20 horas

**Descrição**:
Integrar i18n com sistema de validação para traduzir mensagens de erro de validação.

**Tarefas Específicas**:
1. Traduzir mensagens de validação padrão do class-validator:
   - Mensagens em pt-BR e en-US
   - Exemplo: "Email deve ser um email válido" / "Email must be a valid email"
2. Criar middleware de locale:
   - Detectar locale do header `Accept-Language`
   - Detectar locale do query parameter `?lang=pt-BR`
   - Armazenar locale no RequestContext
3. Atualizar middleware de validação para usar i18n
4. Atualizar ValidationException para usar traduções
5. Testes de integração

**Código de Referência**:
```typescript
// src/middleware/locale.ts
export const localeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const i18nService = container.resolve<I18nService>('I18nService');
  
  // Detectar locale
  const locale = req.headers['accept-language']?.split(',')[0] || 
                 req.query.lang as string || 
                 'pt-BR';
  
  i18nService.setLocale(locale);
  next();
};

// Atualização no ValidationException
export class ValidationException extends BaseException {
  constructor(errors: ValidationError[]) {
    const i18n = container.resolve<I18nService>('I18nService');
    const message = i18n.translate('validation.errors', { errors });
    super(message, 400, 'VALIDATION_ERROR');
  }
}
```

**Dependências**:
- T19.1 (Setup i18n)
- T3.2 (Setup de Validação)
- T2.1 (Classes de Exceção Customizadas)

**Critérios de Aceite**:
- [ ] Mensagens de validação traduzidas
- [ ] Middleware de locale funcionando
- [ ] Detecção automática de locale
- [ ] Validações retornando mensagens traduzidas
- [ ] Testes de integração passando

**Arquivos a Modificar**:
- `src/middleware/validation.ts`
- `src/core/exceptions/ValidationException.ts`

**Arquivos a Criar**:
- `src/middleware/locale.ts`

---

#### T19.3 - Integração com Exception Handling

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 3  
**Sprint**: 19  
**Estimativa**: 12 horas

**Descrição**:
Integrar i18n com Exception Handling para traduzir mensagens de erro.

**Tarefas Específicas**:
1. Traduzir mensagens de erro padrão:
   - BusinessException
   - NotFoundException
   - UnauthorizedException
   - ForbiddenException
2. Atualizar exceções para usar i18n
3. Atualizar ErrorHandler para usar locale do RequestContext
4. Testes de integração

**Dependências**:
- T19.1 (Setup i18n)
- T19.2 (Integração com Validação)
- T2.1 (Classes de Exceção Customizadas)
- T2.2 (ErrorHandler Middleware)

**Critérios de Aceite**:
- [ ] Mensagens de erro traduzidas
- [ ] Exceções usando i18n
- [ ] ErrorHandler retornando mensagens traduzidas
- [ ] Testes de integração passando

**Arquivos a Modificar**:
- Todas as classes de exceção
- `src/middleware/errorHandler.ts`

---

#### T19.4 - Traduções Completas

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 5  
**Sprint**: 19  
**Estimativa**: 20 horas

**Descrição**:
Completar traduções de todas as mensagens do sistema.

**Tarefas Específicas**:
1. Identificar todas as mensagens do sistema:
   - Mensagens de sucesso
   - Mensagens de erro
   - Mensagens de validação
   - Mensagens de negócio
2. Traduzir para pt-BR e en-US
3. Organizar traduções por namespace (validation, errors, success, etc.)
4. Criar guia de uso para desenvolvedores
5. Documentar processo de adicionar novas traduções

**Dependências**:
- T19.1 (Setup i18n)
- T19.2 (Integração com Validação)
- T19.3 (Integração com Exception Handling)

**Critérios de Aceite**:
- [ ] Todas as mensagens traduzidas
- [ ] Traduções organizadas por namespace
- [ ] Guia de uso criado
- [ ] Documentação completa
- [ ] Testes validando traduções

**Arquivos a Modificar**:
- `src/locales/pt-BR/translation.json`
- `src/locales/en-US/translation.json`

---

### SPRINT 20: Dynamic API - Base

---

#### T20.1 - Metadados de API

**Tipo**: Task  
**Prioridade**: P3  
**Story Points**: 8  
**Sprint**: 20  
**Estimativa**: 32 horas

**Descrição**:
Criar sistema de extração de metadados dos Application Services para geração automática de documentação e SDK.

**Contexto Técnico**:
- Metadados incluem: endpoints, DTOs, validações, tipos
- Permite geração automática de documentação OpenAPI
- Facilita criação de SDKs para clientes
- Reduz trabalho manual de documentação

**Tarefas Específicas**:
1. Criar interface `IApiMetadataService`:
   ```typescript
   export interface IApiMetadataService {
     extractMetadata(service: any): ApiMetadata;
     getAllEndpoints(): EndpointMetadata[];
   }
   ```
2. Implementar extração de metadados:
   - Analisar Application Services
   - Extrair métodos públicos
   - Extrair tipos de DTOs
   - Extrair validações
3. Criar estrutura de metadados:
   ```typescript
   export interface EndpointMetadata {
     path: string;
     method: string;
     requestDto?: DtoMetadata;
     responseDto?: DtoMetadata;
     validations?: ValidationMetadata[];
   }
   ```
4. Implementar `ApiMetadataService`
5. Escrever testes unitários

**Dependências**:
- T7.3, T8.1, T8.2, T8.3, T9.1, T9.2 (Application Services)

**Critérios de Aceite**:
- [ ] Sistema de metadados criado
- [ ] Extração de metadados funcionando
- [ ] Estrutura de metadados definida
- [ ] Testes unitários passando
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/core/api-metadata/IApiMetadataService.ts`
- `src/core/api-metadata/ApiMetadataService.ts`
- `src/core/api-metadata/types.ts`

---

#### T20.2 - OpenAPI/Swagger

**Tipo**: Task  
**Prioridade**: P3  
**Story Points**: 5  
**Sprint**: 20  
**Estimativa**: 20 horas

**Descrição**:
Integrar Swagger/OpenAPI para gerar documentação automática da API.

**Tarefas Específicas**:
1. Instalar dependências: `npm install swagger-ui-express swagger-jsdoc`
2. Configurar Swagger:
   - Definir informações básicas da API
   - Configurar segurança (JWT)
   - Configurar tags e categorias
3. Gerar documentação a partir de metadados:
   - Usar ApiMetadataService para gerar specs
   - Converter metadados para formato OpenAPI
4. Criar endpoint `/api-docs` para UI do Swagger
5. Adicionar comentários JSDoc nos controllers para documentação adicional

**Código de Referência**:
```typescript
// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RuralIn API',
      version: '1.0.0',
      description: 'API Documentation'
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
```

**Dependências**:
- T20.1 (Metadados de API)

**Critérios de Aceite**:
- [ ] Swagger instalado e configurado
- [ ] Documentação gerada automaticamente
- [ ] UI do Swagger funcionando
- [ ] Endpoint `/api-docs` criado
- [ ] Documentação completa e atualizada

**Arquivos a Criar**:
- `src/config/swagger.ts`
- `src/routes/swagger.routes.ts`

---

#### T20.3 - Gerador de Client SDK

**Tipo**: Task  
**Prioridade**: P3  
**Story Points**: 8  
**Sprint**: 20  
**Estimativa**: 32 horas

**Descrição**:
Criar gerador de SDK TypeScript para facilitar uso da API por clientes JavaScript/TypeScript.

**Tarefas Específicas**:
1. Criar estrutura de geração de SDK:
   - Template de código TypeScript
   - Gerador de tipos
   - Gerador de métodos de API
2. Implementar gerador de tipos TypeScript:
   - Converter DTOs para interfaces TypeScript
   - Gerar tipos de resposta
3. Implementar gerador de métodos:
   - Criar métodos para cada endpoint
   - Incluir validação de tipos
   - Incluir tratamento de erros
4. Gerar arquivo SDK completo:
   ```typescript
   export class RuralInClient {
     constructor(private baseUrl: string, private token: string) {}
     
     async createUsuario(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
       // ...
     }
   }
   ```
5. Criar script de geração
6. Testes de geração

**Dependências**:
- T20.1 (Metadados de API)

**Critérios de Aceite**:
- [ ] Gerador de SDK criado
- [ ] Tipos TypeScript gerados
- [ ] Métodos de API gerados
- [ ] SDK funcionando corretamente
- [ ] Testes de geração passando
- [ ] Documentação de uso criada

**Arquivos a Criar**:
- `src/tools/sdk-generator/SdkGenerator.ts`
- `src/tools/sdk-generator/templates/`
- `scripts/generate-sdk.ts`

---

### SPRINT 21: Background Jobs - Base

---

#### T21.1 - Setup Bull/BullMQ

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 5  
**Sprint**: 21  
**Estimativa**: 20 horas

**Descrição**:
Configurar Bull/BullMQ para sistema de filas e processamento assíncrono de jobs.

**Contexto Técnico**:
- Bull/BullMQ usa Redis como backend de filas
- Permite processamento assíncrono de tarefas pesadas
- Suporta retry, agendamento e monitoramento
- Melhora responsividade da API

**Tarefas Específicas**:
1. Instalar dependências: `npm install bullmq`
2. Configurar Redis para filas (usar mesmo Redis do cache ou separado)
3. Criar interface `IQueueService`:
   ```typescript
   export interface IQueueService {
     add(queueName: string, data: any, options?: JobOptions): Promise<Job>;
     process(queueName: string, processor: (job: Job) => Promise<any>): void;
   }
   ```
4. Implementar `QueueService` usando BullMQ
5. Configurar conexão com Redis
6. Integrar com DI container

**Código de Referência**:
```typescript
// src/core/queue/IQueueService.ts
import { Job } from 'bullmq';

export interface IQueueService {
  add(queueName: string, data: any, options?: JobOptions): Promise<Job>;
  process(queueName: string, processor: (job: Job) => Promise<any>): void;
}

// src/infrastructure/queue/QueueService.ts
import { injectable } from 'tsyringe';
import { Queue, Worker } from 'bullmq';
import { IQueueService } from '../../core/queue/IQueueService';

@injectable()
export class QueueService implements IQueueService {
  private queues: Map<string, Queue> = new Map();

  async add(queueName: string, data: any, options?: JobOptions): Promise<Job> {
    const queue = this.getQueue(queueName);
    return await queue.add(queueName, data, options);
  }

  process(queueName: string, processor: (job: Job) => Promise<any>): void {
    new Worker(queueName, processor, {
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });
  }

  private getQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, new Queue(queueName, {
        connection: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT || '6379')
        }
      }));
    }
    return this.queues.get(queueName)!;
  }
}
```

**Dependências**:
- T15.1 (Setup Redis)

**Critérios de Aceite**:
- [ ] BullMQ instalado e configurado
- [ ] Interface IQueueService criada
- [ ] QueueService implementado
- [ ] Conexão com Redis configurada
- [ ] Integrado com DI
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/core/queue/IQueueService.ts`
- `src/infrastructure/queue/QueueService.ts`

---

#### T21.2 - Queue Service

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 8  
**Sprint**: 21  
**Estimativa**: 32 horas

**Descrição**:
Completar implementação do QueueService com métodos avançados e configurações.

**Tarefas Específicas**:
1. Implementar métodos adicionais:
   - `getJob(queueName: string, jobId: string): Promise<Job>`
   - `getJobs(queueName: string, status: string): Promise<Job[]>`
   - `remove(queueName: string, jobId: string): Promise<void>`
2. Implementar retry automático:
   - Configurar número de tentativas
   - Configurar delay entre tentativas
3. Configuração de filas:
   - Prioridades
   - Delays
   - Timeouts
4. Integrar com Logger para logar execução de jobs
5. Escrever testes unitários

**Dependências**:
- T21.1 (Setup Bull/BullMQ)
- T2.3 (Logger Service)

**Critérios de Aceite**:
- [ ] Métodos adicionais implementados
- [ ] Retry automático funcionando
- [ ] Configurações de filas funcionando
- [ ] Integrado com Logger
- [ ] Testes unitários passando

**Arquivos a Modificar**:
- `src/infrastructure/queue/QueueService.ts`

---

#### T21.3 - Workers Base

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 5  
**Sprint**: 21  
**Estimativa**: 20 horas

**Descrição**:
Criar estrutura base de workers para processamento de jobs.

**Tarefas Específicas**:
1. Criar estrutura de workers: `src/workers/`
2. Criar classe base `BaseWorker`:
   ```typescript
   export abstract class BaseWorker {
     abstract process(job: Job): Promise<any>;
     protected handleError(job: Job, error: Error): void;
   }
   ```
3. Implementar worker de exemplo
4. Tratamento de erros padronizado
5. Integrar com Logger
6. Escrever testes unitários

**Código de Referência**:
```typescript
// src/workers/BaseWorker.ts
import { Job } from 'bullmq';
import { injectable } from 'tsyringe';
import { ILogger } from '../core/logger/ILogger';

@injectable()
export abstract class BaseWorker {
  constructor(
    @inject('ILogger') protected logger: ILogger
  ) {}

  abstract process(job: Job): Promise<any>;

  protected handleError(job: Job, error: Error): void {
    this.logger.error('Job failed', {
      jobId: job.id,
      queue: job.queueName,
      error: error.message
    });
    throw error;
  }
}
```

**Dependências**:
- T21.1 (Setup Bull/BullMQ)
- T2.3 (Logger Service)

**Critérios de Aceite**:
- [ ] Estrutura de workers criada
- [ ] BaseWorker implementado
- [ ] Worker de exemplo funcionando
- [ ] Tratamento de erros funcionando
- [ ] Testes passando

**Arquivos a Criar**:
- `src/workers/BaseWorker.ts`
- `src/workers/ExampleWorker.ts`

---

#### T21.4 - Jobs Agendados (Cron)

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 5  
**Sprint**: 21  
**Estimativa**: 20 horas

**Descrição**:
Implementar sistema de jobs agendados usando cron.

**Tarefas Específicas**:
1. Instalar dependência: `npm install node-cron`
2. Criar `SchedulerService`:
   ```typescript
   export interface ISchedulerService {
     schedule(cronExpression: string, job: () => Promise<void>): void;
   }
   ```
3. Implementar agendamento de jobs:
   - Usar node-cron para agendamento
   - Integrar com QueueService para executar jobs
4. Criar jobs agendados de exemplo:
   - Limpeza de logs antigos (diário)
   - Backup de dados (semanal)
5. Configurar jobs via arquivo de configuração
6. Testes de integração

**Código de Referência**:
```typescript
// src/core/scheduler/ISchedulerService.ts
export interface ISchedulerService {
  schedule(cronExpression: string, job: () => Promise<void>): void;
}

// src/infrastructure/scheduler/SchedulerService.ts
import { injectable } from 'tsyringe';
import * as cron from 'node-cron';
import { IQueueService } from '../../core/queue/IQueueService';

@injectable()
export class SchedulerService implements ISchedulerService {
  constructor(
    @inject('IQueueService') private queueService: IQueueService
  ) {}

  schedule(cronExpression: string, job: () => Promise<void>): void {
    cron.schedule(cronExpression, async () => {
      await this.queueService.add('scheduled', { job });
    });
  }
}
```

**Dependências**:
- T21.1 (Setup Bull/BullMQ)
- T21.2 (Queue Service)

**Critérios de Aceite**:
- [ ] node-cron instalado e configurado
- [ ] SchedulerService implementado
- [ ] Jobs agendados funcionando
- [ ] Jobs de exemplo criados
- [ ] Testes de integração passando

**Arquivos a Criar**:
- `src/core/scheduler/ISchedulerService.ts`
- `src/infrastructure/scheduler/SchedulerService.ts`
- `src/config/scheduled-jobs.ts`

---

### SPRINT 22: Background Jobs - Avançado

---

#### T22.1 - Retry e Dead Letter Queue

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 5  
**Sprint**: 22  
**Estimativa**: 20 horas

**Descrição**:
Implementar retry automático e dead letter queue para jobs que falham.

**Tarefas Específicas**:
1. Implementar retry automático:
   - Configurar número máximo de tentativas
   - Configurar delay entre tentativas (exponential backoff)
   - Logar cada tentativa
2. Implementar dead letter queue:
   - Jobs que falham após todas as tentativas
   - Armazenar em fila separada para análise
   - Notificar administradores (opcional)
3. Configurar retries por tipo de job
4. Testes de integração

**Dependências**:
- T21.2 (Queue Service)

**Critérios de Aceite**:
- [ ] Retry automático funcionando
- [ ] Dead letter queue funcionando
- [ ] Configuração de retries funcionando
- [ ] Testes de integração passando
- [ ] Documentação criada

**Arquivos a Modificar**:
- `src/infrastructure/queue/QueueService.ts`

---

#### T22.2 - Monitoramento de Filas

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 5  
**Sprint**: 22  
**Estimativa**: 20 horas

**Descrição**:
Implementar monitoramento de filas com dashboard e métricas.

**Tarefas Específicas**:
1. Instalar Bull Board: `npm install @bull-board/express @bull-board/api`
2. Configurar dashboard de filas:
   - Visualizar filas ativas
   - Ver jobs em processamento
   - Ver jobs completados/falhados
3. Criar endpoint `/admin/queues` para dashboard
4. Implementar métricas:
   - Jobs processados por hora
   - Taxa de sucesso/falha
   - Tempo médio de processamento
5. Integrar com Logger para logging de métricas

**Dependências**:
- T21.1 (Setup Bull/BullMQ)

**Critérios de Aceite**:
- [ ] Bull Board instalado e configurado
- [ ] Dashboard de filas funcionando
- [ ] Métricas implementadas
- [ ] Endpoint de dashboard criado
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/config/bull-board.ts`
- `src/routes/admin.routes.ts`

---

#### T22.3 - Jobs de Exemplo

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 5  
**Sprint**: 22  
**Estimativa**: 20 horas

**Descrição**:
Criar jobs de exemplo para demonstrar uso do sistema de filas.

**Tarefas Específicas**:
1. Criar `CleanupLogsJob`:
   - Limpar logs antigos (configurável)
   - Executar diariamente
2. Criar `SendEmailJob` (exemplo):
   - Envio assíncrono de emails
   - Retry em caso de falha
3. Criar `ProcessDataJob` (exemplo):
   - Processamento de dados pesados
   - Notificar quando completo
4. Integrar jobs com Application Services
5. Testes de integração

**Dependências**:
- T21.3 (Workers Base)
- T21.4 (Jobs Agendados)

**Critérios de Aceite**:
- [ ] CleanupLogsJob criado e funcionando
- [ ] Jobs de exemplo criados
- [ ] Jobs integrados com Application Services
- [ ] Testes de integração passando
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/workers/CleanupLogsWorker.ts`
- `src/workers/SendEmailWorker.ts` (exemplo)
- `src/workers/ProcessDataWorker.ts` (exemplo)

---

#### T22.4 - Documentação

**Tipo**: Documentation  
**Prioridade**: P2  
**Story Points**: 3  
**Sprint**: 22  
**Estimativa**: 12 horas

**Descrição**:
Criar documentação completa sobre sistema de jobs.

**Tarefas Específicas**:
1. Documentar uso de jobs
2. Criar exemplos práticos
3. Documentar criação de novos jobs
4. Guia de boas práticas
5. Troubleshooting guide

**Critérios de Aceite**:
- [ ] Documentação completa criada
- [ ] Exemplos práticos incluídos
- [ ] Guia de criação de jobs criado
- [ ] Documentação revisada

---

### SPRINT 23: Notifications System - Base

---

#### T23.1 - Notification Service

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 8  
**Sprint**: 23  
**Estimativa**: 32 horas

**Descrição**:
Criar serviço de notificações para gerenciar notificações do sistema.

**Contexto Técnico**:
- Notificações informam usuários sobre eventos importantes
- Armazenadas no banco de dados
- Enviadas em tempo real via WebSockets/SSE
- Tipos diferentes de notificações

**Tarefas Específicas**:
1. Criar interface `INotificationService`:
   ```typescript
   export interface INotificationService {
     create(notification: CreateNotificationDto): Promise<Notification>;
     markAsRead(notificationId: number): Promise<void>;
     getUserNotifications(userId: number, options?: FindOptions): Promise<Notification[]>;
   }
   ```
2. Implementar `NotificationService`:
   - Criar notificações
   - Marcar como lida
   - Buscar notificações do usuário
3. Definir tipos de notificações:
   - INFO, WARNING, ERROR, SUCCESS
4. Integrar com DI container
5. Escrever testes unitários

**Código de Referência**:
```typescript
// src/application/services/NotificationService.ts
import { injectable, inject } from 'tsyringe';
import { INotificationRepository } from '../../infrastructure/repository/INotificationRepository';

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject('INotificationRepository') private repository: INotificationRepository
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    return await this.repository.create(dto);
  }

  async markAsRead(notificationId: number): Promise<void> {
    await this.repository.update(notificationId, { read: true });
  }

  async getUserNotifications(userId: number, options?: FindOptions): Promise<Notification[]> {
    return await this.repository.findByUser(userId, options);
  }
}
```

**Dependências**:
- T1.1 (Setup do Container de DI)
- T5.2 (BaseRepository)

**Critérios de Aceite**:
- [ ] INotificationService interface criada
- [ ] NotificationService implementado
- [ ] Tipos de notificações definidos
- [ ] Integrado com DI
- [ ] Testes unitários passando

**Arquivos a Criar**:
- `src/core/notification/INotificationService.ts`
- `src/application/services/NotificationService.ts`
- `src/application/dto/notification/CreateNotificationDto.ts`

---

#### T23.2 - Modelo de Notificação

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 3  
**Sprint**: 23  
**Estimativa**: 12 horas

**Descrição**:
Criar modelo de Notificação no banco de dados.

**Tarefas Específicas**:
1. Criar modelo `Notification` em `src/models/Notification.ts`:
   - `id`: number
   - `userId`: number
   - `type`: string (INFO, WARNING, ERROR, SUCCESS)
   - `title`: string
   - `message`: string
   - `read`: boolean
   - `data`: JSON (dados adicionais)
   - `createdAt`: Date
2. Criar migration
3. Criar índices:
   - `userId` + `read`
   - `createdAt`
4. Criar NotificationRepository

**Dependências**:
- T5.2 (BaseRepository)

**Critérios de Aceite**:
- [ ] Modelo Notification criado
- [ ] Migration criada e aplicada
- [ ] Índices criados
- [ ] NotificationRepository criado

**Arquivos a Criar**:
- `src/models/Notification.ts`
- `src/migrations/create-notifications.ts`
- `src/infrastructure/repository/NotificationRepository.ts`

---

#### T23.3 - Pub/Sub Base

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 8  
**Sprint**: 23  
**Estimativa**: 32 horas

**Descrição**:
Implementar sistema pub/sub para notificações em tempo real.

**Contexto Técnico**:
- Pub/Sub permite notificar clientes em tempo real
- Redis Pub/Sub ou EventEmitter podem ser usados
- Eventos do sistema disparam notificações
- Clientes se inscrevem para receber notificações

**Tarefas Específicas**:
1. Criar interface `IEventPublisher`:
   ```typescript
   export interface IEventPublisher {
     publish(event: string, data: any): void;
     subscribe(event: string, handler: (data: any) => void): void;
   }
   ```
2. Implementar usando Redis Pub/Sub ou EventEmitter
3. Criar eventos do sistema:
   - `notification.created`
   - `notification.read`
4. Integrar com NotificationService
5. Escrever testes unitários

**Código de Referência**:
```typescript
// src/core/events/IEventPublisher.ts
export interface IEventPublisher {
  publish(event: string, data: any): void;
  subscribe(event: string, handler: (data: any) => void): void;
}

// src/infrastructure/events/RedisEventPublisher.ts
import { injectable } from 'tsyringe';
import { createClient } from 'redis';

@injectable()
export class RedisEventPublisher implements IEventPublisher {
  private publisher;
  private subscriber;

  constructor() {
    this.publisher = createClient({ url: process.env.REDIS_URL });
    this.subscriber = createClient({ url: process.env.REDIS_URL });
    this.publisher.connect();
    this.subscriber.connect();
  }

  publish(event: string, data: any): void {
    this.publisher.publish(event, JSON.stringify(data));
  }

  subscribe(event: string, handler: (data: any) => void): void {
    this.subscriber.subscribe(event, (message) => {
      handler(JSON.parse(message));
    });
  }
}
```

**Dependências**:
- T15.1 (Setup Redis)
- T23.1 (Notification Service)

**Critérios de Aceite**:
- [ ] IEventPublisher interface criada
- [ ] Pub/Sub implementado
- [ ] Eventos do sistema criados
- [ ] Integrado com NotificationService
- [ ] Testes unitários passando

**Arquivos a Criar**:
- `src/core/events/IEventPublisher.ts`
- `src/infrastructure/events/RedisEventPublisher.ts`

---

#### T23.4 - WebSockets ou SSE

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 5  
**Sprint**: 23  
**Estimativa**: 20 horas

**Descrição**:
Implementar WebSockets ou Server-Sent Events para notificações em tempo real aos clientes.

**Tarefas Específicas**:
1. Escolher tecnologia (WebSockets com Socket.io ou SSE)
2. Instalar dependências: `npm install socket.io` (se WebSockets)
3. Configurar servidor WebSocket/SSE
4. Criar middleware de autenticação para conexões
5. Implementar envio de notificações:
   - Quando notificação é criada, enviar ao cliente
   - Filtrar por userId
6. Testes de integração

**Código de Referência**:
```typescript
// src/config/socket.ts
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export function setupSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  });

  io.use((socket, next) => {
    // Autenticação via token
    const token = socket.handshake.auth.token;
    // Validar token...
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    
    // Inscrever em notificações do usuário
    socket.join(`user:${userId}`);
  });

  return io;
}

// Enviar notificação
io.to(`user:${userId}`).emit('notification', notification);
```

**Dependências**:
- T23.3 (Pub/Sub Base)

**Critérios de Aceite**:
- [ ] WebSockets ou SSE implementado
- [ ] Autenticação de conexões funcionando
- [ ] Envio de notificações em tempo real funcionando
- [ ] Testes de integração passando
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/config/socket.ts`
- `src/middleware/socket-auth.ts`

---

### SPRINT 24: Notifications System - Finalização

---

#### T24.1 - Preferências de Usuário

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 5  
**Sprint**: 24  
**Estimativa**: 20 horas

**Descrição**:
Implementar sistema de preferências de notificação por usuário.

**Tarefas Específicas**:
1. Criar modelo `NotificationPreference`:
   - `userId`: number
   - `type`: string (tipo de notificação)
   - `enabled`: boolean
   - `channels`: string[] (email, push, in-app)
2. Criar `NotificationPreferenceService`
3. Criar endpoints para gerenciar preferências
4. Integrar com NotificationService para respeitar preferências
5. Testes unitários e de integração

**Dependências**:
- T23.1 (Notification Service)
- T23.2 (Modelo de Notificação)

**Critérios de Aceite**:
- [ ] Modelo de preferências criado
- [ ] Service de preferências funcionando
- [ ] Endpoints criados
- [ ] Preferências respeitadas ao criar notificações
- [ ] Testes passando

**Arquivos a Criar**:
- `src/models/NotificationPreference.ts`
- `src/application/services/NotificationPreferenceService.ts`
- `src/controllers/NotificationPreferenceController.ts`

---

#### T24.2 - Histórico de Notificações

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 5  
**Sprint**: 24  
**Estimativa**: 20 horas

**Descrição**:
Criar endpoints para consultar histórico de notificações do usuário.

**Tarefas Específicas**:
1. Criar `NotificationController`:
   - `GET /notifications`: Listar notificações do usuário
   - `GET /notifications/:id`: Obter notificação específica
   - `PUT /notifications/:id/read`: Marcar como lida
   - `PUT /notifications/read-all`: Marcar todas como lidas
2. Implementar paginação
3. Implementar filtros:
   - Por tipo
   - Por status (lida/não lida)
   - Por data
4. Testes de integração

**Dependências**:
- T23.1 (Notification Service)
- T23.2 (Modelo de Notificação)

**Critérios de Aceite**:
- [ ] Endpoints criados e funcionando
- [ ] Paginação implementada
- [ ] Filtros funcionando
- [ ] Marcação como lida funcionando
- [ ] Testes de integração passando

**Arquivos a Criar**:
- `src/controllers/NotificationController.ts`
- `src/routes/notification.routes.ts`

---

#### T24.3 - Integração com Application Services

**Tipo**: Task  
**Prioridade**: P2  
**Story Points**: 5  
**Sprint**: 24  
**Estimativa**: 20 horas

**Descrição**:
Integrar notificações com Application Services para notificar em eventos importantes.

**Tarefas Específicas**:
1. Identificar eventos importantes:
   - Criação de eventos
   - Lembretes próximos
   - Mudanças financeiras importantes
   - Atualizações de permissões
2. Integrar NotificationService nos Application Services
3. Criar notificações automaticamente nos eventos
4. Integrar com Background Jobs para notificações agendadas
5. Testes de integração

**Dependências**:
- T23.1 (Notification Service)
- T7.3, T8.1, T8.2, T8.3, T9.1, T9.2 (Application Services)
- T21.3 (Workers Base)

**Critérios de Aceite**:
- [ ] Notificações criadas em eventos importantes
- [ ] Integração com Application Services funcionando
- [ ] Integração com Background Jobs funcionando
- [ ] Testes de integração passando

**Arquivos a Modificar**:
- Application Services relevantes

---

#### T24.4 - Documentação

**Tipo**: Documentation  
**Prioridade**: P2  
**Story Points**: 3  
**Sprint**: 24  
**Estimativa**: 12 horas

**Descrição**:
Criar documentação completa sobre sistema de notificações.

**Tarefas Específicas**:
1. Documentar sistema de notificações
2. Criar exemplos práticos
3. Documentar tipos de notificações
4. Guia de uso para desenvolvedores
5. Guia de uso para usuários finais

**Critérios de Aceite**:
- [ ] Documentação completa criada
- [ ] Exemplos práticos incluídos
- [ ] Guias de uso criados
- [ ] Documentação revisada

---

## RESUMO DA FASE 5

### Objetivos Alcançados

- ✅ Sistema de internacionalização (i18n) implementado
- ✅ Geração automática de documentação API (Swagger)
- ✅ Gerador de SDK TypeScript
- ✅ Sistema de filas e workers (Background Jobs)
- ✅ Sistema de notificações em tempo real
- ✅ Funcionalidades avançadas para melhorar experiência do desenvolvedor e usuário

### Métricas Esperadas

- **Cobertura de Idiomas**: pt-BR e en-US completos
- **Documentação API**: 100% dos endpoints documentados automaticamente
- **Jobs Processados**: Suporte a processamento assíncrono de tarefas pesadas
- **Notificações em Tempo Real**: < 1 segundo de latência
- **Satisfação do Desenvolvedor**: Melhoria significativa com SDK gerado

### Próximos Passos

Após conclusão da Fase 5:
- **Manutenção Contínua**: Atualizar traduções, documentação e jobs conforme necessário
- **Expansão**: Adicionar mais idiomas, tipos de notificações e jobs conforme demanda
- **Otimizações**: Melhorar performance baseado em métricas coletadas

### Considerações Importantes

1. **Localization**:
   - Manter traduções atualizadas
   - Adicionar novos idiomas conforme necessidade
   - Validar traduções com falantes nativos

2. **Dynamic API**:
   - Manter metadados atualizados
   - Regenerar SDK quando houver mudanças na API
   - Atualizar documentação Swagger regularmente

3. **Background Jobs**:
   - Monitorar filas regularmente
   - Ajustar retries e timeouts conforme necessário
   - Manter dead letter queue limpa

4. **Notifications**:
   - Respeitar preferências do usuário
   - Não sobrecarregar usuários com notificações
   - Monitorar taxa de abertura/leitura

---

**Última Atualização**: [Data]  
**Versão**: 1.0  
**Mantido por**: Tech Lead / Arquitetura
