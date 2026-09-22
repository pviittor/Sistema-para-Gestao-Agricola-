# 🗓️ Plano de Sprints e Fases - RuralIn

## 📋 Visão Geral

**📊 Total de Features**: 33  
**⏱️ Esforço Total**: ~61.5 meses-pessoa  
**👥 Equipe Sugerida**: 3-5 desenvolvedores  
**📅 Duração Total**: ~15 meses (30 sprints de 2 semanas)  
**🔄 Metodologia**: Scrum com sprints de 2 semanas

---

## 🎯 Estrutura de Sprints

- **Duração**: 2 semanas (10 dias úteis)
- **Capacidade por Sprint**: ~2-3 meses-pessoa (assumindo equipe de 3-5 devs)
- **Cerimônias**: Planning, Daily, Review, Retrospective
- **Entregas**: Features funcionais e testadas

---

## 🏗️ FASE 1 - Fundação do Sistema

**🎯 Objetivo**: Estabelecer as bases fundamentais do sistema  
**📊 RICE Score**: 60+  
**⏱️ Esforço Total**: ~7.5 meses-pessoa  
**📅 Duração**: Sprints 1-4 (8 semanas)

---

### 📅 SPRINT 1 (Semanas 1-2)
**🎯 Objetivo**: Iniciar cadastros base e infraestrutura

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 🏦 Lista de Bancos | 81.0 | 0.5 meses | Dev 1 | ⚡ Quick Win |
| 🔐 Usuários e Permissões (Parte 1) | 79.17 | 0.75 meses | Dev 2 | 🔐 Base |
| 🤝 Parceiros de Negócio (Parte 1) | 72.0 | 0.75 meses | Dev 3 | 🔗 Base |

**📊 Esforço Total**: ~2.0 meses-pessoa

#### 🏦 Feature: Lista de Bancos

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

**✅ Checklist de Implementação:**
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

#### 🔐 Feature: Usuários e Permissões (Parte 1)

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

**✅ Checklist de Implementação:**
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

#### 🤝 Feature: Parceiros de Negócio (Parte 1)

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

**✅ Checklist de Implementação:**
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

**⚠️ Riscos**: Nenhum (features independentes)

> **📋 Nota**: Para estruturas de scaffolding detalhadas de todas as features, consulte `docs/features/UI/UI-plano-fases-scaffolding.md`

---

### 📅 SPRINT 2 (Semanas 3-4)
**🎯 Objetivo**: Completar cadastros base

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 🔐 Usuários e Permissões (Parte 2) | 79.17 | 0.75 meses | Dev 1 | 🔐 Base |
| 🤝 Parceiros de Negócio (Parte 2) | 72.0 | 0.75 meses | Dev 2 | 🔗 Base |
| 📦 Produtos (Parte 1) | 66.5 | 0.75 meses | Dev 3 | 📦 Base |

**📊 Esforço Total**: ~2.25 meses-pessoa  
**✅ Entregas**:
- Sistema completo de Usuários e Permissões (roles, permissões, gestão de acesso)
- CRUD completo de Parceiros de Negócio (fornecedores, clientes, terceiros)
- Estrutura inicial de Produtos (modelo de dados, categorias)

**🎯 Critérios de Aceite**:
- [ ] Sistema de permissões funcional com roles
- [ ] CRUD completo de Parceiros com validações
- [ ] Modelo de dados de Produtos criado
- [ ] Testes unitários básicos implementados

**⚠️ Riscos**: Nenhum

---

### 📅 SPRINT 3 (Semanas 5-6)
**🎯 Objetivo**: Completar cadastros de produtos e iniciar produção

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 📦 Produtos (Parte 2) | 66.5 | 0.75 meses | Dev 1 | 📦 Base |
| 🌾 Culturas | 63.75 | 1.0 mês | Dev 2 | ⚡ Quick Win |
| 🌱 Safras (Parte 1) | 63.0 | 0.75 meses | Dev 3 | 🌾 Base |

**📊 Esforço Total**: ~2.5 meses-pessoa  
**✅ Entregas**:
- CRUD completo de Produtos (com unidades de medida, categorias, preços)
- CRUD completo de Culturas (tipos de culturas, características)
- Estrutura inicial de Safras (modelo de dados, relacionamento com culturas)

**🎯 Critérios de Aceite**:
- [ ] CRUD completo de Produtos com validações e relacionamentos
- [ ] CRUD completo de Culturas funcional
- [ ] Modelo de dados de Safras criado
- [ ] Integração entre Culturas e Safras

**⚠️ Riscos**: Nenhum

---

### 📅 SPRINT 4 (Semanas 7-8)
**🎯 Objetivo**: Finalizar fundação do sistema

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 🌱 Safras (Parte 2) | 63.0 | 0.75 meses | Dev 1 | 🌾 Base |
| 🛠️ Serviços (Estoque) | 15.0 | 1.0 mês | Dev 2 | ⚡ Quick Win |
| 📊 Centro de Custos (Parte 1) | 15.0 | 1.0 mês | Dev 3 | ⚠️ Bloqueador |

