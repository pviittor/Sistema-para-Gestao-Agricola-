# Tarefas Detalhadas - Fase 3: Segurança e Auditoria

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

## FASE 3: SEGURANÇA E AUDITORIA

### SPRINT 11: Authorization Declarativa - Base

---

#### T11.1 - Decorators de Autorização

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 8  
**Sprint**: 11  
**Estimativa**: 32 horas

**Descrição**:
Criar decorators declarativos para autorização, permitindo verificação automática de permissões e roles em métodos de Application Services.

**Contexto Técnico**:
- Sistema atual tem verificação manual de permissões
- Decorators permitem autorização declarativa e reutilizável
- Facilita manutenção e reduz código duplicado
- Integra com sistema de permissões existente

**Tarefas Específicas**:
1. Criar decorator `@RequirePermission(permission: string)`:
   - Verifica se usuário tem permissão específica
   - Lança ForbiddenException se não tiver
2. Criar decorator `@RequireRole(role: string | string[])`:
   - Verifica se usuário tem role específica
   - Suporta múltiplas roles (OR)
3. Criar decorator `@RequireAnyPermission(permissions: string[])`:
   - Verifica se usuário tem pelo menos uma das permissões
4. Criar decorator `@RequireAllPermissions(permissions: string[])`:
   - Verifica se usuário tem todas as permissões
5. Implementar interceptor que:
   - Captura chamada do método
   - Extrai permissões/roles do decorator
   - Verifica com AuthorizationService
   - Permite ou bloqueia execução
6. Escrever testes unitários

**Código de Referência**:
```typescript
// src/core/authorization/RequirePermission.ts
import { container } from 'tsyringe';
import { IAuthorizationService } from './IAuthorizationService';
import { ForbiddenException } from '../exceptions';

export function RequirePermission(permission: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const authService = container.resolve<IAuthorizationService>('IAuthorizationService');
      const userId = getCurrentUserId(); // Extrair do RequestContext

      const hasPermission = await authService.hasPermission(userId, permission);
      if (!hasPermission) {
        throw new ForbiddenException(`Permissão '${permission}' necessária`);
      }

      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Uso
@RequirePermission('usuario.create')
async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
  // ...
}
```

**Dependências**:
- T1.1 (Setup do Container de DI)
- T2.1 (Classes de Exceção Customizadas)
- T2.4 (Contexto de Requisição)

**Critérios de Aceite**:
- [ ] Decorator @RequirePermission criado e funcionando
- [ ] Decorator @RequireRole criado e funcionando
- [ ] Decorator @RequireAnyPermission criado e funcionando
- [ ] Decorator @RequireAllPermissions criado e funcionando
- [ ] Interceptor funcionando corretamente
- [ ] Testes unitários passando (>80% cobertura)
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/core/authorization/RequirePermission.ts`
- `src/core/authorization/RequireRole.ts`
- `src/core/authorization/RequireAnyPermission.ts`
- `src/core/authorization/RequireAllPermissions.ts`

---

#### T11.2 - Authorization Middleware

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 11  
**Estimativa**: 20 horas

**Descrição**:
Criar middleware de autorização para verificar permissões em nível de rota.

**Contexto Técnico**:
- Middleware complementa decorators
- Útil para rotas que não usam Application Services
- Verifica permissões antes de chegar ao controller
- Integra com sistema de autenticação existente

**Tarefas Específicas**:
1. Criar `authorizationMiddleware` em `src/middleware/authorization.ts`
2. Implementar verificação de permissões:
   - Extrair permissão necessária da rota
   - Verificar com AuthorizationService
   - Bloquear ou permitir requisição
3. Implementar verificação de roles
4. Integrar com authMiddleware existente
5. Tratamento de erros (ForbiddenException)
6. Testes de integração

**Código de Referência**:
```typescript
// src/middleware/authorization.ts
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { IAuthorizationService } from '../core/authorization/IAuthorizationService';
import { ForbiddenException } from '../core/exceptions';

export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authService = container.resolve<IAuthorizationService>('IAuthorizationService');
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const hasPermission = await authService.hasPermission(userId, permission);
    if (!hasPermission) {
      throw new ForbiddenException(`Permissão '${permission}' necessária`);
    }

    next();
  };
};

