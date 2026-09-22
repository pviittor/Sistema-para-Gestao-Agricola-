# 🗓️ Plano de Sprints e Fases - RuralIn (Com Especificações de Tabela)

## 📋 Visão Geral

Este documento mapeia cada feature do plano de sprints para o modelo de especificação de tabela definido em `docs/reqs/modelo-especificacao-tabela.md`.

**📊 Total de Features**: 33  
**⏱️ Esforço Total**: ~61.5 meses-pessoa  
**👥 Equipe Sugerida**: 3-5 desenvolvedores  
**📅 Duração Total**: ~15 meses (30 sprints de 2 semanas)  
**🔄 Metodologia**: Scrum com sprints de 2 semanas

---

## 📝 Como Usar Este Documento

Para cada feature listada abaixo:

1. **Preparar Especificação**: Criar arquivo JSON seguindo o modelo em `docs/reqs/modelo-especificacao-tabela.md`
2. **Localizar Feature**: Encontrar a feature no documento abaixo
3. **Inserir Especificação**: Colocar o JSON da especificação na seção `📄 Especificação da Tabela`
4. **Gerar Código**: Usar o prompt de geração com a especificação

**Exemplo de Prompt:**
```
Gere toda a estrutura do backend para a tabela especificada na feature [NOME_DA_FEATURE] deste documento.
```

---

## 🏗️ FASE 1 - Fundação do Sistema

**🎯 Objetivo**: Estabelecer as bases fundamentais do sistema  
**📊 RICE Score**: 60+  
**⏱️ Esforço Total**: ~7.5 meses-pessoa  
**📅 Duração**: Sprints 1-4 (8 semanas)

---

### 📅 SPRINT 1 (Semanas 1-2)

#### 🏦 Feature: Lista de Bancos

**RICE**: 81.0 | **Esforço**: 0.5 meses | **Status**: ⚡ Quick Win

**📄 Especificação da Tabela:**
```json
{
  "table": {
    "name": "lista_bancos",
    "singularName": "ListaBanco",
    "pluralName": "ListaBancos",
    "description": "Lista de bancos disponíveis no sistema",
    "multiTenant": false,
    "auditable": false,
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
      "comment": "ID único do banco"
    },
    {
      "name": "codigo",
      "type": "STRING",
      "required": true,
      "unique": true,
      "comment": "Código do banco (ex: 001, 237)",
      "validation": {
        "min": 3,
        "max": 10
      }
    },
    {
      "name": "nome",
      "type": "STRING",
      "required": true,
      "comment": "Nome do banco",
      "validation": {
        "min": 3,
        "max": 255
      }
    },
    {
      "name": "ativo",
      "type": "BOOLEAN",
      "required": false,
      "defaultValue": true,
      "comment": "Se o banco está ativo"
    }
  ],
  "relationships": [],
  "permissions": {
    "create": "listaBanco.create",
    "read": "listaBanco.read",
    "update": "listaBanco.update",
    "delete": "listaBanco.delete"
  },
  "cache": {
    "enabled": true,
    "ttl": 86400,
    "keys": ["listaBanco:list:*", "listaBanco:findByCodigo:*"]
  },
  "businessRules": [],
  "customMethods": [
    {
      "name": "findByCodigo",
      "type": "repository",
      "description": "Busca banco por código",
      "parameters": [
        {
          "name": "codigo",
          "type": "string",
          "required": true
        }
      ],
      "returnType": "ListaBanco"
    }
  ]
}
```

**📁 Estrutura de Arquivos a Gerar:**
```
src/
├── models/
│   └── ListaBanco.ts
├── infrastructure/repository/
│   ├── IListaBancoRepository.ts
│   └── ListaBancoRepository.ts
├── application/
│   ├── dto/listaBanco/
│   │   ├── CreateListaBancoDto.ts
│   │   ├── UpdateListaBancoDto.ts
│   │   ├── ListaBancoResponseDto.ts
│   │   └── index.ts
│   └── services/listaBanco/
│       ├── IListaBancoApplicationService.ts
│       └── ListaBancoApplicationService.ts
├── controllers/
│   ├── interfaces/IListaBancoController.ts
│   └── ListaBancoController.ts
├── routes/
│   └── listaBanco.routes.ts
└── migrations/
    └── YYYYMMDDHHMMSS-create-lista_bancos.ts
```

