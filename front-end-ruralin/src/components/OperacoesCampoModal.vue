<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X, FileText, Settings, Hash, DollarSign, Save } from 'lucide-vue-next'
import type { OperacaoCampo } from '@/types/OperacaoCampo'
import { OPERACAO_CAMPO_LABELS } from '@/types/OperacaoCampo'

const props = defineProps<{
  isOpen: boolean
  initialData?: OperacaoCampo | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const activeTab = ref('dados')

const formData = ref<OperacaoCampo>({
  descricao: '',
  tipo: 0,
  financeiro: false
})

const tabs = [
  { id: 'dados', label: 'Dados', icon: FileText },
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
          descricao: '',
          tipo: 0,
          financeiro: false
        }
      }
      activeTab.value = 'dados'
    }
  }
)

const handleSave = () => {
  if (props.loading) return
  if (!formData.value.descricao) {
    alert('A descrição é obrigatória.')
    return
  }
  emit('save', formData.value)
}

const tipoOptions = Object.entries(OPERACAO_CAMPO_LABELS).map(([key, value]) => ({
  value: Number(key),
  label: value
}))
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Operação de Campo' : 'Nova Operação de Campo' }}
        </h2>
        <button @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-100 px-6">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none flex items-center gap-2"
          :class="activeTab === tab.id ? 'border-lime-600 text-lime-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar">
        <div v-show="activeTab === 'dados'" class="space-y-8">
          
          <!-- Section: Identificação -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <Hash class="w-5 h-5 text-gray-500" />
              Identificação
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
              <!-- Descrição -->
              <div class="md:col-span-12">
                <label class="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.descricao" type="text"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Descrição da operação">
                </div>
              </div>
            </div>
          </section>

          <!-- Section: Detalhes -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <Settings class="w-5 h-5 text-gray-500" />
              Detalhes
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
              <!-- Tipo -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Tipo</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Settings class="h-4 w-4 text-gray-400" />
                  </div>
                  <select v-model="formData.tipo"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all appearance-none bg-white">
                    <option v-for="option in tipoOptions" :key="option.value" :value="option.value">
                      {{ option.value }} - {{ option.label }}
                    </option>
                  </select>
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Financeiro? -->
              <div class="md:col-span-6 flex items-end">
                 <label class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all w-full">
                    <input v-model="formData.financeiro" type="checkbox"
                      class="h-5 w-5 rounded border-gray-300 text-lime-600 focus:ring-lime-500">
                    <span class="text-sm text-gray-700 font-medium flex items-center gap-2">
                      <DollarSign class="h-4 w-4 text-gray-500" />
                      Financeiro?
                    </span>
                  </label>
              </div>
            </div>
          </section>

        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
        <button @click="$emit('close')"
          class="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
          Cancelar
        </button>
        <button @click="handleSave"
          :disabled="props.loading"
          class="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
          <span v-if="props.loading" class="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
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
