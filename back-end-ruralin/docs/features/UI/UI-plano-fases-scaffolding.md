# 🏗️ Estruturas de Scaffolding - Plano de Sprints

Este documento contém as estruturas de scaffolding para todas as features do plano de sprints.

**📋 Como usar:**
1. Localizar a feature no documento principal (`UI-plano-fases.md`)
2. Consultar este documento para a estrutura de scaffolding completa
3. Usar os templates em `docs/templates/scaffolding/` como base

---

## 🏗️ FASE 1 - Fundação do Sistema

### 📅 SPRINT 1

#### 🏦 Lista de Bancos

**📁 Estrutura de Arquivos:**
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
│   ├── mappers/
│   │   └── ListaBancoMapper.ts
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

**📝 Interfaces/Contratos:**
- `IListaBancoRepository`: Estende `IRepository<ListaBanco>`, método `findByCodigo(codigo: string)`
- `IListaBancoApplicationService`: Estende `IApplicationService`, métodos CRUD padrão
- `IListaBancoController`: Métodos `index`, `show`, `create`, `update`, `delete`

**🔨 Esqueletos:**
- Repository: Extends `BaseRepository`, método `findByCodigo` com TODO
- Service: Métodos CRUD com decorators `@RequirePermission`, `@Cacheable`, `@CacheEvict`
- Controller: Endpoints CRUD delegando para Service
- Routes: Rotas com middleware de validação e autorização

**✅ Checklist:**
- [ ] Model Sequelize criado
- [ ] Repository com interface criado
- [ ] DTOs (Create, Update, Response) criados
- [ ] Application Service com interface criado
- [ ] Controller com interface criado
- [ ] Routes configuradas
- [ ] Migration criada
- [ ] Mapper criado
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas

---

#### 🔐 Usuários e Permissões (Parte 1)

**📁 Estrutura de Arquivos:**
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
│   ├── mappers/
│   │   └── UsuarioMapper.ts
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

**📝 Interfaces/Contratos:**
- `IUsuarioRepository`: Estende `IRepository<Usuario>`, método `findByEmail(email: string)`
- `IUsuarioApplicationService`: Estende `IApplicationService`, métodos CRUD padrão
- `IUsuarioController`: Métodos `index`, `show`, `create`, `update`, `delete`

**🔨 Esqueletos:**
- Repository: Extends `BaseRepository`, método `findByEmail` com TODO
- Service: Métodos CRUD com decorators, TODO para criptografia de senha
- Controller: Endpoints CRUD delegando para Service
- Routes: Rotas com middleware de validação e autorização

**✅ Checklist:**
- [ ] Model Sequelize criado
- [ ] Repository com interface criado
- [ ] DTOs (Create, Update, Response) criados
- [ ] Application Service com interface criado
- [ ] Controller com interface criado
- [ ] Routes configuradas
- [ ] Migration criada
- [ ] Mapper criado
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas
- [ ] Criptografia de senha implementada (TODO no Service)

---

#### 🤝 Parceiros de Negócio (Parte 1)

**📁 Estrutura de Arquivos:**
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
│   ├── mappers/
│   │   └── ParceiroMapper.ts
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

**📝 Interfaces/Contratos:**
- `IParceiroRepository`: Estende `IRepository<Parceiro>`, métodos `findByTipo(tipo: string)`, `findByCpfCnpj(cpfCnpj: string)`
- `IParceiroApplicationService`: Estende `IApplicationService`, métodos CRUD padrão
- `IParceiroController`: Métodos `index`, `show`, `create`, `update`, `delete`

**🔨 Esqueletos:**
- Repository: Extends `BaseRepository`, métodos customizados com TODO
- Service: Métodos CRUD com decorators
- Controller: Endpoints CRUD delegando para Service
- Routes: Rotas com middleware de validação e autorização