**📊 Esforço Total**: ~2.75 meses-pessoa  
**✅ Entregas**:
- CRUD completo de Safras (com ciclo completo, datas, status)
- CRUD completo de Serviços (estoque)
- Estrutura inicial de Centro de Custos (modelo de dados, hierarquia)

**🎯 Critérios de Aceite**:
- [ ] CRUD completo de Safras funcional
- [ ] CRUD completo de Serviços funcional
- [ ] Modelo de dados de Centro de Custos criado
- [ ] Testes de integração básicos

**⚠️ Riscos**: Nenhum

**📊 Resumo Fase 1**:
- ✅ 6 features base completas
- ✅ 2 features complementares iniciadas
- ✅ Infraestrutura base estabelecida
- ✅ Pronto para Fase 2

---

## ⚙️ FASE 2 - Operações Core

**🎯 Objetivo**: Implementar funcionalidades de operação diária  
**📊 RICE Score**: 45-60  
**⏱️ Esforço Total**: ~13.0 meses-pessoa  
**📅 Duração**: Sprints 5-10 (12 semanas)

---

### 📅 SPRINT 5 (Semanas 9-10)
**🎯 Objetivo**: Completar pré-requisitos financeiros

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 📊 Centro de Custos (Parte 2) | 15.0 | 1.0 mês | Dev 1 | ⚠️ Bloqueador |
| 📈 Plano Financeiro Gerencial (Parte 1) | 7.0 | 1.5 meses | Dev 2 | ⚠️ Bloqueador |
| 💰 Contas (Financeiro) (Parte 1) | 45.0 | 0.75 meses | Dev 3 | 💰 Base |

**📊 Esforço Total**: ~3.25 meses-pessoa  
**✅ Entregas**:
- CRUD completo de Centro de Custos (com hierarquia e validações)
- Estrutura inicial de Plano Financeiro Gerencial (modelo de dados, categorias)
- Estrutura inicial de Contas (modelo de dados, integração com Lista de Bancos)

**🎯 Critérios de Aceite**:
- [ ] CRUD completo de Centro de Custos funcional
- [ ] Modelo de dados de Plano Financeiro Gerencial criado
- [ ] Modelo de dados de Contas criado
- [ ] Integração Contas ↔ Lista de Bancos funcionando

**⚠️ Riscos**: Baixo - dependências já implementadas

---

### 📅 SPRINT 6 (Semanas 11-12)
**🎯 Objetivo**: Completar módulo financeiro base

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 📈 Plano Financeiro Gerencial (Parte 2) | 7.0 | 1.5 meses | Dev 1 | ⚠️ Bloqueador |
| 💰 Contas (Financeiro) (Parte 2) | 45.0 | 0.75 meses | Dev 2 | 💰 Base |
| 🚜 Operações de Campo (Parte 1) | 57.38 | 1.0 mês | Dev 3 | 🚜 Core |

**📊 Esforço Total**: ~3.25 meses-pessoa  
**✅ Entregas**:
- CRUD completo de Plano Financeiro Gerencial (categorias, contas, estrutura)
- CRUD completo de Contas (com validações e integrações)
- Estrutura inicial de Operações de Campo (modelo de dados, tipos de operação)

**🎯 Critérios de Aceite**:
- [ ] CRUD completo de Plano Financeiro Gerencial funcional
- [ ] CRUD completo de Contas funcional
- [ ] Modelo de dados de Operações de Campo criado
- [ ] Testes de integração financeiros

**⚠️ Riscos**: Nenhum

---

### 📅 SPRINT 7 (Semanas 13-14)
**🎯 Objetivo**: Implementar Contas a Pagar/Receber

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 💸 Contas a Pagar (Parte 1) | 49.88 | 1.0 mês | Dev 1 | 🔥 Crítico |
| 💵 Contas a Receber (Parte 1) | 49.88 | 1.0 mês | Dev 2 | 🔥 Crítico |
| 🚜 Operações de Campo (Parte 2) | 57.38 | 1.0 mês | Dev 3 | 🚜 Core |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- Estrutura inicial de Contas a Pagar (modelo de dados, fluxo básico)
- Estrutura inicial de Contas a Receber (modelo de dados, fluxo básico)
- CRUD completo de Operações de Campo (tipos, configurações, validações)

**🎯 Critérios de Aceite**:
- [ ] Modelo de dados de Contas a Pagar criado
- [ ] Modelo de dados de Contas a Receber criado
- [ ] CRUD completo de Operações de Campo funcional
- [ ] Integração Operações ↔ Safras funcionando

**⚠️ Riscos**: Médio - dependências críticas devem estar prontas

---

