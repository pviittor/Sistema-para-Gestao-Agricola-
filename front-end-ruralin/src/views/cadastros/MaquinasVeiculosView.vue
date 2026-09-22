<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2, Search, Tractor } from 'lucide-vue-next'
import MaquinasVeiculosModal from '@/components/MaquinasVeiculosModal.vue'
import type { MaquinaVeiculo } from '@/types/MaquinaVeiculo'
import { maquinaService } from '@/services/maquinaService'
import { propriedadeService } from '@/services/propriedadeService'

// Modal state
const isModalOpen = ref(false)
const isSaving = ref(false)
const editingItem = ref<MaquinaVeiculo | null>(null)

// List state
const items = ref<MaquinaVeiculo[]>([])
const searchTerm = ref('')
const isLoading = ref(false)

// Lookup maps
const fazendaMap = ref<Record<number, string>>({})

const getFazendaLabel = (id?: number | null) =>
  id ? (fazendaMap.value[id] ?? String(id)) : '-'

const TIPO_MAP: Record<number, string> = {
  1: 'Máquina',
  2: 'Veículo',
  3: 'Implemento',
}

const getTipoLabel = (tipo?: number | null) =>
  tipo ? (TIPO_MAP[tipo] ?? '-') : '-'

const filteredItems = computed(() => {
  if (!searchTerm.value.trim()) return items.value
  const term = searchTerm.value.toLowerCase()
  return items.value.filter(
    (i) =>
      i.descricao.toLowerCase().includes(term) ||
      (i.marca ?? '').toLowerCase().includes(term) ||
      (i.modelo ?? '').toLowerCase().includes(term) ||
      (i.placa ?? '').toLowerCase().includes(term) ||
      getFazendaLabel(i.idFazenda).toLowerCase().includes(term) ||
      String(i.id_mqn).includes(term),
  )
})

const fetchLookups = async () => {
  try {
    const fazendas = await propriedadeService.getAllNoPagination()
    fazendaMap.value = Object.fromEntries(
      (fazendas.data ?? []).map((f) => [f.id!, f.descricao]),
    )
  } catch {
    // silently ignore lookup errors
  }
}

const fetchItems = async () => {
  isLoading.value = true
  try {
    const result = await maquinaService.getAll(1, 100)
    items.value = result.data
  } catch (error) {
    console.error('Erro ao buscar máquinas:', error)
    toast.error('Erro ao carregar máquinas.')
  } finally {
    isLoading.value = false
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSave = async (data: MaquinaVeiculo) => {
  isSaving.value = true
  try {
    if (data.id_mqn) {
      await maquinaService.update(data.id_mqn, data)
      toast.success('Máquina atualizada com sucesso!')
    } else {
      await maquinaService.create(data)
      toast.success('Máquina criada com sucesso!')
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

const handleEdit = (item: MaquinaVeiculo) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta máquina/veículo?')) {
    try {
      await maquinaService.delete(id)
      toast.success('Máquina excluída com sucesso!')
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
    <MaquinasVeiculosModal
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
          <h1 class="text-4xl font-bold text-gray-900">Máquinas e Veículos</h1>
          <p class="text-gray-500 mt-1">Gerencie a frota de máquinas, veículos e implementos</p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Nova Máquina
        </button>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <h2 class="text-lg font-bold text-gray-900 self-center">Lista de Máquinas e Veículos</h2>

          <div class="relative w-full sm:w-64">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-4 w-4 text-gray-400" />
            </div>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar máquina..."
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
                  Descrição / Modelo
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Identificação
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Fazenda
                </th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="item in filteredItems"
                :key="item.id_mqn"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.id_mqn }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div class="flex items-center gap-3">
                    <div
                      class="h-8 w-8 rounded-full bg-lime-100 flex items-center justify-center text-lime-600 flex-shrink-0"
                    >
                      <Tractor class="h-4 w-4" />
                    </div>
                    <div>
                      {{ item.descricao }}
                      <div class="text-xs text-gray-400 font-normal">
                        {{ [item.marca, item.modelo, item.ano].filter(Boolean).join(' · ') }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div v-if="item.placa" class="flex items-center gap-1">
                    <span class="text-xs font-semibold text-gray-400">Placa:</span>
                    {{ item.placa }}
                  </div>
                  <div v-else-if="item.serie" class="flex items-center gap-1">
                    <span class="text-xs font-semibold text-gray-400">Série:</span>
                    {{ item.serie }}
                  </div>
                  <div v-else-if="item.chassi" class="flex items-center gap-1">
                    <span class="text-xs font-semibold text-gray-400">Chassi:</span>
                    {{ item.chassi }}
                  </div>
                  <span v-else class="text-gray-300 italic text-xs">Sem identificação</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getTipoLabel(item.tipo) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getFazendaLabel(item.idFazenda) }}
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
                      @click="handleDelete(item.id_mqn!)"
                      class="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredItems.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500 text-sm">
                  Nenhuma máquina encontrada.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
