# Tarefas Detalhadas para Desenvolvedores

## Formato de Ticket

Cada tarefa abaixo pode ser copiada diretamente para criação de tickets em ferramentas de gestão (Jira, Trello, GitHub Issues, etc.).

**Template de Ticket**:
- **Título**: [ID] - [Nome da Tarefa]
- **Tipo**: Task/Feature/Bug
- **Prioridade**: P0/P1/P2/P3
- **Story Points**: X
- **Sprint**: X
- **Descrição**: [Conteúdo abaixo]
- **Critérios de Aceite**: [Lista abaixo]
- **Dependências**: [Listadas abaixo]

---

## FASE 1: FUNDAÇÃO E INFRAESTRUTURA CORE

### SPRINT 1: Setup e Dependency Injection Base

---

#### T1.1 - Setup do Container de DI

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 1  
**Estimativa**: 20 horas

**Descrição**:
Implementar container de Dependency Injection usando TSyringe para gerenciar dependências do sistema. Esta é a base fundamental para todas as outras features arquiteturais.

**Contexto Técnico**:
- O projeto atualmente não utiliza DI, dificultando testes e manutenção
- TSyringe é recomendado por ser leve, performático e compatível com TypeScript
- Necessário criar estrutura de módulos para organização

**Tarefas Específicas**:
1. Pesquisar e comparar bibliotecas de DI (TSyringe, InversifyJS, TypeDI)
2. Escolher TSyringe como solução padrão
3. Instalar dependência: `npm install tsyringe reflect-metadata`
4. Configurar `tsconfig.json` para habilitar decorators:
   ```json
   {
     "compilerOptions": {
       "experimentalDecorators": true,
       "emitDecoratorMetadata": true
     }
   }
   ```
5. Criar estrutura de pastas:
   ```
   src/
     core/
       di/
         container.ts
         types.ts
         decorators.ts
   ```
6. Configurar container base em `src/core/di/container.ts`
7. Criar arquivo de inicialização do container
8. Documentar decisão arquitetural em ADR (Architecture Decision Record)

**Código de Referência**:
```typescript
// src/core/di/container.ts
import { container } from 'tsyringe';
import 'reflect-metadata';

// Registrar serviços base
// container.registerSingleton<ILogger>(TYPES.Logger, Logger);

export { container };
```

**Dependências**:
- Nenhuma (tarefa inicial)

**Critérios de Aceite**:
- [ ] TSyringe instalado e configurado
- [ ] Container criado e funcionando
- [ ] Estrutura de pastas criada conforme especificado
- [ ] `tsconfig.json` configurado corretamente
- [ ] ADR criado documentando a decisão
- [ ] Teste básico de injeção funcionando
- [ ] Documentação de setup criada

**Referências**:
- [TSyringe Documentation](https://github.com/microsoft/tsyringe)
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)

---

#### T1.2 - Decorators de Injeção

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 3  
**Sprint**: 1  
**Estimativa**: 12 horas

**Descrição**:
Criar decorators customizados para facilitar a injeção de dependências e padronizar o uso no projeto.

**Contexto Técnico**:
- TSyringe já fornece decorators básicos (@injectable, @inject)
- Criar wrappers customizados para padronizar uso
- Facilitar resolução de dependências

**Tarefas Específicas**:
1. Criar decorator `@Injectable()` customizado
2. Criar decorator `@Inject()` customizado
3. Implementar resolução automática de dependências
4. Criar tipos para tokens de injeção
5. Escrever testes unitários para decorators
6. Documentar uso dos decorators

**Código de Referência**:
```typescript
// src/core/di/decorators.ts
import { injectable as tsyringeInjectable, inject as tsyringeInject } from 'tsyringe';

export function Injectable(scope?: 'singleton' | 'transient') {
  return function (target: any) {
    tsyringeInjectable()(target);
    // Lógica adicional se necessário
  };
}

export function Inject(token: string | symbol) {
  return tsyringeInject(token);
}
```

**Dependências**:
- T1.1 (Setup do Container de DI)

**Critérios de Aceite**:
- [ ] Decorators `@Injectable` e `@Inject` criados
- [ ] Decorators funcionando corretamente
- [ ] Testes unitários escritos e passando (>80% cobertura)
- [ ] Documentação de uso criada
- [ ] Exemplos práticos documentados

