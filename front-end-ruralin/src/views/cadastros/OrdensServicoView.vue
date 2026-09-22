<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { toast } from 'vue3-toastify'
import { useSafraStore } from '@/stores/safra'
import {
  Plus,
  Eye,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Calendar,
  Play,
  CheckCircle,
  AlertTriangle,
  List,
  BarChart3,
  Map,
} from 'lucide-vue-next'
import OrdemServicoModal from '@/components/OrdemServicoModal.vue'
import OrdemServicoDetalhes from '@/components/OrdemServicoDetalhes.vue'
import TimelineSemanal from '@/components/TimelineSemanal.vue'
import MapaCalorTalhoes from '@/components/MapaCalorTalhoes.vue'
import type {
  OrdemServico,
  CreateOrdemServicoCompletoPayload,
  OrdemServicoKPIs,
  TimelineEntry,
  MapaCalorEntry,
} from '@/types/OrdemServico'
import { StatusOrdemServico, PrioridadeOrdemServico } from '@/types/OrdemServico'
import type { TipoAtividadeOS } from '@/types/TipoAtividadeOS'
import type { Propriedade } from '@/types/Propriedade'
import { ordemServicoService } from '@/services/ordemServicoService'
import { tipoAtividadeOSService } from '@/services/tipoAtividadeOSService'
import { propriedadeService } from '@/services/propriedadeService'

const safraStore = useSafraStore()

// Modal state
const isModalOpen = ref(false)
const editingItem = ref<OrdemServico | null>(null)
const isSaving = ref(false)

// Detalhes state
const showDetalhes = ref(false)
const selectedOS = ref<OrdemServico | null>(null)
const isLoadingDetalhes = ref(false)

// List state
const items = ref<OrdemServico[]>([])
const isLoading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const pageSize = 10

// KPIs
const kpis = ref<OrdemServicoKPIs | null>(null)

// Tabs (T10.6)
const activeMainTab = ref<'lista' | 'timeline' | 'mapa'>('lista')
const timelineData = ref<TimelineEntry[]>([])
const isLoadingTimeline = ref(false)
const mapaCalorData = ref<MapaCalorEntry[]>([])
const isLoadingMapa = ref(false)

// Filtros rapidos (T11.3)
const filtroAtrasadas = ref(false)
const filtroAcimaOrcamento = ref(false)
const filtroVarianciaAlta = ref(false)

// Filters (T16.3 - mobile toggle)
const showFilters = ref(false)
const showMobileFilters = ref(false)
const filterStatus = ref('')
const filterFazendaId = ref<number | ''>('')
const filterTipoAtividadeId = ref<number | ''>('')
const filterPrioridade = ref('')
const filterDataDe = ref('')
const filterDataAte = ref('')

// Select options for filters
const fazendas = ref<Propriedade[]>([])
const tiposAtividade = ref<TipoAtividadeOS[]>([])

const statusOptions = [
  { value: StatusOrdemServico.PLANEJADA, label: 'Planejada' },
  { value: StatusOrdemServico.ATRIBUIDA, label: 'Atribuida' },
  { value: StatusOrdemServico.EM_EXECUCAO, label: 'Em Execucao' },
  { value: StatusOrdemServico.CONCLUIDA, label: 'Concluida' },
  { value: StatusOrdemServico.VALIDADA, label: 'Validada' },
  { value: StatusOrdemServico.CANCELADA, label: 'Cancelada' },
]

const prioridadeOptions = [
  { value: PrioridadeOrdemServico.BAIXA, label: 'Baixa' },
  { value: PrioridadeOrdemServico.MEDIA, label: 'Media' },
  { value: PrioridadeOrdemServico.ALTA, label: 'Alta' },
  { value: PrioridadeOrdemServico.URGENTE, label: 'Urgente' },
]

const statusColors: Record<string, string> = {
  PLANEJADA: 'bg-gray-100 text-gray-700',
  ATRIBUIDA: 'bg-blue-100 text-blue-700',
  EM_EXECUCAO: 'bg-amber-100 text-amber-700',
  CONCLUIDA: 'bg-green-100 text-green-700',
  VALIDADA: 'bg-emerald-100 text-emerald-700',
  CANCELADA: 'bg-red-100 text-red-700',
}