**✅ Checklist:**
- [ ] Model Sequelize criado
- [ ] Repository com interface criado
- [ ] DTOs (Create, Update, Response) criados
- [ ] Application Service com interface criado
- [ ] Controller com interface criado
- [ ] Routes configuradas
- [ ] Migration criada
- [ ] Mapper criado
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas
- [ ] Métodos customizados implementados

---

### 📅 SPRINT 2

#### 🔐 Usuários e Permissões (Parte 2)

**📁 Estrutura de Arquivos:**
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
│   ├── dto/permissao/
│   │   ├── CreatePermissaoDto.ts
│   │   ├── UpdatePermissaoDto.ts
│   │   ├── PermissaoResponseDto.ts
│   │   └── index.ts
│   ├── mappers/
│   │   ├── RoleMapper.ts
│   │   └── PermissaoMapper.ts
│   └── services/
│       ├── role/
│       │   ├── IRoleApplicationService.ts
│       │   └── RoleApplicationService.ts
│       └── permissao/
│           ├── IPermissaoApplicationService.ts
│           └── PermissaoApplicationService.ts
├── controllers/
│   ├── interfaces/
│   │   ├── IRoleController.ts
│   │   └── IPermissaoController.ts
│   ├── RoleController.ts
│   └── PermissaoController.ts
├── routes/
│   ├── role.routes.ts
│   └── permissao.routes.ts
└── migrations/
    ├── YYYYMMDDHHMMSS-create-roles.ts
    ├── YYYYMMDDHHMMSS-create-permissoes.ts
    ├── YYYYMMDDHHMMSS-create-user_has_role.ts
    └── YYYYMMDDHHMMSS-create-role_has_permissao.ts
```

**📝 Interfaces/Contratos:**
- `IRoleRepository`: Estende `IRepository<Role>`, método `findByNome(nome: string)`
- `IPermissaoRepository`: Estende `IRepository<Permissao>`, método `findByNome(nome: string)`
- `IRoleApplicationService`: Estende `IApplicationService`, métodos CRUD padrão
- `IPermissaoApplicationService`: Estende `IApplicationService`, métodos CRUD padrão
- `IRoleController`: Métodos `index`, `show`, `create`, `update`, `delete`
- `IPermissaoController`: Métodos `index`, `show`, `create`, `update`, `delete`

**🔨 Esqueletos:**
- Repositories: Extends `BaseRepository`, métodos customizados com TODO
- Services: Métodos CRUD com decorators
- Controllers: Endpoints CRUD delegando para Services
- Routes: Rotas com middleware de validação e autorização

**✅ Checklist:**
- [ ] Models Role e Permissao criados
- [ ] Repositories criados
- [ ] DTOs criados
- [ ] Application Services criados
- [ ] Controllers criados
- [ ] Routes configuradas
- [ ] Migrations criadas (tabelas de relacionamento incluídas)
- [ ] Mappers criados
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas

---

#### 📦 Produtos (Parte 1)

**📁 Estrutura de Arquivos:**
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
│   ├── dto/categoriaProduto/
│   │   ├── CreateCategoriaProdutoDto.ts
│   │   ├── UpdateCategoriaProdutoDto.ts
│   │   ├── CategoriaProdutoResponseDto.ts
│   │   └── index.ts
│   ├── mappers/
│   │   ├── ProdutoMapper.ts
│   │   └── CategoriaProdutoMapper.ts
│   └── services/
│       ├── produto/
│       │   ├── IProdutoApplicationService.ts
│       │   └── ProdutoApplicationService.ts
│       └── categoriaProduto/
│           ├── ICategoriaProdutoApplicationService.ts
│           └── CategoriaProdutoApplicationService.ts
├── controllers/
│   ├── interfaces/
│   │   ├── IProdutoController.ts
│   │   └── ICategoriaProdutoController.ts
│   ├── ProdutoController.ts
│   └── CategoriaProdutoController.ts
├── routes/
│   ├── produto.routes.ts
│   └── categoriaProduto.routes.ts
└── migrations/
    ├── YYYYMMDDHHMMSS-create-categoria_produtos.ts
    └── YYYYMMDDHHMMSS-create-produtos.ts
```

