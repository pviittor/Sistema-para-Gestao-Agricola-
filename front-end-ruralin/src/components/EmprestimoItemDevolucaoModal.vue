<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { X, Calendar, Hash, Package, Save, RotateCcw } from 'lucide-vue-next'
import { toast } from 'vue3-toastify'
import type { EmprestimoItem } from '../types/EmprestimoItem'
import type { EmprestimoItemDevolucao } from '../types/EmprestimoItemDevolucao'
import type { Produto } from '../types/Produto'
import { produtoService } from '../services/produtoService'
import BaseAutocomplete from './BaseAutocomplete.vue'

const props = defineProps<{
  isOpen: boolean
  initialData?: EmprestimoItemDevolucao | null
  loading?: boolean
  item: EmprestimoItem | null
  devolucoes?: EmprestimoItemDevolucao[]
}>()

const emit = defineEmits(['close', 'save'])

// --- Form state ---
const defaultForm = (): Partial<EmprestimoItemDevolucao> => ({
  itemDevolucaoId: props.item?.id ?? 0,
  produtoDevolucaoId: props.item?.produtoId ?? 0,
  produtoSimilarId: null,
  datadevolucao_empdev: new Date().toISOString().substring(0, 10),
  quantidadedevolvida_empdev: 0,
  devolucaoGeraFinanceiro_empdev: false,
  devolucaoProdutoSimilar_empdev: false,
})

const formData = ref<Partial<EmprestimoItemDevolucao>>(defaultForm())

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
const isEditing = computed(() => !!props.initialData?.id)

const quantidadeJaDevolvida = computed(() => {
  const devs = props.devolucoes ?? []
  const editingId = props.initialData?.id
  return devs
    .filter((d) => d.id !== editingId)
    .reduce((sum, d) => sum + (d.quantidadedevolvida_empdev ?? 0), 0)
})

const quantidadeRestante = computed(() => {
  if (!props.item) return 0
  return Math.max(0, props.item.quantidade_empi - quantidadeJaDevolvida.value)
})

const produtoPrincipalLabel = computed(() => {
  if (!props.item) return '-'
  return (
    props.item.produto?.descricao_prod ||
    produtosOptions.value.find((o) => o.value === props.item!.produtoId)?.label ||
    `Produto #${props.item.produtoId}`
  )
})

// --- Watchers ---
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.initialData) {
        formData.value = { ...props.initialData }
      } else {
        formData.value = {
          itemDevolucaoId: props.item?.id ?? 0,
          produtoDevolucaoId: props.item?.produtoId ?? 0,
          produtoSimilarId: null,
          datadevolucao_empdev: new Date().toISOString().substring(0, 10),
          quantidadedevolvida_empdev: 0,
          devolucaoGeraFinanceiro_empdev: false,
          devolucaoProdutoSimilar_empdev: false,
        }
      }
    }
  },
)

// When similar flag is unchecked, clear the similarId
watch(
  () => formData.value.devolucaoProdutoSimilar_empdev,
  (val) => {
    if (!val) {
      formData.value.produtoSimilarId = null
    }
  },
)

onMounted(() => {
  fetchProdutos()
})

