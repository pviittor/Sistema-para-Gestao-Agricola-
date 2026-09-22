# Sistema de Autorização - Documentação Completa

## Visão Geral

O sistema de autorização do RuralIn fornece uma solução completa e flexível para controle de acesso baseado em permissões e roles. O sistema suporta múltiplas camadas de proteção e permite implementar regras complexas através de políticas customizadas.

**Características Principais**:
- ✅ Controle de acesso baseado em permissões e roles
- ✅ Decorators declarativos para Application Services
- ✅ Middleware para proteção de rotas
- ✅ Políticas customizadas para regras complexas
- ✅ Integração com sistema de autenticação JWT
- ✅ Tratamento centralizado de erros de autorização

---

## Arquitetura do Sistema

### Componentes Principais

```
┌─────────────────────────────────────────────────────────┐
│                    Camada HTTP                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │  Middleware de Autorização (requirePermission)   │   │
│  │  - Verifica permissão antes de chegar ao         │   │
│  │    controller                                     │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              Application Services                        │
│  ┌───────────────────────────────────────────────────┐   │
│  │  Decorators (@RequirePermission, @RequireRole)    │   │
│  │  - Verifica permissão/role antes de executar     │   │
│  │    lógica de negócio                              │   │
│  └───────────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────────┐   │
│  │  Políticas Customizadas (@RequirePolicy)          │   │
│  │  - Regras complexas (owner, sameTenant, etc.)   │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│           Authorization Service                         │
│  ┌───────────────────────────────────────────────────┐   │
│  │  - Verifica permissões via roles                 │   │
│  │  - Verifica roles do usuário                      │   │
│  │  - Centraliza lógica de autorização              │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Autorização

1. **Requisição HTTP** → `authMiddleware` verifica autenticação (JWT)
2. **Middleware de Autorização** → `requirePermission` verifica permissão
3. **Controller** → Recebe requisição e delega para Application Service
4. **Application Service** → Decorators verificam permissão/role novamente
5. **Políticas** → Verificam regras complexas (se aplicável)
6. **Método Executa** → Se todas as verificações passarem

---

## Conceitos Fundamentais

### Permissões

**Permissões** são ações específicas que um usuário pode realizar no sistema. Seguem o padrão `entidade.operacao`.

**Exemplos**:
- `usuario.create` - Criar usuários
- `evento.read` - Visualizar eventos
- `financeiro.update` - Atualizar registros financeiros
- `role.delete` - Deletar roles

**Características**:
- Granulares: cada ação tem sua própria permissão
- Hierárquicas: organizadas por entidade
- Reutilizáveis: podem ser atribuídas a múltiplas roles

### Roles

**Roles** são grupos de permissões que definem funções no sistema. Um usuário pode ter múltiplas roles.

**Exemplos**:
- `ADMIN` - Administrador com todas as permissões
- `MANAGER` - Gerente com permissões de gerenciamento
- `USER` - Usuário comum com permissões básicas

**Características**:
- Agrupam permissões relacionadas
- Facilitam gerenciamento de acesso
- Podem ser combinadas (usuário pode ter múltiplas roles)

### Políticas

**Políticas** são regras complexas de autorização que vão além de simples verificação de permissões.

**Exemplos**:
- `owner` - Usuário só pode editar seus próprios recursos
- `sameTenant` - Usuário só pode acessar recursos do mesmo tenant

**Características**:
- Permitem regras baseadas em contexto
- Extensíveis: podem ser criadas políticas customizadas
- Reutilizáveis: podem ser aplicadas em múltiplos métodos

---

## Decorators de Autorização

### @RequirePermission

Verifica se o usuário tem uma permissão específica antes de executar o método.

**Sintaxe**:
```typescript
@RequirePermission('permissao.nome')
async metodo(): Promise<Response> {
  // ...
}
```

**Exemplo**:
```typescript
import { RequirePermission } from '../core/authorization';

