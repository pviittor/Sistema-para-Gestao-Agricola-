<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2, Search, FileText } from 'lucide-vue-next'
import ServicosModal from '@/components/ServicosModal.vue'
import type { ServicoAgricola } from '@/types/ServicoAgricola'
import { servicoAgricolaService } from '@/services/servicoAgricolaService'

const isModalOpen = ref(false)
const editingItem = ref<ServicoAgricola | null>(null)

// List state
const items = ref<ServicoAgricola[]>([])
const searchTerm = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

const fetchItems = async () => {
  isLoading.value = true
  try {
    const response = await servicoAgricolaService.getAll(currentPage.value, 100)
    items.value = response.data
    totalPages.value = response.totalPages
  } catch {
    toast.error('Erro ao carregar serviços.')
  } finally {
    isLoading.value = false
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSave = async (data: ServicoAgricola) => {
  const isEditing = editingItem.value && editingItem.value.id_srv !== undefined
  isSaving.value = true

  const payload = {
    descricao_srv: data.descricao_srv,
    financeiro_srv: data.financeiro_srv,
    observacao_srv: data.observacao_srv
  }

  try {
    if (isEditing) {
      await servicoAgricolaService.update(editingItem.value!.id_srv!, payload)
    } else {
      await servicoAgricolaService.create(payload)
    }

    toast.success(isEditing ? 'Serviço atualizado com sucesso!' : 'Serviço criado com sucesso!')
    isModalOpen.value = false
    fetchItems()
  } catch {
    toast.error('Erro ao salvar. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}

const handleEdit = (item: ServicoAgricola) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir este serviço?')) {
    try {
      await servicoAgricolaService.delete(id)
      items.value = items.value.filter((item) => item.id_srv !== id)
      toast.success('Serviço excluído com sucesso!')
    } catch {
      toast.error('Erro ao excluir. Tente novamente.')
    }
  }
}

onMounted(() => {
  fetchItems()
})

// Simple client-side search filtering for now since backend search might not be ready
watch(searchTerm, async (newTerm) => {
  if (!newTerm) {
    fetchItems()
    return
  }
  // If we had backend search:
  // items.value = await servicoAgricolaService.search(newTerm)

  // Client side filtering on current list (or fetch all then filter)
  // For now, let's just keep the current list filtered visually or refetch all
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <ServicosModal :is-open="isModalOpen" :initial-data="editingItem" :loading="isSaving" @close="isModalOpen = false" @save="handleSave" />
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Serviços Agrícolas</h1>
          <p class="text-gray-500 mt-1">Gerencie os serviços prestados ou contratados</p>
        </div>
        <button @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors">
          <Plus class="h-4 w-4 mr-2" />
          Novo Serviço
        </button>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <h2 class="text-lg font-bold text-gray-900 self-center">Lista de Serviços</h2>

          <div class="relative w-full sm:w-64">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-4 w-4 text-gray-400" />
            </div>
            <input v-model="searchTerm" type="text" placeholder="Buscar serviço..."
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent" />
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
                  Descrição
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Financeiro
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Observações
                </th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in items" :key="item.id_srv" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.id_srv }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-full bg-lime-100 flex items-center justify-center text-lime-600">
                      <FileText class="h-4 w-4" />
                    </div>
                    <div>
                      {{ item.descricao_srv }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span v-if="item.financeiro_srv" class="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded"
                    title="Movimenta Financeiro">Sim</span>
                  <span v-else class="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded"
                    title="Não movimenta Financeiro">Não</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 truncate max-w-xs" :title="item.observacao_srv || ''">
                  {{ item.observacao_srv || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-3">
                    <button @click="handleEdit(item)" class="text-gray-400 hover:text-gray-600 transition-colors">
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button @click="handleDelete(item.id_srv!)"
                      class="text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500 text-sm">
                  Nenhum serviço encontrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
