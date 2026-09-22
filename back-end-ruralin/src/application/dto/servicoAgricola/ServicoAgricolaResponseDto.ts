/**
 * ServicoAgricolaResponseDto - DTO para resposta de serviço agrícola
 */
export class ServicoAgricolaResponseDto {
  id_srv!: number;
  tenantId!: number;
  descricao_srv!: string;
  financeiro_srv!: boolean;
  observacao_srv?: string | null;
  usercreation!: number;
  datecreation!: Date;
  
  /**
   * Relacionamentos opcionais (quando incluídos na query)
   */
  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  };
}