### 📅 SPRINT 8 (Semanas 15-16)
**🎯 Objetivo**: Completar Contas a Pagar/Receber

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 💸 Contas a Pagar (Parte 2) | 49.88 | 1.0 mês | Dev 1 | 🔥 Crítico |
| 💵 Contas a Receber (Parte 2) | 49.88 | 1.0 mês | Dev 2 | 🔥 Crítico |
| 📜 Históricos de Tesouraria | 30.0 | 1.0 mês | Dev 3 | 📊 Relatório |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- CRUD completo de Contas a Pagar (com fluxo de aprovação, vencimentos, pagamentos)
- CRUD completo de Contas a Receber (com fluxo de aprovação, vencimentos, recebimentos)
- Relatório de Históricos de Tesouraria (consultas, filtros, exportação)

**🎯 Critérios de Aceite**:
- [ ] CRUD completo de Contas a Pagar funcional
- [ ] CRUD completo de Contas a Receber funcional
- [ ] Relatório de Históricos funcional
- [ ] Integração com Centro de Custos e Plano Financeiro
- [ ] Testes end-to-end financeiros

**⚠️ Riscos**: Médio - funcionalidade crítica, requer testes extensivos

---

### 📅 SPRINT 9 (Semanas 17-18)
**🎯 Objetivo**: Iniciar Apontamento de Atividade

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 📝 Apontamento de Atividade (Parte 1) | 48.6 | 1.25 meses | Dev 1 | 📝 Core |
| 🌾 Serviços de Campo | 18.75 | 1.5 meses | Dev 2 | 🌾 Complementar |
| 🏛️ Propriedades (Parte 1) | 38.25 | 1.0 mês | Dev 3 | 🏛️ Base |

**📊 Esforço Total**: ~3.75 meses-pessoa  
**✅ Entregas**:
- Estrutura inicial de Apontamento de Atividade (modelo de dados, fluxo básico)
- CRUD completo de Serviços de Campo
- Estrutura inicial de Propriedades (modelo de dados, cadastro básico)

**🎯 Critérios de Aceite**:
- [ ] Modelo de dados de Apontamento criado
- [ ] CRUD completo de Serviços de Campo funcional
- [ ] Modelo de dados de Propriedades criado
- [ ] Integração Propriedades ↔ Parceiros funcionando

**⚠️ Riscos**: Baixo

---

### 📅 SPRINT 10 (Semanas 19-20)
**🎯 Objetivo**: Completar Apontamento e Propriedades

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 📝 Apontamento de Atividade (Parte 2) | 48.6 | 1.25 meses | Dev 1 | 📝 Core |
| 🏛️ Propriedades (Parte 2) | 38.25 | 1.0 mês | Dev 2 | 🏛️ Base |
| ⚙️ Configuração de Ciclo/Safra (Parte 1) | 21.33 | 0.75 mês | Dev 3 | ⚙️ Config |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- CRUD completo de Apontamento de Atividade (uso de insumos, máquinas, validações)
- CRUD completo de Propriedades (com localização, área, características)
- Estrutura inicial de Configuração de Ciclo/Safra

**🎯 Critérios de Aceite**:
- [ ] CRUD completo de Apontamento funcional
- [ ] Integração Apontamento ↔ Produtos, Propriedades, Operações
- [ ] CRUD completo de Propriedades funcional
- [ ] Modelo de dados de Configuração de Ciclo/Safra criado
- [ ] Testes de integração produção

**⚠️ Riscos**: Médio - múltiplas integrações

**📊 Resumo Fase 2**:
- ✅ 5 features core completas
- ✅ 2 pré-requisitos completos
- ✅ Módulo financeiro base funcional
- ✅ Módulo produção iniciado
- ✅ Pronto para Fase 3

---

## 🔄 FASE 3 - Movimentações e Patrimônio

**🎯 Objetivo**: Completar fluxos operacionais principais  
**📊 RICE Score**: 30-45  
**⏱️ Esforço Total**: ~18.0 meses-pessoa  
**📅 Duração**: Sprints 11-18 (16 semanas)

---

### 📅 SPRINT 11 (Semanas 21-22)
**🎯 Objetivo**: Implementar Máquinas e Veículos

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 🚜 Máquinas e Veículos (Parte 1) | 42.5 | 1.0 mês | Dev 1 | 🚜 Patrimônio |
| ⛽ Abastecimento (Parte 1) | 42.5 | 1.0 mês | Dev 2 | ⛽ Movimentação |
| 💳 Caixa/Banco (Parte 1) | 33.75 | 1.0 mês | Dev 3 | 💳 Financeiro |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- Estrutura inicial de Máquinas e Veículos (modelo de dados, cadastro básico)
- Estrutura inicial de Abastecimento (modelo de dados, fluxo básico)
- Estrutura inicial de Caixa/Banco (modelo de dados, movimentações básicas)

**🎯 Critérios de Aceite**:
- [ ] Modelo de dados de Máquinas e Veículos criado
- [ ] Integração Máquinas ↔ Propriedades, Parceiros funcionando
- [ ] Modelo de dados de Abastecimento criado
- [ ] Modelo de dados de Caixa/Banco criado
- [ ] Integração Caixa/Banco ↔ Contas funcionando

