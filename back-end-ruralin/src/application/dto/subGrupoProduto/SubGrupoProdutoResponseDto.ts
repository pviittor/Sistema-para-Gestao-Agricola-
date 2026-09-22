/**
 * SubGrupoProdutoResponseDto - DTO para resposta de subgrupo de produto
 * 
 * DTO usado nas respostas da API para subgrupo de produto.
 */
export class SubGrupoProdutoResponseDto {
  id_sub!: number;
  tenantId!: number;
  descricao_sub!: string;
  idGrupo!: number;
  createdAt!: Date;
  updatedAt!: Date;
  
  /**
   * Grupo de produto relacionado (opcional, quando incluído na query)
   */
  grupo?: {
    id: number;
    descricao_grupo: string;
    abreviacao_grupo?: string | null;
  };
}
