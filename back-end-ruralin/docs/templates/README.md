# Templates de Especificação

Este diretório contém templates e modelos para facilitar a geração automática de código no backend.

## Arquivos

### `modelo-especificacao-tabela.md`
Documentação completa do modelo de especificação de tabela. Contém:
- Estrutura JSON detalhada
- Descrição de todos os campos
- Exemplos práticos
- Convenções de nomenclatura
- Checklist de validação

### `exemplo-especificacao-tabela.json`
Exemplo prático de especificação JSON para a tabela `eventos`. Use como referência ao criar novas especificações.

## Como Usar

### 1. Criar uma Nova Especificação

1. Copie o arquivo `exemplo-especificacao-tabela.json`
2. Renomeie para `{nome-tabela}-especificacao.json`
3. Preencha os dados da sua tabela seguindo o modelo
4. Valide usando o checklist em `modelo-especificacao-tabela.md`

### 2. Gerar Código

Use o arquivo JSON em um prompt para geração automática:

```
Gere toda a estrutura do backend para a tabela especificada no arquivo @docs/templates/minha-tabela-especificacao.json
```

O sistema irá gerar:
- Model Sequelize
- Repository e Interface
- DTOs (Create, Update, Response)
- Application Service e Interface
- Controller e Interface
- Routes
- Migration
- Registros no DI Container
- Mapper (se necessário)

## Estrutura de Diretórios Gerados

```
src/
├── models/
│   └── {SingularName}.ts
├── infrastructure/
│   └── repository/
│       ├── {SingularName}Repository.ts
│       └── I{SingularName}Repository.ts
├── application/
│   ├── dto/
│   │   └── {nome}/
│   │       ├── Create{SingularName}Dto.ts
│   │       ├── Update{SingularName}Dto.ts
│   │       ├── {SingularName}ResponseDto.ts
│   │       └── index.ts
│   ├── services/
│   │   └── {nome}/
│   │       ├── {SingularName}ApplicationService.ts
│   │       └── I{SingularName}ApplicationService.ts
│   └── mappers/
│       └── {SingularName}Mapper.ts
├── controllers/
│   ├── {SingularName}Controller.ts
│   └── interfaces/
│       └── I{SingularName}Controller.ts
├── routes/
│   └── {nome}.routes.ts
└── migrations/
    └── {timestamp}-create-{table-name}.ts
```

## Convenções

- **Tabela**: `snake_case` plural (ex: `eventos`, `locais`)
- **Modelo**: `PascalCase` singular (ex: `Evento`, `Local`)
- **Arquivos**: Seguem o padrão do modelo
- **Diretórios**: `snake_case` para DTOs e Services

## Validações Suportadas

- `IsEmail`: Valida formato de email
- `IsDateString`: Valida formato de data (YYYY-MM-DD)
- `IsTime`: Valida formato de hora (HH:mm:ss)
- `IsUnique:Modelo,campo`: Valida unicidade no banco
- `IsExists:Modelo,campo`: Valida existência de registro relacionado
- `IsTimeAfter:campo,dataCampo`: Valida se hora é posterior a outra

## Recursos Automáticos

### Multi-Tenancy
Se `multiTenant: true`:
- Campo `tenantId` adicionado automaticamente
- Filtro automático no Repository
- Validação cross-tenant no Application Service

### Auditoria
Se `auditable: true`:
- Decorador `@Auditable` nos métodos de escrita
- Registro automático de operações

### Cache
Se `cacheable: true`:
- Decorador `@Cacheable` nos métodos de leitura
- Decorador `@CacheEvict` nos métodos de escrita
- TTL configurável

### Transações
Métodos de escrita recebem automaticamente:
- Decorador `@Transactional`
- Rollback automático em caso de erro

### Permissões
Validação automática de permissões:
- `@RequirePermission` no Application Service
- `requirePermission` middleware nas rotas

## Exemplos de Uso

### Exemplo 1: Tabela Simples (Local)

```json
{
  "table": {
    "name": "locais",
    "singularName": "Local",
    "pluralName": "Locais",
    "multiTenant": true
  },
  "fields": [
    {
      "name": "nome",
      "type": "STRING",
      "required": true
    },
    {
      "name": "desc_completa",
      "type": "TEXT",
      "required": false
    }
  ]
}
```

### Exemplo 2: Tabela com Relacionamentos (Evento)

Ver arquivo `exemplo-especificacao-tabela.json` para exemplo completo.

## Suporte

Para dúvidas ou problemas:
1. Consulte `modelo-especificacao-tabela.md` para documentação completa
2. Use `exemplo-especificacao-tabela.json` como referência
3. Verifique o checklist de validação antes de gerar código
