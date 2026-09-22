# 📊 Controle Financeiro - Diagramas e Exemplos Práticos

**Versão:** 1.0.0  
**Data:** 2026-01-17  
**Autor:** Product Owner  
**Status:** 📝 Documentação Complementar

---

## 📐 1. Diagrama de Entidades e Relacionamentos (ER)

```
┌─────────────────────┐
│  C001_PESSOA        │
│  (Fornecedor/      │
│   Cliente/         │
│   Portador/        │
│   Produtor)        │
└──────────┬─────────┘
           │
           │ (idFornecedor, idCliente, idPortador, idProdutor)
           │
           ├─────────────────────────────────────┐
           │                                     │
┌──────────▼──────────┐              ┌─────────▼──────────┐
│ C019_tituloPagar    │              │ C023_tituloReceber│
│                     │              │                    │
│ - id                │              │ - id               │
│ - tenantId          │              │ - tenantId         │
│ - idFornecedor      │              │ - idCliente        │
│ - idPortador        │              │ - idPortador       │
│ - idProdutor        │              │ - idProdutor       │
│ - idFazenda         │              │ - idFazenda        │
│ - idSafra           │              │ - idSafra          │
│ - idMoeda           │              │ - idMoeda          │
│ - dataLancamento    │              │ - dataLancamento   │
│ - numeroTitulo      │              │ - numeroTitulo     │
│ - valorTitulo       │              │ - valorTitulo     │
│ - status            │              │ - status           │
└──────────┬──────────┘              └─────────┬─────────┘
           │                                    │
           │ 1:N                                │ 1:N
           │                                    │
┌──────────▼──────────┐              ┌─────────▼──────────┐
│ C020_parcelaTitulo  │              │ C024_parcelaTitulo │
│      Pagar          │              │     Receber        │
│                     │              │                    │
│ - id                │              │ - id                │
│ - idTituloPagar     │              │ - idTituloReceber   │
│ - numeroParcela     │              │ - numeroParcela     │
│ - dataVencimento    │              │ - dataVencimento   │
│ - valorParcela      │              │ - valorParcela     │
│ - dataBaixa         │              │ - dataBaixa        │
│ - valorBaixa         │              │ - valorBaixa       │
│ - status            │              │ - status            │
└─────────────────────┘              └────────────────────┘

┌─────────────────────┐
│ C013_planoConta     │
│    Gerencial        │
└──────────┬──────────┘
           │
           │ (idPlanoContaGerencial)
           │
           ├─────────────────────────────────────┐
           │                                     │
┌──────────▼──────────┐              ┌──────────▼──────────┐
│ C021_rateioPlano    │              │ C025_rateioPlano    │
│ ContaTituloPagar    │              │ ContaTituloReceber  │
│                     │              │                     │
│ - id                │              │ - id                 │
│ - idTituloPagar     │              │ - idTituloReceber    │
│ - idPlanoConta      │              │ - idPlanoConta       │
│ - valorRateio       │              │ - valorRateio        │
│ - percentualRateio  │              │ - percentualRateio   │
└─────────────────────┘              └──────────────────────┘

┌─────────────────────┐
│ C016_centroCusto    │
└──────────┬──────────┘
           │
           │ (idCentroCusto)
           │
           ├─────────────────────────────────────┐
           │                                     │
┌──────────▼──────────┐              ┌──────────▼──────────┐
│ C022_rateioCentro   │              │ C026_rateioCentro  │
│ CustoTituloPagar    │              │ CustoTituloReceber │
│                     │              │                     │
│ - id                │              │ - id                 │
│ - idTituloPagar     │              │ - idTituloReceber    │
│ - idCentroCusto     │              │ - idCentroCusto     │
│ - valorRateio       │              │ - valorRateio        │
│ - percentualRateio  │              │ - percentualRateio   │
└─────────────────────┘              └──────────────────────┘

┌─────────────────────┐
│ C018_fazenda        │
└──────────┬──────────┘
           │
           │ (idFazenda)
           │
           └───────────┐
                       │
┌──────────────────────▼──────────┐
│ C019_tituloPagar /             │
│ C023_tituloReceber             │
└────────────────────────────────┘

┌─────────────────────┐
│ C017_safra          │
└──────────┬──────────┘
           │
           │ (idSafra)
           │
           └───────────┐
                       │
┌──────────────────────▼──────────┐
│ C019_tituloPagar /             │
│ C023_tituloReceber             │
└────────────────────────────────┘

┌─────────────────────┐
│ C006_moeda          │
└──────────┬──────────┘
           │
           │ (idMoeda)
           │
           └───────────┐
                       │
┌──────────────────────▼──────────┐
│ C019_tituloPagar /             │
│ C023_tituloReceber             │
└────────────────────────────────┘

┌─────────────────────┐
│ C020_parcelaTitulo  │
│      Pagar          │
└──────────┬──────────┘
           │
           │ (idParcelaTituloPagar)
           │
           ▼
┌─────────────────────────────────┐
│ C027_movimentoFinanceiro       │
│    TituloPagar                 │
│                                 │
│ - id                            │
│ - idParcelaTituloPagar          │
│ - idTituloPagar                 │
│ - idPlanoContaGerencial         │
│ - idCentroCusto                 │
│ - dataMovimento                 │
│ - valorMovimento                │
│ - percentualRateioPC            │
│ - percentualRateioCC            │
└─────────────────────────────────┘

┌─────────────────────┐
│ C024_parcelaTitulo  │
│     Receber         │
└──────────┬──────────┘
           │
           │ (idParcelaTituloReceber)
           │
           ▼
┌─────────────────────────────────┐
│ C028_movimentoFinanceiro        │
│    TituloReceber                │
│                                 │
│ - id                             │
│ - idParcelaTituloReceber         │
│ - idTituloReceber                │
│ - idPlanoContaGerencial          │
│ - idCentroCusto                  │
│ - dataMovimento                  │
│ - valorMovimento                 │
│ - percentualRateioPC             │
│ - percentualRateioCC             │
└──────────────────────────────────┘
```

