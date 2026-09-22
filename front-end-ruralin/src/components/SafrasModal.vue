<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  X,
  Save,
  Calendar,
  Sprout,
  Activity,
  FileText
} from 'lucide-vue-next'
import type { Safra } from '../types/Safra'
import { StatusSafra } from '../types/Safra'
import { culturaService } from '../services/culturaService'
import BaseAutocomplete from './BaseAutocomplete.vue'

const props = defineProps<{
  isOpen: boolean
  initialData?: Safra | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const activeTab = ref('informacoes')
const tabs = [
  { id: 'informacoes', label: 'Informações', icon: FileText },
]

const formData = ref<Safra>({
  culturaId: 0,
  nome: '',
  dataInicio: '',
  dataFim: null,
  status: StatusSafra.PLANEJADA
})

// Mock Culturas Options
// Culturas Options from Service
const culturasOptions = ref<{ value: number; label: string }[]>([])

const loadCulturas = async () => {
  try {
    const result = await culturaService.getAll(1, 100)
    if (result && result.data) {
        culturasOptions.value = result.data.map((c) => ({
            value: c.id ?? 0,
            label: c.descricao_clt
        }))
    }
  } catch (error) {
    console.error('Erro ao buscar culturas:', error)
  }
}

onMounted(() => {
  loadCulturas()
})

const statusOptions = [
  { value: StatusSafra.PLANEJADA, label: 'Planejada' },
  { value: StatusSafra.EM_ANDAMENTO, label: 'Em Andamento' },
  { value: StatusSafra.CONCLUIDA, label: 'Concluída' },
  { value: StatusSafra.CANCELADA, label: 'Cancelada' }
]

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.initialData) {
        // Clone object to avoid direct mutation
        formData.value = { ...props.initialData }
        
        // Ensure dates are formatted as YYYY-MM-DD for input type="date"
        if (formData.value.dataInicio) {
             const dateVal = new Date(formData.value.dataInicio)
             if (!isNaN(dateVal.getTime())) {
                 formData.value.dataInicio = dateVal?.toISOString().split('T')[0] || '1900-01-01'
             }
        }
        
        if (formData.value.dataFim) {
             const dateVal = new Date(formData.value.dataFim)
             if (!isNaN(dateVal.getTime())) {
                 formData.value.dataFim = dateVal?.toISOString().split('T')[0] || '1900-01-01'
             }
        }

      } else {
        // Reset to default
        formData.value = {
          culturaId: 0,
          nome: '',
          dataInicio: new Date()?.toISOString().split('T')[0] || '1900-01-01',
          dataFim: null,
          status: StatusSafra.PLANEJADA
        }
      }
      activeTab.value = 'informacoes'
    }
  }
)

const handleSave = () => {
  if (props.loading) return
  if (!formData.value.nome) {
    alert('O nome da safra é obrigatório.')
    return
  }
  if (!formData.value.culturaId) {
    alert('Selecione uma cultura.')
    return
  }
  if (!formData.value.dataInicio) {
    alert('A data de início é obrigatória.')
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
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Safra' : 'Nova Safra' }}
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
            
            <!-- Section: Identificação -->
            <section>
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <FileText class="w-5 h-5 text-gray-500" />
                Dados da Safra
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                <!-- Nome -->
                <div class="md:col-span-8">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Nome / Descrição <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <input
                      v-model="formData.nome"
                      type="text"
                      placeholder="Ex: Safra Soja 2023/2024"
                      class="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                    />
                  </div>
                </div>

                <!-- Cultura -->
                <div class="md:col-span-4">
                   <label class="block text-sm font-bold text-gray-700 mb-2">Cultura <span class="text-red-500">*</span></label>
                   <div class="relative">
                     <BaseAutocomplete
                       v-model="formData.culturaId"
                       :options="culturasOptions"
                       placeholder="Selecione uma cultura"
                     >
                        <template #prefix>
                             <Sprout class="h-4 w-4 text-gray-400" />
                        </template>
                     </BaseAutocomplete>
                   </div>
                </div>

                <!-- Data Início -->
                <div class="md:col-span-3">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Data Início <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar class="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      v-model="formData.dataInicio"
                      type="date"
                      class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <!-- Data Fim -->
                <div class="md:col-span-3">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Data Fim</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar class="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      v-model="formData.dataFim"
                      type="date"
                      class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <!-- Status -->
                <div class="md:col-span-6">
                   <label class="block text-sm font-bold text-gray-700 mb-2">Status <span class="text-red-500">*</span></label>
                   <div class="relative">
                     <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Activity class="h-4 w-4 text-gray-400" />
                     </div>
                     <select
                       v-model="formData.status"
                       class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent appearance-none bg-white transition-all"
                     >
                       <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                         {{ option.label }}
                       </option>
                     </select>
                   </div>
                </div>
              </div>
            </section>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="handleSave"
          :disabled="props.loading"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-lime-600 border border-transparent rounded-lg hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="props.loading" class="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          <Save v-else class="w-4 h-4 mr-2" />
          {{ props.loading ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>

    </div>
  </div>
</template>
