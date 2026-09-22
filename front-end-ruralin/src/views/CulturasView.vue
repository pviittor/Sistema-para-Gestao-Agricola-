<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2, Search, Sprout, Package } from 'lucide-vue-next'
import CulturasModal from '@/components/CulturasModal.vue'
import type { Cultura } from '@/types/Cultura'
import { culturaService } from '@/services/culturaService'
import type { Produto } from '@/types/Produto'
import { produtoService } from '@/services/produtoService'

// Modal state
const isModalOpen = ref(false)
const isSaving = ref(false)
const editingItem = ref<Cultura | null>(null)

// List state
const items = ref<Cultura[]>([])
const produtos = ref<Produto[]>([])
const searchTerm = ref('')
const isLoading = ref(false)

// Mock de produtos (deve estar sincronizado com o modal ou vir de uma store/api)
const produtosMap: Record<number, string> = {
  1: 'Soja',
  2: 'Milho',
  3: 'Trigo',
  4: 'Café Arábica',
  5: 'Algodão'
}

// Helpers to display labels
const getProdutoLabel = (id?: number) => {
  return id ? produtosMap[id] || 'Produto Desconhecido' : '-'
}

const fetchItems = async () => {
  isLoading.value = true
  try {
    Promise.all([
      culturaService.getAll(1, 100),
      produtoService.getAll(1, 100),
    ]).then(([culturaRes, produtoRes]) => {
      items.value = culturaRes.data
      produtos.value = produtoRes.data
    }).catch((error) => {
      toast.error('Erro ao carregar culturas')
    })
  } catch (error) {
    toast.error('Erro ao carregar culturas')
  } finally {
    isLoading.value = false
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSave = async (data: Cultura) => {
  const isEditing = editingItem.value && editingItem.value.id !== undefined
  isSaving.value = true

  try {
    if (isEditing) {
      await culturaService.update(editingItem.value!.id!, data)
    } else {
      await culturaService.create(data)
    }

    toast.success(isEditing ? 'Cultura atualizada com sucesso!' : 'Cultura criada com sucesso!')
    isModalOpen.value = false
    fetchItems()
  } catch (error) {
    console.error('Erro ao salvar:', error)
    toast.error('Erro ao salvar. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}

const handleEdit = (item: Cultura) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta cultura?')) {
    try {
      await culturaService.delete(id)
      toast.success('Cultura excluída com sucesso!')
      fetchItems() // Recarrega a lista
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir. Tente novamente.')
    }
  }
}

onMounted(() => {
  fetchItems()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <CulturasModal :is-open="isModalOpen" :initial-data="editingItem" :loading="isSaving" @close="isModalOpen = false" @save="handleSave" />
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Culturas</h1>
          <p class="text-gray-500 mt-1">Gerencie as culturas do sistema</p>
        </div>
        <button @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors">
          <Plus class="h-4 w-4 mr-2" />
          Nova Cultura
        </button>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <h2 class="text-lg font-bold text-gray-900 self-center">Lista de Culturas</h2>

          <div class="relative w-full sm:w-64">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-4 w-4 text-gray-400" />
            </div>
            <input v-model="searchTerm" type="text" placeholder="Buscar cultura..."
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
                  Produto Base
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
                      {{ item.descricao_clt }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex items-center gap-2">
                    <Package class="h-4 w-4 text-gray-400" />
                    {{ produtos.find(p => p.id_prod === item.idProduto)?.descricao_prod || '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-3">
                    <button @click="handleEdit(item)" class="text-gray-400 hover:text-gray-600 transition-colors">
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button @click="handleDelete(item.id!)" class="text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-gray-500 text-sm">
                  Nenhuma cultura encontrada.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