---

## 💡 2. Exemplos Práticos

### 2.1. Exemplo 1: Título a Pagar Simples

**Cenário:** Compra de sementes de soja para a safra 2024/2025.

**Dados do Título:**
- Fornecedor: "Agro Sementes LTDA" (id: 10)
- Portador: "Banco do Brasil" (id: 5)
- Produtor: "João Silva" (id: 3)
- Fazenda: "Fazenda Santa Maria" (id: 1)
- Safra: "Safra 2024/2025" (id: 2)
- Moeda: BRL (id: 1)
- Data de Lançamento: 2024-09-01
- Número do Título: "TP-2024-001"
- Observação: "Compra de sementes de soja"

**Parcelas:**
1. Parcela 1: Vencimento 2024-10-01, Valor: R$ 5.000,00
2. Parcela 2: Vencimento 2024-11-01, Valor: R$ 5.000,00
3. Parcela 3: Vencimento 2024-12-01, Valor: R$ 5.000,00

**Valor Total:** R$ 15.000,00

**Rateio por Plano de Contas:**
1. Plano de Contas "1.1.2.0 - Sementes": R$ 10.000,00 (66,67%)
2. Plano de Contas "1.1.3.0 - Insumos Agrícolas": R$ 5.000,00 (33,33%)

**Rateio por Centro de Custo:**
1. Centro de Custo "CC001 - Soja": R$ 12.000,00 (80%)
2. Centro de Custo "CC002 - Milho": R$ 3.000,00 (20%)

**Resultado:**
- Título criado com 3 parcelas
- Status inicial: 'ABERTO'
- Todos os rateios validados e criados
- **Planejado:** R$ 15.000,00 rateados conforme acima
- **Realizado:** R$ 0,00 (nenhuma parcela baixada ainda)

---

### 2.1.1. Exemplo 1.1: Baixa de Parcela com Movimentos

**Cenário:** Baixa da primeira parcela do título acima.

**Operação:**
- Parcela 1 baixada: R$ 5.000,00 em 2024-10-01

**Movimentos Criados Automaticamente:**

