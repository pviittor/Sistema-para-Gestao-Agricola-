# 📝 Atualização necessária — `ItemNotaFiscal`

> Campos adicionais a incluir na migration existente de `itens_nota_fiscal`
> para suportar a rastreabilidade da Baixa de Pedido de Compra.

---

## Campos a adicionar na tabela `itens_nota_fiscal`

| Campo (snake_case) | Tipo | Obrigatório | Valor Padrão | Observação |
|--------------------|------|:-----------:|:------------:|------------|
| `item_pedido_compra_id` | INTEGER | ❌ | `NULL` | FK → ItemPedidoCompra; preenchido quando o item da NF origina-se de uma baixa de pedido |

### Relacionamento adicional no Model `ItemNotaFiscal`

```
belongsTo → ItemPedidoCompra
  foreignKey: itemPedidoCompraId
  required: false
  onDelete: SET NULL
```

---

## Impacto

- A presença de `item_pedido_compra_id` indica que o item entrou via processo de Baixa de Pedido de Compra.
- Quando nulo, o item foi lançado manualmente (entrada avulsa).
- Permite rastrear, a partir de um `ItemNotaFiscal`, de qual pedido e solicitação ele se originou.
- O preenchimento é automático, realizado pelo `BaixaPedidoCompraService` durante o processamento.

---

## Migration

Criar migration incremental:

```
{timestamp}-add-item-pedido-compra-id-to-itens-nota-fiscal.ts
```

Operação: `addColumn` com `allowNull: true`, `defaultValue: null`, índice simples (não único).
