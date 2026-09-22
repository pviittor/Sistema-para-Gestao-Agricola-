# 📋 Modelo de Especificação de Feature

Este documento serve como template para especificar novas features do sistema. Preencha todas as seções conforme a feature que será implementada.

---

## 📊 Informações da Feature

**Nome da Feature**: `[Nome da Feature]`  
**Módulo**: `[Módulo/Área]` (ex: Financeiro, UI, Cadastros)  
**RICE**: `[Valor]` | **Esforço**: `[Tempo estimado]` | **Status**: `[💰 Base | 🚀 Alta | 🔥 Crítica]`

**Descrição**: `[Descrição breve da feature]`

---

## 📄 Especificação da Tabela

```json
{
  "table": {
    "name": "[nome_da_tabela]",
    "singularName": "[NomeSingular]",
    "pluralName": "[NomesPlurais]",
    "description": "[Descrição da entidade]",
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
      "comment": "ID único da entidade"
    },
    {
      "name": "tenantId",
      "type": "INTEGER",
      "required": true,
      "excludeFromCreate": true,
      "excludeFromUpdate": true,
      "comment": "ID do tenant ao qual a entidade pertence"
    },
    {
      "name": "[campo_exemplo]",
      "type": "STRING|INTEGER|TEXT|DATE|DATEONLY|TIME|BOOLEAN|DECIMAL|JSON",
      "required": true,
      "unique": false,
      "defaultValue": null,
      "comment": "[Descrição do campo]",
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
      "target": "[NomeModelo]",
      "foreignKey": "[campoId]",
      "as": "[alias]",
      "required": true,
      "onDelete": "CASCADE|SET NULL|RESTRICT"
    }
  ],
  "permissions": {
    "create": "[entidade].create",
    "read": "[entidade].read",
    "update": "[entidade].update",
    "delete": "[entidade].delete"
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "keys": [
      "[entidade]:list:*",
      "[entidade]:findByCampo:*"
    ]
  },
  "businessRules": [
    {
      "type": "validation|crossTenant|custom",
      "description": "[Descrição da regra]",
      "implementation": "[Código ou descrição detalhada]"
    }
  ],
  "customMethods": [
    {
      "name": "[findByCampo]",
      "type": "repository|service",
      "description": "[Descrição do método]",
      "parameters": [
        {
          "name": "[campo]",
          "type": "string|number",
          "required": true
        }
      ],
      "returnType": "[Entity[]|Entity]"
    }
  ]
}
```

### 📝 Guia de Preenchimento da Especificação

#### 1. Table
- **name**: Nome da tabela no banco (snake_case, plural)
- **singularName**: Nome singular da entidade (PascalCase)
- **pluralName**: Nome plural da entidade (PascalCase)
- **description**: Descrição da entidade
- **multiTenant**: `true` se a entidade possui isolamento por tenant (padrão: `true`)
- **auditable**: `true` se as operações devem ser auditadas (padrão: `true`)
- **cacheable**: `true` se os dados devem ser cacheados (padrão: `true`)

#### 2. Fields

**Tipos de Campo Disponíveis:**
- `STRING`: Texto curto (VARCHAR) - use `max` para definir tamanho
- `TEXT`: Texto longo
- `INTEGER`: Número inteiro
- `DECIMAL`: Número decimal - use `precision` e `scale` se necessário
- `DATE`: Data e hora (DATETIME)
- `DATEONLY`: Apenas data (DATE)
- `TIME`: Apenas hora (TIME)
- `BOOLEAN`: Verdadeiro/Falso
- `JSON`: Objeto JSON

**Validações Customizadas Disponíveis:**
- `IsEmail`: Valida formato de email
- `IsDateString`: Valida formato de data (YYYY-MM-DD)
- `IsTime`: Valida formato de hora (HH:mm:ss)
- `IsUnique:Modelo,campo`: Valida unicidade no banco
- `IsExists:Modelo,campo`: Valida existência de registro relacionado
- `IsTimeAfter:campo,dataCampo`: Valida se hora é posterior a outra

**Campos Especiais:**
- `id`: Sempre presente, não precisa ser especificado (gerado automaticamente)
- `tenantId`: Adicionado automaticamente se `multiTenant: true`
- `createdAt`/`updatedAt`: Adicionados automaticamente pelo Sequelize

#### 3. Relationships

