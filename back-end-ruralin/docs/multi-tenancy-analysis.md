# Análise de Multi-Tenancy - Estrutura de Dados

## Resumo Executivo

Este documento apresenta a análise completa da estrutura atual de dados do sistema e o mapeamento para implementação de multi-tenancy. A análise identifica todas as tabelas, relacionamentos e define a estratégia de atribuição de tenants aos dados existentes.

**Data**: 2024-01-01  
**Versão**: 1.0

---

## Estrutura Atual de Dados

### Diagrama de Relacionamentos

```
usuarios (ROOT/CLIENT)
  ├── eventos (via usuarioId)
  │   └── locais (via localId)
  ├── locais (via usuarioId)
  ├── lembretes (via usuarioId)
  │   └── lembrete_data_hora (via lembreteId)
  ├── financeiros (via usuarioId)
  ├── audit_logs (via userId)
  ├── usuario_has_role (via usuarioId)
  │   └── roles
  │       └── role_has_permissao
  │           └── permissoes
  └── usuario_has_subUsuario
      ├── usuarioId (ROOT)
      └── subUsuarioId (CLIENT)
```

### Tabelas e Relacionamentos Detalhados

#### Tabela: `usuarios`
- **PK**: `id`
- **Campos**: `tipo` (ROOT/CLIENT), `nome`, `username`, `email`, `senha`, `whatsapp`, `apiKey`, `apiUrl`, `roleIds`
- **Relacionamentos**:
  - 1:N → `eventos` (via `usuarioId`)
  - 1:N → `locais` (via `usuarioId`)
  - 1:N → `lembretes` (via `usuarioId`)
  - 1:N → `financeiros` (via `usuarioId`)
  - 1:N → `audit_logs` (via `userId`)
  - N:M → `roles` (via `usuario_has_role`)
  - N:M → `usuarios` (via `usuario_has_subUsuario`)

#### Tabela: `eventos`
- **PK**: `id`
- **FK**: `usuarioId` → `usuarios.id`, `localId` → `locais.id`
- **Campos**: `titulo`, `descricao`, `data`, `horario_inicio`, `horario_fim`
- **Relacionamentos**:
  - N:1 → `usuarios` (via `usuarioId`)
  - N:1 → `locais` (via `localId`)

#### Tabela: `locais`
- **PK**: `id`
- **FK**: `usuarioId` → `usuarios.id`
- **Campos**: `desc_simples`, `desc_completa`
- **Relacionamentos**:
  - N:1 → `usuarios` (via `usuarioId`)
  - 1:N → `eventos` (via `localId`)

#### Tabela: `lembretes`
- **PK**: `id`
- **FK**: `usuarioId` → `usuarios.id`
- **Campos**: `desc_simples`, `desc_completa`
- **Relacionamentos**:
  - N:1 → `usuarios` (via `usuarioId`)
  - 1:N → `lembrete_data_hora` (via `lembreteId`)

#### Tabela: `lembrete_data_hora`
- **PK**: `id`
- **FK**: `lembreteId` → `lembretes.id`
- **Campos**: `data`, `hora`
- **Relacionamentos**:
  - N:1 → `lembretes` (via `lembreteId`)

#### Tabela: `financeiros`
- **PK**: `id`
- **FK**: `usuarioId` → `usuarios.id`
- **Campos**: `contaId`, `historicoId`, `planoFinanceiroId`, `tipoDocuentoId`, `tipoPagamentoId`, `contaDesc`, `historicoDesc`, `planoFinanceiroDesc`, `tipoDocuentoDesc`, `tipoPagamentoDesc`, `dataEmissao`, `dataVencimento`, `valor`, `observacao`
- **Relacionamentos**:
  - N:1 → `usuarios` (via `usuarioId`)

#### Tabela: `roles`
- **PK**: `id`
- **Campos**: `nome`
- **Relacionamentos**:
  - N:M → `usuarios` (via `usuario_has_role`)
  - N:M → `permissoes` (via `role_has_permissao`)

#### Tabela: `permissoes`
- **PK**: `id`
- **Campos**: `nome`
- **Relacionamentos**:
  - N:M → `roles` (via `role_has_permissao`)

#### Tabela: `usuario_has_role`
- **PK**: `usuarioId`, `roleId`
- **FK**: `usuarioId` → `usuarios.id`, `roleId` → `roles.id`
- **Relacionamentos**:
  - N:M → `usuarios` ↔ `roles`

#### Tabela: `role_has_permissao`
- **PK**: `roleId`, `permissaoId`
- **FK**: `roleId` → `roles.id`, `permissaoId` → `permissoes.id`
- **Relacionamentos**:
  - N:M → `roles` ↔ `permissoes`

#### Tabela: `usuario_has_subUsuario`
- **PK**: `usuarioId`, `subUsuarioId`
- **FK**: `usuarioId` → `usuarios.id`, `subUsuarioId` → `usuarios.id`
- **Relacionamentos**:
  - N:M → `usuarios` (ROOT) ↔ `usuarios` (CLIENT)

#### Tabela: `audit_logs`
- **PK**: `id`
- **FK**: `userId` → `usuarios.id`
- **Campos**: `action`, `entity`, `entityId`, `changes` (JSON), `ip`, `userAgent`, `timestamp`
- **Relacionamentos**:
  - N:1 → `usuarios` (via `userId`)

---

## Estratégia de Atribuição de Tenants

### Regras de Atribuição

#### 1. Usuários ROOT
```
tenantId = id (próprio ID)
```
Cada usuário ROOT é um tenant próprio.

