// ========================================
// Enums e tipos auxiliares
// ========================================

export type FluxoCaixaPeriodicidade = 'diario' | 'semanal' | 'mensal' | 'safra'

export type SimulacaoStatus = 'rascunho' | 'salvo' | 'arquivado'

export type FluxoCaixaTipoOverride =
  | 'adiar_pagamento'
  | 'antecipar_recebimento'
  | 'adicionar_entrada'
  | 'adicionar_saida'
  | 'remover_lancamento'
  | 'alterar_valor'

export type FluxoCaixaReferenciaTipo =
  | 'parcela_financeira'
  | 'parcela_titulo_pagar'
  | 'parcela_titulo_receber'
  | 'agreement_schedule'
  | 'manual'

// Labels para exibição na UI
export const PERIODICIDADE_LABELS: Record<FluxoCaixaPeriodicidade, string> = {
  diario: 'Diário',
  semanal: 'Semanal',
  mensal: 'Mensal',
  safra: 'Safra',
}

export const SIMULACAO_STATUS_LABELS: Record<SimulacaoStatus, string> = {
  rascunho: 'Rascunho',
  salvo: 'Salvo',
  arquivado: 'Arquivado',
}

export const TIPO_OVERRIDE_LABELS: Record<FluxoCaixaTipoOverride, string> = {
  adiar_pagamento: 'Adiar Pagamento',
  antecipar_recebimento: 'Antecipar Recebimento',
  adicionar_entrada: 'Adicionar Entrada',
  adicionar_saida: 'Adicionar Saída',
  remover_lancamento: 'Remover Lançamento',
  alterar_valor: 'Alterar Valor',
}

export const REFERENCIA_TIPO_LABELS: Record<FluxoCaixaReferenciaTipo, string> = {
  parcela_financeira: 'Parcela Financeira',
  parcela_titulo_pagar: 'Título a Pagar',
  parcela_titulo_receber: 'Título a Receber',
  agreement_schedule: 'Contrato/Acordo',
  manual: 'Manual',
}

// ========================================
// DTOs de resposta do cálculo
// ========================================

export interface FluxoCaixaEntryDto {
  tipoFluxo: string
  origem: string
  origemId: number | null
  descricao: string
  data: string
  valor: number
  contaBancariaId: number | null
  contaBancariaNome: string | null
  realizado: boolean
  planoContaId: number | null
  planoContaNome: string | null
}

export interface FluxoCaixaPeriodoDto {
  rotulo: string
  dataInicio: string
  dataFim: string
  totalEntradas: number
  totalSaidas: number
  saldoPeriodo: number
  saldoAcumulado: number
  lancamentos: FluxoCaixaEntryDto[]
}

export interface FluxoCaixaSaldoContaDto {
  contaBancariaId: number
  contaBancariaNome: string
  saldoAtual: number
  entradasProjetadas: number
  saidasProjetadas: number
  saldoProjetado: number
}

export interface FluxoCaixaAlertaDto {
  tipo: string
  severidade: string
  mensagem: string
  data: string
  valor: number | null
}

export interface FluxoCaixaConsolidadoDto {
  periodicidade: string
  dataInicio: string
  dataFim: string
  saldoInicial: number
  saldoFinal: number
  totalEntradas: number
  totalSaidas: number
  periodos: FluxoCaixaPeriodoDto[]
  saldosPorConta: FluxoCaixaSaldoContaDto[]
  alertas: FluxoCaixaAlertaDto[]
}

// ========================================
// Configuração do tenant
// ========================================

export interface FluxoCaixaConfiguracaoDto {
  id: number
  tenantId: number
  saldoMinimoAlerta: number
  diasProjecaoPadrao: number
  periodicidadePadrao: FluxoCaixaPeriodicidade
  incluirAgreements: boolean
  incluirTitulos: boolean
  incluirRecorrentes: boolean
  contasBancariasFiltro: number[] | null
  coresConfiguracao: { entrada: string; saida: string; saldo: string } | null
}

export interface UpdateFluxoCaixaConfiguracaoDto {
  saldoMinimoAlerta?: number
  diasProjecaoPadrao?: number
  periodicidadePadrao?: FluxoCaixaPeriodicidade
  incluirAgreements?: boolean
  incluirTitulos?: boolean
  incluirRecorrentes?: boolean
  contasBancariasFiltro?: number[] | null
  coresConfiguracao?: { entrada: string; saida: string; saldo: string } | null
}

// ========================================
// Simulações
// ========================================

export interface FluxoCaixaSimulacaoItemDto {
  id: number
  simulacaoId: number
  tipoOverride: string
  referenciaTipo: string | null
  referenciaId: number | null
  descricao: string
  tipoFluxo: string
  dataOriginal: string | null
  dataNova: string | null
  valorOriginal: number | null
  valorNovo: number | null
  contaBancariaId: number | null
  createdAt: string
  updatedAt: string
}

export interface FluxoCaixaSimulacaoDto {
  id: number
  tenantId: number
  nome: string
  descricao: string | null
  dataInicio: string
  dataFim: string
  status: SimulacaoStatus
  createdAt: string
  updatedAt: string
}

export interface FluxoCaixaSimulacaoDetailDto extends FluxoCaixaSimulacaoDto {
  itens?: FluxoCaixaSimulacaoItemDto[] | null
}

export interface CreateFluxoCaixaSimulacaoDto {
  nome: string
  descricao?: string
  dataInicio: string
  dataFim: string
}

export interface CreateFluxoCaixaSimulacaoItemDto {
  tipoOverride: FluxoCaixaTipoOverride
  referenciaTipo?: FluxoCaixaReferenciaTipo
  referenciaId?: number
  descricao: string
  tipoFluxo: 'entrada' | 'saida'
  dataOriginal?: string
  dataNova?: string
  valorOriginal?: number
  valorNovo?: number
  contaBancariaId?: number
}

export interface CreateFluxoCaixaSimulacaoCompletoDto extends CreateFluxoCaixaSimulacaoDto {
  itens: CreateFluxoCaixaSimulacaoItemDto[]
}

// ========================================
// Filtros do painel
// ========================================

export interface FluxoCaixaFiltros {
  dataInicio: string
  dataFim: string
  periodicidade: FluxoCaixaPeriodicidade
  contaBancariaIds: number[]
  idSafra?: number | null
}