**Tipos de Relacionamento:**
- `belongsTo`: Relacionamento N:1 (ex: Evento pertence a Local)
- `hasMany`: Relacionamento 1:N (ex: Local tem muitos Eventos)
- `hasOne`: Relacionamento 1:1 (ex: Usuario tem um Perfil)
- `belongsToMany`: Relacionamento N:N (ex: Evento pertence a muitos Usuarios)

**Ações onDelete:**
- `CASCADE`: Deleta registros relacionados
- `SET NULL`: Define como NULL (se permitido)
- `RESTRICT`: Impede deleção se houver relacionamentos

#### 4. Permissions

Seguir padrão: `{entidade}.{acao}` (ex: `evento.create`, `local.read`)

#### 5. Cache

- **enabled**: `true` para habilitar cache
- **ttl**: Tempo de vida em segundos (padrão: 3600 = 1 hora)
- **keys**: Padrões de chaves de cache (usar `*` para wildcards)

#### 6. Business Rules

**Tipos de Regras:**
- `validation`: Validação de dados antes de salvar
- `crossTenant`: Validação de relacionamento entre tenants
- `custom`: Regra de negócio personalizada

#### 7. Custom Methods

Métodos adicionais para Repository ou Application Service:
- **type**: `repository` ou `service`
- **parameters**: Array de parâmetros do método
- **returnType**: Tipo de retorno (`Entity[]` ou `Entity`)

---

## 📁 Estrutura de Arquivos a Gerar

```
src/
├── models/
│   └── [NomeSingular].ts
├── infrastructure/repository/
│   ├── I[NomeSingular]Repository.ts
│   └── [NomeSingular]Repository.ts
├── application/
│   ├── dto/[nome]/
│   │   ├── Create[NomeSingular]Dto.ts
│   │   ├── Update[NomeSingular]Dto.ts
│   │   ├── [NomeSingular]ResponseDto.ts
│   │   └── index.ts
│   ├── mappers/
│   │   └── [NomeSingular]Mapper.ts
│   └── services/[nome]/
│       ├── I[NomeSingular]ApplicationService.ts
│       └── [NomeSingular]ApplicationService.ts
├── controllers/
│   ├── interfaces/I[NomeSingular]Controller.ts
│   └── [NomeSingular]Controller.ts
├── routes/
│   └── [nome].routes.ts
└── migrations/
    └── YYYYMMDDHHMMSS-create-[nome_da_tabela].ts
```

**Nota**: Substituir `[NomeSingular]` pelo nome singular em PascalCase e `[nome]` pelo nome em camelCase.

---

## ✅ Checklist de Implementação

### Fase 1: Estrutura Base
- [ ] Model Sequelize criado (`src/models/[NomeSingular].ts`)
- [ ] Repository Interface criada (`src/infrastructure/repository/I[NomeSingular]Repository.ts`)
- [ ] Repository implementado (`src/infrastructure/repository/[NomeSingular]Repository.ts`)
- [ ] Migration criada (`src/migrations/YYYYMMDDHHMMSS-create-[nome_da_tabela].ts`)

### Fase 2: DTOs e Mappers
- [ ] Create DTO criado (`src/application/dto/[nome]/Create[NomeSingular]Dto.ts`)
- [ ] Update DTO criado (`src/application/dto/[nome]/Update[NomeSingular]Dto.ts`)
- [ ] Response DTO criado (`src/application/dto/[nome]/[NomeSingular]ResponseDto.ts`)
- [ ] Index DTO criado (`src/application/dto/[nome]/index.ts`)
- [ ] Mapper criado (`src/application/mappers/[NomeSingular]Mapper.ts`)

### Fase 3: Application Service
- [ ] Application Service Interface criada (`src/application/services/[nome]/I[NomeSingular]ApplicationService.ts`)
- [ ] Application Service implementado (`src/application/services/[nome]/[NomeSingular]ApplicationService.ts`)
- [ ] Métodos CRUD implementados
- [ ] Métodos customizados implementados
- [ ] Validações de negócio implementadas
- [ ] Regras cross-tenant implementadas

### Fase 4: Controller e Routes
- [ ] Controller Interface criada (`src/controllers/interfaces/I[NomeSingular]Controller.ts`)
- [ ] Controller implementado (`src/controllers/[NomeSingular]Controller.ts`)
- [ ] Routes configuradas (`src/routes/[nome].routes.ts`)
- [ ] Middleware de autenticação configurado
- [ ] Middleware de autorização configurado
- [ ] Validação de DTOs configurada
- [ ] Swagger/OpenAPI documentado