export const requireRole = (role: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authService = container.resolve<IAuthorizationService>('IAuthorizationService');
    const userId = (req as any).userId;

    const roles = Array.isArray(role) ? role : [role];
    const hasRole = await authService.hasAnyRole(userId, roles);
    
    if (!hasRole) {
      throw new ForbiddenException(`Role '${roles.join(' ou ')}' necessária`);
    }

    next();
  };
};
```

**Dependências**:
- T11.3 (Authorization Service)
- T2.1 (Classes de Exceção Customizadas)

**Critérios de Aceite**:
- [ ] Middleware de autorização criado
- [ ] Verificação de permissões funcionando
- [ ] Verificação de roles funcionando
- [ ] Integrado com authMiddleware
- [ ] Testes de integração passando
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/middleware/authorization.ts`

---

#### T11.3 - Authorization Service

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 11  
**Estimativa**: 20 horas

**Descrição**:
Criar serviço centralizado para verificação de permissões e roles.

**Contexto Técnico**:
- Centraliza lógica de autorização
- Integra com sistema de permissões existente (Role, Permissao, UsuarioHasRole, RoleHasPermissao)
- Cache opcional para melhorar performance
- Facilita testes e manutenção

**Tarefas Específicas**:
1. Criar interface `IAuthorizationService`:
   ```typescript
   export interface IAuthorizationService {
     hasPermission(userId: number, permission: string): Promise<boolean>;
     hasRole(userId: number, role: string): Promise<boolean>;
     hasAnyRole(userId: number, roles: string[]): Promise<boolean>;
     hasAllRoles(userId: number, roles: string[]): Promise<boolean>;
   }
   ```
2. Implementar `AuthorizationService`:
   - Buscar roles do usuário
   - Buscar permissões das roles
   - Verificar permissão específica
   - Verificar roles
3. Implementar cache de permissões (opcional):
   - Cachear permissões do usuário
   - Invalidar cache quando roles/permissões mudarem
4. Integrar com repositórios existentes
5. Integrar com DI container
6. Escrever testes unitários

**Código de Referência**:
```typescript
// src/core/authorization/IAuthorizationService.ts
export interface IAuthorizationService {
  hasPermission(userId: number, permission: string): Promise<boolean>;
  hasRole(userId: number, role: string): Promise<boolean>;
  hasAnyRole(userId: number, roles: string[]): Promise<boolean>;
  hasAllRoles(userId: number, roles: string[]): Promise<boolean>;
}

// src/application/services/AuthorizationService.ts
import { injectable, inject } from 'tsyringe';
import { IUsuarioRepository } from '../../infrastructure/repository/IUsuarioRepository';
import { IRoleRepository } from '../../infrastructure/repository/IRoleRepository';

@injectable()
export class AuthorizationService implements IAuthorizationService {
  constructor(
    @inject('IUsuarioRepository') private usuarioRepository: IUsuarioRepository,
    @inject('IRoleRepository') private roleRepository: IRoleRepository
  ) {}

  async hasPermission(userId: number, permission: string): Promise<boolean> {
    // Buscar roles do usuário
    const usuario = await this.usuarioRepository.findById(userId);
    if (!usuario) return false;

    // Buscar permissões das roles
    const roles = await this.roleRepository.findByUsuario(userId);
    for (const role of roles) {
      const permissions = await this.roleRepository.getPermissions(role.id);
      if (permissions.some(p => p.nome === permission)) {
        return true;
      }
    }

    return false;
  }

  async hasRole(userId: number, role: string): Promise<boolean> {
    const usuario = await this.usuarioRepository.findById(userId);
    if (!usuario) return false;

    const roles = await this.roleRepository.findByUsuario(userId);
    return roles.some(r => r.nome === role);
  }

  // Implementar outros métodos...
}
```

**Dependências**:
- T1.1 (Setup do Container de DI)
- T6.5 (RoleRepository e PermissaoRepository)

