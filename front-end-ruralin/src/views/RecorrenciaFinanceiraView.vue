<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { toast } from 'vue3-toastify'
import {
  Plus,
  Search,
  Repeat,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  FileText,
  DollarSign,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  Play,
} from 'lucide-vue-next'
import RecorrenciaFinanceiraModal from '@/components/RecorrenciaFinanceiraModal.vue'
import type {
  RecorrenciaFinanceira,
  TipoRecorrencia,
  Periodicidade,
  LancamentoRecorrente,
  RecorrenciaFinanceiraKpis,
} from '@/types/RecorrenciaFinanceira'
import { recorrenciaFinanceiraService } from '@/services/recorrenciaFinanceiraService'
import { parceiroNegocioService } from '@/services/parceiroNegocioService'
import type { ParceiroNegocio } from '@/types/ParceiroNegocio'

// Formatters
const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR')
}

// State
const isModalOpen = ref(false)
const isSaving = ref(false)
const editingItem = ref<RecorrenciaFinanceira | null>(null)
const items = ref<RecorrenciaFinanceira[]>([])
const isLoading = ref(false)
const expandedRows = ref<Set<number>>(new Set())
const lancamentosMap = ref<Map<number, LancamentoRecorrente[]>>(new Map())
const loadingLancamentos = ref<Set<number>>(new Set())

// KPIs
const kpis = ref<RecorrenciaFinanceiraKpis>({
  totalAtivasPagar: 0,
  totalAtivasReceber: 0,
  valorTotalPagar: 0,
  valorTotalReceber: 0,
  totalInativas: 0,
  proximasGeracoes: 0,
})

// Filters
const searchTerm = ref('')
const activeTab = ref<TipoRecorrencia | null>(null)
const selectedAtiva = ref<string>('')
const selectedPeriodicidade = ref<string>('')
const showFilters = ref(false)
const selectedFornecedorCliente = ref<number | ''>('')
const selectedPortador = ref<number | ''>('')
const selectedProdutor = ref<number | ''>('')

// Lookup options
const fornecedoresClientesOptions = ref<Array<{ value: number; label: string }>>([])
const portadoresOptions = ref<Array<{ value: number; label: string }>>([])
const produtoresOptions = ref<Array<{ value: number; label: string }>>([])

const fetchPessoasLookups = async () => {
  try {
    const result = await parceiroNegocioService.getAllNoPagination()
    const pessoas: ParceiroNegocio[] = Array.isArray(result)
      ? result
      : (result as any)?.data?.data || (result as any)?.data || []

    const toOption = (p: ParceiroNegocio) => ({
      value: p.id_pessoa!,
      label: p.nomerazao_pessoa ?? '',
    })

    fornecedoresClientesOptions.value = pessoas
      .filter((p) => p.fornecedor_pessoa || p.cliente_pessoa)
      .map(toOption)
    portadoresOptions.value = pessoas.filter((p) => p.portador_pessoa).map(toOption)
    produtoresOptions.value = pessoas.filter((p) => p.produtor_pessoa).map(toOption)
  } catch (error) {
    console.error('Erro ao carregar pessoas:', error)
  }
}

// Pagination
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const itemsPerPage = ref(10)

const periodicidadeLabels: Record<Periodicidade, string> = {
  SEMANAL: 'Semanal',
  QUINZENAL: 'Quinzenal',
  MENSAL: 'Mensal',
  BIMESTRAL: 'Bimestral',
  TRIMESTRAL: 'Trimestral',
  SEMESTRAL: 'Semestral',
  ANUAL: 'Anual',
  SAFRA: 'Safra',
}

const periodicidadeOptions = [
  { value: '', label: 'Todas' },
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'QUINZENAL', label: 'Quinzenal' },
  { value: 'MENSAL', label: 'Mensal' },
  { value: 'BIMESTRAL', label: 'Bimestral' },
  { value: 'TRIMESTRAL', label: 'Trimestral' },
  { value: 'SEMESTRAL', label: 'Semestral' },
  { value: 'ANUAL', label: 'Anual' },
  { value: 'SAFRA', label: 'Safra' },
]