#### 2. Usuários CLIENT
```
tenantId = tenantId do ROOT relacionado (via usuario_has_subUsuario)
Se não tiver ROOT: tenantId = id (próprio ID)
```
Usuários CLIENT herdam tenant do ROOT relacionado.

#### 3. Dados Relacionados a Usuários
```
tenantId = tenantId do usuarioId
```
- `eventos`, `locais`, `lembretes`, `financeiros` → herdam de `usuarioId`
- `audit_logs` → herda de `userId`

#### 4. Dados Relacionados Indiretamente
```
tenantId = tenantId do relacionamento pai
```
- `lembrete_data_hora` → herda de `lembrete.usuarioId.tenantId`
- `eventos` → validação: `evento.tenantId` deve ser igual a `local.tenantId`

#### 5. Tabelas de Junção
```
tenantId = tenantId da entidade principal
```
- `usuario_has_role` → herda de `usuarioId.tenantId`

#### 6. Dados Globais (Roles e Permissões)
**Opção A - Compartilhados** (Recomendado):
```
tenantId = NULL (compartilhados entre todos os tenants)
```

**Opção B - Isolados**:
```
tenantId = tenantId do tenant que criou
```

**Recomendação**: Opção A inicialmente.

---

## Mapeamento Detalado por Tabela

### Tabelas que Receberão tenantId

| Tabela | Estratégia | Fonte do tenantId |
|--------|-----------|-------------------|
| `usuarios` | Direto | ROOT: `id`, CLIENT: `usuario_has_subUsuario.usuarioId.tenantId` |
| `eventos` | Herança | `usuarioId.tenantId` |
| `locais` | Herança | `usuarioId.tenantId` |
| `lembretes` | Herança | `usuarioId.tenantId` |
| `lembrete_data_hora` | Herança Indireta | `lembreteId → usuarioId.tenantId` |
| `financeiros` | Herança | `usuarioId.tenantId` |
| `audit_logs` | Herança | `userId.tenantId` |
| `usuario_has_role` | Herança | `usuarioId.tenantId` |
| `roles` | Opcional | NULL (compartilhado) ou isolado |
| `permissoes` | Opcional | NULL (compartilhado) ou isolado |
| `role_has_permissao` | Opcional | NULL (se compartilhado) ou `roleId.tenantId` |

---

## Casos Especiais

### 1. CLIENTs sem ROOT relacionado

**Cenário**: CLIENT que não tem relacionamento em `usuario_has_subUsuario`

**Solução**: Atribuir `tenantId = id` (próprio ID)

**Validação**:
```sql
SELECT u.id, u.tipo, u.nome
FROM usuarios u
WHERE u.tipo = 'CLIENT'
AND NOT EXISTS (
  SELECT 1 FROM usuario_has_subUsuario uhs
  WHERE uhs.subUsuarioId = u.id
);
```

### 2. Eventos com Locais de Outro Tenant

**Cenário**: Evento pode referenciar Local de outro tenant (inconsistência)

**Solução**: Validação pós-migração e constraint de aplicação

**Validação**:
```sql
SELECT e.id, e.usuarioId, e.localId, e.tenantId, l.tenantId as local_tenantId
FROM eventos e
JOIN locais l ON l.id = e.localId
WHERE e.tenantId != l.tenantId;
```

### 3. Roles e Permissões Compartilhados vs. Isolados

**Decisão**: Compartilhados inicialmente (tenantId = NULL)

**Razão**:
- Mais simples de implementar
- Roles/permissões são geralmente globais
- Pode migrar para isolados depois se necessário

---

## Ordem de Migração

### Dependências

```
usuarios (base)
  ├── usuario_has_subUsuario (define relacionamentos)
  ├── eventos, locais, lembretes, financeiros (dependem de usuarios)
  │   ├── eventos (depende também de locais)
  │   └── lembrete_data_hora (depende de lembretes)
  ├── audit_logs (depende de usuarios)
  └── usuario_has_role (depende de usuarios e roles)
      └── roles (opcional: pode ser compartilhado)
          └── role_has_permissao (depende de roles e permissoes)
              └── permissoes (opcional: pode ser compartilhado)
```

### Ordem Recomendada

1. `usuarios` (base)
2. `usuario_has_subUsuario` (define relacionamentos tenant)
3. `locais`, `lembretes`, `financeiros` (dependem apenas de usuarios)
4. `eventos` (depende de usuarios e locais)
5. `lembrete_data_hora` (depende de lembretes)
6. `audit_logs` (depende de usuarios)
7. `usuario_has_role` (depende de usuarios e roles)
8. `roles`, `permissoes` (se isolados)
9. `role_has_permissao` (se roles/permissoes isolados)

---

## Validações Críticas

### Pré-Migração
- [ ] Backup completo realizado
- [ ] Contagem de registros em cada tabela
- [ ] Verificação de integridade referencial
- [ ] Identificação de CLIENTs sem ROOT
- [ ] Validação de relacionamentos `usuario_has_subUsuario`

### Pós-População
- [ ] Todos os registros têm tenantId
- [ ] Consistência de tenantId em relacionamentos
- [ ] Usuários ROOT têm tenantId = id
- [ ] Usuários CLIENT têm tenantId correto
- [ ] Dados relacionados têm tenantId consistente

### Pós-Migração
- [ ] tenantId é NOT NULL em todas as tabelas
- [ ] Índices criados corretamente
- [ ] Performance não degradou
- [ ] Isolamento de dados funcionando

---

## Referências

- [T17.1 - Análise de Dados Existentes](./features/fase%205/T17.1-Analise-Dados-Existentes.md)
- [Plano de Migração](./migration-plan.md)
- [Plano de Rollback](./rollback-plan.md)

---

**Última Atualização**: 2024-01-01  
**Versão**: 1.0
