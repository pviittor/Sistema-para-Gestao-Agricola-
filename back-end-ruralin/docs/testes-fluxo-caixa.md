# Plano de Testes Manuais — Fluxo de Caixa (Sprint 5B / Epic 9)

## 1. Pre-requisitos

Antes de executar os testes, garantir que o ambiente possui:

- **Tenant ativo** com pelo menos 2 contas bancarias cadastradas (ex.: Banco do Brasil, Sicredi)
- **Titulos a pagar** com parcelas em diferentes estados (pendente, pago, vencido)
- **Titulos a receber** com parcelas futuras (projetadas)
- **Agreements** (contratos/acordos) com payment schedules ativos
- **Recorrencias financeiras** ativas com parcelas dentro do periodo de teste
- **Usuario autenticado** com token JWT valido (role ROOT ou superior)
- **Periodo de teste**: 2026-01-01 a 2026-06-30

---

## 2. Testes de Calculo (GET)

### 2.1 Consolidado

**Endpoint:** `GET /api/fluxo-caixa/consolidado`

```
GET /api/fluxo-caixa/consolidado?dataInicio=2026-01-01&dataFim=2026-03-31&periodicidade=mensal
```

**Resposta esperada:**
```json
{
  "periodicidade": "mensal",
  "dataInicio": "2026-01-01",
  "dataFim": "2026-03-31",
  "saldoInicial": 50000.00,
  "saldoFinal": 75000.00,
  "totalEntradas": 100000.00,
  "totalSaidas": 75000.00,
  "periodos": [
    {
      "rotulo": "Jan/2026",
      "dataInicio": "2026-01-01",
      "dataFim": "2026-01-31",
      "totalEntradas": 30000.00,
      "totalSaidas": 25000.00,
      "saldoPeriodo": 5000.00,
      "saldoAcumulado": 55000.00,
      "lancamentos": [
        {
          "tipoFluxo": "entrada",
          "origem": "titulo_receber",
          "origemId": 10,
          "descricao": "Venda de soja - Safra 2025/2026",
          "data": "2026-01-15",
          "valor": 30000.00,
          "contaBancariaId": 1,
          "contaBancariaNome": "Banco do Brasil",
          "realizado": true,
          "planoContaId": 5,
          "planoContaNome": "Receita de Vendas"
        }
      ]
    }
  ],
  "saldosPorConta": [
    {
      "contaBancariaId": 1,
      "contaBancariaNome": "Banco do Brasil",
      "saldoAtual": 50000.00,
      "entradasProjetadas": 80000.00,
      "saidasProjetadas": 55000.00,
      "saldoProjetado": 75000.00
    }
  ],
  "alertas": [
    {
      "tipo": "saldo_negativo",
      "severidade": "danger",
      "mensagem": "Saldo negativo projetado em Abr/2026",
      "data": "2026-04-15",
      "valor": -5000.00
    }
  ]
}
```

**Validacoes:**
- [ ] Periodicidade `mensal` gera um periodo por mes dentro do intervalo
- [ ] Periodicidade `semanal` gera periodos de 7 dias
- [ ] Periodicidade `diario` gera um periodo por dia
- [ ] `saldoAcumulado` de cada periodo = saldoAcumulado anterior + saldoPeriodo
- [ ] `saldoFinal` = saldoInicial + totalEntradas - totalSaidas
- [ ] Lancamentos realizados (com baixa) possuem `realizado: true`
- [ ] Lancamentos projetados possuem `realizado: false`
- [ ] Filtro `contaBancariaIds=1,2` retorna apenas lancamentos dessas contas

### 2.2 Realizado

**Endpoint:** `GET /api/fluxo-caixa/realizado`

```
GET /api/fluxo-caixa/realizado?dataInicio=2026-01-01&dataFim=2026-03-31&periodicidade=mensal
```

