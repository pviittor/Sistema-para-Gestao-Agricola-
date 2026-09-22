# 📋 Levantamento de Requisitos — `PedidoCompra`

> Template versão 1.0 — RuralIn (GMPR)

---

## 1. Identificação

| Campo | Resposta |
|-------|----------|
| Nome da tabela (plural, snake_case) | `pedidos_compra` |
| Nome singular (PascalCase) | `PedidoCompra` |
| Descrição em uma linha | "Cabeçalho de pedidos de compra emitidos para fornecedores" |
| Multi-tenant? | ✅ Sim |
| Auditar operações? | ✅ Sim |
| Usar cache? | ✅ Sim |
| TTL do cache (segundos) | `300` |

---

## 2. Campos

> **Tipos disponíveis:** `STRING` · `TEXT` · `INTEGER` · `DECIMAL` · `DATE` · `DATEONLY` · `TIME` · `BOOLEAN` · `JSON`

| Campo (snake_case) | Tipo | Obrigatório | Único | Valor Padrão | Validações / Observações |
|--------------------|------|:-----------:|:-----:|:------------:|--------------------------|
| `numero` | STRING | ✅ | ❌ | — | Auto-gerado; único por empresa; máx. 9 dígitos |
| `empresa_id` | INTEGER | ✅ | ❌ | — | FK → Empresa (tenant) |
| `fornecedor_id` | INTEGER | ✅ | ❌ | — | FK → Pessoa; deve ser fornecedor ativo |
| `comprador_id` | INTEGER | ❌ | ❌ | — | FK → Usuário responsável pela compra |
| `status` | STRING | ✅ | ❌ | `rascunho` | Enum: `rascunho`, `aguardando_aprovacao`, `aprovado`, `parcialmente_atendido`, `atendido`, `cancelado` |
| `data_emissao` | DATEONLY | ✅ | ❌ | — | Data de emissão do pedido |
| `data_previsao_entrega` | DATEONLY | ❌ | ❌ | — | Previsão de entrega acordada com fornecedor |
| `data_aprovacao` | DATEONLY | ❌ | ❌ | — | Preenchido automaticamente na aprovação |
| `aprovado_por_id` | INTEGER | ❌ | ❌ | — | FK → Usuário que aprovou |
| `condicao_pagamento_id` | INTEGER | ❌ | ❌ | — | FK → CondicaoPagamento |
| `forma_pagamento` | STRING | ❌ | ❌ | — | Enum: `boleto`, `transferencia`, `cheque`, `cartao`, `dinheiro`, `pix` |
| `prazo_pagamento_dias` | INTEGER | ❌ | ❌ | — | Prazo em dias; mín. 0 |
| `local_entrega_id` | INTEGER | ❌ | ❌ | — | FK → Endereco/Deposito de destino |
| `cfop` | STRING | ❌ | ❌ | — | 4 dígitos; default do perfil de compra |
| `vl_produtos` | DECIMAL | ✅ | ❌ | `0.00` | Precisão 15,2; soma dos itens |
| `vl_frete` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2; mín. 0 |
| `vl_seguro` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2; mín. 0 |
| `vl_desconto` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2; mín. 0; não pode exceder vl_produtos |
| `vl_outros` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2; mín. 0 |
| `vl_total` | DECIMAL | ✅ | ❌ | `0.00` | Precisão 15,2; calculado automaticamente |
| `percentual_tolerancia` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 5,2; % de variação permitida na baixa (ex: 5%) |
| `permite_entrega_parcial` | BOOLEAN | ✅ | ❌ | `true` | Se permite receber apenas parte dos itens |
| `observacoes` | TEXT | ❌ | ❌ | — | Observações internas |
| `observacoes_fornecedor` | TEXT | ❌ | ❌ | — | Texto para o fornecedor (impresso no pedido) |
| `motivo_cancelamento` | TEXT | ❌ | ❌ | — | Obrigatório se status = cancelado |
| `data_cancelamento` | DATEONLY | ❌ | ❌ | — | Preenchido automaticamente ao cancelar |
| `ativo` | BOOLEAN | ✅ | ❌ | `true` | Soft delete |

---

## 3. Relacionamentos

