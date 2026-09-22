/**
 * MoedaResponseDto - DTO para resposta de moeda
 */
export class MoedaResponseDto {
  id_moeda!: number;
  tenantId!: number;
  descricao_moeda!: string;
  simbolo_moeda?: string | null;
  codigoIntegracaoBancoCentral?: string | null;
  siglabc_moeda?: string | null;
  usercreation!: number;
  datecreation!: Date;
  
  /**
   * Usuário criador (opcional, quando incluído na query)
   */
  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  };
}