**Validacoes:**
- [ ] Retorna apenas lancamentos com `realizado: true`
- [ ] Parcelas nao pagas/recebidas NAO aparecem
- [ ] Shape da resposta identico ao consolidado

### 2.3 Projetado

**Endpoint:** `GET /api/fluxo-caixa/projetado`

```
GET /api/fluxo-caixa/projetado?dataInicio=2026-01-01&dataFim=2026-06-30&periodicidade=mensal
```

**Validacoes:**
- [ ] Retorna apenas lancamentos com `realizado: false`
- [ ] Inclui parcelas pendentes de titulos a pagar/receber
- [ ] Inclui parcelas de agreements ativos
- [ ] Inclui parcelas de recorrencias financeiras ativas
- [ ] Shape da resposta identico ao consolidado

### 2.4 Saldos por Conta

**Endpoint:** `GET /api/fluxo-caixa/saldos-por-conta`

```
GET /api/fluxo-caixa/saldos-por-conta?dataInicio=2026-01-01&dataFim=2026-06-30&periodicidade=mensal
```

**Resposta esperada:**
```json
[
  {
    "contaBancariaId": 1,
    "contaBancariaNome": "Banco do Brasil",
    "saldoAtual": 50000.00,
    "entradasProjetadas": 80000.00,
    "saidasProjetadas": 55000.00,
    "saldoProjetado": 75000.00
  }
]
```

**Validacoes:**
- [ ] Retorna uma entrada por conta bancaria do tenant
- [ ] `saldoProjetado` = saldoAtual + entradasProjetadas - saidasProjetadas
- [ ] Contas sem movimentacao projetada possuem entradas/saidas = 0

### 2.5 Alertas

**Endpoint:** `GET /api/fluxo-caixa/alertas`

```
GET /api/fluxo-caixa/alertas?dataInicio=2026-01-01&dataFim=2026-06-30&periodicidade=mensal
```

**Resposta esperada:**
```json
[
  {
    "tipo": "saldo_negativo",
    "severidade": "danger",
    "mensagem": "Saldo negativo projetado em Abr/2026",
    "data": "2026-04-15",
    "valor": -5000.00
  },
  {
    "tipo": "saldo_baixo",
    "severidade": "warning",
    "mensagem": "Saldo abaixo do minimo em Mar/2026",
    "data": "2026-03-20",
    "valor": 8000.00
  }
]
```

**Validacoes:**
- [ ] Alerta `saldo_negativo` gerado quando saldo acumulado fica negativo
- [ ] Alerta `saldo_baixo` gerado quando saldo fica abaixo de `saldoMinimoAlerta` da configuracao
- [ ] Severidade `danger` para saldo negativo, `warning` para saldo baixo
- [ ] Alertas ordenados por data

---

## 3. Testes de Configuracao (GET / PUT)

### 3.1 GET Configuracao — Sem configuracao previa

**Endpoint:** `GET /api/fluxo-caixa/configuracao`

**Validacoes:**
- [ ] Retorna configuracao com valores padrao (defaults do backend)
- [ ] `diasProjecaoPadrao` default: 90
- [ ] `periodicidadePadrao` default: `mensal`
- [ ] `incluirAgreements`, `incluirTitulos`, `incluirRecorrentes` default: `true`
- [ ] `contasBancariasFiltro` default: `null`
- [ ] `coresConfiguracao` default: `null`

### 3.2 PUT Configuracao — Upsert

**Endpoint:** `PUT /api/fluxo-caixa/configuracao`

```json
{
  "saldoMinimoAlerta": 15000,
  "diasProjecaoPadrao": 120,
  "periodicidadePadrao": "semanal",
  "incluirAgreements": false,
  "incluirTitulos": true,
  "incluirRecorrentes": true,
  "contasBancariasFiltro": [1, 3],
  "coresConfiguracao": {
    "entrada": "#22c55e",
    "saida": "#ef4444",
    "saldo": "#3b82f6"
  }
}
```

