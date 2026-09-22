<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { X, Plus, Trash2, Calculator, Save, BarChart3, Search } from 'lucide-vue-next'
import { toast } from 'vue3-toastify'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type {
  FluxoCaixaSimulacaoDetailDto,
  FluxoCaixaTipoOverride,
  FluxoCaixaReferenciaTipo,
  CreateFluxoCaixaSimulacaoItemDto,
  FluxoCaixaEntryDto,
} from '@/types/FluxoCaixa'
import { TIPO_OVERRIDE_LABELS } from '@/types/FluxoCaixa'
import { useFluxoCaixaStore } from '@/stores/fluxoCaixa'
import { contaService } from '@/services/contaService'
import { fluxoCaixaService } from '@/services/fluxoCaixaService'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface FormItem {
  tipoOverride: FluxoCaixaTipoOverride | ''
  referenciaTipo: FluxoCaixaReferenciaTipo | null
  referenciaId: number | null
  lancamentoBusca: string
  descricao: string
  tipoFluxo: 'entrada' | 'saida'
  dataOriginal: string
  dataNova: string
  valorOriginal: number | null
  valorNovo: number | null
  contaBancariaId: number | null
}

interface ContaOption {
  value: number
  label: string
}

const props = defineProps<{
  isOpen: boolean
  initialData: FluxoCaixaSimulacaoDetailDto | null
  loading: boolean
}>()

const emit = defineEmits<{
  close: []
  save: []
}>()

const store = useFluxoCaixaStore()

// Form state
const nome = ref('')
const descricao = ref('')
const dataInicio = ref('')
const dataFim = ref('')
const itens = ref<FormItem[]>([])
const isDirty = ref(false)
const salvando = ref(false)
const calculando = ref(false)

// Autocomplete state
const autocompleteResults = ref<Record<number, FluxoCaixaEntryDto[]>>({})
const autocompleteLoading = ref<Record<number, boolean>>({})
const activeAutocompleteIndex = ref<number | null>(null)

// Contas bancárias
const contasOptions = ref<ContaOption[]>([])

// Chart preview
const chartData = ref<{
  labels: string[]
  datasets: { label: string; data: number[]; backgroundColor: string }[]
} | null>(null)

// Textarea auto-grow
const descricaoRef = ref<HTMLTextAreaElement | null>(null)

const isEditing = computed(() => !!props.initialData)
const titulo = computed(() => isEditing.value ? 'Editar Simulação' : 'Nova Simulação')

// Validation
const nomeError = computed(() => {
  if (!nome.value) return 'Nome é obrigatório'
  if (nome.value.length < 3) return 'Nome deve ter pelo menos 3 caracteres'
  if (nome.value.length > 255) return 'Nome deve ter no máximo 255 caracteres'
  return ''
})

const dataFimError = computed(() => {
  if (!dataFim.value) return 'Data fim é obrigatória'
  if (dataInicio.value && dataFim.value <= dataInicio.value) return 'Data fim deve ser posterior à data início'
  return ''
})

const formValid = computed(() => {
  if (!nome.value || nome.value.length < 3 || nome.value.length > 255) return false
  if (!dataInicio.value) return false
  if (!dataFim.value || (dataInicio.value && dataFim.value <= dataInicio.value)) return false

  for (const item of itens.value) {
    if (!item.tipoOverride) return false
    if (!item.descricao || item.descricao.length < 3) return false
  }

  return true
})

// Helper: check if tipo needs lancamento reference
function precisaLancamento(tipo: FluxoCaixaTipoOverride | ''): boolean {
  if (!tipo) return false
  return !['adicionar_entrada', 'adicionar_saida'].includes(tipo)
}

function precisaTipoFluxo(tipo: FluxoCaixaTipoOverride | ''): boolean {
  return tipo === 'adicionar_entrada' || tipo === 'adicionar_saida'
}

function precisaDataNova(tipo: FluxoCaixaTipoOverride | ''): boolean {
  return ['adiar_pagamento', 'antecipar_recebimento', 'adicionar_entrada', 'adicionar_saida'].includes(tipo as string)
}

function precisaValorNovo(tipo: FluxoCaixaTipoOverride | ''): boolean {
  return ['alterar_valor', 'adicionar_entrada', 'adicionar_saida'].includes(tipo as string)
}

