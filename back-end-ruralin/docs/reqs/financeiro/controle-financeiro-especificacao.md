# 📋 Especificação: Controle Financeiro - Contas a Pagar e Receber

**Versão:** 1.0.0  
**Data:** 2026-01-17  
**Autor:** Product Owner  
**Status:** 📝 Em Planejamento

---

## 📌 1. Visão Geral

### 1.1. Objetivo
Sistema completo de controle financeiro para gerenciamento de contas a pagar e receber, incluindo:
- Lançamento de títulos com parcelas
- Rateio por planos de contas gerenciais
- Rateio por centros de custo
- Vinculação obrigatória a safras
- Suporte a múltiplas moedas com conversão automática
- Baixa de títulos

### 1.2. Escopo
- **Incluído:**
  - Contas a Pagar (Títulos a Pagar)
  - Contas a Receber (Títulos a Receber)
  - Parcelas de títulos
  - Rateio por Plano de Contas Gerencial
  - Rateio por Centro de Custo
  - Baixa de títulos
  - Conversão de moedas

- **Excluído (Futuro):**
  - Movimentação de caixa
  - Transferências entre contas
  - Conciliação bancária
  - Relatórios financeiros avançados

---

## 🏗️ 2. Arquitetura de Dados

### 2.1. Entidades Principais

#### 2.1.1. Título a Pagar (C019_tituloPagar)
**Descrição:** Representa um título/documento a ser pago pelo sistema.

**Campos Principais:**
- `id` (INTEGER, PK, auto-increment)
- `tenantId` (INTEGER, FK → tenants)
- `idFornecedor` (INTEGER, FK → C001_PESSOA, obrigatório, pessoa marcada como fornecedor)
- `idPortador` (INTEGER, FK → C001_PESSOA, obrigatório, pessoa marcada como portador)
- `idProdutor` (INTEGER, FK → C001_PESSOA, obrigatório, pessoa marcada como produtor)
- `idFazenda` (INTEGER, FK → C018_fazenda, obrigatório)
- `idSafra` (INTEGER, FK → C017_safra, obrigatório)
- `idMoeda` (INTEGER, FK → C006_moeda, obrigatório)
- `dataLancamento` (DATEONLY, obrigatório)
- `numeroTitulo` (STRING(100), obrigatório, único por tenant)
- `valorTitulo` (DECIMAL(15,2), obrigatório, soma de todas as parcelas)
- `valorTituloMoedaOriginal` (DECIMAL(15,2), valor na moeda original)
- `valorTituloMoedaPadrao` (DECIMAL(15,2), valor convertido para BRL)
- `quantidadeParcelas` (INTEGER, obrigatório, calculado automaticamente)
- `observacao` (TEXT, opcional)
- `impostoRenda` (BOOLEAN, default: false)
- `status` (ENUM: 'ABERTO', 'PARCIAL', 'BAIXADO', 'CANCELADO', default: 'ABERTO')
- `usercreation` (INTEGER, FK → usuarios)
- `datecreation` (DATE)

**Índices:**
- `tenantId`
- `idFornecedor`
- `idPortador`
- `idProdutor`
- `idFazenda`
- `idSafra`
- `idMoeda`
- `dataLancamento`
- `numeroTitulo` (único)
- `status`

#### 2.1.2. Parcela Título a Pagar (C020_parcelaTituloPagar)
**Descrição:** Representa uma parcela individual de um título a pagar.

**Campos Principais:**
- `id` (INTEGER, PK, auto-increment)
- `tenantId` (INTEGER, FK → tenants)
- `idTituloPagar` (INTEGER, FK → C019_tituloPagar, obrigatório)
- `numeroParcela` (INTEGER, obrigatório, sequencial: 1, 2, 3...)
- `dataVencimento` (DATEONLY, obrigatório)
- `valorParcela` (DECIMAL(15,2), obrigatório)
- `valorParcelaMoedaOriginal` (DECIMAL(15,2))
- `valorParcelaMoedaPadrao` (DECIMAL(15,2))
- `dataBaixa` (DATEONLY, nullable)
- `valorBaixa` (DECIMAL(15,2), nullable)
- `status` (ENUM: 'ABERTA', 'BAIXADA', 'CANCELADA', default: 'ABERTA')
- `observacao` (TEXT, opcional)
- `usercreation` (INTEGER, FK → usuarios)
- `datecreation` (DATE)

**Índices:**
- `tenantId`
- `idTituloPagar`
- `dataVencimento`
- `status`

#### 2.1.3. Rateio Plano de Contas - Título a Pagar (C021_rateioPlanoContaTituloPagar)
**Descrição:** Rateio do valor do título por planos de contas gerenciais.

**Campos Principais:**
- `id` (INTEGER, PK, auto-increment)
- `tenantId` (INTEGER, FK → tenants)
- `idTituloPagar` (INTEGER, FK → C019_tituloPagar, obrigatório)
- `idPlanoContaGerencial` (INTEGER, FK → C013_planoContaGerencial, obrigatório)
- `valorRateio` (DECIMAL(15,2), obrigatório)
- `percentualRateio` (DECIMAL(5,2), obrigatório, calculado automaticamente)
- `observacao` (TEXT, opcional)
- `usercreation` (INTEGER, FK → usuarios)
- `datecreation` (DATE)

**Índices:**
- `tenantId`
- `idTituloPagar`
- `idPlanoContaGerencial`

**Regra:** Soma dos `valorRateio` não pode ultrapassar `valorTitulo` do título.

#### 2.1.4. Rateio Centro de Custo - Título a Pagar (C022_rateioCentroCustoTituloPagar)
**Descrição:** Rateio do valor do título por centros de custo.

**Campos Principais:**
- `id` (INTEGER, PK, auto-increment)
- `tenantId` (INTEGER, FK → tenants)
- `idTituloPagar` (INTEGER, FK → C019_tituloPagar, obrigatório)
- `idCentroCusto` (INTEGER, FK → C016_centroCusto, obrigatório)
- `valorRateio` (DECIMAL(15,2), obrigatório)
- `percentualRateio` (DECIMAL(5,2), obrigatório, calculado automaticamente)
- `observacao` (TEXT, opcional)
- `usercreation` (INTEGER, FK → usuarios)
- `datecreation` (DATE)