**Referências**:
- [TSyringe Decorators](https://github.com/microsoft/tsyringe#decorators)

---

#### T1.3 - Refatoração de Controllers para DI

**Tipo**: Refactoring  
**Prioridade**: P0  
**Story Points**: 8  
**Sprint**: 1  
**Estimativa**: 32 horas

**Descrição**:
Refatorar todos os controllers existentes para utilizar Dependency Injection, removendo instanciações diretas e melhorando testabilidade.

**Contexto Técnico**:
- Controllers atuais instanciam dependências diretamente
- Necessário criar interfaces para controllers
- Refatorar: AuthController, UsuarioController, EventoController, FinanceiroController, LembreteController, LocalController

**Tarefas Específicas**:
1. Criar interfaces para cada controller:
   ```typescript
   // src/controllers/interfaces/IAuthController.ts
   export interface IAuthController {
     authenticate(req: Request, res: Response): Promise<void>;
     refresh(req: Request, res: Response): Promise<void>;
   }
   ```
2. Refatorar AuthController:
   - Adicionar `@Injectable()` decorator
   - Injetar dependências via constructor
   - Implementar interface IAuthController
3. Refatorar UsuarioController (mesmo processo)
4. Refatorar EventoController (mesmo processo)
5. Refatorar FinanceiroController (mesmo processo)
6. Refatorar LembreteController (mesmo processo)
7. Refatorar LocalController (mesmo processo)
8. Atualizar rotas para usar container.resolve()
9. Escrever testes de integração
10. Validar que API continua funcionando

**Código de Referência**:
```typescript
// Antes
class AuthController {
  async authenticate(req: Request, res: Response) {
    const user = await Usuario.findOne({ where: { username: email } });
    // ...
  }
}

// Depois
@Injectable()
class AuthController implements IAuthController {
  constructor(
    @Inject('IUsuarioRepository') private usuarioRepository: IUsuarioRepository
  ) {}

  async authenticate(req: Request, res: Response) {
    const user = await this.usuarioRepository.findByUsername(email);
    // ...
  }
}
```

**Dependências**:
- T1.1 (Setup do Container de DI)
- T1.2 (Decorators de Injeção)

**Critérios de Aceite**:
- [ ] Interfaces criadas para todos os controllers
- [ ] Todos os controllers refatorados para usar DI
- [ ] Decorators `@Injectable` aplicados
- [ ] Dependências injetadas via constructor
- [ ] Rotas atualizadas para usar container
- [ ] Testes de integração passando
- [ ] API funcionando corretamente (testes manuais)
- [ ] Nenhuma regressão identificada

**Arquivos Afetados**:
- `src/controllers/AuthController.ts`
- `src/controllers/UsuarioController.ts`
- `src/controllers/EventoController.ts`
- `src/controllers/FinanceiroController.ts`
- `src/controllers/LembreteController.ts`
- `src/controllers/LocalController.ts`
- `src/routes/*.routes.ts`

---

#### T1.4 - Documentação de DI

**Tipo**: Documentation  
**Prioridade**: P1  
**Story Points**: 2  
**Sprint**: 1  
**Estimativa**: 8 horas

**Descrição**:
Criar documentação completa sobre o uso de Dependency Injection no projeto.

**Tarefas Específicas**:
1. Criar guia de uso de DI
2. Documentar padrões e convenções
3. Criar exemplos práticos
4. Documentar resolução de problemas comuns
5. Criar diagramas de dependências (opcional)

**Critérios de Aceite**:
- [ ] Guia de uso criado em `docs/dependency-injection.md`
- [ ] Padrões e convenções documentados
- [ ] Pelo menos 3 exemplos práticos
- [ ] Troubleshooting guide criado
- [ ] Documentação revisada e aprovada

---

### SPRINT 2: Exception Handling e Logging Base

---

#### T2.1 - Classes de Exceção Customizadas

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 2  
**Estimativa**: 20 horas

**Descrição**:
Criar hierarquia de exceções customizadas para padronizar tratamento de erros no sistema.

**Contexto Técnico**:
- Atualmente o sistema usa exceções genéricas do JavaScript
- Necessário criar exceções específicas para diferentes cenários
- Hierarquia: BaseException -> BusinessException, ValidationException, etc.

**Tarefas Específicas**:
1. Criar `BaseException` em `src/core/exceptions/BaseException.ts`:
   ```typescript
   export abstract class BaseException extends Error {
     constructor(
       message: string,
       public statusCode: number,
       public code: string
     ) {
       super(message);
       this.name = this.constructor.name;
       Error.captureStackTrace(this, this.constructor);
     }
   }
   ```
2. Criar `BusinessException` estendendo BaseException
3. Criar `ValidationException` estendendo BaseException
4. Criar `NotFoundException` estendendo BaseException
5. Criar `UnauthorizedException` estendendo BaseException
6. Criar `ForbiddenException` estendendo BaseException
7. Escrever testes unitários para cada exceção
8. Documentar quando usar cada exceção

**Código de Referência**:
```typescript
// src/core/exceptions/BusinessException.ts
export class BusinessException extends BaseException {
  constructor(message: string, code?: string) {
    super(message, 400, code || 'BUSINESS_ERROR');
  }
}

// src/core/exceptions/NotFoundException.ts
export class NotFoundException extends BaseException {
  constructor(resource: string, id?: string | number) {
    super(
      `${resource}${id ? ` com id ${id}` : ''} não encontrado`,
      404,
      'NOT_FOUND'
    );
  }
}
```

**Dependências**:
- Nenhuma

**Critérios de Aceite**:
- [ ] BaseException criada e funcionando
- [ ] Todas as exceções customizadas criadas
- [ ] Hierarquia de herança correta
- [ ] Cada exceção tem statusCode e code apropriados
- [ ] Testes unitários escritos e passando (>80% cobertura)
- [ ] Documentação de uso criada
- [ ] Exemplos de uso documentados

**Arquivos a Criar**:
- `src/core/exceptions/BaseException.ts`
- `src/core/exceptions/BusinessException.ts`
- `src/core/exceptions/ValidationException.ts`
- `src/core/exceptions/NotFoundException.ts`
- `src/core/exceptions/UnauthorizedException.ts`
- `src/core/exceptions/ForbiddenException.ts`
- `src/core/exceptions/index.ts`

---

#### T2.2 - ErrorHandler Middleware

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 2  
**Estimativa**: 20 horas

**Descrição**:
Criar middleware global para captura e tratamento padronizado de exceções, garantindo respostas consistentes.

**Contexto Técnico**:
- Express precisa de middleware de erro com assinatura específica: `(err, req, res, next)`
- Deve capturar todas as exceções não tratadas
- Formato padronizado de resposta de erro

**Tarefas Específicas**:
1. Criar `ErrorHandlerMiddleware` em `src/middleware/errorHandler.ts`
2. Implementar captura de exceções customizadas
3. Mapear exceções para códigos HTTP apropriados
4. Formatar resposta padronizada:
   ```typescript
   {
     success: false,
     error: {
       code: string,
       message: string,
       details?: any
     },
     timestamp: string,
     path: string
   }
   ```
5. Tratar exceções não conhecidas (500)
6. Integrar com Logger para logar erros
7. Adicionar middleware ao Express app
8. Escrever testes de integração

**Código de Referência**:
```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { BaseException } from '../core/exceptions';
import { Logger } from '../core/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const logger = container.resolve<ILogger>('ILogger');
  
  if (err instanceof BaseException) {
    logger.warn('Business error', { error: err, path: req.path });
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  // Erro não tratado
  logger.error('Unhandled error', { error: err, path: req.path });
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor'
    },
    timestamp: new Date().toISOString(),
    path: req.path
  });
};
```

**Dependências**:
- T2.1 (Classes de Exceção Customizadas)
- T2.3 (Logger Service Base) - pode ser feito em paralelo

**Critérios de Aceite**:
- [ ] Middleware criado e funcionando
- [ ] Captura todas as exceções não tratadas
- [ ] Mapeia exceções para códigos HTTP corretos
- [ ] Resposta padronizada implementada
- [ ] Integrado com Logger
- [ ] Adicionado ao Express app
- [ ] Testes de integração passando
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/middleware/errorHandler.ts`

**Arquivos a Modificar**:
- `src/app.ts` (adicionar middleware)

---

#### T2.3 - Logger Service Base

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 2  
**Estimativa**: 20 horas

**Descrição**:
Implementar serviço de logging estruturado usando Pino para logs em formato JSON.

**Contexto Técnico**:
- Pino é uma biblioteca de logging rápida e eficiente
- Logs em formato JSON facilitam parsing e análise
- Necessário integrar com DI

**Tarefas Específicas**:
1. Instalar Pino: `npm install pino pino-pretty`
2. Criar interface `ILogger`:
   ```typescript
   export interface ILogger {
     debug(message: string, meta?: any): void;
     info(message: string, meta?: any): void;
     warn(message: string, meta?: any): void;
     error(message: string, meta?: any): void;
   }
   ```
3. Implementar `LoggerService` usando Pino
4. Configurar níveis de log (debug, info, warn, error)
5. Configurar formatação JSON
6. Configurar por ambiente (pretty print em dev, JSON em prod)
7. Integrar com DI container
8. Escrever testes unitários

**Código de Referência**:
```typescript
// src/core/logger/ILogger.ts
export interface ILogger {
  debug(message: string, meta?: Record<string, any>): void;
  info(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  error(message: string, meta?: Record<string, any>): void;
}

// src/core/logger/LoggerService.ts
import pino from 'pino';
import { injectable } from 'tsyringe';
import { ILogger } from './ILogger';

@injectable()
export class LoggerService implements ILogger {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development' 
        ? { target: 'pino-pretty' }
        : undefined
    });
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(meta, message);
  }

  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(meta, message);
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(meta, message);
  }

  error(message: string, meta?: Record<string, any>): void {
    this.logger.error(meta, message);
  }
}
```

**Dependências**:
- T1.1 (Setup do Container de DI)

**Critérios de Aceite**:
- [ ] Pino instalado e configurado
- [ ] Interface ILogger criada
- [ ] LoggerService implementado
- [ ] Níveis de log funcionando
- [ ] Formatação JSON em produção
- [ ] Pretty print em desenvolvimento
- [ ] Integrado com DI
- [ ] Testes unitários passando
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/core/logger/ILogger.ts`
- `src/core/logger/LoggerService.ts`
- `src/core/logger/index.ts`

