import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFluxoCaixaStore } from '../fluxoCaixa'
import type {
  FluxoCaixaConsolidadoDto,
  FluxoCaixaConfiguracaoDto,
  FluxoCaixaSimulacaoDto,
  FluxoCaixaSimulacaoDetailDto,
  FluxoCaixaSimulacaoItemDto,
} from '@/types/FluxoCaixa'

// ========================================
// Mock do serviço
// ========================================

const mockGetConsolidado = vi.fn()
const mockGetRealizado = vi.fn()
const mockGetProjetado = vi.fn()
const mockGetConfiguracao = vi.fn()
const mockSalvarConfiguracao = vi.fn()
const mockListarSimulacoes = vi.fn()
const mockCriarSimulacao = vi.fn()
const mockCriarSimulacaoCompleto = vi.fn()
const mockAtualizarSimulacao = vi.fn()
const mockDeletarSimulacao = vi.fn()
const mockCalcularSimulacao = vi.fn()
const mockAdicionarItem = vi.fn()
const mockAtualizarItem = vi.fn()
const mockDeletarItem = vi.fn()

vi.mock('@/services/fluxoCaixaService', () => ({
  fluxoCaixaService: {
    getConsolidado: (...args: unknown[]) => mockGetConsolidado(...args),
    getRealizado: (...args: unknown[]) => mockGetRealizado(...args),
    getProjetado: (...args: unknown[]) => mockGetProjetado(...args),
    getConfiguracao: (...args: unknown[]) => mockGetConfiguracao(...args),
    salvarConfiguracao: (...args: unknown[]) => mockSalvarConfiguracao(...args),
    listarSimulacoes: (...args: unknown[]) => mockListarSimulacoes(...args),
    criarSimulacao: (...args: unknown[]) => mockCriarSimulacao(...args),
    criarSimulacaoCompleto: (...args: unknown[]) => mockCriarSimulacaoCompleto(...args),
    atualizarSimulacao: (...args: unknown[]) => mockAtualizarSimulacao(...args),
    deletarSimulacao: (...args: unknown[]) => mockDeletarSimulacao(...args),
    calcularSimulacao: (...args: unknown[]) => mockCalcularSimulacao(...args),
    adicionarItem: (...args: unknown[]) => mockAdicionarItem(...args),
    atualizarItem: (...args: unknown[]) => mockAtualizarItem(...args),
    deletarItem: (...args: unknown[]) => mockDeletarItem(...args),
  },
}))

// ========================================
// Dados mock
// ========================================

const mockConsolidado: FluxoCaixaConsolidadoDto = {
  periodicidade: 'mensal',
  dataInicio: '2026-01-01',
  dataFim: '2026-03-31',
  saldoInicial: 50000,
  saldoFinal: 75000,
  totalEntradas: 100000,
  totalSaidas: 75000,
  periodos: [
    {
      rotulo: 'Jan/2026',
      dataInicio: '2026-01-01',
      dataFim: '2026-01-31',
      totalEntradas: 30000,
      totalSaidas: 25000,
      saldoPeriodo: 5000,
      saldoAcumulado: 55000,
      lancamentos: [],
    },
  ],
  saldosPorConta: [
    {
      contaBancariaId: 1,
      contaBancariaNome: 'Banco do Brasil',
      saldoAtual: 50000,
      entradasProjetadas: 80000,
      saidasProjetadas: 55000,
      saldoProjetado: 75000,
    },
  ],
  alertas: [
    {
      tipo: 'saldo_negativo',
      severidade: 'danger',
      mensagem: 'Saldo negativo projetado em Abr/2026',
      data: '2026-04-15',
      valor: -5000,
    },
  ],
}

const mockConfiguracao: FluxoCaixaConfiguracaoDto = {
  id: 1,
  tenantId: 1,
  saldoMinimoAlerta: 10000,
  diasProjecaoPadrao: 90,
  periodicidadePadrao: 'mensal',
  incluirAgreements: true,
  incluirTitulos: true,
  incluirRecorrentes: true,
  contasBancariasFiltro: [1, 2],
  coresConfiguracao: { entrada: '#22c55e', saida: '#ef4444', saldo: '#3b82f6' },
}

