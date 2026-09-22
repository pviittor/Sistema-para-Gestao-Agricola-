<script setup lang="ts">
import { ref } from 'vue'
import { watch } from 'vue'
import { X } from 'lucide-vue-next'
import { FileText } from 'lucide-vue-next'
import { DollarSign } from 'lucide-vue-next'
import { Save } from 'lucide-vue-next'
import type { ServicoAgricola } from '../types/ServicoAgricola'

const props = defineProps<{
  isOpen: boolean
  initialData?: ServicoAgricola | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const formData = ref<Partial<ServicoAgricola>>({})

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.initialData) {
        formData.value = { ...props.initialData }
      } else {
        // Reset to default
        formData.value = {
          financeiro_srv: false
        }
      }
    }
  }
)

const handleSave = () => {
  if (props.loading) return
  if (!formData.value.descricao_srv) {
    alert('A descrição é obrigatória.')
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
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Serviço' : 'Novo Serviço' }}
        </h2>
        <button @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
          <X class="h-6 w-6" />
        </button>
      </div>
      <!-- Body -->
      <div class="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar">
        <div class="space-y-6">
          <!-- Descrição -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText class="h-4 w-4 text-gray-400" />
              </div>
              <input v-model="formData.descricao_srv" type="text"
                class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                placeholder="Nome do serviço">
            </div>
          </div>
          <!-- Financeiro -->
          <div>
            <label
              class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all">
              <input v-model="formData.financeiro_srv" type="checkbox"
                class="h-5 w-5 rounded border-gray-300 text-lime-600 focus:ring-lime-500">
              <div class="flex items-center gap-2">
                <DollarSign class="h-4 w-4 text-gray-500" />
                <span class="text-sm text-gray-700 font-medium">Movimenta Financeiro</span>
              </div>
            </label>
          </div>
          <!-- Observações -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Observações</label>
            <textarea v-model="formData.observacao_srv" rows="3"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none placeholder-gray-400"
              placeholder="Insira observações adicionais aqui..."></textarea>
          </div>
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