const ativaOptions = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Ativas' },
  { value: 'false', label: 'Inativas' },
]

const clearFilters = () => {
  searchTerm.value = ''
  selectedAtiva.value = ''
  selectedPeriodicidade.value = ''
  selectedFornecedorCliente.value = ''
  selectedPortador.value = ''
  selectedProdutor.value = ''
  currentPage.value = 1
  fetchItems()
}

const hasActiveFilters = computed(() =>
  searchTerm.value || selectedAtiva.value || selectedPeriodicidade.value
  || selectedFornecedorCliente.value || selectedPortador.value || selectedProdutor.value
)

// Fetch data
const fetchItems = async () => {
  isLoading.value = true
  try {
    const filtros: Record<string, unknown> = {}
    if (activeTab.value) filtros.tipo = activeTab.value
    if (searchTerm.value) filtros.search = searchTerm.value
    if (selectedAtiva.value) filtros.ativa = selectedAtiva.value
    if (selectedPeriodicidade.value) filtros.periodicidade = selectedPeriodicidade.value
    if (selectedFornecedorCliente.value) filtros.idFornecedorCliente = selectedFornecedorCliente.value
    if (selectedPortador.value) filtros.idPortador = selectedPortador.value
    if (selectedProdutor.value) filtros.idProdutor = selectedProdutor.value

    const result = await recorrenciaFinanceiraService.getAll(currentPage.value, itemsPerPage.value, filtros)
    items.value = result.data || []
    if (result.page) currentPage.value = result.page
    if (result.totalPages) totalPages.value = result.totalPages
    if (result.total) totalItems.value = result.total
  } catch (error) {
    console.error(error)
    toast.error('Erro ao carregar recorrencias financeiras')
  } finally {
    isLoading.value = false
  }
}

const fetchKpis = async () => {
  try {
    const result = await recorrenciaFinanceiraService.getKpis()
    kpis.value = result as RecorrenciaFinanceiraKpis
  } catch (error) {
    console.error(error)
  }
}

const fetchLancamentos = async (recorrenciaId: number) => {
  loadingLancamentos.value.add(recorrenciaId)
  try {
    const result = await recorrenciaFinanceiraService.getLancamentos(recorrenciaId)
    const data = Array.isArray(result) ? result : (result as any).data || result
    lancamentosMap.value.set(recorrenciaId, data as LancamentoRecorrente[])
  } catch (error) {
    console.error(error)
    toast.error('Erro ao carregar lancamentos')
  } finally {
    loadingLancamentos.value.delete(recorrenciaId)
  }
}

// Row expansion
const toggleRow = async (recorrenciaId: number) => {
  if (expandedRows.value.has(recorrenciaId)) {
    expandedRows.value.delete(recorrenciaId)
  } else {
    expandedRows.value.add(recorrenciaId)
    if (!lancamentosMap.value.has(recorrenciaId)) {
      await fetchLancamentos(recorrenciaId)
    }
  }
}

// CRUD handlers
const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleEdit = (item: RecorrenciaFinanceira) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta recorrencia financeira?')) {
    try {
      await recorrenciaFinanceiraService.delete(id)
      toast.success('Recorrencia financeira excluida com sucesso!')
      expandedRows.value.delete(id)
      lancamentosMap.value.delete(id)
      await fetchItems()
      await fetchKpis()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao excluir recorrencia financeira. Verifique se existem lancamentos vinculados.')
    }
  }
}

const handleSave = async (data: Partial<RecorrenciaFinanceira>) => {
  isSaving.value = true
  try {
    if (editingItem.value?.id) {
      await recorrenciaFinanceiraService.update(editingItem.value.id, data)
      toast.success('Recorrencia financeira atualizada com sucesso!')
    } else {
      await recorrenciaFinanceiraService.create(data)
      toast.success('Recorrencia financeira criada com sucesso!')
    }
    isModalOpen.value = false
    await fetchItems()
    await fetchKpis()
  } catch {
    toast.error('Erro ao salvar recorrencia financeira.')
  } finally {
    isSaving.value = false
  }
}