**Movimento 1:**
- Plano de Contas: "1.1.2.0 - Sementes" (66,67%)
- Centro de Custo: "CC001 - Soja" (80%)
- Cálculo: R$ 5.000,00 × 0,6667 × 0,80 = R$ 2.666,80
- Data: 2024-10-01

**Movimento 2:**
- Plano de Contas: "1.1.2.0 - Sementes" (66,67%)
- Centro de Custo: "CC002 - Milho" (20%)
- Cálculo: R$ 5.000,00 × 0,6667 × 0,20 = R$ 666,70
- Data: 2024-10-01

**Movimento 3:**
- Plano de Contas: "1.1.3.0 - Insumos Agrícolas" (33,33%)
- Centro de Custo: "CC001 - Soja" (80%)
- Cálculo: R$ 5.000,00 × 0,3333 × 0,80 = R$ 1.333,20
- Data: 2024-10-01

**Movimento 4:**
- Plano de Contas: "1.1.3.0 - Insumos Agrícolas" (33,33%)
- Centro de Custo: "CC002 - Milho" (20%)
- Cálculo: R$ 5.000,00 × 0,3333 × 0,20 = R$ 333,30
- Data: 2024-10-01

**Validação:** R$ 2.666,80 + R$ 666,70 + R$ 1.333,20 + R$ 333,30 = R$ 5.000,00 ✓

**Resultado:**
- Parcela 1: Status 'BAIXADA', valorBaixa = R$ 5.000,00
- Título: Status 'PARCIAL'
- **4 movimentos financeiros criados**
- **Planejado:** R$ 10.000,00 (parcelas 2 e 3 ainda abertas)
- **Realizado:** R$ 5.000,00 (parcela 1 baixada)

---

### 2.2. Exemplo 2: Título a Receber com Moeda Estrangeira

**Cenário:** Venda de soja para exportação em USD.

**Dados do Título:**
- Cliente: "Global Trading Inc" (id: 20)
- Portador: "Banco do Brasil" (id: 5)
- Produtor: "João Silva" (id: 3)
- Fazenda: "Fazenda Santa Maria" (id: 1)
- Safra: "Safra 2024/2025" (id: 2)
- Moeda: USD (id: 2)
- Cotação USD: R$ 5,20 (última cotação oficial)
- Data de Lançamento: 2024-10-15
- Número do Título: "TR-2024-050"
- Observação: "Venda de soja para exportação"

**Parcelas:**
1. Parcela 1: Vencimento 2024-11-15, Valor: USD 10.000,00
2. Parcela 2: Vencimento 2024-12-15, Valor: USD 10.000,00

**Valor Total Original:** USD 20.000,00  
**Valor Total em BRL:** R$ 104.000,00 (20.000 × 5,20)

**Rateio por Plano de Contas:**
1. Plano de Contas "2.1.1.0 - Vendas de Soja": R$ 104.000,00 (100%)

**Rateio por Centro de Custo:**
1. Centro de Custo "CC001 - Soja": R$ 104.000,00 (100%)

**Resultado:**
- Título criado com valores em USD e BRL
- Conversão automática aplicada
- Status inicial: 'ABERTO'

---

### 2.3. Exemplo 3: Baixa Parcial de Parcela

**Cenário:** Pagamento parcial de uma parcela de título a pagar.

**Situação Inicial:**
- Título: "TP-2024-001"
- Parcela 1: Valor R$ 5.000,00, Status: 'ABERTA'

**Operação:**
- Data de Baixa: 2024-10-01
- Valor da Baixa: R$ 3.000,00

**Resultado:**
- Parcela 1:
  - `valorBaixa`: R$ 3.000,00
  - `dataBaixa`: 2024-10-01
  - `status`: 'ABERTA' (ainda há R$ 2.000,00 pendentes)
- Título:
  - `status`: 'PARCIAL' (pois tem parcela parcialmente baixada)

**Observação:** Se o sistema permitir baixa parcial, a parcela permanece 'ABERTA' até ser totalmente baixada. Caso contrário, só permite baixa total.

---

### 2.4. Exemplo 4: Baixa Total de Título

**Cenário:** Baixa de todas as parcelas de um título a receber.