**Critérios de Aceite**:
- [ ] IAuthorizationService interface criada
- [ ] AuthorizationService implementado
- [ ] Métodos de verificação funcionando
- [ ] Cache de permissões implementado (opcional)
- [ ] Integrado com sistema existente
- [ ] Integrado com DI
- [ ] Testes unitários passando
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/core/authorization/IAuthorizationService.ts`
- `src/application/services/AuthorizationService.ts`
- `src/application/services/AuthorizationService.spec.ts`

---

#### T11.4 - Integração com Application Services

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 3  
**Sprint**: 11  
**Estimativa**: 12 horas

**Descrição**:
Aplicar decorators de autorização nos Application Services.

**Tarefas Específicas**:
1. Identificar métodos que precisam de autorização
2. Aplicar decorators apropriados:
   - `@RequirePermission` em métodos que modificam dados
   - `@RequireRole` quando necessário
3. Documentar permissões necessárias
4. Testes de integração
5. Validar que autorização está funcionando

**Código de Referência**:
```typescript
@Injectable()
export class UsuarioApplicationService {
  @RequirePermission('usuario.create')
  async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    // ...
  }

  @RequirePermission('usuario.read')
  async getById(id: number): Promise<UsuarioResponseDto | null> {
    // ...
  }

  @RequirePermission('usuario.update')
  async update(id: number, dto: UpdateUsuarioDto): Promise<UsuarioResponseDto> {
    // ...
  }

  @RequirePermission('usuario.delete')
  async delete(id: number): Promise<boolean> {
    // ...
  }
}
```

**Dependências**:
- T11.1 (Decorators de Autorização)
- T11.3 (Authorization Service)
- T7.3, T8.1, T8.2, T8.3, T9.1, T9.2 (Application Services)

**Critérios de Aceite**:
- [ ] Decorators aplicados nos Application Services
- [ ] Autorização funcionando corretamente
- [ ] Testes de integração passando
- [ ] Documentação de permissões criada

**Arquivos a Modificar**:
- Todos os Application Services

---

### SPRINT 12: Authorization Declarativa - Finalização

---

#### T12.1 - Políticas de Autorização Customizadas

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 5  
**Sprint**: 12  
**Estimativa**: 20 horas

**Descrição**:
Implementar sistema de políticas de autorização customizadas para regras complexas.

**Contexto Técnico**:
- Políticas permitem regras de autorização mais complexas
- Exemplo: usuário só pode editar seus próprios recursos
- Facilita implementação de regras de negócio específicas
- Extensível para novas políticas

**Tarefas Específicas**:
1. Criar interface `IAuthorizationPolicy`:
   ```typescript
   export interface IAuthorizationPolicy {
     name: string;
     check(context: AuthorizationContext): Promise<boolean>;
   }
   ```
2. Criar sistema de registro de políticas
3. Implementar políticas customizadas:
   - `OwnerPolicy`: usuário é dono do recurso
   - `SameTenantPolicy`: mesmo tenant
4. Criar decorator `@RequirePolicy(policyName: string)`
5. Exemplos de uso
6. Testes unitários

**Código de Referência**:
```typescript
// src/core/authorization/IAuthorizationPolicy.ts
export interface AuthorizationContext {
  userId: number;
  resourceId?: number;
  resource?: any;
  [key: string]: any;
}

export interface IAuthorizationPolicy {
  name: string;
  check(context: AuthorizationContext): Promise<boolean>;
}

// src/core/authorization/policies/OwnerPolicy.ts
export class OwnerPolicy implements IAuthorizationPolicy {
  name = 'owner';

  async check(context: AuthorizationContext): Promise<boolean> {
    if (!context.resource || !context.resource.userId) {
      return false;
    }
    return context.resource.userId === context.userId;
  }
}
```

**Dependências**:
- T11.1 (Decorators de Autorização)
- T11.3 (Authorization Service)

**Critérios de Aceite**:
- [ ] Sistema de políticas criado
- [ ] Políticas customizadas implementadas
- [ ] Decorator @RequirePolicy funcionando
- [ ] Exemplos de uso criados
- [ ] Testes passando
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/core/authorization/IAuthorizationPolicy.ts`
- `src/core/authorization/policies/OwnerPolicy.ts`
- `src/core/authorization/policies/SameTenantPolicy.ts`
- `src/core/authorization/RequirePolicy.ts`

