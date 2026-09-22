# 📋 Tarefas de Implementação - Controle Financeiro (RICE)

**Versão:** 1.0.0  
**Data:** 2026-01-17  
**Autor:** Product Owner  
**Status:** 📝 Planejamento

---

## 📊 Metodologia RICE

**RICE Score = (Reach × Impact × Confidence) / Effort**

### Definição dos Critérios

#### Reach (Alcance)
- **10**: Todos os usuários do sistema (100%)
- **8**: Usuários financeiros e gestores (80%)
- **5**: Usuários financeiros (50%)
- **3**: Usuários administrativos (30%)
- **1**: Usuários específicos (10%)

#### Impact (Impacto)
- **3**: Crítico - Bloqueador para operação
- **2**: Alto - Melhora significativa na operação
- **1**: Médio - Melhora na eficiência
- **0.5**: Baixo - Melhora incremental
- **0.25**: Mínimo - Melhora marginal

#### Confidence (Confiança)
- **100%**: Totalmente confiante - Especificação completa e clara
- **80%**: Muito confiante - Especificação bem definida
- **50%**: Moderadamente confiante - Algumas incertezas
- **25%**: Pouco confiante - Muitas incertezas

#### Effort (Esforço)
- Medido em **pessoa-mês** (1 pessoa trabalhando 1 mês = 1.0)
- Considera desenvolvimento, testes e documentação

---

## 🎯 Fase 1: Estrutura Base de Dados

### T-001: Criar Tabelas de Títulos a Pagar e Receber
**Descrição:** Implementar as tabelas principais C019_tituloPagar e C023_tituloReceber com todos os campos, índices e relacionamentos.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - Base do sistema)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.5 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 0.5 = **60.0**

**Entregáveis:**
- Migration para C019_tituloPagar
- Migration para C023_tituloReceber
- Índices e foreign keys configurados
- Validação de constraints

**Dependências:** Nenhuma

---

### T-002: Criar Tabelas de Parcelas
**Descrição:** Implementar as tabelas C020_parcelaTituloPagar e C024_parcelaTituloReceber para gerenciamento de parcelas.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - Funcionalidade essencial)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.5 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 0.5 = **60.0**

**Entregáveis:**
- Migration para C020_parcelaTituloPagar
- Migration para C024_parcelaTituloReceber
- Relacionamentos com títulos
- Validações de integridade

**Dependências:** T-001

---

### T-003: Criar Tabelas de Rateios por Plano de Contas
**Descrição:** Implementar as tabelas C021_rateioPlanoContaTituloPagar e C025_rateioPlanoContaTituloReceber.

**Critérios RICE:**
- **Reach:** 8 (Usuários financeiros e gestores)
- **Impact:** 2 (Alto - Controle gerencial essencial)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.4 (pessoa-mês)
- **RICE Score:** (8 × 2 × 1.0) / 0.4 = **40.0**

**Entregáveis:**
- Migration para C021_rateioPlanoContaTituloPagar
- Migration para C025_rateioPlanoContaTituloReceber
- Validação de soma de rateios
- Relacionamentos com planos de contas

**Dependências:** T-001

---

### T-004: Criar Tabelas de Rateios por Centro de Custo
**Descrição:** Implementar as tabelas C022_rateioCentroCustoTituloPagar e C026_rateioCentroCustoTituloReceber.

**Critérios RICE:**
- **Reach:** 8 (Usuários financeiros e gestores)
- **Impact:** 2 (Alto - Controle gerencial essencial)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.4 (pessoa-mês)
- **RICE Score:** (8 × 2 × 1.0) / 0.4 = **40.0**

**Entregáveis:**
- Migration para C022_rateioCentroCustoTituloPagar
- Migration para C026_rateioCentroCustoTituloReceber
- Validação de soma de rateios
- Relacionamentos com centros de custo

**Dependências:** T-001

---