**Índices:**
- `tenantId`
- `idTituloPagar`
- `idCentroCusto`

**Regra:** Soma dos `valorRateio` não pode ultrapassar `valorTitulo` do título.

#### 2.1.5. Título a Receber (C023_tituloReceber)
**Descrição:** Representa um título/documento a ser recebido pelo sistema.

**Campos Principais:**
- `id` (INTEGER, PK, auto-increment)
- `tenantId` (INTEGER, FK → tenants)
- `idCliente` (INTEGER, FK → C001_PESSOA, obrigatório, pessoa marcada como cliente)
- `idPortador` (INTEGER, FK → C001_PESSOA, obrigatório, pessoa marcada como portador)
- `idProdutor` (INTEGER, FK → C001_PESSOA, obrigatório, pessoa marcada como produtor)
- `idFazenda` (INTEGER, FK → C018_fazenda, obrigatório)
- `idSafra` (INTEGER, FK → C017_safra, obrigatório)
- `idMoeda` (INTEGER, FK → C006_moeda, obrigatório)
- `dataLancamento` (DATEONLY, obrigatório)
- `numeroTitulo` (STRING(100), obrigatório, único por tenant)
- `valorTitulo` (DECIMAL(15,2), obrigatório, soma de todas as parcelas)
- `valorTituloMoedaOriginal` (DECIMAL(15,2), valor na moeda original)
- `valorTituloMoedaPadrao` (DECIMAL(15,2), valor convertido para BRL)
- `quantidadeParcelas` (INTEGER, obrigatório, calculado automaticamente)
- `observacao` (TEXT, opcional)
- `impostoRenda` (BOOLEAN, default: false)
- `status` (ENUM: 'ABERTO', 'PARCIAL', 'BAIXADO', 'CANCELADO', default: 'ABERTO')
- `usercreation` (INTEGER, FK → usuarios)
- `datecreation` (DATE)

**Índices:**
- `tenantId`
- `idCliente`
- `idPortador`
- `idProdutor`
- `idFazenda`
- `idSafra`
- `idMoeda`
- `dataLancamento`
- `numeroTitulo` (único)
- `status`

#### 2.1.6. Parcela Título a Receber (C024_parcelaTituloReceber)
**Descrição:** Representa uma parcela individual de um título a receber.

**Campos Principais:**
- `id` (INTEGER, PK, auto-increment)
- `tenantId` (INTEGER, FK → tenants)
- `idTituloReceber` (INTEGER, FK → C023_tituloReceber, obrigatório)
- `numeroParcela` (INTEGER, obrigatório, sequencial: 1, 2, 3...)
- `dataVencimento` (DATEONLY, obrigatório)
- `valorParcela` (DECIMAL(15,2), obrigatório)
- `valorParcelaMoedaOriginal` (DECIMAL(15,2))
- `valorParcelaMoedaPadrao` (DECIMAL(15,2))
- `dataBaixa` (DATEONLY, nullable)
- `valorBaixa` (DECIMAL(15,2), nullable)
- `status` (ENUM: 'ABERTA', 'BAIXADA', 'CANCELADA', default: 'ABERTA')
- `observacao` (TEXT, opcional)
- `usercreation` (INTEGER, FK → usuarios)
- `datecreation` (DATE)

**Índices:**
- `tenantId`
- `idTituloReceber`
- `dataVencimento`
- `status`

#### 2.1.7. Rateio Plano de Contas - Título a Receber (C025_rateioPlanoContaTituloReceber)
**Descrição:** Rateio do valor do título por planos de contas gerenciais.

**Campos Principais:**
- `id` (INTEGER, PK, auto-increment)
- `tenantId` (INTEGER, FK → tenants)
- `idTituloReceber` (INTEGER, FK → C023_tituloReceber, obrigatório)
- `idPlanoContaGerencial` (INTEGER, FK → C013_planoContaGerencial, obrigatório)
- `valorRateio` (DECIMAL(15,2), obrigatório)
- `percentualRateio` (DECIMAL(5,2), obrigatório, calculado automaticamente)
- `observacao` (TEXT, opcional)
- `usercreation` (INTEGER, FK → usuarios)
- `datecreation` (DATE)

**Índices:**
- `tenantId`
- `idTituloReceber`
- `idPlanoContaGerencial`

**Regra:** Soma dos `valorRateio` não pode ultrapassar `valorTitulo` do título.

#### 2.1.8. Rateio Centro de Custo - Título a Receber (C026_rateioCentroCustoTituloReceber)
**Descrição:** Rateio do valor do título por centros de custo.

**Campos Principais:**
- `id` (INTEGER, PK, auto-increment)
- `tenantId` (INTEGER, FK → tenants)
- `idTituloReceber` (INTEGER, FK → C023_tituloReceber, obrigatório)
- `idCentroCusto` (INTEGER, FK → C016_centroCusto, obrigatório)
- `valorRateio` (DECIMAL(15,2), obrigatório)
- `percentualRateio` (DECIMAL(5,2), obrigatório, calculado automaticamente)
- `observacao` (TEXT, opcional)
- `usercreation` (INTEGER, FK → usuarios)
- `datecreation` (DATE)

**Índices:**
- `tenantId`
- `idTituloReceber`
- `idCentroCusto`

**Regra:** Soma dos `valorRateio` não pode ultrapassar `valorTitulo` do título.

#### 2.1.9. Movimento Financeiro - Título a Pagar (C027_movimentoFinanceiroTituloPagar)
**Descrição:** Registra movimentos financeiros realizados (baixas) de títulos a pagar, com rateios proporcionais por plano de contas e centro de custo.

