<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  X,
  Save,
  Hash,
  FileText,
  Layers,
  Type,
  Tag
} from 'lucide-vue-next'
import type { PlanoContaGerencial } from '@/types/PlanoContaGerencial'


const props = defineProps<{
  isOpen: boolean
  initialData?: PlanoContaGerencial | null
  hasChildren?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: PlanoContaGerencial): void
}>()

const activeTab = ref('informacoes')

const tabs = [
  { id: 'informacoes', label: 'Informações', icon: FileText },
]

const formData = ref<PlanoContaGerencial>({
  item: '',
  descricao: '',
  tipo: 'SINTETICA',
  classificacao: '',
  contaPaiId: null,
  nivel: 1,
  ativo: true
})

const errors = ref<Partial<Record<keyof PlanoContaGerencial, string>>>({})

const tipoOptions = [
  { value: 'SINTETICA', label: 'Sintética' },
  { value: 'ANALITICA', label: 'Analítica' }
]

const nivelOptions = [
  { value: 1, label: 'Nível 1' },
  { value: 2, label: 'Nível 2' },
  { value: 3, label: 'Nível 3' },
  { value: 4, label: 'Nível 4' }
]

const isEditing = computed(() => !!props.initialData)



watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    if (props.initialData) {
      formData.value = { ...props.initialData }
    } else {
      resetForm()
    }
    errors.value = {}
    activeTab.value = 'informacoes'
  }
})

const resetForm = () => {
  formData.value = {
    item: '',
    descricao: '',
    tipo: 'SINTETICA',
    classificacao: '',
    contaPaiId: null,
    nivel: 1,
    ativo: true
  }
}

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  if (!formData.value.item?.trim()) {
    errors.value.item = 'Item (Código) é obrigatório'
    isValid = false
  }

  if (!formData.value.descricao?.trim()) {
    errors.value.descricao = 'Descrição é obrigatória'
    isValid = false
  }

  return isValid
}

const handleSubmit = () => {
  if (props.loading) return
  if (validateForm()) {
    emit('save', formData.value)
  }
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
          {{ isEditing ? 'Editar Conta Gerencial' : 'Nova Conta Gerencial' }}
        </h2>
        <button @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-100 px-6 overflow-x-auto bg-white">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none flex items-center gap-2 whitespace-nowrap"
          :class="activeTab === tab.id ? 'border-lime-600 text-lime-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto flex-1 custom-scrollbar bg-white">
        <form @submit.prevent="handleSubmit" class="h-full flex flex-col">

          <div v-show="activeTab === 'informacoes'" class="space-y-8">
            
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
                    <input v-model="formData.descricao" type="text" placeholder="Nome da conta"
                      class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                      :class="{ 'border-red-300': errors.descricao }" />
                  </div>
                  <p v-if="errors.descricao" class="mt-1 text-xs text-red-600">{{ errors.descricao }}</p>
                </div>

                <!-- Tipo -->
                <div class="md:col-span-4">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Tipo</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Type class="h-4 w-4 text-gray-400" />
                    </div>
                    <select v-model="formData.tipo"
                      class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all appearance-none bg-white">
                      <option v-for="opt in tipoOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Nível -->
                <div class="md:col-span-4">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Nível</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Layers class="h-4 w-4 text-gray-400" />
                    </div>
                    <select v-model="formData.nivel" disabled
                      class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all appearance-none bg-gray-100 cursor-not-allowed text-gray-500">
                      <option v-for="opt in nivelOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Classificação -->
                <div class="md:col-span-4">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Classificação</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Tag class="h-4 w-4 text-gray-400" />
                    </div>
                    <input v-model="formData.classificacao" type="text" placeholder="Opcional"
                      class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400">
                  </div>
                </div>

                <!-- Ativo -->
                <div class="md:col-span-12 pt-2">
                  <label
                    class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all w-fit">
                    <input type="checkbox" v-model="formData.ativo"
                      class="h-5 w-5 rounded border-gray-300 text-lime-600 focus:ring-lime-500">
                    <span class="text-sm text-gray-700 font-medium">Ativo</span>
                  </label>
                </div>

              </div>
            </section>
          </div>

        </form>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
        <button @click="$emit('close')"
          class="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
          Cancelar
        </button>
        <button @click="handleSubmit" :disabled="props.loading"
          class="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          <span v-if="props.loading" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          <Save v-else class="w-4 h-4" />
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