**⚠️ Riscos**: Baixo

---

### 📅 SPRINT 12 (Semanas 23-24)
**🎯 Objetivo**: Completar Máquinas e Abastecimento

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 🚜 Máquinas e Veículos (Parte 2) | 42.5 | 1.0 mês | Dev 1 | 🚜 Patrimônio |
| ⛽ Abastecimento (Parte 2) | 42.5 | 1.0 mês | Dev 2 | ⛽ Movimentação |
| 💳 Caixa/Banco (Parte 2) | 33.75 | 1.0 mês | Dev 3 | 💳 Financeiro |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- CRUD completo de Máquinas e Veículos (com características, histórico, validações)
- CRUD completo de Abastecimento (com integração produtos, máquinas, validações)
- CRUD completo de Caixa/Banco (com movimentações, saldos, validações)

**🎯 Critérios de Aceite**:
- [ ] CRUD completo de Máquinas e Veículos funcional
- [ ] CRUD completo de Abastecimento funcional
- [ ] Integração Abastecimento ↔ Produtos, Máquinas funcionando
- [ ] CRUD completo de Caixa/Banco funcional
- [ ] Testes de integração patrimônio

**⚠️ Riscos**: Baixo

---

### 📅 SPRINT 13 (Semanas 25-26)
**🎯 Objetivo**: Implementar Notas de Entrada/Saída

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 📥 Nota de Entrada (Parte 1) | 40.5 | 1.0 mês | Dev 1 | 📥 Movimentação |
| 📤 Nota de Saída (Parte 1) | 40.5 | 1.0 mês | Dev 2 | 📤 Movimentação |
| 🔧 Manutenção de Máquinas (Parte 1) | 37.19 | 1.0 mês | Dev 3 | 🔧 Manutenção |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- Estrutura inicial de Nota de Entrada (modelo de dados, fluxo básico)
- Estrutura inicial de Nota de Saída (modelo de dados, fluxo básico)
- Estrutura inicial de Manutenção de Máquinas (modelo de dados, tipos)

**🎯 Critérios de Aceite**:
- [ ] Modelo de dados de Nota de Entrada criado
- [ ] Modelo de dados de Nota de Saída criado
- [ ] Integração Notas ↔ Produtos, Parceiros funcionando
- [ ] Modelo de dados de Manutenção criado
- [ ] Integração Manutenção ↔ Máquinas funcionando

**⚠️ Riscos**: Médio - múltiplas integrações

---

### 📅 SPRINT 14 (Semanas 27-28)
**🎯 Objetivo**: Completar Notas e Manutenção

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 📥 Nota de Entrada (Parte 2) | 40.5 | 1.0 mês | Dev 1 | 📥 Movimentação |
| 📤 Nota de Saída (Parte 2) | 40.5 | 1.0 mês | Dev 2 | 📤 Movimentação |
| 🔧 Manutenção de Máquinas (Parte 2) | 37.19 | 1.0 mês | Dev 3 | 🔧 Manutenção |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- CRUD completo de Nota de Entrada (com itens, validações, integração Contas a Pagar)
- CRUD completo de Nota de Saída (com itens, validações, integração Contas a Receber)
- CRUD completo de Manutenção de Máquinas (com histórico, custos, validações)

**🎯 Critérios de Aceite**:
- [ ] CRUD completo de Nota de Entrada funcional
- [ ] Integração Nota de Entrada ↔ Contas a Pagar funcionando
- [ ] CRUD completo de Nota de Saída funcional
- [ ] Integração Nota de Saída ↔ Contas a Receber funcionando
- [ ] CRUD completo de Manutenção funcional
- [ ] Testes end-to-end movimentações

**⚠️ Riscos**: Médio - integrações financeiras críticas

---

### 📅 SPRINT 15 (Semanas 29-30)
**🎯 Objetivo**: Implementar Romaneio e Talhão

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 📋 Romaneio de Entrada (Parte 1) | 31.88 | 1.0 mês | Dev 1 | 📋 Produção |
| 🗺️ Talhão (Parte 1) | 30.0 | 1.0 mês | Dev 2 | 🗺️ Produção |
| ⚙️ Configuração de Ciclo/Safra (Parte 2) | 21.33 | 0.75 mês | Dev 3 | ⚙️ Config |

**📊 Esforço Total**: ~2.75 meses-pessoa  
**✅ Entregas**:
- Estrutura inicial de Romaneio de Entrada (modelo de dados, fluxo básico)
- Estrutura inicial de Talhão (modelo de dados, cadastro básico)
- CRUD completo de Configuração de Ciclo/Safra (com validações e integrações)

**🎯 Critérios de Aceite**:
- [ ] Modelo de dados de Romaneio criado
- [ ] Integração Romaneio ↔ Produtos, Propriedades funcionando
- [ ] Modelo de dados de Talhão criado
- [ ] Integração Talhão ↔ Propriedades funcionando
- [ ] CRUD completo de Configuração de Ciclo/Safra funcional

