<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import {
  X,
  Save,
  ClipboardList,
  Package,
  Ruler,
  Calendar,
  Clock,
  Truck,
  Ticket,
  Weight,
  ChevronDown,
  ChevronUp,
  FileText,
  MapPin,
  Warehouse,
} from 'lucide-vue-next'
import type { RegistroArmazenagem } from '../types/RegistroArmazenagem'
import type { UnidadeDeposito } from '../types/UnidadeDeposito'
import type { UnidadeMedida } from '../types/UnidadeMedida'
import type { Produto } from '../types/Produto'
import type { ConfiguradorCicloOption } from '../types/OutraDespesaReceita'
import type { ParceiroNegocio } from '../types/ParceiroNegocio'
import BaseAutocomplete from './BaseAutocomplete.vue'
import { produtoService } from '../services/produtoService'
import { unidadeMedidaService } from '../services/unidadeMedidaService'
import { unidadeDepositoService } from '../services/unidadeDepositoService'
import { configuradorCicloService } from '../services/configuradorCicloService'
import { parceiroNegocioService } from '../services/parceiroNegocioService'

const props = defineProps<{
  isOpen: boolean
  initialData?: RegistroArmazenagem | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const tipoOptions = [
  { value: 'Carga', label: 'Carga' },
  { value: 'Descarga', label: 'Descarga' },
]

const defaultForm = (): Partial<RegistroArmazenagem> => ({
  tipo: 'Carga',
  data: new Date().toISOString().split('T')[0],
  hora: null,
  idProduto: undefined,
  idUnidadeMedida: undefined,
  idOrigem: undefined,
  idUnidadeDeposito: undefined,
  idMotorista: null,
  ticket: null,
  placa: null,
  peso_bruto: 0,
  peso_tara: 0,
  peso_liquido: 0,
  desconto_umidade: 0,
  desconto_impureza: 0,
  desconto_avariados: 0,
  desconto_esverdeados: 0,
  desconto_quebra_tecnica: 0,
  desconto_taxa_recepcao: 0,
  desconto_total: 0,
  observacoes: null,
})

const formData = ref<Partial<RegistroArmazenagem>>(defaultForm())

// Seção de descontos expandida/recolhida
const showDescontos = ref(false)

// Opções para autocompletes
const produtosOptions = ref<{ value: number; label: string }[]>([])
const unidadesOptions = ref<{ value: number; label: string }[]>([])
const unidadesDepositoOptions = ref<{ value: number; label: string }[]>([])
const configuradoresOptions = ref<{ value: number; label: string }[]>([])
const motoristasOptions = ref<{ value: number; label: string }[]>([])

// Dados das unidades de depósito para exibição de capacidade
const unidadesDepositoData = ref<UnidadeDeposito[]>([])

// Dados das unidades de medida para exibição de abreviatura
const unidadesMedidaData = ref<UnidadeMedida[]>([])

// Desconto total calculado
const descontoTotalCalculado = computed(() => {
  return (
    Number(formData.value.desconto_umidade ?? 0) +
    Number(formData.value.desconto_impureza ?? 0) +
    Number(formData.value.desconto_avariados ?? 0) +
    Number(formData.value.desconto_esverdeados ?? 0) +
    Number(formData.value.desconto_quebra_tecnica ?? 0) +
    Number(formData.value.desconto_taxa_recepcao ?? 0)
  )
})

// Peso líquido calculado = Peso Bruto - Peso Tara - Descontos
const pesoLiquidoCalculado = computed(() => {
  const bruto = Number(formData.value.peso_bruto ?? 0)
  const tara = Number(formData.value.peso_tara ?? 0)
  const descontos = descontoTotalCalculado.value
  return Math.max(bruto - tara - descontos, 0)
})

// Abreviatura da unidade de medida selecionada
const unidadeMedidaSelecionada = computed(() => {
  if (!formData.value.idUnidadeMedida) return ''
  const um = unidadesMedidaData.value.find(
    (u) => u.id_unidade === formData.value.idUnidadeMedida,
  )
  return um?.abreviatura_unidade ?? ''
})

// Informação da unidade de depósito selecionada
const unidadeDepositoSelecionada = computed(() => {
  if (!formData.value.idUnidadeDeposito) return null
  return unidadesDepositoData.value.find(
    (u) => u.id === formData.value.idUnidadeDeposito,
  )
})

// Formatação
const formatNumber = (value: number | undefined | null, decimals = 2) => {
  if (value == null) return '0'
  return Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

const loadOptions = async () => {
  try {
    const [produtos, unidades, unidadesDeposito, configuradores, motoristas] = await Promise.all([
      produtoService.getAll(1, 1000),
      unidadeMedidaService.getAllNoPagination(),
      unidadeDepositoService.getComSaldo(),
      configuradorCicloService.getAll(1, 1000),
      parceiroNegocioService.getAll(1, 1000),
    ])

    produtosOptions.value = (produtos.data ?? []).map((p: Produto) => ({
      value: p.id_prod!,
      label: p.descricao_prod,
    }))

    const umData = unidades.data ?? []
    unidadesMedidaData.value = umData
    unidadesOptions.value = umData.map(
      (u: UnidadeMedida) => ({
        value: u.id_unidade!,
        label: `${u.descricao_unidade} (${u.abreviatura_unidade})`,
      }),
    )

    const udData = Array.isArray(unidadesDeposito) ? unidadesDeposito : []
    unidadesDepositoData.value = udData
    unidadesDepositoOptions.value = (udData as UnidadeDeposito[])
      .filter((u: UnidadeDeposito) => u.ativo)
      .map((u: UnidadeDeposito) => ({
        value: u.id!,
        label: u.descricao,
      }))

    configuradoresOptions.value = (configuradores.data ?? []).map(
      (c: ConfiguradorCicloOption) => ({
        value: c.id_cfg!,
        label: [
          c.talhao?.descricao,
          c.cultura?.descricao,
          c.ciclo?.descricao,
        ]
          .filter(Boolean)
          .join(' - ') || `Config. ${c.id_cfg}`,
      }),
    )

    motoristasOptions.value = (motoristas.data ?? [])
      .filter((p: ParceiroNegocio) => p.motorista_pessoa)
      .map((p: ParceiroNegocio) => ({
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

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      formData.value = props.initialData ? { ...props.initialData } : defaultForm()
      showDescontos.value = false
    }
  },
)

// Atualizar desconto total automaticamente
watch(descontoTotalCalculado, (newVal) => {
  formData.value.desconto_total = newVal
})

// Atualizar peso líquido automaticamente
watch(pesoLiquidoCalculado, (newVal) => {
  formData.value.peso_liquido = newVal
})

// Quando selecionar uma unidade de depósito, auto-preencher produto e unidade de medida
watch(
  () => formData.value.idUnidadeDeposito,
  (newId) => {
    if (!newId) return
    const ud = unidadesDepositoData.value.find((u) => u.id === newId)
    if (ud) {
      if (ud.idProduto) {
        formData.value.idProduto = ud.idProduto
      }
      if (ud.idUnidadeMedida) {
        formData.value.idUnidadeMedida = ud.idUnidadeMedida
      }
    }
  },
)

const handleSave = () => {
  if (props.loading) return

  if (!formData.value.tipo) {
    alert('O tipo é obrigatório.')
    return
  }
  if (!formData.value.data) {
    alert('A data é obrigatória.')
    return
  }
  if (!formData.value.peso_bruto || Number(formData.value.peso_bruto) <= 0) {
    alert('Peso bruto é obrigatório e deve ser maior que zero.')
    return
  }
  if (formData.value.peso_tara == null || Number(formData.value.peso_tara) < 0) {
    alert('Peso tara é obrigatório e deve ser maior ou igual a zero.')
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
      class="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{
            props.initialData?.id
              ? 'Editar Registro de Armazenagem'
              : 'Novo Registro de Armazenagem'
          }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar space-y-8">
        <!-- Section: Informações Principais -->
        <section>
          <h3
            class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2"
          >
            <ClipboardList class="w-4 h-4 text-gray-500" />
            Informações Principais
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
            <!-- Tipo -->
            <div class="md:col-span-3">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Tipo <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.tipo"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all bg-white"
              >
                <option v-for="opt in tipoOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Data -->
            <div class="md:col-span-3">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Data <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="formData.data"
                  type="date"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <!-- Hora -->
            <div class="md:col-span-3">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Hora</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="formData.hora"
                  type="time"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <!-- Ticket -->
            <div class="md:col-span-3">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Ticket</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Ticket class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="formData.ticket"
                  type="text"
                  maxlength="100"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="Nº do ticket"
                />
              </div>
            </div>

            <!-- Unidade de Depósito -->
            <div class="md:col-span-6">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Unidade de Depósito</label>
              <BaseAutocomplete
                v-model="formData.idUnidadeDeposito"
                :options="unidadesDepositoOptions"
                placeholder="Selecione a unidade..."
                class="w-full"
              >
                <template #prefix>
                  <Warehouse class="h-4 w-4 text-gray-400" />
                </template>
              </BaseAutocomplete>
              <!-- Informações de capacidade -->
              <div
                v-if="unidadeDepositoSelecionada"
                class="mt-1.5 flex items-center gap-3 text-xs text-gray-500"
              >
                <span>
                  Saldo:
                  <strong class="text-gray-700">
                    {{ formatNumber(unidadeDepositoSelecionada.saldoAtual ?? 0) }}
                  </strong>
                </span>
                <span class="text-gray-300">|</span>
                <span>
                  Capacidade:
                  <strong class="text-gray-700">
                    {{ formatNumber(unidadeDepositoSelecionada.capacidade_total) }}
                  </strong>
                </span>
                <span class="text-gray-300">|</span>
                <span>
                  Utilização:
                  <strong
                    :class="
                      (unidadeDepositoSelecionada.percentualUtilizado ?? 0) >= 90
                        ? 'text-red-600'
                        : (unidadeDepositoSelecionada.percentualUtilizado ?? 0) >= 70
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    "
                  >
                    {{ formatNumber(unidadeDepositoSelecionada.percentualUtilizado ?? 0, 1) }}%
                  </strong>
                </span>
              </div>
            </div>

            <!-- Produto -->
            <div class="md:col-span-6">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Produto</label>
              <BaseAutocomplete
                v-model="formData.idProduto"
                :options="produtosOptions"
                placeholder="Selecione o produto..."
                class="w-full"
              >
                <template #prefix>
                  <Package class="h-4 w-4 text-gray-400" />
                </template>
              </BaseAutocomplete>
            </div>

            <!-- Unidade de Medida -->
            <div class="md:col-span-4">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Unidade de Medida</label>
              <BaseAutocomplete
                v-model="formData.idUnidadeMedida"
                :options="unidadesOptions"
                placeholder="Selecione..."
                class="w-full"
              >
                <template #prefix>
                  <Ruler class="h-4 w-4 text-gray-400" />
                </template>
              </BaseAutocomplete>
            </div>

            <!-- Origem (Configurador Ciclo) -->
            <div class="md:col-span-4">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Origem (Ciclo)</label>
              <BaseAutocomplete
                v-model="formData.idOrigem"
                :options="configuradoresOptions"
                placeholder="Selecione..."
                class="w-full"
              >
                <template #prefix>
                  <MapPin class="h-4 w-4 text-gray-400" />
                </template>
              </BaseAutocomplete>
            </div>

            <!-- Motorista -->
            <div class="md:col-span-4">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Motorista</label>
              <BaseAutocomplete
                v-model="formData.idMotorista"
                :options="motoristasOptions"
                placeholder="Selecione..."
                class="w-full"
              >
                <template #prefix>
                  <Truck class="h-4 w-4 text-gray-400" />
                </template>
              </BaseAutocomplete>
            </div>

            <!-- Placa -->
            <div class="md:col-span-4">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Placa</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Truck class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="formData.placa"
                  type="text"
                  maxlength="20"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all uppercase placeholder-gray-400"
                  placeholder="ABC1D23"
                />
              </div>
            </div>

            <!-- Peso Bruto -->
            <div class="md:col-span-4">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Peso Bruto <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Weight class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="formData.peso_bruto"
                  type="number"
                  step="0.0001"
                  min="0"
                  required
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                />
              </div>
            </div>

            <!-- Peso Tara -->
            <div class="md:col-span-4">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Peso Tara <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Weight class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="formData.peso_tara"
                  type="number"
                  step="0.0001"
                  min="0"
                  required
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Section: Descontos -->
        <section>
          <button
            type="button"
            @click="showDescontos = !showDescontos"
            class="w-full text-base font-semibold text-gray-900 mb-4 flex items-center justify-between gap-2 border-b pb-2 hover:text-lime-700 transition-colors"
          >
            <span class="flex items-center gap-2">
              <Weight class="w-4 h-4 text-gray-500" />
              Descontos
              <span
                v-if="descontoTotalCalculado > 0"
                class="text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full"
              >
                Total: {{ formatNumber(descontoTotalCalculado) }}
              </span>
            </span>
            <ChevronDown
              v-if="!showDescontos"
              class="h-4 w-4 text-gray-400"
            />
            <ChevronUp v-else class="h-4 w-4 text-gray-400" />
          </button>

          <div v-if="showDescontos" class="grid grid-cols-2 md:grid-cols-4 gap-5">
            <!-- Umidade -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Umidade</label>
              <input
                v-model="formData.desconto_umidade"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
              />
            </div>

            <!-- Impureza -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Impureza</label>
              <input
                v-model="formData.desconto_impureza"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
              />
            </div>

            <!-- Avariados -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Avariados</label>
              <input
                v-model="formData.desconto_avariados"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
              />
            </div>

            <!-- Esverdeados -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Esverdeados</label>
              <input
                v-model="formData.desconto_esverdeados"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
              />
            </div>

            <!-- Quebra Técnica -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Quebra Técnica</label>
              <input
                v-model="formData.desconto_quebra_tecnica"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
              />
            </div>

            <!-- Taxa Recepção -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Taxa Recepção</label>
              <input
                v-model="formData.desconto_taxa_recepcao"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
              />
            </div>

            <!-- Total (calculado) -->
            <div class="col-span-2">
              <label class="block text-xs font-bold text-gray-700 mb-1.5">
                Desconto Total (calculado)
              </label>
              <input
                :value="formatNumber(descontoTotalCalculado)"
                type="text"
                disabled
                class="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-right font-medium text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        <!-- Peso Líquido Calculado -->
        <div class="bg-lime-50 border border-lime-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-lime-800">Peso Líquido</h4>
              <p class="text-xs text-lime-600 mt-1">
                Peso Bruto - Peso Tara - Descontos = Peso Líquido
              </p>
            </div>
            <div class="text-2xl font-bold text-lime-700">
              {{ pesoLiquidoCalculado.toFixed(4) }} {{ unidadeMedidaSelecionada }}
            </div>
          </div>
        </div>

        <!-- Section: Observações -->
        <section>
          <h3
            class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2"
          >
            <FileText class="w-4 h-4 text-gray-500" />
            Observações
          </h3>
          <textarea
            v-model="formData.observacoes"
            rows="3"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none placeholder-gray-400"
            placeholder="Insira observações adicionais aqui..."
          ></textarea>
        </section>
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
