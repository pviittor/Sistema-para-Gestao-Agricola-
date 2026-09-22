# 📋 Levantamento de Requisitos — `ItemBaixaPedidoCompra`

> Template versão 1.0 — RuralIn (GMPR)

---

## 1. Identificação

| Campo | Resposta |
|-------|----------|
| Nome da tabela (plural, snake_case) | `itens_baixa_pedido_compra` |
| Nome singular (PascalCase) | `ItemBaixaPedidoCompra` |
| Descrição em uma linha | "Vínculo entre o item do pedido de compra e o item da nota fiscal na baixa" |
| Multi-tenant? | ✅ Sim |
| Auditar operações? | ✅ Sim |
| Usar cache? | ❌ Não |
| TTL do cache (segundos) | — |

---

## 2. Campos

> **Tipos disponíveis:** `STRING` · `TEXT` · `INTEGER` · `DECIMAL` · `DATE` · `DATEONLY` · `TIME` · `BOOLEAN` · `JSON`

| Campo (snake_case) | Tipo | Obrigatório | Único | Valor Padrão | Validações / Observações |
|--------------------|------|:-----------:|:-----:|:------------:|--------------------------|
| `baixa_pedido_compra_id` | INTEGER | ✅ | ❌ | — | FK → BaixaPedidoCompra |
| `item_pedido_compra_id` | INTEGER | ✅ | ❌ | — | FK → ItemPedidoCompra |
| `item_nota_fiscal_id` | INTEGER | ✅ | ❌ | — | FK → ItemNotaFiscal |
| `quantidade_baixada` | DECIMAL | ✅ | ❌ | — | Precisão 15,4; mín. 0.0001; quantidade efetivamente recebida nesta baixa |
| `vl_unitario_nf` | DECIMAL | ✅ | ❌ | — | Precisão 15,10; preço unitário conforme a NF |
| `vl_unitario_pedido` | DECIMAL | ✅ | ❌ | — | Precisão 15,10; preço unitário conforme o pedido (histórico) |
| `vl_divergencia` | DECIMAL | ✅ | ❌ | `0.00` | Precisão 15,2; diferença de valor: (vl_unitario_nf − vl_unitario_pedido) × quantidade_baixada |
| `divergencia_aprovada` | BOOLEAN | ✅ | ❌ | `false` | Se divergência de preço foi aceita pelo usuário |
| `observacoes` | TEXT | ❌ | ❌ | — | Observações específicas do item na baixa |

---

## 3. Relacionamentos

| Tipo | Entidade relacionada | Chave estrangeira | Obrigatório | onDelete |
|------|---------------------|:-----------------:|:-----------:|:--------:|
| `belongsTo` | `BaixaPedidoCompra` | `baixaPedidoCompraId` | ✅ | `CASCADE` |
| `belongsTo` | `ItemPedidoCompra` | `itemPedidoCompraId` | ✅ | `RESTRICT` |
| `belongsTo` | `ItemNotaFiscal` | `itemNotaFiscalId` | ✅ | `RESTRICT` |

---

## 4. Permissões

> Herdadas da `BaixaPedidoCompra`. Não há permissões independentes para este nível.

| Operação | Permissão |
|----------|-----------|
| Criar | `baixa_pedido_compra.create` |
| Ler | `baixa_pedido_compra.read` |
| Atualizar | `baixa_pedido_compra.create` |
| Deletar | `baixa_pedido_compra.create` |

---

## 5. Regras de Negócio

| # | Descrição | Onde validar |
|---|-----------|:------------:|
| 1 | `quantidade_baixada` não pode exceder `quantidade_pendente` do `ItemPedidoCompra` (+ tolerância do pedido) | `Service` |
| 2 | `item_nota_fiscal_id` deve pertencer à mesma `NotaFiscal` vinculada na `BaixaPedidoCompra` | `Service` |
| 3 | `item_pedido_compra_id` deve pertencer ao mesmo `PedidoCompra` vinculado na `BaixaPedidoCompra` | `Service` |
| 4 | O produto do `ItemNotaFiscal` deve ser o mesmo do `ItemPedidoCompra` | `Service` |
| 5 | `vl_divergencia` é calculado automaticamente; se ≠ 0, o campo `divergencia_aprovada` deve ser `true` para processar | `Service` |
| 6 | Ao salvar, registrar `vl_unitario_pedido` e `vl_unitario_nf` para rastreabilidade histórica, mesmo sem divergência | `Service` |
| 7 | Um mesmo `item_pedido_compra_id` pode aparecer em múltiplos `ItemBaixaPedidoCompra` (entregas parciais), desde que a soma não ultrapasse o limite | `Service` |
| 8 | Itens cancelados no pedido (`ItemPedidoCompra.status = cancelado`) não podem ser incluídos na baixa | `Service` |
| 9 | As baixas de pedido devem movimentar o movimento de estoque para a fazenda informada no cabeçalho | `Service` |
---

## 6. Consultas Especiais

| Método | Descrição | Parâmetros | Retorno |
|--------|-----------|------------|---------|
| `findByBaixa` | Lista todos os itens de uma baixa | `baixaPedidoCompraId: integer` | `ItemBaixaPedidoCompra[]` |
| `findByItemPedido` | Histórico de baixas de um item de pedido | `itemPedidoCompraId: integer` | `ItemBaixaPedidoCompra[]` |
| `totalBaixadoPorItemPedido` | Soma quantidade_baixada agrupado por item de pedido | `pedidoCompraId: integer` | `{ itemPedidoCompraId, totalBaixado }[]` |

---

## 7. Chaves de Cache

> Cache desabilitado. Usar cache no nível da `BaixaPedidoCompra`.

---

## 8. Observações e Pendências

```
- Este é o elo de rastreabilidade entre "o que foi pedido" e "o que entrou na NF",
  permitindo auditoria completa de cada recebimento.
- Divergências de preço devem ser exibidas na tela de confirmação da baixa antes do processamento,
  permitindo ao usuário aprovar ou corrigir antes de prosseguir.
- Para entradas com controle de lote/série, o numero_lote e numero_serie_item serão registrados
  no ItemNotaFiscal; este entity apenas referencia o item já criado.
```
