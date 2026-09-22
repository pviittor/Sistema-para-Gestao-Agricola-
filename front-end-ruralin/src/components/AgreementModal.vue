<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Trash2, Calculator } from 'lucide-vue-next'
import BaseAutocomplete from '@/components/BaseAutocomplete.vue'
import type {
  Agreement,
  AgreementType,
  TermUnit,
  LoanType,
  RevenueSource,
  PaymentPeriod,
  AgreementLeaseTerm,
  AgreementPaymentSchedule,
  CreateAgreementCompletoDto,
  UpdateAgreementCompletoDto,
} from '@/types/Agreement'
import {
  AGREEMENT_TYPE_LABELS,
  LOAN_TYPE_LABELS,
  REVENUE_SOURCE_LABELS,
  LEASE_TERM_TYPE_LABELS,
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_PERIOD_LABELS,
  AMOUNT_RATE_LABELS,
  TERM_UNIT_LABELS,
} from '@/types/Agreement'
import { talhaoService } from '@/services/talhaoService'
import { parceiroNegocioService } from '@/services/parceiroNegocioService'
import type { Talhao } from '@/types/Talhao'

const props = defineProps<{
  isOpen: boolean
  initialData?: Agreement | null
  loading?: boolean
  fazendaId: number
}>()

const emit = defineEmits<{
  close: []
  save: [payload: CreateAgreementCompletoDto | UpdateAgreementCompletoDto]
}>()

const today = () => new Date().toISOString().slice(0, 10)

interface FormData {
  agreementType: AgreementType
  notes: string
  ativo: boolean
  startDate: string
  termLength: number | null
  termUnit: TermUnit
  lenderName: string
  loanType: LoanType | ''
  originalBalance: number | null
  interestRate: number | null
  startYear: number | null
  endYear: number | null
  idArrendador: number | null
  revenueSource: RevenueSource | ''
  leaseTerms: AgreementLeaseTerm[]
  paymentSchedules: AgreementPaymentSchedule[]
}

const defaultForm = (): FormData => ({
  agreementType: 'LOAN',
  notes: '',
  ativo: true,
  startDate: today(),
  termLength: null,
  termUnit: 'YEAR',
  lenderName: '',
  loanType: '',
  originalBalance: null,
  interestRate: null,
  startYear: new Date().getFullYear(),
  endYear: new Date().getFullYear() + 1,
  idArrendador: null,
  revenueSource: '',
  leaseTerms: [],
  paymentSchedules: [],
})

const formData = ref<FormData>(defaultForm())
const selectedFieldIds = ref<number[]>([])
const talhoes = ref<Talhao[]>([])
const pessoaOptions = ref<{ value: number; label: string }[]>([])

const filteredTalhoes = computed(() =>
  talhoes.value.filter((t) => t.idFazenda === props.fazendaId),
)

const leaseDuration = computed(() => {
  if (formData.value.startYear && formData.value.endYear) {
    const diff = formData.value.endYear - formData.value.startYear
    return diff > 0 ? `Duração: ${diff} ano${diff > 1 ? 's' : ''} agrícola${diff > 1 ? 's' : ''}` : ''
  }
  return ''
})

const isEditing = computed(() => !!props.initialData?.id)

/**
 * Sugestão de valor de parcela usando Tabela Price (PMT).
 * PMT = PV * [i * (1+i)^n] / [(1+i)^n - 1]
 *
 * Número de parcelas é derivado do prazo (termLength/termUnit):
 * - termUnit=MONTH → n = termLength parcelas mensais
 * - termUnit=YEAR  → n = termLength * 12 parcelas mensais, ou termLength parcelas anuais
 *
 * Se houver agenda de pagamento, usa o intervalo/período dela para ajustar.
 * Caso contrário, assume parcelas mensais.
 */
