<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Search, Package, Pencil, Trash2 } from 'lucide-vue-next'
import ProdutosModal from '@/components/ProdutosModal.vue'
import type { Produto } from '@/types/Produto'
import { produtoService } from '@/services/produtoService'
import type { GrupoProduto } from '@/types/GrupoProduto'
import type { UnidadeMedida } from '@/types/UnidadeMedida'
import { grupoProdutoService } from '@/services/grupoProdutoService'
import { unidadeMedidaService } from '@/services/unidadeMedidaService'

// State
const isModalOpen = ref(false)
const editingItem = ref<Produto | null>(null)
const items = ref<Produto[]>([])
const grupos = ref<GrupoProduto[]>([])
const unidades = ref<UnidadeMedida[]>([])
const searchTerm = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

const filteredItems = computed(() => {
  if (!searchTerm.value) return items.value
  const term = searchTerm.value.toLowerCase()
  return items.value.filter(item => 
    item.unidadeMedidaDescricao?.toLowerCase().includes(term) ||
    item.descricao_prod.toLowerCase().includes(term) ||
    item.grupoDescricao?.toLowerCase().includes(term)
  )
})

const fetchItems = async () => {
  isLoading.value = true
  try {
    Promise.all([
      produtoService.getAll(1, 100),
      grupoProdutoService.getAll(1, 100),
      unidadeMedidaService.getAll(1, 100)
    ]).then(([prodRes, grupoRes, unidadeRes]) => {
      items.value = prodRes.data
      grupos.value = grupoRes.data
      unidades.value = unidadeRes.data
    }).catch((error) => {
      toast.error('Erro ao carregar produtos')
    })
  } catch (error) {
    toast.error('Erro ao carregar produtos')
  } finally {
    isLoading.value = false
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleEdit = (item: Produto) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    try {
      await produtoService.delete(id)
      items.value = items.value.filter(i => i.id_prod !== id)
      toast.success('Produto excluído com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao excluir produto.')
    }
  }
}

const handleSave = async (data: Produto) => {
  isSaving.value = true
  try {
    if (editingItem.value?.id_prod) {
      // Edit
      await produtoService.update(editingItem.value.id_prod, data)
      toast.success('Produto atualizado com sucesso!')
    } else {
      // New
      await produtoService.create(data)
      toast.success('Produto criado com sucesso!')
    }
    isModalOpen.value = false
    await fetchItems()
  } catch (error) {
    console.error(error)
    toast.error('Erro ao salvar produto.')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchItems()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <ProdutosModal
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
          <h1 class="text-4xl font-bold text-gray-900">Produtos</h1>
          <p class="text-gray-500 mt-1">Gerencie seu catálogo de produtos e insumos</p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Novo Produto
        </button>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-bold text-gray-900">Lista de Produtos</h2>
            <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{{ items.length }} itens</span>
          </div>

          <div class="relative w-full sm:w-64">
             <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search class="h-4 w-4 text-gray-400" />
              </div>
            <input
                v-model="searchTerm"
                type="text"
                placeholder="Buscar produto..."
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Descrição</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Grupo</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Und.</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Preço Médio</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in filteredItems" :key="item.id_prod" class="hover:bg-gray-50 transition-colors group">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-lg bg-lime-100 flex items-center justify-center text-lime-600">
                        <Package class="h-5 w-5" />
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-900">{{ item.descricao_prod }}</div>
                        <div class="text-xs text-gray-400" v-if="item.observacao_prod">{{ item.observacao_prod }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {{ grupos.find(g => g.id === item.idGrupo)?.descricao_grupo || '-' }}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ unidades.find(u => u.id_unidade === item.idUnidadeMedida)?.abreviatura_unidade || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    R$ {{ item.precomedio_prod?.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="handleEdit(item)" class="p-1 text-gray-400 hover:text-lime-600 transition-colors">
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button @click="handleDelete(item.id_prod!)" class="p-1 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredItems.length === 0">
                  <td colspan="5" class="px-6 py-8 text-center text-gray-500 text-sm">
                      Nenhum produto encontrado.
                  </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>