<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2, Search, Settings, DollarSign, FileText } from 'lucide-vue-next'
import OperacoesCampoModal from '@/components/OperacoesCampoModal.vue'
import type { OperacaoCampo } from '@/types/OperacaoCampo'
import { OPERACAO_CAMPO_LABELS } from '@/types/OperacaoCampo'

// Modal state
const isModalOpen = ref(false)
const isSaving = ref(false)
const editingItem = ref<OperacaoCampo | null>(null)

// List state
const items = ref<OperacaoCampo[]>([])
const searchTerm = ref('')

// Mock Data
const mockItems: OperacaoCampo[] = [
  {
    id: 1,
    codigo: '0',
    descricao: 'ATIVIDADE DE PRODUÇÃO',
    tipo: 0,
    financeiro: true
  },
  {
    id: 2,
    codigo: '1',
    descricao: 'MANUTENÇÃO DE MÁQUINAS',
    tipo: 1,
    financeiro: true
  },
  {
    id: 3,
    codigo: '2',
    descricao: 'ATIVIDADES ADMINISTRATIVAS',
    tipo: 2,
    financeiro: false
  },
  {
    id: 4,
    codigo: '3',
    descricao: 'MANUTENÇÃO DE BENFEITORIAS',
    tipo: 3,
    financeiro: true
  }
]

const filteredItems = computed(() => {
  if (!searchTerm.value) return items.value
  const term = searchTerm.value.toLowerCase()
  return items.value.filter(item => 
    item.descricao.toLowerCase().includes(term) ||
    (item.codigo || '').toLowerCase().includes(term) ||
    (OPERACAO_CAMPO_LABELS[item.tipo] || '').toLowerCase().includes(term)
  )
})

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSave = async (data: OperacaoCampo) => {
  const isEditing = editingItem.value && editingItem.value.id !== undefined
  isSaving.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    if (isEditing) {
      // Update local mock
      const index = items.value.findIndex(i => i.id === editingItem.value!.id)
      if (index !== -1) {
        items.value[index] = { ...data, id: editingItem.value!.id }
      }
    } else {
      // Create local mock
      const newId = Math.max(...items.value.map(i => i.id || 0), 0) + 1
      const newCodigo = String(Math.max(...items.value.map(i => Number(i.codigo) || 0), 0) + 1)
      items.value.push({ ...data, id: newId, codigo: data.codigo || newCodigo })
    }

    toast.success(isEditing ? 'Operação atualizada com sucesso!' : 'Operação criada com sucesso!')
    isModalOpen.value = false
  } catch (error) {
    console.error('Erro ao salvar:', error)
    toast.error('Erro ao salvar. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}

const handleEdit = (item: OperacaoCampo) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir este item?')) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      items.value = items.value.filter((item) => item.id !== id)
      toast.success('Item excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir. Tente novamente.')
    }
  }
}

onMounted(async () => {
  // Simulate fetching data
  items.value = mockItems
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <OperacoesCampoModal
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
          <h1 class="text-4xl font-bold text-gray-900">Operações de Campo</h1>
          <p class="text-gray-500 mt-1">Gerencie os tipos de operações e atividades</p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Nova Operação
        </button>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <h2 class="text-lg font-bold text-gray-900 self-center">Registros</h2>

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
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Financeiro?
                </th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.codigo || item.id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-full bg-lime-100 flex items-center justify-center text-lime-600">
                        <Settings class="h-4 w-4" />
                    </div>
                    <div>
                        {{ item.descricao }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ OPERACAO_CAMPO_LABELS[item.tipo] || 'Desconhecido' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                   <div v-if="item.financeiro" class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600">
                      <DollarSign class="h-4 w-4" />
                   </div>
                   <span v-else class="text-gray-300">-</span>
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
                <td colspan="5" class="px-6 py-8 text-center text-gray-500 text-sm">
                  Nenhum registro encontrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
