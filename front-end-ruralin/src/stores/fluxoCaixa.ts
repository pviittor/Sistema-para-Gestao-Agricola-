import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { fluxoCaixaService } from '@/services/fluxoCaixaService'
import type {
  FluxoCaixaConsolidadoDto,
  FluxoCaixaConfiguracaoDto,
  FluxoCaixaSimulacaoDto,
  FluxoCaixaSimulacaoDetailDto,
  FluxoCaixaFiltros,
  FluxoCaixaPeriodicidade,
  UpdateFluxoCaixaConfiguracaoDto,
  CreateFluxoCaixaSimulacaoDto,
  CreateFluxoCaixaSimulacaoCompletoDto,
  CreateFluxoCaixaSimulacaoItemDto,
} from '@/types/FluxoCaixa'

export const useFluxoCaixaStore = defineStore('fluxoCaixa', () => {
  // ========================================
  // Estado
  // ========================================

  // Dados calculados
  const consolidado = ref<FluxoCaixaConsolidadoDto | null>(null)
  const carregandoConsolidado = ref(false)

  // Filtros ativos
  const filtros = ref<FluxoCaixaFiltros>({
    dataInicio: '',
    dataFim: '',
    periodicidade: 'mensal',
    contaBancariaIds: [],
  })
  const tabAtiva = ref<'consolidado' | 'realizado' | 'projetado'>('consolidado')

  // Configuração do tenant
  const configuracao = ref<FluxoCaixaConfiguracaoDto | null>(null)
  const carregandoConfiguracao = ref(false)

  // Simulações
  const simulacoes = ref<FluxoCaixaSimulacaoDto[]>([])
  const simulacaoAtiva = ref<FluxoCaixaSimulacaoDetailDto | null>(null)
  const resultadoSimulacaoAtiva = ref<FluxoCaixaConsolidadoDto | null>(null)
  const carregandoSimulacoes = ref(false)
  const modoComparacao = ref(false)

  // Estado UI
  const erroGlobal = ref<string | null>(null)
  const modalSimulacaoAberto = ref(false)
  const simulacaoEmEdicao = ref<FluxoCaixaSimulacaoDetailDto | null>(null)

  // ========================================
  // Getters
  // ========================================

  const periodos = computed(() => consolidado.value?.periodos ?? [])
  const saldosPorConta = computed(() => consolidado.value?.saldosPorConta ?? [])
  const alertas = computed(() => consolidado.value?.alertas ?? [])
  const temAlertas = computed(() => alertas.value.length > 0)
  const alertasCriticos = computed(() =>
    alertas.value.filter((a) => a.severidade === 'danger'),
  )
  const saldoInicial = computed(() => consolidado.value?.saldoInicial ?? 0)
  const saldoFinal = computed(() => consolidado.value?.saldoFinal ?? 0)
  const totalEntradas = computed(() => consolidado.value?.totalEntradas ?? 0)
  const totalSaidas = computed(() => consolidado.value?.totalSaidas ?? 0)

  // ========================================
  // Actions — Cálculos
  // ========================================

  async function buscarConsolidado(filtrosOverride?: Partial<FluxoCaixaFiltros>) {
    const f = { ...filtros.value, ...filtrosOverride }
    if (!f.dataInicio || !f.dataFim) return

    carregandoConsolidado.value = true
    erroGlobal.value = null
    try {
      if (tabAtiva.value === 'consolidado') {
        consolidado.value = await fluxoCaixaService.getConsolidado(f)
      } else if (tabAtiva.value === 'realizado') {
        consolidado.value = await fluxoCaixaService.getRealizado(f)
      } else {
        consolidado.value = await fluxoCaixaService.getProjetado(f)
      }
    } catch (err: any) {
      erroGlobal.value = err?.response?.data?.error?.message || 'Erro ao buscar fluxo de caixa'
      console.error('Erro ao buscar fluxo de caixa:', err)
    } finally {
      carregandoConsolidado.value = false
    }
  }

  // ========================================
  // Actions — Configuração
  // ========================================

  async function buscarConfiguracao() {
    carregandoConfiguracao.value = true
    try {
      configuracao.value = await fluxoCaixaService.getConfiguracao()

      // Aplicar filtros padrão da configuração se os filtros estiverem vazios
      if (!filtros.value.dataInicio && configuracao.value) {
        const hoje = new Date()
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        filtros.value.dataInicio = inicioMes.toISOString().split('T')[0] ?? ''

        const fim = new Date(inicioMes)
        fim.setDate(fim.getDate() + (configuracao.value.diasProjecaoPadrao || 30))
        filtros.value.dataFim = fim.toISOString().split('T')[0] ?? ''

        filtros.value.periodicidade = configuracao.value.periodicidadePadrao || 'mensal'

        if (configuracao.value.contasBancariasFiltro) {
          filtros.value.contaBancariaIds = configuracao.value.contasBancariasFiltro
        }
      }
    } catch (err: any) {
      console.error('Erro ao buscar configuração:', err)
    } finally {
      carregandoConfiguracao.value = false
    }
  }

  async function salvarConfiguracao(dto: UpdateFluxoCaixaConfiguracaoDto) {
    try {
      configuracao.value = await fluxoCaixaService.salvarConfiguracao(dto)
    } catch (err: any) {
      throw err
    }
  }

  // ========================================
  // Actions — Simulações
  // ========================================

  async function listarSimulacoes() {
    carregandoSimulacoes.value = true
    try {
      simulacoes.value = await fluxoCaixaService.listarSimulacoes()
    } catch (err: any) {
      console.error('Erro ao listar simulações:', err)
    } finally {
      carregandoSimulacoes.value = false
    }
  }

  async function criarSimulacao(dto: CreateFluxoCaixaSimulacaoDto) {
    const result = await fluxoCaixaService.criarSimulacao(dto)
    simulacoes.value.unshift(result)
    return result
  }

  async function criarSimulacaoCompleto(dto: CreateFluxoCaixaSimulacaoCompletoDto) {
    const result = await fluxoCaixaService.criarSimulacaoCompleto(dto)
    simulacoes.value.unshift(result)
    return result
  }

  async function atualizarSimulacao(id: number, dto: Partial<CreateFluxoCaixaSimulacaoDto>) {
    const result = await fluxoCaixaService.atualizarSimulacao(id, dto)
    const idx = simulacoes.value.findIndex((s) => s.id === id)
    if (idx !== -1) simulacoes.value[idx] = result
    return result
  }

  async function deletarSimulacao(id: number) {
    await fluxoCaixaService.deletarSimulacao(id)
    simulacoes.value = simulacoes.value.filter((s) => s.id !== id)
    if (simulacaoAtiva.value?.id === id) {
      desativarModoComparacao()
    }
  }

  async function calcularSimulacao(id: number) {
    const resultado = await fluxoCaixaService.calcularSimulacao(id, {
      dataInicio: filtros.value.dataInicio,
      dataFim: filtros.value.dataFim,
      periodicidade: filtros.value.periodicidade,
    })
    resultadoSimulacaoAtiva.value = resultado
    return resultado
  }

  // ========================================
  // Actions — Itens de simulação
  // ========================================

  async function adicionarItem(simulacaoId: number, dto: CreateFluxoCaixaSimulacaoItemDto) {
    const item = await fluxoCaixaService.adicionarItem(simulacaoId, dto)
    if (simulacaoAtiva.value?.id === simulacaoId && simulacaoAtiva.value.itens) {
      simulacaoAtiva.value.itens.push(item)
    }
    return item
  }

  async function atualizarItem(
    simulacaoId: number,
    itemId: number,
    dto: Partial<CreateFluxoCaixaSimulacaoItemDto>,
  ) {
    const item = await fluxoCaixaService.atualizarItem(simulacaoId, itemId, dto)
    if (simulacaoAtiva.value?.id === simulacaoId && simulacaoAtiva.value.itens) {
      const idx = simulacaoAtiva.value.itens.findIndex((i) => i.id === itemId)
      if (idx !== -1) simulacaoAtiva.value.itens[idx] = item
    }
    return item
  }

  async function deletarItem(simulacaoId: number, itemId: number) {
    await fluxoCaixaService.deletarItem(simulacaoId, itemId)
    if (simulacaoAtiva.value?.id === simulacaoId && simulacaoAtiva.value.itens) {
      simulacaoAtiva.value.itens = simulacaoAtiva.value.itens.filter((i) => i.id !== itemId)
    }
  }

  // ========================================
  // Actions — UI
  // ========================================

  function ativarModoComparacao(simulacao: FluxoCaixaSimulacaoDetailDto) {
    simulacaoAtiva.value = simulacao
    modoComparacao.value = true
  }

  function desativarModoComparacao() {
    simulacaoAtiva.value = null
    resultadoSimulacaoAtiva.value = null
    modoComparacao.value = false
  }

  function atualizarFiltros(novosFiltros: Partial<FluxoCaixaFiltros>) {
    filtros.value = { ...filtros.value, ...novosFiltros }
  }

  async function abrirModalSimulacao(simulacao?: FluxoCaixaSimulacaoDto | FluxoCaixaSimulacaoDetailDto) {
    if (simulacao && simulacao.id) {
      try {
        const detail = await fluxoCaixaService.getSimulacao(simulacao.id)
        simulacaoEmEdicao.value = detail
      } catch (err) {
        console.error('Erro ao carregar simulação:', err)
        simulacaoEmEdicao.value = (simulacao as FluxoCaixaSimulacaoDetailDto) || null
      }
    } else {
      simulacaoEmEdicao.value = null
    }
    modalSimulacaoAberto.value = true
  }

  function fecharModalSimulacao() {
    modalSimulacaoAberto.value = false
    simulacaoEmEdicao.value = null
  }

  return {
    // Estado
    consolidado,
    carregandoConsolidado,
    filtros,
    tabAtiva,
    configuracao,
    carregandoConfiguracao,
    simulacoes,
    simulacaoAtiva,
    resultadoSimulacaoAtiva,
    carregandoSimulacoes,
    modoComparacao,
    erroGlobal,
    modalSimulacaoAberto,
    simulacaoEmEdicao,

    // Getters
    periodos,
    saldosPorConta,
    alertas,
    temAlertas,
    alertasCriticos,
    saldoInicial,
    saldoFinal,
    totalEntradas,
    totalSaidas,

    // Actions
    buscarConsolidado,
    buscarConfiguracao,
    salvarConfiguracao,
    listarSimulacoes,
    criarSimulacao,
    criarSimulacaoCompleto,
    atualizarSimulacao,
    deletarSimulacao,
    calcularSimulacao,
    adicionarItem,
    atualizarItem,
    deletarItem,
    ativarModoComparacao,
    desativarModoComparacao,
    atualizarFiltros,
    abrirModalSimulacao,
    fecharModalSimulacao,
  }
})
