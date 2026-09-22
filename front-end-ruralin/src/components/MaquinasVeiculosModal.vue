<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import {
  X,
  Hash,
  FileText,
  Layers,
  MapPin,
  Calendar,
  Monitor,
  Award,
  Settings,
  Clock,
  User,
  Scale,
  Droplet,
  DollarSign,
  Tractor,
  Shield,
  TrendingDown,
  Save,
} from 'lucide-vue-next'
import type { MaquinaVeiculo } from '../types/MaquinaVeiculo'
import type { ParceiroNegocio } from '../types/ParceiroNegocio'
import BaseAutocomplete from './BaseAutocomplete.vue'
import { propriedadeService } from '../services/propriedadeService'
import { parceiroNegocioService } from '../services/parceiroNegocioService'
import api from '../services/api'

const props = defineProps<{
  isOpen: boolean
  initialData?: MaquinaVeiculo | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const activeTab = ref('informacoes')

const tabs = [
  { id: 'informacoes', label: 'Informações', icon: Tractor },
  { id: 'seguro', label: 'Seguro', icon: Shield },
  { id: 'custos', label: 'Custos', icon: DollarSign },
  { id: 'apontamentos', label: 'Apontamentos', icon: Clock },
  { id: 'manutencoes', label: 'Manutenções', icon: Settings },
  { id: 'abastecimentos', label: 'Abastecimentos', icon: Droplet },
]

// Enum options (estáticos)
const tipoMarcadorOptions = [
  { value: 1, label: 'Horímetro' },
  { value: 2, label: 'Odômetro' },
  { value: 3, label: 'Nenhum' },
]
const combustivelOptions = [
  { value: 1, label: 'Gasolina' },
  { value: 2, label: 'Diesel' },
  { value: 3, label: 'Etanol' },
  { value: 4, label: 'Gás' },
  { value: 5, label: 'Elétrico' },
  { value: 6, label: 'Híbrido' },
]
const tipoMaquinaOptions = [
  { value: 1, label: 'Máquina' },
  { value: 2, label: 'Veículo' },
  { value: 3, label: 'Implemento' },
]

// Options carregadas da API
const fazendasOptions = ref<{ value: number; label: string }[]>([])
const gruposOptions = ref<{ value: number; label: string }[]>([])
const pessoasOptions = ref<{ value: number; label: string }[]>([])

interface GrupoEquipamento {
  id_grpequip: number
  descricao_grpequip: string
}

const loadOptions = async () => {
  try {
    const [fazendas, grupos, pessoas] = await Promise.all([
      propriedadeService.getAllNoPagination(),
      api.get<{ data: GrupoEquipamento[] }>('/gruposEquipamento'),
      parceiroNegocioService.getAllNoPagination(),
    ])

    fazendasOptions.value = (fazendas.data ?? []).map((f) => ({
      value: f.id!,
      label: f.descricao,
    }))

    gruposOptions.value = (grupos.data?.data ?? []).map((g: GrupoEquipamento) => ({
      value: g.id_grpequip,
      label: g.descricao_grpequip,
    }))

    pessoasOptions.value = (pessoas.data ?? []).map((p: ParceiroNegocio) => ({
      value: p.id_pessoa!,
      label: p.nomerazao_pessoa ?? `Pessoa ${p.id_pessoa}`,
    }))
  } catch (error) {
    console.error('Erro ao carregar opções:', error)
  }
}

onMounted(() => {
  loadOptions()
})

const defaultForm = (): MaquinaVeiculo => ({
  descricao: '',
  chassi: null,
  placa: null,
  ano: null,
  modelo: null,
  serie: null,
  marca: null,
  idGrupoEquipamento: null,
  tipoMarcador: null,
  combustivel: null,
  tipo: null,
  dataAquisicao: null,
  valorAquisicao: null,
  valorAtual: null,
  idFornecedor: null,
  notaFiscal: null,
  serieNotaFiscal: null,
  dataNotaFiscal: null,
  vidaUtil: null,
  percsucata: null,
  depreciacaoAnual: null,
  horaUtilAno: null,
  horimetroInicial: null,
  custoFixo: false,
  valorCustoFixo: null,
  valorConsumoFixo: null,
  custoDepreciacao: false,
  valorHoraDepreciacao: null,
  custoManutencao: false,
  custoCombustivel: false,
  valorHora: null,
  consumoEstimadoCombustivel: null,
  idCombustivelMaquina: null,
  idFazenda: null,
  idMotorista: null,
  consumoHA: null,
  custoHA: null,
  tara: null,
  utilizarTaraPesagem: false,
  idSeguradora: null,
  inicioSeguro: null,
  fimSeguro: null,
  aplice: null,
})

const formData = ref<MaquinaVeiculo>(defaultForm())

// Helpers de formatação moeda
const formatarMoedaDisplay = (valor: number | null | undefined): string => {
  if (!valor) return ''
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor)
}