---

#### T2.4 - Contexto de Requisição

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 3  
**Sprint**: 2  
**Estimativa**: 12 horas

**Descrição**:
Criar sistema de contexto de requisição para rastrear informações como requestId e userId em toda a requisição.

**Contexto Técnico**:
- Necessário para rastreabilidade e debugging
- RequestId único por requisição
- UserId extraído do token JWT
- Contexto disponível via DI

**Tarefas Específicas**:
1. Criar `RequestContext` service:
   ```typescript
   export class RequestContext {
     private requestId: string;
     private userId?: number;
     
     setRequestId(id: string): void;
     getRequestId(): string;
     setUserId(id: number): void;
     getUserId(): number | undefined;
   }
   ```
2. Criar middleware para gerar requestId (UUID)
3. Criar middleware para extrair userId do token
4. Integrar RequestContext com Logger
5. Garantir que contexto está disponível via DI (scoped)
6. Escrever testes

**Código de Referência**:
```typescript
// src/core/context/RequestContext.ts
import { injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class RequestContext {
  private requestId: string;
  private userId?: number;

  constructor() {
    this.requestId = uuidv4();
  }

  setRequestId(id: string): void {
    this.requestId = id;
  }

  getRequestId(): string {
    return this.requestId;
  }

  setUserId(id: number): void {
    this.userId = id;
  }

  getUserId(): number | undefined {
    return this.userId;
  }
}

// src/middleware/requestContext.ts
export const requestContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const context = container.resolve<RequestContext>('RequestContext');
  context.setRequestId(uuidv4());
  
  if ((req as any).userId) {
    context.setUserId((req as any).userId);
  }
  
  (req as any).context = context;
  next();
};
```