---

#### T12.2 - Refatoração de Rotas

**Tipo**: Refactoring  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 12  
**Estimativa**: 20 horas

**Descrição**:
Aplicar autorização em todas as rotas e remover verificações manuais.

**Tarefas Específicas**:
1. Revisar todas as rotas
2. Aplicar middleware de autorização onde necessário
3. Remover verificações manuais de permissões dos controllers
4. Documentar permissões necessárias para cada rota
5. Atualizar testes de integração
6. Validar que todas as rotas estão protegidas

**Dependências**:
- T11.2 (Authorization Middleware)
- T11.4 (Integração com Application Services)

**Critérios de Aceite**:
- [ ] Todas as rotas protegidas
- [ ] Verificações manuais removidas
- [ ] Testes de integração passando
- [ ] Documentação de permissões criada
- [ ] Nenhuma regressão

**Arquivos a Modificar**:
- `src/routes/*.routes.ts`
- Controllers relevantes

---

#### T12.3 - Documentação de Autorização

**Tipo**: Documentation  
**Prioridade**: P1  
**Story Points**: 3  
**Sprint**: 12  
**Estimativa**: 12 horas

**Descrição**:
Criar documentação completa sobre sistema de autorização.

**Tarefas Específicas**:
1. Documentar decorators de autorização
2. Criar exemplos práticos de uso
3. Documentar políticas customizadas
4. Criar guia de uso
5. Documentar permissões do sistema

**Critérios de Aceite**:
- [ ] Documentação completa criada
- [ ] Exemplos práticos incluídos
- [ ] Guia de uso criado
- [ ] Documentação revisada

**Arquivos a Criar**:
- `docs/authorization.md`
- `docs/permissions.md`

---

#### T12.4 - Otimizações

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 3  
**Sprint**: 12  
**Estimativa**: 12 horas

**Descrição**:
Otimizar sistema de autorização com cache e otimizações de queries.

**Tarefas Específicas**:
1. Implementar cache de permissões:
   - Cachear permissões do usuário
   - TTL apropriado
   - Invalidação quando roles/permissões mudarem
2. Otimizar queries de autorização:
   - Usar joins eficientes
   - Reduzir número de queries
3. Performance testing
4. Ajustes baseados em resultados

**Dependências**:
- T11.3 (Authorization Service)
- T15.1 (Setup Redis) - se usar cache

**Critérios de Aceite**:
- [ ] Cache de permissões implementado
- [ ] Queries otimizadas
- [ ] Performance melhorada
- [ ] Testes de performance passando

**Arquivos a Modificar**:
- `src/application/services/AuthorizationService.ts`

---

### SPRINT 13: Audit Logging - Base

---

#### T13.1 - Entidade AuditLog

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 13  
**Estimativa**: 20 horas

**Descrição**:
Criar modelo AuditLog para armazenar logs de auditoria de todas as operações do sistema.

**Contexto Técnico**:
- AuditLog registra todas as ações importantes
- Necessário para compliance e rastreabilidade
- Campos incluem: usuário, ação, entidade, mudanças, contexto
- Índices para performance de consultas

**Tarefas Específicas**:
1. Criar modelo `AuditLog` em `src/models/AuditLog.ts`:
   - `id`: number
   - `userId`: number
   - `action`: string (CREATE, UPDATE, DELETE)
   - `entity`: string (nome da entidade)
   - `entityId`: number
   - `changes`: JSON (before/after)
   - `ip`: string
   - `userAgent`: string
   - `timestamp`: Date
2. Criar migration
3. Criar índices:
   - `userId` + `timestamp`
   - `entity` + `entityId`
   - `timestamp`
4. Criar AuditLogRepository

**Código de Referência**:
```typescript
// src/models/AuditLog.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface AuditLogAttributes {
  id: number;
  userId: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entityId: number;
  changes: {
    before?: any;
    after?: any;
  };
  ip: string;
  userAgent: string;
  timestamp: Date;
}

class AuditLog extends Model<AuditLogAttributes> implements AuditLogAttributes {
  public id!: number;
  public userId!: number;
  public action!: 'CREATE' | 'UPDATE' | 'DELETE';
  public entity!: string;
  public entityId!: number;
  public changes!: { before?: any; after?: any };
  public ip!: string;
  public userAgent!: string;
  public timestamp!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    action: {
      type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
      allowNull: false
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    changes: {
      type: DataTypes.JSON,
      allowNull: true
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'audit_logs',
    indexes: [
      { fields: ['userId', 'timestamp'] },
      { fields: ['entity', 'entityId'] },
      { fields: ['timestamp'] }
    ]
  }
);

export default AuditLog;
```

