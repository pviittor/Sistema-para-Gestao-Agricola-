/**
 * DTO de saída para status do serviço SEFAZ
 *
 * Retornado pelo NfeSefazService.consultarStatusServico().
 * Não usa class-validator — é DTO de retorno.
 */
export class StatusServicoDto {
  disponivel!: boolean
  motivo!: string
  tempoMedioResposta?: number
  dataConsulta!: string
  uf!: string
  ambiente!: string
}
