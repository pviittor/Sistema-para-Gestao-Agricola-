<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  X,
  FileText,
  Save,
  Package
} from 'lucide-vue-next'
import type { Cultura } from '../types/Cultura'
import BaseAutocomplete from './BaseAutocomplete.vue'
import { produtoService } from '../services/produtoService'

const props = defineProps<{
  isOpen: boolean
  initialData?: Cultura | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const activeTab = ref('informacoes')

const formData = ref<Cultura>({
  descricao_clt: '',
  idProduto: 0
})

// Mock de produtos para o autocomplete
const produtosOptions = ref<{ value: number; label: string }[]>([])

const fetchProdutos = async () => {
  try {
    const response = await produtoService.getAll(1, 1000)
    produtosOptions.value = response.data.map((produto) => ({
      value: produto.id_prod!,
      label: produto.descricao_prod
    }))
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
  }
}

onMounted(() => {
  fetchProdutos()
})

const tabs = [
  { id: 'informacoes', label: 'Informações', icon: FileText },
]

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.initialData) {
        formData.value = { ...props.initialData }
      } else {
        // Reset to default
        formData.value = {
          descricao_clt: '',
          idProduto: 0
        }
      }
      activeTab.value = 'informacoes'
    }
  }
)

const handleSave = () => {
  if (props.loading) return

  if (!formData.value.descricao_clt) {
    alert('A descrição é obrigatória.')
    return
  }
  if (!formData.value.idProduto) {
    alert('Selecione um produto relacionado.')
    return
  }
  emit('save', formData.value)
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Cultura' : 'Nova Cultura' }}
        </h2>
        <button @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-100 px-6 overflow-x-auto">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none flex items-center gap-2 whitespace-nowrap"
          :class="activeTab === tab.id ? 'border-lime-600 text-lime-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar">
        <div v-show="activeTab === 'informacoes'" class="space-y-8">

          <!-- Section: Dados da Cultura -->
          <section>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              <!-- Descrição -->
              <div class="md:col-span-12">
                <label class="block text-sm font-bold text-gray-700 mb-2">Descrição da Cultura</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.descricao_clt" type="text"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Ex: Soja Safra 23/24">
                </div>
              </div>

              <!-- Produto Relacionado -->
              <div class="md:col-span-12">
                <label class="block text-sm font-bold text-gray-700 mb-2">Produto Relacionado</label>
                <div class="flex gap-2">
                  <BaseAutocomplete v-model="formData.idProduto" :options="produtosOptions"
                    placeholder="Selecione o produto base..." class="w-full">
                    <template #prefix>
                      <Package class="h-4 w-4 text-gray-400" />
                    </template>
                  </BaseAutocomplete>
                </div>
                <p class="mt-1 text-xs text-gray-500">O produto base define as características físico-químicas desta cultura.</p>
              </div>

            </div>
          </section>

        </div>
      </div>

       <!-- Footer -->
       <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <button @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors">
          Cancelar
        </button>
        <button @click="handleSave"
          :disabled="props.loading"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <span v-if="props.loading" class="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          <Save v-else class="h-4 w-4 mr-2" />
          {{ props.loading ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>

    </div>
  </div>
</template>
