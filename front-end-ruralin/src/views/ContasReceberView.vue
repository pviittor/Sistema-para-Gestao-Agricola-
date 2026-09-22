<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { toast } from 'vue3-toastify'
import {
  Plus,
  Search,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Filter,
  X,
} from 'lucide-vue-next'
import TituloReceberModal from '@/components/TituloReceberModal.vue'
import BaixaParcelaModal from '@/components/BaixaParcelaModal.vue'
import { tituloReceberService } from '@/services/tituloReceberService'
import { useSafraStore } from '@/stores/safra'
import { contaService } from '@/services/contaService'
import { parceiroNegocioService } from '@/services/parceiroNegocioService'
import type { ParceiroNegocio } from '@/types/ParceiroNegocio'
import type {
  TituloReceber,
  ParcelaTituloReceber,
  TituloReceberKpis,
} from '@/types/TituloReceber'
import type { TipoGeracao } from '@/types/TituloPagar'

const safraStore = useSafraStore()

// Contas options for BaixaParcelaModal
const contasOptions = ref<Array<{ value: number; label: string }>>([])

const fetchContas = async () => {
  try {
    const result = await contaService.getAll(1, 1000)
    const data = result.data?.data || result.data || []
    contasOptions.value = (data as any[]).map((c: any) => ({
      value: c.id,
      label: c.nome || c.descricao || `Conta #${c.id}`,
    }))
  } catch (error) {
    console.error('Erro ao carregar contas:', error)
  }
}

// Formatters
const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR')
}

// State
const isModalOpen = ref(false)
const isBaixaModalOpen = ref(false)
const isSaving = ref(false)
const isBaixaSaving = ref(false)
const editingItem = ref<TituloReceber | null>(null)
const selectedParcela = ref<ParcelaTituloReceber | null>(null)
const items = ref<TituloReceber[]>([])
const isLoading = ref(false)
const expandedRows = ref<Set<number>>(new Set())
const parcelasMap = ref<Map<number, ParcelaTituloReceber[]>>(new Map())
const loadingParcelas = ref<Set<number>>(new Set())

// KPIs
const kpis = ref<TituloReceberKpis>({
  totalAberto: 0,
  totalVencido: 0,
  totalAVencer30Dias: 0,
  totalRecebidoMes: 0,
  quantidadeAberto: 0,
  quantidadeVencido: 0,
})

// Filters
const searchTerm = ref('')
const selectedStatuses = ref<string[]>([])
const selectedTipoGeracao = ref<TipoGeracao | ''>('')
const showFilters = ref(false)
const selectedCliente = ref<number | ''>('')
const selectedPortador = ref<number | ''>('')
const selectedProdutor = ref<number | ''>('')

// Lookup options
const clientesOptions = ref<Array<{ value: number; label: string }>>([])
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

    clientesOptions.value = pessoas.filter((p) => p.cliente_pessoa).map(toOption)
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