const suggestedInstallment = computed<{ value: number; parcelas: number; periodo: string } | null>(() => {
  const fd = formData.value
  if (fd.agreementType !== 'LOAN') return null
  if (!fd.originalBalance || fd.originalBalance <= 0) return null
  if (!fd.termLength || fd.termLength <= 0) return null

  // Prazo total em meses
  const totalMeses = fd.termUnit === 'YEAR' ? fd.termLength * 12 : fd.termLength

  // Determina periodicidade da parcela
  const ps = fd.paymentSchedules[0]
  const payPeriod: PaymentPeriod = ps?.paymentPeriod || 'MONTH'
  const payInterval = ps?.paymentInterval || 1

  // Intervalo entre parcelas em meses
  const intervaloMeses = payPeriod === 'YEAR' ? payInterval * 12 : payInterval
  if (intervaloMeses <= 0) return null

  const n = Math.floor(totalMeses / intervaloMeses)
  if (n <= 0) return null

  const pv = fd.originalBalance
  const periodoLabel = payPeriod === 'YEAR'
    ? (payInterval === 1 ? 'anual' : `a cada ${payInterval} anos`)
    : (payInterval === 1 ? 'mensal' : `a cada ${payInterval} meses`)

  // Sem juros: divisão simples
  if (!fd.interestRate || fd.interestRate <= 0) {
    return { value: Math.round((pv / n) * 100) / 100, parcelas: n, periodo: periodoLabel }
  }

  // Taxa anual → taxa por período de parcela
  const taxaAnual = fd.interestRate / 100
  const periodosAno = 12 / intervaloMeses
  const i = Math.pow(1 + taxaAnual, 1 / periodosAno) - 1

  const factor = Math.pow(1 + i, n)
  const pmt = pv * (i * factor) / (factor - 1)

  if (!isFinite(pmt) || isNaN(pmt)) return null
  return { value: Math.round(pmt * 100) / 100, parcelas: n, periodo: periodoLabel }
})

function applySuggestedInstallment() {
  if (!suggestedInstallment.value) return

  if (formData.value.paymentSchedules.length === 0) {
    addPaymentSchedule()
  }

  formData.value.paymentSchedules[0]!.amount = suggestedInstallment.value.value
}

function resetForm() {
  formData.value = defaultForm()
  selectedFieldIds.value = []
}

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.initialData) {
        populateForm(props.initialData)
      } else {
        resetForm()
      }
    }
  },
)

watch(
  () => formData.value.agreementType,
  () => {
    // Reset type-specific fields when type changes (only for new agreements)
    if (!props.initialData) {
      formData.value.lenderName = ''
      formData.value.loanType = ''
      formData.value.originalBalance = null
      formData.value.interestRate = null
      formData.value.startYear = new Date().getFullYear()
      formData.value.endYear = new Date().getFullYear() + 1
      formData.value.idArrendador = null
      formData.value.revenueSource = ''
      formData.value.leaseTerms = []
    }
  },
)

function populateForm(data: Agreement) {
  formData.value = {
    agreementType: data.agreementType,
    notes: data.notes || '',
    ativo: data.ativo !== false,
    startDate: data.startDate || today(),
    termLength: data.termLength ?? null,
    termUnit: data.termUnit || 'YEAR',
    lenderName: data.lenderName || '',
    loanType: (data.loanType as LoanType) || '',
    originalBalance: data.originalBalance ?? null,
    interestRate: data.interestRate ?? null,
    startYear: data.startYear ?? new Date().getFullYear(),
    endYear: data.endYear ?? new Date().getFullYear() + 1,
    idArrendador: data.idArrendador ?? null,
    revenueSource: (data.revenueSource as RevenueSource) || '',
    leaseTerms: data.leaseTerms ? JSON.parse(JSON.stringify(data.leaseTerms)) : [],
    paymentSchedules: data.paymentSchedules ? JSON.parse(JSON.stringify(data.paymentSchedules)) : [],
  }
  selectedFieldIds.value = data.agreementFields?.map((f) => f.fieldId) || []
}

