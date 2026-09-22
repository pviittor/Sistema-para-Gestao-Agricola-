/**
 * UnidadeMedidaResponseDto - DTO para resposta de unidade de medida
 * 
 * DTO usado nas respostas da API para unidade de medida.
 */
export class UnidadeMedidaResponseDto {
  id_unidade!: number;
  tenantId!: number;
  descricao_unidade!: string;
  abreviatura_unidade?: string | null;
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