// --- Submit ---
const handleSave = () => {
  if (props.loading) return

  if (!formData.value.datadevolucao_empdev) {
    toast.warning('Informe a data da devolução.')
    return
  }
  if (!formData.value.quantidadedevolvida_empdev || formData.value.quantidadedevolvida_empdev <= 0) {
    toast.warning('Informe uma quantidade devolvida maior que zero.')
    return
  }
  if (formData.value.quantidadedevolvida_empdev > quantidadeRestante.value) {
    toast.warning(
      `A quantidade devolvida não pode ser maior que a quantidade pendente (${quantidadeRestante.value}).`,
    )
    return
  }
  if (
    formData.value.devolucaoProdutoSimilar_empdev &&
    (!formData.value.produtoSimilarId || formData.value.produtoSimilarId === 0)
  ) {
    toast.warning('Selecione o produto similar para a devolução.')
    return
  }

  emit('save', {
    ...formData.value,
    itemDevolucaoId: props.item?.id ?? formData.value.itemDevolucaoId,
    produtoDevolucaoId: props.item?.produtoId ?? formData.value.produtoDevolucaoId,
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
        <div class="flex items-center gap-2">
          <RotateCcw class="h-5 w-5 text-blue-600" />
          <h2 class="text-lg font-bold text-gray-900">
            {{ isEditing ? 'Editar Devolução' : 'Registrar Devolução' }}
          </h2>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-5 overflow-y-auto">

        <!-- Informações do item original (readonly) -->
        <div class="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 space-y-1">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500 font-medium">Produto emprestado</span>
            <span class="font-semibold text-gray-800">{{ produtoPrincipalLabel }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500 font-medium">Quantidade emprestada</span>
            <span class="font-semibold text-gray-800">{{ item?.quantidade_empi ?? 0 }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500 font-medium">Já devolvido</span>
            <span class="font-semibold text-gray-800">{{ quantidadeJaDevolvida }}</span>
          </div>
          <div class="flex items-center justify-between text-sm border-t border-gray-200 pt-1 mt-1">
            <span class="text-gray-700 font-semibold">Quantidade pendente</span>
            <span
              class="text-base font-bold"
              :class="quantidadeRestante <= 0 ? 'text-green-600' : 'text-orange-600'"
            >
              {{ quantidadeRestante }}
            </span>
          </div>
        </div>

        <!-- Alerta quando já devolvido tudo -->
        <div
          v-if="quantidadeRestante <= 0 && !isEditing"
          class="rounded-lg bg-green-50 border border-green-200 px-4 py-3"
        >
          <p class="text-sm text-green-700 font-medium">
            Toda a quantidade deste item já foi devolvida.
          </p>
        </div>

        <!-- Data da devolução -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">
            Data da devolução <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar class="h-4 w-4 text-gray-400" />
            </div>
            <input
              v-model="formData.datadevolucao_empdev"
              type="date"
              class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <!-- Quantidade devolvida -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">
            Quantidade devolvida <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Hash class="h-4 w-4 text-gray-400" />
            </div>
            <input
              v-model.number="formData.quantidadedevolvida_empdev"
              type="number"
              min="0.001"
              :max="quantidadeRestante"
              step="0.001"
              class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
              placeholder="0,000"
            />
          </div>
          <p class="text-xs text-gray-400 mt-1">
            Máximo permitido: {{ quantidadeRestante }}
          </p>
        </div>

        <!-- Checkboxes -->
        <div class="space-y-3">
          <label
            class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all"
          >
            <input
              v-model="formData.devolucaoProdutoSimilar_empdev"
              type="checkbox"
              class="h-5 w-5 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
            />
            <div>
              <span class="text-sm text-gray-700 font-medium">Devolução com produto similar</span>
              <p class="text-xs text-gray-400">Marque se o produto devolvido é diferente do emprestado</p>
            </div>
          </label>

          <label
            class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all"
          >
            <input
              v-model="formData.devolucaoGeraFinanceiro_empdev"
              type="checkbox"
              class="h-5 w-5 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
            />
            <div>
              <span class="text-sm text-gray-700 font-medium">Gera título financeiro</span>
              <p class="text-xs text-gray-400">Marque para criar um lançamento financeiro para esta devolução</p>
            </div>
          </label>
        </div>

        <!-- Produto similar (condicional) -->
        <div
          v-if="formData.devolucaoProdutoSimilar_empdev"
          class="animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <label class="block text-sm font-bold text-gray-700 mb-2">
            Produto similar <span class="text-red-500">*</span>
          </label>
          <BaseAutocomplete
            v-model="formData.produtoSimilarId"
            :options="produtosOptions"
            placeholder="Selecione o produto similar..."
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
          :disabled="props.loading || (quantidadeRestante <= 0 && !isEditing)"
          class="inline-flex items-center bg-lime-600 hover:bg-lime-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span
            v-if="props.loading"
            class="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"
          ></span>
          <Save v-else class="w-4 h-4 mr-2" />
          {{ props.loading ? 'Salvando...' : 'Registrar devolução' }}
        </button>
      </div>
    </div>
  </div>
</template>
