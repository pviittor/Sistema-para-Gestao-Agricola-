<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { toast } from 'vue3-toastify'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Map,
  Loader2,
  LayoutGrid,
  List,
  MoreHorizontal,
  Sprout,
  Wheat
} from 'lucide-vue-next'
import TalhoesModal from '@/components/TalhoesModal.vue'
import ConfiguradorCicloModal from '@/components/ConfiguradorCicloModal.vue'
import type { Talhao } from '@/types/Talhao'
import type { Propriedade } from '@/types/Propriedade'
import type { ConfiguradorCiclo } from '@/types/ConfiguradorCiclo'
import { talhaoService } from '@/services/talhaoService'
import { propriedadeService } from '@/services/propriedadeService'
import { configuradorCicloService } from '@/services/configuradorCicloService'
import { getSatelliteImageUrl } from '@/utils/satellite'
import { useSafraStore } from '@/stores/safra'

const safraStore = useSafraStore()

// Modal state — Talhão
const isModalOpen = ref(false)
const editingItem = ref<Talhao | null>(null)

// Modal state — ConfiguradorCiclo
const isCfgModalOpen = ref(false)
const editingCfg = ref<ConfiguradorCiclo | null>(null)
const isSavingCfg = ref(false)

// List state
const talhoes = ref<Talhao[]>([])
const searchTerm = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

// View controls
const viewMode = ref<'grid' | 'list'>('grid')
const sortKey = ref<'name' | 'area' | 'crop'>('name')

// Fazenda selector
const fazendas = ref<{ value: number; label: string }[]>([])
const selectedFazendaId = ref<number | null>(null)
const isLoadingFazendas = ref(false)

// ConfiguradorCiclo data
const configuradoresCiclo = ref<ConfiguradorCiclo[]>([])

// Card action menu
const openMenuId = ref<number | null>(null)

const toggleMenu = (id: number) => {
  openMenuId.value = openMenuId.value === id ? null : id
}

const closeMenus = () => {
  openMenuId.value = null
}

