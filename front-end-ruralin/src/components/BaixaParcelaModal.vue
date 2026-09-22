<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  X,
  Save,
  DollarSign,
  Calendar,
  AlertTriangle,
  Info,
  Banknote,
} from 'lucide-vue-next'
import type { ParcelaTituloPagar, BaixaParcelaDto } from '@/types/TituloPagar'
import type { ParcelaTituloReceber } from '@/types/TituloReceber'

const props = defineProps<{
  isOpen: boolean
  parcela?: ParcelaTituloPagar | ParcelaTituloReceber | null
  tipo?: 'PAGAR' | 'RECEBER'
  loading?: boolean
  contasOptions?: Array<{ value: number; label: string }>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: BaixaParcelaDto): void
}>()

const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

const today = (): string => new Date().toISOString().split('T')[0]!

const valorDesconto = ref(0)
const valorPagamento = ref(0)
const dataPagamento = ref<string>(today())
const idConta = ref<number | null>(null)
const observacao = ref('')

const statusLabel = computed(() => {
  if (!props.parcela) return ''
  const map: Record<string, string> = {
    ABERTA: 'Aberta',
    PARCIAL: 'Parcial',
    BAIXADA: 'Baixada',
    CANCELADA: 'Cancelada',
  }
  return map[props.parcela.status] || props.parcela.status
})

const statusColor = computed(() => {
  if (!props.parcela) return 'bg-gray-100 text-gray-600'
  const map: Record<string, string> = {
    ABERTA: 'bg-blue-100 text-blue-700',
    PARCIAL: 'bg-yellow-100 text-yellow-700',
    BAIXADA: 'bg-green-100 text-green-700',
    CANCELADA: 'bg-red-100 text-red-700',
  }
  return map[props.parcela.status] || 'bg-gray-100 text-gray-600'
})

const tipoLabel = computed(() =>
  props.tipo === 'RECEBER' ? 'Recebimento' : 'Pagamento'
)

const valorPendente = computed(() => {
  if (!props.parcela) return 0
  const valorParcela = Number(props.parcela.valorParcela) || 0
  const valorBaixa = Number(props.parcela.valorBaixa) || 0
  return Math.max(0, Math.round((valorParcela - valorBaixa) * 100) / 100)
})

const valorTotalComAcrescimos = computed(() => {
  if (!props.parcela) return 0
  return (
    valorPendente.value +
    (Number(props.parcela.valorJuros) || 0) +
    (Number(props.parcela.valorMulta) || 0) +
    (Number(props.parcela.valorCorrecao) || 0) -
    (Number(valorDesconto.value) || 0)
  )
})

const saldoRemanescente = computed(() => {
  if (!props.parcela) return 0
  return Math.max(0, valorTotalComAcrescimos.value - valorPagamento.value)
})

const isBaixaParcial = computed(() => {
  if (!props.parcela) return false
  return valorPagamento.value < valorTotalComAcrescimos.value
})

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal && props.parcela) {
      valorDesconto.value = Number(props.parcela.valorDesconto) || 0
      const parcVal = Number(props.parcela.valorParcela) || 0
      const baixaVal = Number(props.parcela.valorBaixa) || 0
      valorPagamento.value = Math.max(0, Math.round((parcVal - baixaVal) * 100) / 100)
      dataPagamento.value = today()
      idConta.value = props.parcela.idConta || null
      observacao.value = ''
    }
  },
)

const canSave = computed(() => {
  return (
    valorPagamento.value > 0 &&
    dataPagamento.value &&
    !props.loading
  )
})