### T-005: Criar Tabelas de Movimentos Financeiros
**Descrição:** Implementar as tabelas C027_movimentoFinanceiroTituloPagar e C028_movimentoFinanceiroTituloReceber para controle de planejado vs realizado.

**Critérios RICE:**
- **Reach:** 8 (Usuários financeiros e gestores)
- **Impact:** 2 (Alto - Controle gerencial essencial)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.5 (pessoa-mês)
- **RICE Score:** (8 × 2 × 1.0) / 0.5 = **32.0**

**Entregáveis:**
- Migration para C027_movimentoFinanceiroTituloPagar
- Migration para C028_movimentoFinanceiroTituloReceber
- Índices para consultas de relatórios
- Relacionamentos com parcelas, títulos, PC e CC

**Dependências:** T-001, T-002, T-003, T-004

---

## 🏗️ Fase 2: Models e Repositories

### T-006: Criar Models Sequelize para Títulos
**Descrição:** Implementar models Sequelize para C019_tituloPagar e C023_tituloReceber com relacionamentos.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - Base da aplicação)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.3 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 0.3 = **100.0**

**Entregáveis:**
- Model TituloPagar.ts
- Model TituloReceber.ts
- Relacionamentos configurados
- Validações de modelo

**Dependências:** T-001

---

### T-007: Criar Models Sequelize para Parcelas
**Descrição:** Implementar models Sequelize para parcelas com relacionamentos.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - Funcionalidade essencial)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.2 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 0.2 = **150.0**

**Entregáveis:**
- Model ParcelaTituloPagar.ts
- Model ParcelaTituloReceber.ts
- Relacionamentos com títulos

**Dependências:** T-002, T-006

---

### T-008: Criar Models Sequelize para Rateios
**Descrição:** Implementar models Sequelize para rateios por plano de contas e centro de custo.

**Critérios RICE:**
- **Reach:** 8 (Usuários financeiros e gestores)
- **Impact:** 2 (Alto - Controle gerencial)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.3 (pessoa-mês)
- **RICE Score:** (8 × 2 × 1.0) / 0.3 = **53.3**

**Entregáveis:**
- Model RateioPlanoContaTituloPagar.ts
- Model RateioPlanoContaTituloReceber.ts
- Model RateioCentroCustoTituloPagar.ts
- Model RateioCentroCustoTituloReceber.ts
- Relacionamentos configurados

**Dependências:** T-003, T-004, T-006

---

### T-009: Criar Models Sequelize para Movimentos Financeiros
**Descrição:** Implementar models Sequelize para movimentos financeiros.

**Critérios RICE:**
- **Reach:** 8 (Usuários financeiros e gestores)
- **Impact:** 2 (Alto - Controle gerencial)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.2 (pessoa-mês)
- **RICE Score:** (8 × 2 × 1.0) / 0.2 = **80.0**

**Entregáveis:**
- Model MovimentoFinanceiroTituloPagar.ts
- Model MovimentoFinanceiroTituloReceber.ts
- Relacionamentos configurados

**Dependências:** T-005, T-007, T-008

---

### T-010: Criar Repositories para Títulos
**Descrição:** Implementar repositories e interfaces para títulos a pagar e receber.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - Camada de acesso a dados)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.4 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 0.4 = **75.0**

**Entregáveis:**
- Interface ITituloPagarRepository
- Interface ITituloReceberRepository
- TituloPagarRepository
- TituloReceberRepository
- Métodos customizados (findBySafra, findByFazenda, etc.)
- Cache configurado

**Dependências:** T-006

---

### T-011: Criar Repositories para Parcelas
**Descrição:** Implementar repositories e interfaces para parcelas.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - Funcionalidade essencial)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.3 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 0.3 = **100.0**

**Entregáveis:**
- Interface IParcelaTituloPagarRepository
- Interface IParcelaTituloReceberRepository
- ParcelaTituloPagarRepository
- ParcelaTituloReceberRepository
- Métodos customizados (findByVencimento, findByStatus, etc.)