function addLeaseTerm() {
  formData.value.leaseTerms.push({
    termType: 'BASE_RENT',
    expenseCategory: null,
    tenantCostAllocation: null,
  })
}

function removeLeaseTerm(index: number) {
  formData.value.leaseTerms.splice(index, 1)
}

function addPaymentSchedule() {
  formData.value.paymentSchedules.push({
    paymentInterval: 1,
    paymentPeriod: 'MONTH',
    paymentDay: 1,
    amount: 0,
    amountRate: 'TOTAL',
    startDate: today(),
    endDate: null,
  })
}

function removePaymentSchedule(index: number) {
  formData.value.paymentSchedules.splice(index, 1)
}

function toggleField(fieldId: number) {
  const idx = selectedFieldIds.value.indexOf(fieldId)
  if (idx >= 0) {
    selectedFieldIds.value.splice(idx, 1)
  } else {
    selectedFieldIds.value.push(fieldId)
  }
}

function handleSave() {
  if (selectedFieldIds.value.length === 0) {
    toast.warning('Selecione pelo menos um talhão.')
    return
  }

  if (formData.value.agreementType === 'RENT_LEASE' && formData.value.leaseTerms.length === 0) {
    toast.warning('Adicione pelo menos um termo de arrendamento.')
    return
  }

  const fd = formData.value
  const payload: CreateAgreementCompletoDto = {
    fazendaId: props.fazendaId,
    agreementType: fd.agreementType,
    notes: fd.notes || null,
    ativo: fd.ativo,
    fieldIds: selectedFieldIds.value,
  }

  // LOAN + NON_CROP_REVENUE shared fields
  if (fd.agreementType === 'LOAN' || fd.agreementType === 'NON_CROP_REVENUE') {
    payload.startDate = fd.startDate || null
    payload.termLength = fd.termLength
    payload.termUnit = fd.termUnit
  }

  // LOAN-specific
  if (fd.agreementType === 'LOAN') {
    payload.lenderName = fd.lenderName || null
    payload.loanType = (fd.loanType as LoanType) || null
    payload.originalBalance = fd.originalBalance
    payload.interestRate = fd.interestRate
  }

  // RENT_LEASE-specific
  if (fd.agreementType === 'RENT_LEASE') {
    payload.startYear = fd.startYear
    payload.endYear = fd.endYear
    payload.idArrendador = fd.idArrendador
    payload.leaseTerms = fd.leaseTerms.map((t) => ({
      termType: t.termType,
      expenseCategory: t.expenseCategory || null,
      tenantCostAllocation: t.tenantCostAllocation ?? null,
    }))
  }

  // NON_CROP_REVENUE-specific
  if (fd.agreementType === 'NON_CROP_REVENUE') {
    payload.revenueSource = (fd.revenueSource as RevenueSource) || null
  }

  // Payment schedules (all types)
  if (fd.paymentSchedules.length > 0) {
    payload.paymentSchedules = fd.paymentSchedules.map((ps) => ({
      paymentInterval: ps.paymentInterval,
      paymentPeriod: ps.paymentPeriod,
      paymentDay: ps.paymentDay,
      amount: ps.amount,
      amountRate: ps.amountRate,
      startDate: ps.startDate,
      endDate: ps.endDate || null,
    }))
  }

  emit('save', payload)
}

async function fetchTalhoes() {
  try {
    const res = await talhaoService.getAll(1, 1000)
    talhoes.value = res.data
  } catch {
    toast.error('Erro ao carregar talhões.')
  }
}

async function fetchPessoas() {
  try {
    const res = await parceiroNegocioService.getAll(1, 1000)
    pessoaOptions.value = res.data.map((p) => ({
      value: p.id_pessoa!,
      label: p.nomerazao_pessoa || p.nomefantasia_pessoa || '',
    }))
  } catch {
    toast.error('Erro ao carregar pessoas.')
  }
}