@Injectable()
export class UsuarioApplicationService {
  @RequirePermission('usuario.create')
  async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    // Método só será executado se usuário tiver permissão 'usuario.create'
    return await this.repository.create(dto);
  }
}
```

**Características**:
- ✅ Verifica permissão antes de executar método
- ✅ Lança `ForbiddenException` se não tiver permissão
- ✅ Extrai `userId` automaticamente do contexto
- ✅ Integrado com `AuthorizationService`

### @RequireRole

Verifica se o usuário tem uma role específica (ou pelo menos uma das roles, se array).

**Sintaxe**:
```typescript
@RequireRole('ROLE_NAME')
// ou
@RequireRole(['ROLE1', 'ROLE2']) // OR - pelo menos uma
async metodo(): Promise<Response> {
  // ...
}
```

**Exemplo**:
```typescript
import { RequireRole } from '../core/authorization';

@Injectable()
export class UsuarioApplicationService {
  @RequireRole('ADMIN')
  async delete(id: number): Promise<boolean> {
    // Método só será executado se usuário tiver role 'ADMIN'
    return await this.repository.delete(id);
  }

  @RequireRole(['ADMIN', 'MANAGER'])
  async update(id: number, dto: UpdateDto): Promise<ResponseDto> {
    // Método será executado se usuário tiver role 'ADMIN' OU 'MANAGER'
    return await this.repository.update(id, dto);
  }
}
```

**Características**:
- ✅ Suporta role única ou array de roles (OR)
- ✅ Lança `ForbiddenException` se não tiver role
- ✅ Útil para operações administrativas

### @RequireAnyPermission

Verifica se o usuário tem pelo menos uma das permissões especificadas (OR).

**Sintaxe**:
```typescript
@RequireAnyPermission(['permissao1', 'permissao2'])
async metodo(): Promise<Response> {
  // ...
}
```

**Exemplo**:
```typescript
import { RequireAnyPermission } from '../core/authorization';

@Injectable()
export class EventoApplicationService {
  @RequireAnyPermission(['evento.create', 'evento.update'])
  async save(id: number | null, dto: EventoDto): Promise<EventoResponseDto> {
    // Método será executado se usuário tiver 'evento.create' OU 'evento.update'
    if (id) {
      return await this.update(id, dto);
    } else {
      return await this.create(dto);
    }
  }
}
```

**Características**:
- ✅ Verifica se usuário tem pelo menos uma das permissões
- ✅ Útil para métodos que fazem múltiplas operações

### @RequireAllPermissions

Verifica se o usuário tem todas as permissões especificadas (AND).

**Sintaxe**:
```typescript
@RequireAllPermissions(['permissao1', 'permissao2'])
async metodo(): Promise<Response> {
  // ...
}
```

**Exemplo**:
```typescript
import { RequireAllPermissions } from '../core/authorization';

@Injectable()
export class FinanceiroApplicationService {
  @RequireAllPermissions(['financeiro.read', 'financeiro.export'])
  async exportarRelatorio(periodo: PeriodoDto): Promise<Buffer> {
    // Método só será executado se usuário tiver AMBAS as permissões
    return await this.gerarRelatorio(periodo);
  }
}
```

**Características**:
- ✅ Verifica se usuário tem todas as permissões
- ✅ Útil para operações que requerem múltiplas permissões

### @RequirePolicy

Verifica se uma política customizada é satisfeita antes de executar o método.

**Sintaxe**:
```typescript
@RequirePolicy('policyName', options?)
async metodo(): Promise<Response> {
  // ...
}
```

**Exemplo**:
```typescript
import { RequirePolicy } from '../core/authorization';

@Injectable()
export class EventoApplicationService {
  @RequirePolicy('owner', {
    getResource: async (id: number) => await this.repository.findById(id)
  })
  async update(id: number, dto: UpdateEventoDto): Promise<EventoResponseDto> {
    // Método só será executado se usuário for dono do evento
    return await this.repository.update(id, dto);
  }
}
```

**Opções**:
- `resourceIdParam`: Nome da propriedade que contém o ID do recurso
- `resourceParam`: Nome da propriedade que contém o recurso completo
- `getResource`: Função para buscar o recurso se não estiver disponível

**Características**:
- ✅ Permite regras complexas além de permissões simples
- ✅ Suporta políticas customizadas
- ✅ Busca recurso automaticamente se necessário

---

## Middleware de Autorização

### requirePermission

Middleware factory que verifica permissão antes de chegar ao controller.

**Sintaxe**:
```typescript
router.[metodo](
  '/rota',
  requirePermission('permissao.nome'),
  handler
);
```

**Exemplo**:
```typescript
import { requirePermission } from '../middleware/authorization';

