<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { toast } from 'vue3-toastify'
import { Plus, MapPin, Pencil, Trash2 } from 'lucide-vue-next'
import LocalModal from '../components/LocalModal.vue'
import type { Local } from '../types/Local'

// Modal state
const isModalOpen = ref(false)
const isSaving = ref(false)
const editingItem = ref<Local | null>(null)

// History table
const items = ref<Local[]>([])

const handleNewLocal = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSaveLocal = async (data: Omit<Local, 'id'>) => {
  const isEditing = editingItem.value && editingItem.value.id !== undefined
  isSaving.value = true

  const payload = {
    ...data,
    ...(isEditing && { id: editingItem.value!.id }),
  }

  try {
    if (isEditing) {
      await api.put(`/locais/${editingItem.value!.id}`, payload)
    } else {
      await api.post('/locais', payload)
    }

    // Refresh data from server
    const { data: newData } = await api.get('/locais')
    items.value = newData

    toast.success(isEditing ? 'Local atualizado com sucesso!' : 'Local criado com sucesso!')

    isModalOpen.value = false
  } catch (error) {
    console.error('Erro ao salvar local:', error)
    toast.error('Erro ao salvar o local. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}

const handleEdit = (id: number) => {
  const item = items.value.find((item) => item.id === id)
  if (item) {
    editingItem.value = item
    isModalOpen.value = true
  }
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir este local?')) {
    try {
      await api.delete(`/locais/${id}`)
      items.value = items.value.filter((item) => item.id !== id)
      toast.success('Local excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir local:', error)
      toast.error('Erro ao excluir o local. Tente novamente.')
    }
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/locais')
    items.value = data
  } catch (error) {
    console.error('Erro ao buscar locais:', error)
    toast.error('Erro ao carregar locais.')
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <LocalModal
      :is-open="isModalOpen"
      :initial-data="editingItem"
      :loading="isSaving"
      @close="isModalOpen = false"
      @save="handleSaveLocal"
    />
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Locais</h1>
          <p class="text-gray-500 mt-1">Gerencie os locais de atendimento</p>
        </div>
        <button
          @click="handleNewLocal"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Novo Local
        </button>
      </div>

      <!-- History Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100">
          <h2 class="text-lg font-bold text-gray-900">Lista de Locais</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3"
                >
                  Nome
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Endereço / Detalhes
                </th>
                <th
                  class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-gray-100 rounded-lg">
                      <MapPin class="h-4 w-4 text-gray-500" />
                    </div>
                    {{ item.desc_simples }}
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ item.desc_completa || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-3">
                    <button
                      @click="handleEdit(item.id!)"
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
              <!-- Empty state if needed -->
              <tr v-if="items.length === 0">
                <td colspan="3" class="px-6 py-8 text-center text-gray-500 text-sm">
                  Nenhum local encontrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
