/**
 * MovimentoFinanceiroTituloReceberResponseDto - DTO para resposta de movimento financeiro de título a receber
 * 
 * DTO usado nas respostas da API para movimento financeiro de título a receber.
 */
export class MovimentoFinanceiroTituloReceberResponseDto {
  id!: number;
  tenantId!: number;
  idParcelaTituloReceber!: number;
  idTituloReceber!: number;
  idPlanoContaGerencial!: number;
  idCentroCusto!: number;
  dataMovimento!: Date;
  valorMovimento!: number;
  valorMovimentoMoedaOriginal?: number | null;
  valorMovimentoMoedaPadrao?: number | null;
  percentualRateioPlanoConta!: number;
  percentualRateioCentroCusto!: number;
  observacao?: string | null;
  usercreation!: number;
  datecreation!: Date;

  /**
   * Relacionamentos opcionais (quando incluídos na query)
   */
  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;

  parcelaTituloReceber?: {
    id: number;
    numeroParcela: number;
    dataVencimento: string;
    valorParcela: number;
    dataBaixa?: string | null;
    valorBaixa?: number | null;
    status: string;
  } | null;

  tituloReceber?: {
    id: number;
    numeroTitulo: string;
    valorTitulo: number;
    dataLancamento: string;
    status: string;
  } | null;

  planoContaGerencial?: {
    id: number;
    item: string;
    descricao: string;
    tipo: 'SINTETICA' | 'ANALITICA';
    nivel: number;
  } | null;

  centroCusto?: {
    id: number;
    codigo: string;
    nome: string;
    ativo: boolean;
  } | null;
}