**✅ Checklist de Implementação:**
- [ ] Model Sequelize criado
- [ ] Repository com interface criado
- [ ] DTOs (Create, Update, Response) criados
- [ ] Application Service com interface criado
- [ ] Controller com interface criado
- [ ] Routes configuradas
- [ ] Migration criada
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas

---

#### 🔐 Feature: Usuários e Permissões (Parte 1)

**RICE**: 79.17 | **Esforço**: 0.75 meses | **Status**: 🔐 Base

**📄 Especificação da Tabela:**
```json
{
  "table": {
    "name": "usuarios",
    "singularName": "Usuario",
    "pluralName": "Usuarios",
    "description": "Usuários do sistema com autenticação e permissões",
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
      "excludeFromUpdate": true,
      "comment": "ID do tenant ao qual o usuário pertence"
    },
    {
      "name": "email",
      "type": "STRING",
      "required": true,
      "unique": true,
      "comment": "Email do usuário (usado para login)",
      "validation": {
        "custom": "IsEmail"
      }
    },
    {
      "name": "senha",
      "type": "STRING",
      "required": true,
      "excludeFromResponse": true,
      "comment": "Senha criptografada do usuário",
      "validation": {
        "min": 6
      }
    },
    {
      "name": "nome",
      "type": "STRING",
      "required": true,
      "comment": "Nome completo do usuário",
      "validation": {
        "min": 3,
        "max": 255
      }
    },
    {
      "name": "ativo",
      "type": "BOOLEAN",
      "required": false,
      "defaultValue": true,
      "comment": "Se o usuário está ativo"
    },
    {
      "name": "tipo",
      "type": "STRING",
      "required": true,
      "comment": "Tipo de usuário (ROOT, CLIENT)",
      "validation": {
        "pattern": "^(ROOT|CLIENT)$"
      }
    }
  ],
  "relationships": [
    {
      "type": "belongsToMany",
      "target": "Role",
      "foreignKey": "usuarioId",
      "as": "roles",
      "through": "user_has_role"
    }
  ],
  "permissions": {
    "create": "usuario.create",
    "read": "usuario.read",
    "update": "usuario.update",
    "delete": "usuario.delete"
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "keys": ["usuario:list:*", "usuario:findByEmail:*"]
  },
  "businessRules": [
    {
      "type": "validation",
      "description": "Senha deve ser criptografada antes de salvar",
      "implementation": "Usar bcrypt para hash da senha no Application Service"
    }
  ],
  "customMethods": [
    {
      "name": "findByEmail",
      "type": "repository",
      "description": "Busca usuário por email",
      "parameters": [
        {
          "name": "email",
          "type": "string",
          "required": true
        }
      ],
      "returnType": "Usuario"
    }
  ]
}
```

**📁 Estrutura de Arquivos a Gerar:**
```
src/
├── models/
│   └── Usuario.ts
├── infrastructure/repository/
│   ├── IUsuarioRepository.ts
│   └── UsuarioRepository.ts
├── application/
│   ├── dto/usuario/
│   │   ├── CreateUsuarioDto.ts
│   │   ├── UpdateUsuarioDto.ts
│   │   ├── UsuarioResponseDto.ts
│   │   └── index.ts
│   └── services/usuario/
│       ├── IUsuarioApplicationService.ts
│       └── UsuarioApplicationService.ts
├── controllers/
│   ├── interfaces/IUsuarioController.ts
│   └── UsuarioController.ts
├── routes/
│   └── usuario.routes.ts
└── migrations/
    └── YYYYMMDDHHMMSS-create-usuarios.ts
```

**✅ Checklist de Implementação:**
- [ ] Model Sequelize criado
- [ ] Repository com interface criado
- [ ] DTOs (Create, Update, Response) criados
- [ ] Application Service com interface criado
- [ ] Controller com interface criado
- [ ] Routes configuradas
- [ ] Migration criada
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas
- [ ] Criptografia de senha implementada
- [ ] Relacionamento com Roles configurado

---

#### 🤝 Feature: Parceiros de Negócio (Parte 1)

**RICE**: 72.0 | **Esforço**: 0.75 meses | **Status**: 🔗 Base

