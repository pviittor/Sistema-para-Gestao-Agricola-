# 📦 Templates de Scaffolding Genérico

Este diretório contém templates genéricos para geração automática de código backend baseado em especificações de tabela.

## 📋 Estrutura de Templates

Cada template segue o padrão do projeto e inclui:

1. **Placeholders**: Variáveis que serão substituídas durante a geração
2. **TODO Markers**: Marcadores claros para próximos passos
3. **Estrutura Padrão**: Seguindo convenções do projeto

## 🔄 Variáveis de Substituição

### Variáveis Principais

- `{{EntityName}}`: Nome da entidade em PascalCase (ex: `Evento`, `Local`)
- `{{entityName}}`: Nome da entidade em camelCase (ex: `evento`, `local`)
- `{{TableName}}`: Nome da tabela em snake_case (ex: `eventos`, `locais`)
- `{{EntityDescription}}`: Descrição da entidade
- `{{entityNameLower}}`: Nome da entidade em lowercase (ex: `evento`, `local`)

### Variáveis Condicionais

- `{{#if multiTenant}}...{{/if}}`: Bloco condicional para multi-tenancy
- `{{#if auditable}}...{{/if}}`: Bloco condicional para auditoria
- `{{#if cacheable}}...{{/if}}`: Bloco condicional para cache
- `{{#if hasRelationships}}...{{/if}}`: Bloco condicional para relacionamentos
- `{{#each fields}}...{{/each}}`: Loop para campos
- `{{#each customMethods}}...{{/each}}`: Loop para métodos customizados

## 📁 Templates Disponíveis

### 1. Model (`model.template.ts`)
Template para Model Sequelize com:
- Interfaces de atributos
- Inicialização do modelo
- Relacionamentos (TODO markers)

### 2. Repository Interface (`repository-interface.template.ts`)
Template para interface do Repository com:
- Extensão de `IRepository<T>`
- Métodos customizados (gerados a partir da especificação)

### 3. Repository (`repository.template.ts`)
Template para implementação do Repository com:
- Extensão de `BaseRepository<T>`
- Métodos customizados (TODO markers)

### 4. DTOs
- `dto-create.template.ts`: DTO de criação com validações
- `dto-update.template.ts`: DTO de atualização (todos campos opcionais)
- `dto-response.template.ts`: DTO de resposta

### 5. Application Service
- `service-interface.template.ts`: Interface do Application Service
- `service.template.ts`: Implementação com decorators (@RequirePermission, @Cacheable, @Auditable, @Transactional)

### 6. Controller
- `controller-interface.template.ts`: Interface do Controller
- `controller.template.ts`: Implementação com endpoints CRUD

### 7. Routes (`routes.template.ts`)
Template para rotas Express com:
- Middleware de validação
- Middleware de autorização
- Handlers do Controller

### 8. Migration (`migration.template.ts`)
Template para migration Sequelize com:
- Criação da tabela
- Índices
- Foreign keys

### 9. Mapper (`mapper.template.ts`)
Template para mapper entre Entity e DTOs

### 10. DI Registration (`di-registration.template.ts`)
Template para registros no DI Container

## 🎯 Como Usar

1. **Preparar Especificação**: Criar JSON seguindo `docs/reqs/modelo-especificacao-tabela.md`
2. **Processar Templates**: Substituir variáveis nos templates
3. **Gerar Arquivos**: Criar arquivos no projeto
4. **Implementar TODOs**: Seguir marcadores TODO para completar lógica

## 📝 Exemplo de Uso

```bash
# Processar especificação e gerar código
node scripts/generate-scaffolding.js --spec pessoa-especificacao.json
```

## ✅ Checklist de Geração

Após gerar o scaffolding, verificar:

- [ ] Todos os arquivos foram criados
- [ ] Imports estão corretos
- [ ] Interfaces implementadas
- [ ] Decorators aplicados corretamente
- [ ] Registros DI adicionados
- [ ] Routes registradas
- [ ] Migration criada

---

**📅 Última atualização**: Janeiro 2025  
**📋 Versão**: 1.0.0