function precisaContaBancaria(tipo: FluxoCaixaTipoOverride | ''): boolean {
  return tipo === 'adicionar_entrada' || tipo === 'adicionar_saida'
}

// Create empty item
function criarItemVazio(): FormItem {
  return {
    tipoOverride: '',
    referenciaTipo: null,
    referenciaId: null,
    lancamentoBusca: '',
    descricao: '',
    tipoFluxo: 'entrada',
    dataOriginal: '',
    dataNova: '',
    valorOriginal: null,
    valorNovo: null,
    contaBancariaId: null,
  }
}

function adicionarItem() {
  itens.value.push(criarItemVazio())
  isDirty.value = true
}

function removerItem(index: number) {
  itens.value.splice(index, 1)
  isDirty.value = true
}

// Autocomplete
let autocompleteTimers: Record<number, ReturnType<typeof setTimeout>> = {}

async function buscarLancamentos(index: number) {
  const item = itens.value[index]
  if (!item) return
  const search = item.lancamentoBusca

  if (autocompleteTimers[index]) {
    clearTimeout(autocompleteTimers[index])
  }

  if (!search || search.length < 2 || !dataInicio.value || !dataFim.value) {
    autocompleteResults.value[index] = []
    return
  }

  autocompleteTimers[index] = setTimeout(async () => {
    autocompleteLoading.value[index] = true
    try {
      const results = await fluxoCaixaService.autocompleteProjetados(
        dataInicio.value,
        dataFim.value,
        search,
      )
      autocompleteResults.value[index] = results
      activeAutocompleteIndex.value = index
    } catch {
      autocompleteResults.value[index] = []
    } finally {
      autocompleteLoading.value[index] = false
    }
  }, 300)
}

function selecionarLancamento(index: number, entry: FluxoCaixaEntryDto) {
  const item = itens.value[index]
  if (!item) return
  item.lancamentoBusca = entry.descricao
  item.descricao = entry.descricao
  item.referenciaTipo = entry.origem as FluxoCaixaReferenciaTipo
  item.referenciaId = entry.origemId
  item.dataOriginal = entry.data
  item.valorOriginal = entry.valor
  item.contaBancariaId = entry.contaBancariaId
  autocompleteResults.value[index] = []
  activeAutocompleteIndex.value = null
  isDirty.value = true
}

function fecharAutocomplete() {
  activeAutocompleteIndex.value = null
}

function fecharAutocompleteComDelay() {
  setTimeout(() => fecharAutocomplete(), 200)
}

