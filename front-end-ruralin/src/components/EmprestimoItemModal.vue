<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { X, Package, Hash, DollarSign, Save } from 'lucide-vue-next'
import { toast } from 'vue3-toastify'
import type { EmprestimoItem } from '../types/EmprestimoItem'
import type { Produto } from '../types/Produto'
import { produtoService } from '../services/produtoService'
import BaseAutocomplete from './BaseAutocomplete.vue'

const props = defineProps<{
  isOpen: boolean
  initialData?: EmprestimoItem | null
  loading?: boolean
  emprestimoId: number
}>()

const emit = defineEmits(['close', 'save'])

// --- Form state ---
const defaultForm = (): Partial<EmprestimoItem> => ({
  emprestimoId: props.emprestimoId,
  produtoId: 0,
  quantidade_empi: 0,
  unitario_empi: 0,
})

const formData = ref<Partial<EmprestimoItem>>(defaultForm())

// --- Produto autocomplete ---
const produtosOptions = ref<{ value: number; label: string }[]>([])
const isLoadingProdutos = ref(false)

const fetchProdutos = async () => {
  isLoadingProdutos.value = true
  try {
    const result = await produtoService.getAll(1, 1000)
    produtosOptions.value = result.data.map((p: Produto) => ({
      value: p.id_prod!,
      label: p.descricao_prod,
    }))
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    toast.error('Erro ao carregar produtos.')
  } finally {
    isLoadingProdutos.value = false
  }
}

// --- Computed ---
const totalPreview = computed(() =>
  (formData.value.quantidade_empi ?? 0) * (formData.value.unitario_empi ?? 0),
)

const isEditing = computed(() => !!props.initialData?.id)

// --- Watchers ---
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.initialData) {
        formData.value = { ...props.initialData }
      } else {
        formData.value = defaultForm()
      }
    }
  },
)

onMounted(() => {
  fetchProdutos()
})

// --- Submit ---
const handleSave = () => {
  if (props.loading) return

  if (!formData.value.produtoId || formData.value.produtoId === 0) {
    toast.warning('Selecione um produto.')
    return
  }
  if (!formData.value.quantidade_empi || formData.value.quantidade_empi <= 0) {
    toast.warning('Informe uma quantidade maior que zero.')
    return
  }
  if (formData.value.unitario_empi === undefined || formData.value.unitario_empi < 0) {
    toast.warning('Informe um valor unitário válido.')
    return
  }

  emit('save', {
    ...formData.value,
    emprestimoId: props.emprestimoId,
    total_empi: totalPreview.value,
  })
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div
      class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-lg font-bold text-gray-900">
          {{ isEditing ? 'Editar Item' : 'Novo Item' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-5 overflow-y-auto">

        <!-- Produto -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">
            Produto <span class="text-red-500">*</span>
          </label>
          <BaseAutocomplete
            v-model="formData.produtoId"
            :options="produtosOptions"
            placeholder="Selecione o produto..."
            class="w-full"
          >
            <template #prefix>
              <Package class="h-4 w-4 text-gray-400" />
            </template>
          </BaseAutocomplete>
          <p v-if="isLoadingProdutos" class="text-xs text-gray-400 mt-1">
            Carregando produtos...
          </p>
        </div>

        <!-- Quantidade e Unitário lado a lado -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">
              Quantidade <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash class="h-4 w-4 text-gray-400" />
              </div>
              <input
                v-model.number="formData.quantidade_empi"
                type="number"
                min="0.001"
                step="0.001"
                class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                placeholder="0,000"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">
              Valor Unitário (R$) <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign class="h-4 w-4 text-gray-400" />
              </div>
              <input
                v-model.number="formData.unitario_empi"
                type="number"
                min="0"
                step="0.01"
                class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                placeholder="0,00"
              />
            </div>
          </div>
        </div>

        <!-- Total preview (readonly) -->
        <div class="flex items-center justify-between rounded-lg bg-lime-50 border border-lime-100 px-4 py-3">
          <span class="text-sm font-medium text-lime-700">Total calculado</span>
          <span class="text-lg font-bold text-lime-700">
            {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPreview) }}
          </span>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
        <button
          @click="$emit('close')"
          class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="handleSave"
          :disabled="props.loading"
          class="inline-flex items-center bg-lime-600 hover:bg-lime-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span
            v-if="props.loading"
            class="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"
          ></span>
          <Save v-else class="w-4 h-4 mr-2" />
          {{ props.loading ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </div>
  </div>
</template>