**Dependências:** T-007, T-010

---

### T-012: Criar Repositories para Rateios
**Descrição:** Implementar repositories e interfaces para rateios.

**Critérios RICE:**
- **Reach:** 8 (Usuários financeiros e gestores)
- **Impact:** 2 (Alto - Controle gerencial)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.3 (pessoa-mês)
- **RICE Score:** (8 × 2 × 1.0) / 0.3 = **53.3**

**Entregáveis:**
- Interfaces para repositories de rateios
- Implementações dos repositories
- Métodos de consulta por título

**Dependências:** T-008, T-010

---

### T-013: Criar Repositories para Movimentos Financeiros
**Descrição:** Implementar repositories e interfaces para movimentos financeiros com métodos de agregação.

**Critérios RICE:**
- **Reach:** 8 (Usuários financeiros e gestores)
- **Impact:** 2 (Alto - Relatórios essenciais)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.4 (pessoa-mês)
- **RICE Score:** (8 × 2 × 1.0) / 0.4 = **40.0**

**Entregáveis:**
- Interface IMovimentoFinanceiroRepository
- MovimentoFinanceiroTituloPagarRepository
- MovimentoFinanceiroTituloReceberRepository
- Métodos de agregação (sumByPlanoConta, sumByCentroCusto, etc.)
- Métodos para relatórios de planejado vs realizado

**Dependências:** T-009, T-010

---

## 📝 Fase 3: DTOs e Mappers

### T-014: Criar DTOs para Títulos a Pagar
**Descrição:** Implementar DTOs de criação, atualização e resposta para títulos a pagar.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - Validação de entrada)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.2 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 0.2 = **150.0**

**Entregáveis:**
- CreateTituloPagarDto
- UpdateTituloPagarDto
- TituloPagarResponseDto
- Validações com class-validator
- Validações customizadas (IsExists, IsUnique)

**Dependências:** T-006

---

### T-015: Criar DTOs para Títulos a Receber
**Descrição:** Implementar DTOs de criação, atualização e resposta para títulos a receber.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - Validação de entrada)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.2 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 0.2 = **150.0**

**Entregáveis:**
- CreateTituloReceberDto
- UpdateTituloReceberDto
- TituloReceberResponseDto
- Validações com class-validator

**Dependências:** T-006

---

### T-016: Criar DTOs para Parcelas
**Descrição:** Implementar DTOs para parcelas de títulos.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 2 (Alto - Validação importante)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.2 (pessoa-mês)
- **RICE Score:** (10 × 2 × 1.0) / 0.2 = **100.0**

**Entregáveis:**
- CreateParcelaDto
- UpdateParcelaDto
- ParcelaResponseDto
- BaixaParcelaDto (para baixa de parcelas)

**Dependências:** T-007

---

### T-017: Criar DTOs para Rateios
**Descrição:** Implementar DTOs para rateios por plano de contas e centro de custo.

**Critérios RICE:**
- **Reach:** 8 (Usuários financeiros e gestores)
- **Impact:** 2 (Alto - Validação importante)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.2 (pessoa-mês)
- **RICE Score:** (8 × 2 × 1.0) / 0.2 = **80.0**

**Entregáveis:**
- CreateRateioPlanoContaDto
- CreateRateioCentroCustoDto
- RateioResponseDto
- Validações de soma de rateios

**Dependências:** T-008

---

### T-018: Criar DTOs para Movimentos Financeiros
**Descrição:** Implementar DTOs para movimentos financeiros e relatórios.

**Critérios RICE:**
- **Reach:** 8 (Usuários financeiros e gestores)
- **Impact:** 2 (Alto - Relatórios)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.2 (pessoa-mês)
- **RICE Score:** (8 × 2 × 1.0) / 0.2 = **80.0**

**Entregáveis:**
- MovimentoFinanceiroResponseDto
- PlanejadoRealizadoDto
- FiltrosPlanejadoRealizadoDto