router.post(
  '/usuarios',
  authMiddleware,                    // 1. Autenticação
  requirePermission('usuario.create'), // 2. Autorização
  validateDto(CreateUsuarioDto),      // 3. Validação
  asyncHandler(async (req, res) => {
    await getUsuarioController().create(req, res);
  })
);
```

**Características**:
- ✅ Verifica permissão antes do controller
- ✅ Falha rápida: bloqueia requisição cedo
- ✅ Documentação clara: permissões visíveis nas rotas

### requireRole

Middleware factory que verifica role antes de chegar ao controller.

**Sintaxe**:
```typescript
router.[metodo](
  '/rota',
  requireRole('ROLE_NAME'),
  // ou
  requireRole(['ROLE1', 'ROLE2']), // OR
  handler
);
```

**Exemplo**:
```typescript
import { requireRole } from '../middleware/authorization';

router.delete(
  '/usuarios/:id',
  authMiddleware,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    await getUsuarioController().delete(req, res);
  })
);
```

**Características**:
- ✅ Verifica role antes do controller
- ✅ Suporta múltiplas roles (OR)

### requireAnyPermission

Middleware factory que verifica se usuário tem pelo menos uma das permissões.

**Sintaxe**:
```typescript
router.[metodo](
  '/rota',
  requireAnyPermission(['permissao1', 'permissao2']),
  handler
);
```

### requireAllPermissions

Middleware factory que verifica se usuário tem todas as permissões.

**Sintaxe**:
```typescript
router.[metodo](
  '/rota',
  requireAllPermissions(['permissao1', 'permissao2']),
  handler
);
```

---

## Políticas Customizadas

### Políticas Padrão

#### OwnerPolicy

Verifica se o usuário é dono do recurso sendo acessado.

**Nome**: `owner`

**Lógica**:
- Verifica se `context.resource` existe
- Verifica se `context.resource.userId` ou `context.resource.usuarioId` existe
- Compara com `context.userId`

**Exemplo**:
```typescript
@RequirePolicy('owner', {
  getResource: async (id: number) => await this.repository.findById(id)
})
async update(id: number, dto: UpdateDto): Promise<ResponseDto> {
  // Método só será executado se usuário for dono do recurso
  return await this.repository.update(id, dto);
}
```

#### SameTenantPolicy

Verifica se usuário e recurso pertencem ao mesmo tenant.

**Nome**: `sameTenant`

**Lógica**:
- Verifica se `context.resource` existe
- Compara `context.resource.tenantId` com `context.tenantId`
- Se não há tenantId, assume que não há multi-tenancy (retorna `true`)

**Exemplo**:
```typescript
@RequirePolicy('sameTenant', {
  getResource: async (id: number) => await this.repository.findById(id)
})
async delete(id: number): Promise<boolean> {
  // Método só será executado se recurso pertencer ao mesmo tenant
  return await this.repository.delete(id);
}
```

### Criando Políticas Customizadas

**Passo 1**: Implementar interface `IAuthorizationPolicy`

```typescript
import { IAuthorizationPolicy, AuthorizationContext } from '../core/authorization/IAuthorizationPolicy';

export class MinhaPolicy implements IAuthorizationPolicy {
  name = 'minhaPolicy';

  async check(context: AuthorizationContext): Promise<boolean> {
    // Implementar lógica da política
    if (!context.resource) return false;
    
    // Exemplo: verificar se recurso está ativo
    if (context.resource.status !== 'ACTIVE') {
      return false;
    }
    
    return true;
  }
}
```

**Passo 2**: Registrar política

```typescript
import { PolicyRegistry } from '../core/authorization/PolicyRegistry';
import { MinhaPolicy } from './MinhaPolicy';