// Currency formatting
function formatBRL(valor: number | null | undefined): string {
  if (valor == null) return ''
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Textarea auto-grow
function autoGrowDescricao() {
  nextTick(() => {
    if (descricaoRef.value) {
      descricaoRef.value.style.height = 'auto'
      descricaoRef.value.style.height = descricaoRef.value.scrollHeight + 'px'
    }
  })
}

// Load contas bancárias
async function carregarContas() {
  try {
    const result = await contaService.getAll(1, 1000)
    const data = result.data?.data || result.data || []
    contasOptions.value = (data as any[]).map((c: any) => ({
      value: c.id,
      label: c.nome || c.descricao || `Conta #${c.id}`,
    }))
  } catch {
    contasOptions.value = []
  }
}

// Populate form from initialData
function populateForm() {
  if (props.initialData) {
    nome.value = props.initialData.nome
    descricao.value = props.initialData.descricao || ''
    dataInicio.value = props.initialData.dataInicio
    dataFim.value = props.initialData.dataFim
    itens.value = (props.initialData.itens || []).map((item) => ({
      tipoOverride: item.tipoOverride as FluxoCaixaTipoOverride,
      referenciaTipo: item.referenciaTipo as FluxoCaixaReferenciaTipo | null,
      referenciaId: item.referenciaId,
      lancamentoBusca: item.descricao,
      descricao: item.descricao,
      tipoFluxo: (item.tipoFluxo as 'entrada' | 'saida') || 'entrada',
      dataOriginal: item.dataOriginal || '',
      dataNova: item.dataNova || '',
      valorOriginal: item.valorOriginal,
      valorNovo: item.valorNovo,
      contaBancariaId: item.contaBancariaId,
    }))
  } else {
    nome.value = ''
    descricao.value = ''
    dataInicio.value = ''
    dataFim.value = ''
    itens.value = []
  }
  chartData.value = null
  isDirty.value = false
}

// Calcular prévia
async function calcularPrevia() {
  if (!formValid.value) {
    toast.warning('Preencha todos os campos obrigatórios antes de calcular')
    return
  }

  calculando.value = true
  try {
    // Build items DTO
    const itensDto = buildItensDto()

    let simulacaoId: number

    if (isEditing.value && props.initialData) {
      // Update existing simulation + items
      await store.atualizarSimulacao(props.initialData.id, {
        nome: nome.value,
        descricao: descricao.value || undefined,
        dataInicio: dataInicio.value,
        dataFim: dataFim.value,
      })
      simulacaoId = props.initialData.id

      // Sync items: delete existing and add new ones
      if (props.initialData.itens) {
        for (const existingItem of props.initialData.itens) {
          await store.deletarItem(simulacaoId, existingItem.id)
        }
      }
      for (const dto of itensDto) {
        await store.adicionarItem(simulacaoId, dto)
      }
    } else {
      // Create temp simulation for preview
      const result = await store.criarSimulacaoCompleto({
        nome: nome.value,
        descricao: descricao.value || undefined,
        dataInicio: dataInicio.value,
        dataFim: dataFim.value,
        itens: itensDto,
      })
      simulacaoId = result.id
    }

    // Calculate
    const resultado = await store.calcularSimulacao(simulacaoId)

    // Also get base consolidado for comparison
    const baseConsolidado = store.consolidado

    if (resultado && baseConsolidado) {
      const labels = resultado.periodos.map((p) => p.rotulo)
      chartData.value = {
        labels,
        datasets: [
          {
            label: 'Saldo Base',
            data: baseConsolidado.periodos.map((p) => p.saldoAcumulado),
            backgroundColor: 'rgba(101, 163, 13, 0.6)',
          },
          {
            label: 'Saldo Simulado',
            data: resultado.periodos.map((p) => p.saldoAcumulado),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
          },
        ],
      }
    } else if (resultado) {
      const labels = resultado.periodos.map((p) => p.rotulo)
      chartData.value = {
        labels,
        datasets: [
          {
            label: 'Saldo Simulado',
            data: resultado.periodos.map((p) => p.saldoAcumulado),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
          },
        ],
      }
    }

    toast.success('Prévia calculada com sucesso')
  } catch (err: any) {
    toast.error(err?.response?.data?.error?.message || 'Erro ao calcular prévia')
  } finally {
    calculando.value = false
  }
}

function buildItensDto(): CreateFluxoCaixaSimulacaoItemDto[] {
  return itens.value
    .filter((item) => item.tipoOverride)
    .map((item) => {
      const dto: CreateFluxoCaixaSimulacaoItemDto = {
        tipoOverride: item.tipoOverride as FluxoCaixaTipoOverride,
        descricao: item.descricao,
        tipoFluxo: item.tipoFluxo,
      }

      if (item.referenciaTipo) dto.referenciaTipo = item.referenciaTipo
      if (item.referenciaId) dto.referenciaId = item.referenciaId
      if (item.dataOriginal) dto.dataOriginal = item.dataOriginal
      if (item.dataNova) dto.dataNova = item.dataNova
      if (item.valorOriginal != null) dto.valorOriginal = item.valorOriginal
      if (item.valorNovo != null) dto.valorNovo = item.valorNovo
      if (item.contaBancariaId != null) dto.contaBancariaId = item.contaBancariaId

      return dto
    })
}

// Save
async function salvar() {
  if (!formValid.value) {
    toast.warning('Preencha todos os campos obrigatórios')
    return
  }

  salvando.value = true
  try {
    const itensDto = buildItensDto()

    if (isEditing.value && props.initialData) {
      await store.atualizarSimulacao(props.initialData.id, {
        nome: nome.value,
        descricao: descricao.value || undefined,
        dataInicio: dataInicio.value,
        dataFim: dataFim.value,
      })

      // Sync items
      if (props.initialData.itens) {
        for (const existingItem of props.initialData.itens) {
          await store.deletarItem(props.initialData.id, existingItem.id)
        }
      }
      for (const dto of itensDto) {
        await store.adicionarItem(props.initialData.id, dto)
      }

      toast.success('Simulação atualizada com sucesso')
    } else {
      await store.criarSimulacaoCompleto({
        nome: nome.value,
        descricao: descricao.value || undefined,
        dataInicio: dataInicio.value,
        dataFim: dataFim.value,
        itens: itensDto,
      })
      toast.success('Simulação criada com sucesso')
    }

    isDirty.value = false
    emit('save')
    emit('close')
  } catch (err: any) {
    toast.error(err?.response?.data?.error?.message || 'Erro ao salvar simulação')
  } finally {
    salvando.value = false
  }
}

// Cancel
function cancelar() {
  if (isDirty.value) {
    if (!confirm('Existem alterações não salvas. Deseja descartar?')) {
      return
    }
  }
  chartData.value = null
  emit('close')
}

// Watch for changes
watch(
  [nome, descricao, dataInicio, dataFim, itens],
  () => {
    isDirty.value = true
  },
  { deep: true },
)

// Watch isOpen to populate form
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      populateForm()
      carregarContas()
    }
  },
)

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Comparação: Saldo Acumulado',
    },
  },
  scales: {
    y: {
      ticks: {
        callback: (value: any) => formatBRL(value),
      },
    },
  },
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      @click.self="cancelar"
    >
      <!-- Overlay -->
      <div class="fixed inset-0 bg-black/50" @click="cancelar" />

      <!-- Modal -->
      <div
        class="relative z-10 w-full max-w-4xl mx-4 my-8 bg-white rounded-xl shadow-2xl"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-800">{{ titulo }}</h2>
          <button
            @click="cancelar"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 space-y-6 max-h-[75vh] overflow-y-auto">
          <!-- Section 1: Header -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-700 border-b border-gray-100 pb-2">
              Dados da Simulação
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Nome -->
              <div class="md:col-span-2">
                <label class="block text-sm font-bold text-gray-700 mb-1">
                  Nome <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="nome"
                  type="text"
                  maxlength="255"
                  placeholder="Nome da simulação"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  :class="{ 'border-red-300 focus:ring-red-500': nome && nomeError }"
                />
                <p v-if="nome && nomeError" class="mt-1 text-xs text-red-500">{{ nomeError }}</p>
              </div>

              <!-- Descrição -->
              <div class="md:col-span-2">
                <label class="block text-sm font-bold text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  ref="descricaoRef"
                  v-model="descricao"
                  placeholder="Descrição da simulação (opcional)"
                  rows="2"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all resize-none overflow-hidden"
                  @input="autoGrowDescricao"
                />
              </div>

              <!-- Data Início -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">
                  Data Início <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="dataInicio"
                  type="date"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Data Fim -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">
                  Data Fim <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="dataFim"
                  type="date"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  :class="{ 'border-red-300 focus:ring-red-500': dataFim && dataFimError }"
                />
                <p v-if="dataFim && dataFimError" class="mt-1 text-xs text-red-500">{{ dataFimError }}</p>
              </div>
            </div>
          </div>

          <!-- Section 2: Items -->
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 class="text-lg font-semibold text-gray-700">
                Ajustes da Simulação
              </h3>
              <button
                @click="adicionarItem"
                class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-lime-700 bg-lime-50 hover:bg-lime-100 rounded-lg transition-colors"
              >
                <Plus class="w-4 h-4" />
                Adicionar Ajuste
              </button>
            </div>

            <div v-if="itens.length === 0" class="text-center py-8 text-gray-400">
              Nenhum ajuste adicionado. Clique em "Adicionar Ajuste" para começar.
            </div>

            <!-- Item list -->
            <div
              v-for="(item, index) in itens"
              :key="index"
              class="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50/50"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-gray-600">Ajuste #{{ index + 1 }}</span>
                <button
                  @click="removerItem(index)"
                  class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remover ajuste"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <!-- Tipo Override -->
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">
                    Tipo de Ajuste <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="item.tipoOverride"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Selecione...</option>
                    <option
                      v-for="(label, key) in TIPO_OVERRIDE_LABELS"
                      :key="key"
                      :value="key"
                    >
                      {{ label }}
                    </option>
                  </select>
                </div>

                <!-- Lançamento busca (autocomplete) -->
                <div v-if="precisaLancamento(item.tipoOverride)" class="relative">
                  <label class="block text-sm font-bold text-gray-700 mb-1">
                    Lançamento
                  </label>
                  <div class="relative">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      v-model="item.lancamentoBusca"
                      type="text"
                      placeholder="Buscar lançamento..."
                      class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                      @input="buscarLancamentos(index)"
                      @focus="activeAutocompleteIndex = index"
                      @blur="fecharAutocompleteComDelay()"
                    />
                    <div
                      v-if="autocompleteLoading[index]"
                      class="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <div class="w-4 h-4 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </div>

                  <!-- Autocomplete dropdown -->
                  <div
                    v-if="activeAutocompleteIndex === index && autocompleteResults[index]?.length"
                    class="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 max-h-48 overflow-y-auto"
                  >
                    <div
                      v-for="entry in autocompleteResults[index]"
                      :key="`${entry.origem}-${entry.origemId}-${entry.data}`"
                      @mousedown.prevent="selecionarLancamento(index, entry)"
                      class="px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                    >
                      <div class="text-sm font-medium text-gray-700">{{ entry.descricao }}</div>
                      <div class="flex gap-3 text-xs text-gray-500 mt-0.5">
                        <span>{{ new Date(entry.data).toLocaleDateString('pt-BR') }}</span>
                        <span :class="entry.tipoFluxo === 'entrada' ? 'text-green-600' : 'text-red-600'">
                          {{ formatBRL(entry.valor) }}
                        </span>
                        <span v-if="entry.contaBancariaNome">{{ entry.contaBancariaNome }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Descrição -->
                <div :class="{ 'md:col-span-2': !precisaLancamento(item.tipoOverride) }">
                  <label class="block text-sm font-bold text-gray-700 mb-1">
                    Descrição <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="item.descricao"
                    type="text"
                    placeholder="Descrição do ajuste"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    :class="{ 'border-red-300': item.descricao && item.descricao.length < 3 }"
                  />
                  <p v-if="item.descricao && item.descricao.length < 3" class="mt-1 text-xs text-red-500">
                    Mínimo 3 caracteres
                  </p>
                </div>

                <!-- Tipo Fluxo (radio) -->
                <div v-if="precisaTipoFluxo(item.tipoOverride)">
                  <label class="block text-sm font-bold text-gray-700 mb-1">
                    Tipo de Fluxo
                  </label>
                  <div class="flex gap-4 mt-1">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="item.tipoFluxo"
                        type="radio"
                        value="entrada"
                        class="w-4 h-4 text-lime-600 focus:ring-lime-500"
                      />
                      <span class="text-sm text-gray-700">Entrada</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="item.tipoFluxo"
                        type="radio"
                        value="saida"
                        class="w-4 h-4 text-lime-600 focus:ring-lime-500"
                      />
                      <span class="text-sm text-gray-700">Saída</span>
                    </label>
                  </div>
                </div>

                <!-- Data Nova -->
                <div v-if="precisaDataNova(item.tipoOverride)">
                  <label class="block text-sm font-bold text-gray-700 mb-1">
                    Nova Data
                  </label>
                  <input
                    v-model="item.dataNova"
                    type="date"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>

                <!-- Valor Novo -->
                <div v-if="precisaValorNovo(item.tipoOverride)">
                  <label class="block text-sm font-bold text-gray-700 mb-1">
                    Valor (R$)
                  </label>
                  <input
                    v-model.number="item.valorNovo"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>

                <!-- Conta Bancária -->
                <div v-if="precisaContaBancaria(item.tipoOverride)">
                  <label class="block text-sm font-bold text-gray-700 mb-1">
                    Conta Bancária
                  </label>
                  <select
                    v-model="item.contaBancariaId"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all bg-white"
                  >
                    <option :value="null">Selecione...</option>
                    <option
                      v-for="conta in contasOptions"
                      :key="conta.value"
                      :value="conta.value"
                    >
                      {{ conta.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Chart Preview -->
          <div v-if="chartData" class="space-y-2">
            <div class="flex items-center gap-2 border-b border-gray-100 pb-2">
              <BarChart3 class="w-5 h-5 text-gray-500" />
              <h3 class="text-lg font-semibold text-gray-700">Prévia da Simulação</h3>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg p-4" style="height: 280px">
              <Bar :data="chartData" :options="chartOptions" />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50 rounded-b-xl">
          <button
            @click="calcularPrevia"
            :disabled="!formValid || calculando || loading"
            class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Calculator class="w-4 h-4" />
            {{ calculando ? 'Calculando...' : 'Calcular Prévia' }}
          </button>

          <div class="flex gap-3">
            <button
              @click="cancelar"
              class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="salvar"
              :disabled="!formValid || salvando || loading"
              class="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save class="w-4 h-4" />
              {{ salvando ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