**Dependências:** T-009

---

### T-019: Criar Mappers para Títulos
**Descrição:** Implementar mappers para conversão entre DTOs e entidades de títulos.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 2 (Alto - Transformação de dados)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.2 (pessoa-mês)
- **RICE Score:** (10 × 2 × 1.0) / 0.2 = **100.0**

**Entregáveis:**
- TituloPagarMapper
- TituloReceberMapper
- Métodos toEntity, toUpdateEntity, toDto

**Dependências:** T-014, T-015

---

### T-020: Criar Mappers para Parcelas e Rateios
**Descrição:** Implementar mappers para parcelas e rateios.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 2 (Alto - Transformação de dados)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.2 (pessoa-mês)
- **RICE Score:** (10 × 2 × 1.0) / 0.2 = **100.0**

**Entregáveis:**
- ParcelaMapper
- RateioMapper
- Métodos de conversão

**Dependências:** T-016, T-017

---

## ⚙️ Fase 4: Application Services

### T-021: Criar Application Service para Títulos a Pagar
**Descrição:** Implementar lógica de negócio para títulos a pagar com todas as validações.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - Lógica de negócio)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.8 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 0.8 = **37.5**

**Entregáveis:**
- Interface ITituloPagarApplicationService
- TituloPagarApplicationService
- Validações de negócio (RN-001 a RN-018)
- Validações cross-tenant
- Cálculos automáticos (valor total, quantidade de parcelas)
- Conversão de moeda

**Dependências:** T-010, T-014, T-019

---

### T-022: Criar Application Service para Títulos a Receber
**Descrição:** Implementar lógica de negócio para títulos a receber.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - Lógica de negócio)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.8 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 0.8 = **37.5**

**Entregáveis:**
- Interface ITituloReceberApplicationService
- TituloReceberApplicationService
- Validações de negócio
- Validações cross-tenant
- Cálculos automáticos

**Dependências:** T-010, T-015, T-019

---

### T-023: Criar Application Service para Baixa de Parcelas
**Descrição:** Implementar lógica de baixa de parcelas com criação automática de movimentos financeiros.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - Funcionalidade essencial)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 1.0 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 1.0 = **30.0**

**Entregáveis:**
- Interface IParcelaApplicationService
- ParcelaApplicationService
- Lógica de baixa (RN-011 a RN-013)
- Criação automática de movimentos (RN-019 a RN-022)
- Cálculo proporcional de rateios
- Atualização automática de status do título
- Validações de baixa

**Dependências:** T-011, T-013, T-016, T-020

---

### T-024: Criar Application Service para Relatórios (Planejado vs Realizado)
**Descrição:** Implementar lógica de cálculo e consulta de planejado vs realizado.

**Critérios RICE:**
- **Reach:** 8 (Usuários financeiros e gestores)
- **Impact:** 2 (Alto - Controle gerencial essencial)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.6 (pessoa-mês)
- **RICE Score:** (8 × 2 × 1.0) / 0.6 = **26.7**

**Entregáveis:**
- Interface IRelatorioFinanceiroApplicationService
- RelatorioFinanceiroApplicationService
- Método calcularPlanejado
- Método calcularRealizado
- Método compararPlanejadoRealizado
- Agregações por Plano de Contas e Centro de Custo
- Filtros por período, safra, fazenda

**Dependências:** T-010, T-012, T-013, T-018

---

## 🎮 Fase 5: Controllers e Routes

### T-025: Criar Controllers para Títulos a Pagar
**Descrição:** Implementar controllers HTTP para títulos a pagar.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - Interface HTTP)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.3 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 0.3 = **100.0**

**Entregáveis:**
- Interface ITituloPagarController
- TituloPagarController
- Métodos CRUD
- Tratamento de erros

**Dependências:** T-021

---

### T-026: Criar Controllers para Títulos a Receber
**Descrição:** Implementar controllers HTTP para títulos a receber.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - Interface HTTP)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.3 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 0.3 = **100.0**

