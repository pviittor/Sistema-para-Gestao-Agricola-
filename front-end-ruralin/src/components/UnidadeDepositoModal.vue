<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { X, Save, Warehouse, Package, Ruler, Hash } from 'lucide-vue-next'
import type { UnidadeDeposito } from '../types/UnidadeDeposito'
import type { UnidadeMedida } from '../types/UnidadeMedida'
import type { Produto } from '../types/Produto'
import BaseAutocomplete from './BaseAutocomplete.vue'
import { unidadeMedidaService } from '../services/unidadeMedidaService'
import { produtoService } from '../services/produtoService'

const props = defineProps<{
  isOpen: boolean
  initialData?: UnidadeDeposito | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const tipoOptions = [
  { value: 'Silo', label: 'Silo' },
  { value: 'Bag', label: 'Bag' },
  { value: 'Armazem', label: 'Armazém' },
  { value: 'Outros', label: 'Outros' },
]

const defaultForm = (): Partial<UnidadeDeposito> => ({
  descricao: '',
  tipo: 'Silo',
  capacidade_total: 0,
  idUnidadeMedida: undefined,
  idProduto: undefined,
  saldo_inicial: 0,
  ativo: true,
})

const formData = ref<Partial<UnidadeDeposito>>(defaultForm())

// Opções para autocompletes
const unidadesOptions = ref<{ value: number; label: string }[]>([])
const produtosOptions = ref<{ value: number; label: string }[]>([])

// É um novo registro?
const isNew = computed(() => !props.initialData?.id)

const loadOptions = async () => {
  try {
    const [unidades, produtos] = await Promise.all([
      unidadeMedidaService.getAllNoPagination(),
      produtoService.getAll(1, 1000),
    ])

    const unidadesData = Array.isArray(unidades) ? unidades : (unidades as any).data ?? []
    unidadesOptions.value = (unidadesData as UnidadeMedida[]).map(
      (u: UnidadeMedida) => ({
        value: u.id_unidade!,
        label: `${u.descricao_unidade} (${u.abreviatura_unidade})`,
      }),
    )

    produtosOptions.value = (produtos.data ?? []).map((p: Produto) => ({
      value: p.id_prod!,
      label: p.descricao_prod,
    }))
  } catch (error) {
    console.error('Erro ao carregar opções:', error)
  }
}

onMounted(() => {
  loadOptions()
})

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      formData.value = props.initialData ? { ...props.initialData } : defaultForm()
    }
  },
)

const handleSave = () => {
  if (props.loading) return

  if (!formData.value.descricao?.trim()) {
    alert('A descrição é obrigatória.')
    return
  }
  if (!formData.value.tipo) {
    alert('O tipo é obrigatório.')
    return
  }
  if (formData.value.capacidade_total == null || formData.value.capacidade_total < 0) {
    alert('A capacidade total deve ser maior ou igual a zero.')
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
    <div
      class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData?.id ? 'Editar Unidade de Depósito' : 'Nova Unidade de Depósito' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar space-y-8">
        <!-- Section: Informações Principais -->
        <section>
          <h3
            class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2"
          >
            <Warehouse class="w-4 h-4 text-gray-500" />
            Informações Principais
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
            <!-- Descrição -->
            <div class="md:col-span-8">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Descrição <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Warehouse class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="formData.descricao"
                  type="text"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="Nome da unidade de depósito"
                />
              </div>
            </div>

            <!-- Tipo -->
            <div class="md:col-span-4">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Tipo <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.tipo"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all bg-white"
              >
                <option v-for="opt in tipoOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Capacidade Total -->
            <div class="md:col-span-4">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Capacidade Total <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="formData.capacidade_total"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                />
              </div>
            </div>

            <!-- Unidade de Medida -->
            <div class="md:col-span-4">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Unidade de Medida</label>
              <BaseAutocomplete
                v-model="formData.idUnidadeMedida"
                :options="unidadesOptions"
                placeholder="Selecione..."
                class="w-full"
              >
                <template #prefix>
                  <Ruler class="h-4 w-4 text-gray-400" />
                </template>
              </BaseAutocomplete>
            </div>

            <!-- Produto -->
            <div class="md:col-span-4">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Produto</label>
              <BaseAutocomplete
                v-model="formData.idProduto"
                :options="produtosOptions"
                placeholder="Selecione..."
                class="w-full"
              >
                <template #prefix>
                  <Package class="h-4 w-4 text-gray-400" />
                </template>
              </BaseAutocomplete>
            </div>

            <!-- Saldo Inicial (apenas para novos registros) -->
            <div v-if="isNew" class="md:col-span-4">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Saldo Inicial</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="formData.saldo_inicial"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                />
              </div>
            </div>

            <!-- Ativo -->
            <div class="md:col-span-4 flex items-end">
              <label class="flex items-center gap-3 cursor-pointer">
                <div class="relative">
                  <input
                    v-model="formData.ativo"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div
                    class="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-lime-600 transition-colors"
                  ></div>
                  <div
                    class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"
                  ></div>
                </div>
                <span class="text-sm font-bold text-gray-700">Ativo</span>
              </label>
            </div>
          </div>
        </section>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
        <button
          @click="$emit('close')"
          class="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="handleSave"
          :disabled="props.loading"
          class="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