**⚠️ Riscos**: Baixo

---

### 📅 SPRINT 16 (Semanas 31-32)
**🎯 Objetivo**: Completar Romaneio e Talhão

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 📋 Romaneio de Entrada (Parte 2) | 31.88 | 1.0 mês | Dev 1 | 📋 Produção |
| 🗺️ Talhão (Parte 2) | 30.0 | 1.0 mês | Dev 2 | 🗺️ Produção |
| 🏛️ Benfeitorias | 13.33 | 1.5 meses | Dev 3 | 🏛️ Patrimônio |

**📊 Esforço Total**: ~3.5 meses-pessoa  
**✅ Entregas**:
- CRUD completo de Romaneio de Entrada (com itens, validações, integrações)
- CRUD completo de Talhão (com área, localização, integração mapas se aplicável)
- CRUD completo de Benfeitorias (com características, validações)

**🎯 Critérios de Aceite**:
- [ ] CRUD completo de Romaneio funcional
- [ ] CRUD completo de Talhão funcional
- [ ] Integração Talhão ↔ Propriedades, Safras funcionando
- [ ] CRUD completo de Benfeitorias funcional
- [ ] Integração Benfeitorias ↔ Propriedades funcionando
- [ ] Testes de integração produção

**⚠️ Riscos**: Baixo

---

### 📅 SPRINT 17 (Semanas 33-34)
**🎯 Objetivo**: Buffer e refinamentos

| Atividade | Esforço | Responsável | Status |
|-----------|---------|-------------|--------|
| 🔧 Refinamentos Fase 3 | 1.0 mês | Dev 1 | 🔧 Melhoria |
| 🐛 Correções de Bugs | 1.0 mês | Dev 2 | 🐛 Correção |
| 📊 Testes de Integração | 1.0 mês | Dev 3 | 📊 Teste |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- Correções de bugs identificados
- Melhorias de performance
- Testes de integração completos
- Documentação atualizada

**🎯 Critérios de Aceite**:
- [ ] Todos os bugs críticos corrigidos
- [ ] Testes de integração passando
- [ ] Performance aceitável
- [ ] Documentação atualizada

**⚠️ Riscos**: Baixo

---

### 📅 SPRINT 18 (Semanas 35-36)
**🎯 Objetivo**: Finalizar Fase 3 e preparar Fase 4

| Atividade | Esforço | Responsável | Status |
|-----------|---------|-------------|--------|
| 📝 Documentação Fase 3 | 0.5 mês | Dev 1 | 📝 Docs |
| 🎨 Melhorias de UX | 1.0 mês | Dev 2 | 🎨 UX |
| 🚀 Deploy e Validação | 1.5 meses | Dev 3 | 🚀 Deploy |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- Documentação completa da Fase 3
- Melhorias de UX implementadas
- Deploy em ambiente de homologação
- Validação com usuários

**🎯 Critérios de Aceite**:
- [ ] Documentação completa
- [ ] Melhorias de UX aplicadas
- [ ] Deploy bem-sucedido
- [ ] Feedback de usuários coletado

**⚠️ Riscos**: Baixo

**📊 Resumo Fase 3**:
- ✅ 9 features operacionais completas
- ✅ Fluxos principais funcionando
- ✅ Integrações validadas
- ✅ Pronto para Fase 4

---

## 📊 FASE 4 - Complementos e Relatórios

**🎯 Objetivo**: Funcionalidades importantes mas menos críticas  
**📊 RICE Score**: 15-30  
**⏱️ Esforço Total**: ~14.5 meses-pessoa  
**📅 Duração**: Sprints 19-24 (12 semanas)

---

### 📅 SPRINT 19 (Semanas 37-38)
**🎯 Objetivo**: Implementar Pedido de Compra

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 🛒 Pedido de Compra (Parte 1) | 26.56 | 1.0 mês | Dev 1 | 🛒 Compras |
| 📊 Painel Financeiro (Parte 1) | 20.0 | 1.25 meses | Dev 2 | 📊 Dashboard |
| 🎨 Melhorias UX Gerais | - | 0.75 mês | Dev 3 | 🎨 UX |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- Estrutura inicial de Pedido de Compra (modelo de dados, fluxo básico)
- Estrutura inicial de Painel Financeiro (dashboards, gráficos básicos)
- Melhorias de UX em telas existentes

**🎯 Critérios de Aceite**:
- [ ] Modelo de dados de Pedido de Compra criado
- [ ] Integração Pedido ↔ Produtos, Parceiros funcionando
- [ ] Estrutura de dashboards criada
- [ ] Melhorias de UX aplicadas

**⚠️ Riscos**: Baixo

---