**📄 Especificação da Tabela:**
```json
{
  "table": {
    "name": "parceiros",
    "singularName": "Parceiro",
    "pluralName": "Parceiros",
    "description": "Parceiros de negócio (fornecedores, clientes, terceiros)",
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
      "comment": "Nome ou razão social do parceiro",
      "validation": {
        "min": 3,
        "max": 255
      }
    },
    {
      "name": "tipo",
      "type": "STRING",
      "required": true,
      "comment": "Tipo de parceiro (FORNECEDOR, CLIENTE, TERCEIRO)",
      "validation": {
        "pattern": "^(FORNECEDOR|CLIENTE|TERCEIRO)$"
      }
    },
    {
      "name": "cpfCnpj",
      "type": "STRING",
      "required": false,
      "unique": true,
      "comment": "CPF ou CNPJ do parceiro"
    },
    {
      "name": "email",
      "type": "STRING",
      "required": false,
      "comment": "Email de contato",
      "validation": {
        "custom": "IsEmail"
      }
    },
    {
      "name": "telefone",
      "type": "STRING",
      "required": false,
      "comment": "Telefone de contato"
    },
    {
      "name": "ativo",
      "type": "BOOLEAN",
      "required": false,
      "defaultValue": true,
      "comment": "Se o parceiro está ativo"
    }
  ],
  "relationships": [],
  "permissions": {
    "create": "parceiro.create",
    "read": "parceiro.read",
    "update": "parceiro.update",
    "delete": "parceiro.delete"
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "keys": ["parceiro:list:*", "parceiro:findByTipo:*", "parceiro:findByCpfCnpj:*"]
  },
  "businessRules": [],
  "customMethods": [
    {
      "name": "findByTipo",
      "type": "repository",
      "description": "Busca parceiros por tipo",
      "parameters": [
        {
          "name": "tipo",
          "type": "string",
          "required": true
        }
      ],
      "returnType": "Parceiro[]"
    },
    {
      "name": "findByCpfCnpj",
      "type": "repository",
      "description": "Busca parceiro por CPF/CNPJ",
      "parameters": [
        {
          "name": "cpfCnpj",
          "type": "string",
          "required": true
        }
      ],
      "returnType": "Parceiro"
    }
  ]
}
```

**📁 Estrutura de Arquivos a Gerar:**
```
src/
├── models/
│   └── Parceiro.ts
├── infrastructure/repository/
│   ├── IParceiroRepository.ts
│   └── ParceiroRepository.ts
├── application/
│   ├── dto/parceiro/
│   │   ├── CreateParceiroDto.ts
│   │   ├── UpdateParceiroDto.ts
│   │   ├── ParceiroResponseDto.ts
│   │   └── index.ts
│   └── services/parceiro/
│       ├── IParceiroApplicationService.ts
│       └── ParceiroApplicationService.ts
├── controllers/
│   ├── interfaces/IParceiroController.ts
│   └── ParceiroController.ts
├── routes/
│   └── parceiro.routes.ts
└── migrations/
    └── YYYYMMDDHHMMSS-create-parceiros.ts
```

**✅ Checklist de Implementação:**
- [ ] Model Sequelize criado
- [ ] Repository com interface criado
- [ ] DTOs (Create, Update, Response) criados
- [ ] Application Service com interface criado
- [ ] Controller com interface criado
- [ ] Routes configuradas
- [ ] Migration criada
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas
- [ ] Métodos customizados implementados

---

### 📅 SPRINT 2 (Semanas 3-4)

#### 🔐 Feature: Usuários e Permissões (Parte 2)

**RICE**: 79.17 | **Esforço**: 0.75 meses | **Status**: 🔐 Base

**📄 Especificação da Tabela:**
```json
{
  "table": {
    "name": "roles",
    "singularName": "Role",
    "pluralName": "Roles",
    "description": "Papéis/perfis de usuário no sistema",
    "multiTenant": false,
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
      "name": "nome",
      "type": "STRING",
      "required": true,
      "unique": true,
      "comment": "Nome do papel (ex: Admin, Financeiro)",
      "validation": {
        "min": 3,
        "max": 100
      }
    },
    {
      "name": "descricao",
      "type": "TEXT",
      "required": false,
      "comment": "Descrição do papel"
    },
    {
      "name": "ativo",
      "type": "BOOLEAN",
      "required": false,
      "defaultValue": true,
      "comment": "Se o papel está ativo"
    }
  ],
  "relationships": [
    {
      "type": "belongsToMany",
      "target": "Usuario",
      "foreignKey": "roleId",
      "as": "usuarios",
      "through": "user_has_role"
    },
    {
      "type": "belongsToMany",
      "target": "Permissao",
      "foreignKey": "roleId",
      "as": "permissoes",
      "through": "role_has_permissao"
    }
  ],
  "permissions": {
    "create": "role.create",
    "read": "role.read",
    "update": "role.update",
    "delete": "role.delete"
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "keys": ["role:list:*", "role:findByNome:*"]
  },
  "businessRules": [],
  "customMethods": [
    {
      "name": "findByNome",
      "type": "repository",
      "description": "Busca papel por nome",
      "parameters": [
        {
          "name": "nome",
          "type": "string",
          "required": true
        }
      ],
      "returnType": "Role"
    }
  ]
}
```

