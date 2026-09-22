<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  X,
  Save,
  Calendar,
  Sprout,
  Wheat,
  FileText,
  Ruler,
  BarChart3
} from 'lucide-vue-next'
import type { ConfiguradorCiclo } from '../types/ConfiguradorCiclo'
import type { Talhao } from '../types/Talhao'
import { culturaService } from '../services/culturaService'
import { produtoService } from '../services/produtoService'
import { safraService } from '../services/safraService'
import BaseAutocomplete from './BaseAutocomplete.vue'

const props = defineProps<{
  isOpen: boolean
  initialData?: ConfiguradorCiclo | null
  loading?: boolean
  fazendaId?: number | null
  safraId?: number | null
  talhoes?: Talhao[]
}>()

const emit = defineEmits(['close', 'save'])

const activeTab = ref('informacoes')
const tabs = [
  { id: 'informacoes', label: 'Informações', icon: FileText },
]

const defaultFormData = (): ConfiguradorCiclo => ({
  idTalhao: 0,
  idCiclo: 0,
  idCultura: 0,
  idVariedadeCiclo: null,
  areaPlantada: null,
  estimativaProducao: null,
  inicioPlantio: null,
  fimPlantio: null,
  previsaoColheita: null,
  inicioColheita: null,
  fimColheita: null,
  observacao: null,
})

const formData = ref<ConfiguradorCiclo>(defaultFormData())

// Options for selects
const culturasOptions = ref<{ value: number; label: string }[]>([])
const produtosOptions = ref<{ value: number; label: string }[]>([])
const safrasOptions = ref<{ value: number; label: string }[]>([])
const talhoesOptions = ref<{ value: number; label: string }[]>([])

const loadCulturas = async () => {
  try {
    const result = await culturaService.getAllNoPagination()
    if (result && result.success && result.data) {
      culturasOptions.value = result.data.map((c) => ({
        value: c.id ?? 0,
        label: c.descricao_clt
      }))
    }
  } catch (error) {
    console.error('Erro ao buscar culturas:', error)
  }
}

const loadProdutos = async () => {
  try {
    const result = await produtoService.getAllNoPagination()
    if (result && result.success && result.data) {
      produtosOptions.value = result.data.map((p) => ({
        value: p.id_prod ?? 0,
        label: p.descricao_prod
      }))
    }
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
  }
}

const loadSafras = async () => {
  try {
    const result = await safraService.getAllNoPagination()
    if (result && result.success && result.data) {
      safrasOptions.value = result.data.map((s) => ({
        value: s.id ?? 0,
        label: s.nome
      }))
    }
  } catch (error) {
    console.error('Erro ao buscar safras:', error)
  }
}

onMounted(() => {
  loadCulturas()
  loadProdutos()
  loadSafras()
})

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      // Update talhoes options
      if (props.talhoes) {
        talhoesOptions.value = props.talhoes.map((t) => ({
          value: t.id_talhao ?? 0,
          label: t.descricao
        }))
      }

      if (props.initialData) {
        formData.value = { ...props.initialData }
        // Format dates
        const dateFields: (keyof ConfiguradorCiclo)[] = [
          'inicioPlantio', 'fimPlantio', 'previsaoColheita', 'inicioColheita', 'fimColheita'
        ]
        for (const field of dateFields) {
          const val = formData.value[field]
          if (val && typeof val === 'string') {
            try {
              const d = new Date(val)
              if (!isNaN(d.getTime())) {
                ;(formData.value as any)[field] = d.toISOString().split('T')[0]
              }
            } catch {
              // keep as-is
            }
          }
        }
      } else {
        formData.value = defaultFormData()
        // Pre-fill safra and talhao if provided
        if (props.safraId) {
          formData.value.idCiclo = props.safraId
        }
      }
      activeTab.value = 'informacoes'
    }
  }
)

const handleSave = () => {
  if (props.loading) return
  if (!formData.value.idTalhao) {
    alert('Selecione um talhão.')
    return
  }
  if (!formData.value.idCiclo) {
    alert('Selecione uma safra.')
    return
  }
  if (!formData.value.idCultura) {
    alert('Selecione uma cultura.')
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
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Cultura do Talhão' : 'Adicionar Cultura ao Talhão' }}
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
              <Sprout class="w-5 h-5 text-gray-500" />
              Dados da Cultura
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
              <!-- Talhão -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Talhão <span class="text-red-500">*</span></label>
                <BaseAutocomplete
                  v-model="formData.idTalhao"
                  :options="talhoesOptions"
                  placeholder="Selecione um talhão"
                />
              </div>

              <!-- Safra -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Safra <span class="text-red-500">*</span></label>
                <BaseAutocomplete
                  v-model="formData.idCiclo"
                  :options="safrasOptions"
                  placeholder="Selecione uma safra"
                />
              </div>

              <!-- Cultura -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Cultura <span class="text-red-500">*</span></label>
                <BaseAutocomplete
                  v-model="formData.idCultura"
                  :options="culturasOptions"
                  placeholder="Selecione uma cultura"
                >
                  <template #prefix>
                    <Wheat class="h-4 w-4 text-gray-400" />
                  </template>
                </BaseAutocomplete>
              </div>

              <!-- Variedade -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Variedade</label>
                <BaseAutocomplete
                  v-model="formData.idVariedadeCiclo"
                  :options="produtosOptions"
                  placeholder="Selecione uma variedade (opcional)"
                />
              </div>
            </div>
          </section>

          <!-- Section: Áreas e Produção -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <BarChart3 class="w-5 h-5 text-gray-500" />
              Áreas e Produção
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
              <!-- Área Plantada -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Área Plantada (ha)</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Ruler class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model.number="formData.areaPlantada"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                  />
                </div>
              </div>

              <!-- Estimativa Produção -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Estimativa Produção</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BarChart3 class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model.number="formData.estimativaProducao"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- Section: Datas -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <Calendar class="w-5 h-5 text-gray-500" />
              Datas do Ciclo
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
              <!-- Início Plantio -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Início Plantio</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.inicioPlantio"
                    type="date"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Fim Plantio -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Fim Plantio</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.fimPlantio"
                    type="date"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Previsão Colheita -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Previsão Colheita</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.previsaoColheita"
                    type="date"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Início Colheita -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Início Colheita</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.inicioColheita"
                    type="date"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Fim Colheita -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Fim Colheita</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.fimColheita"
                    type="date"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- Section: Observação -->
          <section>
            <label class="block text-sm font-bold text-gray-700 mb-2">Observação</label>
            <textarea
              v-model="formData.observacao"
              rows="3"
              placeholder="Observações sobre esta cultura..."
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400 resize-none"
            ></textarea>
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
