<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import TipoAtividadeOSModal from '@/components/TipoAtividadeOSModal.vue'
import type { TipoAtividadeOS, CreateTipoAtividadeOSPayload } from '@/types/TipoAtividadeOS'
import { CategoriaAtividadeOS } from '@/types/TipoAtividadeOS'
import { tipoAtividadeOSService } from '@/services/tipoAtividadeOSService'

const isModalOpen = ref(false)
const editingItem = ref<TipoAtividadeOS | null>(null)

const items = ref<TipoAtividadeOS[]>([])
const searchTerm = ref('')
const filterCategoria = ref('')
const filterAtivo = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const pageSize = 10

const categoriaLabels: Record<string, string> = {
  AGRICOLA: 'Agrícola',
  PECUARIA: 'Pecuária',
  ADMINISTRATIVA: 'Administrativa',
  MANUTENCAO: 'Manutenção',
}

const categoriaColors: Record<string, { bg: string; text: string }> = {
  AGRICOLA: { bg: 'bg-green-100', text: 'text-green-800' },
  PECUARIA: { bg: 'bg-amber-100', text: 'text-amber-800' },
  ADMINISTRATIVA: { bg: 'bg-blue-100', text: 'text-blue-800' },
  MANUTENCAO: { bg: 'bg-gray-100', text: 'text-gray-800' },
}

const filteredItems = computed(() => {
  let result = items.value
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter((i) => i.nome.toLowerCase().includes(term))
  }
  if (filterCategoria.value) {
    result = result.filter((i) => i.categoria === filterCategoria.value)
  }
  if (filterAtivo.value !== '') {
    const isAtivo = filterAtivo.value === 'true'
    result = result.filter((i) => i.ativo === isAtivo)
  }
  return result
})

const fetchItems = async () => {
  isLoading.value = true
  try {
    const result = await tipoAtividadeOSService.getAll(currentPage.value, pageSize)
    items.value = result.data.data
    totalPages.value = result.data.totalPages
    totalItems.value = result.data.total
  } catch {
    toast.error('Erro ao carregar tipos de atividade.')
  } finally {
    isLoading.value = false
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSave = async (payload: CreateTipoAtividadeOSPayload) => {
  const isEditing = !!editingItem.value
  isSaving.value = true

  try {
    if (isEditing) {
      await tipoAtividadeOSService.updateCompleto(editingItem.value!.id, payload)
    } else {
      await tipoAtividadeOSService.createCompleto(payload)
    }

    toast.success(
      isEditing
        ? 'Tipo de atividade atualizado com sucesso!'
        : 'Tipo de atividade criado com sucesso!'
    )
    isModalOpen.value = false
    fetchItems()
  } catch {
    toast.error('Erro ao salvar. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}

const handleEdit = (item: TipoAtividadeOS) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir este tipo de atividade?')) {
    try {
      await tipoAtividadeOSService.delete(id)
      toast.success('Tipo de atividade excluído com sucesso!')
      fetchItems()
    } catch {
      toast.error('Erro ao excluir. Tente novamente.')
    }
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

watch(currentPage, () => {
  fetchItems()
})

onMounted(() => {
  fetchItems()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <TipoAtividadeOSModal
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
          <h1 class="text-4xl font-bold text-gray-900">Tipos de Atividade OS</h1>
          <p class="text-gray-500 mt-1">
            Gerencie os tipos de atividade para ordens de serviço
          </p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Novo Tipo de Atividade
        </button>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <h2 class="text-lg font-bold text-gray-900 self-center">Lista de Tipos</h2>

          <div class="flex flex-col sm:flex-row gap-3">
            <!-- Busca por nome -->
            <div class="relative w-full sm:w-56">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search class="h-4 w-4 text-gray-400" />
              </div>
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Buscar por nome..."
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
            </div>

            <!-- Filtro categoria -->
            <select
              v-model="filterCategoria"
              class="w-full sm:w-44 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            >
              <option value="">Todas Categorias</option>
              <option
                v-for="cat in Object.values(CategoriaAtividadeOS)"
                :key="cat"
                :value="cat"
              >
                {{ categoriaLabels[cat] }}
              </option>
            </select>

            <!-- Filtro ativo -->
            <select
              v-model="filterAtivo"
              class="w-full sm:w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="p-8 text-center text-gray-500">
          <div
            class="w-8 h-8 border-4 border-lime-200 border-t-lime-600 rounded-full animate-spin mx-auto mb-3"
          ></div>
          Carregando...
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Nome
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Categoria
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Ícone
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Cor
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Campos
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Ativo
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
                v-for="item in filteredItems"
                :key="item.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ item.nome }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    class="px-2.5 py-1 text-xs font-medium rounded-full"
                    :class="[
                      categoriaColors[item.categoria]?.bg || 'bg-gray-100',
                      categoriaColors[item.categoria]?.text || 'text-gray-800',
                    ]"
                  >
                    {{ categoriaLabels[item.categoria] || item.categoria }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.icone || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div v-if="item.cor" class="flex items-center gap-2">
                    <span
                      class="inline-block w-6 h-6 rounded border border-gray-200"
                      :style="{ backgroundColor: item.cor }"
                    ></span>
                    <span class="text-gray-500 text-xs">{{ item.cor }}</span>
                  </div>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                  >
                    {{ item.camposCondicionais?.length || 0 }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    v-if="item.ativo"
                    class="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium"
                  >
                    Ativo
                  </span>
                  <span
                    v-else
                    class="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-medium"
                  >
                    Inativo
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
                      @click="handleDelete(item.id)"
                      class="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredItems.length === 0 && !isLoading">
                <td colspan="7" class="px-6 py-8 text-center text-gray-500 text-sm">
                  Nenhum tipo de atividade encontrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="px-6 py-4 border-t border-gray-100 flex items-center justify-between"
        >
          <span class="text-sm text-gray-500">
            Página {{ currentPage }} de {{ totalPages }} ({{ totalItems }} registros)
          </span>
          <div class="flex items-center gap-2">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage <= 1"
              class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft class="h-4 w-4" />
            </button>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