### 📅 SPRINT 20 (Semanas 39-40)
**🎯 Objetivo**: Completar Pedido de Compra e Painel

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 🛒 Pedido de Compra (Parte 2) | 26.56 | 1.0 mês | Dev 1 | 🛒 Compras |
| 📊 Painel Financeiro (Parte 2) | 20.0 | 1.25 meses | Dev 2 | 📊 Dashboard |
| 🔧 Otimizações | - | 0.75 mês | Dev 3 | 🔧 Performance |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- CRUD completo de Pedido de Compra (com aprovação, integração Contas a Pagar)
- Painel Financeiro completo (dashboards, gráficos, filtros, exportação)
- Otimizações de performance

**🎯 Critérios de Aceite**:
- [ ] CRUD completo de Pedido de Compra funcional
- [ ] Integração Pedido ↔ Contas a Pagar funcionando
- [ ] Painel Financeiro completo funcional
- [ ] Performance otimizada
- [ ] Testes de performance

**⚠️ Riscos**: Médio - dashboards podem ser complexos

---

### 📅 SPRINT 21 (Semanas 41-42)
**🎯 Objetivo**: Relatórios e melhorias

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 📊 Relatórios Adicionais | - | 1.0 mês | Dev 1 | 📊 Relatórios |
| 🔍 Buscas Avançadas | - | 1.0 mês | Dev 2 | 🔍 Busca |
| 📱 Responsividade Mobile | - | 1.0 mês | Dev 3 | 📱 Mobile |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- Relatórios adicionais (estoque, produção, financeiro)
- Sistema de buscas avançadas
- Melhorias de responsividade mobile

**🎯 Critérios de Aceite**:
- [ ] Relatórios funcionais
- [ ] Buscas avançadas funcionando
- [ ] Interface responsiva mobile
- [ ] Testes mobile

**⚠️ Riscos**: Baixo

---

### 📅 SPRINT 22 (Semanas 43-44)
**🎯 Objetivo**: Features complementares

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 🔄 Integrações Externas | - | 1.0 mês | Dev 1 | 🔄 Integração |
| 🔔 Notificações e Alertas | - | 1.0 mês | Dev 2 | 🔔 Notificação |
| 📧 Exportação de Dados | - | 1.0 mês | Dev 3 | 📧 Exportação |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- Integrações com sistemas externos (se necessário)
- Sistema de notificações e alertas
- Funcionalidades de exportação de dados

**🎯 Critérios de Aceite**:
- [ ] Integrações funcionando
- [ ] Sistema de notificações ativo
- [ ] Exportações funcionando
- [ ] Testes de integração

**⚠️ Riscos**: Médio - integrações podem ser complexas

---

### 📅 SPRINT 23 (Semanas 45-46)
**🎯 Objetivo**: Testes e validação

| Atividade | Esforço | Responsável | Status |
|-----------|---------|-------------|--------|
| 🧪 Testes End-to-End | 1.0 mês | Dev 1 | 🧪 Teste |
| 🐛 Correção de Bugs | 1.0 mês | Dev 2 | 🐛 Correção |
| 📝 Documentação Final | 1.0 mês | Dev 3 | 📝 Docs |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- Testes end-to-end completos
- Bugs corrigidos
- Documentação final completa

**🎯 Critérios de Aceite**:
- [ ] Todos os testes passando
- [ ] Bugs críticos corrigidos
- [ ] Documentação completa
- [ ] Pronto para produção

**⚠️ Riscos**: Baixo

---

### 📅 SPRINT 24 (Semanas 47-48)
**🎯 Objetivo**: Deploy e validação Fase 4

| Atividade | Esforço | Responsável | Status |
|-----------|---------|-------------|--------|
| 🚀 Deploy Produção | 1.0 mês | Dev 1 | 🚀 Deploy |
| 👥 Treinamento Usuários | 0.5 mês | Dev 2 | 👥 Treinamento |
| 📊 Monitoramento | 1.5 meses | Dev 3 | 📊 Monitoramento |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- Deploy em produção
- Treinamento de usuários realizado
- Monitoramento ativo

**🎯 Critérios de Aceite**:
- [ ] Deploy bem-sucedido
- [ ] Usuários treinados
- [ ] Monitoramento funcionando
- [ ] Feedback coletado

**⚠️ Riscos**: Médio - deploy em produção

**📊 Resumo Fase 4**:
- ✅ 9 features complementares completas
- ✅ Relatórios e dashboards funcionando
- ✅ Melhorias de UX aplicadas
- ✅ Pronto para Fase 5

---

## 🚀 FASE 5 - Funcionalidades Avançadas

**🎯 Objetivo**: Features especializadas para implementação futura  
**📊 RICE Score**: <15  
**⏱️ Esforço Total**: ~8.5 meses-pessoa  
**📅 Duração**: Sprints 25-30 (12 semanas)

---

### 📅 SPRINT 25 (Semanas 49-50)
**🎯 Objetivo**: Implementar Seguros

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 🛡️ Seguros (Parte 1) | 10.0 | 0.75 mês | Dev 1 | 🛡️ Seguros |
| 📦 Controle de Empréstimo (Parte 1) | 7.0 | 0.75 mês | Dev 2 | 📦 Empréstimo |
| 🔧 Manutenções Gerais | - | 1.5 meses | Dev 3 | 🔧 Manutenção |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- Estrutura inicial de Seguros (modelo de dados, cadastro básico)
- Estrutura inicial de Controle de Empréstimo (modelo de dados, fluxo básico)
- Manutenções gerais do sistema