**Dependências**:
- T1.1 (Setup do Container de DI)
- T2.3 (Logger Service Base)

**Critérios de Aceite**:
- [ ] RequestContext service criado
- [ ] Middleware de requestId funcionando
- [ ] Middleware de userId funcionando
- [ ] Contexto disponível em todas as requisições
- [ ] Integrado com Logger
- [ ] Testes passando
- [ ] Documentação criada

---

### SPRINT 3: Logging Avançado e Validação Base

---

#### T3.1 - Logging Avançado

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 5  
**Sprint**: 3  
**Estimativa**: 20 horas

**Descrição**:
Aprimorar sistema de logging com recursos avançados como rotação de logs, métricas de performance e integração opcional com serviços externos.

**Tarefas Específicas**:
1. Configurar rotação de logs (usando pino-roll ou similar)
2. Implementar logs de performance (tempo de execução de requisições)
3. Adicionar logs de queries SQL (opcional, via Sequelize hooks)
4. Configurar integração com CloudWatch/Datadog (opcional)
5. Criar middleware de performance logging
6. Configurar por ambiente
7. Documentar configurações

**Código de Referência**:
```typescript
// src/middleware/performanceLogger.ts
export const performanceLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const logger = container.resolve<ILogger>('ILogger');
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });
  
  next();
};
```

**Dependências**:
- T2.3 (Logger Service Base)
- T2.4 (Contexto de Requisição)

**Critérios de Aceite**:
- [ ] Rotação de logs configurada
- [ ] Logs de performance funcionando
- [ ] Logs de SQL queries (opcional) funcionando
- [ ] Configuração por ambiente
- [ ] Documentação de configuração criada

---

#### T3.2 - Setup de Validação

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 3  
**Estimativa**: 20 horas

**Descrição**:
Configurar sistema de validação automática usando class-validator e class-transformer.

**Tarefas Específicas**:
1. Instalar dependências:
   ```bash
   npm install class-validator class-transformer
   npm install --save-dev @types/class-validator
   ```
2. Criar estrutura de DTOs: `src/application/dto/`
3. Criar DTOs base:
   ```typescript
   // src/application/dto/BaseDto.ts
   export abstract class BaseDto {}
   
   // src/application/dto/CreateDto.ts
   export abstract class CreateDto extends BaseDto {}
   
   // src/application/dto/UpdateDto.ts
   export abstract class UpdateDto extends BaseDto {}
   ```
4. Criar middleware de validação:
   ```typescript
   // src/middleware/validation.ts
   import { validate } from 'class-validator';
   import { plainToInstance } from 'class-transformer';
   
   export const validateDto = (dtoClass: any) => {
     return async (req: Request, res: Response, next: NextFunction) => {
       const dto = plainToInstance(dtoClass, req.body);
       const errors = await validate(dto);
       
       if (errors.length > 0) {
         throw new ValidationException(errors);
       }
       
       req.body = dto;
       next();
     };
   };
   ```
