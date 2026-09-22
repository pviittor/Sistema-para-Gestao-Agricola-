/**
 * GrupoProdutoResponseDto - DTO para resposta de grupo de produto
 * 
 * DTO usado nas respostas da API para grupo de produto.
 */
export class GrupoProdutoResponseDto {
  id!: number;
  tenantId!: number;
  descricao_grupo!: string;
  abreviacao_grupo?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