// Status options
const statusOptions = [
  { value: 'ABERTO', label: 'Aberto' },
  { value: 'PARCIAL', label: 'Parcial' },
  { value: 'BAIXADO', label: 'Baixado' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

const tipoGeracaoOptions = [
  { value: '', label: 'Todos' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'PARCELADO', label: 'Parcelado' },
  { value: 'RECORRENTE', label: 'Recorrente' },
]

// Status chip styles
const statusChipClass = (status: string) => {
  switch (status) {
    case 'ABERTO':
    case 'ABERTA':
      return 'bg-blue-100 text-blue-800'
    case 'PARCIAL':
      return 'bg-yellow-100 text-yellow-800'
    case 'BAIXADO':
    case 'BAIXADA':
      return 'bg-green-100 text-green-800'
    case 'CANCELADO':
    case 'CANCELADA':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'ABERTO':
    case 'ABERTA':
      return 'Aberto'
    case 'PARCIAL':
      return 'Parcial'
    case 'BAIXADO':
    case 'BAIXADA':
      return 'Baixado'
    case 'CANCELADO':
    case 'CANCELADA':
      return 'Cancelado'
    default:
      return status
  }
}

// Aging indicator for parcelas
const agingChipClass = (parcela: ParcelaTituloReceber) => {
  if (parcela.status === 'BAIXADA' || parcela.status === 'CANCELADA') return ''
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const vencimento = new Date(parcela.dataVencimento + 'T00:00:00')
  const diffDias = Math.floor((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDias < 0) return 'bg-red-100 text-red-800'
  if (diffDias <= 7) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const agingLabel = (parcela: ParcelaTituloReceber) => {
  if (parcela.status === 'BAIXADA') return 'Baixada'
  if (parcela.status === 'CANCELADA') return 'Cancelada'
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const vencimento = new Date(parcela.dataVencimento + 'T00:00:00')
  const diffDias = Math.floor((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDias < 0) return `Vencido ${Math.abs(diffDias)}d`
  if (diffDias === 0) return 'Vence hoje'
  if (diffDias <= 7) return `Vence em ${diffDias}d`
  return 'Em dia'
}

// Toggle status filter
const toggleStatus = (status: string) => {
  const index = selectedStatuses.value.indexOf(status)
  if (index === -1) {
    selectedStatuses.value.push(status)
  } else {
    selectedStatuses.value.splice(index, 1)
  }
  currentPage.value = 1
  fetchItems()
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedStatuses.value = []
  selectedTipoGeracao.value = ''
  selectedCliente.value = ''
  selectedPortador.value = ''
  selectedProdutor.value = ''
  currentPage.value = 1
  fetchItems()
}

const hasActiveFilters = computed(() =>
  searchTerm.value || selectedStatuses.value.length > 0 || selectedTipoGeracao.value
  || selectedCliente.value || selectedPortador.value || selectedProdutor.value
)

// Fetch data
const fetchItems = async () => {
  isLoading.value = true
  try {
    let result

    if (safraStore.selectedSafraId) {
      result = await tituloReceberService.getBySafra(safraStore.selectedSafraId, currentPage.value, itemsPerPage.value)
    } else {
      const filtros: Record<string, unknown> = {}
      if (searchTerm.value) filtros.search = searchTerm.value
      if (selectedStatuses.value.length > 0) filtros.status = selectedStatuses.value.join(',')
      if (selectedTipoGeracao.value) filtros.tipoGeracao = selectedTipoGeracao.value
      if (selectedCliente.value) filtros.idCliente = selectedCliente.value
      if (selectedPortador.value) filtros.idPortador = selectedPortador.value
      if (selectedProdutor.value) filtros.idProdutor = selectedProdutor.value

      result = await tituloReceberService.getAll(currentPage.value, itemsPerPage.value, filtros)
    }

    items.value = result.data || []
    if (result.page) currentPage.value = result.page
    if (result.totalPages) totalPages.value = result.totalPages
    if (result.total) totalItems.value = result.total
  } catch (error) {
    console.error(error)
    toast.error('Erro ao carregar titulos a receber')
  } finally {
    isLoading.value = false
  }
}

const fetchKpis = async () => {
  try {
    const filtros: { idSafra?: number } = {}
    if (safraStore.selectedSafraId) filtros.idSafra = safraStore.selectedSafraId
    const result = await tituloReceberService.getKpis(filtros)
    kpis.value = result as TituloReceberKpis
  } catch (error) {
    console.error(error)
  }
}

const fetchParcelas = async (tituloId: number) => {
  loadingParcelas.value.add(tituloId)
  try {
    const result = await tituloReceberService.getParcelas(tituloId)
    parcelasMap.value.set(tituloId, result.data)
  } catch (error) {
    console.error(error)
    toast.error('Erro ao carregar parcelas')
  } finally {
    loadingParcelas.value.delete(tituloId)
  }
}

// Row expansion
const toggleRow = async (tituloId: number) => {
  if (expandedRows.value.has(tituloId)) {
    expandedRows.value.delete(tituloId)
  } else {
    expandedRows.value.add(tituloId)
    if (!parcelasMap.value.has(tituloId)) {
      await fetchParcelas(tituloId)
    }
  }
}

// CRUD handlers
const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleEdit = (item: TituloReceber) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir este titulo a receber?')) {
    try {
      await tituloReceberService.delete(id)
      toast.success('Titulo excluido com sucesso!')
      expandedRows.value.delete(id)
      parcelasMap.value.delete(id)
      await fetchItems()
      await fetchKpis()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao excluir titulo. Verifique se existem parcelas baixadas.')
    }
  }
}

const handleSave = async (data: TituloReceber) => {
  isSaving.value = true
  try {
    if (editingItem.value?.id) {
      await tituloReceberService.update(editingItem.value.id, data as any)
      toast.success('Titulo atualizado com sucesso!')
    } else {
      await tituloReceberService.create(data as any)
      toast.success('Titulo criado com sucesso!')
    }
    isModalOpen.value = false
    await fetchItems()
    await fetchKpis()
  } catch {
    toast.error('Erro ao salvar titulo a receber.')
  } finally {
    isSaving.value = false
  }
}

// Baixa handlers
const handleBaixar = (parcela: ParcelaTituloReceber) => {
  selectedParcela.value = parcela
  isBaixaModalOpen.value = true
}

const handleBaixaSave = async (data: any) => {
  isBaixaSaving.value = true
  try {
    await tituloReceberService.baixarParcela(data)
    toast.success('Recebimento realizado com sucesso!')
    isBaixaModalOpen.value = false
    // Refresh parcelas for the titulo
    if (selectedParcela.value) {
      await fetchParcelas(selectedParcela.value.idTituloReceber)
    }
    await fetchItems()
    await fetchKpis()
  } catch {
    toast.error('Erro ao realizar recebimento da parcela.')
  } finally {
    isBaixaSaving.value = false
  }
}

// Pagination
const handlePageChange = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    currentPage.value = newPage
    fetchItems()
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

watch(selectedTipoGeracao, () => {
  currentPage.value = 1
  fetchItems()
})

watch(() => safraStore.selectedSafraId, () => {
  currentPage.value = 1
  fetchItems()
  fetchKpis()
})

onMounted(() => {
  fetchItems()
  fetchKpis()
  fetchContas()
  fetchPessoasLookups()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <TituloReceberModal
      :is-open="isModalOpen"
      :initial-data="editingItem"
      :loading="isSaving"
      @close="isModalOpen = false"
      @save="handleSave"
    />

    <BaixaParcelaModal
      :is-open="isBaixaModalOpen"
      :parcela="selectedParcela"
      tipo="RECEBER"
      :loading="isBaixaSaving"
      :contas-options="contasOptions"
      @close="isBaixaModalOpen = false"
      @save="handleBaixaSave"
    />

    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Contas a Receber</h1>
          <p class="text-gray-500 mt-1">Gerencie os titulos e parcelas a receber da sua propriedade</p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Novo Titulo
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total em Aberto -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Total a Receber</p>
              <p class="text-xl font-bold text-gray-900">{{ formatCurrency(kpis.totalAberto) }}</p>
              <p class="text-xs text-gray-400">{{ kpis.quantidadeAberto }} titulos</p>
            </div>
          </div>
        </div>

        <!-- Total Vencido -->
        <div class="bg-white rounded-xl shadow-sm border border-red-100 p-6">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle class="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Inadimplencia</p>
              <p class="text-xl font-bold text-red-600">{{ formatCurrency(kpis.totalVencido) }}</p>
              <p class="text-xs text-gray-400">{{ kpis.quantidadeVencido }} titulos</p>
            </div>
          </div>
        </div>

        <!-- A Vencer 30 Dias -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock class="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">A Receber 30 Dias</p>
              <p class="text-xl font-bold text-gray-900">{{ formatCurrency(kpis.totalAVencer30Dias) }}</p>
            </div>
          </div>
        </div>

        <!-- Recebido no Mes -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 class="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Recebido no Mes</p>
              <p class="text-xl font-bold text-gray-900">{{ formatCurrency(kpis.totalRecebidoMes) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters & Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Search & Filter Bar -->
        <div class="p-6 border-b border-gray-100 space-y-4">
          <div class="flex flex-col sm:flex-row justify-between gap-4">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-gray-900">Titulos a Receber</h2>
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
                  placeholder="Buscar por numero ou cliente..."
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
            <!-- Status Multi-Select -->
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm text-gray-500 font-medium">Status:</span>
              <button
                v-for="opt in statusOptions"
                :key="opt.value"
                @click="toggleStatus(opt.value)"
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  selectedStatuses.includes(opt.value)
                    ? statusChipClass(opt.value) + ' border-transparent'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                ]"
              >
                {{ opt.label }}
              </button>
            </div>

            <!-- Tipo Geracao -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500 font-medium">Tipo:</span>
              <select
                v-model="selectedTipoGeracao"
                class="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option v-for="opt in tipoGeracaoOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Cliente -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500 font-medium">Cliente:</span>
              <select
                v-model="selectedCliente"
                @change="currentPage = 1; fetchItems()"
                class="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent max-w-[200px]"
              >
                <option value="">Todos</option>
                <option v-for="opt in clientesOptions" :key="opt.value" :value="opt.value">
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
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">N Titulo</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Data Lancamento</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Parcelas</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Valor Total</th>
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
                    <span class="font-mono bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">
                      {{ item.numeroTitulo }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ item.cliente?.nomerazao_pessoa || '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ formatDate(item.dataLancamento) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {{ item.quantidadeParcelas }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {{ formatCurrency(item.valorTitulo) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        statusChipClass(item.status)
                      ]"
                    >
                      {{ statusLabel(item.status) }}
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
                        @click="handleDelete(item.id)"
                        class="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Expanded Parcelas Row -->
                <tr v-if="expandedRows.has(item.id)">
                  <td colspan="8" class="px-0 py-0">
                    <div class="bg-gray-50 border-t border-b border-gray-200 px-8 py-4">
                      <!-- Loading parcelas -->
                      <div v-if="loadingParcelas.has(item.id)" class="flex justify-center py-4">
                        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-lime-600"></div>
                      </div>

                      <!-- Parcelas table -->
                      <div v-else-if="parcelasMap.get(item.id)?.length" class="overflow-x-auto">
                        <h4 class="text-sm font-bold text-gray-700 mb-3">Parcelas</h4>
                        <table class="w-full text-sm">
                          <thead>
                            <tr class="text-xs text-gray-500 uppercase">
                              <th class="px-3 py-2 text-left">N</th>
                              <th class="px-3 py-2 text-left">Vencimento</th>
                              <th class="px-3 py-2 text-right">Valor</th>
                              <th class="px-3 py-2 text-right">Juros</th>
                              <th class="px-3 py-2 text-right">Multa</th>
                              <th class="px-3 py-2 text-right">Total</th>
                              <th class="px-3 py-2 text-right">Pago</th>
                              <th class="px-3 py-2 text-right">Saldo</th>
                              <th class="px-3 py-2 text-center">Status</th>
                              <th class="px-3 py-2 text-right">Acoes</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-200">
                            <tr
                              v-for="parcela in parcelasMap.get(item.id)"
                              :key="parcela.id"
                              class="hover:bg-gray-100 transition-colors"
                            >
                              <td class="px-3 py-2 text-gray-700">
                                {{ parcela.numeroParcela }}/{{ parcela.numeroTotalParcelas }}
                              </td>
                              <td class="px-3 py-2 text-gray-700">
                                {{ formatDate(parcela.dataVencimento) }}
                              </td>
                              <td class="px-3 py-2 text-right text-gray-700">
                                {{ formatCurrency(parcela.valorParcela) }}
                              </td>
                              <td class="px-3 py-2 text-right text-gray-700">
                                {{ formatCurrency(parcela.valorJuros) }}
                              </td>
                              <td class="px-3 py-2 text-right text-gray-700">
                                {{ formatCurrency(parcela.valorMulta) }}
                              </td>
                              <td class="px-3 py-2 text-right font-medium text-gray-900">
                                {{ formatCurrency(parcela.valorTotal) }}
                              </td>
                              <td class="px-3 py-2 text-right text-gray-700">
                                {{ formatCurrency(parcela.valorPago) }}
                              </td>
                              <td class="px-3 py-2 text-right font-medium text-gray-900">
                                {{ formatCurrency(parcela.valorSaldo) }}
                              </td>
                              <td class="px-3 py-2 text-center">
                                <span
                                  :class="[
                                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                                    agingChipClass(parcela) || statusChipClass(parcela.status)
                                  ]"
                                >
                                  {{ agingLabel(parcela) }}
                                </span>
                              </td>
                              <td class="px-3 py-2 text-right">
                                <button
                                  v-if="parcela.status === 'ABERTA' || parcela.status === 'PARCIAL'"
                                  @click="handleBaixar(parcela)"
                                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-lime-700 bg-lime-100 rounded hover:bg-lime-200 transition-colors"
                                  title="Receber parcela"
                                >
                                  <CreditCard class="h-3 w-3" />
                                  Receber
                                </button>
                                <span v-else class="text-gray-400 text-xs">-</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <!-- No parcelas -->
                      <div v-else class="text-sm text-gray-500 text-center py-4">
                        Nenhuma parcela encontrada para este titulo.
                      </div>
                    </div>
                  </td>
                </tr>
              </template>

              <!-- Empty state -->
              <tr v-if="items.length === 0">
                <td colspan="8" class="px-6 py-8 text-center text-gray-500 text-sm">
                  <div v-if="isLoading" class="flex justify-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-lime-600"></div>
                  </div>
                  <span v-else>Nenhum titulo a receber encontrado.</span>
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