5. Integrar com Exception Handling
6. Documentar uso

**Dependências**:
- T2.1 (Classes de Exceção Customizadas)
- T2.2 (ErrorHandler Middleware)

**Critérios de Aceite**:
- [ ] class-validator e class-transformer instalados
- [ ] Estrutura de DTOs criada
- [ ] DTOs base criados
- [ ] Middleware de validação funcionando
- [ ] Integrado com Exception Handling
- [ ] Documentação criada

---

#### T3.3 - DTOs de Autenticação

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 3  
**Sprint**: 3  
**Estimativa**: 12 horas

**Descrição**:
Criar DTOs de validação para endpoints de autenticação.

**Tarefas Específicas**:
1. Criar `CreateLoginDto`:
   ```typescript
   import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
   
   export class CreateLoginDto {
     @IsEmail({}, { message: 'Email deve ser um email válido' })
     @IsNotEmpty({ message: 'Email é obrigatório' })
     email: string;
     
     @IsString({ message: 'Senha deve ser uma string' })
     @IsNotEmpty({ message: 'Senha é obrigatória' })
     @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
     senha: string;
   }
   ```
2. Criar `RefreshTokenDto`
3. Criar `AuthResponseDto`
4. Atualizar AuthController para usar DTOs
5. Escrever testes de validação

**Dependências**:
- T3.2 (Setup de Validação)

**Critérios de Aceite**:
- [ ] CreateLoginDto criado e validado
- [ ] RefreshTokenDto criado e validado
- [ ] AuthResponseDto criado
- [ ] AuthController atualizado
- [ ] Testes de validação passando
- [ ] Mensagens de erro em português

---

#### T3.4 - DTOs de Usuário

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 3  
**Estimativa**: 20 horas

**Descrição**:
Criar DTOs completos para operações de usuário com validações customizadas.

**Tarefas Específicas**:
1. Criar `CreateUsuarioDto` com todas as validações
2. Criar `UpdateUsuarioDto` (campos opcionais)
3. Criar `UsuarioResponseDto` (sem senha)
4. Implementar validação customizada para email único
5. Implementar validação customizada para username único
6. Atualizar UsuarioController
7. Escrever testes

**Código de Referência**:
```typescript
// src/application/dto/usuario/CreateUsuarioDto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { IsUnique } from '../../validators/IsUnique';

export class CreateUsuarioDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @IsEmail({}, { message: 'Email deve ser um email válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsUnique('Usuario', 'email', { message: 'Email já está em uso' })
  email: string;

  @IsString({ message: 'Username deve ser uma string' })
  @IsNotEmpty({ message: 'Username é obrigatório' })
  @IsUnique('Usuario', 'username', { message: 'Username já está em uso' })
  username: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
  })
  senha: string;
}
```

**Dependências**:
- T3.2 (Setup de Validação)

**Critérios de Aceite**:
- [ ] CreateUsuarioDto criado com todas as validações
- [ ] UpdateUsuarioDto criado
- [ ] UsuarioResponseDto criado
- [ ] Validações customizadas funcionando
- [ ] UsuarioController atualizado
- [ ] Testes passando
- [ ] Mensagens em português

---

### SPRINT 4: Validação Completa

---

#### T4.1 - DTOs de Evento

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 3  
**Sprint**: 4  
**Estimativa**: 12 horas

**Descrição**:
Criar DTOs de validação para entidade Evento.

**Tarefas Específicas**:
1. Analisar modelo Evento atual
2. Criar `CreateEventoDto` com validações apropriadas
3. Criar `UpdateEventoDto`
4. Criar `EventoResponseDto`
5. Implementar validações customizadas (datas, relacionamentos)
6. Atualizar EventoController
7. Testes

**Dependências**:
- T3.2 (Setup de Validação)

**Critérios de Aceite**:
- [ ] DTOs criados e validados
- [ ] Validações customizadas funcionando
- [ ] Controller atualizado
- [ ] Testes passando

---

#### T4.2 - DTOs de Financeiro

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 3  
**Sprint**: 4  
**Estimativa**: 12 horas

**Descrição**:
Criar DTOs de validação para entidade Financeiro.

**Tarefas Específicas**:
1. Analisar modelo Financeiro atual
2. Criar `CreateFinanceiroDto` com validações (valores, datas, tipos)
3. Criar `UpdateFinanceiroDto`
4. Criar `FinanceiroResponseDto`
5. Validações customizadas (valores positivos/negativos conforme tipo)
6. Atualizar FinanceiroController
7. Testes

**Dependências**:
- T3.2 (Setup de Validação)

**Critérios de Aceite**:
- [ ] DTOs criados e validados
- [ ] Validações de negócio funcionando
- [ ] Controller atualizado
- [ ] Testes passando

---