**Campos Principais:**
- `id` (INTEGER, PK, auto-increment)
- `tenantId` (INTEGER, FK → tenants)
- `idParcelaTituloPagar` (INTEGER, FK → C020_parcelaTituloPagar, obrigatório)
- `idTituloPagar` (INTEGER, FK → C019_tituloPagar, obrigatório, redundante para performance)
- `idPlanoContaGerencial` (INTEGER, FK → C013_planoContaGerencial, obrigatório)
- `idCentroCusto` (INTEGER, FK → C016_centroCusto, obrigatório)
- `dataMovimento` (DATEONLY, obrigatório, data da baixa)
- `valorMovimento` (DECIMAL(15,2), obrigatório, valor rateado proporcional)
- `valorMovimentoMoedaOriginal` (DECIMAL(15,2), valor na moeda original do título)
- `valorMovimentoMoedaPadrao` (DECIMAL(15,2), valor convertido para BRL)
- `percentualRateioPlanoConta` (DECIMAL(5,2), percentual do rateio original)
- `percentualRateioCentroCusto` (DECIMAL(5,2), percentual do rateio original)
- `observacao` (TEXT, opcional)
- `usercreation` (INTEGER, FK → usuarios)
- `datecreation` (DATE)

**Índices:**
- `tenantId`
- `idParcelaTituloPagar`
- `idTituloPagar`
- `idPlanoContaGerencial`
- `idCentroCusto`
- `dataMovimento`

**Regra:** Cada movimento representa uma baixa parcial ou total de parcela, rateada proporcionalmente pelos planos de contas e centros de custo do título.

#### 2.1.10. Movimento Financeiro - Título a Receber (C028_movimentoFinanceiroTituloReceber)
**Descrição:** Registra movimentos financeiros realizados (baixas) de títulos a receber, com rateios proporcionais por plano de contas e centro de custo.

**Campos Principais:**
- `id` (INTEGER, PK, auto-increment)
- `tenantId` (INTEGER, FK → tenants)
- `idParcelaTituloReceber` (INTEGER, FK → C024_parcelaTituloReceber, obrigatório)
- `idTituloReceber` (INTEGER, FK → C023_tituloReceber, obrigatório, redundante para performance)
- `idPlanoContaGerencial` (INTEGER, FK → C013_planoContaGerencial, obrigatório)
- `idCentroCusto` (INTEGER, FK → C016_centroCusto, obrigatório)
- `dataMovimento` (DATEONLY, obrigatório, data da baixa)
- `valorMovimento` (DECIMAL(15,2), obrigatório, valor rateado proporcional)
- `valorMovimentoMoedaOriginal` (DECIMAL(15,2), valor na moeda original do título)
- `valorMovimentoMoedaPadrao` (DECIMAL(15,2), valor convertido para BRL)
- `percentualRateioPlanoConta` (DECIMAL(5,2), percentual do rateio original)
- `percentualRateioCentroCusto` (DECIMAL(5,2), percentual do rateio original)
- `observacao` (TEXT, opcional)
- `usercreation` (INTEGER, FK → usuarios)
- `datecreation` (DATE)

**Índices:**
- `tenantId`
- `idParcelaTituloReceber`
- `idTituloReceber`
- `idPlanoContaGerencial`
- `idCentroCusto`
- `dataMovimento`

**Regra:** Cada movimento representa uma baixa parcial ou total de parcela, rateada proporcionalmente pelos planos de contas e centros de custo do título.

---

## 🔗 3. Relacionamentos

### 3.1. Título a Pagar
```
C019_tituloPagar
├── belongsTo C001_PESSOA (idFornecedor) → pessoa como fornecedor
├── belongsTo C001_PESSOA (idPortador) → pessoa como portador
├── belongsTo C001_PESSOA (idProdutor) → pessoa como produtor
├── belongsTo C018_fazenda (idFazenda)
├── belongsTo C017_safra (idSafra)
├── belongsTo C006_moeda (idMoeda)
├── hasMany C020_parcelaTituloPagar (parcelas)
├── hasMany C021_rateioPlanoContaTituloPagar (rateios plano de contas)
└── hasMany C022_rateioCentroCustoTituloPagar (rateios centro de custo)
```

### 3.2. Título a Receber
```
C023_tituloReceber
├── belongsTo C001_PESSOA (idCliente) → pessoa como cliente
├── belongsTo C001_PESSOA (idPortador) → pessoa como portador
├── belongsTo C001_PESSOA (idProdutor) → pessoa como produtor
├── belongsTo C018_fazenda (idFazenda)
├── belongsTo C017_safra (idSafra)
├── belongsTo C006_moeda (idMoeda)
├── hasMany C024_parcelaTituloReceber (parcelas)
├── hasMany C025_rateioPlanoContaTituloReceber (rateios plano de contas)
├── hasMany C026_rateioCentroCustoTituloReceber (rateios centro de custo)
└── hasMany C028_movimentoFinanceiroTituloReceber (movimentos realizados)
```

### 3.3. Movimentos Financeiros
```
C027_movimentoFinanceiroTituloPagar
├── belongsTo C020_parcelaTituloPagar (idParcelaTituloPagar)
├── belongsTo C019_tituloPagar (idTituloPagar)
├── belongsTo C013_planoContaGerencial (idPlanoContaGerencial)
└── belongsTo C016_centroCusto (idCentroCusto)

C028_movimentoFinanceiroTituloReceber
├── belongsTo C024_parcelaTituloReceber (idParcelaTituloReceber)
├── belongsTo C023_tituloReceber (idTituloReceber)
├── belongsTo C013_planoContaGerencial (idPlanoContaGerencial)
└── belongsTo C016_centroCusto (idCentroCusto)
```

**Observação:** Os movimentos financeiros são criados automaticamente quando uma parcela é baixada, calculando os rateios proporcionais baseados nos rateios originais do título.

---

## 📐 4. Regras de Negócio

### 4.1. Regras Gerais

#### RN-001: Vinculação Obrigatória a Safra
- **Descrição:** Todo título (a pagar ou receber) DEVE estar vinculado a uma safra.
- **Validação:** Campo `idSafra` é obrigatório e não pode ser nulo.
- **Impacto:** Não permite criar título sem safra.