const mockSimulacao: FluxoCaixaSimulacaoDto = {
  id: 1,
  tenantId: 1,
  nome: 'Cenario Otimista',
  descricao: 'Simulacao com aumento de receita',
  dataInicio: '2026-01-01',
  dataFim: '2026-06-30',
  status: 'rascunho',
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
}

const mockSimulacao2: FluxoCaixaSimulacaoDto = {
  id: 2,
  tenantId: 1,
  nome: 'Cenario Pessimista',
  descricao: null,
  dataInicio: '2026-01-01',
  dataFim: '2026-06-30',
  status: 'salvo',
  createdAt: '2026-01-16T10:00:00Z',
  updatedAt: '2026-01-16T10:00:00Z',
}

const mockItem: FluxoCaixaSimulacaoItemDto = {
  id: 10,
  simulacaoId: 1,
  tipoOverride: 'adicionar_entrada',
  referenciaTipo: null,
  referenciaId: null,
  descricao: 'Venda extra de soja',
  tipoFluxo: 'entrada',
  dataOriginal: null,
  dataNova: '2026-03-15',
  valorOriginal: null,
  valorNovo: 50000,
  contaBancariaId: 1,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
}

const mockSimulacaoDetail: FluxoCaixaSimulacaoDetailDto = {
  ...mockSimulacao,
  itens: [mockItem],
}

// ========================================
// Testes
// ========================================