#### T4.3 - DTOs de Lembrete

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 3  
**Sprint**: 4  
**Estimativa**: 12 horas

**Descrição**:
Criar DTOs de validação para entidade Lembrete.

**Tarefas Específicas**:
1. Analisar modelo Lembrete atual
2. Criar `CreateLembreteDto`
3. Criar `UpdateLembreteDto`
4. Criar `LembreteResponseDto`
5. Validações de datas e horários
6. Atualizar LembreteController
7. Testes

**Dependências**:
- T3.2 (Setup de Validação)

**Critérios de Aceite**:
- [ ] DTOs criados e validados
- [ ] Validações funcionando
- [ ] Controller atualizado
- [ ] Testes passando

---

#### T4.4 - DTOs de Local

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 3  
**Sprint**: 4  
**Estimativa**: 12 horas

**Descrição**:
Criar DTOs de validação para entidade Local.

**Tarefas Específicas**:
1. Analisar modelo Local atual
2. Criar `CreateLocalDto`
3. Criar `UpdateLocalDto`
4. Criar `LocalResponseDto`
5. Validações apropriadas
6. Atualizar LocalController
7. Testes

**Dependências**:
- T3.2 (Setup de Validação)

**Critérios de Aceite**:
- [ ] DTOs criados e validados
- [ ] Controller atualizado
- [ ] Testes passando

---

#### T4.5 - DTOs de Roles e Permissões

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 3  
**Sprint**: 4  
**Estimativa**: 12 horas

**Descrição**:
Criar DTOs de validação para Roles e Permissões.

**Tarefas Específicas**:
1. Criar `CreateRoleDto`, `UpdateRoleDto`, `RoleResponseDto`
2. Criar `CreatePermissaoDto`, `UpdatePermissaoDto`, `PermissaoResponseDto`
3. Criar DTOs de relacionamentos (RoleHasPermissao, UsuarioHasRole)
4. Validações apropriadas
5. Atualizar controllers
6. Testes

**Dependências**:
- T3.2 (Setup de Validação)

**Critérios de Aceite**:
- [ ] Todos os DTOs criados
- [ ] Controllers atualizados
- [ ] Testes passando

---

#### T4.6 - Refatoração de Controllers para DTOs

**Tipo**: Refactoring  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 4  
**Estimativa**: 20 horas

**Descrição**:
Refatorar todos os controllers para usar DTOs e remover validações manuais.

**Tarefas Específicas**:
1. Atualizar todas as rotas para usar middleware de validação
2. Remover validações manuais dos controllers
3. Atualizar tipos de Request para usar DTOs
4. Testes de integração completos
5. Validar que todas as validações estão funcionando

**Dependências**:
- T4.1 a T4.5 (Todos os DTOs)

**Critérios de Aceite**:
- [ ] Todos os controllers usando DTOs
- [ ] Validações manuais removidas
- [ ] Testes de integração passando
- [ ] Nenhuma regressão

---

#### T4.7 - Validações Customizadas Complexas

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 3  
**Sprint**: 4  
**Estimativa**: 12 horas

**Descrição**:
Implementar validações customizadas complexas (cross-field, regras de negócio).

**Tarefas Específicas**:
1. Criar validador `@IsUnique` para campos únicos
2. Criar validador `@IsDateAfter` para validação de datas
3. Criar validador `@IsValidEnum` para enums
4. Criar validações cross-field (ex: data fim > data início)
5. Documentar uso

**Código de Referência**:
```typescript
// src/application/validators/IsUnique.ts
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsUnique(tableName: string, columnName: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isUnique',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [tableName, columnName],
      options: validationOptions,
      validator: {
        async validate(value: any, args: ValidationArguments) {
          // Implementar verificação no banco
          return true; // placeholder
        }
      }
    });
  };
}
```

**Dependências**:
- T3.2 (Setup de Validação)

**Critérios de Aceite**:
- [ ] Validadores customizados criados
- [ ] Validações cross-field funcionando
- [ ] Documentação criada
- [ ] Testes passando

---

## NOTAS IMPORTANTES PARA DESENVOLVEDORES

### Padrões de Código

1. **Nomenclatura**:
   - Interfaces: `I` prefix (ex: `ILogger`)
   - Classes: PascalCase (ex: `LoggerService`)
   - Arquivos: PascalCase para classes, camelCase para utilitários

2. **Estrutura de Pastas**:
   ```
   src/
     core/           # Infraestrutura core
     application/    # Lógica de aplicação (DTOs, Services)
     domain/         # Entidades de domínio (futuro)
     infrastructure/ # Implementações técnicas (futuro)
     controllers/    # Controllers HTTP
     routes/         # Definição de rotas
     middleware/     # Middlewares
     models/         # Modelos Sequelize
   ```

3. **Testes**:
   - Cobertura mínima: 80%
   - Testes unitários: `*.spec.ts`
   - Testes de integração: `*.integration.test.ts`