const fetchFazendas = async () => {
  isLoadingFazendas.value = true
  try {
    const result = await propriedadeService.getAllNoPagination()
    if (result.success && result.data) {
      fazendas.value = result.data
        .map((p: Propriedade) => ({
          value: p.id || 0,
          label: p.descricao
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    }
  } catch (error) {
    console.error('Erro ao buscar fazendas:', error)
    toast.error('Erro ao carregar fazendas.')
  } finally {
    isLoadingFazendas.value = false
  }
}

const fetchTalhoesByFazenda = async () => {
  if (!selectedFazendaId.value) return
  isLoading.value = true
  try {
    const result = await talhaoService.getByFazenda(selectedFazendaId.value)
    talhoes.value = result
  } catch (error) {
    console.error('Erro ao buscar talhões:', error)
    toast.error('Erro ao carregar talhões.')
  } finally {
    isLoading.value = false
  }
}

const fetchConfiguradoresCiclo = async () => {
  if (!selectedFazendaId.value || !safraStore.selectedSafraId) {
    configuradoresCiclo.value = []
    return
  }
  try {
    const result = await configuradorCicloService.getByFazendaAndSafra(
      selectedFazendaId.value,
      safraStore.selectedSafraId
    )
    if (result.success && result.data) {
      configuradoresCiclo.value = result.data
    }
  } catch (error) {
    console.error('Erro ao buscar configuradores de ciclo:', error)
  }
}

const onFazendaChange = (fazendaId: number) => {
  selectedFazendaId.value = fazendaId
  fetchTalhoesByFazenda()
  fetchConfiguradoresCiclo()
}

// Map configuradores to talhões
const getCfgForTalhao = (talhaoId: number): ConfiguradorCiclo | undefined => {
  return configuradoresCiclo.value.find(cfg => cfg.idTalhao === talhaoId)
}

const getCulturaTextFromCfg = (talhao: Talhao): string => {
  const cfg = getCfgForTalhao(talhao.id_talhao!)
  if (cfg) {
    const parts: string[] = []
    if (cfg.cultura?.descricao) parts.push(cfg.cultura.descricao)
    if (cfg.variedadeCiclo?.descricao_prod) parts.push(cfg.variedadeCiclo.descricao_prod)
    return parts.join(' - ')
  }
  if (talhao.culturas && talhao.culturas.length > 0) {
    return talhao.culturas.map(c => c.descricao).join(', ')
  }
  return ''
}

// Filtered + sorted + grouped
const filteredTalhoes = computed(() => {
  if (!searchTerm.value) return talhoes.value
  const term = searchTerm.value.toLowerCase()
  return talhoes.value.filter(t => t.descricao.toLowerCase().includes(term))
})

const sortedTalhoes = computed(() => {
  const items = [...filteredTalhoes.value]
  switch (sortKey.value) {
    case 'name':
      return items.sort((a, b) => a.descricao.localeCompare(b.descricao))
    case 'area':
      return items.sort((a, b) => (b.area || 0) - (a.area || 0))
    case 'crop':
      return items.sort((a, b) => {
        const aCrop = getCulturaTextFromCfg(a) || 'zzz'
        const bCrop = getCulturaTextFromCfg(b) || 'zzz'
        return aCrop.localeCompare(bCrop)
      })
    default:
      return items
  }
})

const groupedTalhoes = computed(() => {
  const groups: Record<string, Talhao[]> = {}
  for (const t of sortedTalhoes.value) {
    const group = t.grupo || 'Talhões sem grupo'
    if (!groups[group]) groups[group] = []
    groups[group].push(t)
  }
  return groups
})

// Summary stats — uses configuradoresCiclo for variety distribution
const summaryStats = computed(() => {
  const all = talhoes.value
  const filtered = filteredTalhoes.value

  const totalArea = all.reduce((sum, t) => sum + (Number(t.area) || 0), 0)

  // Crop area based on configuradoresCiclo
  const talhaoIdsWithCfg = new Set(configuradoresCiclo.value.map(c => c.idTalhao))
  const cropArea = all.reduce((sum, t) => {
    if (talhaoIdsWithCfg.has(t.id_talhao!)) {
      return sum + (Number(t.area) || 0)
    }
    return sum
  }, 0)

  // Variety/culture distribution from configuradoresCiclo
  const varCounts: Record<string, number> = {}
  for (const cfg of configuradoresCiclo.value) {
    const name = cfg.variedadeCiclo?.descricao_prod
      || cfg.cultura?.descricao
      || 'Sem cultura'
    varCounts[name] = (varCounts[name] || 0) + 1
  }
  const totalVars = Object.values(varCounts).reduce((s, v) => s + v, 0)
  const cropDistribution = Object.entries(varCounts).map(([name, count]) => ({
    name,
    percentage: totalVars > 0 ? Math.round((count / totalVars) * 100) : 0
  }))

  return {
    fieldsShown: filtered.length,
    fieldsTotal: all.length,
    cropAcreage: cropArea,
    fieldAcreage: totalArea,
    cropDistribution
  }
})

// Satellite thumbnail URL
const getSatelliteThumbnail = (geometry: Talhao['geometry']): string | null => {
  return getSatelliteImageUrl(geometry, {
    width: 300,
    height: 150,
    padding: 20,
    style: 'satellite-v9'
  })
}

// Crop distribution colors
const cropColors = ['bg-lime-500', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-teal-500']

// CRUD handlers — Talhão
const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSave = async (data: Talhao) => {
  isSaving.value = true
  try {
    if (data.id_talhao) {
      await talhaoService.update(data.id_talhao, data)
      toast.success('Talhão atualizado com sucesso!')
    } else {
      await talhaoService.create(data)
      toast.success('Talhão criado com sucesso!')
    }
    isModalOpen.value = false
    fetchTalhoesByFazenda()
  } catch (error) {
    console.error('Erro ao salvar:', error)
    toast.error('Erro ao salvar. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}

const handleEdit = (item: Talhao) => {
  editingItem.value = item
  isModalOpen.value = true
  closeMenus()
}

const handleDelete = async (id: number) => {
  closeMenus()
  if (confirm('Tem certeza que deseja excluir este talhão?')) {
    try {
      await talhaoService.delete(id)
      toast.success('Talhão excluído com sucesso!')
      fetchTalhoesByFazenda()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir. Tente novamente.')
    }
  }
}

// CRUD handlers — ConfiguradorCiclo
const handleNewConfiguradorCiclo = (preselectedTalhaoId?: number) => {
  editingCfg.value = null
  if (preselectedTalhaoId) {
    editingCfg.value = {
      idTalhao: preselectedTalhaoId,
      idCiclo: safraStore.selectedSafraId || 0,
      idCultura: 0,
    } as ConfiguradorCiclo
  }
  isCfgModalOpen.value = true
}

const handleEditConfiguradorCiclo = (talhao: Talhao) => {
  const cfg = getCfgForTalhao(talhao.id_talhao!)
  if (cfg) {
    editingCfg.value = cfg
  }
  isCfgModalOpen.value = true
  closeMenus()
}

const handleSaveConfiguradorCiclo = async (data: ConfiguradorCiclo) => {
  isSavingCfg.value = true
  try {
    if (data.id_cfg) {
      await configuradorCicloService.update(data.id_cfg, data)
      toast.success('Cultura atualizada com sucesso!')
    } else {
      await configuradorCicloService.create(data)
      toast.success('Cultura adicionada com sucesso!')
    }
    isCfgModalOpen.value = false
    fetchConfiguradoresCiclo()
  } catch (error) {
    console.error('Erro ao salvar configurador de ciclo:', error)
    toast.error('Erro ao salvar cultura. Tente novamente.')
  } finally {
    isSavingCfg.value = false
  }
}

watch(() => safraStore.selectedSafraId, () => {
  fetchConfiguradoresCiclo()
})

onMounted(() => {
  fetchFazendas()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans" @click="closeMenus">
    <TalhoesModal
      :is-open="isModalOpen"
      :initial-data="editingItem"
      :loading="isSaving"
      :existing-fields="talhoes"
      @close="isModalOpen = false"
      @save="handleSave"
    />
    <ConfiguradorCicloModal
      :is-open="isCfgModalOpen"
      :initial-data="editingCfg"
      :loading="isSavingCfg"
      :fazenda-id="selectedFazendaId"
      :safra-id="safraStore.selectedSafraId"
      :talhoes="talhoes"
      @close="isCfgModalOpen = false"
      @save="handleSaveConfiguradorCiclo"
    />
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Talhões</h1>
          <p class="text-gray-500 mt-1">Gerencie os talhões das suas fazendas</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Botão Adicionar Cultura -->
          <button
            v-if="selectedFazendaId && safraStore.selectedSafraId"
            @click="handleNewConfiguradorCiclo()"
            class="inline-flex items-center px-3 py-2 border border-lime-600 rounded-lg text-sm font-medium text-lime-700 bg-lime-50 hover:bg-lime-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
          >
            <Sprout class="h-4 w-4 mr-1.5" />
            Adicionar Cultura
          </button>
          <button
            @click="handleNew"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
          >
            <Plus class="h-4 w-4 mr-2" />
            Novo Talhão
          </button>
        </div>
      </div>

      <!-- Seletor de Fazenda -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <label class="block text-sm font-bold text-gray-700 mb-2">Fazenda</label>
        <select
          :value="selectedFazendaId"
          @change="onFazendaChange(Number(($event.target as HTMLSelectElement).value))"
          class="w-full md:w-80 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent appearance-none bg-white text-sm"
        >
          <option :value="null" disabled selected>Selecione uma fazenda</option>
          <option v-for="f in fazendas" :key="f.value" :value="f.value">{{ f.label }}</option>
        </select>
      </div>

      <!-- Content area (only shows after fazenda selected) -->
      <template v-if="selectedFazendaId">
        <!-- Barra de Controles -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="relative w-full sm:w-64">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-4 w-4 text-gray-400" />
            </div>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar talhão..."
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            />
          </div>
          <div class="flex items-center gap-3">
            <!-- Ordenação -->
            <select
              v-model="sortKey"
              class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 appearance-none bg-white pr-8"
            >
              <option value="name">Alfabético</option>
              <option value="area">Por área</option>
              <option value="crop">Por cultura</option>
            </select>
            <!-- Toggle visualização -->
            <div class="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                @click="viewMode = 'grid'"
                class="p-2 transition-colors"
                :class="viewMode === 'grid' ? 'bg-lime-100 text-lime-700' : 'text-gray-400 hover:text-gray-600'"
              >
                <LayoutGrid class="h-4 w-4" />
              </button>
              <button
                @click="viewMode = 'list'"
                class="p-2 transition-colors"
                :class="viewMode === 'list' ? 'bg-lime-100 text-lime-700' : 'text-gray-400 hover:text-gray-600'"
              >
                <List class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Summary Bar -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Talhões -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Talhões</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">
              {{ summaryStats.fieldsShown }}
              <span class="text-sm font-normal text-gray-400">de {{ summaryStats.fieldsTotal }}</span>
            </p>
          </div>
          <!-- Área com cultura -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Área com cultura</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ summaryStats.cropAcreage.toFixed(1) }} ha</p>
          </div>
          <!-- Distribuição -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Distribuição</p>
            <div v-if="summaryStats.cropDistribution.length > 0">
              <div class="flex items-center gap-1 mt-2 h-3 rounded-full overflow-hidden bg-gray-100">
                <div
                  v-for="(crop, idx) in summaryStats.cropDistribution"
                  :key="crop.name"
                  :class="cropColors[idx % cropColors.length]"
                  :style="{ width: crop.percentage + '%' }"
                  class="h-full"
                  :title="`${crop.name}: ${crop.percentage}%`"
                ></div>
              </div>
              <div class="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                <span
                  v-for="(crop, idx) in summaryStats.cropDistribution"
                  :key="crop.name"
                  class="text-xs text-gray-500 flex items-center gap-1"
                >
                  <span :class="cropColors[idx % cropColors.length]" class="inline-block w-2 h-2 rounded-full"></span>
                  {{ crop.name }} {{ crop.percentage }}%
                </span>
              </div>
            </div>
            <p v-else class="text-sm text-gray-400 mt-2">
              {{ safraStore.selectedSafraId ? 'Nenhuma cultura nesta safra' : 'Selecione uma safra' }}
            </p>
          </div>
          <!-- Área total -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Área total</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ summaryStats.fieldAcreage.toFixed(1) }} ha</p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <Loader2 class="h-8 w-8 text-lime-600 animate-spin" />
        </div>

        <!-- Empty state -->
        <div v-else-if="talhoes.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Map class="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-1">Nenhum talhão cadastrado</h3>
          <p class="text-gray-500 mb-4">Adicione talhões para esta fazenda.</p>
          <button
            @click="handleNew"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 transition-colors"
          >
            <Plus class="h-4 w-4 mr-2" />
            Novo Talhão
          </button>
        </div>

        <!-- Grid View -->
        <template v-else-if="viewMode === 'grid'">
          <div v-for="(groupItems, groupName) in groupedTalhoes" :key="groupName" class="space-y-3">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">{{ groupName }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="item in groupItems"
                :key="item.id_talhao"
                class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <!-- Card header with satellite thumbnail -->
                <div class="h-32 bg-gray-900 flex items-center justify-center relative overflow-hidden">
                  <img
                    v-if="getSatelliteThumbnail(item.geometry)"
                    :src="getSatelliteThumbnail(item.geometry)!"
                    :alt="item.descricao"
                    class="w-full h-full object-cover"
                    loading="lazy"
                    @error="($event.target as HTMLImageElement).style.display = 'none'"
                  />
                  <div v-if="!getSatelliteThumbnail(item.geometry)" class="text-gray-500">
                    <Map class="h-10 w-10" />
                  </div>
                  <!-- Menu button -->
                  <div class="absolute top-2 right-2">
                    <button
                      @click.stop="toggleMenu(item.id_talhao!)"
                      class="p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <MoreHorizontal class="h-4 w-4 text-gray-500" />
                    </button>
                    <!-- Dropdown menu -->
                    <div
                      v-if="openMenuId === item.id_talhao"
                      class="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10"
                    >
                      <button
                        @click="handleEdit(item)"
                        class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Pencil class="h-3.5 w-3.5" /> Editar Talhão
                      </button>
                      <button
                        v-if="safraStore.selectedSafraId && getCfgForTalhao(item.id_talhao!)"
                        @click="handleEditConfiguradorCiclo(item)"
                        class="w-full px-4 py-2 text-left text-sm text-lime-700 hover:bg-lime-50 flex items-center gap-2"
                      >
                        <Sprout class="h-3.5 w-3.5" /> Editar Cultura
                      </button>
                      <button
                        v-else-if="safraStore.selectedSafraId"
                        @click="handleNewConfiguradorCiclo(item.id_talhao!)"
                        class="w-full px-4 py-2 text-left text-sm text-lime-700 hover:bg-lime-50 flex items-center gap-2"
                      >
                        <Sprout class="h-3.5 w-3.5" /> Adicionar Cultura
                      </button>
                      <button
                        @click="handleDelete(item.id_talhao!)"
                        class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 class="h-3.5 w-3.5" /> Excluir
                      </button>
                    </div>
                  </div>
                </div>
                <!-- Card body -->
                <div class="p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">{{ item.descricao }}</h4>
                  <!-- Climate placeholder -->
                  <div class="text-xs text-gray-400 mb-3 flex items-center gap-1">
                    <Sprout class="h-3.5 w-3.5" />
                    Dados climáticos indisponíveis
                  </div>
                  <!-- Footer -->
                  <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span class="text-sm text-gray-600 font-medium">{{ Number(item.area).toFixed(1) }} ha</span>
                    <template v-if="getCulturaTextFromCfg(item)">
                      <span class="text-sm text-lime-600 flex items-center gap-1">
                        <Wheat class="h-3.5 w-3.5" />
                        {{ getCulturaTextFromCfg(item) }}
                        <button
                          v-if="safraStore.selectedSafraId && getCfgForTalhao(item.id_talhao!)"
                          @click.stop="handleEditConfiguradorCiclo(item)"
                          class="ml-1 text-gray-400 hover:text-lime-600 transition-colors"
                          title="Editar cultura"
                        >
                          <Pencil class="h-3 w-3" />
                        </button>
                      </span>
                    </template>
                    <template v-else>
                      <button
                        v-if="safraStore.selectedSafraId"
                        @click.stop="handleNewConfiguradorCiclo(item.id_talhao!)"
                        class="text-xs text-lime-600 hover:text-lime-700 italic flex items-center gap-1 transition-colors"
                      >
                        <Sprout class="h-3 w-3" />
                        Adicionar cultura
                      </button>
                      <span v-else class="text-xs text-gray-400 italic">Sem culturas</span>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- List View -->
        <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Área (ha)</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Culturas</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Grupo</th>
                  <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="item in sortedTalhoes" :key="item.id_talhao" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div class="flex items-center gap-3">
                      <div class="h-8 w-8 rounded-full bg-lime-100 flex items-center justify-center text-lime-600">
                        <Map class="h-4 w-4" />
                      </div>
                      {{ item.descricao }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ Number(item.area).toFixed(1) }} ha</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ getCulturaTextFromCfg(item) || '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.grupo || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end gap-3">
                      <button
                        v-if="safraStore.selectedSafraId && getCfgForTalhao(item.id_talhao!)"
                        @click="handleEditConfiguradorCiclo(item)"
                        class="text-lime-500 hover:text-lime-700 transition-colors"
                        title="Editar cultura"
                      >
                        <Sprout class="h-4 w-4" />
                      </button>
                      <button @click="handleEdit(item)" class="text-gray-400 hover:text-gray-600 transition-colors">
                        <Pencil class="h-4 w-4" />
                      </button>
                      <button @click="handleDelete(item.id_talhao!)" class="text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- No fazenda selected message -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <Map class="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-1">Selecione uma fazenda</h3>
        <p class="text-gray-500">Escolha uma fazenda acima para visualizar seus talhões.</p>
      </div>
    </div>
  </div>
</template>