**🎯 Critérios de Aceite**:
- [ ] Modelo de dados de Seguros criado
- [ ] Integração Seguros ↔ Máquinas, Parceiros funcionando
- [ ] Modelo de dados de Empréstimo criado
- [ ] Manutenções aplicadas

**⚠️ Riscos**: Baixo

---

### 📅 SPRINT 26 (Semanas 51-52)
**🎯 Objetivo**: Completar Seguros e Empréstimo

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 🛡️ Seguros (Parte 2) | 10.0 | 0.75 mês | Dev 1 | 🛡️ Seguros |
| 📦 Controle de Empréstimo (Parte 2) | 7.0 | 0.75 mês | Dev 2 | 📦 Empréstimo |
| 📊 Relatórios Avançados | - | 1.5 meses | Dev 3 | 📊 Relatórios |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- CRUD completo de Seguros (com vencimentos, renovação, validações)
- CRUD completo de Controle de Empréstimo (com devoluções, validações)
- Relatórios avançados adicionais

**🎯 Critérios de Aceite**:
- [ ] CRUD completo de Seguros funcional
- [ ] Integração Seguros ↔ Contas a Pagar funcionando
- [ ] CRUD completo de Empréstimo funcional
- [ ] Relatórios avançados funcionando
- [ ] Testes completos

**⚠️ Riscos**: Baixo

---

### 📅 SPRINT 27 (Semanas 53-54)
**🎯 Objetivo**: Implementar Contratos Financeiros

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 📄 Contratos Financeiros (Parte 1) | 6.3 | 1.25 meses | Dev 1 | 📄 Contratos |
| 🔄 Melhorias Sistema | - | 1.75 meses | Dev 2 | 🔄 Melhorias |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- Estrutura inicial de Contratos Financeiros (modelo de dados, tipos)
- Melhorias gerais do sistema

**🎯 Critérios de Aceite**:
- [ ] Modelo de dados de Contratos criado
- [ ] Integração Contratos ↔ Módulo Financeiro funcionando
- [ ] Melhorias aplicadas

**⚠️ Riscos**: Médio - complexidade alta

---

### 📅 SPRINT 28 (Semanas 55-56)
**🎯 Objetivo**: Completar Contratos Financeiros

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 📄 Contratos Financeiros (Parte 2) | 6.3 | 1.25 meses | Dev 1 | 📄 Contratos |
| 🧪 Testes Completos | - | 1.75 meses | Dev 2 | 🧪 Teste |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- CRUD completo de Contratos Financeiros (com fluxo completo, validações)
- Testes completos do sistema

**🎯 Critérios de Aceite**:
- [ ] CRUD completo de Contratos funcional
- [ ] Integrações validadas
- [ ] Testes completos passando
- [ ] Documentação atualizada

**⚠️ Riscos**: Médio

---

### 📅 SPRINT 29 (Semanas 57-58)
**🎯 Objetivo**: Implementar Contratos Futuros

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 📈 Contratos Futuros (Parte 1) | 3.25 | 1.5 meses | Dev 1 | 📈 Futuros |
| 🔧 Refinamentos | - | 1.5 meses | Dev 2 | 🔧 Refinamento |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- Estrutura inicial de Contratos Futuros (modelo de dados, fluxo básico)
- Refinamentos gerais do sistema

**🎯 Critérios de Aceite**:
- [ ] Modelo de dados de Contratos Futuros criado
- [ ] Integração com módulo financeiro funcionando
- [ ] Refinamentos aplicados

**⚠️ Riscos**: Alto - complexidade muito alta

---

### 📅 SPRINT 30 (Semanas 59-60)
**🎯 Objetivo**: Finalizar Contratos Futuros e Projeto

| Feature | RICE | Esforço | Responsável | Status |
|---------|------|---------|-------------|--------|
| 📈 Contratos Futuros (Parte 2) | 3.25 | 1.5 meses | Dev 1 | 📈 Futuros |
| 📝 Documentação Final | - | 1.5 meses | Dev 2 | 📝 Docs |

**📊 Esforço Total**: ~3.0 meses-pessoa  
**✅ Entregas**:
- CRUD completo de Contratos Futuros (com fluxo completo, validações complexas)
- Documentação final completa do projeto

**🎯 Critérios de Aceite**:
- [ ] CRUD completo de Contratos Futuros funcional
- [ ] Todas as integrações validadas
- [ ] Documentação completa
- [ ] Projeto finalizado

**⚠️ Riscos**: Médio

**📊 Resumo Fase 5**:
- ✅ 4 features avançadas completas
- ✅ Sistema completo funcional
- ✅ Documentação finalizada
- ✅ Projeto concluído

---

