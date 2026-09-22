/**
 * CulturaResponseDto - DTO para resposta de cultura
 */
export class CulturaResponseDto {
  id!: number;
  tenantId!: number;
  descricao_clt!: string;
  idProduto!: number;
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
  
  produto?: {
    id_prod: number;
    descricao_prod: string;
    idGrupo?: number;
    idSubGrupo?: number;
  };
}