**Situação Inicial:**
- Título: "TR-2024-050"
- Parcela 1: R$ 52.000,00, Status: 'ABERTA'
- Parcela 2: R$ 52.000,00, Status: 'ABERTA'
- Status do Título: 'ABERTO'
- Rateio: 100% em "2.1.1.0 - Vendas de Soja" e 100% em "CC001 - Soja"

**Operações:**
1. Baixa Parcela 1:
   - Data: 2024-11-15
   - Valor: R$ 52.000,00
   - Status Parcela: 'BAIXADA'
   - **Movimento criado:** R$ 52.000,00 (100% × 100% = 100%)

2. Baixa Parcela 2:
   - Data: 2024-12-15
   - Valor: R$ 52.000,00
   - Status Parcela: 'BAIXADA'
   - **Movimento criado:** R$ 52.000,00 (100% × 100% = 100%)

**Resultado:**
- Todas as parcelas: Status 'BAIXADA'
- Título: Status 'BAIXADO'
- Sistema atualiza automaticamente o status
- **2 movimentos financeiros criados** (um para cada parcela)
- **Planejado:** R$ 0,00 (título totalmente baixado)
- **Realizado:** R$ 104.000,00 (total do título)

---

### 2.5. Exemplo 5: Relatório Planejado vs Realizado

**Cenário:** Consulta de planejado vs realizado para a safra 2024/2025.

**Período:** Setembro a Dezembro de 2024  
**Safra:** Safra 2024/2025

**Dados Planejados (Títulos Abertos/Parciais):**

**Título a Pagar TP-001:**
- Valor: R$ 15.000,00
- Status: 'PARCIAL' (parcela 1 baixada, parcelas 2 e 3 abertas)
- Rateio PC "1.1.2.0": R$ 10.000,00
- Rateio PC "1.1.3.0": R$ 5.000,00
- Rateio CC "CC001": R$ 12.000,00
- Rateio CC "CC002": R$ 3.000,00
- **Planejado Restante:** R$ 10.000,00 (parcelas 2 e 3)

**Título a Pagar TP-002:**
- Valor: R$ 8.000,00
- Status: 'ABERTO'
- Rateio PC "1.1.2.0": R$ 8.000,00
- Rateio CC "CC001": R$ 8.000,00
- **Planejado:** R$ 8.000,00

**Dados Realizados (Movimentos Financeiros):**

**Movimentos da Parcela 1 do TP-001:**
- PC "1.1.2.0" + CC "CC001": R$ 2.666,80
- PC "1.1.2.0" + CC "CC002": R$ 666,70
- PC "1.1.3.0" + CC "CC001": R$ 1.333,20
- PC "1.1.3.0" + CC "CC002": R$ 333,30
- **Total Realizado:** R$ 5.000,00

**Resumo por Plano de Contas e Centro de Custo:**

| Plano de Contas | Centro de Custo | Planejado | Realizado | Diferença | % Realização |
|-----------------|-----------------|-----------|-----------|-----------|--------------|
| 1.1.2.0 - Sementes | CC001 - Soja | R$ 8.000,00 | R$ 2.666,80 | R$ -5.333,20 | 33,34% |
| 1.1.2.0 - Sementes | CC002 - Milho | R$ 2.000,00 | R$ 666,70 | R$ -1.333,30 | 33,34% |
| 1.1.3.0 - Insumos | CC001 - Soja | R$ 5.333,20 | R$ 1.333,20 | R$ -4.000,00 | 25,00% |
| 1.1.3.0 - Insumos | CC002 - Milho | R$ 1.333,30 | R$ 333,30 | R$ -1.000,00 | 25,00% |
| **TOTAL** | | **R$ 16.666,50** | **R$ 5.000,00** | **R$ -11.666,50** | **30,00%** |

**Observações:**
- Planejado inclui apenas valores de parcelas ainda não baixadas
- Realizado inclui apenas valores de movimentos financeiros (parcelas baixadas)
- Percentual de realização mostra quanto do planejado já foi efetivamente movimentado

---

## 🔄 3. Fluxogramas de Processo

### 3.1. Fluxograma: Criação de Título a Pagar