**📁 Estrutura de Arquivos a Gerar:**
```
src/
├── models/
│   ├── Role.ts
│   └── Permissao.ts
├── infrastructure/repository/
│   ├── IRoleRepository.ts
│   ├── RoleRepository.ts
│   ├── IPermissaoRepository.ts
│   └── PermissaoRepository.ts
├── application/
│   ├── dto/role/
│   │   ├── CreateRoleDto.ts
│   │   ├── UpdateRoleDto.ts
│   │   ├── RoleResponseDto.ts
│   │   └── index.ts
│   └── services/role/
│       ├── IRoleApplicationService.ts
│       └── RoleApplicationService.ts
├── controllers/
│   ├── interfaces/IRoleController.ts
│   └── RoleController.ts
├── routes/
│   └── role.routes.ts
└── migrations/
    ├── YYYYMMDDHHMMSS-create-roles.ts
    └── YYYYMMDDHHMMSS-create-permissoes.ts
```

**✅ Checklist de Implementação:**
- [ ] Model Role criado
- [ ] Model Permissao criado
- [ ] Repositories criados
- [ ] DTOs criados
- [ ] Application Services criados
- [ ] Controllers criados
- [ ] Routes configuradas
- [ ] Migrations criadas
- [ ] Tabelas de relacionamento (user_has_role, role_has_permissao) criadas
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas

---

#### 📦 Feature: Produtos (Parte 1)

**RICE**: 66.5 | **Esforço**: 0.75 meses | **Status**: 📦 Base

**📄 Especificação da Tabela:**
```json
{
  "table": {
    "name": "produtos",
    "singularName": "Produto",
    "pluralName": "Produtos",
    "description": "Produtos/insumos do sistema",
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
      "comment": "Nome do produto",
      "validation": {
        "min": 3,
        "max": 255
      }
    },
    {
      "name": "descricao",
      "type": "TEXT",
      "required": false,
      "comment": "Descrição do produto"
    },
    {
      "name": "unidadeMedida",
      "type": "STRING",
      "required": true,
      "comment": "Unidade de medida (KG, L, UN, etc)",
      "validation": {
        "min": 2,
        "max": 10
      }
    },
    {
      "name": "categoriaId",
      "type": "INTEGER",
      "required": false,
      "comment": "ID da categoria do produto",
      "validation": {
        "custom": "IsExists:CategoriaProduto,id"
      }
    },
    {
      "name": "ativo",
      "type": "BOOLEAN",
      "required": false,
      "defaultValue": true,
      "comment": "Se o produto está ativo"
    }
  ],
  "relationships": [
    {
      "type": "belongsTo",
      "target": "CategoriaProduto",
      "foreignKey": "categoriaId",
      "as": "categoria",
      "required": false,
      "onDelete": "SET NULL"
    }
  ],
  "permissions": {
    "create": "produto.create",
    "read": "produto.read",
    "update": "produto.update",
    "delete": "produto.delete"
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "keys": ["produto:list:*", "produto:findByCategoria:*"]
  },
  "businessRules": [],
  "customMethods": [
    {
      "name": "findByCategoria",
      "type": "repository",
      "description": "Busca produtos por categoria",
      "parameters": [
        {
          "name": "categoriaId",
          "type": "number",
          "required": true
        }
      ],
      "returnType": "Produto[]"
    }
  ]
}
```