4. **Commits**:
   - Formato: `[T1.1] Descrição da mudança`
   - Exemplo: `[T1.1] Setup do container de DI com TSyringe`

### Checklist Antes de Finalizar Tarefa

- [ ] Código implementado
- [ ] Testes escritos e passando
- [ ] Cobertura de testes > 80%
- [ ] Code review solicitado
- [ ] Documentação atualizada
- [ ] Sem warnings do linter
- [ ] Integração com CI/CD funcionando
- [ ] Testes manuais realizados (quando aplicável)

### Dúvidas e Suporte

Em caso de dúvidas sobre qualquer tarefa:
1. Consultar documentação do projeto
2. Revisar ADRs (Architecture Decision Records)
3. Consultar com tech lead
4. Abrir discussão no canal do time

---

## RESUMO DAS FASES RESTANTES

### FASE 2: ARQUITETURA E PADRÕES (Sprints 5-10)

#### Sprint 5: Repository Pattern - Base
- **T5.1** - Interface IRepository (5 SP): Criar interface genérica com métodos CRUD e paginação
- **T5.2** - BaseRepository (8 SP): Implementar repositório base abstrato com Sequelize
- **T5.3** - UsuarioRepository (5 SP): Criar repositório específico com métodos customizados
- **T5.4** - Refatoração de AuthController (3 SP): Usar repositório ao invés de acesso direto

#### Sprint 6: Repository Pattern - Entidades Principais
- **T6.1-T6.5** - Repositórios para Evento, Financeiro, Lembrete, Local, Roles/Permissões (3-5 SP cada)
- **T6.6** - Refatoração de Controllers (8 SP): Atualizar todos os controllers para usar repositórios

#### Sprint 7: Application Services - Estrutura Base
- **T7.1** - Estrutura de Application Services (5 SP): Criar estrutura e interfaces base
- **T7.2** - Mapeamento DTOs-Entidades (5 SP): Criar mappers para conversão
- **T7.3** - UsuarioApplicationService (8 SP): Implementar service completo com CRUD
- **T7.4** - Refatoração de UsuarioController (3 SP): Usar Application Service

#### Sprint 8: Application Services - Entidades Principais
- **T8.1** - EventoApplicationService (8 SP)
- **T8.2** - FinanceiroApplicationService (8 SP)
- **T8.3** - LembreteApplicationService (5 SP)
- **T8.4** - Refatoração de Controllers (5 SP)

#### Sprint 9: Application Services - Finalização
- **T9.1** - LocalApplicationService (5 SP)
- **T9.2** - RoleApplicationService e PermissaoApplicationService (8 SP)
- **T9.3** - Refatoração Final de Controllers (5 SP)
- **T9.4** - Documentação (3 SP)

#### Sprint 10: Unit of Work
- **T10.1** - UnitOfWork Service (8 SP): Implementar gerenciamento de transações
- **T10.2** - Decorator de Transação (5 SP): Criar @Transactional decorator
- **T10.3** - Integração com Application Services (5 SP): Aplicar transações
- **T10.4** - Documentação (2 SP)

**Padrão para Application Services**:
```typescript
@Injectable()
export class UsuarioApplicationService {
  constructor(
    @Inject('IUsuarioRepository') private repository: IUsuarioRepository,
    @Inject('IUnitOfWork') private unitOfWork: IUnitOfWork
  ) {}

  async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    return await this.unitOfWork.execute(async () => {
      const entity = UsuarioMapper.toEntity(dto);
      const created = await this.repository.create(entity);
      return UsuarioMapper.toDto(created);
    });
  }
}
```

---

### FASE 3: SEGURANÇA E AUDITORIA (Sprints 11-14)

#### Sprint 11: Authorization Declarativa - Base
- **T11.1** - Decorators de Autorização (8 SP): @RequirePermission, @RequireRole
- **T11.2** - Authorization Middleware (5 SP): Middleware de verificação
- **T11.3** - Authorization Service (5 SP): Lógica de verificação de permissões
- **T11.4** - Integração com Application Services (3 SP)

**Padrão de Autorização**:
```typescript
@RequirePermission('usuario.create')
async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
  // ...
}
```

#### Sprint 12: Authorization Declarativa - Finalização
- **T12.1** - Políticas Customizadas (5 SP)
- **T12.2** - Refatoração de Rotas (5 SP)
- **T12.3** - Documentação (3 SP)
- **T12.4** - Otimizações (3 SP)

#### Sprint 13: Audit Logging - Base
- **T13.1** - Entidade AuditLog (5 SP): Modelo e migration
- **T13.2** - AuditService (8 SP): Métodos de registro
- **T13.3** - Interceptor de Auditoria (5 SP): Captura automática
- **T13.4** - Integração Inicial (3 SP)