// Durante inicialização
PolicyRegistry.register(new MinhaPolicy());
```

**Passo 3**: Usar em Application Service

```typescript
@RequirePolicy('minhaPolicy', {
  getResource: async (id: number) => await this.repository.findById(id)
})
async meuMetodo(id: number): Promise<ResponseDto> {
  // ...
}
```

---

## Guia de Uso Prático

### Cenário 1: Proteger Método com Permissão

**Objetivo**: Garantir que apenas usuários com permissão `usuario.create` possam criar usuários.

**Solução**:
```typescript
@RequirePermission('usuario.create')
async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
  return await this.repository.create(dto);
}
```

### Cenário 2: Proteger Rota com Permissão

**Objetivo**: Garantir que apenas usuários autenticados com permissão possam acessar a rota.

**Solução**:
```typescript
router.post(
  '/usuarios',
  authMiddleware,
  requirePermission('usuario.create'),
  validateDto(CreateUsuarioDto),
  asyncHandler(async (req, res) => {
    await getUsuarioController().create(req, res);
  })
);
```

### Cenário 3: Proteger Método com Role

**Objetivo**: Garantir que apenas administradores possam deletar usuários.

**Solução**:
```typescript
@RequireRole('ADMIN')
async delete(id: number): Promise<boolean> {
  return await this.repository.delete(id);
}
```

### Cenário 4: Proteger Método com Múltiplas Permissões (OR)

**Objetivo**: Permitir que usuários com `evento.create` OU `evento.update` possam salvar eventos.

**Solução**:
```typescript
@RequireAnyPermission(['evento.create', 'evento.update'])
async save(id: number | null, dto: EventoDto): Promise<EventoResponseDto> {
  if (id) {
    return await this.update(id, dto);
  } else {
    return await this.create(dto);
  }
}
```

### Cenário 5: Proteger Método com Múltiplas Permissões (AND)

**Objetivo**: Garantir que usuário tenha ambas as permissões para exportar relatório.

**Solução**:
```typescript
@RequireAllPermissions(['financeiro.read', 'financeiro.export'])
async exportarRelatorio(periodo: PeriodoDto): Promise<Buffer> {
  return await this.gerarRelatorio(periodo);
}
```

### Cenário 6: Proteger Método com Política (Owner)

**Objetivo**: Garantir que usuário só possa editar seus próprios eventos.

**Solução**:
```typescript
@RequirePermission('evento.update')
@RequirePolicy('owner', {
  getResource: async (id: number) => await this.repository.findById(id)
})
async update(id: number, dto: UpdateEventoDto): Promise<EventoResponseDto> {
  return await this.repository.update(id, dto);
}
```

### Cenário 7: Combinar Permissão e Role

**Objetivo**: Garantir que usuário tenha permissão E role específica.

**Solução**:
```typescript
@RequirePermission('role.update')
@RequireRole('ADMIN')
async updateRole(id: number, dto: UpdateRoleDto): Promise<RoleResponseDto> {
  return await this.repository.update(id, dto);
}
```

### Cenário 8: Proteger Rotas de Relacionamentos

**Objetivo**: Proteger rotas que gerenciam relacionamentos many-to-many.

**Solução**:
```typescript
// Associar permissão a role
router.post(
  '/roleHasPermissoes',
  authMiddleware,
  requirePermission('role.update'),
  asyncHandler(async (req, res) => {
    await getController().create(req, res);
  })
);
```

---

## Boas Práticas

### 1. Use Decorators em Application Services

✅ **Correto**: Aplicar decorators nos Application Services
```typescript
@RequirePermission('usuario.create')
async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
  // ...
}
```

❌ **Evitar**: Verificações manuais nos controllers
```typescript
// Evitar isso
async create(req: Request, res: Response) {
  const hasPermission = await authService.hasPermission(userId, 'usuario.create');
  if (!hasPermission) {
    throw new ForbiddenException('Sem permissão');
  }
  // ...
}
```

### 2. Use Middleware nas Rotas para Documentação

✅ **Correto**: Aplicar middleware nas rotas para documentação clara
```typescript
router.post(
  '/usuarios',
  requirePermission('usuario.create'),
  handler
);
```

### 3. Combine Permissão e Política Quando Necessário

✅ **Correto**: Usar permissão + política para proteção completa
```typescript
@RequirePermission('evento.update')
@RequirePolicy('owner')
async update(id: number, dto: UpdateDto): Promise<ResponseDto> {
  // ...
}
```

### 4. Use Políticas para Regras Complexas

✅ **Correto**: Criar política para regras complexas
```typescript
@RequirePolicy('owner')
async update(id: number, dto: UpdateDto): Promise<ResponseDto> {
  // ...
}
```

❌ **Evitar**: Verificações manuais complexas
```typescript
// Evitar isso
async update(id: number, dto: UpdateDto): Promise<ResponseDto> {
  const resource = await this.repository.findById(id);
  if (resource.userId !== userId) {
    throw new ForbiddenException('Sem permissão');
  }
  // ...
}
```

### 5. Mantenha Ordem Consistente de Decorators

✅ **Correto**: Ordem consistente
```typescript
@RequirePermission('evento.update')
@RequirePolicy('owner')
@Transactional()
async update(id: number, dto: UpdateDto): Promise<ResponseDto> {
  // ...
}
```

### 6. Documente Permissões Necessárias

✅ **Correto**: Documentar permissões nas rotas
```typescript
/**
 * POST /api/usuarios
 * 
 * Cria um novo usuário.
 * 
 * Permissão necessária: usuario.create
 */