**📁 Estrutura de Arquivos a Gerar:**
```
src/
├── models/
│   ├── Produto.ts
│   └── CategoriaProduto.ts
├── infrastructure/repository/
│   ├── IProdutoRepository.ts
│   ├── ProdutoRepository.ts
│   ├── ICategoriaProdutoRepository.ts
│   └── CategoriaProdutoRepository.ts
├── application/
│   ├── dto/produto/
│   │   ├── CreateProdutoDto.ts
│   │   ├── UpdateProdutoDto.ts
│   │   ├── ProdutoResponseDto.ts
│   │   └── index.ts
│   └── services/produto/
│       ├── IProdutoApplicationService.ts
│       └── ProdutoApplicationService.ts
├── controllers/
│   ├── interfaces/IProdutoController.ts
│   └── ProdutoController.ts
├── routes/
│   └── produto.routes.ts
└── migrations/
    ├── YYYYMMDDHHMMSS-create-categoria_produtos.ts
    └── YYYYMMDDHHMMSS-create-produtos.ts
```

**✅ Checklist de Implementação:**
- [ ] Model Produto criado
- [ ] Model CategoriaProduto criado
- [ ] Repositories criados
- [ ] DTOs criados
- [ ] Application Services criados
- [ ] Controllers criados
- [ ] Routes configuradas
- [ ] Migrations criadas
- [ ] Relacionamento configurado
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas

---

### 📅 SPRINT 3 (Semanas 5-6)

#### 🌾 Feature: Culturas

**RICE**: 63.75 | **Esforço**: 1.0 mês | **Status**: ⚡ Quick Win

**📄 Especificação da Tabela:**
```json
{
  "table": {
    "name": "culturas",
    "singularName": "Cultura",
    "pluralName": "Culturas",
    "description": "Tipos de culturas agrícolas",
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
      "comment": "Nome da cultura (ex: Soja, Milho, Trigo)",
      "validation": {
        "min": 3,
        "max": 255
      }
    },
    {
      "name": "descricao",
      "type": "TEXT",
      "required": false,
      "comment": "Descrição da cultura"
    },
    {
      "name": "cicloDias",
      "type": "INTEGER",
      "required": false,
      "comment": "Ciclo médio em dias",
      "validation": {
        "min": 1
      }
    },
    {
      "name": "ativo",
      "type": "BOOLEAN",
      "required": false,
      "defaultValue": true,
      "comment": "Se a cultura está ativa"
    }
  ],
  "relationships": [],
  "permissions": {
    "create": "cultura.create",
    "read": "cultura.read",
    "update": "cultura.update",
    "delete": "cultura.delete"
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "keys": ["cultura:list:*"]
  },
  "businessRules": [],
  "customMethods": []
}
```

**📁 Estrutura de Arquivos a Gerar:**
```
src/
├── models/
│   └── Cultura.ts
├── infrastructure/repository/
│   ├── ICulturaRepository.ts
│   └── CulturaRepository.ts
├── application/
│   ├── dto/cultura/
│   │   ├── CreateCulturaDto.ts
│   │   ├── UpdateCulturaDto.ts
│   │   ├── CulturaResponseDto.ts
│   │   └── index.ts
│   └── services/cultura/
│       ├── ICulturaApplicationService.ts
│       └── CulturaApplicationService.ts
├── controllers/
│   ├── interfaces/ICulturaController.ts
│   └── CulturaController.ts
├── routes/
│   └── cultura.routes.ts
└── migrations/
    └── YYYYMMDDHHMMSS-create-culturas.ts
```

**✅ Checklist de Implementação:**
- [ ] Model Sequelize criado
- [ ] Repository com interface criado
- [ ] DTOs criados
- [ ] Application Service criado
- [ ] Controller criado
- [ ] Routes configuradas
- [ ] Migration criada
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas

---

#### 🌱 Feature: Safras (Parte 1)

**RICE**: 63.0 | **Esforço**: 0.75 meses | **Status**: 🌾 Base