**Entregáveis:**
- Interface ITituloReceberController
- TituloReceberController
- Métodos CRUD

**Dependências:** T-022

---

### T-027: Criar Controller para Baixa de Parcelas
**Descrição:** Implementar controller para baixa de parcelas.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - Funcionalidade essencial)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.2 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 0.2 = **150.0**

**Entregáveis:**
- Interface IParcelaController
- ParcelaController
- Método baixarParcela
- Método consultarMovimentos

**Dependências:** T-023

---

### T-028: Criar Controller para Relatórios
**Descrição:** Implementar controller para relatórios de planejado vs realizado.

**Critérios RICE:**
- **Reach:** 8 (Usuários financeiros e gestores)
- **Impact:** 2 (Alto - Controle gerencial)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.2 (pessoa-mês)
- **RICE Score:** (8 × 2 × 1.0) / 0.2 = **80.0**

**Entregáveis:**
- Interface IRelatorioFinanceiroController
- RelatorioFinanceiroController
- Método planejadoRealizado
- Método exportarRelatorio

**Dependências:** T-024

---

### T-029: Criar Routes para Títulos a Pagar
**Descrição:** Implementar rotas HTTP com Swagger para títulos a pagar.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - API pública)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.3 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 0.3 = **100.0**

**Entregáveis:**
- tituloPagar.routes.ts
- Endpoints CRUD documentados
- Middleware de validação
- Middleware de autorização
- Swagger documentation

**Dependências:** T-025

---

### T-030: Criar Routes para Títulos a Receber
**Descrição:** Implementar rotas HTTP com Swagger para títulos a receber.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - API pública)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.3 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 0.3 = **100.0**

**Entregáveis:**
- tituloReceber.routes.ts
- Endpoints CRUD documentados
- Swagger documentation

**Dependências:** T-026

---

### T-031: Criar Routes para Baixa de Parcelas
**Descrição:** Implementar rotas HTTP para baixa de parcelas.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - Funcionalidade essencial)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.2 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 0.2 = **150.0**

**Entregáveis:**
- parcela.routes.ts
- Endpoint POST /parcelas/:id/baixar
- Endpoint GET /parcelas/:id/movimentos
- Swagger documentation

**Dependências:** T-027

---

### T-032: Criar Routes para Relatórios
**Descrição:** Implementar rotas HTTP para relatórios financeiros.

**Critérios RICE:**
- **Reach:** 8 (Usuários financeiros e gestores)
- **Impact:** 2 (Alto - Controle gerencial)
- **Confidence:** 100% (Especificação completa)
- **Effort:** 0.2 (pessoa-mês)
- **RICE Score:** (8 × 2 × 1.0) / 0.2 = **80.0**

**Entregáveis:**
- relatorioFinanceiro.routes.ts
- Endpoint GET /relatorios/planejado-realizado
- Endpoint GET /relatorios/planejado-realizado/exportar
- Swagger documentation

**Dependências:** T-028

---

## 🔧 Fase 6: Configuração e Integração

### T-033: Registrar no DI Container
**Descrição:** Registrar todos os repositories, services, mappers e controllers no DI container.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 3 (Crítico - Sistema não funciona sem)
- **Confidence:** 100% (Processo padrão)
- **Effort:** 0.2 (pessoa-mês)
- **RICE Score:** (10 × 3 × 1.0) / 0.2 = **150.0**

**Entregáveis:**
- Atualização de types.ts
- Atualização de registerRepositories.ts
- Atualização de registerServices.ts
- Atualização de registerControllers.ts

**Dependências:** T-010 a T-032

---

### T-034: Configurar Swagger
**Descrição:** Adicionar schemas e documentação Swagger para todas as entidades financeiras.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários)
- **Impact:** 1 (Médio - Documentação)
- **Confidence:** 100% (Processo padrão)
- **Effort:** 0.3 (pessoa-mês)
- **RICE Score:** (10 × 1 × 1.0) / 0.3 = **33.3**