#### RN-002: Vinculação Obrigatória a Plano de Contas
- **Descrição:** Todo título DEVE ter pelo menos um rateio por plano de contas gerencial.
- **Validação:** Ao criar título, deve existir pelo menos um registro em `C021_rateioPlanoContaTituloPagar` ou `C025_rateioPlanoContaTituloReceber`.
- **Impacto:** Não permite criar título sem rateio de plano de contas.

#### RN-003: Valor Total do Rateio de Plano de Contas
- **Descrição:** A soma dos valores de rateio por plano de contas não pode ultrapassar o valor total do título.
- **Validação:** `SUM(valorRateio) <= valorTitulo`
- **Impacto:** Rejeita criação/atualização se soma ultrapassar.

#### RN-004: Vinculação Obrigatória a Centro de Custo
- **Descrição:** Todo título DEVE ter pelo menos um rateio por centro de custo.
- **Validação:** Ao criar título, deve existir pelo menos um registro em `C022_rateioCentroCustoTituloPagar` ou `C026_rateioCentroCustoTituloReceber`.
- **Impacto:** Não permite criar título sem rateio de centro de custo.

#### RN-005: Valor Total do Rateio de Centro de Custo
- **Descrição:** A soma dos valores de rateio por centro de custo não pode ultrapassar o valor total do título.
- **Validação:** `SUM(valorRateio) <= valorTitulo`
- **Impacto:** Rejeita criação/atualização se soma ultrapassar.

#### RN-006: Parcelas Obrigatórias
- **Descrição:** Todo título DEVE ter pelo menos uma parcela.
- **Validação:** Ao criar título, deve existir pelo menos um registro em `C020_parcelaTituloPagar` ou `C024_parcelaTituloReceber`.
- **Impacto:** Não permite criar título sem parcelas.

#### RN-007: Valor Total das Parcelas
- **Descrição:** A soma dos valores das parcelas DEVE ser igual ao valor total do título.
- **Validação:** `SUM(valorParcela) = valorTitulo`
- **Impacto:** Rejeita criação/atualização se valores não coincidirem.

#### RN-008: Número de Título Único
- **Descrição:** O número do título deve ser único por tenant.
- **Validação:** `numeroTitulo` + `tenantId` deve ser único.
- **Impacto:** Rejeita criação se número já existir.

### 4.2. Regras de Conversão de Moeda

#### RN-009: Conversão Automática para Moeda Padrão
- **Descrição:** Se o título estiver em moeda diferente de BRL, deve ser convertido automaticamente para BRL usando a última cotação oficial.
- **Validação:** 
  - Buscar última cotação em `C007_moedaCotacao` para a moeda do título
  - Calcular: `valorTituloMoedaPadrao = valorTituloMoedaOriginal * cotacao`
  - Aplicar mesmo cálculo para cada parcela
- **Impacto:** Sempre armazena valor em BRL para relatórios e cálculos.

#### RN-010: Atualização de Cotação
- **Descrição:** Se a cotação da moeda for atualizada, os títulos abertos devem ter seus valores recalculados.
- **Validação:** Ao atualizar cotação, recalcular todos os títulos abertos naquela moeda.
- **Impacto:** Mantém valores sempre atualizados.

### 4.3. Regras de Baixa

#### RN-011: Baixa de Parcela
- **Descrição:** Uma parcela pode ser baixada parcial ou totalmente.
- **Validação:** 
  - `valorBaixa <= valorParcela`
  - Se `valorBaixa = valorParcela`, status = 'BAIXADA'
  - Se `valorBaixa < valorParcela`, status = 'PARCIAL' (se permitido)
- **Impacto:** Permite controle fino de pagamentos/recebimentos.

#### RN-012: Atualização de Status do Título
- **Descrição:** O status do título deve ser atualizado automaticamente baseado no status das parcelas.
- **Validação:**
  - Se todas parcelas baixadas: `status = 'BAIXADO'`
  - Se pelo menos uma parcela baixada: `status = 'PARCIAL'`
  - Se nenhuma parcela baixada: `status = 'ABERTO'`
- **Impacto:** Mantém status sempre sincronizado.

#### RN-013: Data de Baixa
- **Descrição:** A data de baixa não pode ser anterior à data de lançamento do título.
- **Validação:** `dataBaixa >= dataLancamento`
- **Impacto:** Evita inconsistências temporais.

### 4.4. Regras de Validação Cross-Tenant

#### RN-014: Validação de Pessoa (Fornecedor/Cliente/Portador/Produtor)
- **Descrição:** Todas as pessoas vinculadas ao título devem pertencer ao mesmo tenant.
- **Validação:** Verificar `pessoa.tenantId === titulo.tenantId`
- **Impacto:** Garante isolamento de dados.

#### RN-015: Validação de Fazenda
- **Descrição:** A fazenda vinculada ao título deve pertencer ao mesmo tenant.
- **Validação:** Verificar `fazenda.tenantId === titulo.tenantId`
- **Impacto:** Garante isolamento de dados.

#### RN-016: Validação de Safra
- **Descrição:** A safra vinculada ao título deve pertencer ao mesmo tenant.
- **Validação:** Verificar `safra.tenantId === titulo.tenantId`
- **Impacto:** Garante isolamento de dados.

#### RN-017: Validação de Plano de Contas
- **Descrição:** Os planos de contas usados no rateio devem pertencer ao mesmo tenant.
- **Validação:** Verificar `planoConta.tenantId === titulo.tenantId`
- **Impacto:** Garante isolamento de dados.

#### RN-018: Validação de Centro de Custo
- **Descrição:** Os centros de custo usados no rateio devem pertencer ao mesmo tenant.
- **Validação:** Verificar `centroCusto.tenantId === titulo.tenantId`
- **Impacto:** Garante isolamento de dados.

### 4.5. Regras de Movimentos Financeiros (Planejado vs Realizado)