const handleSave = () => {
  if (!canSave.value || !props.parcela) return

  const data: BaixaParcelaDto = {
    idParcela: props.parcela.id,
    tipo: props.tipo || 'PAGAR',
    dataBaixa: dataPagamento.value,
    valorBaixa: valorPagamento.value,
    observacao: observacao.value || undefined,
  }

  emit('save', data)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="emit('close')"
    >
      <div
        class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-lime-50"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-lime-600 rounded-lg">
              <Banknote class="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-800">
                Baixa de Parcela
              </h2>
              <p class="text-sm text-gray-500">
                {{ tipoLabel }} de parcela
              </p>
            </div>
          </div>
          <button
            class="p-2 rounded-lg hover:bg-gray-100 transition"
            @click="emit('close')"
          >
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div class="p-6 space-y-6" v-if="parcela">
          <!-- Informacoes da Parcela (readonly) -->
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Info class="w-4 h-4 text-gray-400" />
              Informacoes da Parcela
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span class="text-xs text-gray-500 block">Titulo</span>
                <span class="text-sm font-medium text-gray-800">
                  #{{ props.tipo === 'RECEBER' ? (parcela as ParcelaTituloReceber).idTituloReceber : (parcela as ParcelaTituloPagar).idTituloPagar }}
                </span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">Parcela</span>
                <span class="text-sm font-medium text-gray-800">
                  {{ parcela.numeroParcela }}/{{ parcela.numeroTotalParcelas }}
                </span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">Vencimento</span>
                <span class="text-sm font-medium text-gray-800">
                  {{ formatDate(parcela.dataVencimento) }}
                </span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">Status</span>
                <span
                  class="text-xs font-medium px-2 py-0.5 rounded-full"
                  :class="statusColor"
                >
                  {{ statusLabel }}
                </span>
              </div>
            </div>
          </div>

          <!-- Valores -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <DollarSign class="w-4 h-4 text-gray-400" />
              Valores
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Valor da Parcela (readonly) -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">
                  Valor da Parcela
                </label>
                <div class="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 font-medium">
                  {{ formatCurrency(parcela.valorParcela) }}
                </div>
              </div>

              <!-- Valor Juros (readonly) -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">
                  Valor Juros
                </label>
                <div class="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 font-medium">
                  {{ formatCurrency(parcela.valorJuros) }}
                </div>
                <span class="text-xs text-gray-400 mt-0.5 block">
                  Calculado automaticamente
                </span>
              </div>

              <!-- Valor Multa (readonly) -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">
                  Valor Multa
                </label>
                <div class="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 font-medium">
                  {{ formatCurrency(parcela.valorMulta) }}
                </div>
              </div>

              <!-- Valor Correcao (readonly) -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">
                  Valor Correcao
                </label>
                <div class="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 font-medium">
                  {{ formatCurrency(parcela.valorCorrecao) }}
                </div>
              </div>

              <!-- Valor Desconto (editable) -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">
                  Valor Desconto
                </label>
                <input
                  v-model.number="valorDesconto"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none"
                  placeholder="0,00"
                />
              </div>

              <!-- Valor a Pagar (editable) -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">
                  Valor a Pagar <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="valorPagamento"
                  type="number"
                  step="0.01"
                  min="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none"
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          <!-- Data e Conta -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">
                <Calendar class="w-3.5 h-3.5 inline mr-1" />
                Data do Pagamento <span class="text-red-500">*</span>
              </label>
              <input
                v-model="dataPagamento"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">
                Conta <span class="text-red-500">*</span>
              </label>
              <select
                v-model="idConta"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none"
              >
                <option :value="null" disabled>Selecione uma conta</option>
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

          <!-- Observacao -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">
              Observacao
            </label>
            <textarea
              v-model="observacao"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none resize-none"
              placeholder="Observacoes sobre a baixa..."
            />
          </div>

          <!-- Summary -->
          <div class="bg-lime-50 rounded-lg p-4 border border-lime-200">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Resumo</h3>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Valor Total</span>
                <span class="font-medium text-gray-800">
                  {{ formatCurrency(valorTotalComAcrescimos) }}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Valor Pago</span>
                <span class="font-medium text-lime-700">
                  {{ formatCurrency(valorPagamento) }}
                </span>
              </div>
              <div class="border-t border-lime-200 my-2" />
              <div class="flex justify-between text-sm font-semibold">
                <span class="text-gray-700">Saldo Remanescente</span>
                <span
                  :class="saldoRemanescente > 0 ? 'text-amber-600' : 'text-green-600'"
                >
                  {{ formatCurrency(saldoRemanescente) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Partial payment warning -->
          <div
            v-if="isBaixaParcial"
            class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4"
          >
            <AlertTriangle class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-amber-800">
                Esta e uma baixa parcial
              </p>
              <p class="text-xs text-amber-600 mt-0.5">
                A parcela ficara com status PARCIAL.
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50"
        >
          <button
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            @click="emit('close')"
          >
            Cancelar
          </button>
          <button
            class="px-4 py-2 text-sm font-medium text-white bg-lime-600 rounded-lg hover:bg-lime-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            :disabled="!canSave"
            @click="handleSave"
          >
            <Save class="w-4 h-4" />
            {{ loading ? 'Processando...' : 'Confirmar Baixa' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
