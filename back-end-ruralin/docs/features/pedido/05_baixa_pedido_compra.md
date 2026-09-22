# 📋 Levantamento de Requisitos — `BaixaPedidoCompra`

> Template versão 1.0 — RuralIn (GMPR)

---

## 1. Identificação

| Campo | Resposta |
|-------|----------|
| Nome da tabela (plural, snake_case) | `baixas_pedido_compra` |
| Nome singular (PascalCase) | `BaixaPedidoCompra` |
| Descrição em uma linha | "Registro de baixa de pedido de compra via nota fiscal, controlando estoque e contas a pagar" |
| Multi-tenant? | ✅ Sim |
| Auditar operações? | ✅ Sim |
| Usar cache? | ✅ Sim |
| TTL do cache (segundos) | `120` |

---

## 2. Campos

> **Tipos disponíveis:** `STRING` · `TEXT` · `INTEGER` · `DECIMAL` · `DATE` · `DATEONLY` · `TIME` · `BOOLEAN` · `JSON`

| Campo (snake_case) | Tipo | Obrigatório | Único | Valor Padrão | Validações / Observações |
|--------------------|------|:-----------:|:-----:|:------------:|--------------------------|
| `empresa_id` | INTEGER | ✅ | ❌ | — | FK → Empresa (tenant) |
| `nota_fiscal_id` | INTEGER | ✅ | ❌ | — | FK → NotaFiscal; deve ser do tipo `entrada` |
| `pedido_compra_id` | INTEGER | ✅ | ❌ | — | FK → PedidoCompra; deve estar aprovado |
| `usuario_id` | INTEGER | ✅ | ❌ | — | FK → Usuário que realizou a baixa |
| `status` | STRING | ✅ | ❌ | `pendente` | Enum: `pendente`, `processada`, `cancelada` |
| `data_baixa` | DATEONLY | ✅ | ❌ | — | Data em que a baixa foi realizada |
| `gerar_financeiro` | BOOLEAN | ✅ | ❌ | `true` | Se deve gerar títulos em Contas a Pagar |
| `financeiro_gerado` | BOOLEAN | ✅ | ❌ | `false` | Indica se os títulos já foram gerados |
| `movimentar_estoque` | BOOLEAN | ✅ | ❌ | `true` | Se deve movimentar estoque no processamento |
| `estoque_movimentado` | BOOLEAN | ✅ | ❌ | `false` | Indica se estoque já foi movimentado |
| `importacao_xml` | BOOLEAN | ✅ | ❌ | `false` | Indica se a NF foi importada via XML da SEFAZ |
| `chave_acesso_xml` | STRING | ❌ | ❌ | — | Chave de acesso NF-e quando importada via XML; 44 dígitos |
| `observacoes` | TEXT | ❌ | ❌ | — | Observações internas sobre a baixa |
| `data_processamento` | DATE | ❌ | ❌ | — | Timestamp do processamento efetivo |
| `motivo_cancelamento` | TEXT | ❌ | ❌ | — | Obrigatório se status = cancelada |
| `data_cancelamento` | DATE | ❌ | ❌ | — | Preenchido automaticamente ao cancelar |

---

## 3. Relacionamentos

| Tipo | Entidade relacionada | Chave estrangeira | Obrigatório | onDelete |
|------|---------------------|:-----------------:|:-----------:|:--------:|
| `belongsTo` | `Empresa` | `empresaId` | ✅ | `RESTRICT` |
| `belongsTo` | `NotaFiscal` | `notaFiscalId` | ✅ | `RESTRICT` |
| `belongsTo` | `PedidoCompra` | `pedidoCompraId` | ✅ | `RESTRICT` |
| `belongsTo` | `Usuario` | `usuarioId` | ✅ | `RESTRICT` |
| `hasMany` | `ItemBaixaPedidoCompra` | `baixaPedidoCompraId` | — | `CASCADE` |

---

## 4. Permissões

| Operação | Permissão |
|----------|-----------|
| Criar | `baixa_pedido_compra.create` |
| Ler | `baixa_pedido_compra.read` |
| Processar | `baixa_pedido_compra.process` |
| Cancelar | `baixa_pedido_compra.cancel` |
| Importar XML | `baixa_pedido_compra.import_xml` |

---

## 5. Regras de Negócio

