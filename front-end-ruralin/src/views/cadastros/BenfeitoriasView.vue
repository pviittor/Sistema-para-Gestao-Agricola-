<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2, Search, NotepadText } from 'lucide-vue-next'
import BenfeitoriasModal from '@/components/BenfeitoriasModal.vue'
import type { Benfeitoria } from '@/types/Benfeitoria'
import { benfeitoriaService } from '@/services/benfeitoriaService'
import { propriedadeService } from '@/services/propriedadeService'
import { safraService } from '@/services/safraService'
import { useSafraStore } from '@/stores/safra'

const safraStore = useSafraStore()

// Modal state
const isModalOpen = ref(false)
const isSaving = ref(false)
const editingItem = ref<Benfeitoria | null>(null)

// List state
const items = ref<Benfeitoria[]>([])
const searchTerm = ref('')
const isLoading = ref(false)

// Lookup maps
const fazendaMap = ref<Record<number, string>>({})
const safraMap = ref<Record<number, string>>({})

const getFazendaLabel = (id?: number | null) =>
  id ? (fazendaMap.value[id] ?? String(id)) : '-'

const getSafraLabel = (id?: number | null) =>
  id ? (safraMap.value[id] ?? String(id)) : '-'

const filteredItems = computed(() => {
  let result = items.value

  // Filtro por safra global
  if (safraStore.selectedSafraId) {
    result = result.filter((i) => i.idSafra === safraStore.selectedSafraId)
  }

  if (!searchTerm.value.trim()) return result
  const term = searchTerm.value.toLowerCase()
  return result.filter(
    (i) =>
      i.descricao.toLowerCase().includes(term) ||
      getFazendaLabel(i.idFazenda).toLowerCase().includes(term) ||
      getSafraLabel(i.idSafra).toLowerCase().includes(term) ||
      String(i.id_benf).includes(term),
  )
})

const fetchLookups = async () => {
  const [fazendas, safras] = await Promise.all([
    propriedadeService.getAllNoPagination(),
    safraService.getAll(1, 1000),
  ])

  fazendaMap.value = Object.fromEntries(
    (fazendas.data ?? []).map((f) => [f.id!, f.descricao]),
  )

  safraMap.value = Object.fromEntries(
    (safras.data?.data ?? []).map((s) => [s.id!, s.nome]),
  )
}

const fetchItems = async () => {
  isLoading.value = true
  try {
    const result = await benfeitoriaService.getAll(1, 100)
    items.value = result.data
  } catch (error) {
    console.error('Erro ao buscar benfeitorias:', error)
    toast.error('Erro ao carregar benfeitorias.')
  } finally {
    isLoading.value = false
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSave = async (data: Benfeitoria) => {
  isSaving.value = true
  try {
    if (data.id_benf) {
      await benfeitoriaService.update(data.id_benf, data)
      toast.success('Benfeitoria atualizada com sucesso!')
    } else {
      await benfeitoriaService.create(data)
      toast.success('Benfeitoria criada com sucesso!')
    }
    isModalOpen.value = false
    fetchItems()
  } catch (error) {
    console.error('Erro ao salvar:', error)
    toast.error('Erro ao salvar. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}

const handleEdit = (item: Benfeitoria) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta benfeitoria?')) {
    try {
      await benfeitoriaService.delete(id)
      toast.success('Benfeitoria excluída com sucesso!')
      fetchItems()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir. Tente novamente.')
    }
  }
}

onMounted(() => {
  fetchLookups()
  fetchItems()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <BenfeitoriasModal
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
          <h1 class="text-4xl font-bold text-gray-900">Benfeitorias</h1>
          <p class="text-gray-500 mt-1">Gerencie as benfeitorias e melhorias das suas fazendas</p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Nova Benfeitoria
        </button>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <h2 class="text-lg font-bold text-gray-900 self-center">Lista de Benfeitorias</h2>

          <div class="relative w-full sm:w-64">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-4 w-4 text-gray-400" />
            </div>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar benfeitoria..."
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex items-center justify-center py-16">
          <div class="w-6 h-6 border-2 border-lime-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Fazenda
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Safra
                </th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Vida Útil
                </th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="item in filteredItems"
                :key="item.id_benf"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.id_benf }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div class="flex items-center gap-3">
                    <div
                      class="h-8 w-8 rounded-full bg-lime-100 flex items-center justify-center text-lime-600 flex-shrink-0"
                    >
                      <NotepadText class="h-4 w-4" />
                    </div>
                    <div>
                      {{ item.descricao }}
                      <div class="text-xs text-gray-400 font-normal">
                        {{ item.unidadeMedida?.descricao || '' }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getFazendaLabel(item.idFazenda) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getSafraLabel(item.idSafra) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  R$ {{ Number(item.valortotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  {{ item.vidautil }} anos
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-3">
                    <button
                      @click="handleEdit(item)"
                      class="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button
                      @click="handleDelete(item.id_benf!)"
                      class="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredItems.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-gray-500 text-sm">
                  Nenhuma benfeitoria encontrada.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
