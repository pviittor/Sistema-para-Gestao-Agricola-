# Modelo de Especificação de Tabela para Geração Automática de Backend

Este documento define o formato padrão para especificar uma tabela e gerar automaticamente toda a estrutura necessária no backend, incluindo:

- Model Sequelize
- Repository (com interface)
- DTOs (Create, Update, Response)
- Application Service (com interface)
- Controller (com interface)
- Routes
- Migrations
- Registros no DI Container
- Validações
- Relacionamentos
- Permissões
- Cache
- Auditoria
- Multi-tenancy

---

## Estrutura do Documento

Cada especificação de tabela deve seguir este formato JSON estruturado:

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
    "keys": [
      "entidade:list:*",
      "entidade:findByCampo:*"
    ]
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
        {
          "name": "campo",
          "type": "string|number",
          "required": true
        }
      ],
      "returnType": "Entity[]|Entity"
    }
  ]
}
```

---

## Detalhamento dos Campos

### 1. Table

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | string | Sim | Nome da tabela no banco (snake_case) |
| `singularName` | string | Sim | Nome singular da entidade (PascalCase) |
| `pluralName` | string | Sim | Nome plural da entidade (PascalCase) |
| `description` | string | Não | Descrição da entidade |
| `multiTenant` | boolean | Não | Se a entidade possui isolamento por tenant (default: true) |
| `auditable` | boolean | Não | Se as operações devem ser auditadas (default: true) |
| `cacheable` | boolean | Não | Se os dados devem ser cacheados (default: true) |

### 2. Fields

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | string | Sim | Nome do campo (snake_case) |
| `type` | string | Sim | Tipo Sequelize (STRING, INTEGER, TEXT, DATE, DATEONLY, TIME, BOOLEAN, DECIMAL, JSON) |
| `required` | boolean | Não | Se o campo é obrigatório (default: false) |
| `unique` | boolean | Não | Se o campo deve ser único (default: false) |
| `defaultValue` | any | Não | Valor padrão do campo |
| `comment` | string | Não | Comentário/documentação do campo |
| `validation` | object | Não | Regras de validação (ver abaixo) |
| `excludeFromCreate` | boolean | Não | Excluir do DTO de criação (default: false) |
| `excludeFromUpdate` | boolean | Não | Excluir do DTO de atualização (default: false) |
| `excludeFromResponse` | boolean | Não | Excluir do DTO de resposta (default: false) |

#### Tipos de Campo Suportados

- `STRING`: Texto curto (VARCHAR)
- `TEXT`: Texto longo
- `INTEGER`: Número inteiro
- `DECIMAL`: Número decimal
- `DATE`: Data e hora (DATETIME)
- `DATEONLY`: Apenas data (DATE)
- `TIME`: Apenas hora (TIME)
- `BOOLEAN`: Verdadeiro/Falso
- `JSON`: Objeto JSON

#### Validation Object

```json
{
  "min": 0,
  "max": 100,
  "pattern": "^[0-9]{3}-[0-9]{3}-[0-9]{4}$",
  "custom": "IsEmail|IsDateString|IsTime|IsUnique:Modelo,campo"
}
```

**Validações Customizadas Disponíveis:**
- `IsEmail`: Valida formato de email
- `IsDateString`: Valida formato de data (YYYY-MM-DD)
- `IsTime`: Valida formato de hora (HH:mm:ss)
- `IsUnique:Modelo,campo`: Valida unicidade no banco
- `IsExists:Modelo,campo`: Valida existência de registro relacionado
- `IsTimeAfter:campo,dataCampo`: Valida se hora é posterior a outra

### 3. Relationships

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `type` | string | Sim | Tipo de relacionamento (belongsTo, hasMany, hasOne, belongsToMany) |
| `target` | string | Sim | Nome do modelo relacionado (PascalCase) |
| `foreignKey` | string | Sim | Nome da chave estrangeira (snake_case) |
| `as` | string | Não | Alias para o relacionamento |
| `required` | boolean | Não | Se o relacionamento é obrigatório (default: false) |
| `onDelete` | string | Não | Ação ao deletar (CASCADE, SET NULL, RESTRICT) |

### 4. Permissions

Define as permissões necessárias para cada operação CRUD:

```json
{
  "create": "entidade.create",
  "read": "entidade.read",
  "update": "entidade.update",
  "delete": "entidade.delete"
}
```

### 5. Cache

Configuração de cache para a entidade:

```json
{
  "enabled": true,
  "ttl": 3600,
  "keys": [
    "entidade:list:*",
    "entidade:findByCampo:*"
  ]
}
```

### 6. Business Rules

Regras de negócio específicas da entidade:

```json
{
  "type": "validation|crossTenant|custom",
  "description": "Descrição da regra",
  "implementation": "Código ou descrição detalhada"
}
```

**Tipos de Regras:**
- `validation`: Validação de dados antes de salvar
- `crossTenant`: Validação de relacionamento entre tenants
- `custom`: Regra de negócio personalizada

### 7. Custom Methods

Métodos customizados para Repository ou Application Service:

```json
{
  "name": "findByCampo",
  "type": "repository|service",
  "description": "Descrição do método",
  "parameters": [
    {
      "name": "campo",
      "type": "string|number",
      "required": true
    }
  ],
  "returnType": "Entity[]|Entity"
}
```

---

## Exemplo Completo: Tabela Evento

```json
{
  "table": {
    "name": "eventos",
    "singularName": "Evento",
    "pluralName": "Eventos",
    "description": "Eventos agendados pelos usuários",
    "multiTenant": true,
    "auditable": true,
    "cacheable": true
  },
  "fields": [
    {
      "name": "id",
      "type": "INTEGER",
      "required": true,
      "unique": true,
      "excludeFromCreate": true,
      "excludeFromUpdate": true,
      "comment": "ID único do evento"
    },
    {
      "name": "tenantId",
      "type": "INTEGER",
      "required": true,
      "excludeFromCreate": true,
      "excludeFromUpdate": true,
      "excludeFromResponse": false,
      "comment": "ID do tenant ao qual o evento pertence"
    },
    {
      "name": "usuarioId",
      "type": "INTEGER",
      "required": true,
      "excludeFromCreate": true,
      "excludeFromUpdate": true,
      "comment": "ID do usuário que criou o evento"
    },
    {
      "name": "titulo",
      "type": "STRING",
      "required": true,
      "comment": "Título do evento",
      "validation": {
        "min": 3,
        "max": 255
      }
    },
    {
      "name": "descricao",
      "type": "TEXT",
      "required": true,
      "comment": "Descrição detalhada do evento"
    },
    {
      "name": "data",
      "type": "DATEONLY",
      "required": true,
      "comment": "Data do evento",
      "validation": {
        "custom": "IsDateString"
      }
    },
    {
      "name": "horario_inicio",
      "type": "TIME",
      "required": true,
      "comment": "Horário de início do evento",
      "validation": {
        "pattern": "^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$",
        "custom": "IsTime"
      }
    },
    {
      "name": "horario_fim",
      "type": "TIME",
      "required": true,
      "comment": "Horário de fim do evento",
      "validation": {
        "pattern": "^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$",
        "custom": "IsTimeAfter:horario_inicio,data"
      }
    },
    {
      "name": "localId",
      "type": "INTEGER",
      "required": true,
      "comment": "ID do local onde o evento ocorrerá",
      "validation": {
        "custom": "IsExists:Local,id"
      }
    }
  ],
  "relationships": [
    {
      "type": "belongsTo",
      "target": "Local",
      "foreignKey": "localId",
      "as": "local",
      "required": true,
      "onDelete": "RESTRICT"
    },
    {
      "type": "belongsTo",
      "target": "Usuario",
      "foreignKey": "usuarioId",
      "as": "usuario",
      "required": true,
      "onDelete": "CASCADE"
    }
  ],
  "permissions": {
    "create": "evento.create",
    "read": "evento.read",
    "update": "evento.update",
    "delete": "evento.delete"
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "keys": [
      "evento:list:*",
      "evento:findByLocal:*",
      "evento:findByData:*"
    ]
  },
  "businessRules": [
    {
      "type": "crossTenant",
      "description": "Validar se o Local pertence ao mesmo tenant do Evento",
      "implementation": "Verificar se local.tenantId === evento.tenantId antes de criar/atualizar"
    },
    {
      "type": "validation",
      "description": "Validar se horário de fim é posterior ao horário de início",
      "implementation": "Usar validador IsTimeAfter"
    }
  ],
  "customMethods": [
    {
      "name": "findByLocal",
      "type": "repository",
      "description": "Busca eventos por local",
      "parameters": [
        {
          "name": "localId",
          "type": "number",
          "required": true
        }
      ],
      "returnType": "Evento[]"
    },
    {
      "name": "findByData",
      "type": "repository",
      "description": "Busca eventos por período de datas",
      "parameters": [
        {
          "name": "dataInicio",
          "type": "string|Date",
          "required": true
        },
        {
          "name": "dataFim",
          "type": "string|Date",
          "required": true
        }
      ],
      "returnType": "Evento[]"
    }
  ]
}
```

---

## Exemplo Simples: Tabela Local

```json
{
  "table": {
    "name": "locais",
    "singularName": "Local",
    "pluralName": "Locais",
    "description": "Locais onde eventos podem ocorrer",
    "multiTenant": true,
    "auditable": true,
    "cacheable": true
  },
  "fields": [
    {
      "name": "id",
      "type": "INTEGER",
      "required": true,
      "unique": true,
      "excludeFromCreate": true,
      "excludeFromUpdate": true
    },
    {
      "name": "tenantId",
      "type": "INTEGER",
      "required": true,
      "excludeFromCreate": true,
      "excludeFromUpdate": true
    },
    {
      "name": "nome",
      "type": "STRING",
      "required": true,
      "validation": {
        "min": 3,
        "max": 255
      }
    },
    {
      "name": "desc_completa",
      "type": "TEXT",
      "required": false
    }
  ],
  "relationships": [],
  "permissions": {
    "create": "local.create",
    "read": "local.read",
    "update": "local.update",
    "delete": "local.delete"
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "keys": ["local:list:*"]
  },
  "businessRules": [],
  "customMethods": []
}
```

---

## Campos Especiais

### Campos Automáticos

Os seguintes campos são adicionados automaticamente e não precisam ser especificados:

- `id`: INTEGER, auto-increment, primary key
- `createdAt`: DATE (automático do Sequelize)
- `updatedAt`: DATE (automático do Sequelize)

### Campos Multi-Tenant

Se `multiTenant: true`, o campo `tenantId` é adicionado automaticamente:
- Tipo: INTEGER
- Obrigatório: true
- Excluído de Create/Update (preenchido automaticamente)
- Incluído em Response (opcional, controlado por `excludeFromResponse`)

### Campos de Auditoria

Se `auditable: true`, os decoradores `@Auditable` são adicionados automaticamente aos métodos do Application Service.

---

## Estrutura de Arquivos Gerados

Com base na especificação, os seguintes arquivos serão gerados:

### 1. Model
- `src/models/{SingularName}.ts`

### 2. Repository
- `src/infrastructure/repository/{SingularName}Repository.ts`
- `src/infrastructure/repository/I{SingularName}Repository.ts`

### 3. DTOs
- `src/application/dto/{nome}/Create{SingularName}Dto.ts`
- `src/application/dto/{nome}/Update{SingularName}Dto.ts`
- `src/application/dto/{nome}/{SingularName}ResponseDto.ts`
- `src/application/dto/{nome}/index.ts`

### 4. Application Service
- `src/application/services/{nome}/{SingularName}ApplicationService.ts`
- `src/application/services/{nome}/I{SingularName}ApplicationService.ts`

### 5. Controller
- `src/controllers/{SingularName}Controller.ts`
- `src/controllers/interfaces/I{SingularName}Controller.ts`

### 6. Routes
- `src/routes/{nome}.routes.ts`

### 7. Migration
- `src/migrations/{timestamp}-create-{table-name}.ts`

### 8. Mapper (se necessário)
- `src/application/mappers/{SingularName}Mapper.ts`

### 9. Registros DI
- Atualização de `src/core/di/types.ts`
- Atualização de `src/core/di/container.ts`

---

## Convenções de Nomenclatura

### Tabelas e Modelos
- Tabela: `snake_case` plural (ex: `eventos`, `locais`)
- Modelo: `PascalCase` singular (ex: `Evento`, `Local`)

### Arquivos
- Model: `{SingularName}.ts`
- Repository: `{SingularName}Repository.ts`
- DTO: `Create{SingularName}Dto.ts`, `Update{SingularName}Dto.ts`, `{SingularName}ResponseDto.ts`
- Service: `{SingularName}ApplicationService.ts`
- Controller: `{SingularName}Controller.ts`
- Routes: `{nome}.routes.ts` (snake_case)

### Diretórios
- DTOs: `src/application/dto/{nome}/` (snake_case)
- Services: `src/application/services/{nome}/` (snake_case)
- Repositories: `src/infrastructure/repository/`
- Models: `src/models/`
- Controllers: `src/controllers/`
- Routes: `src/routes/`

---

## Validações Padrão por Tipo

| Tipo Sequelize | Validações Padrão | DTO Decorators |
|----------------|-------------------|----------------|
| `STRING` | `@IsString()`, `@IsNotEmpty()` (se required) | `@MinLength()`, `@MaxLength()` (se min/max) |
| `TEXT` | `@IsString()`, `@IsNotEmpty()` (se required) | - |
| `INTEGER` | `@IsInt()`, `@Min(1)` (se required) | `@IsNotEmpty()` (se required) |
| `DECIMAL` | `@IsNumber()`, `@Min(0)` (se required) | `@IsNotEmpty()` (se required) |
| `DATE` | `@IsDateString()` (se required) | `@IsNotEmpty()` (se required) |
| `DATEONLY` | `@IsDateString()` (se required) | `@IsNotEmpty()` (se required) |
| `TIME` | `@IsString()`, `@Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)` | `@IsNotEmpty()` (se required) |
| `BOOLEAN` | `@IsBoolean()` (se required) | `@IsNotEmpty()` (se required) |
| `JSON` | `@IsObject()` ou `@IsArray()` (se required) | `@IsNotEmpty()` (se required) |

---

## Notas Importantes

1. **Multi-Tenancy**: Todas as entidades com `multiTenant: true` terão filtro automático por `tenantId` no Repository.

2. **Auditoria**: Métodos `create`, `update`, `delete` do Application Service receberão automaticamente o decorador `@Auditable`.

3. **Cache**: Métodos de leitura receberão `@Cacheable` e métodos de escrita receberão `@CacheEvict` automaticamente.

4. **Transações**: Métodos de escrita (`create`, `update`, `delete`) receberão automaticamente o decorador `@Transactional`.

5. **Permissões**: Todos os métodos do Controller e Application Service receberão validação de permissão baseada na configuração `permissions`.

6. **Validações Cross-Tenant**: Regras do tipo `crossTenant` serão implementadas no Application Service antes de criar/atualizar.

7. **Relacionamentos**: As associações Sequelize serão criadas automaticamente no Model e validações de existência serão adicionadas aos DTOs.

---

## Como Usar Este Modelo

1. Crie um arquivo JSON seguindo este modelo
2. Forneça o arquivo em um prompt para geração automática
3. O sistema gerará todos os arquivos necessários
4. Revise e ajuste conforme necessário

**Exemplo de Prompt:**
```
Gere toda a estrutura do backend para a tabela especificada no arquivo @docs/templates/modelo-especificacao-tabela-exemplo.json
```

---

## Checklist de Validação

Antes de usar uma especificação, verifique:

- [ ] Nome da tabela está em `snake_case` plural
- [ ] Nome singular está em `PascalCase`
- [ ] Todos os campos obrigatórios têm `required: true`
- [ ] Campos com relacionamentos têm validação `IsExists`
- [ ] Campos únicos têm validação `IsUnique`
- [ ] Permissões seguem o padrão `{entidade}.{acao}`
- [ ] Relacionamentos têm `onDelete` definido
- [ ] Regras de negócio estão documentadas
- [ ] Métodos customizados têm tipos de retorno definidos

---

**Última atualização**: 2025-01-15
**Versão**: 1.0.0
