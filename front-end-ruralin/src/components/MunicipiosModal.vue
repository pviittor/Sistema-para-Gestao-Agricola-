<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  X,
  FileText,
  MapPin,
  Save,
  Hash
} from 'lucide-vue-next'
import type { Municipio } from '../types/Municipio'
import type { Estado } from '../types/Estado'
import { estadoService } from '../services/estadoService'
import BaseAutocomplete from './BaseAutocomplete.vue'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  isOpen: boolean
  initialData?: Municipio | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const activeTab = ref('informacoes')
const estadosOptions = ref<{ value: number; label: string }[]>([])

const formData = ref<Partial<Municipio>>({
  nome: '',
  idEstado: undefined,
  codigoIBGE: undefined,
  ativo: true
})

const tabs = [
  { id: 'informacoes', label: 'Informações', icon: FileText },
]

const fetchEstados = async () => {
  try {
    const result = await estadoService.getAll(1, 100)
    estadosOptions.value = result.data.data.map((estado: Estado) => ({
      value: estado.id,
      label: `${estado.nome} (${estado.sigla})`
    }))
  } catch (error) {
    console.error('Erro ao buscar estados:', error)
    toast.error('Erro ao carregar lista de estados.')
  }
}

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      fetchEstados()
      if (props.initialData) {
        formData.value = { ...props.initialData }
      } else {
        // Reset to default
        formData.value = {
          nome: '',
          idEstado: undefined,
          codigoIBGE: undefined,
          ativo: true
        }
      }
      activeTab.value = 'informacoes'
    }
  }
)

const handleSave = () => {
  if (props.loading) return
  if (!formData.value.nome) {
    toast.warning('O nome é obrigatório.')
    return
  }
  if (!formData.value.idEstado) {
    toast.warning('O estado é obrigatório.')
    return
  }
  emit('save', formData.value)
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Município' : 'Novo Município' }}
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

          <!-- Section: Dados Principais -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <FileText class="w-5 h-5 text-gray-500" />
              Dados Principais
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">

              <!-- Nome -->
              <div class="md:col-span-12">
                <label class="block text-sm font-bold text-gray-700 mb-2">Nome <span class="text-red-500">*</span></label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.nome" type="text"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Nome do município">
                </div>
              </div>

              <!-- Estado -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Estado <span class="text-red-500">*</span></label>
                <div class="relative">
                  <BaseAutocomplete v-model="formData.idEstado" :options="estadosOptions"
                    placeholder="Selecione o estado..." class="w-full">
                    <template #prefix>
                      <MapPin class="h-4 w-4 text-gray-400" />
                    </template>
                  </BaseAutocomplete>
                </div>
              </div>

              <!-- Código IBGE -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Código IBGE</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.codigoIBGE" type="number"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Ex: 3550308">
                </div>
              </div>

              <!-- Ativo -->
              <div class="md:col-span-12 pt-2">
                 <div class="flex items-center gap-4">
                    <label class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all w-full sm:w-auto">
                      <input v-model="formData.ativo" type="checkbox"
                        class="h-5 w-5 rounded border-gray-300 text-lime-600 focus:ring-lime-500">
                      <span class="text-sm text-gray-700 font-medium">Cadastro Ativo</span>
                    </label>
                 </div>
              </div>

            </div>
          </section>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
        <button @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
          Cancelar
        </button>
        <button @click="handleSave"
          :disabled="props.loading"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-lime-600 border border-transparent rounded-lg hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
          <span v-if="props.loading" class="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          <Save v-else class="w-4 h-4 mr-2" />
          {{ props.loading ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>

    </div>
  </div>
</template>
