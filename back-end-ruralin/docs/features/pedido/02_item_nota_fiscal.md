# 📋 Levantamento de Requisitos — `ItemNotaFiscal`

> Template versão 1.0 — RuralIn (GMPR)

---

## 1. Identificação

| Campo | Resposta |
|-------|----------|
| Nome da tabela (plural, snake_case) | `itens_nota_fiscal` |
| Nome singular (PascalCase) | `ItemNotaFiscal` |
| Descrição em uma linha | "Itens (produtos/serviços) vinculados a uma nota fiscal" |
| Multi-tenant? | ✅ Sim |
| Auditar operações? | ✅ Sim |
| Usar cache? | ❌ Não |
| TTL do cache (segundos) | — |

---

## 2. Campos

> **Tipos disponíveis:** `STRING` · `TEXT` · `INTEGER` · `DECIMAL` · `DATE` · `DATEONLY` · `TIME` · `BOOLEAN` · `JSON`

| Campo (snake_case) | Tipo | Obrigatório | Único | Valor Padrão | Validações / Observações |
|--------------------|------|:-----------:|:-----:|:------------:|--------------------------|
| `nota_fiscal_id` | INTEGER | ✅ | ❌ | — | FK → NotaFiscal |
| `produto_id` | INTEGER | ✅ | ❌ | — | FK → Produto; produto deve estar ativo |
| `numero_item` | INTEGER | ✅ | ❌ | — | Sequencial dentro da nota; mín. 1, máx. 990 |
| `codigo_produto` | STRING | ✅ | ❌ | — | Código do produto no momento da emissão (desnormalizado) |
| `descricao` | STRING | ✅ | ❌ | — | Descrição do produto no momento da emissão; máx. 120 |
| `ncm` | STRING | ✅ | ❌ | — | 8 dígitos; validar tabela NCM |
| `cest` | STRING | ❌ | ❌ | — | 7 dígitos; obrigatório quando há ST |
| `cfop` | STRING | ✅ | ❌ | — | 4 dígitos; herdado da nota, pode ser sobrescrito por item |
| `unidade` | STRING | ✅ | ❌ | — | Ex: `UN`, `KG`, `CX`, `LT`; máx. 6 |
| `quantidade` | DECIMAL | ✅ | ❌ | — | Precisão 15,4; mín. 0.0001 |
| `vl_unitario` | DECIMAL | ✅ | ❌ | — | Precisão 15,10; mín. 0 |
| `vl_desconto` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2; mín. 0; não pode exceder vl_bruto |
| `vl_frete` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2; mín. 0 |
| `vl_seguro` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2; mín. 0 |
| `vl_outros` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2; mín. 0 |
| `vl_bruto` | DECIMAL | ✅ | ❌ | — | Precisão 15,2; calculado: quantidade × vl_unitario |
| `vl_total` | DECIMAL | ✅ | ❌ | — | Precisão 15,2; vl_bruto − vl_desconto + vl_frete + vl_seguro + vl_outros |
| `cst_icms` | STRING | ✅ | ❌ | — | Código CST/CSOSN do ICMS (2-3 dígitos) |
| `modalidade_bc_icms` | STRING | ❌ | ❌ | — | Enum: `0`(MVA), `1`(pauta), `2`(preço tabelado), `3`(valor operação) |
| `aliq_icms` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 5,2; 0 a 100 |
| `vl_bc_icms` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2 |
| `vl_icms` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2 |
| `aliq_icms_st` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 5,2; substituição tributária |
| `vl_bc_icms_st` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2 |
| `vl_icms_st` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2 |
| `cst_ipi` | STRING | ❌ | ❌ | — | Código CST do IPI (2 dígitos) |
| `aliq_ipi` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 5,2 |
| `vl_ipi` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2 |
| `cst_pis` | STRING | ✅ | ❌ | — | Código CST do PIS (2 dígitos) |
| `aliq_pis` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 5,2 |
| `vl_pis` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2 |
| `cst_cofins` | STRING | ✅ | ❌ | — | Código CST do COFINS (2 dígitos) |
| `aliq_cofins` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 5,2 |
| `vl_cofins` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2 |
| `numero_lote` | STRING | ❌ | ❌ | — | Rastreabilidade de lote do produto |
| `data_fabricacao` | DATEONLY | ❌ | ❌ | — | Para produtos com controle de validade |
| `data_validade` | DATEONLY | ❌ | ❌ | — | Para produtos com controle de validade |
| `numero_serie_item` | STRING | ❌ | ❌ | — | Número de série para produtos serializados |
| `informacoes_adicionais` | TEXT | ❌ | ❌ | — | Observações específicas do item |
| `movimentou_estoque` | BOOLEAN | ✅ | ❌ | `false` | Controle individual de movimentação |

---

## 3. Relacionamentos

| Tipo | Entidade relacionada | Chave estrangeira | Obrigatório | onDelete |
|------|---------------------|:-----------------:|:-----------:|:--------:|
| `belongsTo` | `NotaFiscal` | `notaFiscalId` | ✅ | `CASCADE` |
| `belongsTo` | `Produto` | `produtoId` | ✅ | `RESTRICT` |
| `hasMany` | `movimentoEstoque` | `itemNotaFiscalId` | — | `RESTRICT` |

---

## 4. Permissões

| Operação | Permissão |
|----------|-----------|
| Criar | `item_nota_fiscal.create` |
| Ler | `item_nota_fiscal.read` |
| Atualizar | `item_nota_fiscal.update` |
| Deletar | `item_nota_fiscal.delete` |