#### RN-019: Criação Automática de Movimentos na Baixa
- **Descrição:** Quando uma parcela é baixada, devem ser criados movimentos financeiros para cada combinação de plano de contas e centro de custo, rateados proporcionalmente.
- **Validação:** 
  - Para cada rateio de plano de contas do título
  - Para cada rateio de centro de custo do título
  - Criar movimento com: `valorMovimento = (valorBaixa * percentualRateioPC * percentualRateioCC) / 10000`
- **Impacto:** Permite rastrear exatamente o que foi realizado por plano de contas e centro de custo.

#### RN-020: Cálculo Proporcional de Movimentos
- **Descrição:** O valor do movimento deve ser calculado proporcionalmente aos percentuais de rateio do título.
- **Fórmula:** 
  ```
  valorMovimento = valorBaixa × (percentualRateioPC / 100) × (percentualRateioCC / 100)
  ```
- **Exemplo:** 
  - Título: R$ 10.000,00
  - Rateio PC "1.1.0.0": 60% (R$ 6.000,00)
  - Rateio CC "CC001": 50% (R$ 5.000,00)
  - Baixa de parcela: R$ 2.000,00
  - Movimento (PC 1.1.0.0 + CC CC001): R$ 2.000 × 0,60 × 0,50 = R$ 600,00
- **Impacto:** Garante que os movimentos refletem corretamente os rateios planejados.

#### RN-021: Soma dos Movimentos = Valor Baixado
- **Descrição:** A soma de todos os movimentos de uma parcela baixada deve ser igual ao valor da baixa.
- **Validação:** `SUM(valorMovimento) = valorBaixa` para cada parcela baixada
- **Impacto:** Garante integridade dos dados de movimentação.

#### RN-022: Movimentos Apenas para Parcelas Baixadas
- **Descrição:** Movimentos financeiros só podem ser criados para parcelas com status 'BAIXADA' ou parcialmente baixadas.
- **Validação:** Verificar `parcela.status IN ('BAIXADA', 'PARCIAL')` antes de criar movimentos
- **Impacto:** Evita criar movimentos para parcelas ainda não baixadas.

---

## 🔄 5. Fluxos de Processo

### 5.1. Fluxo: Criação de Título a Pagar

```
1. Usuário preenche dados do título:
   - Fornecedor (obrigatório)
   - Portador (obrigatório)
   - Produtor (obrigatório)
   - Fazenda (obrigatório)
   - Safra (obrigatório)
   - Moeda (obrigatório)
   - Data de lançamento (obrigatório)
   - Número do título (obrigatório, único)
   - Observação (opcional)
   - Imposto de Renda (opcional)

2. Sistema valida:
   - Todos os campos obrigatórios preenchidos
   - Fornecedor é pessoa marcada como fornecedor
   - Portador é pessoa marcada como portador
   - Produtor é pessoa marcada como produtor
   - Todos pertencem ao mesmo tenant
   - Fazenda pertence ao mesmo tenant
   - Safra pertence ao mesmo tenant
   - Número do título é único no tenant

3. Usuário adiciona parcelas:
   - Para cada parcela:
     - Data de vencimento
     - Valor da parcela
   - Sistema calcula: valorTitulo = SUM(valorParcela)

4. Sistema converte valores (se moeda diferente de BRL):
   - Busca última cotação da moeda
   - Calcula valorTituloMoedaPadrao
   - Calcula valorParcelaMoedaPadrao para cada parcela

5. Usuário adiciona rateios por Plano de Contas:
   - Para cada rateio:
     - Plano de Contas Gerencial
     - Valor do rateio
   - Sistema valida: SUM(valorRateio) <= valorTitulo
   - Sistema calcula percentualRateio automaticamente

6. Usuário adiciona rateios por Centro de Custo:
   - Para cada rateio:
     - Centro de Custo
     - Valor do rateio
   - Sistema valida: SUM(valorRateio) <= valorTitulo
   - Sistema calcula percentualRateio automaticamente

7. Sistema valida regras finais:
   - Pelo menos um rateio de plano de contas
   - Pelo menos um rateio de centro de custo
   - Pelo menos uma parcela
   - Soma das parcelas = valorTitulo
   - Soma dos rateios plano de contas <= valorTitulo
   - Soma dos rateios centro de custo <= valorTitulo

8. Sistema cria:
   - Registro em C019_tituloPagar
   - Registros em C020_parcelaTituloPagar (uma para cada parcela)
   - Registros em C021_rateioPlanoContaTituloPagar (um para cada rateio)
   - Registros em C022_rateioCentroCustoTituloPagar (um para cada rateio)

9. Sistema atualiza:
   - quantidadeParcelas = COUNT(parcelas)
   - status = 'ABERTO'
```

### 5.2. Fluxo: Criação de Título a Receber

```
[Similar ao fluxo de Título a Pagar, substituindo:
 - Fornecedor → Cliente
 - C019_tituloPagar → C023_tituloReceber
 - C020_parcelaTituloPagar → C024_parcelaTituloReceber
 - C021_rateioPlanoContaTituloPagar → C025_rateioPlanoContaTituloReceber
 - C022_rateioCentroCustoTituloPagar → C026_rateioCentroCustoTituloReceber]
```

### 5.3. Fluxo: Baixa de Parcela

```
1. Usuário seleciona parcela para baixa

2. Sistema exibe:
   - Valor da parcela
   - Valor já baixado (se houver)
   - Valor pendente

3. Usuário informa:
   - Data de baixa (obrigatório)
   - Valor da baixa (obrigatório, <= valor pendente)
   - Observação (opcional)

4. Sistema valida:
   - dataBaixa >= dataLancamento do título
   - valorBaixa <= valorParcela - valorBaixaAnterior (se houver)
   - Parcela não está cancelada

5. Sistema atualiza:
   - dataBaixa = data informada
   - valorBaixa = valorBaixaAnterior + valorBaixaNovo
   - Se valorBaixa = valorParcela: status = 'BAIXADA'
   - Se valorBaixa < valorParcela: status = 'ABERTA' (ou 'PARCIAL' se permitido)

6. Sistema atualiza status do título:
   - Se todas parcelas baixadas: status = 'BAIXADO'
   - Se pelo menos uma baixada: status = 'PARCIAL'
   - Se nenhuma baixada: status = 'ABERTO'
```