**📄 Especificação da Tabela:**
```json
{
  "table": {
    "name": "safras",
    "singularName": "Safra",
    "pluralName": "Safras",
    "description": "Safras agrícolas",
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
      "name": "culturaId",
      "type": "INTEGER",
      "required": true,
      "comment": "ID da cultura",
      "validation": {
        "custom": "IsExists:Cultura,id"
      }
    },
    {
      "name": "nome",
      "type": "STRING",
      "required": true,
      "comment": "Nome da safra",
      "validation": {
        "min": 3,
        "max": 255
      }
    },
    {
      "name": "dataInicio",
      "type": "DATEONLY",
      "required": true,
      "comment": "Data de início da safra",
      "validation": {
        "custom": "IsDateString"
      }
    },
    {
      "name": "dataFim",
      "type": "DATEONLY",
      "required": false,
      "comment": "Data de fim da safra",
      "validation": {
        "custom": "IsDateString"
      }
    },
    {
      "name": "status",
      "type": "STRING",
      "required": true,
      "defaultValue": "PLANEJADA",
      "comment": "Status da safra (PLANEJADA, EM_ANDAMENTO, CONCLUIDA, CANCELADA)",
      "validation": {
        "pattern": "^(PLANEJADA|EM_ANDAMENTO|CONCLUIDA|CANCELADA)$"
      }
    }
  ],
  "relationships": [
    {
      "type": "belongsTo",
      "target": "Cultura",
      "foreignKey": "culturaId",
      "as": "cultura",
      "required": true,
      "onDelete": "RESTRICT"
    }
  ],
  "permissions": {
    "create": "safra.create",
    "read": "safra.read",
    "update": "safra.update",
    "delete": "safra.delete"
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "keys": ["safra:list:*", "safra:findByCultura:*", "safra:findByStatus:*"]
  },
  "businessRules": [
    {
      "type": "validation",
      "description": "Data de fim deve ser posterior à data de início",
      "implementation": "Validar no Application Service"
    },
    {
      "type": "crossTenant",
      "description": "Validar se Cultura pertence ao mesmo tenant",
      "implementation": "Verificar no Application Service antes de criar/atualizar"
    }
  ],
  "customMethods": [
    {
      "name": "findByCultura",
      "type": "repository",
      "description": "Busca safras por cultura",
      "parameters": [
        {
          "name": "culturaId",
          "type": "number",
          "required": true
        }
      ],
      "returnType": "Safra[]"
    },
    {
      "name": "findByStatus",
      "type": "repository",
      "description": "Busca safras por status",
      "parameters": [
        {
          "name": "status",
          "type": "string",
          "required": true
        }
      ],
      "returnType": "Safra[]"
    }
  ]
}
```

**📁 Estrutura de Arquivos a Gerar:**
```
src/
├── models/
│   └── Safra.ts
├── infrastructure/repository/
│   ├── ISafraRepository.ts
│   └── SafraRepository.ts
├── application/
│   ├── dto/safra/
│   │   ├── CreateSafraDto.ts
│   │   ├── UpdateSafraDto.ts
│   │   ├── SafraResponseDto.ts
│   │   └── index.ts
│   └── services/safra/
│       ├── ISafraApplicationService.ts
│       └── SafraApplicationService.ts
├── controllers/
│   ├── interfaces/ISafraController.ts
│   └── SafraController.ts
├── routes/
│   └── safra.routes.ts
└── migrations/
    └── YYYYMMDDHHMMSS-create-safras.ts
```

**✅ Checklist de Implementação:**
- [ ] Model Sequelize criado
- [ ] Repository com interface criado
- [ ] DTOs criados
- [ ] Application Service criado
- [ ] Controller criado
- [ ] Routes configuradas
- [ ] Migration criada
- [ ] Relacionamento com Cultura configurado
- [ ] Validação de datas implementada
- [ ] Validação cross-tenant implementada
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas

---

### 📅 SPRINT 4 (Semanas 7-8)

#### 🛠️ Feature: Serviços (Estoque)

**RICE**: 15.0 | **Esforço**: 1.0 mês | **Status**: ⚡ Quick Win

**📄 Especificação da Tabela:**
```json
{
  "table": {
    "name": "servicos",
    "singularName": "Servico",
    "pluralName": "Servicos",
    "description": "Serviços de estoque",
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
      "comment": "Nome do serviço",
      "validation": {
        "min": 3,
        "max": 255
      }
    },
    {
      "name": "descricao",
      "type": "TEXT",
      "required": false,
      "comment": "Descrição do serviço"
    },
    {
      "name": "tipo",
      "type": "STRING",
      "required": true,
      "comment": "Tipo de serviço",
      "validation": {
        "min": 2,
        "max": 50
      }
    },
    {
      "name": "ativo",
      "type": "BOOLEAN",
      "required": false,
      "defaultValue": true,
      "comment": "Se o serviço está ativo"
    }
  ],
  "relationships": [],
  "permissions": {
    "create": "servico.create",
    "read": "servico.read",
    "update": "servico.update",
    "delete": "servico.delete"
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "keys": ["servico:list:*"]
  },
  "businessRules": [],
  "customMethods": []
}
```