---

## 5. Regras de Negócio

| # | Descrição | Onde validar |
|---|-----------|:------------:|
| 1 | `vl_bruto` = `quantidade` × `vl_unitario`; calculado automaticamente | `Service` |
| 2 | `vl_total` = `vl_bruto` − `vl_desconto` + `vl_frete` + `vl_seguro` + `vl_outros`; calculado automaticamente | `Service` |
| 3 | `vl_desconto` do item não pode ser maior que `vl_bruto` | `DTO` + `Service` |
| 4 | `numero_item` deve ser sequencial e único dentro da nota (1, 2, 3…) | `Service` |
| 5 | Itens só podem ser adicionados/editados/removidos enquanto a nota está com `status = rascunho` ou `pendente` | `Service` |
| 6 | Ao salvar um item, recalcular os totais do cabeçalho da NotaFiscal | `Service` |
| 7 | Se produto possui controle de lote, `numero_lote` é obrigatório | `Service` |
| 8 | Se produto possui controle de validade, `data_validade` é obrigatória e deve ser futura (para saída) | `Service` |
| 9 | Se produto possui controle de série, `numero_serie_item` é obrigatório e único por produto no estoque | `Service` |
| 10 | `data_validade` deve ser posterior a `data_fabricacao` quando ambas informadas | `DTO` |
| 11 | NCM do item deve corresponder ao cadastro do produto; alertar divergência | `Service` |
| 12 | Validar o saldo do produto para a saida em 'validaSaldoDisponivel' ou 'produtoDisponivel', movimentar saida de estoque disponivel e fisico | `Service` |
| 13 | Para entrada de produtos, gerar o 'movimentoEstoque' criando estoque do tipo disponivel e fisico | `Service` |
| 14 | `vl_total_custo` = `quantidade` × `vl_unitario_custo`; calculado automaticamente | `Service` |
| 15 | Movimentações geradas por nota fiscal são imutáveis; só podem ser estornadas | `Service` |
| 16 | Estorno gera nova movimentação inversa; nunca deleta a original | `Service` |
| 17 | Saldo após movimentação de saída não pode ficar negativo (salvo configuração específica do produto) | `Service` |
| 18 | Custo médio ponderado é recalculado apenas em entradas; saídas utilizam o CMV vigente | `Service` |
| 19 | `saldo_anterior` e `saldo_posterior` são calculados no momento da movimentação com lock de linha (transação atômica) | `Service` + `Repository` |
| 20 | `tipo_operacao = transferencia_*` deve gerar dois registros: uma saída do depósito origem e uma entrada no depósito destino | `Service` |
| 21 | Ajuste manual exige `motivo_ajuste` preenchido e permissão especial | `Service` |
| 22 | Movimentação de inventário pode zerar e recompor o saldo; requer aprovação | `Service` |
| 23 | Produto com controle de lote: `numero_lote` é obrigatório; saldo é controlado por lote | `Service` |
| 24 | Movimentação de nota cancelada deve ser estornada automaticamente | `Service` |

---

## 6. Consultas Especiais

| Método | Descrição | Parâmetros | Retorno |
|--------|-----------|------------|---------|
| `findByNotaFiscal` | Lista todos os itens de uma nota | `notaFiscalId: integer` | `ItemNotaFiscal[]` |
| `findByProduto` | Busca histórico de movimentação de produto em notas | `produtoId: integer, dataInicio?: date, dataFim?: date` | `ItemNotaFiscal[]` |
| `findByLote` | Rastreabilidade por número de lote | `numeroLote: string, produtoId?: integer` | `ItemNotaFiscal[]` |
| `findByNumeroserie` | Rastreabilidade por número de série | `numeroSerie: string` | `ItemNotaFiscal` |
| `totalVendidoPorProduto` | Consolida quantidade e valor vendido por produto | `produtoId: integer, dataInicio: date, dataFim: date` | `{ qtd, vlTotal }` |

---

## 7. Chaves de Cache

> Cache desabilitado para itens. Usar cache somente no nível da NotaFiscal.

---

## 8. Observações e Pendências

```
- Os campos de tributos (ICMS, IPI, PIS, COFINS) devem ser preenchidos automaticamente
  pelo TributacaoService com base no cadastro fiscal do produto, CFOP e perfil da empresa/operação.
- Para emissão de NF-e, todos os campos tributários são obrigatórios conforme layout SEFAZ;
  considerar validação mais rígida no momento da transmissão vs. no rascunho.
- DECISÃO PENDENTE: separar cálculo de tributos em tabela própria
  (ItemTributo) para suportar tributos adicionais (FCP, DIFAL, ICMS Desonerado) sem
  proliferar colunas na tabela principal.
- Rastreabilidade de lote e série pode ser extraída para tabela `RastreabilidadeItem`
  quando volumes altos de dados forem esperados.
  - A operação de movimentação deve ser executada dentro de uma transação de banco de dados
  para garantir consistência do saldo e do custo médio (evitar race conditions).
- Considerar tabela de SaldoEstoque (produto × depósito) como projeção
  materializada para consultas de saldo em tempo real, em vez de calcular na query.
- Métodos analíticos (curvaABC, giroEstoque, posicaoEstoque) podem ser extraídos
  para uma camada de relatórios com leitura em réplica.
- DECISÃO PENDENTE: suporte a múltiplos métodos de custeio (CMV, PEPS, UEPS)
  por empresa; atualmente modelado apenas para CMV.
- Rastreabilidade por número de série requer tabela SerieEstoque separada
  quando volume de itens serializados for alto.
```