### 5.4. Fluxo: Cancelamento de Título

```
1. Usuário solicita cancelamento do título

2. Sistema valida:
   - Título não está totalmente baixado
   - Usuário tem permissão para cancelar

3. Sistema atualiza:
   - status = 'CANCELADO' no título
   - status = 'CANCELADA' em todas as parcelas abertas
   - Mantém histórico de parcelas já baixadas
```

### 5.5. Fluxo: Baixa de Parcela com Criação de Movimentos

```
1. Usuário seleciona parcela para baixa

2. Sistema exibe:
   - Valor da parcela
   - Valor já baixado (se houver)
   - Valor pendente

3. Usuário informa:
   - Data de baixa (obrigatório)
   - Valor da baixa (obrigatório, <= valor pendente)
   - Observação (opcional)

4. Sistema valida:
   - dataBaixa >= dataLancamento do título
   - valorBaixa <= valorParcela - valorBaixaAnterior (se houver)
   - Parcela não está cancelada

5. Sistema atualiza parcela:
   - dataBaixa = data informada
   - valorBaixa = valorBaixaAnterior + valorBaixaNovo
   - Se valorBaixa = valorParcela: status = 'BAIXADA'
   - Se valorBaixa < valorParcela: status = 'ABERTA' (ou 'PARCIAL' se permitido)

6. Sistema busca rateios do título:
   - Rateios por Plano de Contas (C021 ou C025)
   - Rateios por Centro de Custo (C022 ou C026)

7. Para cada combinação de Plano de Contas × Centro de Custo:
   - Calcula percentual combinado: (percentualPC / 100) × (percentualCC / 100)
   - Calcula valorMovimento: valorBaixa × percentualCombinado
   - Cria registro em C027_movimentoFinanceiroTituloPagar ou C028_movimentoFinanceiroTituloReceber:
     * idParcela
     * idTitulo
     * idPlanoContaGerencial
     * idCentroCusto
     * dataMovimento = dataBaixa
     * valorMovimento = valor calculado
     * valorMovimentoMoedaOriginal = valorMovimento (se moeda original)
     * valorMovimentoMoedaPadrao = valorMovimento × cotacao (se necessário)
     * percentualRateioPlanoConta = percentual original
     * percentualRateioCentroCusto = percentual original

8. Sistema valida:
   - Soma dos movimentos criados = valorBaixa (com tolerância de arredondamento)

9. Sistema atualiza status do título:
   - Se todas parcelas baixadas: status = 'BAIXADO'
   - Se pelo menos uma baixada: status = 'PARCIAL'
   - Se nenhuma baixada: status = 'ABERTO'

10. Sistema exibe mensagem de sucesso
```

### 5.6. Fluxo: Consulta Planejado vs Realizado

```
1. Usuário acessa relatório de Planejado vs Realizado

2. Usuário seleciona filtros:
   - Período (data inicial e final)
   - Safra (opcional)
   - Fazenda (opcional)
   - Plano de Contas (opcional)
   - Centro de Custo (opcional)
   - Tipo (Pagar/Receber)

3. Sistema calcula PLANEJADO:
   - Busca títulos com status 'ABERTO' ou 'PARCIAL' no período
   - Para cada título:
     * Soma valores de rateios por Plano de Contas e Centro de Custo
     * Agrupa por Plano de Contas e Centro de Custo
   - Resultado: Total planejado por PC × CC

4. Sistema calcula REALIZADO:
   - Busca movimentos financeiros (C027 ou C028) no período
   - Agrupa por Plano de Contas e Centro de Custo
   - Soma valores de movimentos
   - Resultado: Total realizado por PC × CC

5. Sistema apresenta:
   - Tabela comparativa: Planejado vs Realizado
   - Diferença (Realizado - Planejado)
   - Percentual de realização (Realizado / Planejado × 100)
   - Gráficos (opcional)
```

---

## 📊 6. Casos de Uso

### 6.1. UC-001: Criar Título a Pagar
**Ator:** Usuário com permissão `tituloPagar.create`

**Pré-condições:**
- Usuário autenticado
- Tenant ativo
- Fornecedor, Portador, Produtor, Fazenda e Safra existem e pertencem ao tenant

**Fluxo Principal:**
1. Usuário acessa tela de criação de título a pagar
2. Sistema exibe formulário
3. Usuário preenche dados do título
4. Usuário adiciona parcelas
5. Usuário adiciona rateios por plano de contas
6. Usuário adiciona rateios por centro de custo
7. Sistema valida todos os dados
8. Sistema cria título e registros relacionados
9. Sistema exibe mensagem de sucesso

**Fluxos Alternativos:**
- 3a. Se dados inválidos, sistema exibe mensagens de erro
- 4a. Se soma das parcelas ≠ valor do título, sistema exibe erro
- 5a. Se soma dos rateios > valor do título, sistema exibe erro
- 6a. Se soma dos rateios > valor do título, sistema exibe erro

**Pós-condições:**
- Título criado com status 'ABERTO'
- Parcelas criadas
- Rateios criados

### 6.2. UC-002: Criar Título a Receber
[Similar a UC-001, adaptado para receber]

### 6.3. UC-003: Baixar Parcela
**Ator:** Usuário com permissão `tituloPagar.baixar` ou `tituloReceber.baixar`

**Pré-condições:**
- Parcela existe e está com status 'ABERTA'
- Título não está cancelado

**Fluxo Principal:**
1. Usuário acessa lista de parcelas
2. Usuário seleciona parcela para baixa
3. Sistema exibe dados da parcela
4. Usuário informa data e valor da baixa
5. Sistema valida dados
6. Sistema atualiza parcela
7. Sistema atualiza status do título
8. Sistema exibe mensagem de sucesso

**Fluxos Alternativos:**
- 5a. Se valor > valor pendente, sistema exibe erro
- 5b. Se data < data de lançamento, sistema exibe erro

**Pós-condições:**
- Parcela atualizada com data e valor de baixa
- Status do título atualizado