onMounted(() => {
  fetchTalhoes()
  fetchPessoas()
})

// Type selector card colors
const typeCardClasses: Record<AgreementType, { active: string; inactive: string; radio: string }> = {
  LOAN: {
    active: 'border-blue-400 bg-blue-50 text-blue-700',
    inactive: 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
    radio: 'text-blue-600 focus:ring-blue-500',
  },
  RENT_LEASE: {
    active: 'border-amber-400 bg-amber-50 text-amber-700',
    inactive: 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
    radio: 'text-amber-600 focus:ring-amber-500',
  },
  NON_CROP_REVENUE: {
    active: 'border-green-400 bg-green-50 text-green-700',
    inactive: 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
    radio: 'text-green-600 focus:ring-green-500',
  },
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800">
          {{ isEditing ? 'Editar Acordo' : 'Novo Acordo' }}
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Agreement Type Selector -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipo do Acordo <span class="text-red-500">*</span></label>
          <div class="flex flex-wrap gap-3">
            <label
              v-for="(label, key) in AGREEMENT_TYPE_LABELS"
              :key="key"
              class="flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all"
              :class="
                formData.agreementType === key
                  ? typeCardClasses[key as AgreementType].active
                  : typeCardClasses[key as AgreementType].inactive
              "
            >
              <input
                type="radio"
                v-model="formData.agreementType"
                :value="key"
                :class="typeCardClasses[key as AgreementType].radio"
              />
              <span class="text-sm font-medium">{{ label }}</span>
            </label>
          </div>
        </div>

        <!-- Common: Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            v-model="formData.notes"
            rows="2"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none"
            placeholder="Observações opcionais..."
          ></textarea>
        </div>

        <!-- Common: Ativo -->
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="formData.ativo" id="ativo" class="rounded text-lime-600 focus:ring-lime-500" />
          <label for="ativo" class="text-sm text-gray-700">Ativo</label>
        </div>

        <!-- ==================== LOAN Section ==================== -->
        <section v-if="formData.agreementType === 'LOAN'" class="space-y-4">
          <h3 class="text-sm font-semibold text-blue-700 border-b border-blue-100 pb-1">Dados do Empréstimo</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data Início <span class="text-red-500">*</span></label>
              <input
                v-model="formData.startDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
            </div>
            <div class="flex gap-2">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">Prazo <span class="text-red-500">*</span></label>
                <input
                  v-model.number="formData.termLength"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
              </div>
              <div class="w-28">
                <label class="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                <select
                  v-model="formData.termUnit"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                >
                  <option v-for="(label, key) in TERM_UNIT_LABELS" :key="key" :value="key">{{ label }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Credor <span class="text-red-500">*</span></label>
              <input
                v-model="formData.lenderName"
                type="text"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                placeholder="Nome do credor..."
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Empréstimo <span class="text-red-500">*</span></label>
              <select
                v-model="formData.loanType"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option value="" disabled>Selecione...</option>
                <option v-for="(label, key) in LOAN_TYPE_LABELS" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Saldo Original <span class="text-red-500">*</span></label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                <input
                  v-model.number="formData.originalBalance"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Taxa de Juros <span class="text-red-500">*</span></label>
              <div class="relative">
                <input
                  v-model.number="formData.interestRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  class="w-full pr-8 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
            </div>
          </div>

          <!-- Sugestão de parcela calculada -->
          <div
            v-if="suggestedInstallment"
            class="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <Calculator class="w-5 h-5 text-blue-500 shrink-0" />
            <div class="flex-1 text-sm text-blue-700">
              <span class="font-medium">Parcela sugerida (Price):</span>
              {{ suggestedInstallment.parcelas }}x {{ suggestedInstallment.periodo }} de
              <span class="font-semibold">{{ suggestedInstallment.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</span>
            </div>
            <button
              type="button"
              @click="applySuggestedInstallment"
              class="shrink-0 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </section>

        <!-- ==================== RENT_LEASE Section ==================== -->
        <section v-if="formData.agreementType === 'RENT_LEASE'" class="space-y-4">
          <h3 class="text-sm font-semibold text-amber-700 border-b border-amber-100 pb-1">Dados do Arrendamento</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ano Início <span class="text-red-500">*</span></label>
              <input
                v-model.number="formData.startYear"
                type="number"
                min="1900"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ano Fim <span class="text-red-500">*</span></label>
              <input
                v-model.number="formData.endYear"
                type="number"
                min="1900"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
            </div>
          </div>
          <p v-if="leaseDuration" class="text-sm text-amber-600 font-medium">{{ leaseDuration }}</p>

          <div class="max-w-md">
            <BaseAutocomplete
              v-model="formData.idArrendador"
              :options="pessoaOptions"
              label="Arrendador"
              placeholder="Selecione o arrendador..."
              :required="true"
            />
          </div>

          <!-- Lease Terms -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700">Termos do Arrendamento <span class="text-red-500">*</span></label>
              <button
                type="button"
                @click="addLeaseTerm"
                class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-lime-700 bg-lime-50 border border-lime-200 rounded-lg hover:bg-lime-100 transition-colors"
              >
                <Plus class="w-3.5 h-3.5" />
                Adicionar Termo
              </button>
            </div>
            <div v-if="formData.leaseTerms.length > 0" class="border border-gray-200 rounded-lg overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500">Tipo</th>
                    <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500">Cat. Despesa</th>
                    <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500">Alocação (%)</th>
                    <th class="w-10"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="(term, idx) in formData.leaseTerms" :key="idx">
                    <td class="px-3 py-2">
                      <select
                        v-model="term.termType"
                        class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                      >
                        <option v-for="(label, key) in LEASE_TERM_TYPE_LABELS" :key="key" :value="key">{{ label }}</option>
                      </select>
                    </td>
                    <td class="px-3 py-2">
                      <select
                        v-if="term.termType === 'EXPENSE_SHARE'"
                        v-model="term.expenseCategory"
                        class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                      >
                        <option :value="null" disabled>Selecione...</option>
                        <option v-for="(label, key) in EXPENSE_CATEGORY_LABELS" :key="key" :value="key">{{ label }}</option>
                      </select>
                      <span v-else class="text-gray-400 text-xs">-</span>
                    </td>
                    <td class="px-3 py-2">
                      <div class="relative">
                        <input
                          v-model.number="term.tenantCostAllocation"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          class="w-full pr-6 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                        />
                        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </td>
                    <td class="px-3 py-2 text-center">
                      <button @click="removeLeaseTerm(idx)" class="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-xs text-gray-400 mt-1">Nenhum termo adicionado.</p>
          </div>
        </section>

        <!-- ==================== NON_CROP_REVENUE Section ==================== -->
        <section v-if="formData.agreementType === 'NON_CROP_REVENUE'" class="space-y-4">
          <h3 class="text-sm font-semibold text-green-700 border-b border-green-100 pb-1">Dados da Receita Não-Agrícola</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data Início <span class="text-red-500">*</span></label>
              <input
                v-model="formData.startDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
            </div>
            <div class="flex gap-2">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">Prazo <span class="text-red-500">*</span></label>
                <input
                  v-model.number="formData.termLength"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
              </div>
              <div class="w-28">
                <label class="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                <select
                  v-model="formData.termUnit"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                >
                  <option v-for="(label, key) in TERM_UNIT_LABELS" :key="key" :value="key">{{ label }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fonte de Receita <span class="text-red-500">*</span></label>
              <select
                v-model="formData.revenueSource"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option value="" disabled>Selecione...</option>
                <option v-for="(label, key) in REVENUE_SOURCE_LABELS" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
          </div>
        </section>

        <!-- ==================== Payment Schedules (all types) ==================== -->
        <section class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">Agenda de Pagamentos</label>
            <button
              type="button"
              @click="addPaymentSchedule"
              class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-lime-700 bg-lime-50 border border-lime-200 rounded-lg hover:bg-lime-100 transition-colors"
            >
              <Plus class="w-3.5 h-3.5" />
              Adicionar Pagamento
            </button>
          </div>
          <div v-if="formData.paymentSchedules.length > 0" class="border border-gray-200 rounded-lg overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500">Intervalo</th>
                  <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500">Período</th>
                  <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500">Dia Pgto</th>
                  <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500">Valor</th>
                  <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500">Tipo Valor</th>
                  <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500">Início</th>
                  <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500">Fim</th>
                  <th class="w-10"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(ps, idx) in formData.paymentSchedules" :key="idx">
                  <td class="px-3 py-2">
                    <input
                      v-model.number="ps.paymentInterval"
                      type="number"
                      min="1"
                      class="w-20 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                  </td>
                  <td class="px-3 py-2">
                    <select
                      v-model="ps.paymentPeriod"
                      class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    >
                      <option v-for="(label, key) in PAYMENT_PERIOD_LABELS" :key="key" :value="key">{{ label }}</option>
                    </select>
                  </td>
                  <td class="px-3 py-2">
                    <input
                      v-model.number="ps.paymentDay"
                      type="number"
                      min="1"
                      max="31"
                      class="w-16 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                  </td>
                  <td class="px-3 py-2">
                    <div class="relative">
                      <span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">R$</span>
                      <input
                        v-model.number="ps.amount"
                        type="number"
                        min="0"
                        step="0.01"
                        class="w-28 pl-7 pr-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                      />
                    </div>
                  </td>
                  <td class="px-3 py-2">
                    <select
                      v-model="ps.amountRate"
                      class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    >
                      <option v-for="(label, key) in AMOUNT_RATE_LABELS" :key="key" :value="key">{{ label }}</option>
                    </select>
                  </td>
                  <td class="px-3 py-2">
                    <input
                      v-model="ps.startDate"
                      type="date"
                      class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                  </td>
                  <td class="px-3 py-2">
                    <input
                      v-model="ps.endDate"
                      type="date"
                      class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                  </td>
                  <td class="px-3 py-2 text-center">
                    <button @click="removePaymentSchedule(idx)" class="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-xs text-gray-400">Nenhum pagamento adicionado.</p>
        </section>

        <!-- ==================== Fields / Talhões ==================== -->
        <section>
          <label class="block text-sm font-medium text-gray-700 mb-2">Talhões <span class="text-red-500">*</span></label>
          <div v-if="filteredTalhoes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-1">
            <label
              v-for="talhao in filteredTalhoes"
              :key="talhao.id_talhao"
              class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all"
              :class="
                selectedFieldIds.includes(talhao.id_talhao!)
                  ? 'border-lime-500 bg-lime-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              "
            >
              <input
                type="checkbox"
                :checked="selectedFieldIds.includes(talhao.id_talhao!)"
                @change="toggleField(talhao.id_talhao!)"
                class="rounded text-lime-600 focus:ring-lime-500"
              />
              <div>
                <span class="text-sm font-medium text-gray-700">{{ talhao.descricao }}</span>
                <span v-if="talhao.area" class="text-xs text-gray-400 ml-1">({{ talhao.area }} ha)</span>
              </div>
            </label>
          </div>
          <p v-else class="text-xs text-gray-400">Nenhum talhão disponível para esta fazenda.</p>
        </section>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="handleSave"
          :disabled="loading"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-lime-600 rounded-lg hover:bg-lime-700 transition-colors disabled:opacity-50"
        >
          <div v-if="loading" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          Salvar
        </button>
      </div>
    </div>
  </div>
</template>
