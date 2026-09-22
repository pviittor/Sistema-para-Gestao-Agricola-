# 📋 Levantamento de Requisitos — `ItemPedidoCompra`

> Template versão 1.0 — RuralIn (GMPR)

---

## 1. Identificação

| Campo | Resposta |
|-------|----------|
| Nome da tabela (plural, snake_case) | `itens_pedido_compra` |
| Nome singular (PascalCase) | `ItemPedidoCompra` |
| Descrição em uma linha | "Itens (solicitações de produtos/serviços) de um pedido de compra" |
| Multi-tenant? | ✅ Sim |
| Auditar operações? | ✅ Sim |
| Usar cache? | ❌ Não |
| TTL do cache (segundos) | — |

---

## 2. Campos

> **Tipos disponíveis:** `STRING` · `TEXT` · `INTEGER` · `DECIMAL` · `DATE` · `DATEONLY` · `TIME` · `BOOLEAN` · `JSON`

| Campo (snake_case) | Tipo | Obrigatório | Único | Valor Padrão | Validações / Observações |
|--------------------|------|:-----------:|:-----:|:------------:|--------------------------|
| `pedido_compra_id` | INTEGER | ✅ | ❌ | — | FK → PedidoCompra |
| `produto_id` | INTEGER | ✅ | ❌ | — | FK → Produto; produto deve estar ativo |
| `numero_item` | INTEGER | ✅ | ❌ | — | Sequencial dentro do pedido; mín. 1 |
| `codigo_produto` | STRING | ✅ | ❌ | — | Código do produto no momento da emissão (desnormalizado) |
| `descricao` | STRING | ✅ | ❌ | — | Descrição do produto no momento da emissão; máx. 120 |
| `ncm` | STRING | ❌ | ❌ | — | 8 dígitos; copiado do cadastro do produto |
| `cfop` | STRING | ❌ | ❌ | — | 4 dígitos; herdado do pedido, pode ser sobrescrito por item |
| `unidade` | STRING | ✅ | ❌ | — | Ex: `UN`, `KG`, `CX`, `LT`; máx. 6 |
| `quantidade_solicitada` | DECIMAL | ✅ | ❌ | — | Precisão 15,4; mín. 0.0001 |
| `quantidade_atendida` | DECIMAL | ✅ | ❌ | `0.0000` | Precisão 15,4; mín. 0; atualizado a cada baixa |
| `quantidade_pendente` | DECIMAL | ✅ | ❌ | — | Precisão 15,4; calculado: quantidade_solicitada − quantidade_atendida |
| `vl_unitario` | DECIMAL | ✅ | ❌ | — | Precisão 15,10; mín. 0; preço negociado com fornecedor |
| `vl_desconto` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2; mín. 0; não pode exceder vl_bruto |
| `vl_bruto` | DECIMAL | ✅ | ❌ | — | Precisão 15,2; calculado: quantidade_solicitada × vl_unitario |
| `vl_total` | DECIMAL | ✅ | ❌ | — | Precisão 15,2; vl_bruto − vl_desconto |
| `data_previsao_entrega` | DATEONLY | ❌ | ❌ | — | Previsão específica do item; sobrepõe a do cabeçalho |
| `deposito_destino_id` | INTEGER | ❌ | ❌ | — | FK → Deposito de destino do item; sobrepõe o do cabeçalho |
| `status` | STRING | ✅ | ❌ | `pendente` | Enum: `pendente`, `parcialmente_atendido`, `atendido`, `cancelado` |
| `numero_lote_esperado` | STRING | ❌ | ❌ | — | Lote esperado do fornecedor (rastreabilidade) |
| `observacoes` | TEXT | ❌ | ❌ | — | Observações específicas do item |

---

## 3. Relacionamentos

| Tipo | Entidade relacionada | Chave estrangeira | Obrigatório | onDelete |
|------|---------------------|:-----------------:|:-----------:|:--------:|
| `belongsTo` | `PedidoCompra` | `pedidoCompraId` | ✅ | `CASCADE` |
| `belongsTo` | `Produto` | `produtoId` | ✅ | `RESTRICT` |
| `belongsTo` | `Deposito` | `depositoDestinoId` | ❌ | `SET NULL` |
| `hasMany` | `ItemBaixaPedidoCompra` | `itemPedidoCompraId` | — | `RESTRICT` |

---

## 4. Permissões

| Operação | Permissão |
|----------|-----------|
| Criar | `item_pedido_compra.create` |
| Ler | `item_pedido_compra.read` |
| Atualizar | `item_pedido_compra.update` |
| Deletar | `item_pedido_compra.delete` |

---

## 5. Regras de Negócio

| # | Descrição | Onde validar |
|---|-----------|:------------:|
| 1 | `vl_bruto` = `quantidade_solicitada` × `vl_unitario`; calculado automaticamente | `Service` |
| 2 | `vl_total` = `vl_bruto` − `vl_desconto`; calculado automaticamente | `Service` |
| 3 | `vl_desconto` não pode ser maior que `vl_bruto` | `DTO` + `Service` |
| 4 | `numero_item` deve ser sequencial e único dentro do pedido | `Service` |
| 5 | Itens só podem ser adicionados/editados/removidos enquanto o pedido está com `status = rascunho` | `Service` |
| 6 | Ao salvar um item, recalcular os totais do cabeçalho do `PedidoCompra` | `Service` |
| 7 | `quantidade_pendente` = `quantidade_solicitada` − `quantidade_atendida`; nunca pode ser negativo | `Service` |
| 8 | `status = atendido` quando `quantidade_atendida` ≥ `quantidade_solicitada` (respeitando tolerância do pedido) | `Service` |
| 9 | `status = parcialmente_atendido` quando `quantidade_atendida` > 0 e item ainda não atendido totalmente | `Service` |
| 10 | Item cancelado não pode ser baixado | `Service` |
| 11 | `data_previsao_entrega` do item, quando informada, deve ser ≥ `data_emissao` do pedido | `DTO` |

---

## 6. Consultas Especiais

| Método | Descrição | Parâmetros | Retorno |
|--------|-----------|------------|---------|
| `findByPedidoCompra` | Lista todos os itens de um pedido | `pedidoCompraId: integer` | `ItemPedidoCompra[]` |
| `findPendentesByPedido` | Lista itens pendentes ou parciais de um pedido | `pedidoCompraId: integer` | `ItemPedidoCompra[]` |
| `findByProduto` | Histórico de compras de um produto | `produtoId: integer, dataInicio?: date, dataFim?: date` | `ItemPedidoCompra[]` |
| `totalCompradoPorProduto` | Consolida quantidade e valor comprado por produto | `produtoId: integer, dataInicio: date, dataFim: date` | `{ qtd, vlTotal, qtdAtendida }` |

---

## 7. Chaves de Cache

> Cache desabilitado para itens. Usar cache somente no nível do PedidoCompra.

---

## 8. Observações e Pendências

```
- Em um fluxo multi-entrega (várias NFs para o mesmo pedido), o campo quantidade_atendida
  é incrementado a cada BaixaPedidoCompra processada com sucesso.
- Considerar campo vl_unitario_ultima_compra no cadastro do Produto para sugerir preço
  automaticamente na criação de novos pedidos.
- Para produtos com controle de lote, o lote real recebido será registrado no ItemNotaFiscal;
  numero_lote_esperado serve apenas como referência ao fornecedor.
```