### 6.4. UC-004: Consultar Títulos a Pagar
**Ator:** Usuário com permissão `tituloPagar.read`

**Fluxo Principal:**
1. Usuário acessa lista de títulos a pagar
2. Sistema exibe títulos do tenant com filtros:
   - Por fornecedor
   - Por safra
   - Por fazenda
   - Por status
   - Por período de vencimento
3. Usuário aplica filtros
4. Sistema exibe resultados paginados
5. Usuário pode visualizar detalhes do título

### 6.5. UC-005: Consultar Títulos a Receber
[Similar a UC-004, adaptado para receber]

### 6.6. UC-006: Editar Título
**Ator:** Usuário com permissão `tituloPagar.update` ou `tituloReceber.update`

**Pré-condições:**
- Título existe
- Título não está totalmente baixado
- Título não está cancelado

**Fluxo Principal:**
1. Usuário acessa detalhes do título
2. Usuário solicita edição
3. Sistema exibe formulário preenchido
4. Usuário altera dados permitidos
5. Sistema valida alterações
6. Sistema atualiza título e registros relacionados
7. Sistema exibe mensagem de sucesso

**Restrições:**
- Não permite alterar parcelas já baixadas
- Não permite alterar rateios se título parcialmente baixado (opcional)

### 6.7. UC-007: Cancelar Título
**Ator:** Usuário com permissão `tituloPagar.delete` ou `tituloReceber.delete`

**Pré-condições:**
- Título existe
- Título não está totalmente baixado

**Fluxo Principal:**
1. Usuário acessa detalhes do título
2. Usuário solicita cancelamento
3. Sistema solicita confirmação
4. Usuário confirma
5. Sistema atualiza status para 'CANCELADO'
6. Sistema cancela parcelas abertas
7. Sistema exibe mensagem de sucesso

### 6.8. UC-008: Consultar Planejado vs Realizado
**Ator:** Usuário com permissão `tituloPagar.read` ou `tituloReceber.read`

**Pré-condições:**
- Usuário autenticado
- Tenant ativo

**Fluxo Principal:**
1. Usuário acessa relatório de Planejado vs Realizado
2. Sistema exibe filtros:
   - Período (data inicial e final)
   - Safra (opcional)
   - Fazenda (opcional)
   - Plano de Contas (opcional)
   - Centro de Custo (opcional)
   - Tipo (Pagar/Receber/Todos)
3. Usuário aplica filtros
4. Sistema calcula:
   - Planejado: Soma de rateios de títulos abertos/parciais
   - Realizado: Soma de movimentos financeiros baixados
5. Sistema exibe:
   - Tabela comparativa por Plano de Contas e Centro de Custo
   - Valores planejados
   - Valores realizados
   - Diferença
   - Percentual de realização
6. Usuário pode exportar relatório (opcional)

**Fluxos Alternativos:**
- 4a. Se não houver dados no período, sistema exibe mensagem informativa

**Pós-condições:**
- Relatório exibido com dados atualizados

### 6.9. UC-009: Visualizar Movimentos Financeiros
**Ator:** Usuário com permissão `tituloPagar.read` ou `tituloReceber.read`

**Pré-condições:**
- Parcela existe e foi baixada

**Fluxo Principal:**
1. Usuário acessa detalhes de parcela baixada
2. Sistema exibe:
   - Dados da parcela
   - Lista de movimentos financeiros da parcela
   - Agrupamento por Plano de Contas e Centro de Custo
   - Valores rateados
3. Usuário pode filtrar por Plano de Contas ou Centro de Custo
4. Sistema atualiza exibição

**Pós-condições:**
- Movimentos financeiros exibidos

---

## 🔍 7. Validações Detalhadas

### 7.1. Validações de Entrada

#### Título a Pagar/Receber
- `idFornecedor` / `idCliente`: Obrigatório, deve existir, deve ser fornecedor/cliente, deve pertencer ao tenant
- `idPortador`: Obrigatório, deve existir, deve ser portador, deve pertencer ao tenant
- `idProdutor`: Obrigatório, deve existir, deve ser produtor, deve pertencer ao tenant
- `idFazenda`: Obrigatório, deve existir, deve pertencer ao tenant
- `idSafra`: Obrigatório, deve existir, deve pertencer ao tenant
- `idMoeda`: Obrigatório, deve existir
- `dataLancamento`: Obrigatório, formato DATE, não pode ser futura (opcional)
- `numeroTitulo`: Obrigatório, string 3-100 caracteres, único no tenant
- `observacao`: Opcional, texto livre
- `impostoRenda`: Opcional, boolean, default false

#### Parcela
- `numeroParcela`: Obrigatório, integer, sequencial (1, 2, 3...)
- `dataVencimento`: Obrigatório, formato DATE, não pode ser anterior à data de lançamento
- `valorParcela`: Obrigatório, decimal > 0

#### Rateio Plano de Contas
- `idPlanoContaGerencial`: Obrigatório, deve existir, deve pertencer ao tenant
- `valorRateio`: Obrigatório, decimal > 0
- Soma dos rateios: Deve ser <= valorTitulo

#### Rateio Centro de Custo
- `idCentroCusto`: Obrigatório, deve existir, deve pertencer ao tenant
- `valorRateio`: Obrigatório, decimal > 0
- Soma dos rateios: Deve ser <= valorTitulo

### 7.2. Validações de Negócio

- **Valor Total:** Soma das parcelas = valorTitulo
- **Rateios:** Soma dos rateios (plano de contas) <= valorTitulo
- **Rateios:** Soma dos rateios (centro de custo) <= valorTitulo
- **Moeda:** Se moeda diferente de BRL, deve existir cotação
- **Status:** Título só pode ser editado se status = 'ABERTO' ou 'PARCIAL'
- **Baixa:** Parcela só pode ser baixada se status = 'ABERTA'

---

## 📈 8. Cálculos Automáticos

### 8.1. Cálculo de Valor Total do Título
```
valorTitulo = SUM(valorParcela) de todas as parcelas
```