**Dependências**:
- Nenhuma

**Critérios de Aceite**:
- [ ] Modelo AuditLog criado
- [ ] Migration criada e aplicada
- [ ] Índices criados
- [ ] AuditLogRepository criado
- [ ] Testes de schema passando

**Arquivos a Criar**:
- `src/models/AuditLog.ts`
- `src/migrations/create-audit-logs.ts`
- `src/infrastructure/repository/AuditLogRepository.ts`

---

#### T13.2 - AuditService

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 8  
**Sprint**: 13  
**Estimativa**: 32 horas

**Descrição**:
Criar serviço de auditoria para registrar ações do sistema.

**Contexto Técnico**:
- AuditService centraliza lógica de auditoria
- Captura mudanças antes/depois
- Integra com RequestContext para obter informações do usuário
- Registra em banco de dados

**Tarefas Específicas**:
1. Criar interface `IAuditService`:
   ```typescript
   export interface IAuditService {
     logCreate(entity: string, entityId: number, data: any): Promise<void>;
     logUpdate(entity: string, entityId: number, before: any, after: any): Promise<void>;
     logDelete(entity: string, entityId: number, data: any): Promise<void>;
   }
   ```
2. Implementar `AuditService`:
   - Capturar userId do RequestContext
   - Capturar IP e UserAgent da requisição
   - Comparar before/after para mudanças
   - Salvar no banco via AuditLogRepository
3. Integrar com Logger para logar auditoria
4. Integrar com DI container
5. Escrever testes unitários

**Código de Referência**:
```typescript
// src/core/audit/IAuditService.ts
export interface IAuditService {
  logCreate(entity: string, entityId: number, data: any): Promise<void>;
  logUpdate(entity: string, entityId: number, before: any, after: any): Promise<void>;
  logDelete(entity: string, entityId: number, data: any): Promise<void>;
}

// src/application/services/AuditService.ts
import { injectable, inject } from 'tsyringe';
import { IAuditLogRepository } from '../../infrastructure/repository/IAuditLogRepository';
import { RequestContext } from '../../core/context/RequestContext';
import { ILogger } from '../../core/logger/ILogger';

@injectable()
export class AuditService implements IAuditService {
  constructor(
    @inject('IAuditLogRepository') private repository: IAuditLogRepository,
    @inject('RequestContext') private context: RequestContext,
    @inject('ILogger') private logger: ILogger
  ) {}

  async logCreate(entity: string, entityId: number, data: any): Promise<void> {
    const auditLog = {
      userId: this.context.getUserId() || 0,
      action: 'CREATE' as const,
      entity,
      entityId,
      changes: { after: data },
      ip: this.getClientIp(),
      userAgent: this.getUserAgent(),
      timestamp: new Date()
    };

    await this.repository.create(auditLog);
    this.logger.info('Audit log created', { entity, entityId, action: 'CREATE' });
  }

  async logUpdate(entity: string, entityId: number, before: any, after: any): Promise<void> {
    const changes = this.calculateChanges(before, after);
    
    const auditLog = {
      userId: this.context.getUserId() || 0,
      action: 'UPDATE' as const,
      entity,
      entityId,
      changes: { before, after, changes },
      ip: this.getClientIp(),
      userAgent: this.getUserAgent(),
      timestamp: new Date()
    };

    await this.repository.create(auditLog);
    this.logger.info('Audit log created', { entity, entityId, action: 'UPDATE' });
  }

  private calculateChanges(before: any, after: any): Record<string, any> {
    const changes: Record<string, any> = {};
    for (const key in after) {
      if (before[key] !== after[key]) {
        changes[key] = { from: before[key], to: after[key] };
      }
    }
    return changes;
  }

  // Implementar outros métodos...
}
```