**Validacoes:**
- [ ] Primeira chamada cria registro (upsert)
- [ ] Segunda chamada atualiza registro existente
- [ ] Retorna o objeto completo da configuracao atualizada
- [ ] `saldoMinimoAlerta` aceita apenas valores >= 0
- [ ] `diasProjecaoPadrao` aceita apenas valores entre 1 e 365
- [ ] `periodicidadePadrao` aceita apenas: `diario`, `semanal`, `mensal`, `safra`
- [ ] Configuracao e isolada por tenant (tenant A nao ve config de tenant B)

---

## 4. Testes de Simulacao (CRUD)

### 4.1 Criar Simulacao (somente cabecalho)

**Endpoint:** `POST /api/fluxo-caixa/simulacoes`

```json
{
  "nome": "Cenario Otimista",
  "descricao": "Simulacao com aumento de 20% nas vendas",
  "dataInicio": "2026-01-01",
  "dataFim": "2026-06-30"
}
```

**Validacoes:**
- [ ] Retorna simulacao criada com `status: rascunho`
- [ ] `nome` e obrigatorio (422 se vazio)
- [ ] `dataFim` deve ser posterior a `dataInicio` (422 se invalido)
- [ ] Simulacao criada pertence ao tenant do usuario autenticado

### 4.2 Criar Simulacao Completo (com itens)

**Endpoint:** `POST /api/fluxo-caixa/simulacoes/completo`

```json
{
  "nome": "Cenario Pessimista",
  "descricao": null,
  "dataInicio": "2026-01-01",
  "dataFim": "2026-06-30",
  "itens": [
    {
      "tipoOverride": "adicionar_saida",
      "descricao": "Custo extra com frete",
      "tipoFluxo": "saida",
      "dataNova": "2026-02-15",
      "valorNovo": 15000.00,
      "contaBancariaId": 1
    },
    {
      "tipoOverride": "adiar_pagamento",
      "referenciaTipo": "parcela_titulo_pagar",
      "referenciaId": 42,
      "descricao": "Adiar pagamento fornecedor",
      "tipoFluxo": "saida",
      "dataOriginal": "2026-03-01",
      "dataNova": "2026-04-01",
      "valorOriginal": 20000.00,
      "valorNovo": 20000.00
    }
  ]
}
```

**Validacoes:**
- [ ] Cria simulacao e todos os itens atomicamente (transacao)
- [ ] Retorna `FluxoCaixaSimulacaoDetailDto` com array `itens` populado
- [ ] Se um item falhar na validacao, nenhum registro e criado (rollback)
- [ ] `tipoOverride` aceita apenas valores validos do enum
- [ ] `tipoFluxo` aceita apenas `entrada` ou `saida`

### 4.3 Adicionar Item a Simulacao Existente

**Endpoint:** `POST /api/fluxo-caixa/simulacoes/:id/itens`

```json
{
  "tipoOverride": "adicionar_entrada",
  "descricao": "Venda extra de milho",
  "tipoFluxo": "entrada",
  "dataNova": "2026-04-10",
  "valorNovo": 45000.00,
  "contaBancariaId": 2
}
```

**Validacoes:**
- [ ] Item criado vinculado a simulacao correta
- [ ] Retorna o item criado com `id` e timestamps

### 4.4 Atualizar Item

**Endpoint:** `PUT /api/fluxo-caixa/simulacoes/:simulacaoId/itens/:itemId`

```json
{
  "valorNovo": 50000.00,
  "dataNova": "2026-04-15"
}
```

**Validacoes:**
- [ ] Atualiza apenas os campos enviados (partial update)
- [ ] Retorna item atualizado

### 4.5 Deletar Item

**Endpoint:** `DELETE /api/fluxo-caixa/simulacoes/:simulacaoId/itens/:itemId`

**Validacoes:**
- [ ] Retorna 204 No Content
- [ ] Item removido da simulacao

### 4.6 Calcular Resultado da Simulacao