**📝 Interfaces/Contratos:**
- `IProdutoRepository`: Estende `IRepository<Produto>`, método `findByCategoria(categoriaId: number)`
- `ICategoriaProdutoRepository`: Estende `IRepository<CategoriaProduto>`
- `IProdutoApplicationService`: Estende `IApplicationService`, métodos CRUD padrão
- `ICategoriaProdutoApplicationService`: Estende `IApplicationService`, métodos CRUD padrão
- `IProdutoController`: Métodos `index`, `show`, `create`, `update`, `delete`
- `ICategoriaProdutoController`: Métodos `index`, `show`, `create`, `update`, `delete`

**🔨 Esqueletos:**
- Repositories: Extends `BaseRepository`, métodos customizados com TODO
- Services: Métodos CRUD com decorators, validação cross-tenant para relacionamento
- Controllers: Endpoints CRUD delegando para Services
- Routes: Rotas com middleware de validação e autorização

**✅ Checklist:**
- [ ] Models Produto e CategoriaProduto criados
- [ ] Repositories criados
- [ ] DTOs criados
- [ ] Application Services criados
- [ ] Controllers criados
- [ ] Routes configuradas
- [ ] Migrations criadas
- [ ] Relacionamento configurado
- [ ] Mappers criados
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas

---

### 📅 SPRINT 3

#### 🌾 Culturas

**📁 Estrutura de Arquivos:**
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
│   ├── mappers/
│   │   └── CulturaMapper.ts
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

**📝 Interfaces/Contratos:**
- `ICulturaRepository`: Estende `IRepository<Cultura>`
- `ICulturaApplicationService`: Estende `IApplicationService`, métodos CRUD padrão
- `ICulturaController`: Métodos `index`, `show`, `create`, `update`, `delete`

**🔨 Esqueletos:**
- Repository: Extends `BaseRepository`
- Service: Métodos CRUD com decorators
- Controller: Endpoints CRUD delegando para Service
- Routes: Rotas com middleware de validação e autorização

**✅ Checklist:**
- [ ] Model Sequelize criado
- [ ] Repository com interface criado
- [ ] DTOs criados
- [ ] Application Service criado
- [ ] Controller criado
- [ ] Routes configuradas
- [ ] Migration criada
- [ ] Mapper criado
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas

---

#### 🌱 Safras (Parte 1)

**📁 Estrutura de Arquivos:**
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
│   ├── mappers/
│   │   └── SafraMapper.ts
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

**📝 Interfaces/Contratos:**
- `ISafraRepository`: Estende `IRepository<Safra>`, métodos `findByCultura(culturaId: number)`, `findByStatus(status: string)`
- `ISafraApplicationService`: Estende `IApplicationService`, métodos CRUD padrão
- `ISafraController`: Métodos `index`, `show`, `create`, `update`, `delete`

**🔨 Esqueletos:**
- Repository: Extends `BaseRepository`, métodos customizados com TODO
- Service: Métodos CRUD com decorators, TODO para validação de datas e cross-tenant
- Controller: Endpoints CRUD delegando para Service
- Routes: Rotas com middleware de validação e autorização

**✅ Checklist:**
- [ ] Model Sequelize criado
- [ ] Repository com interface criado
- [ ] DTOs criados
- [ ] Application Service criado
- [ ] Controller criado
- [ ] Routes configuradas
- [ ] Migration criada
- [ ] Relacionamento com Cultura configurado
- [ ] Validação de datas implementada (TODO no Service)
- [ ] Validação cross-tenant implementada (TODO no Service)
- [ ] Mapper criado
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas

---

### 📅 SPRINT 4

#### 🛠️ Serviços (Estoque)