describe('useFluxoCaixaStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ------------------------------------------
  // 1. Estado inicial
  // ------------------------------------------

  describe('estado inicial', () => {
    it('consolidado deve ser null', () => {
      const store = useFluxoCaixaStore()
      expect(store.consolidado).toBeNull()
    })

    it('filtros deve ter valores padrao', () => {
      const store = useFluxoCaixaStore()
      expect(store.filtros).toEqual({
        dataInicio: '',
        dataFim: '',
        periodicidade: 'mensal',
        contaBancariaIds: [],
      })
    })

    it('carregandoConsolidado deve ser false', () => {
      const store = useFluxoCaixaStore()
      expect(store.carregandoConsolidado).toBe(false)
    })

    it('simulacoes deve ser array vazio', () => {
      const store = useFluxoCaixaStore()
      expect(store.simulacoes).toEqual([])
    })

    it('erroGlobal deve ser null', () => {
      const store = useFluxoCaixaStore()
      expect(store.erroGlobal).toBeNull()
    })

    it('modoComparacao deve ser false', () => {
      const store = useFluxoCaixaStore()
      expect(store.modoComparacao).toBe(false)
    })

    it('modalSimulacaoAberto deve ser false', () => {
      const store = useFluxoCaixaStore()
      expect(store.modalSimulacaoAberto).toBe(false)
    })
  })

  // ------------------------------------------
  // 2. buscarConfiguracao
  // ------------------------------------------

  describe('buscarConfiguracao', () => {
    it('deve definir configuracao e atualizar filtros com defaults da config', async () => {
      mockGetConfiguracao.mockResolvedValue(mockConfiguracao)
      const store = useFluxoCaixaStore()

      await store.buscarConfiguracao()

      expect(store.configuracao).toEqual(mockConfiguracao)
      expect(store.filtros.periodicidade).toBe('mensal')
      expect(store.filtros.contaBancariaIds).toEqual([1, 2])
      expect(store.filtros.dataInicio).not.toBe('')
      expect(store.filtros.dataFim).not.toBe('')
    })

    it('deve alternar carregandoConfiguracao durante a busca', async () => {
      let resolvePromise: (value: FluxoCaixaConfiguracaoDto) => void
      mockGetConfiguracao.mockReturnValue(
        new Promise<FluxoCaixaConfiguracaoDto>((resolve) => {
          resolvePromise = resolve
        }),
      )
      const store = useFluxoCaixaStore()

      const promise = store.buscarConfiguracao()
      expect(store.carregandoConfiguracao).toBe(true)

      resolvePromise!(mockConfiguracao)
      await promise

      expect(store.carregandoConfiguracao).toBe(false)
    })

    it('nao deve sobrescrever filtros se dataInicio ja estiver definida', async () => {
      mockGetConfiguracao.mockResolvedValue(mockConfiguracao)
      const store = useFluxoCaixaStore()
      store.filtros.dataInicio = '2026-02-01'
      store.filtros.dataFim = '2026-04-01'

      await store.buscarConfiguracao()

      expect(store.filtros.dataInicio).toBe('2026-02-01')
      expect(store.filtros.dataFim).toBe('2026-04-01')
    })
  })

  // ------------------------------------------
  // 3. buscarConsolidado
  // ------------------------------------------

  describe('buscarConsolidado', () => {
    it('deve definir consolidado e alternar loading', async () => {
      mockGetConsolidado.mockResolvedValue(mockConsolidado)
      const store = useFluxoCaixaStore()
      store.filtros.dataInicio = '2026-01-01'
      store.filtros.dataFim = '2026-03-31'

      await store.buscarConsolidado()

      expect(store.consolidado).toEqual(mockConsolidado)
      expect(store.carregandoConsolidado).toBe(false)
      expect(mockGetConsolidado).toHaveBeenCalledOnce()
    })

    it('nao deve chamar servico se dataInicio estiver vazia', async () => {
      const store = useFluxoCaixaStore()
      store.filtros.dataInicio = ''
      store.filtros.dataFim = '2026-03-31'

      await store.buscarConsolidado()

      expect(mockGetConsolidado).not.toHaveBeenCalled()
      expect(mockGetRealizado).not.toHaveBeenCalled()
      expect(mockGetProjetado).not.toHaveBeenCalled()
    })

    it('deve chamar getRealizado quando tabAtiva for realizado', async () => {
      mockGetRealizado.mockResolvedValue(mockConsolidado)
      const store = useFluxoCaixaStore()
      store.filtros.dataInicio = '2026-01-01'
      store.filtros.dataFim = '2026-03-31'
      store.tabAtiva = 'realizado'

      await store.buscarConsolidado()

      expect(mockGetRealizado).toHaveBeenCalledOnce()
      expect(mockGetConsolidado).not.toHaveBeenCalled()
      expect(mockGetProjetado).not.toHaveBeenCalled()
    })

    it('deve chamar getProjetado quando tabAtiva for projetado', async () => {
      mockGetProjetado.mockResolvedValue(mockConsolidado)
      const store = useFluxoCaixaStore()
      store.filtros.dataInicio = '2026-01-01'
      store.filtros.dataFim = '2026-03-31'
      store.tabAtiva = 'projetado'

      await store.buscarConsolidado()

      expect(mockGetProjetado).toHaveBeenCalledOnce()
      expect(mockGetConsolidado).not.toHaveBeenCalled()
      expect(mockGetRealizado).not.toHaveBeenCalled()
    })

    it('deve aceitar filtrosOverride', async () => {
      mockGetConsolidado.mockResolvedValue(mockConsolidado)
      const store = useFluxoCaixaStore()
      store.filtros.dataInicio = '2026-01-01'
      store.filtros.dataFim = '2026-03-31'
      store.filtros.periodicidade = 'mensal'

      await store.buscarConsolidado({ periodicidade: 'semanal' })

      expect(mockGetConsolidado).toHaveBeenCalledWith(
        expect.objectContaining({ periodicidade: 'semanal' }),
      )
    })
  })

  // ------------------------------------------
  // 4. buscarConsolidado - tratamento de erro
  // ------------------------------------------

  describe('tratamento de erro', () => {
    it('deve definir erroGlobal quando servico lanca erro', async () => {
      const errorMsg = 'Erro interno do servidor'
      mockGetConsolidado.mockRejectedValue({
        response: { data: { error: { message: errorMsg } } },
      })
      const store = useFluxoCaixaStore()
      store.filtros.dataInicio = '2026-01-01'
      store.filtros.dataFim = '2026-03-31'

      await store.buscarConsolidado()

      expect(store.erroGlobal).toBe(errorMsg)
      expect(store.carregandoConsolidado).toBe(false)
    })

    it('deve usar mensagem padrao quando erro nao tem response', async () => {
      mockGetConsolidado.mockRejectedValue(new Error('Network error'))
      const store = useFluxoCaixaStore()
      store.filtros.dataInicio = '2026-01-01'
      store.filtros.dataFim = '2026-03-31'

      await store.buscarConsolidado()

      expect(store.erroGlobal).toBe('Erro ao buscar fluxo de caixa')
    })

    it('deve limpar erroGlobal ao iniciar nova busca', async () => {
      mockGetConsolidado.mockResolvedValue(mockConsolidado)
      const store = useFluxoCaixaStore()
      store.erroGlobal = 'Erro anterior'
      store.filtros.dataInicio = '2026-01-01'
      store.filtros.dataFim = '2026-03-31'

      await store.buscarConsolidado()

      expect(store.erroGlobal).toBeNull()
    })
  })

  // ------------------------------------------
  // 5. atualizarFiltros
  // ------------------------------------------

  describe('atualizarFiltros', () => {
    it('deve mesclar filtros corretamente', () => {
      const store = useFluxoCaixaStore()

      store.atualizarFiltros({ periodicidade: 'semanal', contaBancariaIds: [3] })

      expect(store.filtros).toEqual({
        dataInicio: '',
        dataFim: '',
        periodicidade: 'semanal',
        contaBancariaIds: [3],
      })
    })

    it('deve preservar filtros nao alterados', () => {
      const store = useFluxoCaixaStore()
      store.filtros.dataInicio = '2026-01-01'
      store.filtros.dataFim = '2026-03-31'

      store.atualizarFiltros({ periodicidade: 'diario' })

      expect(store.filtros.dataInicio).toBe('2026-01-01')
      expect(store.filtros.dataFim).toBe('2026-03-31')
      expect(store.filtros.periodicidade).toBe('diario')
    })
  })

  // ------------------------------------------
  // 6. Computed getters
  // ------------------------------------------

  describe('computed getters', () => {
    it('periodos deve retornar periodos do consolidado', () => {
      const store = useFluxoCaixaStore()
      store.consolidado = mockConsolidado

      expect(store.periodos).toHaveLength(1)
      expect(store.periodos[0]!.rotulo).toBe('Jan/2026')
    })

    it('periodos deve retornar array vazio quando consolidado for null', () => {
      const store = useFluxoCaixaStore()
      expect(store.periodos).toEqual([])
    })

    it('alertas deve retornar alertas do consolidado', () => {
      const store = useFluxoCaixaStore()
      store.consolidado = mockConsolidado

      expect(store.alertas).toHaveLength(1)
      expect(store.alertas[0]!.tipo).toBe('saldo_negativo')
    })

    it('saldosPorConta deve retornar saldos do consolidado', () => {
      const store = useFluxoCaixaStore()
      store.consolidado = mockConsolidado

      expect(store.saldosPorConta).toHaveLength(1)
      expect(store.saldosPorConta[0]!.contaBancariaNome).toBe('Banco do Brasil')
    })

    it('temAlertas deve retornar true quando ha alertas', () => {
      const store = useFluxoCaixaStore()
      store.consolidado = mockConsolidado

      expect(store.temAlertas).toBe(true)
    })

    it('temAlertas deve retornar false quando nao ha alertas', () => {
      const store = useFluxoCaixaStore()
      store.consolidado = { ...mockConsolidado, alertas: [] }

      expect(store.temAlertas).toBe(false)
    })

    it('alertasCriticos deve filtrar apenas alertas com severidade danger', () => {
      const store = useFluxoCaixaStore()
      store.consolidado = {
        ...mockConsolidado,
        alertas: [
          { tipo: 'saldo_negativo', severidade: 'danger', mensagem: 'Critico', data: '2026-04-15', valor: -5000 },
          { tipo: 'saldo_baixo', severidade: 'warning', mensagem: 'Aviso', data: '2026-04-15', valor: 1000 },
        ],
      }

      expect(store.alertasCriticos).toHaveLength(1)
      expect(store.alertasCriticos[0]!.severidade).toBe('danger')
    })

    it('saldoInicial deve retornar valor do consolidado', () => {
      const store = useFluxoCaixaStore()
      store.consolidado = mockConsolidado

      expect(store.saldoInicial).toBe(50000)
    })

    it('saldoFinal deve retornar valor do consolidado', () => {
      const store = useFluxoCaixaStore()
      store.consolidado = mockConsolidado

      expect(store.saldoFinal).toBe(75000)
    })

    it('saldoInicial deve retornar 0 quando consolidado for null', () => {
      const store = useFluxoCaixaStore()
      expect(store.saldoInicial).toBe(0)
    })

    it('saldoFinal deve retornar 0 quando consolidado for null', () => {
      const store = useFluxoCaixaStore()
      expect(store.saldoFinal).toBe(0)
    })

    it('totalEntradas e totalSaidas devem retornar valores do consolidado', () => {
      const store = useFluxoCaixaStore()
      store.consolidado = mockConsolidado

      expect(store.totalEntradas).toBe(100000)
      expect(store.totalSaidas).toBe(75000)
    })
  })

  // ------------------------------------------
  // 7. Simulacoes
  // ------------------------------------------

  describe('listarSimulacoes', () => {
    it('deve popular simulacoes com dados do servico', async () => {
      mockListarSimulacoes.mockResolvedValue([mockSimulacao, mockSimulacao2])
      const store = useFluxoCaixaStore()

      await store.listarSimulacoes()

      expect(store.simulacoes).toHaveLength(2)
      expect(store.simulacoes[0]!.nome).toBe('Cenario Otimista')
      expect(store.simulacoes[1]!.nome).toBe('Cenario Pessimista')
    })

    it('deve alternar carregandoSimulacoes', async () => {
      let resolvePromise: (value: FluxoCaixaSimulacaoDto[]) => void
      mockListarSimulacoes.mockReturnValue(
        new Promise<FluxoCaixaSimulacaoDto[]>((resolve) => {
          resolvePromise = resolve
        }),
      )
      const store = useFluxoCaixaStore()

      const promise = store.listarSimulacoes()
      expect(store.carregandoSimulacoes).toBe(true)

      resolvePromise!([])
      await promise

      expect(store.carregandoSimulacoes).toBe(false)
    })
  })

  describe('criarSimulacao', () => {
    it('deve adicionar simulacao no inicio da lista', async () => {
      mockCriarSimulacao.mockResolvedValue(mockSimulacao)
      const store = useFluxoCaixaStore()
      store.simulacoes = [mockSimulacao2]

      const result = await store.criarSimulacao({
        nome: 'Cenario Otimista',
        dataInicio: '2026-01-01',
        dataFim: '2026-06-30',
      })

      expect(result).toEqual(mockSimulacao)
      expect(store.simulacoes).toHaveLength(2)
      expect(store.simulacoes[0]!.id).toBe(1)
    })
  })

  describe('deletarSimulacao', () => {
    it('deve remover simulacao da lista', async () => {
      mockDeletarSimulacao.mockResolvedValue(undefined)
      const store = useFluxoCaixaStore()
      store.simulacoes = [mockSimulacao, mockSimulacao2]

      await store.deletarSimulacao(1)

      expect(store.simulacoes).toHaveLength(1)
      expect(store.simulacoes[0]!.id).toBe(2)
    })

    it('deve desativar modo comparacao se simulacao ativa for deletada', async () => {
      mockDeletarSimulacao.mockResolvedValue(undefined)
      const store = useFluxoCaixaStore()
      store.simulacoes = [mockSimulacao]
      store.simulacaoAtiva = mockSimulacaoDetail
      store.modoComparacao = true

      await store.deletarSimulacao(1)

      expect(store.modoComparacao).toBe(false)
      expect(store.simulacaoAtiva).toBeNull()
    })
  })

  describe('atualizarSimulacao', () => {
    it('deve atualizar simulacao na lista', async () => {
      const updated = { ...mockSimulacao, nome: 'Cenario Atualizado' }
      mockAtualizarSimulacao.mockResolvedValue(updated)
      const store = useFluxoCaixaStore()
      store.simulacoes = [mockSimulacao, mockSimulacao2]

      const result = await store.atualizarSimulacao(1, { nome: 'Cenario Atualizado' })

      expect(result.nome).toBe('Cenario Atualizado')
      expect(store.simulacoes[0]!.nome).toBe('Cenario Atualizado')
    })
  })

  describe('calcularSimulacao', () => {
    it('deve definir resultadoSimulacaoAtiva', async () => {
      mockCalcularSimulacao.mockResolvedValue(mockConsolidado)
      const store = useFluxoCaixaStore()

      const result = await store.calcularSimulacao(1)

      expect(result).toEqual(mockConsolidado)
      expect(store.resultadoSimulacaoAtiva).toEqual(mockConsolidado)
    })
  })

  // ------------------------------------------
  // 8. Itens de simulacao
  // ------------------------------------------

  describe('itens de simulacao', () => {
    it('adicionarItem deve adicionar item na simulacao ativa', async () => {
      mockAdicionarItem.mockResolvedValue(mockItem)
      const store = useFluxoCaixaStore()
      store.simulacaoAtiva = { ...mockSimulacaoDetail, itens: [] }

      await store.adicionarItem(1, {
        tipoOverride: 'adicionar_entrada',
        descricao: 'Venda extra de soja',
        tipoFluxo: 'entrada',
        dataNova: '2026-03-15',
        valorNovo: 50000,
      })

      expect(store.simulacaoAtiva!.itens).toHaveLength(1)
      expect(store.simulacaoAtiva!.itens![0]!.descricao).toBe('Venda extra de soja')
    })

    it('atualizarItem deve atualizar item existente na simulacao ativa', async () => {
      const updatedItem = { ...mockItem, valorNovo: 60000 }
      mockAtualizarItem.mockResolvedValue(updatedItem)
      const store = useFluxoCaixaStore()
      store.simulacaoAtiva = { ...mockSimulacaoDetail, itens: [mockItem] }

      await store.atualizarItem(1, 10, { valorNovo: 60000 })

      expect(store.simulacaoAtiva!.itens![0]!.valorNovo).toBe(60000)
    })

    it('deletarItem deve remover item da simulacao ativa', async () => {
      mockDeletarItem.mockResolvedValue(undefined)
      const store = useFluxoCaixaStore()
      store.simulacaoAtiva = { ...mockSimulacaoDetail, itens: [mockItem] }

      await store.deletarItem(1, 10)

      expect(store.simulacaoAtiva!.itens).toHaveLength(0)
    })
  })

  // ------------------------------------------
  // 9. Modo comparacao
  // ------------------------------------------

  describe('ativarModoComparacao / desativarModoComparacao', () => {
    it('ativarModoComparacao deve definir simulacaoAtiva e flag', () => {
      const store = useFluxoCaixaStore()

      store.ativarModoComparacao(mockSimulacaoDetail)

      expect(store.modoComparacao).toBe(true)
      expect(store.simulacaoAtiva).toEqual(mockSimulacaoDetail)
    })

    it('desativarModoComparacao deve limpar simulacaoAtiva, resultado e flag', () => {
      const store = useFluxoCaixaStore()
      store.simulacaoAtiva = mockSimulacaoDetail
      store.resultadoSimulacaoAtiva = mockConsolidado
      store.modoComparacao = true

      store.desativarModoComparacao()

      expect(store.modoComparacao).toBe(false)
      expect(store.simulacaoAtiva).toBeNull()
      expect(store.resultadoSimulacaoAtiva).toBeNull()
    })
  })

  // ------------------------------------------
  // 10. Modal de simulacao
  // ------------------------------------------

  describe('abrirModalSimulacao / fecharModalSimulacao', () => {
    it('abrirModalSimulacao sem argumento deve abrir modal sem edicao', () => {
      const store = useFluxoCaixaStore()

      store.abrirModalSimulacao()

      expect(store.modalSimulacaoAberto).toBe(true)
      expect(store.simulacaoEmEdicao).toBeNull()
    })

    it('abrirModalSimulacao com simulacao deve definir edicao', () => {
      const store = useFluxoCaixaStore()

      store.abrirModalSimulacao(mockSimulacaoDetail)

      expect(store.modalSimulacaoAberto).toBe(true)
      expect(store.simulacaoEmEdicao).toEqual(mockSimulacaoDetail)
    })

    it('fecharModalSimulacao deve limpar estado do modal', () => {
      const store = useFluxoCaixaStore()
      store.modalSimulacaoAberto = true
      store.simulacaoEmEdicao = mockSimulacaoDetail

      store.fecharModalSimulacao()

      expect(store.modalSimulacaoAberto).toBe(false)
      expect(store.simulacaoEmEdicao).toBeNull()
    })
  })
})
