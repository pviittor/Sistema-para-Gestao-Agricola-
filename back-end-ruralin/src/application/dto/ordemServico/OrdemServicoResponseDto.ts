import { StatusOrdemServico, PrioridadeOrdemServico } from '../../../models/enums/OrdemServicoEnums';

/**
 * OrdemServicoResponseDto - DTO de resposta para Ordem de Serviço
 *
 * Inclui todos os campos da OS, arrays dos filhos e nomes das entidades relacionadas.
 */
export interface OrdemServicoResponseDto {
  id: number;
  tenantId: number;
  numero: number;
  tipoAtividadeOSId: number;
  safraId: number | null;
  fazendaId: number;
  descricao: string | null;
  status: StatusOrdemServico;
  prioridade: PrioridadeOrdemServico;
  dataPlanejadaInicio: string | null;
  dataPlanejadaFim: string | null;
  dataInicioReal: string | null;
  dataFimReal: string | null;
  areaPlanejadaTotal: number | null;
  areaRealTotal: number | null;
  custoEstimado: number | null;
  custoReal: number | null;
  varianciaAreaPercent: number | null;
  varianciaCustoPercent: number | null;
  varianciaDias: number | null;
  camposCondicionais: Record<string, any> | null;
  observacoes: string | null;
  observacoesConclusao: string | null;
  motivoCancelamento: string | null;
  criadoPorId: number | null;
  atribuidoPorId: number | null;
  iniciadoPorId: number | null;
  concluidoPorId: number | null;
  validadoPorId: number | null;
  canceladoPorId: number | null;
  dataValidacao: string | null;
  estoqueProcessado: boolean;
  financeiroProcessado: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Entidades relacionadas
  tipoAtividade?: {
    id: number;
    nome: string;
    categoria: string;
    icone: string | null;
    cor: string | null;
  } | null;

  safra?: {
    id: number;
    nome: string;
  } | null;

  fazenda?: {
    id: number;
    nome: string;
  } | null;

  criadoPor?: {
    id: number;
    nome: string;
  } | null;

  atribuidoPor?: {
    id: number;
    nome: string;
  } | null;

  iniciadoPor?: {
    id: number;
    nome: string;
  } | null;

  concluidoPor?: {
    id: number;
    nome: string;
  } | null;

  validadoPor?: {
    id: number;
    nome: string;
  } | null;

  canceladoPor?: {
    id: number;
    nome: string;
  } | null;

  // Arrays dos filhos
  talhoes?: {
    id: number;
    talhaoId: number;
    talhao?: { descricao: string } | null;
    areaPlanejada: number | null;
    areaReal: number | null;
    percentualArea: number | null;
    custoRateado: number | null;
    observacoes: string | null;
  }[];

  insumos?: {
    id: number;
    produtoId: number;
    produto?: { descricao: string } | null;
    unidadeMedidaId: number | null;
    unidadeMedida?: { nome: string } | null;
    quantidadePlanejada: number | null;
    custoUnitarioPlanejado: number | null;
    quantidadeReal: number | null;
    custoUnitarioReal: number | null;
    dosagem: number | null;
    areaAplicada: number | null;
    observacoes: string | null;
  }[];

  maquinas?: {
    id: number;
    maquinaId: number;
    maquina?: { descricao: string } | null;
    implementoId: number | null;
    implemento?: { descricao: string } | null;
    operadorId: number | null;
    operador?: { nomerazao_pessoa: string | null } | null;
    horasPlanejadas: number | null;
    custoHoraPlanejado: number | null;
    horasReais: number | null;
    custoHoraReal: number | null;
    horimetroInicio: number | null;
    horimetroFim: number | null;
    areaTrabalhada: number | null;
    consumoCombustivel: number | null;
    observacoes: string | null;
  }[];

  responsaveis?: {
    id: number;
    pessoaId: number;
    pessoa?: { nomerazao_pessoa: string | null } | null;
    funcao: string;
    horasPlanejadas: number | null;
    custoHoraPlanejado: number | null;
    horasReais: number | null;
    custoHoraReal: number | null;
    observacoes: string | null;
  }[];
}