```
┌─────────────────┐
│ Início          │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Preencher dados do      │
│ título (obrigatórios)    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Validar dados básicos   │
│ (Fornecedor, Portador,  │
│  Produtor, Fazenda,     │
│  Safra, Moeda)          │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │ Válido? │
    └────┬────┘
         │ Não
         │
         ▼
    ┌──────────────┐
    │ Exibir erro  │
    └──────────────┘
         │
         │ Sim
         ▼
┌─────────────────────────┐
│ Adicionar parcelas      │
│ (Data vencimento +      │
│  Valor)                 │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Calcular valor total     │
│ (Soma das parcelas)     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Converter moeda (se     │
│ necessário)             │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Adicionar rateios       │
│ Plano de Contas         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Validar soma rateios    │
│ PC <= valorTitulo       │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │ Válido? │
    └────┬────┘
         │ Não
         │
         ▼
    ┌──────────────┐
    │ Exibir erro  │
    └──────────────┘
         │
         │ Sim
         ▼
┌─────────────────────────┐
│ Adicionar rateios       │
│ Centro de Custo         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Validar soma rateios    │
│ CC <= valorTitulo       │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │ Válido? │
    └────┬────┘
         │ Não
         │
         ▼
    ┌──────────────┐
    │ Exibir erro  │
    └──────────────┘
         │
         │ Sim
         ▼
┌─────────────────────────┐
│ Validar regras finais    │
│ - Pelo menos 1 parcela  │
│ - Pelo menos 1 rateio PC│
│ - Pelo menos 1 rateio CC │
│ - Soma parcelas = valor │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │ Válido? │
    └────┬────┘
         │ Não
         │
         ▼
    ┌──────────────┐
    │ Exibir erro  │
    └──────────────┘
         │
         │ Sim
         ▼
┌─────────────────────────┐
│ Criar registros no BD   │
│ - Título                │
│ - Parcelas              │
│ - Rateios PC            │
│ - Rateios CC            │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Exibir sucesso          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│ Fim             │
└─────────────────┘
```

### 3.2. Fluxograma: Baixa de Parcela

```
┌─────────────────┐
│ Início          │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Selecionar parcela      │
│ para baixa              │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Validar parcela         │
│ - Existe?               │
│ - Status = 'ABERTA'?    │
│ - Título não cancelado? │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │ Válido? │
    └────┬────┘
         │ Não
         │
         ▼
    ┌──────────────┐
    │ Exibir erro  │
    └──────────────┘
         │
         │ Sim
         ▼
┌─────────────────────────┐
│ Exibir dados da parcela │
│ - Valor total           │
│ - Valor já baixado      │
│ - Valor pendente        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Usuário informa:        │
│ - Data de baixa         │
│ - Valor da baixa        │
│ - Observação (opcional) │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Validar dados           │
│ - dataBaixa >=          │
│   dataLancamento?       │
│ - valorBaixa <=         │
│   valorPendente?        │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │ Válido? │
    └────┬────┘
         │ Não
         │
         ▼
    ┌──────────────┐
    │ Exibir erro  │
    └──────────────┘
         │
         │ Sim
         ▼
┌─────────────────────────┐
│ Atualizar parcela       │
│ - dataBaixa             │
│ - valorBaixa            │
│ - status (se total)      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Buscar rateios do título│
│ - Rateios PC            │
│ - Rateios CC            │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Para cada combinação    │
│ PC × CC:                │
│ - Calcular percentual   │
│   combinado             │
│ - Calcular valorMovimento│
│ - Criar movimento       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Validar movimentos      │
│ - Soma = valorBaixa?    │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │ Válido? │
    └────┬────┘
         │ Não
         │
         ▼
    ┌──────────────┐
    │ Ajustar      │
    │ arredondamento│
    └──────────────┘
         │
         │ Sim
         ▼
┌─────────────────────────┐
│ Verificar status        │
│ de todas as parcelas    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Atualizar status        │
│ do título              │
│ - BAIXADO (todas)       │
│ - PARCIAL (algumas)     │
│ - ABERTO (nenhuma)      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Exibir sucesso          │
│ e movimentos criados    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│ Fim             │
└─────────────────┘
```

---

## 📋 4. Tabelas de Validação

