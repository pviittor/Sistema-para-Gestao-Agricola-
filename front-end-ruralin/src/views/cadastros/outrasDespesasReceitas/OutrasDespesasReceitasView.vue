<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-vue-next'
import OutraDespesaReceitaModal from '@/components/OutraDespesaReceitaModal.vue'
import type {
  OutraDespesaReceita,
  CreateOutraDespesaReceitaDto,
  ConfiguradorCicloOption,
} from '@/types/OutraDespesaReceita'
import { TIPO_LABELS, TIPO_COLORS, TIPO_ALOCACAO_LABELS } from '@/types/OutraDespesaReceita'
import { outraDespesaReceitaService } from '@/services/outraDespesaReceitaService'
import { planoContaGerencialService } from '@/services/PlanoContaGerencialService'
import { configuradorCicloService } from '@/services/configuradorCicloService'
import { culturaService } from '@/services/culturaService'
import type { PlanoContaGerencial } from '@/types/PlanoContaGerencial'
import type { Cultura } from '@/types/Cultura'
import { useSafraStore } from '@/stores/safra'

const safraStore = useSafraStore()

// Modal state
const isModalOpen = ref(false)
const editingItem = ref<OutraDespesaReceita | null>(null)

// List state
const items = ref<OutraDespesaReceita[]>([])
const searchTerm = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

// Lookup data
const planosGerenciais = ref<PlanoContaGerencial[]>([])
const configuradoresCiclo = ref<ConfiguradorCicloOption[]>([])
const culturas = ref<Cultura[]>([])

// Filter state
const filterTipo = ref<'DESPESA' | 'RECEITA' | ''>('')
const filterPlanoGerencial = ref<number | ''>('')
const filterDataInicio = ref('')
const filterDataFim = ref('')
const filterConfiguradorCiclo = ref<number | ''>('')
const filterCultura = ref<number | ''>('')
const showFilters = ref(false)

const fetchItems = async () => {
  isLoading.value = true
  try {
    const result = await outraDespesaReceitaService.getAll(1, 100)
    items.value = result.data
  } catch (error) {
    console.error('Erro ao buscar outras despesas/receitas:', error)
    toast.error('Erro ao carregar lista de despesas/receitas.')
  } finally {
    isLoading.value = false
  }
}

