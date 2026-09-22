---
description: Gerar plano de implementação detalhado a partir de requisitos aprovados (req-). Uso quando pronto para planejar como construir algo, dividir trabalho em etapas ordenadas ou decidir delegação.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent, mcp__ram__ram_set, mcp__ram__ram_get, mcp__ram__ram_list, mcp__ram__ram_search, mcp__ram__ram_delete, mcp__ram__ram_snapshot, mcp__ram__ram_stats
argument-hint: <numero-sprint-ou-descricao-feature> <caminho-para-req-ou-descricao>
---

# Skill: Implementation Plan (req-plan)

Build an implementation plan and save it as a persistent, reviewable artifact.

## Argumento recebido

$ARGUMENTS

## When to Use

- Ready to plan how to build something — with or without a spec
- Need to think through implementation approach, ordering, and delegation
- Want a reviewable plan that persists across sessions

Triggers: "prep plan", "prep-plan", "prepare a plan", "plan this", "make a plan", "break this into steps", "plan the implementation", "what order should we build this"

## RamPage MCP — Working Memory (OBRIGATÓRIO)

Esta skill DEVE usar o RamPage MCP como memória de trabalho externa durante todo o processo.

### Convenção de Chaves

Use chaves hierárquicas com `/` para organizar:

| Fase | Chave | Conteúdo |
|------|-------|----------|
| Início | `plan/{feature}/status` | Status atual: "em andamento", "gaps encontrados", "aguardando user", "concluído" |
| Contexto | `plan/{feature}/prior-work` | Resumo de trabalho anterior encontrado (sprints, req-, decisões) |
| Contexto | `plan/{feature}/codebase-context` | Resumo da exploração do codebase |
| Contexto | `plan/{feature}/spec-summary` | Resumo do req- / spec relevante |
| Gaps | `plan/{feature}/gaps` | Lista de ambiguidades, contradições, suposições não validadas |
| Decisões | `plan/{feature}/decisions` | Decisões tomadas durante o planejamento |
| Resultado | `plan/{feature}/output-path` | Caminho do arquivo do plano salvo |
| Resultado | `plan/{feature}/summary` | Resumo final: total etapas, arquivos, estimativas |

### Comportamento Obrigatório

1. **Ao iniciar**: Chamar `mcp__ram__ram_list` para verificar contexto existente. Usar `mcp__ram__ram_search` com termos da feature/sprint para encontrar trabalho anterior.
2. **Ao ler arquivos >100 linhas**: Armazenar resumo via `mcp__ram__ram_set` com chave `file-summary/{path}` e tags relevantes. Antes de re-ler um arquivo, verificar RAM primeiro com `mcp__ram__ram_get`.
3. **Ao explorar codebase**: Armazenar achados via `mcp__ram__ram_set` com chave `plan/{feature}/codebase-context`.
4. **Ao encontrar gaps**: Armazenar via `mcp__ram__ram_set` com chave `plan/{feature}/gaps`.
5. **Ao tomar decisões**: Armazenar via `mcp__ram__ram_set` com chave `plan/{feature}/decisions`.
6. **Ao finalizar**: Armazenar resumo via `mcp__ram__ram_set` com chave `done/plan-{feature}` para que sessões futuras tenham contexto.
7. **Cleanup**: Após plano aprovado e salvo, usar `mcp__ram__ram_delete` com prefix `plan/{feature}/` para remover entries temporárias, mantendo apenas `done/plan-{feature}`.

---

## Process

### 1. Context Check

Before starting, scan the recent conversation history. If `/specify`, `/design`, or `/brainstorm` was invoked in the last 10-20 messages, warn the user:

> "Percebi que acabamos de trabalhar em [spec/design/brainstorm] nesta sessão. Planos escritos em contexto quente herdam suposições implícitas — o que parece óbvio agora não será óbvio lendo o plano a frio. A maldição do conhecimento faz com que eu pule detalhes porque 'acabamos de falar sobre isso.'
>
> Recomendação: Inicie uma sessão nova, execute `/req-plan` e referencie o arquivo spec/design. O plano será mais forte.
>
> Continuar mesmo assim?"

If the user chooses to continue, proceed. If they decline, stop here.

### 2. Initialize RAM & Search Prior Work