**📁 Estrutura de Arquivos a Gerar:**
```
src/
├── models/
│   └── Servico.ts
├── infrastructure/repository/
│   ├── IServicoRepository.ts
│   └── ServicoRepository.ts
├── application/
│   ├── dto/servico/
│   │   ├── CreateServicoDto.ts
│   │   ├── UpdateServicoDto.ts
│   │   ├── ServicoResponseDto.ts
│   │   └── index.ts
│   └── services/servico/
│       ├── IServicoApplicationService.ts
│       └── ServicoApplicationService.ts
├── controllers/
│   ├── interfaces/IServicoController.ts
│   └── ServicoController.ts
├── routes/
│   └── servico.routes.ts
└── migrations/
    └── YYYYMMDDHHMMSS-create-servicos.ts
```

**✅ Checklist de Implementação:**
- [ ] Model Sequelize criado
- [ ] Repository com interface criado
- [ ] DTOs criados
- [ ] Application Service criado
- [ ] Controller criado
- [ ] Routes configuradas
- [ ] Migration criada
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas

---

#### 📊 Feature: Centro de Custos (Parte 1)

**RICE**: 15.0 | **Esforço**: 1.0 mês | **Status**: ⚠️ Bloqueador

**📄 Especificação da Tabela:**
```json
{
  "table": {
    "name": "centro_custos",
    "singularName": "CentroCusto",
    "pluralName": "CentroCustos",
    "description": "Centros de custo com hierarquia",
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
      "name": "codigo",
      "type": "STRING",
      "required": true,
      "unique": true,
      "comment": "Código do centro de custo",
      "validation": {
        "min": 2,
        "max": 50
      }
    },
    {
      "name": "nome",
      "type": "STRING",
      "required": true,
      "comment": "Nome do centro de custo",
      "validation": {
        "min": 3,
        "max": 255
      }
    },
    {
      "name": "centroCustoPaiId",
      "type": "INTEGER",
      "required": false,
      "comment": "ID do centro de custo pai (para hierarquia)",
      "validation": {
        "custom": "IsExists:CentroCusto,id"
      }
    },
    {
      "name": "ativo",
      "type": "BOOLEAN",
      "required": false,
      "defaultValue": true,
      "comment": "Se o centro de custo está ativo"
    }
  ],
  "relationships": [
    {
      "type": "belongsTo",
      "target": "CentroCusto",
      "foreignKey": "centroCustoPaiId",
      "as": "centroCustoPai",
      "required": false,
      "onDelete": "SET NULL"
    },
    {
      "type": "hasMany",
      "target": "CentroCusto",
      "foreignKey": "centroCustoPaiId",
      "as": "centrosCustoFilhos"
    }
  ],
  "permissions": {
    "create": "centroCusto.create",
    "read": "centroCusto.read",
    "update": "centroCusto.update",
    "delete": "centroCusto.delete"
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "keys": ["centroCusto:list:*", "centroCusto:findByPai:*"]
  },
  "businessRules": [
    {
      "type": "validation",
      "description": "Evitar referência circular na hierarquia",
      "implementation": "Validar no Application Service que centroCustoPaiId não cria ciclo"
    }
  ],
  "customMethods": [
    {
      "name": "findByPai",
      "type": "repository",
      "description": "Busca centros de custo filhos de um pai",
      "parameters": [
        {
          "name": "centroCustoPaiId",
          "type": "number",
          "required": true
        }
      ],
      "returnType": "CentroCusto[]"
    }
  ]
}
```

**📁 Estrutura de Arquivos a Gerar:**
```
src/
├── models/
│   └── CentroCusto.ts
├── infrastructure/repository/
│   ├── ICentroCustoRepository.ts
│   └── CentroCustoRepository.ts
├── application/
│   ├── dto/centroCusto/
│   │   ├── CreateCentroCustoDto.ts
│   │   ├── UpdateCentroCustoDto.ts
│   │   ├── CentroCustoResponseDto.ts
│   │   └── index.ts
│   └── services/centroCusto/
│       ├── ICentroCustoApplicationService.ts
│       └── CentroCustoApplicationService.ts
├── controllers/
│   ├── interfaces/ICentroCustoController.ts
│   └── CentroCustoController.ts
├── routes/
│   └── centroCusto.routes.ts
└── migrations/
    └── YYYYMMDDHHMMSS-create-centro_custos.ts
```