const parseMoeda = (valor: string): number => {
  const limpo = valor.replace(/\./g, '').replace(',', '.')
  const num = parseFloat(limpo)
  return isNaN(num) ? 0 : num
}

// Display refs para campos monetários
const valorAquisicaoDisplay = ref('')
const valorHoraDisplay = ref('')

const onValorAquisicaoBlur = () => {
  const num = parseMoeda(valorAquisicaoDisplay.value)
  formData.value.valorAquisicao = num
  valorAquisicaoDisplay.value = num > 0 ? formatarMoedaDisplay(num) : ''
}
const onValorHoraBlur = () => {
  const num = parseMoeda(valorHoraDisplay.value)
  formData.value.valorHora = num
  valorHoraDisplay.value = num > 0 ? formatarMoedaDisplay(num) : ''
}

// Computed: Depreciação Anual (somente-leitura)
const depreciacaoAnualCalculada = computed<number>(() => {
  const aquisicao = Number(formData.value.valorAquisicao) || 0
  const sucata = Number(formData.value.percsucata) || 0
  const vidaUtil = Number(formData.value.vidaUtil) || 0

  if (vidaUtil <= 0 || aquisicao <= 0) return 0

  const valorResidual = aquisicao * (sucata / 100)
  return (aquisicao - valorResidual) / vidaUtil
})

const depreciacaoAnualDisplay = computed<string>(() => {
  return formatarMoedaDisplay(depreciacaoAnualCalculada.value)
})

watch(depreciacaoAnualCalculada, (novoValor) => {
  formData.value.depreciacaoAnual = novoValor
}, { immediate: true })

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      formData.value = props.initialData ? { ...props.initialData } : defaultForm()
      activeTab.value = 'informacoes'
      valorAquisicaoDisplay.value = formatarMoedaDisplay(formData.value.valorAquisicao)
      valorHoraDisplay.value = formatarMoedaDisplay(formData.value.valorHora)
    }
  },
)