```
mcp__ram__ram_list()                              → ver todo contexto existente
mcp__ram__ram_search("sprint {N}")                → buscar sprints anteriores
mcp__ram__ram_search("{feature-name}")            → buscar trabalho relacionado
mcp__ram__ram_set("plan/{feature}/status", "em andamento", tags=["plan","sprint-{N}"])
```

Também buscar em disco:
- `C:/RuralIn/src/backend/documentos/sprints/` — sprint plans existentes
- `C:/RuralIn/src/backend/documentos/` — arquivos req-

Armazenar achados:
```
mcp__ram__ram_set("plan/{feature}/prior-work", "{resumo do que encontrou}", tags=["plan","context"])
```

### 3. Gather Context

Ler e armazenar resumos de cada fonte:

- Relevant specs from `C:/RuralIn/src/backend/documentos/` (req- files)
- Sprint plans from `C:/RuralIn/src/backend/documentos/sprints/`
- Backend CLAUDE.md: `C:/RuralIn/src/backend/back-end-ruralin/CLAUDE.md`
- Frontend CLAUDE.md: `C:/RuralIn/src/backend/front-end-ruralin/CLAUDE.md`
- Feature template: `C:/RuralIn/src/backend/back-end-ruralin/docs/templates/modelo-feature-template.md`
- Scaffolding templates: `C:/RuralIn/src/backend/back-end-ruralin/docs/templates/scaffolding/`

Para cada arquivo lido >100 linhas:
```
mcp__ram__ram_set("file-summary/{path}", "{resumo conciso}", tags=["file","plan"])
```

Armazenar resumo do spec:
```
mcp__ram__ram_set("plan/{feature}/spec-summary", "{resumo dos requisitos}", tags=["plan","spec"])
```

### 4. Explore the Codebase

Use the Agent tool with Explore subagent to understand current state:
- What exists? What patterns are in use?
- Where will changes land?
- What dependencies exist?

Armazenar resultados da exploração:
```
mcp__ram__ram_set("plan/{feature}/codebase-context", "{achados da exploração}", tags=["plan","codebase"])
```

### 5. Surface Gaps

Before presenting anything, review collected context for:
- **Ambiguous requirements** (could mean more than one thing)
- **Contradictions** between spec, design, and current code
- **Unstated assumptions** you'd need to fill to write concrete steps
- **Missing information** (error handling, edge cases, integration points not addressed)

Se gaps encontrados, armazenar e perguntar ao user:
```
mcp__ram__ram_set("plan/{feature}/gaps", "{lista de gaps}", tags=["plan","gaps"])
mcp__ram__ram_set("plan/{feature}/status", "gaps encontrados - aguardando user")
```

If gaps exist, list them and ask the user to resolve them before continuing.
Do NOT fill gaps with plausible defaults.

If the context is clear enough to plan against, say so and proceed.

### 6. Present Context Summary

Sintetizar a partir da RAM:
```
mcp__ram__ram_get("plan/{feature}/prior-work")
mcp__ram__ram_get("plan/{feature}/spec-summary")
mcp__ram__ram_get("plan/{feature}/codebase-context")
mcp__ram__ram_get("plan/{feature}/gaps")
```

Confirm scope is understood before drafting the plan.

### 7. Draft the Plan

- Map requirements to concrete implementation steps
- Order steps by dependency (what must exist before what)
- Follow the implementation order from CLAUDE.md:
  1. Migrations
  2. Models
  3. Repositories
  4. DTOs + Mappers
  5. Services
  6. Controllers + Routes
  7. DI Registration
  8. Frontend Types
  9. Frontend Services
  10. Frontend Stores
  11. Frontend Views + Components
- Identify which steps need specialized expertise
- Include validation approach

Armazenar decisões tomadas durante o draft:
```
mcp__ram__ram_set("plan/{feature}/decisions", "{decisões arquiteturais}", tags=["plan","decision"])
```

### 8. Confirm with User

Present the plan and get approval before saving.

### 9. Save

Save to `C:/RuralIn/src/backend/documentos/sprints/` or appropriate location.

Armazenar referência do arquivo salvo:
```
mcp__ram__ram_set("plan/{feature}/output-path", "{caminho do arquivo}", tags=["plan","output"])
```

### 10. Finalize RAM

Criar resumo final persistente e limpar entries temporárias:
```
mcp__ram__ram_set("done/plan-{feature}", "{resumo: N etapas, M arquivos, estimativa, caminho do plano}", tags=["done","plan","sprint-{N}"])
mcp__ram__ram_delete("plan/{feature}/")   → limpar entries temporárias (status, gaps, etc.)
```