const fetchLookups = async () => {
  try {
    const [planosResult, cfgResult, culturasResult] = await Promise.all([
      planoContaGerencialService.getAll(1, 1000),
      configuradorCicloService.getAll(1, 1000),
      culturaService.getAll(1, 1000),
    ])
    planosGerenciais.value = planosResult.data
    configuradoresCiclo.value = cfgResult.data
    culturas.value = culturasResult.data
  } catch (error) {
    console.error('Erro ao buscar dados de referência:', error)
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleEdit = (item: OutraDespesaReceita) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleSave = async (data: CreateOutraDespesaReceitaDto) => {
  if (isSaving.value) return
  isSaving.value = true

  const isEditing = editingItem.value && editingItem.value.id !== undefined

  try {
    if (isEditing) {
      await outraDespesaReceitaService.update(editingItem.value!.id!, data)
      toast.success('Despesa/Receita atualizada com sucesso!')
    } else {
      await outraDespesaReceitaService.create(data)
      toast.success('Despesa/Receita criada com sucesso!')
    }
    isModalOpen.value = false
    await fetchItems()
  } catch (error) {
    console.error('Erro ao salvar:', error)
    toast.error('Erro ao salvar. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta despesa/receita?')) {
    try {
      await outraDespesaReceitaService.delete(id)
      toast.success('Despesa/Receita excluída com sucesso!')
      await fetchItems()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir. Tente novamente.')
    }
  }
}

// Helper functions
const getPlanoGerencialDesc = (planoGerencialId: number): string => {
  const plano = planosGerenciais.value.find((p) => p.id === planoGerencialId)
  return plano ? `${plano.item} - ${plano.descricao}` : String(planoGerencialId)
}

const getConfiguradorCicloDesc = (cfgId: number | null | undefined): string => {
  if (!cfgId) return '-'
  const cfg = configuradoresCiclo.value.find((c) => c.id_cfg === cfgId)
  if (!cfg) return String(cfgId)
  const cultura = cfg.cultura?.descricao ?? ''
  const talhao = cfg.talhao?.descricao ?? ''
  return `${cultura} - ${talhao}`
}

const formatDate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '-'
  const parts = dateStr.substring(0, 10).split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return dateStr
}

const formatCurrency = (value: number | undefined | null): string => {
  if (value === null || value === undefined) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
}

const clearFilters = () => {
  filterTipo.value = ''
  filterPlanoGerencial.value = ''
  filterDataInicio.value = ''
  filterDataFim.value = ''
  filterConfiguradorCiclo.value = ''
  filterCultura.value = ''
}

const hasActiveFilters = computed(() => {
  return (
    filterTipo.value !== '' ||
    filterPlanoGerencial.value !== '' ||
    filterDataInicio.value !== '' ||
    filterDataFim.value !== '' ||
    filterConfiguradorCiclo.value !== '' ||
    filterCultura.value !== ''
  )
})

// IDs de configuradores de ciclo que pertencem à safra selecionada
const safraConfiguradorIds = computed(() => {
  if (!safraStore.selectedSafraId) return null
  const ids = new Set<number>()
  for (const cfg of configuradoresCiclo.value) {
    if (cfg.ciclo?.id === safraStore.selectedSafraId) {
      ids.add(cfg.id_cfg)
    }
  }
  return ids
})

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    // Filtro por safra global (via configuradores de ciclo da safra)
    if (safraConfiguradorIds.value) {
      // Item com configuradorCiclo: verificar se pertence à safra
      // Item sem configuradorCiclo (alocação por propriedade): ocultar quando safra está filtrada
      if (!item.configuradorCicloId || !safraConfiguradorIds.value.has(item.configuradorCicloId)) {
        return false
      }
    }

    // Busca textual
    const planoDesc = item.planoGerencial
      ? `${item.planoGerencial.item} - ${item.planoGerencial.descricao}`
      : getPlanoGerencialDesc(item.planoGerencialId)
    const matchesSearch =
      !searchTerm.value ||
      planoDesc.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (item.observacoes ?? '').toLowerCase().includes(searchTerm.value.toLowerCase())

    // Filtro por Tipo (DESPESA / RECEITA)
    const matchesTipo =
      filterTipo.value === '' || item.tipo === filterTipo.value

    // Filtro por Plano Gerencial
    const matchesPlano =
      filterPlanoGerencial.value === '' ||
      item.planoGerencialId === Number(filterPlanoGerencial.value)

    // Filtro por data de início
    const matchesDataInicio =
      !filterDataInicio.value || item.dataMovimento >= filterDataInicio.value

    // Filtro por data de fim
    const matchesDataFim =
      !filterDataFim.value || item.dataMovimento <= filterDataFim.value

    // Filtro por Configurador de Ciclo
    const matchesCfg =
      filterConfiguradorCiclo.value === '' ||
      item.configuradorCicloId === Number(filterConfiguradorCiclo.value)

    // Filtro por Cultura (via ConfiguradorCiclo)
    const matchesCultura =
      filterCultura.value === '' ||
      (item.configuradorCiclo?.cultura?.id === Number(filterCultura.value))

    return matchesSearch && matchesTipo && matchesPlano && matchesDataInicio && matchesDataFim && matchesCfg && matchesCultura
  })
})

// Mapa de prefixo do item (primeiro segmento) → classificação (RECEITA ou DESPESA)
const prefixClassificacaoMap = computed(() => {
  const map = new Map<string, string>()
  planosGerenciais.value
    .filter((p) => p.nivel === 1)
    .forEach((root) => {
      const prefix = root.item.split('.')[0]
      if (!prefix) return
      const desc = root.descricao.toLowerCase()
      if (desc.includes('receita')) map.set(prefix, 'RECEITA')
      else if (desc.includes('despesa')) map.set(prefix, 'DESPESA')
    })
  return map
})

// Opções para o filtro de plano gerencial (apenas analíticas, filtrado por tipo selecionado)
const planosAnaliticos = computed(() => {
  return planosGerenciais.value.filter((p) => {
    if (p.tipo !== 'ANALITICA') return false
    if (filterTipo.value === '') return true
    const prefix = p.item.split('.')[0]
    if (!prefix) return false
    const classificacao = prefixClassificacaoMap.value.get(prefix)
    return classificacao === filterTipo.value
  })
})

// Limpar filtro de plano gerencial quando tipo mudar (as opções mudam)
watch(filterTipo, () => {
  filterPlanoGerencial.value = ''
})

