<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Search, Layers, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-vue-next'
import CentroCustoModal from '@/components/CentroCustoModal.vue'
import type { CentroCusto } from '@/types/CentroCusto'
import { centroCustoService } from '@/services/centroCustoService'

// State
const isModalOpen = ref(false)
const isSaving = ref(false)
const editingItem = ref<CentroCusto | null>(null)
const items = ref<CentroCusto[]>([])
const searchTerm = ref('')
const isLoading = ref(false)

// Pagination state
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const itemsPerPage = ref(10)

const filteredItems = computed(() => {
  if (!searchTerm.value) return items.value
  const term = searchTerm.value.toLowerCase()
  return items.value.filter(item =>
    item.nome.toLowerCase().includes(term) ||
    item.codigo.toLowerCase().includes(term)
  )
})

const fetchItems = async () => {
  isLoading.value = true
  try {
    const result = await centroCustoService.getAll(currentPage.value, itemsPerPage.value)
    items.value = result.data.data
    // Update pagination info if available in response
    // Based on PaginatedResult interface
    if (result.data.page) currentPage.value = result.data.page
    if (result.data.totalPages) totalPages.value = result.data.totalPages
    if (result.data.total) totalItems.value = result.data.total
  } catch (error) {
    console.error(error)
    toast.error('Erro ao carregar centros de custo')
  } finally {
    isLoading.value = false
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleEdit = (item: CentroCusto) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir este centro de custo?')) {
    try {
      await centroCustoService.delete(id)
      items.value = items.value.filter(i => i.id !== id)
      toast.success('Centro de custo excluído com sucesso!')
      fetchItems() // Refresh to update pagination if needed
    } catch (error) {
      console.error(error)
      toast.error('Erro ao excluir centro de custo. Verifique se existem registros vinculados.')
    }
  }
}

const handleSave = async (data: CentroCusto) => {
  isSaving.value = true
  try {
    if (editingItem.value?.id) {
      // Edit
      await centroCustoService.update(editingItem.value.id, data)
      toast.success('Centro de custo atualizado com sucesso!')
    } else {
      // New
      await centroCustoService.create(data)
      toast.success('Centro de custo criado com sucesso!')
    }
    isModalOpen.value = false
    await fetchItems()
  } catch {
    toast.error('Erro ao salvar centro de custo.')
  } finally {
    isSaving.value = false
  }
}

const handlePageChange = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    currentPage.value = newPage
    fetchItems()
  }
}

onMounted(() => {
  fetchItems()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <CentroCustoModal :is-open="isModalOpen" :initial-data="editingItem" :loading="isSaving" @close="isModalOpen = false"
      @save="handleSave" />

    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Centros de Custo</h1>
          <p class="text-gray-500 mt-1">Gerencie a estrutura de custos da sua propriedade</p>
        </div>
        <button @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors">
          <Plus class="h-4 w-4 mr-2" />
          Novo Centro de Custo
        </button>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-bold text-gray-900">Lista de Centros de Custo</h2>
            <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{{ totalItems }} itens</span>
          </div>

          <div class="relative w-full sm:w-64">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-4 w-4 text-gray-400" />
            </div>
            <input v-model="searchTerm" type="text" placeholder="Buscar por nome ou código..."
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent" />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Descrição</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Código</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pai</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50 transition-colors group">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-lg bg-lime-100 flex items-center justify-center text-lime-600">
                      <Layers class="h-5 w-5" />
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ item.nome }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span class="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{{ item.codigo }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span v-if="item.centroCustoPai" class="inline-flex items-center gap-1">
                    <Layers class="h-3 w-3 text-gray-400" />
                    {{ item.centroCustoPai.nome }}
                  </span>
                  <span v-else class="text-gray-400 italic">-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span v-if="item.ativo"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 gap-1">
                    <CheckCircle class="h-3 w-3" /> Ativo
                  </span>
                  <span v-else
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 gap-1">
                    <XCircle class="h-3 w-3" /> Inativo
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="handleEdit(item)" class="p-1 text-gray-400 hover:text-lime-600 transition-colors"
                      title="Editar">
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button @click="handleDelete(item.id!)"
                      class="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Excluir">
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredItems.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500 text-sm">
                  <div v-if="isLoading" class="flex justify-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-lime-600"></div>
                  </div>
                  <span v-else>Nenhum centro de custo encontrado.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Mostrando página {{ currentPage }} de {{ totalPages }}
          </div>
          <div class="flex gap-2">
            <button @click="handlePageChange(currentPage - 1)" :disabled="currentPage === 1"
              class="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Anterior
            </button>
            <button @click="handlePageChange(currentPage + 1)" :disabled="currentPage === totalPages"
              class="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Próxima
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