### 11. Offer Fresh-Eyes Review

After saving, offer to review the plan with fresh context.

## Output Format

### Document Structure

```markdown
# Plano: [Feature Name]

## Referências

**Spec**: [path to req- file]
**Sprint**: [sprint number if applicable]

Requisitos endereçados:
- REQ-XX-1: [brief description] → Steps [N, M]
- REQ-XX-2: [brief description] → Step [P]

## Contexto do Codebase

O que a exploração encontrou:
- [Código existente relevante, padrões, convenções]
- [Onde as mudanças serão aplicadas]
- [Dependências e pontos de integração]

## Etapas de Implementação

### Etapa 1: [Description]

**Arquivos**: [files affected]
**Endereça**: REQ-XX-N
**Expertise**: [nenhuma / domínio específico]

[O que fazer, concretamente. Descrever a mudança.]

### Etapa 2: [Description]
...

### Etapa N: Validação

Verificar que todos os requisitos foram atendidos.

## Guia de Delegação

Etapas que requerem expertise especializada:
- [Etapa X]: [que expertise]
- [Etapa Y]: [que expertise]

## Questões em Aberto

(Opcional) Coisas a resolver durante implementação que não bloqueiam o início.
```

## Especificação de Tabela — Formato Padrão

Para entidades novas, usar o formato JSON estruturado para especificar tabelas e gerar automaticamente toda a estrutura backend.

### Estrutura JSON

```json
{
  "table": {
    "name": "nome_da_tabela",
    "singularName": "NomeSingular",
    "pluralName": "NomesPlurais",
    "description": "Descrição da entidade",
    "multiTenant": true,
    "auditable": true,
    "cacheable": true
  },
  "fields": [
    {
      "name": "campo",
      "type": "STRING|INTEGER|TEXT|DATE|DATEONLY|TIME|BOOLEAN|DECIMAL|JSON",
      "required": true,
      "unique": false,
      "defaultValue": null,
      "comment": "Descrição do campo",
      "validation": {
        "min": null,
        "max": null,
        "pattern": null,
        "custom": null
      },
      "excludeFromCreate": false,
      "excludeFromUpdate": false,
      "excludeFromResponse": false
    }
  ],
  "relationships": [
    {
      "type": "belongsTo|hasMany|hasOne|belongsToMany",
      "target": "NomeModelo",
      "foreignKey": "campoId",
      "as": "alias",
      "required": true,
      "onDelete": "CASCADE|SET NULL|RESTRICT"
    }
  ],
  "permissions": {
    "create": "entidade.create",
    "read": "entidade.read",
    "update": "entidade.update",
    "delete": "entidade.delete"
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "keys": ["entidade:list:*"]
  },
  "businessRules": [
    {
      "type": "validation|crossTenant|custom",
      "description": "Descrição da regra",
      "implementation": "código ou descrição"
    }
  ],
  "customMethods": [
    {
      "name": "findByCampo",
      "type": "repository|service",
      "description": "Busca entidades por campo específico",
      "parameters": [
        { "name": "campo", "type": "string|number", "required": true }
      ],
      "returnType": "Entity[]|Entity"
    }
  ]
}
```

### Campos Especiais

**Campos Automáticos** (não precisam ser especificados):
- `id`: INTEGER, auto-increment, primary key
- `createdAt`: DATE (automático do Sequelize)
- `updatedAt`: DATE (automático do Sequelize)

**Multi-Tenant** (se `multiTenant: true`):
- `tenantId` é adicionado automaticamente
- Excluído de Create/Update (preenchido pelo middleware)

**Auditoria** (se `auditable: true`):
- Decoradores `@Auditable` adicionados ao Application Service

### Validações Padrão por Tipo

| Tipo | Decorators |
|------|-----------|
| `STRING` | `@IsString()`, `@IsNotEmpty()`, `@MinLength()`, `@MaxLength()` |
| `TEXT` | `@IsString()`, `@IsNotEmpty()` |
| `INTEGER` | `@IsInt()`, `@Min(1)` |
| `DECIMAL` | `@IsNumber()`, `@Min(0)` |
| `DATEONLY` | `@IsDateString()` |
| `TIME` | `@IsString()`, `@Matches(/^HH:mm:ss$/)` |
| `BOOLEAN` | `@IsBoolean()` |
| `JSON` | `@IsObject()` ou `@IsArray()` |