**📁 Estrutura de Arquivos:**
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
│   ├── mappers/
│   │   └── ServicoMapper.ts
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

**📝 Interfaces/Contratos:**
- `IServicoRepository`: Estende `IRepository<Servico>`
- `IServicoApplicationService`: Estende `IApplicationService`, métodos CRUD padrão
- `IServicoController`: Métodos `index`, `show`, `create`, `update`, `delete`

**🔨 Esqueletos:**
- Repository: Extends `BaseRepository`
- Service: Métodos CRUD com decorators
- Controller: Endpoints CRUD delegando para Service
- Routes: Rotas com middleware de validação e autorização

**✅ Checklist:**
- [ ] Model Sequelize criado
- [ ] Repository com interface criado
- [ ] DTOs criados
- [ ] Application Service criado
- [ ] Controller criado
- [ ] Routes configuradas
- [ ] Migration criada
- [ ] Mapper criado
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas

---

#### 📊 Centro de Custos (Parte 1)

**📁 Estrutura de Arquivos:**
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
│   ├── mappers/
│   │   └── CentroCustoMapper.ts
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

**📝 Interfaces/Contratos:**
- `ICentroCustoRepository`: Estende `IRepository<CentroCusto>`, método `findByPai(centroCustoPaiId: number)`
- `ICentroCustoApplicationService`: Estende `IApplicationService`, métodos CRUD padrão
- `ICentroCustoController`: Métodos `index`, `show`, `create`, `update`, `delete`

**🔨 Esqueletos:**
- Repository: Extends `BaseRepository`, método customizado com TODO
- Service: Métodos CRUD com decorators, TODO para validação de ciclo hierárquico
- Controller: Endpoints CRUD delegando para Service
- Routes: Rotas com middleware de validação e autorização

**✅ Checklist:**
- [ ] Model Sequelize criado
- [ ] Repository com interface criado
- [ ] DTOs criados
- [ ] Application Service criado
- [ ] Controller criado
- [ ] Routes configuradas
- [ ] Migration criada
- [ ] Relacionamento hierárquico configurado
- [ ] Validação de ciclo implementada (TODO no Service)
- [ ] Mapper criado
- [ ] Registros no DI Container
- [ ] Validações implementadas
- [ ] Cache configurado
- [ ] Permissões configuradas

---

## ⚙️ FASE 2 - Operações Core

### 📅 SPRINT 5

#### 💰 Contas (Financeiro) (Parte 1)

**📁 Estrutura de Arquivos:**
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
│   ├── mappers/
│   │   └── ContaMapper.ts
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

**📝 Interfaces/Contratos:**
- `IContaRepository`: Estende `IRepository<Conta>`, método `findByTipo(tipo: string)`
- `IContaApplicationService`: Estende `IApplicationService`, métodos CRUD padrão
- `IContaController`: Métodos `index`, `show`, `create`, `update`, `delete`

**🔨 Esqueletos:**
- Repository: Extends `BaseRepository`, método customizado com TODO
- Service: Métodos CRUD com decorators
- Controller: Endpoints CRUD delegando para Service
- Routes: Rotas com middleware de validação e autorização

**✅ Checklist:**
- [ ] Model Sequelize criado
- [ ] Repository com interface criado
- [ ] DTOs criados
- [ ] Application Service criado
- [ ] Controller criado
- [ ] Routes configuradas
- [ ] Migration criada
- [ ] Relacionamento com ListaBanco configurado
- [ ] Mapper criado
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

1. Para cada feature, usar os templates em `docs/templates/scaffolding/`
2. Substituir variáveis nos templates
3. Gerar o scaffolding usando o modelo
4. Implementar a lógica seguindo os TODO markers
5. Adicionar testes unitários e de integração
6. Documentar a feature

---

**📅 Data do Documento**: Janeiro 2025  
**📋 Versão**: 1.0.0  
**🔄 Status**: Em desenvolvimento
