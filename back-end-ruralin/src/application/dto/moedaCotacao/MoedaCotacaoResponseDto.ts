/**
 * MoedaCotacaoResponseDto - DTO para resposta de cotação de moeda
 */
export class MoedaCotacaoResponseDto {
  id_cotacao!: number;
  tenantId!: number;
  idMoeda!: number;
  data_cotacao!: Date;
  valor_cotacao!: number;
  fechamento_cotaca!: boolean;
  
  /**
   * Moeda relacionada (opcional, quando incluído na query)
   */
  moeda?: {
    id_moeda: number;
    descricao_moeda: string;
    simbolo_moeda?: string | null;
    siglabc_moeda?: string | null;
  };
}