## 📊 Resumo Executivo

### 📈 Visão Geral do Projeto

| Métrica | Valor |
|---------|-------|
| **Total de Features** | 33 |
| **Total de Sprints** | 30 |
| **Duração Total** | ~15 meses (60 semanas) |
| **Esforço Total** | ~61.5 meses-pessoa |
| **Equipe Sugerida** | 3-5 desenvolvedores |

### 📅 Distribuição por Fase

| Fase | Sprints | Duração | Esforço | Features |
|------|---------|---------|---------|----------|
| 🏗️ **Fase 1** | 1-4 | 8 semanas | 7.5 meses | 6 |
| ⚙️ **Fase 2** | 5-10 | 12 semanas | 13.0 meses | 7 |
| 🔄 **Fase 3** | 11-18 | 16 semanas | 18.0 meses | 9 |
| 📊 **Fase 4** | 19-24 | 12 semanas | 14.5 meses | 9 |
| 🚀 **Fase 5** | 25-30 | 12 semanas | 8.5 meses | 4 |

### 🎯 Marcos Importantes

| Marco | Sprint | Semana | Descrição |
|-------|--------|--------|-----------|
| 🏁 **MVP** | 8 | 16 | Contas a Pagar/Receber completas |
| 🎉 **Fase 1 Completa** | 4 | 8 | Fundação do sistema |
| 🎉 **Fase 2 Completa** | 10 | 20 | Operações core |
| 🎉 **Fase 3 Completa** | 18 | 36 | Movimentações principais |
| 🎉 **Fase 4 Completa** | 24 | 48 | Complementos |
| 🏆 **Projeto Completo** | 30 | 60 | Todas as features |

### ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Atrasos em dependências | Média | Alto | Buffer de sprints, paralelização |
| Complexidade técnica | Média | Médio | POCs, spikes técnicos |
| Mudanças de escopo | Baixa | Alto | Controle de mudanças, priorização |
| Problemas de integração | Média | Alto | Testes contínuos, integração incremental |

### 💡 Recomendações

1. **🔍 Revisões Contínuas**: Revisar RICE scores a cada fase
2. **🧪 Testes Incrementais**: Testar cada feature ao final do sprint
3. **📊 Métricas**: Acompanhar velocidade da equipe e ajustar estimativas
4. **🔄 Flexibilidade**: Manter buffer para ajustes e melhorias
5. **👥 Comunicação**: Daily standups e comunicação constante

---

---

## 📦 Templates de Scaffolding

Para facilitar a implementação das features, foram criados templates genéricos de scaffolding que podem ser usados para gerar automaticamente a estrutura de código.

### 📁 Localização dos Templates

Os templates estão disponíveis em: `docs/templates/scaffolding/`

### 📋 Templates Disponíveis

1. **Model** (`model.template.ts`): Template para Model Sequelize
2. **Repository Interface** (`repository-interface.template.ts`): Interface do Repository
3. **Repository** (`repository.template.ts`): Implementação do Repository
4. **DTOs**:
   - `dto-create.template.ts`: DTO de criação
   - `dto-update.template.ts`: DTO de atualização
   - `dto-response.template.ts`: DTO de resposta
   - `dto-index.template.ts`: Barrel export
5. **Application Service**:
   - `service-interface.template.ts`: Interface do Service
   - `service.template.ts`: Implementação do Service
6. **Controller**:
   - `controller-interface.template.ts`: Interface do Controller
   - `controller.template.ts`: Implementação do Controller
7. **Routes** (`routes.template.ts`): Rotas Express
8. **Migration** (`migration.template.ts`): Migration Sequelize
9. **Mapper** (`mapper.template.ts`): Mapper entre Entity e DTOs
10. **DI Registration** (`di-registration.template.md`): Registros no DI Container

### 🔄 Como Usar

1. **Preparar Especificação**: Criar JSON seguindo `docs/reqs/modelo-especificacao-tabela.md`
2. **Processar Templates**: Substituir variáveis nos templates usando ferramenta de geração
3. **Gerar Arquivos**: Criar arquivos no projeto seguindo a estrutura definida
4. **Implementar TODOs**: Seguir marcadores TODO para completar lógica de negócio

### 📝 Estruturas Detalhadas

Para estruturas de scaffolding detalhadas de cada feature, consulte:
- `docs/features/UI/UI-plano-fases-scaffolding.md`: Estruturas completas por feature

### ✅ Checklist de Scaffolding

Após gerar o scaffolding, verificar:

- [ ] Todos os arquivos foram criados
- [ ] Imports estão corretos
- [ ] Interfaces implementadas
- [ ] Decorators aplicados corretamente
- [ ] Registros DI adicionados
- [ ] Routes registradas
- [ ] Migration criada
- [ ] Mapper implementado
- [ ] TODOs marcados para implementação futura

---

**📅 Data do Plano**: Janeiro 2025  
**📋 Versão**: 1.0  
**👤 Preparado por**: Sistema de Planejamento de Sprints
