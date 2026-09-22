/**
 * HistoricoPrecoResponseDto - DTO para resposta de histórico de preço
 *
 * Somente ResponseDto (criação é automática via MovimentoEstoqueApplicationService)
 */
export class HistoricoPrecoResponseDto {
  id_hist!: number;
  tenantId!: number;
  idProduto!: number;
  idFazenda!: number;
  idMovimentoEstoque!: number;
  preco!: number;
  quantidade!: number;
  data!: string;
  idMoeda?: number | null;
  valorMoedaPadrao!: number;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  produto?: {
    id_prod: number;
    descricao_prod: string;
  } | null;

  fazenda?: {
    id: number;
    descricao: string;
  } | null;

  moeda?: {
    id_moeda: number;
    descricao: string;
  } | null;
}