**Entregáveis:**
- Schemas para todos os DTOs
- Tags para organização
- Exemplos de requisições/respostas

**Dependências:** T-014 a T-018, T-029 a T-032

---

### T-035: Integrar com Sistema de Moedas
**Descrição:** Integrar conversão automática de moedas usando C006_moeda e C007_moedaCotacao.

**Critérios RICE:**
- **Reach:** 5 (Usuários que trabalham com moedas estrangeiras)
- **Impact:** 2 (Alto - Funcionalidade importante)
- **Confidence:** 80% (Depende de estrutura de moedas existente)
- **Effort:** 0.4 (pessoa-mês)
- **RICE Score:** (5 × 2 × 0.8) / 0.4 = **20.0**

**Entregáveis:**
- Serviço de conversão de moeda
- Integração com MoedaRepository
- Integração com MoedaCotacaoRepository
- Cálculo automático na criação de títulos
- Cálculo automático na baixa de parcelas

**Dependências:** T-021, T-022, T-023

---

## 🧪 Fase 7: Testes

### T-036: Testes Unitários - Repositories
**Descrição:** Criar testes unitários para todos os repositories.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários - qualidade)
- **Impact:** 2 (Alto - Garantia de qualidade)
- **Confidence:** 100% (Processo padrão)
- **Effort:** 0.5 (pessoa-mês)
- **RICE Score:** (10 × 2 × 1.0) / 0.5 = **40.0**

**Entregáveis:**
- Testes para TituloPagarRepository
- Testes para TituloReceberRepository
- Testes para ParcelaRepository
- Testes para RateioRepository
- Testes para MovimentoFinanceiroRepository
- Cobertura mínima: 80%

**Dependências:** T-010 a T-013

---

### T-037: Testes Unitários - Application Services
**Descrição:** Criar testes unitários para todos os application services.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários - qualidade)
- **Impact:** 2 (Alto - Garantia de qualidade)
- **Confidence:** 100% (Processo padrão)
- **Effort:** 0.8 (pessoa-mês)
- **RICE Score:** (10 × 2 × 1.0) / 0.8 = **25.0**

**Entregáveis:**
- Testes para TituloPagarApplicationService
- Testes para TituloReceberApplicationService
- Testes para ParcelaApplicationService
- Testes para RelatorioFinanceiroApplicationService
- Testes de validações de negócio
- Testes de cálculos
- Cobertura mínima: 80%

**Dependências:** T-021 a T-024

---

### T-038: Testes de Integração - Fluxos Completos
**Descrição:** Criar testes de integração para fluxos completos de criação, baixa e relatórios.

**Critérios RICE:**
- **Reach:** 10 (Todos os usuários - qualidade)
- **Impact:** 2 (Alto - Garantia de qualidade)
- **Confidence:** 100% (Processo padrão)
- **Effort:** 0.6 (pessoa-mês)
- **RICE Score:** (10 × 2 × 1.0) / 0.6 = **33.3**

**Entregáveis:**
- Teste: Criar título completo com parcelas e rateios
- Teste: Baixar parcela e verificar movimentos criados
- Teste: Calcular planejado vs realizado
- Teste: Validações cross-tenant
- Teste: Conversão de moeda

**Dependências:** T-021 a T-024, T-035

---

## 📊 Resumo por Fase

### Fase 1: Estrutura Base de Dados
- **Tarefas:** 5
- **Esforço Total:** 2.3 pessoa-mês
- **RICE Médio:** 46.4
- **Prioridade:** 🔴 Crítica

### Fase 2: Models e Repositories
- **Tarefas:** 8
- **Esforço Total:** 2.6 pessoa-mês
- **RICE Médio:** 75.0
- **Prioridade:** 🔴 Crítica

### Fase 3: DTOs e Mappers
- **Tarefas:** 7
- **Esforço Total:** 1.4 pessoa-mês
- **RICE Médio:** 105.7
- **Prioridade:** 🔴 Crítica

