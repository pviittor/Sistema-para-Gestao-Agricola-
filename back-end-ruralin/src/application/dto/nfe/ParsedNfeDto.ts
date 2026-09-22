import { ParsedNfeItemDto } from './ParsedNfeItemDto'
import { ParsedNfeDuplicataDto } from './ParsedNfeDuplicataDto'

/**
 * DTO de saída para NF-e parseada
 *
 * Representa os dados estruturados extraídos de um XML NF-e 4.0.
 * Não usa class-validator — é DTO de retorno do parser.
 */
export class ParsedNfeDto {
  chaveAcesso!: string
  numero!: string
  serie!: string
  modelo!: string
  dataEmissao!: string
  dataEntradaSaida?: string
  naturezaOperacao!: string
  cfop!: string
  finalidade?: string
  emitente!: {
    cnpj: string
    razaoSocial: string
    inscricaoEstadual?: string
    uf: string
    municipio?: string
    endereco?: string
  }
  destinatario!: {
    cnpj: string
    razaoSocial: string
    inscricaoEstadual?: string
    uf: string
  }
  vlProdutos!: number
  vlFrete!: number
  vlSeguro!: number
  vlDesconto!: number
  vlOutros!: number
  vlIpi!: number
  vlIcms!: number
  vlPis!: number
  vlCofins!: number
  vlTotal!: number
  itens!: ParsedNfeItemDto[]
  duplicatas!: ParsedNfeDuplicataDto[]
  informacoesAdicionais?: string
}