**Dependências**:
- T13.1 (Entidade AuditLog)
- T2.3 (Logger Service)
- T2.4 (Contexto de Requisição)

**Critérios de Aceite**:
- [ ] IAuditService interface criada
- [ ] AuditService implementado
- [ ] Métodos de registro funcionando
- [ ] Captura de mudanças funcionando
- [ ] Integrado com Logger
- [ ] Integrado com DI
- [ ] Testes unitários passando
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/core/audit/IAuditService.ts`
- `src/application/services/AuditService.ts`
- `src/application/services/AuditService.spec.ts`

---

#### T13.3 - Interceptor de Auditoria

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 13  
**Estimativa**: 20 horas

**Descrição**:
Criar interceptor que captura automaticamente operações dos Application Services para auditoria.

**Contexto Técnico**:
- Interceptor captura chamadas de métodos automaticamente
- Reduz código duplicado
- Garante que todas as operações são auditadas
- Integra com UnitOfWork para capturar mudanças

**Tarefas Específicas**:
1. Criar decorator `@Auditable`:
   - Marca métodos que devem ser auditados
   - Opcionalmente especifica entidade
2. Implementar interceptor:
   - Captura chamada do método
   - Captura estado antes (para UPDATE/DELETE)
   - Executa método
   - Captura estado depois
   - Chama AuditService
3. Integrar com UnitOfWork para garantir transação
4. Escrever testes unitários

**Código de Referência**:
```typescript
// src/core/audit/Auditable.ts
import { container } from 'tsyringe';
import { IAuditService } from './IAuditService';

export function Auditable(entityName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const auditService = container.resolve<IAuditService>('IAuditService');
      const entity = entityName || target.constructor.name.replace('ApplicationService', '');

      // Para UPDATE/DELETE: capturar estado antes
      let beforeState: any = null;
      if (propertyName === 'update' || propertyName === 'delete') {
        const id = args[0];
        // Buscar estado atual...
      }

      // Executar método
      const result = await originalMethod.apply(this, args);

      // Registrar auditoria
      if (propertyName === 'create') {
        await auditService.logCreate(entity, result.id, result);
      } else if (propertyName === 'update') {
        await auditService.logUpdate(entity, args[0], beforeState, result);
      } else if (propertyName === 'delete') {
        await auditService.logDelete(entity, args[0], beforeState);
      }

      return result;
    };

    return descriptor;
  };
}
```

**Dependências**:
- T13.2 (AuditService)
- T10.1 (UnitOfWork Service)

**Critérios de Aceite**:
- [ ] Decorator @Auditable criado
- [ ] Interceptor funcionando
- [ ] Captura automática de operações funcionando
- [ ] Integrado com UnitOfWork
- [ ] Testes unitários passando
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/core/audit/Auditable.ts`
- `src/core/audit/Auditable.spec.ts`

---

#### T13.4 - Integração Inicial

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 3  
**Sprint**: 13  
**Estimativa**: 12 horas

**Descrição**:
Aplicar auditoria inicialmente em alguns Application Services como prova de conceito.

**Tarefas Específicas**:
1. Aplicar `@Auditable` em UsuarioApplicationService
2. Aplicar `@Auditable` em EventoApplicationService
3. Testar criação, atualização e exclusão
4. Validar que logs estão sendo criados
5. Testes de integração

**Dependências**:
- T13.3 (Interceptor de Auditoria)
- T7.3 (UsuarioApplicationService)
- T8.1 (EventoApplicationService)

**Critérios de Aceite**:
- [ ] Auditoria aplicada em UsuarioApplicationService
- [ ] Auditoria aplicada em EventoApplicationService
- [ ] Logs sendo criados corretamente
- [ ] Testes de integração passando
- [ ] Validação manual realizada

**Arquivos a Modificar**:
- `src/application/services/UsuarioApplicationService.ts`
- `src/application/services/EventoApplicationService.ts`

---

### SPRINT 14: Audit Logging - Finalização

---

#### T14.1 - Auditoria Completa

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 14  
**Estimativa**: 20 horas

**Descrição**:
Aplicar auditoria em todos os Application Services restantes.