onMounted(() => {
  fetchItems()
  fetchLookups()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <OutraDespesaReceitaModal
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
          <h1 class="text-4xl font-bold text-gray-900">Outras Despesas e Receitas</h1>
          <p class="text-gray-500 mt-1">Gerencie despesas e receitas vinculadas a planos gerenciais</p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Nova Despesa/Receita
        </button>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col gap-4">
          <div class="flex flex-col sm:flex-row justify-between gap-4">
            <h2 class="text-lg font-bold text-gray-900 self-center">Lista de Despesas/Receitas</h2>

            <div class="flex gap-3 items-center">
              <div class="relative w-full sm:w-64">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="searchTerm"
                  type="text"
                  placeholder="Buscar..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
              </div>
              <button
                @click="showFilters = !showFilters"
                class="inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors"
                :class="hasActiveFilters
                  ? 'border-lime-500 text-lime-700 bg-lime-50 hover:bg-lime-100'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
              >
                <Filter class="h-4 w-4 mr-1" />
                Filtros
                <span
                  v-if="hasActiveFilters"
                  class="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-lime-600 text-white rounded-full"
                >!</span>
              </button>
            </div>
          </div>

          <!-- Filters row -->
          <div v-if="showFilters" class="flex flex-col gap-3 pt-2 border-t border-gray-100">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <!-- Tipo -->
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-1">Tipo</label>
                <select
                  v-model="filterTipo"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="DESPESA">Despesa</option>
                  <option value="RECEITA">Receita</option>
                </select>
              </div>

              <!-- Plano Gerencial -->
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-1">Plano Gerencial</label>
                <select
                  v-model="filterPlanoGerencial"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option v-for="p in planosAnaliticos" :key="p.id" :value="p.id">
                    {{ p.item }} - {{ p.descricao }}
                  </option>
                </select>
              </div>

              <!-- Data Início -->
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-1">Data Início</label>
                <input
                  v-model="filterDataInicio"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
              </div>

              <!-- Data Fim -->
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-1">Data Fim</label>
                <input
                  v-model="filterDataFim"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
              </div>

              <!-- Configurador de Ciclo -->
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-1">Configurador de Ciclo</label>
                <select
                  v-model="filterConfiguradorCiclo"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option v-for="cfg in configuradoresCiclo" :key="cfg.id_cfg" :value="cfg.id_cfg">
                    {{ cfg.cultura?.descricao ?? '' }} - {{ cfg.talhao?.descricao ?? '' }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <!-- Cultura -->
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-1">Cultura</label>
                <select
                  v-model="filterCultura"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  <option v-for="c in culturas" :key="c.id" :value="c.id">
                    {{ c.descricao_clt }}
                  </option>
                </select>
              </div>

              <div class="flex items-end">
                <button
                  v-if="hasActiveFilters"
                  @click="clearFilters"
                  class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <div v-if="isLoading" class="flex items-center justify-center py-16 text-gray-400">
            <span class="w-6 h-6 border-2 border-gray-200 border-t-lime-600 rounded-full animate-spin mr-3"></span>
            Carregando...
          </div>

          <table v-else class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Plano Gerencial
                </th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Alocacao
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Configurador de Ciclo
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Observacoes
                </th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="item in filteredItems"
                :key="item.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ formatDate(item.dataMovimento) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="TIPO_COLORS[item.tipo]"
                  >
                    {{ TIPO_LABELS[item.tipo] }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{
                    item.planoGerencial
                      ? `${item.planoGerencial.item} - ${item.planoGerencial.descricao}`
                      : getPlanoGerencialDesc(item.planoGerencialId)
                  }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium"
                  :class="item.tipo === 'RECEITA' ? 'text-green-700' : 'text-red-700'"
                >
                  {{ formatCurrency(item.valor) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ TIPO_ALOCACAO_LABELS[item.tipoAlocacao] }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{
                    item.configuradorCiclo
                      ? `${item.configuradorCiclo.cultura?.descricao ?? ''} - ${item.configuradorCiclo.talhao?.descricao ?? ''}`
                      : getConfiguradorCicloDesc(item.configuradorCicloId)
                  }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {{ item.observacoes ?? '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-3">
                    <button
                      @click="handleEdit(item)"
                      class="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Editar"
                    >
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button
                      @click="handleDelete(item.id!)"
                      class="text-gray-400 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredItems.length === 0">
                <td colspan="8" class="px-6 py-16 text-center text-sm text-gray-400">
                  Nenhuma despesa/receita encontrada.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
