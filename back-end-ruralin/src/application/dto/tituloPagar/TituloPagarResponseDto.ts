import { StatusTituloPagar } from '../../../models/TituloPagar';

/**
 * TituloPagarResponseDto - DTO para resposta de título a pagar
 * 
 * DTO usado nas respostas da API para título a pagar.
 */
export class TituloPagarResponseDto {
  id!: number;
  tenantId!: number;
  idFornecedor!: number;
  idPortador!: number;
  idProdutor!: number;
  idFazenda!: number;
  idSafra!: number;
  idMoeda!: number;
  dataLancamento!: string;
  numeroTitulo!: string;
  valorTitulo!: number;
  valorTituloMoedaOriginal?: number | null;
  valorTituloMoedaPadrao?: number | null;
  quantidadeParcelas!: number;
  observacao?: string | null;
  impostoRenda!: boolean;
  status!: StatusTituloPagar;
  origemTipo?: string;
  origemId?: number;
  contaBancariaId?: number | null;
  contaBancaria?: any;
  tipoGeracao?: string;
  dataPrimeiraParcela?: string | null;
  intervaloParcelasDias?: number | null;
  modeloJuros?: string;
  taxaJurosAm?: number | null;
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

  fornecedor?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
    cpfcnpj_pessoa: string | null;
  } | null;

  portador?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
    cpfcnpj_pessoa: string | null;
  } | null;

  produtor?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
    cpfcnpj_pessoa: string | null;
  } | null;

  fazenda?: {
    id: number;
    descricao: string;
    idMunicipio: number;
  } | null;

  safra?: {
    id: number;
    nome: string;
    dataInicio: string;
    dataFim?: string | null;
    status: string;
  } | null;

  moeda?: {
    id_moeda: number;
    descricao_moeda: string;
    sigla_moeda: string;
  } | null;

  parcelas?: {
    id: number;
    numeroParcela: number;
    dataVencimento: string;
    valorParcela: number;
    status: string;
  }[] | null;

  rateiosPlanoConta?: {
    id: number;
    idPlanoContaGerencial: number;
    valorRateio: number;
    percentualRateio: number;
  }[] | null;

  rateiosCentroCusto?: {
    id: number;
    idCentroCusto: number;
    valorRateio: number;
    percentualRateio: number;
  }[] | null;
}