**Tarefas Específicas**:
1. Aplicar `@Auditable` em todos os Application Services:
   - FinanceiroApplicationService
   - LembreteApplicationService
   - LocalApplicationService
   - RoleApplicationService
   - PermissaoApplicationService
2. Validar que todas as operações estão sendo auditadas
3. Testes de integração completos
4. Validar integridade dos logs

**Dependências**:
- T13.3 (Interceptor de Auditoria)
- T8.2, T8.3, T9.1, T9.2 (Application Services)

**Critérios de Aceite**:
- [ ] Auditoria aplicada em todos os Application Services
- [ ] Todas as operações sendo auditadas
- [ ] Testes de integração passando
- [ ] Integridade dos logs validada

**Arquivos a Modificar**:
- Todos os Application Services restantes

---

#### T14.2 - AuditLogRepository e Service de Consulta

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 8  
**Sprint**: 14  
**Estimativa**: 32 horas

**Descrição**:
Criar repositório e serviço para consulta de logs de auditoria.

**Tarefas Específicas**:
1. Criar `AuditLogRepository` estendendo BaseRepository
2. Implementar métodos de consulta:
   - `findByUser(userId: number, options?: FindOptions): Promise<AuditLog[]>`
   - `findByEntity(entity: string, entityId: number): Promise<AuditLog[]>`
   - `findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]>`
   - `findByAction(action: string): Promise<AuditLog[]>`
3. Criar `AuditLogQueryService`:
   - Métodos de consulta combinados
   - Paginação
   - Filtros avançados
4. Escrever testes unitários

**Código de Referência**:
```typescript
// src/infrastructure/repository/AuditLogRepository.ts
import { injectable } from 'tsyringe';
import { BaseRepository } from '../../core/repository/BaseRepository';
import AuditLog from '../../models/AuditLog';

@injectable()
export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor() {
    super(AuditLog);
  }

  async findByUser(userId: number, options?: FindOptions): Promise<AuditLog[]> {
    return await this.findAll({
      ...options,
      where: {
        ...options?.where,
        userId
      },
      order: [['timestamp', 'DESC']]
    });
  }

  async findByEntity(entity: string, entityId: number): Promise<AuditLog[]> {
    return await this.findAll({
      where: {
        entity,
        entityId
      },
      order: [['timestamp', 'DESC']]
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return await this.findAll({
      where: {
        timestamp: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['timestamp', 'DESC']]
    });
  }
}
```

**Dependências**:
- T13.1 (Entidade AuditLog)
- T5.2 (BaseRepository)

**Critérios de Aceite**:
- [ ] AuditLogRepository criado e funcionando
- [ ] Métodos de consulta implementados
- [ ] AuditLogQueryService criado
- [ ] Paginação e filtros funcionando
- [ ] Testes unitários passando

**Arquivos a Criar**:
- `src/infrastructure/repository/AuditLogRepository.ts`
- `src/application/services/AuditLogQueryService.ts`

---

#### T14.3 - Endpoint de Consulta de Logs

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 14  
**Estimativa**: 20 horas

**Descrição**:
Criar endpoints para consulta de logs de auditoria.

**Tarefas Específicas**:
1. Criar `AuditLogController`:
   - `GET /audit-logs`: Listar logs com filtros
   - `GET /audit-logs/:id`: Obter log específico
   - `GET /audit-logs/user/:userId`: Logs de um usuário
   - `GET /audit-logs/entity/:entity/:entityId`: Logs de uma entidade
2. Implementar filtros:
   - Por usuário
   - Por entidade
   - Por ação
   - Por data
3. Implementar paginação
4. Aplicar autorização adequada (apenas admins)
5. Testes de integração

**Código de Referência**:
```typescript
// src/controllers/AuditLogController.ts
import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { AuditLogQueryService } from '../application/services/AuditLogQueryService';

@injectable()
export class AuditLogController {
  constructor(
    @inject('IAuditLogQueryService') private queryService: AuditLogQueryService
  ) {}

  async list(req: Request, res: Response) {
    const { userId, entity, entityId, action, startDate, endDate, page, limit } = req.query;
    
    const result = await this.queryService.find({
      userId: userId ? parseInt(userId as string) : undefined,
      entity: entity as string,
      entityId: entityId ? parseInt(entityId as string) : undefined,
      action: action as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20
    });

    return res.json(result);
  }
}
```

