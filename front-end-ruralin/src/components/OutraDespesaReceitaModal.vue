<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { X, Save, Calendar, DollarSign, FileText, Layers, MapPin } from 'lucide-vue-next'
import type {
  OutraDespesaReceita,
  CreateOutraDespesaReceitaDto,
  ConfiguradorCicloOption,
} from '../types/OutraDespesaReceita'
import type { PlanoContaGerencial } from '../types/PlanoContaGerencial'
import BaseAutocomplete from './BaseAutocomplete.vue'
import { planoContaGerencialService } from '../services/PlanoContaGerencialService'
import { configuradorCicloService } from '../services/configuradorCicloService'
import { formatDateForInput } from '../utils/formatters'

const props = defineProps<{
  isOpen: boolean
  initialData?: OutraDespesaReceita | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

// Form data
const defaultForm = (): CreateOutraDespesaReceitaDto => ({
  planoGerencialId: 0,
  dataMovimento: '',
  valor: 0,
  observacoes: null,
  tipo: 'DESPESA',
  tipoAlocacao: 'PROPRIEDADE',
  configuradorCicloId: null,
})

const formData = ref<CreateOutraDespesaReceitaDto>(defaultForm())
const errors = ref<Record<string, string>>({})

// Lookup data
const planosGerenciais = ref<PlanoContaGerencial[]>([])
const configuradoresCiclo = ref<ConfiguradorCicloOption[]>([])
const selectedConfiguradorCicloId = ref<number | null>(null)

const fetchPlanosGerenciais = async () => {
  try {
    const result = await planoContaGerencialService.getAll(1, 1000)
    planosGerenciais.value = result.data
  } catch (error) {
    console.error('Erro ao buscar planos gerenciais:', error)
  }
}

const fetchConfiguradoresCiclo = async () => {
  try {
    const result = await configuradorCicloService.getAll(1, 1000)
    configuradoresCiclo.value = result.data
  } catch (error) {
    console.error('Erro ao buscar configuradores de ciclo:', error)
  }
}

// Mapa de prefixo do item (primeiro segmento) → classificação (RECEITA ou DESPESA)
const prefixClassificacaoMap = computed(() => {
  const map = new Map<string, string>()
  planosGerenciais.value
    .filter((p) => p.nivel === 1)
    .forEach((root) => {
      const prefix = root.item.split('.')[0]
      if (!prefix) return
      const desc = root.descricao.toLowerCase()
      if (desc.includes('receita')) map.set(prefix, 'RECEITA')
      else if (desc.includes('despesa')) map.set(prefix, 'DESPESA')
    })
  return map
})

// Opções de plano gerencial (apenas ANALITICA, filtrado por tipo selecionado)
const planosAnaliticosOptions = computed(() => {
  const tipoSelecionado = formData.value.tipo
  return planosGerenciais.value
    .filter((p) => {
      if (p.tipo !== 'ANALITICA') return false
      const prefix = p.item.split('.')[0]
      if (!prefix) return false
      const classificacao = prefixClassificacaoMap.value.get(prefix)
      return classificacao === tipoSelecionado
    })
    .map((p) => ({
      value: p.id ?? 0,
      label: `${p.item} - ${p.descricao}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
})

// Reset form when modal opens
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      errors.value = {}
      if (props.initialData) {
        formData.value = {
          planoGerencialId: props.initialData.planoGerencialId,
          dataMovimento: formatDateForInput(props.initialData.dataMovimento),
          valor: Number(props.initialData.valor),
          observacoes: props.initialData.observacoes ?? null,
          tipo: props.initialData.tipo,
          tipoAlocacao: props.initialData.tipoAlocacao,
          configuradorCicloId: props.initialData.configuradorCicloId ?? null,
        }
        selectedConfiguradorCicloId.value = props.initialData.configuradorCicloId ?? null
      } else {
        formData.value = defaultForm()
        selectedConfiguradorCicloId.value = null
      }
    }
  },
)

// Sincronizar configuradorCicloId selecionado com formData
watch(selectedConfiguradorCicloId, (newVal) => {
  formData.value.configuradorCicloId = newVal
})

// Limpar planoGerencialId quando tipo mudar e a conta não pertencer ao novo tipo
watch(
  () => formData.value.tipo,
  () => {
    const currentPlanoId = formData.value.planoGerencialId
    if (currentPlanoId) {
      const isValid = planosAnaliticosOptions.value.some((p) => p.value === currentPlanoId)
      if (!isValid) {
        formData.value.planoGerencialId = 0
      }
    }
  },
)

// Limpar configuradorCicloId quando tipoAlocacao mudar para PROPRIEDADE
watch(
  () => formData.value.tipoAlocacao,
  (newVal) => {
    if (newVal === 'PROPRIEDADE') {
      formData.value.configuradorCicloId = null
      selectedConfiguradorCicloId.value = null
    }
  },
)

const selectConfiguradorCiclo = (cfg: ConfiguradorCicloOption) => {
  selectedConfiguradorCicloId.value = cfg.id_cfg
  formData.value.configuradorCicloId = cfg.id_cfg
  if (errors.value.configuradorCicloId) delete errors.value.configuradorCicloId
}

const validate = (): boolean => {
  errors.value = {}

  if (!formData.value.planoGerencialId) {
    errors.value.planoGerencialId = 'O plano gerencial e obrigatorio.'
  }
  if (!formData.value.dataMovimento) {
    errors.value.dataMovimento = 'A data do movimento e obrigatoria.'
  }
  if (!formData.value.valor || Number(formData.value.valor) < 0.01) {
    errors.value.valor = 'O valor deve ser maior que zero.'
  }
  if (!formData.value.tipo) {
    errors.value.tipo = 'O tipo e obrigatorio.'
  }
  if (!formData.value.tipoAlocacao) {
    errors.value.tipoAlocacao = 'O tipo de alocacao e obrigatorio.'
  }
  if (
    formData.value.tipoAlocacao === 'CONFIGURADOR_CICLO' &&
    !formData.value.configuradorCicloId
  ) {
    errors.value.configuradorCicloId = 'Selecione um configurador de ciclo.'
  }

  return Object.keys(errors.value).length === 0
}

const handleSave = () => {
  if (props.loading) return

  if (!validate()) return

  const payload: CreateOutraDespesaReceitaDto = {
    ...formData.value,
    valor: Number(formData.value.valor),
    configuradorCicloId:
      formData.value.tipoAlocacao === 'CONFIGURADOR_CICLO'
        ? formData.value.configuradorCicloId
        : null,
  }

  emit('save', payload)
}

const formatArea = (area: number | null | undefined): string => {
  if (area === null || area === undefined) return '-'
  return `${Number(area).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ha`
}

onMounted(() => {
  fetchPlanosGerenciais()
  fetchConfiguradoresCiclo()
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div
      class="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Despesa/Receita' : 'Nova Despesa/Receita' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar">
        <div class="space-y-6">

          <!-- Tipo (Receita / Despesa) -->
          <section>
            <label class="block text-sm font-bold text-gray-700 mb-3">
              Tipo <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-4">
              <label
                class="flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all"
                :class="formData.tipo === 'DESPESA'
                  ? 'border-red-400 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'"
              >
                <input
                  type="radio"
                  v-model="formData.tipo"
                  value="DESPESA"
                  class="text-red-600 focus:ring-red-500"
                />
                <span class="text-sm font-medium">Despesa</span>
              </label>
              <label
                class="flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all"
                :class="formData.tipo === 'RECEITA'
                  ? 'border-green-400 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'"
              >
                <input
                  type="radio"
                  v-model="formData.tipo"
                  value="RECEITA"
                  class="text-green-600 focus:ring-green-500"
                />
                <span class="text-sm font-medium">Receita</span>
              </label>
            </div>
            <span v-if="errors.tipo" class="text-xs text-red-500 mt-1">{{ errors.tipo }}</span>
          </section>

          <!-- Plano Gerencial e Data -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Plano Gerencial -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">
                Plano Gerencial <span class="text-red-500">*</span>
              </label>
              <BaseAutocomplete
                v-model="formData.planoGerencialId"
                :options="planosAnaliticosOptions"
                placeholder="Selecione o plano gerencial..."
                class="w-full"
              >
                <template #prefix>
                  <Layers class="h-4 w-4 text-gray-400" />
                </template>
              </BaseAutocomplete>
              <span v-if="errors.planoGerencialId" class="text-xs text-red-500 mt-1">{{ errors.planoGerencialId }}</span>
            </div>

            <!-- Data do Movimento -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">
                Data do Movimento <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="formData.dataMovimento"
                  type="date"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  :class="{ 'border-red-500': errors.dataMovimento }"
                />
              </div>
              <span v-if="errors.dataMovimento" class="text-xs text-red-500 mt-1">{{ errors.dataMovimento }}</span>
            </div>
          </div>

          <!-- Valor -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">
                Valor (R$) <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model.number="formData.valor"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  :class="{ 'border-red-500': errors.valor }"
                />
              </div>
              <span v-if="errors.valor" class="text-xs text-red-500 mt-1">{{ errors.valor }}</span>
            </div>
          </div>

          <!-- Tipo de Alocacao -->
          <section>
            <label class="block text-sm font-bold text-gray-700 mb-3">
              Tipo de Alocacao <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-4">
              <label
                class="flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all"
                :class="formData.tipoAlocacao === 'PROPRIEDADE'
                  ? 'border-lime-400 bg-lime-50 text-lime-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'"
              >
                <input
                  type="radio"
                  v-model="formData.tipoAlocacao"
                  value="PROPRIEDADE"
                  class="text-lime-600 focus:ring-lime-500"
                />
                <MapPin class="h-4 w-4" />
                <span class="text-sm font-medium">Toda a Propriedade</span>
              </label>
              <label
                class="flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all"
                :class="formData.tipoAlocacao === 'CONFIGURADOR_CICLO'
                  ? 'border-lime-400 bg-lime-50 text-lime-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'"
              >
                <input
                  type="radio"
                  v-model="formData.tipoAlocacao"
                  value="CONFIGURADOR_CICLO"
                  class="text-lime-600 focus:ring-lime-500"
                />
                <Layers class="h-4 w-4" />
                <span class="text-sm font-medium">Configurador de Ciclo</span>
              </label>
            </div>
            <span v-if="errors.tipoAlocacao" class="text-xs text-red-500 mt-1">{{ errors.tipoAlocacao }}</span>
          </section>

          <!-- Configurador de Ciclo (Cards) -->
          <section v-if="formData.tipoAlocacao === 'CONFIGURADOR_CICLO'">
            <label class="block text-sm font-bold text-gray-700 mb-3">
              Configurador de Ciclo <span class="text-red-500">*</span>
            </label>
            <span v-if="errors.configuradorCicloId" class="text-xs text-red-500 mb-2 block">{{ errors.configuradorCicloId }}</span>

            <div v-if="configuradoresCiclo.length === 0" class="text-sm text-gray-400 text-center py-4">
              Nenhum configurador de ciclo disponivel.
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              <div
                v-for="cfg in configuradoresCiclo"
                :key="cfg.id_cfg"
                @click="selectConfiguradorCiclo(cfg)"
                class="p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
                :class="selectedConfiguradorCicloId === cfg.id_cfg
                  ? 'border-lime-500 bg-lime-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'"
              >
                <div class="flex items-start justify-between mb-2">
                  <span class="text-sm font-bold text-gray-900">
                    {{ cfg.cultura?.descricao ?? 'Cultura N/I' }}
                  </span>
                  <span
                    v-if="selectedConfiguradorCicloId === cfg.id_cfg"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-lime-600 text-white"
                  >
                    Selecionado
                  </span>
                </div>
                <div class="space-y-1">
                  <div v-if="cfg.variedadeCiclo" class="text-xs text-gray-500">
                    <span class="font-medium">Variedade:</span> {{ cfg.variedadeCiclo.descricao_prod }}
                  </div>
                  <div v-if="cfg.talhao" class="text-xs text-gray-500">
                    <span class="font-medium">Talhao:</span> {{ cfg.talhao.descricao }}
                  </div>
                  <div v-if="cfg.areaPlantada" class="text-xs text-gray-500">
                    <span class="font-medium">Area Plantada:</span> {{ formatArea(cfg.areaPlantada) }}
                  </div>
                  <div v-if="cfg.ciclo" class="text-xs text-gray-500">
                    <span class="font-medium">Ciclo:</span> {{ cfg.ciclo.descricao }}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Observacoes -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Observacoes</label>
            <div class="relative">
              <div class="absolute top-3 left-3 flex items-start pointer-events-none">
                <FileText class="h-4 w-4 text-gray-400" />
              </div>
              <textarea
                v-model="formData.observacoes"
                rows="3"
                placeholder="Observacoes sobre a despesa/receita..."
                class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all resize-none placeholder-gray-400"
              ></textarea>
            </div>
          </div>

        </div>
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
          class="inline-flex items-center bg-lime-600 hover:bg-lime-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