### 8.2. Cálculo de Quantidade de Parcelas
```
quantidadeParcelas = COUNT(parcelas)
```

### 8.3. Cálculo de Percentual de Rateio
```
percentualRateio = (valorRateio / valorTitulo) * 100
```

### 8.4. Conversão de Moeda
```
valorTituloMoedaPadrao = valorTituloMoedaOriginal * cotacaoMoeda
valorParcelaMoedaPadrao = valorParcelaMoedaOriginal * cotacaoMoeda
```

### 8.5. Atualização de Status do Título
```
SE todas parcelas.status = 'BAIXADA':
  titulo.status = 'BAIXADO'
SENÃO SE pelo menos uma parcela.status = 'BAIXADA':
  titulo.status = 'PARCIAL'
SENÃO:
  titulo.status = 'ABERTO'
```

### 8.6. Cálculo de Movimentos Financeiros na Baixa
```
Para cada rateio de Plano de Contas (PC):
  Para cada rateio de Centro de Custo (CC):
    percentualCombinado = (PC.percentualRateio / 100) × (CC.percentualRateio / 100)
    valorMovimento = valorBaixa × percentualCombinado
    Criar movimento com:
      - idParcela
      - idTitulo
      - idPlanoContaGerencial = PC.id
      - idCentroCusto = CC.id
      - dataMovimento = dataBaixa
      - valorMovimento = valorMovimento
      - percentualRateioPlanoConta = PC.percentualRateio
      - percentualRateioCentroCusto = CC.percentualRateio
```

### 8.7. Cálculo de Planejado
```
Planejado = SUM(
  rateio.valorRateio 
  WHERE titulo.status IN ('ABERTO', 'PARCIAL')
  AND titulo.dataLancamento BETWEEN dataInicio AND dataFim
  GROUP BY idPlanoContaGerencial, idCentroCusto
)
```

### 8.8. Cálculo de Realizado
```
Realizado = SUM(
  movimento.valorMovimento
  WHERE movimento.dataMovimento BETWEEN dataInicio AND dataFim
  GROUP BY idPlanoContaGerencial, idCentroCusto
)
```

### 8.9. Percentual de Realização
```
percentualRealizacao = (Realizado / Planejado) × 100
```

---

## 🔐 9. Permissões

### 9.1. Título a Pagar
- `tituloPagar.create` - Criar título a pagar
- `tituloPagar.read` - Consultar títulos a pagar
- `tituloPagar.update` - Editar título a pagar
- `tituloPagar.delete` - Cancelar título a pagar
- `tituloPagar.baixar` - Baixar parcelas de título a pagar

### 9.2. Título a Receber
- `tituloReceber.create` - Criar título a receber
- `tituloReceber.read` - Consultar títulos a receber
- `tituloReceber.update` - Editar título a receber
- `tituloReceber.delete` - Cancelar título a receber
- `tituloReceber.baixar` - Baixar parcelas de título a receber

### 9.3. Relatórios
- `financeiro.relatorio.planejadoRealizado` - Consultar relatório de planejado vs realizado
- `financeiro.movimento.read` - Consultar movimentos financeiros

---

## 📝 10. Observações Importantes

### 10.1. Estrutura de Parcelas
- As parcelas são criadas junto com o título
- Cada parcela tem seu próprio vencimento e valor
- Parcelas podem ter valores diferentes
- Parcelas podem ter vencimentos em qualquer ordem (não necessariamente sequencial)

### 10.2. Rateios
- Um título pode ter múltiplos rateios por plano de contas
- Um título pode ter múltiplos rateios por centro de custo
- Os rateios são independentes entre si
- A soma dos rateios pode ser menor que o valor do título (não precisa ser exatamente 100%)

### 10.3. Conversão de Moeda
- A conversão é feita no momento da criação do título
- Se a cotação mudar, títulos já criados mantêm o valor original
- Títulos abertos podem ser recalculados se necessário (opcional)

### 10.4. Baixa de Títulos
- A baixa é feita por parcela
- Uma parcela pode ser baixada parcialmente (se permitido)
- O status do título é atualizado automaticamente
- **Movimentos financeiros são criados automaticamente** na baixa, rateando proporcionalmente pelos planos de contas e centros de custo do título

### 10.5. Controle Planejado vs Realizado
- **Planejado:** Representa os valores rateados de títulos ainda não totalmente baixados (status 'ABERTO' ou 'PARCIAL')
- **Realizado:** Representa os valores efetivamente movimentados, registrados na baixa de parcelas através dos movimentos financeiros
- **Cálculo:** 
  - Planejado = Soma dos rateios de títulos abertos/parciais
  - Realizado = Soma dos movimentos financeiros de parcelas baixadas
- **Uso:** Permite comparar o que foi planejado com o que foi efetivamente realizado, por plano de contas e centro de custo

---

## 🎯 11. Próximos Passos

### Fase 1: Estrutura Base
1. Criar tabelas principais (C019, C020, C021, C022, C023, C024, C025, C026)
2. Criar tabelas de movimentos financeiros (C027, C028)
3. Criar models Sequelize
4. Criar repositories
5. Criar DTOs básicos

### Fase 2: Lógica de Negócio
1. Implementar validações
2. Implementar cálculos automáticos
3. Implementar conversão de moeda
4. Implementar atualização de status
5. **Implementar criação automática de movimentos na baixa**
6. **Implementar cálculos de planejado vs realizado**

### Fase 3: Endpoints
1. Criar endpoints de CRUD
2. Criar endpoint de baixa (com criação de movimentos)
3. Criar endpoints de consulta com filtros
4. **Criar endpoint de relatório planejado vs realizado**
5. **Criar endpoint de consulta de movimentos financeiros**

### Fase 4: Testes
1. Testes unitários
2. Testes de integração
3. Testes de regras de negócio
4. **Testes de criação de movimentos**
5. **Testes de cálculos planejado vs realizado**

---

**Documento criado em:** 2026-01-17  
**Última atualização:** 2026-01-17  
**Versão:** 1.0.0
