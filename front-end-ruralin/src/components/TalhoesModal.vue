<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  X,
  FileText,
  MapPin,
  Save,
  Hash,
  Ruler,
  Loader2,
  Map as MapIcon,
  FolderOpen,
  Satellite
} from 'lucide-vue-next'
import type { Talhao } from '../types/Talhao'
import type { Propriedade } from '../types/Propriedade'
import { propriedadeService } from '../services/propriedadeService'
import { toast } from 'vue3-toastify'
import MapboxFieldEditor from './MapboxFieldEditor.vue'
import NdviPanel from './NdviPanel.vue'

const props = defineProps<{
  isOpen: boolean
  initialData?: Talhao | null
  loading?: boolean
  existingFields?: Talhao[]
}>()

const emit = defineEmits(['close', 'save'])

const activeTab = ref('informacoes')

const formData = ref<Talhao>({
  descricao: '',
  idFazenda: 0,
  area: 0,
  geometry: null,
  grupo: null
})

const fazendasOptions = ref<{ value: number; label: string }[]>([])
const isLoadingFazendas = ref(false)

const fetchFazendas = async () => {
  isLoadingFazendas.value = true
  try {
    const result = await propriedadeService.getAllNoPagination()
    if (result.success && result.data) {
        fazendasOptions.value = result.data
        .map((p: Propriedade) => ({
            value: p.id || 0,
            label: p.descricao
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    }
  } catch (error) {
    console.error('Erro ao buscar fazendas:', error)
    toast.error('Erro ao carregar fazendas.')
  }
}

const tabs = [
  { id: 'informacoes', label: 'Informações', icon: FileText },
  { id: 'mapa', label: 'Mapa', icon: MapIcon },
  { id: 'ndvi', label: 'Satélite / NDVI', icon: Satellite },
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
          idFazenda: 0,
          area: 0,
          geometry: null,
          grupo: null
        }
      }
      activeTab.value = 'informacoes'
    }
  }
)

onMounted(() => {
  fetchFazendas()
})

const handleGeometryUpdate = (geometry: object | null) => {
  formData.value.geometry = geometry as Talhao['geometry']
}

const handleSave = () => {
  if (props.loading) return
  if (!formData.value.descricao) {
    alert('A descrição é obrigatória.')
    return
  }
  if (!formData.value.idFazenda) {
    alert('A fazenda é obrigatória.')
    return
  }
  if (!formData.value.area || formData.value.area <= 0) {
    alert('A área deve ser maior que zero.')
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
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Talhão' : 'Novo Talhão' }}
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
        <!-- Tab: Informações -->
        <div v-show="activeTab === 'informacoes'" class="space-y-8">

          <!-- Section: Identificação -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <Hash class="w-5 h-5 text-gray-500" />
              Identificação do Talhão
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">

                <!-- Descrição -->
                <div class="md:col-span-12">
                  <label class="block text-sm font-bold text-gray-700 mb-2">
                    Descrição <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText class="h-4 w-4 text-gray-400" />
                      </div>
                      <input v-model="formData.descricao" type="text"
                        class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                        placeholder="Nome ou identificação do talhão" />
                  </div>
                </div>

                <!-- Fazenda -->
                <div class="md:col-span-6">
                    <label class="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        Fazenda <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin class="h-4 w-4 text-gray-400" />
                        </div>
                        <select v-model="formData.idFazenda"
                            class="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent appearance-none bg-white transition-all disabled:bg-gray-100 disabled:text-gray-400">
                            <option :value="0" disabled>
                                Selecione uma fazenda
                            </option>
                            <option v-for="fazenda in fazendasOptions" :key="fazenda.value" :value="fazenda.value">
                                {{ fazenda.label }}
                            </option>
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                           <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                           </svg>
                        </div>
                    </div>
                </div>

                <!-- Área -->
                <div class="md:col-span-6">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        Área (ha) <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Ruler class="h-4 w-4 text-gray-400" />
                        </div>
                        <input v-model.number="formData.area" type="number" step="0.01" min="0"
                            class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                            placeholder="0.00" />
                    </div>
                </div>

                <!-- Grupo -->
                <div class="md:col-span-6">
                    <label class="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        Grupo
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FolderOpen class="h-4 w-4 text-gray-400" />
                        </div>
                        <input v-model="formData.grupo" type="text" maxlength="100"
                            class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                            placeholder="Ex: Área Norte, Pivô Central..." />
                    </div>
                </div>

            </div>
          </section>

          <!-- Section: Culturas associadas (readonly) -->
          <section v-if="formData.culturas && formData.culturas.length > 0">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <Ruler class="w-5 h-5 text-gray-500" />
              Culturas Associadas
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="cultura in formData.culturas"
                :key="cultura.id"
                class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-lime-100 text-lime-700"
              >
                {{ cultura.descricao }}
                <span v-if="cultura.areaPlantada" class="ml-1 text-lime-500">({{ cultura.areaPlantada }} ha)</span>
              </span>
            </div>
            <p class="text-xs text-gray-400 mt-2">
              Para alterar culturas, use o Configurador de Ciclo.
            </p>
          </section>

        </div>

        <!-- Tab: Mapa -->
        <div v-show="activeTab === 'mapa'" class="h-[500px]">
          <MapboxFieldEditor
            v-if="activeTab === 'mapa'"
            :model-value="formData.geometry"
            :existing-fields="existingFields || []"
            @update:model-value="handleGeometryUpdate"
          />
        </div>

        <!-- Tab: Satélite / NDVI -->
        <div v-show="activeTab === 'ndvi'">
          <NdviPanel
            v-if="activeTab === 'ndvi' && formData.id_talhao"
            :talhao="formData"
          />
          <div v-else-if="!formData.id_talhao" class="flex flex-col items-center justify-center py-12 text-gray-400">
            <Satellite class="h-10 w-10 mb-3" />
            <p class="text-sm text-center">Salve o talhão primeiro para visualizar imagens de satélite e NDVI.</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <button @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
          Cancelar
        </button>
        <button @click="handleSave" :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <Save class="h-4 w-4 mr-2" />
          {{ loading ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
