<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import LembreteModal from '../components/LembreteModal.vue'
import type { Lembrete } from '../types/Lembrete'

// Modal state
const isModalOpen = ref(false)
const isSaving = ref(false)
const editingItem = ref<Lembrete | null>(null)

// History table
const historyItems = ref<Lembrete[]>([])

const handleNewLembrete = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSaveLembrete = async (data: Omit<Lembrete, 'id'>) => {
  const isEditing = editingItem.value && editingItem.value.id !== undefined
  isSaving.value = true

  const payload = {
    ...data,
    ...(isEditing && { id: editingItem.value!.id }),
  }

  try {
    if (isEditing) {
      await api.put(`/lembretes/${editingItem.value!.id}`, payload)
    } else {
      await api.post('/lembretes', payload)
    }

    // Refresh data from server
    const { data: newData } = await api.get('/lembretes')
    historyItems.value = newData

    toast.success(
      isEditing ? 'Lembrete atualizado com sucesso!' : 'Lembrete criado com sucesso!',
    )

    isModalOpen.value = false
  } catch (error) {
    console.error('Erro ao salvar lembrete:', error)
    toast.error('Erro ao salvar o lembrete. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}

const handleEdit = (id: number) => {
  const item = historyItems.value.find((item) => item.id === id)
  if (item) {
    editingItem.value = item
    isModalOpen.value = true
  }
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir este lembrete?')) {
    try {
      await api.delete(`/lembretes/${id}`)
      historyItems.value = historyItems.value.filter((item) => item.id !== id)
      toast.success('Lembrete excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir lembrete:', error)
      toast.error('Erro ao excluir o lembrete. Tente novamente.')
    }
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/lembretes')
    historyItems.value = data
  } catch (error) {
    console.error('Erro ao buscar lembretes:', error)
    toast.error('Erro ao carregar lembretes.')
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <LembreteModal
      :is-open="isModalOpen"
      :initial-data="editingItem"
      :loading="isSaving"
      @close="isModalOpen = false"
      @save="handleSaveLembrete"
    />
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Lembretes</h1>
          <p class="text-gray-500 mt-1">Gerencie seus lembretes</p>
        </div>
         <button
          @click="handleNewLembrete"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Novo Lembrete
        </button>
      </div>

      <!-- History Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100">
          <h2 class="text-lg font-bold text-gray-900">Histórico</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/2"
                >
                  Descrição Simples
                </th>
                <th
                  class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Qtd. Datas
                </th>
                <th
                  class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="item in historyItems"
                :key="item.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ item.desc_simples }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ item.lembrete_data_hora ? item.lembrete_data_hora.length : 0 }}
                  </span>
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
              <tr v-if="historyItems.length === 0">
                <td colspan="3" class="px-6 py-8 text-center text-gray-500 text-sm">
                  Nenhum lembrete encontrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
