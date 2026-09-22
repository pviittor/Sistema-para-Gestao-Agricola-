/**
 * PrincipioAtivoResponseDto - DTO para resposta de princípio ativo
 * 
 * DTO usado nas respostas da API para princípio ativo.
 */
export class PrincipioAtivoResponseDto {
  id_principio!: number;
  tenantId!: number;
  descricao_principio!: string;
  classe_principio?: string | null;
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
