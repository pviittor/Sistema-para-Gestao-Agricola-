<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import NumeracaoReciboModal from '@/components/NumeracaoReciboModal.vue'
import type { NumeracaoRecibo } from '@/types/Recibo'
import { numeracaoReciboService } from '@/services/numeracaoReciboService'

const isModalOpen = ref(false)
const isSaving = ref(false)
const editingItem = ref<NumeracaoRecibo | null>(null)
const items = ref<NumeracaoRecibo[]>([])
const isLoading = ref(false)

const fetchItems = async () => {
  isLoading.value = true
  try {
    const result = await numeracaoReciboService.getAll(1, 100)
    items.value = result.data
  } catch (error) {
    toast.error('Erro ao carregar séries de numeração.')
  } finally {
    isLoading.value = false
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleEdit = (item: NumeracaoRecibo) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleSave = async (data: any) => {
  isSaving.value = true
  try {
    if (editingItem.value?.id) {
      await numeracaoReciboService.update(editingItem.value.id, data)
      toast.success('Série atualizada com sucesso!')
    } else {
      await numeracaoReciboService.create(data)
      toast.success('Série criada com sucesso!')
    }
    isModalOpen.value = false
    fetchItems()
  } catch (error: any) {
    const msg = error?.response?.data?.error?.message || 'Erro ao salvar.'
    toast.error(msg)
  } finally {
    isSaving.value = false
  }
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta série?')) {
    try {
      await numeracaoReciboService.delete(id)
      toast.success('Série excluída com sucesso!')
      fetchItems()
    } catch (error) {
      toast.error('Erro ao excluir.')
    }
  }
}

onMounted(fetchItems)
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <NumeracaoReciboModal :is-open="isModalOpen" :initial-data="editingItem" :loading="isSaving" @close="isModalOpen = false" @save="handleSave" />

    <div class="max-w-4xl mx-auto space-y-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Numeração de Recibos</h1>
          <p class="text-gray-500 mt-1">Gerencie as séries de numeração sequencial</p>
        </div>
        <button @click="handleNew" class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 transition-colors">
          <Plus class="h-4 w-4 mr-2" />
          Nova Série
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div v-if="isLoading" class="flex items-center justify-center py-16">
          <div class="w-6 h-6 border-2 border-lime-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Série</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Último Número</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Ativo</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ item.serie }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ item.ultimoNumero }}</td>
                <td class="px-6 py-4 text-center">
                  <span :class="item.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ item.ativo ? 'Sim' : 'Não' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button @click="handleEdit(item)" class="p-1.5 text-gray-400 hover:text-lime-600 rounded"><Pencil class="h-4 w-4" /></button>
                    <button @click="handleDelete(item.id)" class="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 class="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-gray-500">Nenhuma série cadastrada.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