**Dependências**:
- T14.2 (AuditLogRepository e Service de Consulta)
- T11.1 (Decorators de Autorização)

**Critérios de Aceite**:
- [ ] AuditLogController criado
- [ ] Endpoints funcionando
- [ ] Filtros e paginação funcionando
- [ ] Autorização aplicada
- [ ] Testes de integração passando

**Arquivos a Criar**:
- `src/controllers/AuditLogController.ts`
- `src/routes/audit-log.routes.ts`

---

#### T14.4 - Retenção e Limpeza

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 3  
**Sprint**: 14  
**Estimativa**: 12 horas

**Descrição**:
Implementar job de limpeza de logs antigos para gerenciar espaço de armazenamento.

**Tarefas Específicas**:
1. Criar job de limpeza:
   - Deletar logs mais antigos que X dias (configurável)
   - Executar periodicamente (semanal ou mensal)
2. Configurar retenção via variável de ambiente
3. Integrar com Background Jobs (se já implementado) ou criar job simples
4. Documentar configuração
5. Testes de integração

**Código de Referência**:
```typescript
// src/workers/CleanupAuditLogsWorker.ts
import { BaseWorker } from './BaseWorker';
import { Job } from 'bullmq';
import { IAuditLogRepository } from '../infrastructure/repository/IAuditLogRepository';

export class CleanupAuditLogsWorker extends BaseWorker {
  constructor(
    private auditLogRepository: IAuditLogRepository
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const retentionDays = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '365');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const deleted = await this.auditLogRepository.deleteOlderThan(cutoffDate);
    this.logger.info(`Cleaned up ${deleted} audit logs older than ${retentionDays} days`);
  }
}
```

**Dependências**:
- T13.1 (Entidade AuditLog)
- T21.3 (Workers Base) - opcional, pode ser implementado de forma simples

**Critérios de Aceite**:
- [ ] Job de limpeza criado
- [ ] Configuração de retenção funcionando
- [ ] Limpeza funcionando corretamente
- [ ] Documentação criada
- [ ] Testes passando

**Arquivos a Criar**:
- `src/workers/CleanupAuditLogsWorker.ts` (ou implementação simples)

---

## RESUMO DA FASE 3

### Objetivos Alcançados

- ✅ Sistema de autorização declarativa implementado
- ✅ Decorators de autorização facilitando uso
- ✅ Políticas customizadas para regras complexas
- ✅ Sistema de auditoria completo
- ✅ Rastreabilidade de todas as operações
- ✅ Compliance e segurança melhorados

### Métricas Esperadas

- **Cobertura de Autorização**: 100% das rotas protegidas
- **Cobertura de Auditoria**: 100% das operações críticas auditadas
- **Performance de Autorização**: < 50ms por verificação (com cache)
- **Integridade de Dados**: 100% das mudanças rastreáveis
- **Compliance**: Atendimento a requisitos de auditoria

### Próximos Passos

Após conclusão da Fase 3, seguir para:
- **Fase 4**: Performance e Escalabilidade (Caching, Multi Tenancy)
- **Fase 5**: Funcionalidades Avançadas (Localization, Dynamic API, Background Jobs, Notifications)

### Considerações Importantes

1. **Autorização**:
   - Manter permissões atualizadas
   - Revisar permissões regularmente
   - Testar autorização em todas as novas features

2. **Auditoria**:
   - Logs não devem conter dados sensíveis (senhas, tokens)
   - Retenção de logs conforme política da empresa
   - Monitorar crescimento de logs
   - Backup de logs importantes

3. **Performance**:
   - Cache de permissões é essencial
   - Índices em AuditLog são críticos
   - Considerar arquivamento de logs antigos

4. **Segurança**:
   - Endpoints de auditoria devem ter autorização restrita
   - Validar acesso cross-tenant em auditoria
   - Proteger dados sensíveis nos logs

---

**Última Atualização**: [Data]  
**Versão**: 1.0  
**Mantido por**: Tech Lead / Arquitetura
