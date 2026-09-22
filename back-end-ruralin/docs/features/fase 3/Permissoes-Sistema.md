# Permissões do Sistema - Referência Completa

## Visão Geral

Este documento lista todas as permissões do sistema, organizadas por entidade. Cada permissão segue o padrão `entidade.operacao`.

**Padrão de Nomenclatura**: `entidade.operacao`
- **entidade**: Nome da entidade em minúsculas
- **operacao**: Operação CRUD (`create`, `read`, `update`, `delete`)

---

## Permissões por Entidade

### Usuario

| Permissão | Descrição | Operação |
|-----------|-----------|----------|
| `usuario.create` | Criar novos usuários | CREATE |
| `usuario.read` | Visualizar usuários (listar, buscar por ID, email, username) | READ |
| `usuario.update` | Atualizar usuários existentes | UPDATE |
| `usuario.delete` | Deletar usuários | DELETE |

**Métodos protegidos**:
- `UsuarioApplicationService.create()` → `usuario.create`
- `UsuarioApplicationService.update()` → `usuario.update`
- `UsuarioApplicationService.delete()` → `usuario.delete`
- `UsuarioApplicationService.getById()` → `usuario.read`
- `UsuarioApplicationService.list()` → `usuario.read`
- `UsuarioApplicationService.findByEmail()` → `usuario.read`
- `UsuarioApplicationService.findByUsername()` → `usuario.read`

---

### Evento

| Permissão | Descrição | Operação |
|-----------|-----------|----------|
| `evento.create` | Criar novos eventos | CREATE |
| `evento.read` | Visualizar eventos (listar, buscar por ID, local, data) | READ |
| `evento.update` | Atualizar eventos existentes | UPDATE |
| `evento.delete` | Deletar eventos | DELETE |

**Métodos protegidos**:
- `EventoApplicationService.create()` → `evento.create`
- `EventoApplicationService.update()` → `evento.update`
- `EventoApplicationService.delete()` → `evento.delete`
- `EventoApplicationService.getById()` → `evento.read`
- `EventoApplicationService.list()` → `evento.read`
- `EventoApplicationService.findByLocal()` → `evento.read`
- `EventoApplicationService.findByData()` → `evento.read`

---

### Financeiro

| Permissão | Descrição | Operação |
|-----------|-----------|----------|
| `financeiro.create` | Criar novos registros financeiros | CREATE |
| `financeiro.read` | Visualizar registros financeiros (listar, buscar por ID, período, tipo) | READ |
| `financeiro.update` | Atualizar registros financeiros existentes | UPDATE |
| `financeiro.delete` | Deletar registros financeiros | DELETE |

**Métodos protegidos**:
- `FinanceiroApplicationService.create()` → `financeiro.create`
- `FinanceiroApplicationService.update()` → `financeiro.update`
- `FinanceiroApplicationService.delete()` → `financeiro.delete`
- `FinanceiroApplicationService.getById()` → `financeiro.read`
- `FinanceiroApplicationService.list()` → `financeiro.read`
- `FinanceiroApplicationService.findByPeriodo()` → `financeiro.read`
- `FinanceiroApplicationService.findByTipo()` → `financeiro.read`

---

### Lembrete

| Permissão | Descrição | Operação |
|-----------|-----------|----------|
| `lembrete.create` | Criar novos lembretes | CREATE |
| `lembrete.read` | Visualizar lembretes (listar, buscar por ID, usuário, próximos) | READ |
| `lembrete.update` | Atualizar lembretes existentes | UPDATE |
| `lembrete.delete` | Deletar lembretes | DELETE |

**Métodos protegidos**:
- `LembreteApplicationService.create()` → `lembrete.create`
- `LembreteApplicationService.update()` → `lembrete.update`
- `LembreteApplicationService.delete()` → `lembrete.delete`
- `LembreteApplicationService.getById()` → `lembrete.read`
- `LembreteApplicationService.list()` → `lembrete.read`
- `LembreteApplicationService.findByUsuario()` → `lembrete.read`
- `LembreteApplicationService.findProximos()` → `lembrete.read`

---

### Local

| Permissão | Descrição | Operação |
|-----------|-----------|----------|
| `local.create` | Criar novos locais | CREATE |
| `local.read` | Visualizar locais (listar, buscar por ID, usuário) | READ |
| `local.update` | Atualizar locais existentes | UPDATE |
| `local.delete` | Deletar locais | DELETE |

**Métodos protegidos**:
- `LocalApplicationService.create()` → `local.create`
- `LocalApplicationService.update()` → `local.update`
- `LocalApplicationService.delete()` → `local.delete`
- `LocalApplicationService.getById()` → `local.read`
- `LocalApplicationService.list()` → `local.read`
- `LocalApplicationService.findByUsuario()` → `local.read`

---

### Role

| Permissão | Descrição | Operação |
|-----------|-----------|----------|
| `role.create` | Criar novas roles | CREATE |
| `role.read` | Visualizar roles (listar, buscar por ID, nome) | READ |
| `role.update` | Atualizar roles existentes | UPDATE |
| `role.delete` | Deletar roles | DELETE |

