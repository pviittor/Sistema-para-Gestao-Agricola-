# 📋 Levantamento de Requisitos — `NotaFiscal`

> Template versão 1.0 — RuralIn (GMPR)

---

## 1. Identificação

| Campo | Resposta |
|-------|----------|
| Nome da tabela (plural, snake_case) | `notas_fiscais` |
| Nome singular (PascalCase) | `NotaFiscal` |
| Descrição em uma linha | "Cabeçalho de notas fiscais de entrada e saída de mercadorias/serviços" |
| Multi-tenant? | ✅ Sim |
| Auditar operações? | ✅ Sim |
| Usar cache? | ✅ Sim |
| TTL do cache (segundos) | `300` |

---

## 2. Campos

> **Tipos disponíveis:** `STRING` · `TEXT` · `INTEGER` · `DECIMAL` · `DATE` · `DATEONLY` · `TIME` · `BOOLEAN` · `JSON`

| Campo (snake_case) | Tipo | Obrigatório | Único | Valor Padrão | Validações / Observações |
|--------------------|------|:-----------:|:-----:|:------------:|--------------------------|
| `tipo` | STRING | ✅ | ❌ | — | Enum: `entrada`, `saida` |
| `numero` | STRING | ✅ | ❌ | — | Máx. 9 dígitos; único por série + emitente + empresa |
| `serie` | STRING | ✅ | ❌ | `1` | Máx. 3 caracteres |
| `chave_acesso` | STRING | ❌ | ✅ | — | 44 dígitos; obrigatório para NF-e/NFC-e |
| `modelo` | STRING | ✅ | ❌ | `55` | Enum: `55` (NF-e), `65` (NFC-e), `01` (NF papel), `04` (NFS-e) |
| `natureza_operacao` | STRING | ✅ | ❌ | — | Máx. 60 caracteres |
| `cfop` | STRING | ✅ | ❌ | — | 4 dígitos; validar tabela CFOP |
| `finalidade` | STRING | ✅ | ❌ | `normal` | Enum: `normal`, `complementar`, `ajuste`, `devolucao` |
| `data_emissao` | DATE | ✅ | ❌ | — | Não pode ser futura (entrada); obrigatória |
| `data_entrada_saida` | DATE | ✅ | ❌ | — | Para entrada: data de recebimento; para saída: data de saída |
| `hora_entrada_saida` | TIME | ❌ | ❌ | — | Complemento de data_entrada_saida |
| `status` | STRING | ✅ | ❌ | `rascunho` | Enum: `rascunho`, `pendente`, `autorizada`, `cancelada`, `denegada`, `inutilizada` |
| `emitente_id` | INTEGER | ✅ | ❌ | — | FK → Pessoa (CNPJ/CPF emitente) |
| `destinatario_id` | INTEGER | ✅ | ❌ | — | FK → Pessoa (CNPJ/CPF destinatário) |
| `empresa_id` | INTEGER | ✅ | ❌ | — | FK → Empresa (tenant) |
| `transportadora_id` | INTEGER | ❌ | ❌ | — | FK → Pessoa |
| `modalidade_frete` | STRING | ❌ | ❌ | `sem_frete` | Enum: `emitente`, `destinatario`, `terceiros`, `proprio_remetente`, `proprio_destinatario`, `sem_frete` |
| `vl_produtos` | DECIMAL | ✅ | ❌ | `0.00` | Precisão 15,2; gerado pela soma dos itens |
| `vl_frete` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2; mín. 0 |
| `vl_seguro` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2; mín. 0 |
| `vl_desconto` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2; mín. 0; não pode exceder vl_produtos |
| `vl_outros` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2; mín. 0 |
| `vl_ipi` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2; consolidado dos itens |
| `vl_icms` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2; consolidado dos itens |
| `vl_pis` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2; consolidado dos itens |
| `vl_cofins` | DECIMAL | ❌ | ❌ | `0.00` | Precisão 15,2; consolidado dos itens |
| `vl_total` | DECIMAL | ✅ | ❌ | `0.00` | Precisão 15,2; calculado automaticamente |
| `volumes_qtd` | INTEGER | ❌ | ❌ | — | Quantidade de volumes |
| `volumes_especie` | STRING | ❌ | ❌ | — | Ex: `CAIXA`, `FARDO`, `PALLET` |
| `peso_bruto` | DECIMAL | ❌ | ❌ | — | Precisão 15,3 kg |
| `peso_liquido` | DECIMAL | ❌ | ❌ | — | Precisão 15,3 kg |
| `informacoes_adicionais` | TEXT | ❌ | ❌ | — | Observações ao fisco |
| `informacoes_complementares` | TEXT | ❌ | ❌ | — | Observações ao destinatário |
| `xml_autorizacao` | TEXT | ❌ | ❌ | — | XML retornado pela SEFAZ |
| `protocolo_autorizacao` | STRING | ❌ | ❌ | — | Número do protocolo SEFAZ |
| `data_autorizacao` | DATE | ❌ | ❌ | — | Data/hora retorno SEFAZ |
| `motivo_cancelamento` | TEXT | ❌ | ❌ | — | Obrigatório se status = cancelada |
| `data_cancelamento` | DATE | ❌ | ❌ | — | Preenchido automaticamente ao cancelar |
| `estoque_movimentado` | BOOLEAN | ✅ | ❌ | `false` | Indica se o estoque já foi movimentado por esta nota |
| `financeiro_gerado` | BOOLEAN | ✅ | ❌ | `false` | Indica se as parcelas financeiras foram geradas |
| `ativo` | BOOLEAN | ✅ | ❌ | `true` | Soft delete |

---

## 3. Relacionamentos

