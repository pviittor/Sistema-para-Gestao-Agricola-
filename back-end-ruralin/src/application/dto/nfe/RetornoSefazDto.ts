/**
 * DTO para retorno de operações SEFAZ
 */
export class RetornoSefazDto {
  /** Status: autorizada, rejeitada, denegada, em_processamento, cancelada, inutilizada */
  status!: string;
  /** Descrição do motivo/resultado */
  motivo!: string;
  /** Número do protocolo SEFAZ */
  protocolo?: string | null;
  /** Chave de acesso da NF-e (44 dígitos) */
  chaveAcesso?: string | null;
  /** XML de retorno da SEFAZ */
  xmlRetorno?: string | null;
  /** Código numérico de status SEFAZ */
  codigoStatus!: number;
  /** Data/hora do processamento */
  dataProcessamento!: string;
}
