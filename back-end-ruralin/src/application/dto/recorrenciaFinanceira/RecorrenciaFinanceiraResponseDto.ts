/**
 * RecorrenciaFinanceiraResponseDto - DTO para resposta de recorrência financeira
 *
 * DTO usado nas respostas da API para recorrência financeira.
 */
export class RecorrenciaFinanceiraResponseDto {
  id!: number;
  tenantId!: number;
  usuarioId!: number;
  tipo!: string;
  descricao!: string;
  valor!: number;
  periodicidade!: string;
  diaVencimento!: number;
  dataInicio!: string;
  dataFim?: string | null;
  ativa!: boolean;
  idFornecedorCliente?: number | null;
  idPortador?: number | null;
  idProdutor?: number | null;
  idContaDebCred?: number | null;
  idPlanoContaGerencial?: number | null;
  idCentroCusto?: number | null;
  idFazenda?: number | null;
  idSafra?: number | null;
  idTalhao?: number | null;
  idMoeda?: number | null;
  antecedenciaGeracaoDias!: number;
  numeroMaximoGeracoes?: number | null;
  geracoesRealizadas!: number;
  observacao?: string | null;
  usercreation!: number;
  datecreation!: Date;

  /**
   * Relacionamentos opcionais (quando incluídos na query)
   */
  usuario?: {
    id: number;
    nome: string;
    email: string;
  } | null;

  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;

  fornecedorCliente?: {
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

  conta?: {
    id: number;
    descricao: string;
  } | null;

  planoContaGerencial?: {
    id: number;
    descricao: string;
  } | null;

  centroCusto?: {
    id: number;
    descricao: string;
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

  talhao?: {
    id_talhao: number;
    descricao_talhao: string;
  } | null;

  moeda?: {
    id_moeda: number;
    descricao_moeda: string;
    sigla_moeda: string;
  } | null;
}