const handleToggleAtiva = async (id: number) => {
  try {
    await recorrenciaFinanceiraService.toggleAtiva(id)
    toast.success('Status da recorrencia alterado com sucesso!')
    await fetchItems()
    await fetchKpis()
  } catch (error) {
    console.error(error)
    toast.error('Erro ao alterar status da recorrencia.')
  }
}

const handleGerarAgora = async (item: RecorrenciaFinanceira) => {
  try {
    await recorrenciaFinanceiraService.gerarAgora(item.id)
    toast.success('Lancamento gerado com sucesso!')
    // Refresh lancamentos if expanded
    if (expandedRows.value.has(item.id)) {
      await fetchLancamentos(item.id)
    }
    await fetchItems()
    await fetchKpis()
  } catch (error: any) {
    const msg = error?.response?.data?.error?.message || 'Erro ao gerar lancamento.'
    toast.error(msg)
  }
}

const handleTabChange = (tipo: TipoRecorrencia | null) => {
  activeTab.value = tipo
  currentPage.value = 1
  fetchItems()
}

const handlePageChange = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    currentPage.value = newPage
    fetchItems()
  }
}

const getProximoVencimento = (item: RecorrenciaFinanceira): string => {
  if (!item.ativa) return '-'
  const hoje = new Date()
  const dia = item.diaVencimento
  let proximo = new Date(hoje.getFullYear(), hoje.getMonth(), dia)
  if (proximo <= hoje) {
    proximo = new Date(hoje.getFullYear(), hoje.getMonth() + 1, dia)
  }
  return proximo.toLocaleDateString('pt-BR')
}

const lancamentoStatusChipClass = (status: string) => {
  switch (status) {
    case 'GERADO':
      return 'bg-green-100 text-green-800'
    case 'CANCELADO':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

// Search debounce
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchTerm, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchItems()
  }, 400)
})

watch(selectedAtiva, () => {
  currentPage.value = 1
  fetchItems()
})

watch(selectedPeriodicidade, () => {
  currentPage.value = 1
  fetchItems()
})