**Endpoint:** `POST /api/fluxo-caixa/simulacoes/:id/calcular`

**Validacoes:**
- [ ] Retorna `FluxoCaixaConsolidadoDto` com overrides aplicados
- [ ] Itens do tipo `adiar_pagamento` alteram a data do lancamento original
- [ ] Itens do tipo `antecipar_recebimento` alteram a data do lancamento original
- [ ] Itens do tipo `adicionar_entrada` adicionam lancamento extra
- [ ] Itens do tipo `adicionar_saida` adicionam lancamento extra
- [ ] Itens do tipo `remover_lancamento` excluem lancamento da projecao
- [ ] Itens do tipo `alterar_valor` modificam valor do lancamento referenciado
- [ ] Saldos acumulados recalculados corretamente apos aplicacao dos overrides

### 4.7 Verificar Status Arquivado Bloqueia Edicao

**Passo 1:** Alterar status da simulacao para `arquivado` (via banco ou endpoint de update)

**Passo 2:** Tentar operacoes de escrita:

- `PUT /api/fluxo-caixa/simulacoes/:id` → esperado 400/422
- `POST /api/fluxo-caixa/simulacoes/:id/itens` → esperado 400/422
- `PUT /api/fluxo-caixa/simulacoes/:id/itens/:itemId` → esperado 400/422
- `DELETE /api/fluxo-caixa/simulacoes/:id/itens/:itemId` → esperado 400/422

**Validacoes:**
- [ ] Todas as operacoes de escrita retornam erro informando que simulacao esta arquivada
- [ ] `POST /api/fluxo-caixa/simulacoes/:id/calcular` DEVE funcionar (leitura)
- [ ] `DELETE /api/fluxo-caixa/simulacoes/:id` DEVE funcionar (permitido deletar arquivada)

### 4.8 Verificar Isolamento Cross-Tenant

**Passo 1:** Autenticar como usuario do Tenant A, criar simulacao (id=1)

**Passo 2:** Autenticar como usuario do Tenant B

**Validacoes:**
- [ ] `GET /api/fluxo-caixa/simulacoes/1` → retorna 403 Forbidden
- [ ] `PUT /api/fluxo-caixa/simulacoes/1` → retorna 403 Forbidden
- [ ] `DELETE /api/fluxo-caixa/simulacoes/1` → retorna 403 Forbidden
- [ ] `POST /api/fluxo-caixa/simulacoes/1/calcular` → retorna 403 Forbidden
- [ ] `GET /api/fluxo-caixa/simulacoes` → NAO retorna simulacoes do Tenant A

---

## 5. Testes de Autocomplete

### 5.1 Busca com Termo

**Endpoint:** `GET /api/fluxo-caixa/autocomplete-projetados`

```
GET /api/fluxo-caixa/autocomplete-projetados?dataInicio=2026-01-01&dataFim=2026-06-30&search=soja
```

**Validacoes:**
- [ ] Retorna array de `FluxoCaixaEntryDto[]`
- [ ] Resultados filtrados pelo termo `search` (busca em `descricao`)
- [ ] Limite maximo de 50 resultados
- [ ] Retorna apenas lancamentos projetados (nao realizados)
- [ ] Resposta contem campos: `tipoFluxo`, `origem`, `descricao`, `data`, `valor`

### 5.2 Busca sem Termo

```
GET /api/fluxo-caixa/autocomplete-projetados?dataInicio=2026-01-01&dataFim=2026-06-30
```

**Validacoes:**
- [ ] Retorna todos os lancamentos projetados (ate o limite de 50)
- [ ] Ordenados por data

### 5.3 Busca com Periodo Invalido

```
GET /api/fluxo-caixa/autocomplete-projetados?dataInicio=2026-06-30&dataFim=2026-01-01
```

**Validacoes:**
- [ ] Retorna 400 Bad Request ou array vazio (depende da implementacao)