### Fase 4: Application Services
- **Tarefas:** 4
- **Esforço Total:** 3.2 pessoa-mês
- **RICE Médio:** 32.9
- **Prioridade:** 🔴 Crítica

### Fase 5: Controllers e Routes
- **Tarefas:** 8
- **Esforço Total:** 1.8 pessoa-mês
- **RICE Médio:** 98.8
- **Prioridade:** 🔴 Crítica

### Fase 6: Configuração e Integração
- **Tarefas:** 3
- **Esforço Total:** 0.9 pessoa-mês
- **RICE Médio:** 67.8
- **Prioridade:** 🟡 Alta

### Fase 7: Testes
- **Tarefas:** 3
- **Esforço Total:** 1.9 pessoa-mês
- **RICE Médio:** 32.8
- **Prioridade:** 🟡 Alta

---

## 📈 Resumo Geral

### Total de Tarefas: 38
### Esforço Total: 14.1 pessoa-mês
### RICE Médio Geral: 67.1

### Distribuição por Prioridade

#### 🔴 Crítica (Fases 1-5)
- **Tarefas:** 32
- **Esforço:** 12.3 pessoa-mês
- **RICE Médio:** 72.3

#### 🟡 Alta (Fases 6-7)
- **Tarefas:** 6
- **Esforço:** 1.8 pessoa-mês
- **RICE Médio:** 50.3

---

## 🎯 Recomendações de Implementação

### Sprint 1 (2 semanas)
**Foco:** Estrutura base
- T-001 a T-005 (Tabelas)
- T-006 a T-009 (Models)
- **Esforço:** 2.0 pessoa-mês

### Sprint 2 (2 semanas)
**Foco:** Repositories e DTOs
- T-010 a T-013 (Repositories)
- T-014 a T-020 (DTOs e Mappers)
- **Esforço:** 2.0 pessoa-mês

### Sprint 3 (3 semanas)
**Foco:** Application Services
- T-021 a T-024 (Application Services)
- **Esforço:** 3.2 pessoa-mês

### Sprint 4 (2 semanas)
**Foco:** Controllers e Routes
- T-025 a T-032 (Controllers e Routes)
- **Esforço:** 1.8 pessoa-mês

### Sprint 5 (1 semana)
**Foco:** Configuração
- T-033 a T-035 (DI, Swagger, Integração)
- **Esforço:** 0.9 pessoa-mês

### Sprint 6 (2 semanas)
**Foco:** Testes
- T-036 a T-038 (Testes)
- **Esforço:** 1.9 pessoa-mês

---

## ⚠️ Riscos e Dependências

### Riscos Identificados
1. **Dependência de Moedas:** T-035 depende de estrutura de moedas existente
2. **Complexidade de Cálculos:** T-023 e T-024 têm alta complexidade
3. **Performance de Relatórios:** T-024 pode precisar de otimizações

### Dependências Externas
- Sistema de Moedas (C006_moeda, C007_moedaCotacao)
- Sistema de Plano de Contas Gerencial (C013_planoContaGerencial)
- Sistema de Centro de Custo (C016_centroCusto)
- Sistema de Safras (C017_safra)
- Sistema de Fazendas (C018_fazenda)
- Sistema de Pessoas (C001_PESSOA)

---

## 📝 Notas de Implementação

### Ordem Recomendada
1. Implementar em ordem sequencial das fases
2. Não pular fases (dependências críticas)
3. Testar cada fase antes de avançar

### Pontos de Atenção
- **Transações:** Todas as operações de criação devem ser transacionais
- **Cache:** Configurar cache adequado para consultas frequentes
- **Validações:** Implementar todas as regras de negócio documentadas
- **Performance:** Otimizar consultas de relatórios com índices adequados

---

**Documento criado em:** 2026-01-17  
**Última atualização:** 2026-01-17  
**Versão:** 1.0.0