const prioridadeColors: Record<string, string> = {
  BAIXA: 'bg-gray-100 text-gray-700',
  MEDIA: 'bg-blue-100 text-blue-700',
  ALTA: 'bg-amber-100 text-amber-700',
  URGENTE: 'bg-red-100 text-red-700',
}

// Variancia badge (T10.5)
const varianciaBadgeClass = (v: number | null | undefined) => {
  if (v == null) return ''
  const abs = Math.abs(v)
  if (abs < 10) return 'bg-green-100 text-green-700'
  if (abs < 20) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

const showVarianciaCol = (os: OrdemServico) => {
  return [StatusOrdemServico.CONCLUIDA, StatusOrdemServico.VALIDADA].includes(os.status)
}

// Contagens dos filtros rapidos (T11.3)
const countAtrasadas = computed(() => {
  return kpis.value?.totalAtrasadas || 0
})
const countAcimaOrcamento = computed(() => {
  return items.value.filter(os =>
    os.custoReal != null && os.custoEstimado != null && os.custoReal > os.custoEstimado
  ).length
})
const countVarianciaAlta = computed(() => {
  return items.value.filter(os =>
    os.varianciaCustoPercent != null && Math.abs(os.varianciaCustoPercent) > 20
  ).length
})

const buildFilters = () => {
  const f: Record<string, any> = {}
  if (filterStatus.value) f.status = filterStatus.value
  if (filterFazendaId.value) f.fazendaId = filterFazendaId.value
  if (safraStore.selectedSafraId) f.safraId = safraStore.selectedSafraId
  if (filterTipoAtividadeId.value) f.tipoAtividadeOSId = filterTipoAtividadeId.value
  if (filterPrioridade.value) f.prioridade = filterPrioridade.value
  if (filterDataDe.value) f.dataPlanejadaInicio = filterDataDe.value
  if (filterDataAte.value) f.dataPlanejadaFim = filterDataAte.value
  // Filtros rapidos (T11.3)
  if (filtroAtrasadas.value) f.atrasadas = true
  if (filtroAcimaOrcamento.value) f.acimaOrcamento = true
  if (filtroVarianciaAlta.value) f.varianciaMinima = 20
  return f
}

const fetchItems = async () => {
  isLoading.value = true
  try {
    const filters = buildFilters()
    const result = await ordemServicoService.getAll(currentPage.value, pageSize, filters)
    items.value = result.data.data
    totalPages.value = result.data.totalPages
    totalItems.value = result.data.total
  } catch {
    toast.error('Erro ao carregar ordens de servico.')
  } finally {
    isLoading.value = false
  }
}

const fetchKpis = async () => {
  try {
    const f = buildFilters()
    const result = await ordemServicoService.getKpis({
      fazendaId: f.fazendaId,
      safraId: f.safraId,
      dataInicio: f.dataPlanejadaInicio,
      dataFim: f.dataPlanejadaFim,
    })
    kpis.value = result.data as OrdemServicoKPIs
  } catch {
    // silent
  }
}

// Lazy-load timeline (T10.6)
const fetchTimeline = async () => {
  isLoadingTimeline.value = true
  try {
    const now = new Date()
    const fourWeeksAgo = new Date(now)
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    const result = await ordemServicoService.getTimeline({
      fazendaId: filterFazendaId.value || undefined,
      safraId: safraStore.selectedSafraId || undefined,
      dataInicio: fourWeeksAgo.toISOString().split('T')[0] ?? '',
      dataFim: now.toISOString().split('T')[0] ?? '',
    })
    timelineData.value = result.data as TimelineEntry[]
  } catch {
    toast.error('Erro ao carregar timeline.')
  } finally {
    isLoadingTimeline.value = false
  }
}

// Lazy-load mapa calor (T10.6)
const fetchMapaCalor = async () => {
  isLoadingMapa.value = true
  try {
    const result = await ordemServicoService.getMapaCalor({
      fazendaId: filterFazendaId.value || undefined,
      safraId: safraStore.selectedSafraId || undefined,
    })
    mapaCalorData.value = result.data as MapaCalorEntry[]
  } catch {
    toast.error('Erro ao carregar mapa de calor.')
  } finally {
    isLoadingMapa.value = false
  }
}

// Watch tab change para lazy-load (T10.6)
watch(activeMainTab, (tab) => {
  if (tab === 'timeline') fetchTimeline()
  if (tab === 'mapa') fetchMapaCalor()
})

const loadFilterOptions = async () => {
  try {
    const [fazendasRes, tiposRes] = await Promise.all([
      propriedadeService.getAllNoPagination(),
      tipoAtividadeOSService.getAllNoPagination(),
    ])
    fazendas.value = (fazendasRes as any).data || fazendasRes as any
    tiposAtividade.value = tiposRes.data as TipoAtividadeOS[]
  } catch {
    // silent
  }
}

const applyFilters = () => {
  currentPage.value = 1
  fetchItems()
  fetchKpis()
  // Re-fetch tab ativa se nao for lista
  if (activeMainTab.value === 'timeline') fetchTimeline()
  if (activeMainTab.value === 'mapa') fetchMapaCalor()
}

// Toggle filtro rapido (T11.3)
const toggleFiltroRapido = (filtro: 'atrasadas' | 'acimaOrcamento' | 'varianciaAlta') => {
  if (filtro === 'atrasadas') filtroAtrasadas.value = !filtroAtrasadas.value
  if (filtro === 'acimaOrcamento') filtroAcimaOrcamento.value = !filtroAcimaOrcamento.value
  if (filtro === 'varianciaAlta') filtroVarianciaAlta.value = !filtroVarianciaAlta.value
  currentPage.value = 1
  fetchItems()
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSave = async (payload: CreateOrdemServicoCompletoPayload) => {
  isSaving.value = true
  try {
    if (editingItem.value) {
      await ordemServicoService.updateCompleto(editingItem.value.id, payload)
      toast.success('Ordem de servico atualizada com sucesso!')
    } else {
      await ordemServicoService.createCompleto(payload)
      toast.success('Ordem de servico criada com sucesso!')
    }
    isModalOpen.value = false
    fetchItems()
    fetchKpis()
  } catch {
    toast.error('Erro ao salvar. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}

const handleViewDetalhes = async (os: OrdemServico) => {
  isLoadingDetalhes.value = true
  showDetalhes.value = true
  try {
    const result = await ordemServicoService.getById(os.id)
    selectedOS.value = result.data as OrdemServico
  } catch {
    toast.error('Erro ao carregar detalhes.')
    showDetalhes.value = false
  } finally {
    isLoadingDetalhes.value = false
  }
}

const handleEdit = async (os: OrdemServico) => {
  try {
    const result = await ordemServicoService.getById(os.id)
    editingItem.value = result.data as OrdemServico
    isModalOpen.value = true
  } catch {
    toast.error('Erro ao carregar dados para edicao.')
  }
}

const handleStatusChange = async ({ action, payload }: { action: string; payload: any }) => {
  if (!selectedOS.value) return
  isLoadingDetalhes.value = true
  try {
    const id = selectedOS.value.id
    const svc = ordemServicoService as any
    if (svc[action]) {
      await svc[action](id, payload)
    }
    toast.success('Status atualizado com sucesso!')
    // Reload
    const result = await ordemServicoService.getById(id)
    selectedOS.value = result.data as OrdemServico
    fetchItems()
    fetchKpis()
  } catch {
    toast.error('Erro ao alterar status.')
  } finally {
    isLoadingDetalhes.value = false
  }
}

const handleDetalhesEdit = () => {
  if (selectedOS.value) {
    showDetalhes.value = false
    editingItem.value = selectedOS.value
    isModalOpen.value = true
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const formatCurrency = (v: number | null) => {
  if (v == null) return '-'
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (d: string | null) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('pt-BR')
}

const canEdit = (os: OrdemServico) => {
  return [StatusOrdemServico.PLANEJADA, StatusOrdemServico.ATRIBUIDA].includes(os.status)
}

watch(currentPage, fetchItems)

watch(() => safraStore.selectedSafraId, () => {
  currentPage.value = 1
  fetchItems()
  fetchKpis()
  if (activeMainTab.value === 'timeline') fetchTimeline()
  if (activeMainTab.value === 'mapa') fetchMapaCalor()
})

onMounted(() => {
  loadFilterOptions()
  fetchItems()
  fetchKpis()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <!-- Modal -->
    <OrdemServicoModal
      :is-open="isModalOpen"
      :initial-data="editingItem"
      :loading="isSaving"
      @close="isModalOpen = false"
      @save="handleSave"
    />

    <!-- Detalhes -->
    <OrdemServicoDetalhes
      v-if="showDetalhes && selectedOS"
      :ordem-servico="selectedOS"
      :loading="isLoadingDetalhes"
      @status-change="handleStatusChange"
      @edit="handleDetalhesEdit"
      @close="showDetalhes = false"
    />

    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Ordens de Servico</h1>
          <p class="text-gray-500 mt-1">Gerencie as ordens de servico da propriedade</p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Nova OS
        </button>
      </div>

      <!-- KPI Cards -->
      <div v-if="kpis" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <!-- Total -->
        <div class="bg-gray-100 rounded-xl p-4 flex items-center gap-3">
          <div class="p-2 bg-white rounded-lg">
            <ClipboardList class="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ kpis.totalOS }}</p>
            <p class="text-xs text-gray-500">Total OS</p>
          </div>
        </div>
        <!-- Planejadas -->
        <div class="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
          <div class="p-2 bg-white rounded-lg">
            <Calendar class="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-blue-700">{{ kpis.totalPorStatus?.PLANEJADA || 0 }}</p>
            <p class="text-xs text-blue-600">Planejadas</p>
          </div>
        </div>
        <!-- Em Execucao -->
        <div class="bg-amber-50 rounded-xl p-4 flex items-center gap-3">
          <div class="p-2 bg-white rounded-lg">
            <Play class="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-amber-700">{{ kpis.totalPorStatus?.EM_EXECUCAO || 0 }}</p>
            <p class="text-xs text-amber-600">Em Execucao</p>
          </div>
        </div>
        <!-- Concluidas -->
        <div class="bg-green-50 rounded-xl p-4 flex items-center gap-3">
          <div class="p-2 bg-white rounded-lg">
            <CheckCircle class="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-green-700">{{ kpis.totalPorStatus?.CONCLUIDA || 0 }}</p>
            <p class="text-xs text-green-600">Concluidas</p>
          </div>
        </div>
        <!-- Atrasadas -->
        <div class="bg-red-50 rounded-xl p-4 flex items-center gap-3">
          <div class="p-2 bg-white rounded-lg">
            <AlertTriangle class="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p
              class="text-2xl font-bold"
              :class="kpis.totalAtrasadas > 0 ? 'text-red-600' : 'text-gray-700'"
            >{{ kpis.totalAtrasadas }}</p>
            <p class="text-xs" :class="kpis.totalAtrasadas > 0 ? 'text-red-600' : 'text-gray-500'">Atrasadas</p>
          </div>
        </div>
      </div>

      <!-- Filtros Toggle Mobile (T16.3) -->
      <div class="sm:hidden">
        <button
          @click="showMobileFilters = !showMobileFilters"
          class="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Search class="h-4 w-4 mr-2" />
          Filtros
          <component :is="showMobileFilters ? ChevronUp : ChevronDown" class="h-4 w-4 ml-2" />
        </button>
      </div>

      <!-- Filtros Rapidos (T11.3) -->
      <div class="flex flex-wrap gap-3" :class="{ 'hidden sm:flex': !showMobileFilters }">
        <button
          @click="toggleFiltroRapido('atrasadas')"
          class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors"
          :class="filtroAtrasadas
            ? 'bg-lime-100 border-lime-600 text-lime-800'
            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'"
        >
          <AlertTriangle class="h-4 w-4 mr-1.5" />
          Atrasadas
          <span
            v-if="countAtrasadas > 0"
            class="ml-1.5 px-1.5 py-0.5 text-xs font-bold rounded-full"
            :class="filtroAtrasadas ? 'bg-lime-600 text-white' : 'bg-red-100 text-red-700'"
          >{{ countAtrasadas }}</span>
        </button>
        <button
          @click="toggleFiltroRapido('acimaOrcamento')"
          class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors"
          :class="filtroAcimaOrcamento
            ? 'bg-lime-100 border-lime-600 text-lime-800'
            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'"
        >
          Acima do Orcamento
          <span
            v-if="countAcimaOrcamento > 0"
            class="ml-1.5 px-1.5 py-0.5 text-xs font-bold rounded-full"
            :class="filtroAcimaOrcamento ? 'bg-lime-600 text-white' : 'bg-amber-100 text-amber-700'"
          >{{ countAcimaOrcamento }}</span>
        </button>
        <button
          @click="toggleFiltroRapido('varianciaAlta')"
          class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors"
          :class="filtroVarianciaAlta
            ? 'bg-lime-100 border-lime-600 text-lime-800'
            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'"
        >
          Variancia &gt; 20%
          <span
            v-if="countVarianciaAlta > 0"
            class="ml-1.5 px-1.5 py-0.5 text-xs font-bold rounded-full"
            :class="filtroVarianciaAlta ? 'bg-lime-600 text-white' : 'bg-red-100 text-red-700'"
          >{{ countVarianciaAlta }}</span>
        </button>
      </div>

      <!-- Tabs principales (T10.6) -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Tab bar -->
        <div class="flex items-center border-b border-gray-200 px-6">
          <button
            @click="activeMainTab = 'lista'"
            class="inline-flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px"
            :class="activeMainTab === 'lista'
              ? 'border-lime-600 text-lime-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
          >
            <List class="h-4 w-4 mr-1.5" />
            Lista
          </button>
          <button
            @click="activeMainTab = 'timeline'"
            class="inline-flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px"
            :class="activeMainTab === 'timeline'
              ? 'border-lime-600 text-lime-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
          >
            <BarChart3 class="h-4 w-4 mr-1.5" />
            Timeline
          </button>
          <button
            @click="activeMainTab = 'mapa'"
            class="inline-flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px"
            :class="activeMainTab === 'mapa'
              ? 'border-lime-600 text-lime-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
          >
            <Map class="h-4 w-4 mr-1.5" />
            Mapa
          </button>

          <!-- Filter button (direita) -->
          <div class="ml-auto">
            <button
              v-if="activeMainTab === 'lista'"
              @click="showFilters = !showFilters"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Search class="h-4 w-4 mr-1" />
              Filtros
              <component :is="showFilters ? ChevronUp : ChevronDown" class="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>

        <!-- Tab Lista -->
        <div v-show="activeMainTab === 'lista'">
          <!-- Collapsible filters -->
          <div v-if="showFilters" class="p-6 border-b border-gray-100 bg-gray-50">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  v-model="filterStatus"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                  <option value="">Todos</option>
                  <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Fazenda</label>
                <select
                  v-model="filterFazendaId"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                  <option value="">Todas</option>
                  <option v-for="f in fazendas" :key="f.id" :value="f.id">{{ f.descricao }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Tipo de Atividade</label>
                <select
                  v-model="filterTipoAtividadeId"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                  <option value="">Todos</option>
                  <option v-for="t in tiposAtividade" :key="t.id" :value="t.id">{{ t.nome }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Prioridade</label>
                <select
                  v-model="filterPrioridade"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                  <option value="">Todas</option>
                  <option v-for="p in prioridadeOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">De</label>
                  <input
                    v-model="filterDataDe"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Ate</label>
                  <input
                    v-model="filterDataAte"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                </div>
              </div>
            </div>
            <div class="flex justify-end mt-4">
              <button
                @click="applyFilters"
                class="px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="isLoading" class="p-8 text-center text-gray-500">
            <div class="w-8 h-8 border-4 border-lime-200 border-t-lime-600 rounded-full animate-spin mx-auto mb-3"></div>
            Carregando...
          </div>

          <!-- Table -->
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">N</th>
                  <th class="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th class="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fazenda</th>
                  <th class="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Prioridade</th>
                  <th class="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Data Plan.</th>
                  <th class="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Responsavel</th>
                  <th class="px-4 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Custo Est.</th>
                  <th class="px-4 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Variancia</th>
                  <th class="px-4 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acoes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="os in items"
                  :key="os.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ String(os.numero).padStart(4, '0') }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm">
                    <div class="flex items-center gap-2">
                      <span
                        v-if="os.tipoAtividade?.cor"
                        class="inline-block w-3 h-3 rounded-full"
                        :style="{ backgroundColor: os.tipoAtividade.cor }"
                      ></span>
                      {{ os.tipoAtividade?.nome || '-' }}
                    </div>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {{ os.fazenda?.nome || '-' }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm">
                    <span
                      class="px-2.5 py-1 text-xs font-medium rounded-full"
                      :class="statusColors[os.status]"
                    >
                      {{ statusOptions.find(s => s.value === os.status)?.label || os.status }}
                    </span>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm">
                    <span
                      class="px-2.5 py-1 text-xs font-medium rounded-full"
                      :class="prioridadeColors[os.prioridade]"
                    >
                      {{ prioridadeOptions.find(p => p.value === os.prioridade)?.label || os.prioridade }}
                    </span>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {{ formatDate(os.dataPlanejadaInicio) }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {{ os.responsaveis?.[0]?.pessoa?.nomerazao_pessoa || '-' }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                    {{ formatCurrency(os.custoEstimado) }}
                  </td>
                  <!-- Coluna Variancia (T10.5) -->
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-right">
                    <span
                      v-if="showVarianciaCol(os) && os.varianciaCustoPercent != null"
                      class="px-2 py-1 text-xs font-medium rounded-full cursor-default"
                      :class="varianciaBadgeClass(os.varianciaCustoPercent)"
                      :title="'Variancia entre custo estimado e real. Valores acima de 20% indicam desvio significativo do orcamento.'"
                    >
                      {{ os.varianciaCustoPercent.toFixed(1) }}%
                    </span>
                    <span v-else class="text-gray-300">-</span>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end gap-3">
                      <button
                        @click="handleViewDetalhes(os)"
                        class="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye class="h-4 w-4" />
                      </button>
                      <button
                        v-if="canEdit(os)"
                        @click="handleEdit(os)"
                        class="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Editar"
                      >
                        <Pencil class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="items.length === 0 && !isLoading">
                  <td colspan="10" class="px-6 py-8 text-center text-gray-500 text-sm">
                    Nenhuma ordem de servico encontrada.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div
            v-if="totalPages > 1"
            class="px-6 py-4 border-t border-gray-100 flex items-center justify-between"
          >
            <span class="text-sm text-gray-500">
              Pagina {{ currentPage }} de {{ totalPages }} ({{ totalItems }} registros)
            </span>
            <div class="flex items-center gap-2">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage <= 1"
                class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft class="h-4 w-4" />
              </button>
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage >= totalPages"
                class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Tab Timeline (T10.6) -->
        <div v-show="activeMainTab === 'timeline'" class="p-6">
          <TimelineSemanal
            :dados="timelineData"
            :loading="isLoadingTimeline"
          />
        </div>

        <!-- Tab Mapa (T10.6) -->
        <div v-show="activeMainTab === 'mapa'" class="p-6">
          <MapaCalorTalhoes
            :dados="mapaCalorData"
            :fazenda-id="filterFazendaId"
            :loading="isLoadingMapa"
          />
        </div>
      </div>
    </div>
  </div>
</template>
