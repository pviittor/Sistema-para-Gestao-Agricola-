/**
 * DTO de saída para item de NF-e parseada
 *
 * Representa um item extraído do XML NF-e 4.0.
 * Não usa class-validator — é DTO de retorno do parser.
 */
export class ParsedNfeItemDto {
  numero!: number
  descricao!: string
  ncm!: string
  cfop!: string
  unidade!: string
  quantidade!: number
  vlUnitario!: number
  vlTotal!: number
  vlIcms!: number
  vlIpi!: number
  vlPis!: number
  vlCofins!: number
  codigoProduto?: string
  ean?: string
}