**✅ Checklist de Implementação:**
- [ ] Model Sequelize criado
- [ ] Repository com interface criado
- [ ] DTOs criados
- [ ] Application Service criado
- [ ] Controller criado
- [ ] Routes configuradas
- [ ] Migration criada
- [ ] Relacionamento hierárquico configurado
- [ ] Validação de ciclo implementada
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas

---

## ⚙️ FASE 2 - Operações Core

**🎯 Objetivo**: Implementar funcionalidades de operação diária  
**📊 RICE Score**: 45-60  
**⏱️ Esforço Total**: ~13.0 meses-pessoa  
**📅 Duração**: Sprints 5-10 (12 semanas)

---

### 📅 SPRINT 5 (Semanas 9-10)

#### 💰 Feature: Contas (Financeiro) (Parte 1)

**RICE**: 45.0 | **Esforço**: 0.75 meses | **Status**: 💰 Base

**📄 Especificação da Tabela:**
```json
{
  "table": {
    "name": "contas",
    "singularName": "Conta",
    "pluralName": "Contas",
    "description": "Contas bancárias e caixas",
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
      "name": "bancoId",
      "type": "INTEGER",
      "required": true,
      "comment": "ID do banco",
      "validation": {
        "custom": "IsExists:ListaBanco,id"
      }
    },
    {
      "name": "nome",
      "type": "STRING",
      "required": true,
      "comment": "Nome da conta",
      "validation": {
        "min": 3,
        "max": 255
      }
    },
    {
      "name": "agencia",
      "type": "STRING",
      "required": false,
      "comment": "Agência da conta"
    },
    {
      "name": "conta",
      "type": "STRING",
      "required": false,
      "comment": "Número da conta"
    },
    {
      "name": "tipo",
      "type": "STRING",
      "required": true,
      "comment": "Tipo de conta (BANCO, CAIXA)",
      "validation": {
        "pattern": "^(BANCO|CAIXA)$"
      }
    },
    {
      "name": "saldoInicial",
      "type": "DECIMAL",
      "required": false,
      "defaultValue": 0,
      "comment": "Saldo inicial da conta",
      "validation": {
        "min": 0
      }
    },
    {
      "name": "ativo",
      "type": "BOOLEAN",
      "required": false,
      "defaultValue": true,
      "comment": "Se a conta está ativa"
    }
  ],
  "relationships": [
    {
      "type": "belongsTo",
      "target": "ListaBanco",
      "foreignKey": "bancoId",
      "as": "banco",
      "required": true,
      "onDelete": "RESTRICT"
    }
  ],
  "permissions": {
    "create": "conta.create",
    "read": "conta.read",
    "update": "conta.update",
    "delete": "conta.delete"
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "keys": ["conta:list:*", "conta:findByTipo:*"]
  },
  "businessRules": [],
  "customMethods": [
    {
      "name": "findByTipo",
      "type": "repository",
      "description": "Busca contas por tipo",
      "parameters": [
        {
          "name": "tipo",
          "type": "string",
          "required": true
        }
      ],
      "returnType": "Conta[]"
    }
  ]
}
```

**📁 Estrutura de Arquivos a Gerar:**
```
src/
├── models/
│   └── Conta.ts
├── infrastructure/repository/
│   ├── IContaRepository.ts
│   └── ContaRepository.ts
├── application/
│   ├── dto/conta/
│   │   ├── CreateContaDto.ts
│   │   ├── UpdateContaDto.ts
│   │   ├── ContaResponseDto.ts
│   │   └── index.ts
│   └── services/conta/
│       ├── IContaApplicationService.ts
│       └── ContaApplicationService.ts
├── controllers/
│   ├── interfaces/IContaController.ts
│   └── ContaController.ts
├── routes/
│   └── conta.routes.ts
└── migrations/
    └── YYYYMMDDHHMMSS-create-contas.ts
```

**✅ Checklist de Implementação:**
- [ ] Model Sequelize criado
- [ ] Repository com interface criado
- [ ] DTOs criados
- [ ] Application Service criado
- [ ] Controller criado
- [ ] Routes configuradas
- [ ] Migration criada
- [ ] Relacionamento com ListaBanco configurado
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas

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

1. Para cada feature, inserir a especificação JSON completa
2. Gerar o scaffolding usando o modelo
3. Implementar a lógica seguindo os TODO markers
4. Adicionar testes unitários e de integração
5. Documentar a feature

---

**📅 Data do Documento**: Janeiro 2025  
**📋 Versão**: 1.0.0  
**🔄 Status**: Em desenvolvimento
