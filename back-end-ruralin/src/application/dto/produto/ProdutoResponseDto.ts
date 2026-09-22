/**
 * ProdutoResponseDto - DTO para resposta de produto
 */
export class ProdutoResponseDto {
  id_prod!: number;
  tenantId!: number;
  descricao_prod!: string;
  idUnidadeMedida!: number;
  pesoliquido_prod!: number;
  idGrupo!: number;
  idSubGrupo!: number;
  idPrincipioAtivo?: number | null;
  idFabricante?: number | null;
  precomedio_prod!: number;
  valorultimaentrada_prod!: number;
  dataultimaentrada_prod?: Date | null;
  combustivel_prod!: boolean;
  custoUltimoCusto_prod!: boolean;
  valorUltimoCusto_prod!: number;
  atualizacaoCusto_prod?: Date | null;
  observacao_prod?: string | null;
  idIndexador?: number | null;
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
  
  unidadeMedida?: {
    id_unidade: number;
    descricao_unidade: string;
    abreviatura_unidade?: string | null;
  };
  
  grupo?: {
    id: number;
    descricao_grupo: string;
    abreviacao_grupo?: string | null;
  };
  
  subGrupo?: {
    id_sub: number;
    descricao_sub: string;
  };
  
  principioAtivo?: {
    id_principio: number;
    descricao_principio: string;
    classe_principio?: string | null;
  };
  
  fabricante?: {
    id_pessoa: number;
    nomerazao_pessoa?: string | null;
    nomefantasia_pessoa?: string | null;
  };
  
  indexador?: {
    id_moeda: number;
    descricao_moeda: string;
    simbolo_moeda?: string | null;
  };
}