**Métodos protegidos**:
- `RoleApplicationService.create()` → `role.create`
- `RoleApplicationService.update()` → `role.update`
- `RoleApplicationService.delete()` → `role.delete`
- `RoleApplicationService.getById()` → `role.read`
- `RoleApplicationService.list()` → `role.read`
- `RoleApplicationService.findByNome()` → `role.read`

**Nota**: Operações de criação, atualização e exclusão de roles geralmente requerem role `ADMIN`. Isso pode ser implementado com `@RequireRole('ADMIN')` adicional se necessário.

---

### Permissao

| Permissão | Descrição | Operação |
|-----------|-----------|----------|
| `permissao.create` | Criar novas permissões | CREATE |
| `permissao.read` | Visualizar permissões (listar, buscar por ID, nome) | READ |
| `permissao.update` | Atualizar permissões existentes | UPDATE |
| `permissao.delete` | Deletar permissões | DELETE |

**Métodos protegidos**:
- `PermissaoApplicationService.create()` → `permissao.create`
- `PermissaoApplicationService.update()` → `permissao.update`
- `PermissaoApplicationService.delete()` → `permissao.delete`
- `PermissaoApplicationService.getById()` → `permissao.read`
- `PermissaoApplicationService.list()` → `permissao.read`
- `PermissaoApplicationService.findByNome()` → `permissao.read`

**Nota**: Operações de criação, atualização e exclusão de permissões geralmente requerem role `ADMIN`. Isso pode ser implementado com `@RequireRole('ADMIN')` adicional se necessário.

---

## Lista Completa de Permissões

### Total: 28 Permissões

#### Usuario (4 permissões)
- `usuario.create`
- `usuario.read`
- `usuario.update`
- `usuario.delete`

#### Evento (4 permissões)
- `evento.create`
- `evento.read`
- `evento.update`
- `evento.delete`

#### Financeiro (4 permissões)
- `financeiro.create`
- `financeiro.read`
- `financeiro.update`
- `financeiro.delete`

#### Lembrete (4 permissões)
- `lembrete.create`
- `lembrete.read`
- `lembrete.update`
- `lembrete.delete`

#### Local (4 permissões)
- `local.create`
- `local.read`
- `local.update`
- `local.delete`

#### Role (4 permissões)
- `role.create`
- `role.read`
- `role.update`
- `role.delete`

#### Permissao (4 permissões)
- `permissao.create`
- `permissao.read`
- `permissao.update`
- `permissao.delete`

---

## Script SQL para Criar Permissões

```sql
-- Inserir todas as permissões do sistema
INSERT INTO permissoes (nome) VALUES
-- Usuario
('usuario.create'),
('usuario.read'),
('usuario.update'),
('usuario.delete'),

-- Evento
('evento.create'),
('evento.read'),
('evento.update'),
('evento.delete'),

-- Financeiro
('financeiro.create'),
('financeiro.read'),
('financeiro.update'),
('financeiro.delete'),

-- Lembrete
('lembrete.create'),
('lembrete.read'),
('lembrete.update'),
('lembrete.delete'),

-- Local
('local.create'),
('local.read'),
('local.update'),
('local.delete'),

-- Role
('role.create'),
('role.read'),
('role.update'),
('role.delete'),

-- Permissao
('permissao.create'),
('permissao.read'),
('permissao.update'),
('permissao.delete');
```

---

## Sugestões de Roles e Permissões

### Role: ADMIN
**Permissões**: Todas as permissões do sistema

### Role: MANAGER
**Permissões**:
- `usuario.read`, `usuario.update`
- `evento.*` (todas)
- `financeiro.*` (todas)
- `lembrete.*` (todas)
- `local.*` (todas)
- `role.read`
- `permissao.read`

### Role: USER
**Permissões**:
- `usuario.read` (próprio usuário)
- `evento.read`, `evento.create`, `evento.update` (próprios eventos)
- `financeiro.read`, `financeiro.create`, `financeiro.update` (próprios registros)
- `lembrete.*` (próprios lembretes)
- `local.read`, `local.create`, `local.update` (próprios locais)

---

## Como Usar

### Verificar Permissão em Código

```typescript
import { container } from '../core/di/container';
import { TYPES } from '../core/di/types';
import { IAuthorizationService } from '../core/authorization/IAuthorizationService';

const authService = container.resolve<IAuthorizationService>(TYPES.IAuthorizationService);
const hasPermission = await authService.hasPermission(userId, 'usuario.create');
```

### Usar Decorator em Application Service

```typescript
@RequirePermission('usuario.create')
async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
  // ...
}
```

### Usar Middleware em Rotas

```typescript
router.post(
  '/usuarios',
  authMiddleware,
  requirePermission('usuario.create'),
  usuarioController.create
);
```

---

## Manutenção

### Adicionar Nova Permissão

1. Adicionar permissão no banco de dados usando o script SQL acima
2. Aplicar decorator `@RequirePermission('entidade.operacao')` no método apropriado
3. Atualizar este documento
4. Atribuir permissão às roles apropriadas

### Remover Permissão

1. Remover decorator do método
2. Remover permissão do banco de dados (cuidado: pode quebrar roles existentes)
3. Atualizar este documento

---

**Última Atualização**: 2024-01-01  
**Versão**: 1.0  
**Mantido por**: Tech Lead / Arquitetura
