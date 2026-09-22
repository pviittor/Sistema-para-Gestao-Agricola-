export interface Produto {
  id_prod?: number;
  tenantId?: number;
  descricao_prod: string;
  idUnidadeMedida?: number;
  pesoliquido_prod: number;
  idGrupo?: number;
  idSubGrupo?: number;
  idPrincipioAtivo?: number | null;
  idFabricante?: number | null;
  idIndexador?: number | null;
  
  precomedio_prod: number;
  valorultimaentrada_prod: number;
  dataultimaentrada_prod?: string | null;
  
  combustivel_prod: boolean;
  
  custoUltimoCusto_prod: boolean;
  valorUltimoCusto_prod: number;
  atualizacaoCusto_prod?: string | null;
  
  observacao_prod?: string | null;
  
  // Helper fields for UI display
  unidadeMedidaDescricao?: string;
  grupoDescricao?: string;
}