#### Sprint 14: Audit Logging - Finalização
- **T14.1** - Auditoria Completa (5 SP)
- **T14.2** - AuditLogRepository e Service de Consulta (8 SP)
- **T14.3** - Endpoint de Consulta (5 SP)
- **T14.4** - Retenção e Limpeza (3 SP)

---

### FASE 4: PERFORMANCE E ESCALABILIDADE (Sprints 15-18)

#### Sprint 15: Caching - Base
- **T15.1** - Setup Redis (3 SP): Configuração e conexão
- **T15.2** - Decorators de Cache (8 SP): @Cacheable, @CacheEvict, @CachePut
- **T15.3** - Cache no Repository (5 SP): Cache de queries
- **T15.4** - Cache em Application Services (5 SP)

**Padrão de Cache**:
```typescript
@Cacheable('usuario', 3600) // TTL em segundos
async findById(id: number): Promise<UsuarioResponseDto> {
  // ...
}

@CacheEvict('usuario')
async update(id: number, dto: UpdateUsuarioDto): Promise<UsuarioResponseDto> {
  // ...
}
```

#### Sprint 16: Caching - Avançado
- **T16.1** - Estratégias de Invalidação (5 SP)
- **T16.2** - Cache Distribuído (5 SP)
- **T16.3** - Monitoramento (3 SP)
- **T16.4** - Otimizações (3 SP)

#### Sprint 17: Multi Tenancy - Análise e Planejamento
- **T17.1** - Análise de Dados (8 SP): Mapear dados existentes
- **T17.2** - Estrutura de TenantId (5 SP): Adicionar campo em todas entidades
- **T17.3** - Tenant Service (5 SP): Identificação e validação
- **T17.4** - Middleware de Tenant (3 SP)

#### Sprint 18: Multi Tenancy - Implementação
- **T18.1** - Filtro Automático no Repository (8 SP): Isolamento de dados
- **T18.2** - Integração com Application Services (5 SP)
- **T18.3** - Migração de Dados (8 SP): Script de migração
- **T18.4** - Testes de Isolamento (3 SP)

**Padrão de Multi Tenancy**:
```typescript
// BaseRepository automaticamente filtra por tenantId
const entities = await repository.findAll(); // Apenas do tenant atual
```

---

### FASE 5: FUNCIONALIDADES AVANÇADAS (Sprints 19-24)

#### Sprint 19: Localization
- **T19.1** - Setup i18n (5 SP): Configuração básica
- **T19.2** - Integração com Validação (5 SP): Mensagens traduzidas
- **T19.3** - Integração com Exception Handling (3 SP)
- **T19.4** - Traduções Completas (5 SP)

#### Sprint 20: Dynamic API
- **T20.1** - Metadados de API (8 SP): Extração de metadados
- **T20.2** - OpenAPI/Swagger (5 SP): Documentação automática
- **T20.3** - Gerador de Client SDK (8 SP): SDK TypeScript

#### Sprint 21: Background Jobs - Base
- **T21.1** - Setup Bull/BullMQ (5 SP)
- **T21.2** - Queue Service (8 SP)
- **T21.3** - Workers Base (5 SP)
- **T21.4** - Jobs Agendados (5 SP)

#### Sprint 22: Background Jobs - Avançado
- **T22.1** - Retry e Dead Letter Queue (5 SP)
- **T22.2** - Monitoramento (5 SP)
- **T22.3** - Jobs de Exemplo (5 SP)
- **T22.4** - Documentação (3 SP)

#### Sprint 23: Notifications System - Base
- **T23.1** - Notification Service (8 SP)
- **T23.2** - Modelo de Notificação (3 SP)
- **T23.3** - Pub/Sub Base (8 SP)
- **T23.4** - WebSockets ou SSE (5 SP)

#### Sprint 24: Notifications System - Finalização
- **T24.1** - Preferências de Usuário (5 SP)
- **T24.2** - Histórico de Notificações (5 SP)
- **T24.3** - Integração com Application Services (5 SP)
- **T24.4** - Documentação (3 SP)

---

## TEMPLATE PARA CRIAÇÃO DE TICKETS

Use este template ao criar tickets em ferramentas de gestão:

```
**Título**: [T1.1] - Setup do Container de DI

**Tipo**: Task
**Prioridade**: P0
**Story Points**: 5
**Sprint**: 1
**Estimativa**: 20 horas

**Descrição**:
[Copiar descrição completa da tarefa]

**Contexto Técnico**:
[Copiar contexto técnico]

**Tarefas Específicas**:
[Copiar lista de tarefas]

**Código de Referência**:
[Copiar exemplos de código se houver]

**Dependências**:
- [Listar dependências]

**Critérios de Aceite**:
- [ ] [Copiar critérios]

**Arquivos Afetados**:
- [Listar arquivos]

**Referências**:
- [Links úteis]
```

---

**Última Atualização**: [Data]  
**Versão**: 1.0  
**Mantido por**: Tech Lead / Arquitetura