| Tipo | Entidade relacionada | Chave estrangeira | Obrigatório | onDelete |
|------|---------------------|:-----------------:|:-----------:|:--------:|
| `belongsTo` | `Empresa` | `empresaId` | ✅ | `RESTRICT` |
| `belongsTo` | `Pessoa` (fornecedor) | `fornecedorId` | ✅ | `RESTRICT` |
| `belongsTo` | `Usuario` (comprador) | `compradorId` | ❌ | `SET NULL` |
| `belongsTo` | `Usuario` (aprovador) | `aprovadoPorId` | ❌ | `SET NULL` |
| `belongsTo` | `CondicaoPagamento` | `condicaoPagamentoId` | ❌ | `SET NULL` |
| `hasMany` | `ItemPedidoCompra` | `pedidoCompraId` | — | `CASCADE` |
| `hasMany` | `BaixaPedidoCompra` | `pedidoCompraId` | — | `RESTRICT` |

---

## 4. Permissões

| Operação | Permissão |
|----------|-----------|
| Criar | `pedido_compra.create` |
| Ler | `pedido_compra.read` |
| Atualizar | `pedido_compra.update` |
| Deletar | `pedido_compra.delete` |
| Aprovar | `pedido_compra.approve` |
| Cancelar | `pedido_compra.cancel` |
| Dar baixa | `pedido_compra.baixa` |

---

## 5. Regras de Negócio

| # | Descrição | Onde validar |
|---|-----------|:------------:|
| 1 | `vl_total` = `vl_produtos` + `vl_frete` + `vl_seguro` + `vl_outros` − `vl_desconto` | `Service` |
| 2 | `vl_desconto` não pode exceder `vl_produtos` | `DTO` + `Service` |
| 3 | Pedido aprovado não pode ser editado; apenas cancelado | `Service` |
| 4 | Pedido com status `atendido` ou `cancelado` não pode voltar para outro status | `Service` |
| 5 | Número do pedido é gerado automaticamente e sequencial por empresa | `Service` |
| 6 | Pedido deve ter ao menos um item para ser aprovado | `Service` |
| 7 | `data_previsao_entrega` deve ser ≥ `data_emissao` | `DTO` |
| 8 | `fornecedor_id` deve referenciar uma Pessoa ativa com papel de fornecedor | `Service` |
| 9 | Ao cancelar, se houver baixas em andamento (`BaixaPedidoCompra` com status `pendente`), bloquear cancelamento | `Service` |
| 10 | Status `atendido` é definido automaticamente quando todas as solicitações atingem quantidade_atendida ≥ quantidade_solicitada | `Service` |
| 11 | Status `parcialmente_atendido` é definido quando ao menos um item tiver quantidade_atendida > 0 mas pedido ainda não totalmente atendido | `Service` |

---

## 6. Consultas Especiais

| Método | Descrição | Parâmetros | Retorno |
|--------|-----------|------------|---------|
| `findByFornecedor` | Lista pedidos por fornecedor | `fornecedorId: integer, status?: string` | `PedidoCompra[]` |
| `findByPeriodo` | Lista pedidos por período de emissão | `dataInicio: date, dataFim: date, status?: string` | `PedidoCompra[]` |
| `findPendentesEntrega` | Pedidos aprovados com entrega pendente ou parcial | `dataPrevisaoAte?: date` | `PedidoCompra[]` |
| `findByNumero` | Busca pedido pelo número | `numero: string, empresaId: integer` | `PedidoCompra` |
| `totalPorPeriodo` | Soma de totais agrupados por fornecedor/período | `dataInicio: date, dataFim: date` | `{ fornecedorId, total, qtd }[]` |

---

## 7. Chaves de Cache

| Chave |
|-------|
| `pedido_compra:list:empresa:{id}:*` |
| `pedido_compra:findByFornecedor:{fornecedorId}:*` |
| `pedido_compra:findPendentesEntrega:{empresaId}` |
| `pedido_compra:id:{id}` |

---

## 8. Observações e Pendências

```
- O fluxo de aprovação pode ser multi-nível no futuro; atualmente modelado com aprovação simples.
- Cotação de compra (antecedente ao pedido) pode ser entidade separada; avaliar CotacaoCompra → PedidoCompra.
- Contratos de fornecimento com preços fixados devem ser vinculados ao pedido no futuro.
- Impressão/exportação do pedido em PDF deve ser tratada em serviço dedicado (DocumentoService).
- O campo percentual_tolerancia permite que a quantidade recebida na NF divirja da pedida dentro
  de um percentual aceitável sem bloquear a baixa.
```