onMounted(() => {
  fetchItems()
  fetchKpis()
  fetchPessoasLookups()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <RecorrenciaFinanceiraModal
      :is-open="isModalOpen"
      :initial-data="editingItem"
      :loading="isSaving"
      @close="isModalOpen = false"
      @save="handleSave"
    />

    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Lancamentos Recorrentes</h1>
          <p class="text-gray-500 mt-1">Gerencie suas recorrencias financeiras de pagamentos e recebimentos</p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Nova Recorrencia
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Ativas a Pagar -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <DollarSign class="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Ativas a Pagar</p>
              <p class="text-xl font-bold text-gray-900">{{ formatCurrency(kpis.valorTotalPagar) }}</p>
              <p class="text-xs text-gray-400">{{ kpis.totalAtivasPagar }} recorrencias</p>
            </div>
          </div>
        </div>

        <!-- Ativas a Receber -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Ativas a Receber</p>
              <p class="text-xl font-bold text-gray-900">{{ formatCurrency(kpis.valorTotalReceber) }}</p>
              <p class="text-xs text-gray-400">{{ kpis.totalAtivasReceber }} recorrencias</p>
            </div>
          </div>
        </div>

        <!-- Proximas Geracoes -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock class="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Proximas Geracoes</p>
              <p class="text-xl font-bold text-gray-900">{{ kpis.proximasGeracoes }}</p>
              <p class="text-xs text-gray-400">recorrencias pendentes</p>
            </div>
          </div>
        </div>

        <!-- Inativas -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <AlertTriangle class="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Inativas</p>
              <p class="text-xl font-bold text-gray-900">{{ kpis.totalInativas }}</p>
              <p class="text-xs text-gray-400">recorrencias desativadas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2">
        <button
          @click="handleTabChange(null)"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === null
              ? 'bg-lime-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
          ]"
        >
          Todos
        </button>
        <button
          @click="handleTabChange('PAGAR')"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'PAGAR'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
          ]"
        >
          A Pagar
        </button>
        <button
          @click="handleTabChange('RECEBER')"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'RECEBER'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
          ]"
        >
          A Receber
        </button>
      </div>

      <!-- Filters & Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Search & Filter Bar -->
        <div class="p-6 border-b border-gray-100 space-y-4">
          <div class="flex flex-col sm:flex-row justify-between gap-4">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-gray-900">Lista de Recorrencias</h2>
              <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{{ totalItems }} itens</span>
            </div>

            <div class="flex items-center gap-2">
              <div class="relative w-full sm:w-72">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="searchTerm"
                  type="text"
                  placeholder="Buscar por descricao..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
              </div>
              <button
                @click="showFilters = !showFilters"
                :class="[
                  'inline-flex items-center px-3 py-2 border rounded-lg text-sm transition-colors gap-1',
                  hasActiveFilters
                    ? 'border-lime-300 bg-lime-50 text-lime-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                ]"
              >
                <Filter class="h-4 w-4" />
                Filtros
              </button>
            </div>
          </div>

          <!-- Expanded Filters -->
          <div v-if="showFilters" class="flex flex-wrap items-center gap-4 pt-2">
            <!-- Status Ativa -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500 font-medium">Status:</span>
              <select
                v-model="selectedAtiva"
                class="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option v-for="opt in ativaOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Periodicidade -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500 font-medium">Periodicidade:</span>
              <select
                v-model="selectedPeriodicidade"
                class="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option v-for="opt in periodicidadeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Fornecedor/Cliente -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500 font-medium">Forn./Cliente:</span>
              <select
                v-model="selectedFornecedorCliente"
                @change="currentPage = 1; fetchItems()"
                class="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent max-w-[200px]"
              >
                <option value="">Todos</option>
                <option v-for="opt in fornecedoresClientesOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Portador -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500 font-medium">Portador:</span>
              <select
                v-model="selectedPortador"
                @change="currentPage = 1; fetchItems()"
                class="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent max-w-[200px]"
              >
                <option value="">Todos</option>
                <option v-for="opt in portadoresOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Produtor -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500 font-medium">Produtor:</span>
              <select
                v-model="selectedProdutor"
                @change="currentPage = 1; fetchItems()"
                class="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent max-w-[200px]"
              >
                <option value="">Todos</option>
                <option v-for="opt in produtoresOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Clear Filters -->
            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <X class="h-3 w-3" />
              Limpar filtros
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-8"></th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Descricao</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Periodicidade</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Valor</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Prox. Vencimento</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Geracoes</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acoes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <template v-for="item in items" :key="item.id">
                <!-- Main Row -->
                <tr
                  class="hover:bg-gray-50 transition-colors cursor-pointer"
                  @click="toggleRow(item.id)"
                >
                  <td class="pl-6 py-4">
                    <ChevronDown
                      v-if="expandedRows.has(item.id)"
                      class="h-4 w-4 text-gray-400 transition-transform"
                    />
                    <ChevronRight v-else class="h-4 w-4 text-gray-400 transition-transform" />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div class="h-10 w-10 rounded-lg bg-lime-100 flex items-center justify-center text-lime-600">
                        <Repeat class="h-5 w-5" />
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ item.descricao }}</div>
                        <div v-if="item.fornecedorCliente" class="text-xs text-gray-400">
                          {{ item.fornecedorCliente.nome_pessoa }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        item.tipo === 'PAGAR'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800',
                      ]"
                    >
                      {{ item.tipo === 'PAGAR' ? 'A Pagar' : 'A Receber' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ periodicidadeLabels[item.periodicidade] }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    {{ formatCurrency(item.valor) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ getProximoVencimento(item) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    <span class="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                      {{ item.geracoesRealizadas }}{{ item.numeroMaximoGeracoes ? '/' + item.numeroMaximoGeracoes : '' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      v-if="item.ativa"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 gap-1"
                    >
                      <CheckCircle class="h-3 w-3" /> Ativa
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 gap-1"
                    >
                      <XCircle class="h-3 w-3" /> Inativa
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" @click.stop>
                    <div class="flex items-center justify-end gap-2">
                      <button
                        @click="handleEdit(item)"
                        class="p-1 text-gray-400 hover:text-lime-600 transition-colors"
                        title="Editar"
                      >
                        <Pencil class="h-4 w-4" />
                      </button>
                      <button
                        @click="handleToggleAtiva(item.id)"
                        class="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                        :title="item.ativa ? 'Desativar' : 'Ativar'"
                      >
                        <ToggleRight v-if="item.ativa" class="h-4 w-4" />
                        <ToggleLeft v-else class="h-4 w-4" />
                      </button>
                      <button
                        v-if="item.ativa"
                        @click="handleGerarAgora(item)"
                        class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Gerar lancamento agora"
                      >
                        <Play class="h-4 w-4" />
                      </button>
                      <button
                        @click="handleDelete(item.id)"
                        class="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Expanded Lancamentos Row -->
                <tr v-if="expandedRows.has(item.id)">
                  <td colspan="9" class="px-0 py-0">
                    <div class="bg-gray-50 border-t border-b border-gray-200 px-8 py-4">
                      <!-- Loading lancamentos -->
                      <div v-if="loadingLancamentos.has(item.id)" class="flex justify-center py-4">
                        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-lime-600"></div>
                      </div>

                      <!-- Lancamentos table -->
                      <div v-else-if="lancamentosMap.get(item.id)?.length" class="overflow-x-auto">
                        <h4 class="text-sm font-bold text-gray-700 mb-3">Lancamentos Gerados</h4>
                        <table class="w-full text-sm">
                          <thead>
                            <tr class="text-xs text-gray-500 uppercase">
                              <th class="px-3 py-2 text-left">Data Referencia</th>
                              <th class="px-3 py-2 text-left">Vencimento Gerado</th>
                              <th class="px-3 py-2 text-right">Valor</th>
                              <th class="px-3 py-2 text-center">Status</th>
                              <th class="px-3 py-2 text-left">Titulo Gerado</th>
                              <th class="px-3 py-2 text-left">Observacao</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-200">
                            <tr
                              v-for="lanc in lancamentosMap.get(item.id)"
                              :key="lanc.id"
                              class="hover:bg-gray-100 transition-colors"
                            >
                              <td class="px-3 py-2 text-gray-700">
                                {{ formatDate(lanc.dataReferencia) }}
                              </td>
                              <td class="px-3 py-2 text-gray-700">
                                {{ formatDate(lanc.dataVencimentoGerado) }}
                              </td>
                              <td class="px-3 py-2 text-right font-medium text-gray-900">
                                {{ formatCurrency(lanc.valorGerado) }}
                              </td>
                              <td class="px-3 py-2 text-center">
                                <span
                                  :class="[
                                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                                    lancamentoStatusChipClass(lanc.status)
                                  ]"
                                >
                                  {{ lanc.status === 'GERADO' ? 'Gerado' : 'Cancelado' }}
                                </span>
                              </td>
                              <td class="px-3 py-2 text-gray-700">
                                <span v-if="lanc.tituloPagarId" class="font-mono bg-red-50 px-2 py-0.5 rounded text-xs text-red-700">
                                  Pagar #{{ lanc.tituloPagarId }}
                                </span>
                                <span v-else-if="lanc.tituloReceberId" class="font-mono bg-blue-50 px-2 py-0.5 rounded text-xs text-blue-700">
                                  Receber #{{ lanc.tituloReceberId }}
                                </span>
                                <span v-else class="text-gray-400">-</span>
                              </td>
                              <td class="px-3 py-2 text-gray-500 text-xs">
                                {{ lanc.observacao || '-' }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <!-- No lancamentos -->
                      <div v-else class="text-sm text-gray-500 text-center py-4">
                        Nenhum lancamento gerado para esta recorrencia.
                      </div>
                    </div>
                  </td>
                </tr>
              </template>

              <!-- Empty state -->
              <tr v-if="items.length === 0">
                <td colspan="9" class="px-6 py-8 text-center text-gray-500 text-sm">
                  <div v-if="isLoading" class="flex justify-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-lime-600"></div>
                  </div>
                  <span v-else>Nenhuma recorrencia financeira encontrada.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Mostrando pagina {{ currentPage }} de {{ totalPages }}
            <span class="text-gray-400">({{ totalItems }} registros)</span>
          </div>
          <div class="flex gap-2">
            <button
              @click="handlePageChange(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              @click="handlePageChange(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proxima
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