| Tipo | Entidade relacionada | Chave estrangeira | Obrigatório | onDelete |
|------|---------------------|:-----------------:|:-----------:|:--------:|
| `belongsTo` | `Empresa` | `empresaId` | ✅ | `RESTRICT` |
| `belongsTo` | `Pessoa` (emitente) | `emitenteId` | ✅ | `RESTRICT` |
| `belongsTo` | `Pessoa` (destinatário) | `destinatarioId` | ✅ | `RESTRICT` |
| `belongsTo` | `Pessoa` (transportadora) | `transportadoraId` | ❌ | `SET NULL` |
| `hasMany` | `ItemNotaFiscal` | `notaFiscalId` | — | `CASCADE` |
| `hasMany` | `tituloPagar` | `notaFiscalId` | — | `CASCADE` | -criar migration
| `hasMany` | `tituloReceber` | `notaFiscalId` | — | `CASCADE` | -criar migration
| `hasMany` | `NotaFiscal` (referências) | `notaFiscalRefId` | — | `SET NULL` |

---

## 4. Permissões

| Operação | Permissão |
|----------|-----------|
| Criar | `nota_fiscal.create` |
| Ler | `nota_fiscal.read` |
| Atualizar | `nota_fiscal.update` |
| Deletar | `nota_fiscal.delete` |
| Cancelar | `nota_fiscal.cancel` |
| Autorizar (transmitir SEFAZ) | `nota_fiscal.authorize` |
| Inutilizar numeração | `nota_fiscal.inutilize` |
| Movimentar estoque | `nota_fiscal.stock_move` |
| Gerar financeiro | `nota_fiscal.finance_generate` |

---

## 5. Regras de Negócio

| # | Descrição | Onde validar |
|---|-----------|:------------:|
| 1 | `vl_total` deve ser igual a: `vl_produtos` + `vl_frete` + `vl_seguro` + `vl_outros` + `vl_ipi` − `vl_desconto` | `Service` |
| 2 | `vl_desconto` não pode ser maior que `vl_produtos` | `DTO` + `Service` |
| 3 | Nota com `status = autorizada` não pode ser editada; apenas cancelada | `Service` |
| 4 | Nota com `status = cancelada` não pode voltar para outro status | `Service` |
| 5 | `data_entrada_saida` deve ser ≥ `data_emissao` | `DTO` |
| 6 | Cancelamento só é permitido dentro do prazo legal (24h para NF-e, conforme legislação vigente) | `Service` |
| 7 | Ao cancelar, `estoque_movimentado` deve ser revertido se `true` | `Service` |
| 8 | `chave_acesso` é obrigatória para modelos `55` e `65` no momento da autorização | `Service` |
| 9 | Número + série + modelo devem ser únicos por empresa e por emitente | `Repository` |
| 10 | Notas de devolução devem referenciar a nota fiscal original | `Service` |
| 11 | Para nota de `tipo = entrada`, `emitente_id` deve ser um fornecedor ativo | `Service` |
| 12 | Para nota de `tipo = saida`, `destinatario_id` deve ser um cliente ativo | `Service` |
| 13 | Movimentação de estoque e geração de parcelas financeiras só são permitidas para notas `autorizadas` | `Service` |
| 14 | Uma nota não pode movimentar estoque ou gerar financeiro mais de uma vez (`estoque_movimentado` / `financeiro_gerado`) | `Service` |

---

## 6. Consultas Especiais

| Método | Descrição | Parâmetros | Retorno |
|--------|-----------|------------|---------|
| `findByChaveAcesso` | Busca nota pela chave de acesso NF-e | `chaveAcesso: string` | `NotaFiscal` |
| `findByPeriodo` | Lista notas por período de emissão | `dataInicio: date, dataFim: date, tipo?: string, status?: string` | `NotaFiscal[]` |
| `findByEmitente` | Lista notas por emitente | `emitenteId: integer, tipo?: string` | `NotaFiscal[]` |
| `findByDestinatario` | Lista notas por destinatário | `destinatarioId: integer` | `NotaFiscal[]` |
| `findPendentesMovimentacao` | Notas autorizadas que ainda não movimentaram estoque | `tipo?: string` | `NotaFiscal[]` |
| `findPendentesFinanceiro` | Notas autorizadas sem financeiro gerado | `tipo?: string` | `NotaFiscal[]` |
| `totalPorPeriodo` | Soma de totais agrupados por tipo/período | `dataInicio: date, dataFim: date` | `{ tipo, total, qtd }[]` |
| `findByNumeroSerie` | Busca por número e série | `numero: string, serie: string, modelo: string` | `NotaFiscal` |

---

## 7. Chaves de Cache

| Chave |
|-------|
| `nota_fiscal:list:empresa:{id}:*` |
| `nota_fiscal:findByChaveAcesso:{chave}` |
| `nota_fiscal:findByPeriodo:{empresaId}:*` |
| `nota_fiscal:totalPorPeriodo:{empresaId}:*` |
| `nota_fiscal:id:{id}` |

---

## 8. Observações e Pendências

```
- Integração com SEFAZ (transmissão, cancelamento, inutilização) deve ser tratada em serviço
  dedicado (SefazService), descoberto pelo Service desta entidade.
- Contingência offline (EPEC, FS-DA) deve ser suportada via campo `status = pendente` e
  rotina de reprocessamento assíncrono.
- A geração do XML e assinatura digital (certificado A1/A3) é responsabilidade do SefazService.
- Avaliar uso de fila (queue/job) para transmissão assíncrona de notas em lote.
- Notas de serviço (NFS-e, modelo 04) possuem campos adicionais específicos de cada município;
  considerar tabela separada ou campo JSON complementar.
- atualizar a tabela 'movimentoEstoque' com os novos campos necessarios
```