const handleSave = () => {
  if (props.loading) return
  if (!formData.value.descricao?.trim()) {
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
    <div
      class="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Máquina/Veículo' : 'Nova Máquina/Veículo' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-100 px-6 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none flex items-center gap-2 whitespace-nowrap"
          :class="
            activeTab === tab.id
              ? 'border-lime-600 text-lime-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          "
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar">

        <!-- Tab: Informações -->
        <div v-show="activeTab === 'informacoes'" class="space-y-8">

          <!-- Identificação -->
          <section>
            <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <Hash class="w-4 h-4 text-gray-500" />
              Identificação
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
              <!-- Descrição -->
              <div class="md:col-span-12">
                <label class="block text-sm font-bold text-gray-700 mb-1.5">
                  Descrição <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.descricao"
                    type="text"
                    placeholder="Nome ou descrição da máquina"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                  />
                </div>
              </div>

              <!-- Marca -->
              <div class="md:col-span-3">
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Marca</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Award class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.marca"
                    type="text"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Modelo -->
              <div class="md:col-span-3">
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Modelo</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Monitor class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.modelo"
                    type="text"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Ano -->
              <div class="md:col-span-2">
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Ano</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.ano"
                    type="number"
                    min="1900"
                    class="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Placa -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Placa</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.placa"
                    type="text"
                    placeholder="Ex: ABC-1234"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Nº Chassi -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Nº Chassi</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.chassi"
                    type="text"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Nº Série -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Nº Série</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.serie"
                    type="text"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- Classificação e Localização -->
          <section>
            <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <Layers class="w-4 h-4 text-gray-500" />
              Classificação e Localização
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <!-- Tipo -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Tipo</label>
                <select
                  v-model="formData.tipo"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all bg-white"
                >
                  <option :value="null">Selecione...</option>
                  <option v-for="opt in tipoMaquinaOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <!-- Grupo -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Grupo</label>
                <BaseAutocomplete
                  v-model="formData.idGrupoEquipamento"
                  :options="gruposOptions"
                  placeholder="Selecione..."
                >
                  <template #prefix>
                    <Layers class="h-4 w-4 text-gray-400" />
                  </template>
                </BaseAutocomplete>
              </div>

              <!-- Fazenda -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Fazenda</label>
                <BaseAutocomplete
                  v-model="formData.idFazenda"
                  :options="fazendasOptions"
                  placeholder="Selecione..."
                >
                  <template #prefix>
                    <MapPin class="h-4 w-4 text-gray-400" />
                  </template>
                </BaseAutocomplete>
              </div>

              <!-- Tipo Marcador -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Marcador</label>
                <select
                  v-model="formData.tipoMarcador"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all bg-white"
                >
                  <option :value="null">Selecione...</option>
                  <option v-for="opt in tipoMarcadorOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <!-- Combustível -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Combustível</label>
                <select
                  v-model="formData.combustivel"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all bg-white"
                >
                  <option :value="null">Selecione...</option>
                  <option v-for="opt in combustivelOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <!-- Motorista -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Motorista Principal</label>
                <BaseAutocomplete
                  v-model="formData.idMotorista"
                  :options="pessoasOptions"
                  placeholder="Selecione..."
                >
                  <template #prefix>
                    <User class="h-4 w-4 text-gray-400" />
                  </template>
                </BaseAutocomplete>
              </div>
            </div>
          </section>

          <!-- Operacional -->
          <section>
            <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <DollarSign class="w-4 h-4 text-gray-500" />
              Operacional
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">Horímetro Inicial</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.horimetroInicial"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">Valor/Hora (R$)</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    :value="valorHoraDisplay"
                    @input="valorHoraDisplay = ($event.target as HTMLInputElement).value"
                    @blur="onValorHoraBlur"
                    type="text"
                    inputmode="decimal"
                    placeholder="0,00"
                    class="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">Tara (kg)</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Scale class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.tara"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                  />
                </div>
              </div>

              <div class="flex items-end pb-1">
                <label
                  class="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all w-full justify-center"
                >
                  <input
                    v-model="formData.utilizarTaraPesagem"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                  />
                  <span class="text-sm text-gray-700 font-medium">Usar Tara</span>
                </label>
              </div>
            </div>
          </section>

          <!-- Aquisição -->
          <section>
            <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <FileText class="w-4 h-4 text-gray-500" />
              Aquisição
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Fornecedor</label>
                <BaseAutocomplete
                  v-model="formData.idFornecedor"
                  :options="pessoasOptions"
                  placeholder="Selecione..."
                >
                  <template #prefix>
                    <User class="h-4 w-4 text-gray-400" />
                  </template>
                </BaseAutocomplete>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Data Aquisição</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.dataAquisicao"
                    type="date"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>


              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Nota Fiscal</label>
                <input
                  v-model="formData.notaFiscal"
                  type="text"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Série NF</label>
                <input
                  v-model="formData.serieNotaFiscal"
                  type="text"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Data NF</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.dataNotaFiscal"
                    type="date"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- Depreciação -->
          <section>
            <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <TrendingDown class="w-4 h-4 text-gray-500" />
              Depreciação
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
             <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">Valor Aquisição (R$)</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    :value="valorAquisicaoDisplay"
                    @input="valorAquisicaoDisplay = ($event.target as HTMLInputElement).value"
                    @blur="onValorAquisicaoBlur"
                    type="text"
                    inputmode="decimal"
                    placeholder="0,00"
                    class="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                  />
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">Perc. Sucata (%)</label>
                <input
                  v-model="formData.percsucata"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">Vida Útil (anos)</label>
                <input
                  v-model="formData.vidaUtil"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                />
              </div>
              
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">
                  Deprec. Anual (R$)
                  <span class="text-gray-400 font-normal" title="Calculado automaticamente a partir de Valor Aquisição, Perc. Sucata e Vida Útil">(calculado)</span>
                </label>
                <input
                  :value="depreciacaoAnualDisplay"
                  type="text"
                  readonly
                  tabindex="-1"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-right cursor-not-allowed select-none"
                />
              </div>
            </div>
          </section>
        </div>

        <!-- Tab: Seguro -->
        <div v-show="activeTab === 'seguro'" class="space-y-6">
          <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
            <Shield class="w-4 h-4 text-gray-500" />
            Apólice de Seguro
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="md:col-span-2">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Seguradora</label>
              <BaseAutocomplete
                v-model="formData.idSeguradora"
                :options="pessoasOptions"
                placeholder="Selecione..."
              >
                <template #prefix>
                  <Shield class="h-4 w-4 text-gray-400" />
                </template>
              </BaseAutocomplete>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Apólice</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="formData.aplice"
                  type="text"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <!-- spacer -->
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Início Vigência</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="formData.inicioSeguro"
                  type="date"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Fim Vigência</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="formData.fimSeguro"
                  type="date"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Custos -->
        <div v-show="activeTab === 'custos'" class="text-center py-16 text-gray-400">
          <DollarSign class="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p class="text-sm">Em desenvolvimento...</p>
        </div>

        <!-- Tab: Apontamentos -->
        <div v-show="activeTab === 'apontamentos'" class="text-center py-16 text-gray-400">
          <Clock class="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p class="text-sm">Em desenvolvimento...</p>
        </div>

        <!-- Tab: Manutenções -->
        <div v-show="activeTab === 'manutencoes'" class="text-center py-16 text-gray-400">
          <Settings class="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p class="text-sm">Em desenvolvimento...</p>
        </div>

        <!-- Tab: Abastecimentos -->
        <div v-show="activeTab === 'abastecimentos'" class="text-center py-16 text-gray-400">
          <Droplet class="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p class="text-sm">Em desenvolvimento...</p>
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
