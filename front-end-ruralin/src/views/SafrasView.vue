<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2, Search, Sprout, Calendar } from 'lucide-vue-next'
import SafrasModal from '@/components/SafrasModal.vue'
import type { Safra } from '@/types/Safra'
import { StatusSafra } from '@/types/Safra'
import { safraService } from '@/services/safraService'
import { culturaService } from '@/services/culturaService'

// Modal state
const isModalOpen = ref(false)
const editingItem = ref<Safra | null>(null)

// List state
const items = ref<Safra[]>([])
const searchTerm = ref('')
const culturasMap = ref<Record<number, string>>({})
const isSaving = ref(false)

// Helpers
const loadCulturas = async () => {
  try {
    const result = await culturaService.getAll(1, 100)
    if (result && result.data) {
      const map: Record<number, string> = {}
      result.data.forEach((c) => {
        if (c.id) map[c.id] = c.descricao_clt
      })
      culturasMap.value = map
    }
  } catch (error) {
    console.error('Erro ao buscar culturas:', error)
  }
}

const getCulturaLabel = (id: number) => {
  return culturasMap.value[id] || 'Desconhecida'
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

const getStatusLabel = (status: StatusSafra) => {
  const map: Record<string, string> = {
    [StatusSafra.PLANEJADA]: 'Planejada',
    [StatusSafra.EM_ANDAMENTO]: 'Em Andamento',
    [StatusSafra.CONCLUIDA]: 'Concluída',
    [StatusSafra.CANCELADA]: 'Cancelada'
  }
  return map[status] || status
}

const getStatusClass = (status: StatusSafra) => {
  const map: Record<string, string> = {
    [StatusSafra.PLANEJADA]: 'bg-gray-100 text-gray-800',
    [StatusSafra.EM_ANDAMENTO]: 'bg-blue-100 text-blue-800',
    [StatusSafra.CONCLUIDA]: 'bg-green-100 text-green-800',
    [StatusSafra.CANCELADA]: 'bg-red-100 text-red-800'
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

const fetchData = async () => {
  try {
    const result = await safraService.getAll()
    // Check if result is array (direct) or paginated object
    if (Array.isArray(result)) {
      items.value = result
    } else if (result && result.data && result.data.data) {
      items.value = result.data.data
    } else {
      items.value = []
    }
  } catch (error) {
    console.error('Erro ao buscar safras:', error)
    toast.error('Erro ao carregar safras.')
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSave = async (data: Safra) => {
  const isEditing = editingItem.value && editingItem.value.id !== undefined
  isSaving.value = true

  try {
    if (isEditing) {
      await safraService.update(editingItem.value!.id!, data)
    } else {
      await safraService.create(data)
    }

    toast.success(isEditing ? 'Safra atualizada com sucesso!' : 'Safra criada com sucesso!')
    isModalOpen.value = false
    await fetchData()
  } catch (error) {
    console.error('Erro ao salvar:', error)
    toast.error('Erro ao salvar. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}

const handleEdit = (item: Safra) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta safra?')) {
    try {
      await safraService.delete(id)
      toast.success('Safra excluída com sucesso!')
      await fetchData()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir. Tente novamente.')
    }
  }
}

onMounted(async () => {
  await Promise.all([fetchData(), loadCulturas()])
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <SafrasModal
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
          <h1 class="text-4xl font-bold text-gray-900">Safras</h1>
          <p class="text-gray-500 mt-1">Gerencie os ciclos produtivos e safras agrícolas</p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Nova Safra
        </button>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <h2 class="text-lg font-bold text-gray-900 self-center">Lista de Safras</h2>

          <div class="relative w-full sm:w-64">
             <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search class="h-4 w-4 text-gray-400" />
              </div>
            <input
                v-model="searchTerm"
                type="text"
                placeholder="Buscar safra..."
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Cód.
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Safra
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Cultura
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-full bg-lime-100 flex items-center justify-center text-lime-600">
                        <Sprout class="h-4 w-4" />
                    </div>
                    <div>
                        {{ item.nome }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getCulturaLabel(item.culturaId) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex items-center gap-2">
                    <Calendar class="h-3 w-3 text-gray-400" />
                    <span>{{ formatDate(item.dataInicio) }}</span>
                    <span class="text-gray-400">até</span>
                    <span>{{ formatDate(item.dataFim) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(item.status)">
                      {{ getStatusLabel(item.status) }}
                   </span>
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
                      @click="handleDelete(item.id!)"
                      class="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-500 text-sm">
                  Nenhuma safra encontrada.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