### 4.1. Validações de Título a Pagar

| Campo | Obrigatório | Tipo | Validação | Erro |
|-------|-------------|------|-----------|------|
| idFornecedor | Sim | INTEGER | Existe, é fornecedor, mesmo tenant | "Fornecedor inválido ou não pertence ao tenant" |
| idPortador | Sim | INTEGER | Existe, é portador, mesmo tenant | "Portador inválido ou não pertence ao tenant" |
| idProdutor | Sim | INTEGER | Existe, é produtor, mesmo tenant | "Produtor inválido ou não pertence ao tenant" |
| idFazenda | Sim | INTEGER | Existe, mesmo tenant | "Fazenda inválida ou não pertence ao tenant" |
| idSafra | Sim | INTEGER | Existe, mesmo tenant | "Safra inválida ou não pertence ao tenant" |
| idMoeda | Sim | INTEGER | Existe | "Moeda inválida" |
| dataLancamento | Sim | DATE | Formato válido | "Data de lançamento inválida" |
| numeroTitulo | Sim | STRING | 3-100 caracteres, único no tenant | "Número do título já existe ou inválido" |
| observacao | Não | TEXT | - | - |
| impostoRenda | Não | BOOLEAN | - | - |

### 4.2. Validações de Parcela

| Campo | Obrigatório | Tipo | Validação | Erro |
|-------|-------------|------|-----------|------|
| numeroParcela | Sim | INTEGER | Sequencial (1, 2, 3...) | "Número de parcela inválido" |
| dataVencimento | Sim | DATE | >= dataLancamento | "Data de vencimento anterior à data de lançamento" |
| valorParcela | Sim | DECIMAL | > 0 | "Valor da parcela deve ser maior que zero" |

### 4.3. Validações de Rateio

| Campo | Obrigatório | Tipo | Validação | Erro |
|-------|-------------|------|-----------|------|
| idPlanoContaGerencial | Sim | INTEGER | Existe, mesmo tenant, tipo ANALITICA | "Plano de contas inválido ou não analítico" |
| idCentroCusto | Sim | INTEGER | Existe, mesmo tenant | "Centro de custo inválido ou não pertence ao tenant" |
| valorRateio | Sim | DECIMAL | > 0, soma <= valorTitulo | "Valor de rateio inválido ou soma ultrapassa valor do título" |

---

## 🎯 5. Casos de Teste Sugeridos

### 5.1. CT-001: Criar Título a Pagar Válido
**Objetivo:** Verificar criação bem-sucedida de título a pagar com todos os dados corretos.

**Dados de Entrada:**
- Todos os campos obrigatórios preenchidos corretamente
- 3 parcelas válidas
- 2 rateios de plano de contas (soma = valorTitulo)
- 2 rateios de centro de custo (soma = valorTitulo)

**Resultado Esperado:**
- Título criado com status 'ABERTO'
- 3 parcelas criadas
- 2 rateios PC criados
- 2 rateios CC criados
- Mensagem de sucesso

### 5.2. CT-002: Criar Título com Rateio Excedendo Valor
**Objetivo:** Verificar rejeição de título quando soma de rateios excede valor total.

**Dados de Entrada:**
- Título: R$ 10.000,00
- Rateio PC: R$ 6.000,00 + R$ 5.000,00 = R$ 11.000,00

**Resultado Esperado:**
- Erro: "Soma dos rateios de plano de contas não pode ultrapassar o valor do título"
- Título não criado

### 5.3. CT-003: Baixar Parcela Totalmente
**Objetivo:** Verificar baixa completa de uma parcela.

**Dados de Entrada:**
- Parcela: R$ 5.000,00, Status: 'ABERTA'
- Baixa: R$ 5.000,00

**Resultado Esperado:**
- Parcela: Status 'BAIXADA', valorBaixa = R$ 5.000,00
- Título: Status atualizado conforme outras parcelas

### 5.4. CT-004: Título com Moeda Estrangeira
**Objetivo:** Verificar conversão automática de moeda.

**Dados de Entrada:**
- Moeda: USD
- Valor: USD 1.000,00
- Cotação: R$ 5,20