**Validações Customizadas:**
- `IsEmail`, `IsDateString`, `IsTime`
- `IsUnique:Modelo,campo` — unicidade no banco
- `IsExists:Modelo,campo` — existência de registro relacionado
- `IsTimeAfter:campo,dataCampo` — hora posterior a outra
- `IsDateAfter:campo` — data posterior a outra
- `IsRequiredIf:campo,valor` — obrigatório condicionalmente
- `IsValidEnum:valor1,valor2,...` — validação de enum

### Estrutura de Arquivos Gerados

Para cada entidade nova:

| Camada | Arquivo |
|--------|---------|
| Model | `src/models/{SingularName}.ts` |
| Repository Interface | `src/infrastructure/repository/I{SingularName}Repository.ts` |
| Repository | `src/infrastructure/repository/{SingularName}Repository.ts` |
| Create DTO | `src/application/dto/{nome}/Create{SingularName}Dto.ts` |
| Update DTO | `src/application/dto/{nome}/Update{SingularName}Dto.ts` |
| Response DTO | `src/application/dto/{nome}/{SingularName}ResponseDto.ts` |
| DTO Index | `src/application/dto/{nome}/index.ts` |
| Mapper | `src/application/mappers/{SingularName}Mapper.ts` |
| Service Interface | `src/application/services/{nome}/I{SingularName}ApplicationService.ts` |
| Service | `src/application/services/{nome}/{SingularName}ApplicationService.ts` |
| Controller Interface | `src/controllers/interfaces/I{SingularName}Controller.ts` |
| Controller | `src/controllers/{SingularName}Controller.ts` |
| Routes | `src/routes/{nome}.routes.ts` |
| Migration | `src/migrations/{timestamp}-create-{table-name}.ts` |
| DI Types | `src/core/di/types.ts` (atualizar) |
| DI Container | `src/core/di/container.ts` (atualizar) |

### Master-Detail Pattern

Para entidades com filhos, seguir o padrão documentado em CLAUDE.md:
- Service do pai orquestra filhos
- `@Transactional` sempre
- DTOs filhos usam sufixo `SemIdDto` (sem FK do pai)
- Associações definidas no arquivo do filho
- Dual routes: `POST /entity` e `POST /entity/completo`
- Update = delete-and-recreate dentro de `@Transactional`

### Convenções de Nomenclatura

| Item | Convenção | Exemplo |
|------|-----------|---------|
| Tabela DB | `C{NNN}_{camelCase}` | `C060_fluxoCaixaConfiguracao` |
| Modelo | PascalCase singular | `FluxoCaixaConfiguracao` |
| Repository | PascalCase + Repository | `FluxoCaixaConfiguracaoRepository` |
| Service | PascalCase + ApplicationService | `FluxoCaixaConfiguracaoApplicationService` |
| Controller | PascalCase + Controller | `FluxoCaixaConfiguracaoController` |
| DI Token | `Symbol.for('I{Name}Repository')` | `Symbol.for('IFluxoCaixaConfiguracaoRepository')` |
| Permissão | `{snake_case}.{action}` | `fluxo_caixa_configuracao.create` |
| Diretório DTO | camelCase | `src/application/dto/fluxoCaixaConfiguracao/` |

### Checklist de Validação

Antes de usar uma especificação, verificar:

- [ ] Nome da tabela segue padrão `C{NNN}_{camelCase}`
- [ ] Nome singular em PascalCase
- [ ] Campos obrigatórios têm `required: true`
- [ ] Campos com relacionamentos têm validação `IsExists`
- [ ] Campos únicos têm validação `IsUnique`
- [ ] Permissões seguem padrão `{entidade}.{acao}`
- [ ] Relacionamentos têm `onDelete` definido
- [ ] Regras de negócio documentadas
- [ ] Métodos customizados com tipos de retorno definidos
- [ ] Se Master-Detail: seguir padrão `SemIdDto`, `/completo`, delete-and-recreate

## What vs How

| Documento | Responde | Exemplo |
|-----------|----------|---------|
| **Spec (req-)** | O que estamos construindo? | "Painel de fluxo de caixa projetado" |
| **Design** | Como funciona? | "Agregação paralela de 5 fontes com agrupamento por período" |
| **Plan** | Como construímos? | "Etapa 1: Migration, Etapa 2: Model, ..." |

Um plano nomeia arquivos, funções e etapas. Isso é o que o diferencia de um design.
