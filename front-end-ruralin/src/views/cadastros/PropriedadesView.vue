<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2, Search, MapPin } from 'lucide-vue-next'
import PropriedadesModal from '@/components/PropriedadesModal.vue'
import type { Propriedade } from '@/types/Propriedade'
import { propriedadeService } from '@/services/propriedadeService'

// Modal state
const isModalOpen = ref(false)
const editingItem = ref<Propriedade | null>(null)

// List state
const items = ref<Propriedade[]>([])
const searchTerm = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

const fetchItems = async () => {
  isLoading.value = true
  try {
    const result = await propriedadeService.getAll(1, 100)
    items.value = result.data.data
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error)
    toast.error('Erro ao carregar propriedades.')
  } finally {
    isLoading.value = false
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSave = async (data: Propriedade) => {
  isSaving.value = true
  try {
    if (data.id) {
      await propriedadeService.update(data.id, data)
      toast.success('Propriedade atualizada com sucesso!')
    } else {
      await propriedadeService.create(data)
      toast.success('Propriedade criada com sucesso!')
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

const handleEdit = (item: Propriedade) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta propriedade?')) {
    try {
      await propriedadeService.delete(id)
      toast.success('Propriedade excluída com sucesso!')
      fetchItems()
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
    <PropriedadesModal
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
          <h1 class="text-4xl font-bold text-gray-900">Propriedades / Fazendas</h1>
          <p class="text-gray-500 mt-1">Gerencie suas propriedades rurais e locais de estoque</p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Nova Propriedade
        </button>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <h2 class="text-lg font-bold text-gray-900 self-center">Lista de Propriedades</h2>

          <div class="relative w-full sm:w-64">
             <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search class="h-4 w-4 text-gray-400" />
              </div>
            <input
                v-model="searchTerm"
                type="text"
                placeholder="Buscar propriedade..."
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
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
                  Município
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Área Total
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Configurações
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
                        <MapPin class="h-4 w-4" />
                    </div>
                    <div>
                        {{ item.descricao }}
                        <div class="text-xs text-gray-400 font-normal">{{ item.endereco }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.municipio ? `${item.municipio.nome} - ${item.municipio.estado?.sigla || ''}` : item.idMunicipio }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.areaTotal }} ha
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   <div class="flex gap-1">
                      <span v-if="item.movimentaLCDPR" class="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded" title="LCDPR">LCDPR</span>
                      <span v-if="item.arrendada" class="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded" title="Arrendada">Arr</span>
                   </div>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