### Fase 5: Integração e Configuração
- [ ] Registros no DI Container (`src/core/di/types.ts`)
- [ ] Repository registrado (`src/core/di/registerRepositories.ts`)
- [ ] Application Service registrado (`src/core/di/registerServices.ts`)
- [ ] Controller registrado (`src/core/di/registerControllers.ts`)
- [ ] Routes registradas (`src/routes/index.ts`)

### Fase 6: Relacionamentos e Validações
- [ ] Relacionamentos Sequelize configurados no Model
- [ ] Validações de relacionamentos implementadas (IsExists)
- [ ] Validações de unicidade implementadas (IsUnique)
- [ ] Validações customizadas implementadas

### Fase 7: Funcionalidades Avançadas
- [ ] Cache configurado (se `cacheable: true`)
- [ ] Auditoria configurada (se `auditable: true`)
- [ ] Multi-tenancy configurado (se `multiTenant: true`)
- [ ] Permissões configuradas
- [ ] Métodos customizados do Repository implementados
- [ ] Métodos customizados do Application Service implementados

### Fase 8: Testes e Documentação
- [ ] Testes unitários do Repository criados
- [ ] Testes unitários do Application Service criados
- [ ] Testes de integração criados
- [ ] Documentação Swagger completa
- [ ] Exemplos de payloads documentados

---

## 🔧 Convenções de Nomenclatura

### Tabelas e Modelos
- **Tabela**: `snake_case` plural (ex: `eventos`, `locais`, `contas`)
- **Modelo**: `PascalCase` singular (ex: `Evento`, `Local`, `Conta`)

### Arquivos
- **Model**: `{NomeSingular}.ts` (ex: `Evento.ts`)
- **Repository**: `{NomeSingular}Repository.ts` (ex: `EventoRepository.ts`)
- **Repository Interface**: `I{NomeSingular}Repository.ts` (ex: `IEventoRepository.ts`)
- **DTO Create**: `Create{NomeSingular}Dto.ts` (ex: `CreateEventoDto.ts`)
- **DTO Update**: `Update{NomeSingular}Dto.ts` (ex: `UpdateEventoDto.ts`)
- **DTO Response**: `{NomeSingular}ResponseDto.ts` (ex: `EventoResponseDto.ts`)
- **Application Service**: `{NomeSingular}ApplicationService.ts` (ex: `EventoApplicationService.ts`)
- **Application Service Interface**: `I{NomeSingular}ApplicationService.ts` (ex: `IEventoApplicationService.ts`)
- **Controller**: `{NomeSingular}Controller.ts` (ex: `EventoController.ts`)
- **Controller Interface**: `I{NomeSingular}Controller.ts` (ex: `IEventoController.ts`)
- **Routes**: `{nome}.routes.ts` (ex: `evento.routes.ts`)
- **Migration**: `YYYYMMDDHHMMSS-create-{nome_da_tabela}.ts` (ex: `20250115120000-create-eventos.ts`)

### Diretórios
- **DTOs**: `src/application/dto/{nome}/` (snake_case, ex: `evento/`)
- **Services**: `src/application/services/{nome}/` (snake_case, ex: `evento/`)
- **Repositories**: `src/infrastructure/repository/`
- **Models**: `src/models/`
- **Controllers**: `src/controllers/`
- **Routes**: `src/routes/`
- **Migrations**: `src/migrations/`

### Variáveis e Classes
- **Classes**: `PascalCase` (ex: `EventoRepository`)
- **Interfaces**: `I` + `PascalCase` (ex: `IEventoRepository`)
- **Variáveis**: `camelCase` (ex: `eventoRepository`)
- **Constantes**: `UPPER_SNAKE_CASE` (ex: `EVENTO_CACHE_TTL`)

---

## 📚 Validações Padrão por Tipo

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

## 🎯 Padrões de Implementação

### 1. Multi-Tenancy
- Todas as entidades com `multiTenant: true` terão filtro automático por `tenantId` no Repository
- O `tenantId` é adicionado automaticamente durante a criação
- Validações cross-tenant devem ser implementadas no Application Service

### 2. Auditoria
- Métodos `create`, `update`, `delete` do Application Service recebem automaticamente o decorador `@Auditable`
- O `usercreation` e `datecreation` são preenchidos automaticamente

