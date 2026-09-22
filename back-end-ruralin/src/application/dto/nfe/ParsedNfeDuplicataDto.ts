/**
 * DTO de saída para duplicata de NF-e parseada
 *
 * Representa uma duplicata extraída do nó cobr/dup do XML NF-e 4.0.
 * Não usa class-validator — é DTO de retorno do parser.
 */
export class ParsedNfeDuplicataDto {
  numero!: string
  dataVencimento!: string
  valor!: number
}