router.post(
  '/',
  requirePermission('usuario.create'),
  handler
);
```

---

## Tratamento de Erros

### Exceções de Autorização

O sistema lança exceções específicas para diferentes cenários:

#### UnauthorizedException (401)

Lançada quando usuário não está autenticado.

**Quando ocorre**:
- Token JWT ausente ou inválido
- `req.userId` não está definido

**Exemplo**:
```typescript
// Middleware de autorização
if (!userId) {
  throw new UnauthorizedException('Credenciais inválidas');
}
```

#### ForbiddenException (403)

Lançada quando usuário está autenticado mas não tem permissão/role.

**Quando ocorre**:
- Usuário não tem permissão necessária
- Usuário não tem role necessária
- Política não é satisfeita

**Exemplo**:
```typescript
// Decorator @RequirePermission
if (!hasPermission) {
  throw new ForbiddenException(`Permissão '${permission}' necessária`);
}
```

### Respostas HTTP

**401 Unauthorized**:
```json
{
  "error": "Unauthorized",
  "message": "Credenciais inválidas",
  "statusCode": 401
}
```

**403 Forbidden**:
```json
{
  "error": "Forbidden",
  "message": "Permissão 'usuario.create' necessária",
  "statusCode": 403
}
```

---

## Referências

### Documentação Relacionada

- [Permissões do Sistema](./features/fase%203/Permissoes-Sistema.md) - Lista completa de permissões
- [T11.2 - Authorization Middleware](./features/fase%203/T11.2-Authorization-Middleware.md) - Detalhes do middleware
- [T11.3 - Authorization Service](./features/fase%203/T11.3-Authorization-Service.md) - Detalhes do serviço
- [T11.4 - Integração com Application Services](./features/fase%203/T11.4-Integracao-Application-Services.md) - Integração com services
- [T12.1 - Políticas Customizadas](./features/fase%203/T12.1-Politicas-Autorizacao-Customizadas.md) - Políticas customizadas
- [T12.2 - Refatoração de Rotas](./features/fase%203/T12.2-Refatoracao-Rotas.md) - Refatoração de rotas

### Arquivos de Código

- `src/core/authorization/` - Módulo de autorização
- `src/middleware/authorization.ts` - Middleware de autorização
- `src/application/services/AuthorizationService.ts` - Implementação do serviço

---

**Última Atualização**: 2024-01-01  
**Versão**: 1.0  
**Mantido por**: Tech Lead / Arquitetura