**Resultado Esperado:**
- valorTituloMoedaOriginal: USD 1.000,00
- valorTituloMoedaPadrao: R$ 5.200,00
- Conversão aplicada automaticamente

### 5.5. CT-005: Criação de Movimentos na Baixa
**Objetivo:** Verificar criação automática de movimentos financeiros na baixa de parcela.

**Dados de Entrada:**
- Título: R$ 10.000,00
- Rateio PC "1.1.0.0": 60% (R$ 6.000,00)
- Rateio PC "1.2.0.0": 40% (R$ 4.000,00)
- Rateio CC "CC001": 50% (R$ 5.000,00)
- Rateio CC "CC002": 50% (R$ 5.000,00)
- Baixa Parcela: R$ 2.000,00

**Resultado Esperado:**
- 4 movimentos criados:
  - PC 1.1.0.0 + CC CC001: R$ 600,00 (2.000 × 0,60 × 0,50)
  - PC 1.1.0.0 + CC CC002: R$ 600,00 (2.000 × 0,60 × 0,50)
  - PC 1.2.0.0 + CC CC001: R$ 400,00 (2.000 × 0,40 × 0,50)
  - PC 1.2.0.0 + CC CC002: R$ 400,00 (2.000 × 0,40 × 0,50)
- Soma dos movimentos = R$ 2.000,00

### 5.6. CT-006: Cálculo de Planejado vs Realizado
**Objetivo:** Verificar cálculo correto de planejado e realizado.

**Dados de Entrada:**
- Título 1: R$ 10.000,00, Status: 'ABERTO'
  - Rateio PC "1.1.0.0" + CC "CC001": R$ 10.000,00
- Título 2: R$ 5.000,00, Status: 'PARCIAL'
  - Rateio PC "1.1.0.0" + CC "CC001": R$ 5.000,00
  - Parcela 1 (R$ 2.500,00) já baixada
- Movimentos: R$ 2.500,00 (PC "1.1.0.0" + CC "CC001")

**Resultado Esperado:**
- Planejado: R$ 12.500,00 (R$ 10.000,00 + R$ 2.500,00 restante)
- Realizado: R$ 2.500,00
- Diferença: R$ -10.000,00
- % Realização: 20%

---

## 📝 6. Observações de Implementação

### 6.1. Transações
- Toda criação de título deve ser feita em transação
- Se qualquer validação falhar, rollback completo
- Garante integridade dos dados

### 6.2. Cálculos Automáticos
- `valorTitulo` = soma automática das parcelas
- `quantidadeParcelas` = contagem automática
- `percentualRateio` = cálculo automático baseado em valorTitulo
- `status` = atualização automática baseada nas parcelas

### 6.3. Performance
- Índices em campos de busca frequente:
  - `numeroTitulo` (único)
  - `dataVencimento` (parcelas)
  - `status` (títulos e parcelas)
  - `idSafra`, `idFazenda` (filtros comuns)

### 6.4. Auditoria
- Todos os registros têm `usercreation` e `datecreation`
- Histórico de alterações pode ser implementado futuramente
- Logs de baixa podem ser registrados separadamente
- **Movimentos financeiros registram quem e quando foi feita a baixa**

### 6.5. Controle Planejado vs Realizado
- **Movimentos financeiros são a fonte de verdade para o realizado**
- Planejado é calculado dinamicamente a partir dos rateios de títulos abertos/parciais
- Realizado é calculado dinamicamente a partir dos movimentos financeiros
- **Permite rastreabilidade completa:** cada movimento pode ser rastreado até a parcela e título origem
- **Performance:** Índices em `dataMovimento`, `idPlanoContaGerencial`, `idCentroCusto` para consultas rápidas

### 6.6. Integridade de Dados
- Movimentos são criados automaticamente na baixa (não podem ser criados manualmente)
- Movimentos não podem ser editados ou deletados diretamente (apenas através de estorno de baixa)
- Soma dos movimentos de uma parcela sempre igual ao valor baixado
- **Garante consistência entre planejado e realizado**

---

**Documento criado em:** 2026-01-17  
**Última atualização:** 2026-01-17  
**Versão:** 1.0.0