### 3. Cache
- Métodos de leitura recebem `@Cacheable` automaticamente
- Métodos de escrita recebem `@CacheEvict` automaticamente
- TTL configurável via especificação

### 4. Transações
- Métodos de escrita (`create`, `update`, `delete`) recebem automaticamente o decorador `@Transactional`

### 5. Permissões
- Todos os métodos do Controller e Application Service recebem validação de permissão baseada na configuração `permissions`
- Decorador `@RequirePermission` aplicado automaticamente

### 6. Validações Cross-Tenant
- Regras do tipo `crossTenant` devem ser implementadas no Application Service antes de criar/atualizar
- Validar se entidades relacionadas pertencem ao mesmo tenant

### 7. Relacionamentos
- As associações Sequelize são criadas automaticamente no Model
- Validações de existência (`IsExists`) são adicionadas aos DTOs
- Foreign keys são criadas na migration

---

## 📝 Notas de Implementação

### Padrões de Scaffolding

Para cada feature, o scaffolding deve incluir:

1. **Interfaces/Contratos**:
   - Interface do Repository (`I{Entity}Repository.ts`)
   - Interface do Application Service (`I{Entity}ApplicationService.ts`)
   - Interface do Controller (`I{Entity}Controller.ts`)

2. **Esqueletos de Classes**:
   - Repository com métodos básicos (TODO markers)
   - Application Service com métodos CRUD (TODO markers)
   - Controller com endpoints básicos (TODO markers)

3. **Estrutura de Pastas**:
   - Seguir convenções do projeto
   - Criar diretórios necessários

4. **TODO Markers**:
   - `// TODO: Implementar lógica de negócio`
   - `// TODO: Adicionar validações customizadas`
   - `// TODO: Implementar relacionamentos`
   - `// TODO: Adicionar testes`

### Próximos Passos

1. Preencher este template com os dados da feature
2. Gerar o scaffolding usando os templates em `docs/templates/scaffolding/`
3. Implementar a lógica seguindo os TODO markers
4. Adicionar testes unitários e de integração
5. Documentar a feature no Swagger
6. Revisar e validar a implementação

---

## 🔍 Exemplo de Uso

### Exemplo 1: Feature Simples (sem relacionamentos)

```json
{
  "table": {
    "name": "categorias",
    "singularName": "Categoria",
    "pluralName": "Categorias",
    "description": "Categorias de produtos",
    "multiTenant": true,
    "auditable": true,
    "cacheable": true
  },
  "fields": [
    {
      "name": "nome",
      "type": "STRING",
      "required": true,
      "comment": "Nome da categoria",
      "validation": {
        "min": 3,
        "max": 100
      }
    },
    {
      "name": "descricao",
      "type": "TEXT",
      "required": false,
      "comment": "Descrição da categoria"
    }
  ],
  "relationships": [],
  "permissions": {
    "create": "categoria.create",
    "read": "categoria.read",
    "update": "categoria.update",
    "delete": "categoria.delete"
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "keys": ["categoria:list:*"]
  },
  "businessRules": [],
  "customMethods": []
}
```

### Exemplo 2: Feature com Relacionamentos

Ver exemplo completo em `docs/features/UI/UI-plano-fases-com-especificacoes.md` (seção "Feature: Contas").

---

## 📋 Checklist de Validação

Antes de usar uma especificação, verificar:

- [ ] Nome da tabela está em `snake_case` plural
- [ ] Nome singular está em `PascalCase`
- [ ] Todos os campos obrigatórios têm `required: true`
- [ ] Campos com relacionamentos têm validação `IsExists`
- [ ] Campos únicos têm validação `IsUnique`
- [ ] Permissões seguem o padrão `{entidade}.{acao}`
- [ ] Relacionamentos têm `onDelete` definido
- [ ] Regras de negócio estão documentadas
- [ ] Métodos customizados têm tipos de retorno definidos
- [ ] Cache keys seguem padrão `{entidade}:{acao}:*`
- [ ] TTL do cache está definido (em segundos)

---

## 📅 Metadados do Documento

**Data de Criação**: `[Data]`  
**Última Atualização**: `[Data]`  
**Versão**: `1.0.0`  
**Autor**: `[Nome]`  
**Status**: `[Em desenvolvimento | Pronto para implementação | Implementado]`

---

**📌 Nota**: Este documento é um template. Copie este arquivo, renomeie para `[nome-feature]-especificacao.md` e preencha todas as seções conforme a feature que será implementada.