| # | Descrição | Onde validar |
|---|-----------|:------------:|
| 1 | `nota_fiscal_id` deve referenciar uma NF do tipo `entrada` | `DTO` + `Service` |
| 2 | `pedido_compra_id` deve referenciar um pedido com status `aprovado`, `parcialmente_atendido` | `Service` |
| 3 | O fornecedor da NF (`emitente_id`) deve ser o mesmo do PedidoCompra (`fornecedor_id`) | `Service` |
| 4 | Uma mesma NF pode ter múltiplas `BaixaPedidoCompra` (um NF baixando vários pedidos) | `Service` |
| 5 | Um mesmo pedido pode ter múltiplas `BaixaPedidoCompra` (entregas parciais em várias NFs) | `Service` |
| 6 | Não é permitido criar baixa duplicada: mesma NF + mesmo pedido só pode existir uma vez | `Repository` |
| 7 | Ao processar, validar se a quantidade total de cada `ItemBaixaPedidoCompra` não ultrapassa a quantidade_pendente do `ItemPedidoCompra` (respeitando tolerância) | `Service` |
| 8 | `estoque_movimentado = true` bloqueia reprocessamento de estoque; só estorno permite corrigir | `Service` |
| 9 | `financeiro_gerado = true` bloqueia reprocessamento financeiro; só estorno permite corrigir | `Service` |
| 10 | Ao cancelar, estornar automaticamente os `movimentoEstoque` e `titulosPagar` gerados | `Service` |
| 11 | Cancelamento só é permitido enquanto a NF vinculada não estiver `autorizada` pela SEFAZ, salvo permissão especial | `Service` |
| 12 | Ao processar com `movimentar_estoque = true`, delegar a geração de `movimentoEstoque` ao `ItemNotaFiscal` via `EstoqueService` | `Service` |
| 13 | Ao processar com `gerar_financeiro = true`, gerar `tituloPagar` vinculado à NF conforme condição de pagamento do pedido | `Service` |
| 14 | Após processamento bem-sucedido, atualizar `quantidade_atendida` de cada `ItemPedidoCompra` e recalcular status do `PedidoCompra` | `Service` |
| 15 | Importação via XML deve preencher automaticamente os campos da `NotaFiscal` com os dados do XML; usuário confirma antes de processar | `Service` |

---

## 6. Consultas Especiais

| Método | Descrição | Parâmetros | Retorno |
|--------|-----------|------------|---------|
| `findByNotaFiscal` | Lista todas as baixas de uma NF | `notaFiscalId: integer` | `BaixaPedidoCompra[]` |
| `findByPedidoCompra` | Lista todas as baixas de um pedido | `pedidoCompraId: integer` | `BaixaPedidoCompra[]` |
| `findByFornecedor` | Lista baixas por fornecedor e período | `fornecedorId: integer, dataInicio: date, dataFim: date` | `BaixaPedidoCompra[]` |
| `findPendentes` | Baixas criadas mas ainda não processadas | `empresaId: integer` | `BaixaPedidoCompra[]` |
| `findByPeriodo` | Lista baixas por período de data_baixa | `dataInicio: date, dataFim: date, status?: string` | `BaixaPedidoCompra[]` |

---

## 7. Chaves de Cache

| Chave |
|-------|
| `baixa_pedido_compra:list:empresa:{id}:*` |
| `baixa_pedido_compra:findByPedido:{pedidoCompraId}` |
| `baixa_pedido_compra:findByNota:{notaFiscalId}` |
| `baixa_pedido_compra:id:{id}` |

---

## 8. Observações e Pendências

```
- O processamento da baixa deve ocorrer dentro de uma única transação de banco de dados,
  garantindo atomicidade entre: atualização de ItemPedidoCompra, movimentoEstoque e tituloPagar.
- Importação via XML NF-e deve invocar SefazService para validar a chave de acesso antes de
  persistir a NotaFiscal, evitando duplicidade.
- Quando uma NF baixa múltiplos pedidos, cada BaixaPedidoCompra é processada individualmente;
  o financeiro (tituloPagar) é gerado uma vez por NF, não por pedido.
- Avaliar notificação automática ao comprador quando um pedido for totalmente atendido.
- Divergência de preço (vl_unitario da NF diferente do pedido) deve gerar alerta ao usuário
  antes de confirmar; bloquear ou permitir conforme configuração da empresa.
- Rastrear volumes (embalagens) informados no momento da baixa para conferência física;
  considerar tabela VolumeBaixa.
```
