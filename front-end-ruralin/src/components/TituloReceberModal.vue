<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  X,
  Save,
  FileText,
  Calendar,
  DollarSign,
  User,
  Hash,
  Percent,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Calculator,
  Plus,
  Trash2,
  Scale
} from 'lucide-vue-next'
import type { TituloReceber } from '@/types/TituloReceber'
import type {
  TipoGeracao,
  IndiceCorrecao,
  ModeloJuros
} from '@/types/TituloPagar'
import type { ParceiroNegocio } from '@/types/ParceiroNegocio'
import type { Propriedade } from '@/types/Propriedade'
import type { Safra } from '@/types/Safra'
import type { Talhao } from '@/types/Talhao'
import type { Moeda } from '@/types/Moeda'
import BaseAutocomplete from '@/components/BaseAutocomplete.vue'
import { toast } from 'vue3-toastify'
import { parceiroNegocioService } from '@/services/parceiroNegocioService'
import { propriedadeService } from '@/services/propriedadeService'
import { safraService } from '@/services/safraService'
import { talhaoService } from '@/services/talhaoService'
import { moedaService } from '@/services/moedaService'
import { planoContaGerencialService } from '@/services/PlanoContaGerencialService'
import type { PlanoContaGerencial } from '@/types/PlanoContaGerencial'

interface OptionItem {
  value: number
  label: string
}

const props = defineProps<{
  isOpen: boolean
  initialData?: TituloReceber | null
  loading?: boolean
}>()

// Lookup options (self-loaded)
const clientesOptions = ref<OptionItem[]>([])
const portadoresOptions = ref<OptionItem[]>([])
const produtoresOptions = ref<OptionItem[]>([])
const fazendasOptions = ref<OptionItem[]>([])
const safrasOptions = ref<OptionItem[]>([])
const talhoesOptions = ref<OptionItem[]>([])
const moedasOptions = ref<OptionItem[]>([])
const planosContaOptions = ref<OptionItem[]>([])
const lookupsLoaded = ref(false)

// Rateio por Plano de Conta
interface RateioItem {
  idPlanoContaGerencial: number | null
  valorRateio: number
  percentualRateio: number
}
const rateiosPlanoConta = ref<RateioItem[]>([])

const addRateio = () => {
  rateiosPlanoConta.value.push({ idPlanoContaGerencial: null, valorRateio: 0, percentualRateio: 0 })
}
const removeRateio = (index: number) => {
  rateiosPlanoConta.value.splice(index, 1)
}
const recalcRateioPercentual = (index: number) => {
  const total = formData.value.valorTitulo
  if (total > 0) {
    rateiosPlanoConta.value[index]!.percentualRateio =
      Math.round((rateiosPlanoConta.value[index]!.valorRateio / total) * 10000) / 100
  }
}
const recalcRateioValor = (index: number) => {
  const total = formData.value.valorTitulo
  rateiosPlanoConta.value[index]!.valorRateio =
    Math.round((rateiosPlanoConta.value[index]!.percentualRateio / 100) * total * 100) / 100
}
const distribuirRateioIgual = () => {
  const n = rateiosPlanoConta.value.length
  if (n === 0) return
  const total = formData.value.valorTitulo
  const valorCada = Math.floor((total / n) * 100) / 100
  const percCada = Math.round((100 / n) * 100) / 100
  rateiosPlanoConta.value.forEach((r, i) => {
    r.valorRateio = i === n - 1 ? Math.round((total - valorCada * (n - 1)) * 100) / 100 : valorCada
    r.percentualRateio = i === n - 1 ? Math.round((100 - percCada * (n - 1)) * 100) / 100 : percCada
  })
}
const totalRateio = computed(() =>
  Math.round(rateiosPlanoConta.value.reduce((s, r) => s + (Number(r.valorRateio) || 0), 0) * 100) / 100
)
const totalRateioPercentual = computed(() =>
  Math.round(rateiosPlanoConta.value.reduce((s, r) => s + (Number(r.percentualRateio) || 0), 0) * 100) / 100
)
const rateioValido = computed(() =>
  rateiosPlanoConta.value.length === 0 ||
  Math.abs(totalRateio.value - formData.value.valorTitulo) < 0.02
)

const fetchLookups = async () => {
  if (lookupsLoaded.value) return
  try {
    const [pessoasRes, fazendasRes, safrasRes, talhoesRes, moedasRes, planosRes] = await Promise.all([
      parceiroNegocioService.getAllNoPagination(),
      propriedadeService.getAll(1, 1000),
      safraService.getAll(1, 1000),
      talhaoService.getAll(1, 1000),
      moedaService.getAll(1, 1000),
      planoContaGerencialService.getAll(1, 1000),
    ])

    // Pessoas — getAllNoPagination returns wrapped { success, data: { data } } or direct array
    const pessoasData: ParceiroNegocio[] = Array.isArray(pessoasRes) ? pessoasRes
      : (pessoasRes as any)?.data?.data || (pessoasRes as any)?.data || []

    const toOption = (p: ParceiroNegocio): OptionItem => ({
      value: p.id_pessoa!,
      label: p.cpfcnpj_pessoa
        ? `${p.nomerazao_pessoa} · ${p.cpfcnpj_pessoa}`
        : (p.nomerazao_pessoa ?? ''),
    })

    clientesOptions.value = pessoasData.filter((p) => p.cliente_pessoa).map(toOption)
    portadoresOptions.value = pessoasData.filter((p) => p.portador_pessoa).map(toOption)
    produtoresOptions.value = pessoasData.filter((p) => p.produtor_pessoa).map(toOption)

    // Fazendas — getAll returns wrapped { success, data: { data } }
    const fazendasData = (fazendasRes as any)?.data?.data || (fazendasRes as any)?.data || []
    fazendasOptions.value = fazendasData.map((f: Propriedade) => ({
      value: f.id!,
      label: f.descricao,
    }))

    // Safras — getAll returns wrapped { success, data: { data } }
    const safrasData = (safrasRes as any)?.data?.data || (safrasRes as any)?.data || []
    safrasOptions.value = safrasData.map((s: Safra) => ({
      value: s.id!,
      label: s.nome,
    }))

    // Talhoes
    const talhoesData = (talhoesRes as any)?.data?.data || (talhoesRes as any)?.data || []
    talhoesOptions.value = talhoesData.map((t: Talhao) => ({
      value: t.id_talhao!,
      label: t.descricao,
    }))

    // Moedas
    const moedasData = (moedasRes as any)?.data?.data || (moedasRes as any)?.data || []
    moedasOptions.value = moedasData.map((m: Moeda) => ({
      value: m.id_moeda!,
      label: `${m.siglabc_moeda} - ${m.descricao_moeda}`,
    }))

    // Planos de Conta Gerencial — apenas ANALITICA
    const planosData: PlanoContaGerencial[] = (planosRes as any)?.data?.data || (planosRes as any)?.data || []
    planosContaOptions.value = planosData
      .filter((p) => p.tipo === 'ANALITICA' && p.ativo)
      .map((p) => ({
        value: p.id!,
        label: `${p.item} - ${p.descricao}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))

    lookupsLoaded.value = true
  } catch (error) {
    console.error('Erro ao carregar dados dos selects:', error)
    toast.error('Erro ao carregar dados do formulário')
  }
}

const emit = defineEmits(['close', 'save'])

// Form data
const formData = ref({
  numeroTitulo: '',
  idCliente: null as number | null,
  idPortador: null as number | null,
  idProdutor: null as number | null,
  idFazenda: null as number | null,
  idSafra: null as number | null,
  idTalhao: null as number | null,
  idMoeda: null as number | null,
  dataLancamento: new Date().toISOString().split('T')[0] ?? '',
  valorTitulo: 0,
  observacao: '',
  impostoRenda: false,
  // Parcelamento
  tipoGeracao: 'MANUAL' as TipoGeracao,
  quantidadeParcelas: 1,
  dataPrimeiraParcela: '' as string,
  intervaloParcelasDias: 30,
  modeloJuros: 'SIMPLES' as ModeloJuros,
  taxaJurosAm: 0,
  indiceCorrecao: 'NENHUM' as IndiceCorrecao,
  taxaCorrecaoFixaAm: 0,
  taxaMulta: 0
})

// UI state
const parcelar = ref(false)
const rateioAberto = ref(false)
const valorDisplay = ref('')

// Computed
const isEditing = computed(() => !!props.initialData?.id)

const modalTitle = computed(() =>
  isEditing.value ? 'Editar Titulo a Receber' : 'Novo Titulo a Receber'
)

const safrasFiltradas = computed(() => safrasOptions.value)

const talhoesFiltrados = computed(() => {
  if (!formData.value.idFazenda) return talhoesOptions.value
  // Filter talhoes by selected fazenda when available
  return talhoesOptions.value
})

// Currency formatting helpers
const formatCurrencyValue = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const parseCurrencyValue = (value: string): number => {
  const cleaned = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

const onValorBlur = () => {
  formData.value.valorTitulo = parseCurrencyValue(valorDisplay.value)
  valorDisplay.value = formatCurrencyValue(formData.value.valorTitulo)
}

// Parcelas preview
interface ParcelaPreview {
  numero: number
  dataVencimento: string
  valorParcela: number
  status?: string
}

const existingParcelas = ref<ParcelaPreview[]>([])

const parcelasPreview = computed<ParcelaPreview[]>(() => {
  // When editing, show existing parcelas from DB
  if (isEditing.value && existingParcelas.value.length > 0) return existingParcelas.value
  if (!parcelar.value) return []
  const { valorTitulo, quantidadeParcelas, dataPrimeiraParcela, intervaloParcelasDias, taxaJurosAm, modeloJuros } = formData.value

  if (!dataPrimeiraParcela || quantidadeParcelas < 1 || valorTitulo <= 0) return []

  const parcelas: ParcelaPreview[] = []
  const n = quantidadeParcelas
  const taxaMensal = (taxaJurosAm || 0) / 100

  let valorParcela: number

  if (modeloJuros === 'PRICE' && taxaMensal > 0 && n > 1) {
    // PMT = PV * [i * (1+i)^n] / [(1+i)^n - 1]
    const fator = Math.pow(1 + taxaMensal, n)
    valorParcela = valorTitulo * (taxaMensal * fator) / (fator - 1)
  } else if (taxaMensal > 0 && n > 1) {
    // Juros simples: cada parcela = (PV / n) + (PV * i)
    // Simplificado: distribui juros proporcionalmente
    const totalJuros = valorTitulo * taxaMensal * n
    valorParcela = (valorTitulo + totalJuros) / n
  } else {
    valorParcela = valorTitulo / n
  }

  const baseDate = new Date(dataPrimeiraParcela + 'T00:00:00')
  const dias = intervaloParcelasDias || 30

  for (let i = 0; i < n; i++) {
    const dt = new Date(baseDate)
    dt.setDate(dt.getDate() + dias * i)
    parcelas.push({
      numero: i + 1,
      dataVencimento: dt.toISOString().split('T')[0] ?? '',
      valorParcela: Math.round(valorParcela * 100) / 100
    })
  }

  // Ajuste de arredondamento na ultima parcela
  if (parcelas.length > 0) {
    const somaAtual = parcelas.reduce((s, p) => s + p.valorParcela, 0)
    const totalEsperado = modeloJuros === 'PRICE' || taxaMensal > 0
      ? parcelas.reduce((s, p) => s + p.valorParcela, 0) // manter valor calculado
      : valorTitulo
    if (modeloJuros !== 'PRICE' && taxaMensal === 0) {
      const diff = Math.round((totalEsperado - somaAtual) * 100) / 100
      parcelas[parcelas.length - 1]!.valorParcela += diff
    }
  }

  return parcelas
})

const totalParcelas = computed(() =>
  parcelasPreview.value.reduce((s, p) => s + p.valorParcela, 0)
)

// Watchers
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      fetchLookups()
      if (props.initialData) {
        formData.value = {
          numeroTitulo: props.initialData.numeroTitulo ?? '',
          idCliente: props.initialData.idCliente ?? null,
          idPortador: props.initialData.idPortador ?? null,
          idProdutor: props.initialData.idProdutor ?? null,
          idFazenda: props.initialData.idFazenda ?? null,
          idSafra: props.initialData.idSafra ?? null,
          idTalhao: props.initialData.idTalhao ?? null,
          idMoeda: props.initialData.idMoeda ?? null,
          dataLancamento: props.initialData.dataLancamento ?? new Date().toISOString().split('T')[0] ?? '',
          valorTitulo: props.initialData.valorTitulo ?? 0,
          observacao: props.initialData.observacao ?? '',
          impostoRenda: props.initialData.impostoRenda ?? false,
          tipoGeracao: props.initialData.tipoGeracao ?? 'MANUAL',
          quantidadeParcelas: props.initialData.quantidadeParcelas ?? 1,
          dataPrimeiraParcela: props.initialData.dataPrimeiraParcela ?? '',
          intervaloParcelasDias: props.initialData.intervaloParcelasDias ?? 30,
          modeloJuros: props.initialData.modeloJuros ?? 'SIMPLES',
          taxaJurosAm: props.initialData.taxaJurosAm ?? 0,
          indiceCorrecao: props.initialData.indiceCorrecao ?? 'NENHUM',
          taxaCorrecaoFixaAm: props.initialData.taxaCorrecaoFixaAm ?? 0,
          taxaMulta: props.initialData.taxaMulta ?? 0
        }
        parcelar.value = props.initialData.tipoGeracao === 'PARCELADO'
        valorDisplay.value = formatCurrencyValue(formData.value.valorTitulo)

        // Load existing parcelas
        if (props.initialData.parcelas && props.initialData.parcelas.length > 0) {
          existingParcelas.value = props.initialData.parcelas.map((p) => ({
            numero: p.numeroParcela,
            dataVencimento: typeof p.dataVencimento === 'string' ? p.dataVencimento.split('T')[0]! : String(p.dataVencimento),
            valorParcela: Number(p.valorParcela) || 0,
            status: p.status,
          }))
        } else {
          existingParcelas.value = []
        }

        // Load existing rateios plano de conta
        if (props.initialData.rateiosPlanoConta && props.initialData.rateiosPlanoConta.length > 0) {
          rateiosPlanoConta.value = props.initialData.rateiosPlanoConta.map((r) => ({
            idPlanoContaGerencial: r.idPlanoContaGerencial,
            valorRateio: Number(r.valorRateio) || 0,
            percentualRateio: Number(r.percentualRateio) || 0,
          }))
          rateioAberto.value = true
        } else {
          rateiosPlanoConta.value = []
          rateioAberto.value = false
        }
      } else {
        resetForm()
        existingParcelas.value = []
        rateiosPlanoConta.value = []
        rateioAberto.value = false
      }
    }
  }
)

watch(parcelar, (val) => {
  formData.value.tipoGeracao = val ? 'PARCELADO' : 'MANUAL'
  if (!val) {
    formData.value.quantidadeParcelas = 1
  }
})

const resetForm = () => {
  formData.value = {
    numeroTitulo: '',
    idCliente: null,
    idPortador: null,
    idProdutor: null,
    idFazenda: null,
    idSafra: null,
    idTalhao: null,
    idMoeda: null,
    dataLancamento: new Date().toISOString().split('T')[0] ?? '',
    valorTitulo: 0,
    observacao: '',
    impostoRenda: false,
    tipoGeracao: 'MANUAL',
    quantidadeParcelas: 1,
    dataPrimeiraParcela: '',
    intervaloParcelasDias: 30,
    modeloJuros: 'SIMPLES',
    taxaJurosAm: 0,
    indiceCorrecao: 'NENHUM',
    taxaCorrecaoFixaAm: 0,
    taxaMulta: 0
  }
  parcelar.value = false
  valorDisplay.value = ''
  existingParcelas.value = []
  rateiosPlanoConta.value = []
}

const formatCurrency = (value: number | null | undefined) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

// Validation & Save
const handleSave = () => {
  if (props.loading) return

  if (!formData.value.numeroTitulo.trim()) {
    toast.warning('Numero do Titulo e obrigatorio.')
    return
  }
  if (!formData.value.idCliente) {
    toast.warning('Selecione um Cliente.')
    return
  }
  if (!formData.value.idPortador) {
    toast.warning('Selecione um Portador.')
    return
  }
  if (!formData.value.idProdutor) {
    toast.warning('Selecione um Produtor.')
    return
  }
  if (!formData.value.idFazenda) {
    toast.warning('Selecione uma Fazenda.')
    return
  }
  if (!formData.value.idSafra) {
    toast.warning('Selecione uma Safra.')
    return
  }
  if (!formData.value.idMoeda) {
    toast.warning('Selecione uma Moeda.')
    return
  }
  if (!formData.value.dataLancamento) {
    toast.warning('Data de Lancamento e obrigatoria.')
    return
  }
  if (formData.value.valorTitulo <= 0) {
    toast.warning('Valor do Titulo deve ser maior que zero.')
    return
  }

  if (parcelar.value) {
    if (formData.value.quantidadeParcelas < 1) {
      toast.warning('Numero de parcelas deve ser pelo menos 1.')
      return
    }
    if (!formData.value.dataPrimeiraParcela) {
      toast.warning('Data da primeira parcela e obrigatoria quando parcelado.')
      return
    }
  }

  const payload: Record<string, unknown> = { ...formData.value }
  if (!parcelar.value) {
    payload.dataPrimeiraParcela = payload.dataLancamento
    payload.quantidadeParcelas = 1
    payload.parcelas = [{
      numeroParcela: 1,
      dataVencimento: formData.value.dataLancamento,
      valorParcela: formData.value.valorTitulo,
      status: 'ABERTA',
    }]
  } else {
    payload.parcelas = parcelasPreview.value.map((p) => ({
      numeroParcela: p.numero,
      dataVencimento: p.dataVencimento,
      valorParcela: p.valorParcela,
      status: 'ABERTA',
    }))
  }
  // Rateio por Plano de Conta
  if (rateiosPlanoConta.value.length > 0) {
    if (!rateioValido.value) {
      toast.warning('A soma dos rateios deve ser igual ao valor do titulo.')
      return
    }
    const rateiosInvalidos = rateiosPlanoConta.value.some((r) => !r.idPlanoContaGerencial || r.valorRateio <= 0)
    if (rateiosInvalidos) {
      toast.warning('Todos os rateios devem ter plano de conta e valor preenchidos.')
      return
    }
    payload.rateiosPlanoConta = rateiosPlanoConta.value.map((r) => ({
      idPlanoContaGerencial: r.idPlanoContaGerencial,
      valorRateio: r.valorRateio,
      percentualRateio: r.percentualRateio,
    }))
  } else {
    payload.rateiosPlanoConta = []
  }
  payload.rateiosCentroCusto = []

  emit('save', payload)
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h2 class="text-xl font-bold text-gray-900">
            {{ modalTitle }}
          </h2>
          <p class="text-sm text-gray-500 mt-1">Preencha os dados do titulo a receber</p>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">

        <!-- Section 1: Dados do Titulo -->
        <section class="mb-8">
          <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
            <FileText class="w-4 h-4 text-gray-500" />
            Dados do Titulo
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <!-- Numero do Titulo -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Numero do Titulo <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="formData.numeroTitulo"
                  type="text"
                  placeholder="Ex: TIT-001"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <!-- Cliente -->
            <div class="md:col-span-2 lg:col-span-2">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Cliente <span class="text-red-500">*</span>
              </label>
              <BaseAutocomplete
                v-model="formData.idCliente"
                :options="clientesOptions"
                placeholder="Selecione o cliente..."
              >
                <template #prefix>
                  <User class="h-4 w-4 text-gray-400" />
                </template>
              </BaseAutocomplete>
            </div>

            <!-- Portador -->
            <div class="lg:col-span-1">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Portador <span class="text-red-500">*</span>
              </label>
              <BaseAutocomplete
                v-model="formData.idPortador"
                :options="portadoresOptions"
                placeholder="Selecione o portador..."
              >
                <template #prefix>
                  <User class="h-4 w-4 text-gray-400" />
                </template>
              </BaseAutocomplete>
            </div>

            <!-- Produtor -->
            <div class="lg:col-span-1">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Produtor <span class="text-red-500">*</span>
              </label>
              <BaseAutocomplete
                v-model="formData.idProdutor"
                :options="produtoresOptions"
                placeholder="Selecione o produtor..."
              >
                <template #prefix>
                  <User class="h-4 w-4 text-gray-400" />
                </template>
              </BaseAutocomplete>
            </div>

            <!-- Fazenda -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Fazenda <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.idFazenda"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all bg-white"
              >
                <option :value="null" disabled>Selecione...</option>
                <option
                  v-for="opt in fazendasOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Safra -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Safra <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.idSafra"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all bg-white"
              >
                <option :value="null" disabled>Selecione...</option>
                <option
                  v-for="opt in safrasFiltradas"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Talhao -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Talhao
              </label>
              <select
                v-model="formData.idTalhao"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all bg-white"
              >
                <option :value="null">Nenhum</option>
                <option
                  v-for="opt in talhoesFiltrados"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Moeda -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Moeda <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.idMoeda"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all bg-white"
              >
                <option :value="null" disabled>Selecione...</option>
                <option
                  v-for="opt in moedasOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Data de Lancamento -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Data de Lancamento <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="formData.dataLancamento"
                  type="date"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <!-- Valor do Titulo -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Valor do Titulo <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="0,00"
                  :value="valorDisplay"
                  @input="valorDisplay = ($event.target as HTMLInputElement).value"
                  @blur="onValorBlur"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <!-- Observacao -->
            <div class="md:col-span-2 lg:col-span-3">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                Observacao
              </label>
              <textarea
                v-model="formData.observacao"
                rows="3"
                placeholder="Observacoes sobre o titulo..."
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none transition-all"
              ></textarea>
            </div>

            <!-- Imposto de Renda -->
            <div class="flex items-center gap-3">
              <input
                id="impostoRenda"
                v-model="formData.impostoRenda"
                type="checkbox"
                class="h-4 w-4 text-lime-600 border-gray-300 rounded focus:ring-lime-500"
              />
              <label for="impostoRenda" class="text-sm font-bold text-gray-700">
                Imposto de Renda
              </label>
            </div>
          </div>
        </section>

        <!-- Section 2: Parcelamento -->
        <section class="mb-8">
          <div class="flex items-center justify-between border-b pb-2 mb-4">
            <h3 class="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Calculator class="w-4 h-4 text-gray-500" />
              Parcelamento
            </h3>
            <button
              type="button"
              @click="parcelar = !parcelar"
              class="flex items-center gap-2 text-sm font-medium transition-colors"
              :class="parcelar ? 'text-lime-600' : 'text-gray-400'"
            >
              <component :is="parcelar ? ToggleRight : ToggleLeft" class="w-6 h-6" />
              {{ parcelar ? 'Parcelado' : 'Parcelar este titulo?' }}
            </button>
          </div>

          <div v-if="parcelar" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <!-- Numero de Parcelas -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">
                  Numero de Parcelas <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="formData.quantidadeParcelas"
                  type="number"
                  min="1"
                  max="360"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Data da Primeira Parcela -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">
                  Data da Primeira Parcela <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.dataPrimeiraParcela"
                    type="date"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Intervalo entre Parcelas -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">
                  Intervalo entre Parcelas (dias)
                </label>
                <input
                  v-model.number="formData.intervaloParcelasDias"
                  type="number"
                  min="1"
                  placeholder="30"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Modelo de Juros -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">
                  Modelo de Juros
                </label>
                <select
                  v-model="formData.modeloJuros"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="SIMPLES">Simples</option>
                  <option value="PRICE">Price (Tabela Price)</option>
                </select>
              </div>

              <!-- Taxa de Juros a.m. -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">
                  Taxa de Juros a.m.
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Percent class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model.number="formData.taxaJurosAm"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Indice de Correcao -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">
                  Indice de Correcao
                </label>
                <select
                  v-model="formData.indiceCorrecao"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="NENHUM">Nenhum</option>
                  <option value="IPCA">IPCA</option>
                  <option value="IGPM">IGP-M</option>
                  <option value="FIXO">Fixo</option>
                </select>
              </div>

              <!-- Taxa de Correcao Fixa a.m. (visible only when FIXO) -->
              <div v-if="formData.indiceCorrecao === 'FIXO'">
                <label class="block text-sm font-bold text-gray-700 mb-1.5">
                  Taxa de Correcao Fixa a.m.
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Percent class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model.number="formData.taxaCorrecaoFixaAm"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Taxa de Multa por Atraso -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">
                  Taxa de Multa por Atraso
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Percent class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model.number="formData.taxaMulta"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <!-- Preview de Parcelas -->
            <div v-if="parcelasPreview.length > 0" class="mt-4">
              <h4 class="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Layers class="w-4 h-4 text-gray-400" />
                {{ isEditing ? 'Parcelas' : 'Preview das Parcelas' }}
              </h4>
              <div class="overflow-x-auto rounded-lg border border-gray-200">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Parcela
                      </th>
                      <th class="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Vencimento
                      </th>
                      <th class="px-4 py-2.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th v-if="isEditing" class="px-4 py-2.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="parcela in parcelasPreview" :key="parcela.numero">
                      <td class="px-4 py-2 text-sm text-gray-700">
                        {{ parcela.numero }}/{{ parcelasPreview.length }}
                      </td>
                      <td class="px-4 py-2 text-sm text-gray-700">
                        {{ formatDate(parcela.dataVencimento) }}
                      </td>
                      <td class="px-4 py-2 text-sm text-gray-900 font-medium text-right">
                        {{ formatCurrency(parcela.valorParcela) }}
                      </td>
                      <td v-if="isEditing" class="px-4 py-2 text-center">
                        <span
                          class="text-xs font-medium px-2 py-0.5 rounded-full"
                          :class="{
                            'bg-blue-100 text-blue-700': parcela.status === 'ABERTA',
                            'bg-yellow-100 text-yellow-700': parcela.status === 'PARCIAL',
                            'bg-green-100 text-green-700': parcela.status === 'BAIXADA',
                            'bg-gray-100 text-gray-600': parcela.status === 'CANCELADA',
                          }"
                        >
                          {{ parcela.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-gray-50">
                    <tr>
                      <td :colspan="isEditing ? 2 : 2" class="px-4 py-2.5 text-sm font-bold text-gray-700">
                        Total
                      </td>
                      <td class="px-4 py-2.5 text-sm font-bold text-lime-600 text-right">
                        {{ formatCurrency(totalParcelas) }}
                      </td>
                      <td v-if="isEditing"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <div v-else>
            <p v-if="!isEditing" class="text-sm text-gray-500 italic">
              Sem parcelamento. Uma unica parcela sera gerada automaticamente com o valor total do titulo.
            </p>
            <!-- Show existing parcelas when editing even without parcelamento -->
            <div v-if="isEditing && existingParcelas.length > 0" class="mt-2">
              <h4 class="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Layers class="w-4 h-4 text-gray-400" />
                Parcelas
              </h4>
              <div class="overflow-x-auto rounded-lg border border-gray-200">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Parcela</th>
                      <th class="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vencimento</th>
                      <th class="px-4 py-2.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Valor</th>
                      <th class="px-4 py-2.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="parcela in existingParcelas" :key="parcela.numero">
                      <td class="px-4 py-2 text-sm text-gray-700">{{ parcela.numero }}/{{ existingParcelas.length }}</td>
                      <td class="px-4 py-2 text-sm text-gray-700">{{ formatDate(parcela.dataVencimento) }}</td>
                      <td class="px-4 py-2 text-sm text-gray-900 font-medium text-right">{{ formatCurrency(parcela.valorParcela) }}</td>
                      <td class="px-4 py-2 text-center">
                        <span
                          class="text-xs font-medium px-2 py-0.5 rounded-full"
                          :class="{
                            'bg-blue-100 text-blue-700': parcela.status === 'ABERTA',
                            'bg-yellow-100 text-yellow-700': parcela.status === 'PARCIAL',
                            'bg-green-100 text-green-700': parcela.status === 'BAIXADA',
                            'bg-gray-100 text-gray-600': parcela.status === 'CANCELADA',
                          }"
                        >
                          {{ parcela.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 3: Rateio -->
        <section>
          <button
            type="button"
            @click="rateioAberto = !rateioAberto"
            class="w-full flex items-center justify-between border-b pb-2 mb-4 text-left"
          >
            <h3 class="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Layers class="w-4 h-4 text-gray-500" />
              Rateio
            </h3>
            <component
              :is="rateioAberto ? ChevronUp : ChevronDown"
              class="w-5 h-5 text-gray-400"
            />
          </button>

          <div v-if="rateioAberto" class="space-y-6">
            <!-- Rateio por Plano de Conta -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Scale class="w-4 h-4 text-gray-400" />
                  Rateio por Plano de Conta
                </h4>
                <div class="flex items-center gap-2">
                  <button
                    v-if="rateiosPlanoConta.length > 1"
                    type="button"
                    @click="distribuirRateioIgual"
                    class="text-xs text-lime-700 bg-lime-50 hover:bg-lime-100 border border-lime-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    Distribuir igual
                  </button>
                  <button
                    type="button"
                    @click="addRateio"
                    class="flex items-center gap-1 text-xs text-lime-700 bg-lime-50 hover:bg-lime-100 border border-lime-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    <Plus class="w-3.5 h-3.5" />
                    Adicionar
                  </button>
                </div>
              </div>

              <div v-if="rateiosPlanoConta.length === 0" class="border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-400">
                Nenhum rateio adicionado. Clique em "Adicionar" para incluir.
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="(rateio, index) in rateiosPlanoConta"
                  :key="index"
                  class="grid grid-cols-12 gap-2 items-end bg-gray-50 rounded-lg p-3 border border-gray-200"
                >
                  <!-- Plano de Conta -->
                  <div class="col-span-5">
                    <label v-if="index === 0" class="block text-xs font-medium text-gray-600 mb-1">
                      Plano de Conta <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="rateio.idPlanoContaGerencial"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    >
                      <option :value="null" disabled>Selecione</option>
                      <option
                        v-for="plano in planosContaOptions"
                        :key="plano.value"
                        :value="plano.value"
                      >
                        {{ plano.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Valor -->
                  <div class="col-span-3">
                    <label v-if="index === 0" class="block text-xs font-medium text-gray-600 mb-1">
                      Valor <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model.number="rateio.valorRateio"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      @input="recalcRateioPercentual(index)"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    />
                  </div>

                  <!-- Percentual -->
                  <div class="col-span-3">
                    <label v-if="index === 0" class="block text-xs font-medium text-gray-600 mb-1">
                      % Rateio
                    </label>
                    <div class="relative">
                      <input
                        v-model.number="rateio.percentualRateio"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="0,00"
                        @input="recalcRateioValor(index)"
                        class="w-full px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      />
                      <span class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 text-xs">%</span>
                    </div>
                  </div>

                  <!-- Remover -->
                  <div class="col-span-1 flex justify-center">
                    <button
                      type="button"
                      @click="removeRateio(index)"
                      class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover rateio"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- Totais -->
                <div class="flex items-center justify-between px-3 py-2 rounded-lg border"
                  :class="rateioValido ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'"
                >
                  <span class="text-xs font-medium" :class="rateioValido ? 'text-green-700' : 'text-red-700'">
                    Total Rateado
                  </span>
                  <div class="flex items-center gap-4 text-sm font-semibold">
                    <span :class="rateioValido ? 'text-green-700' : 'text-red-700'">
                      {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRateio) }}
                      / {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.valorTitulo || 0) }}
                    </span>
                    <span :class="rateioValido ? 'text-green-600' : 'text-red-600'" class="text-xs">
                      ({{ totalRateioPercentual.toFixed(2) }}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Rateio por Centro de Custo -->
            <div>
              <h4 class="text-sm font-bold text-gray-700 mb-2">
                Rateio por Centro de Custo
              </h4>
              <div class="border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-400">
                Funcionalidade de rateio por centro de custo sera implementada em breve.
              </div>
            </div>
          </div>
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
          :disabled="loading"
          class="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <span
            v-if="loading"
            class="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"
          ></span>
          <Save v-else class="w-4 h-4 mr-2" />
          {{ loading ? 'Salvando...' : 'Salvar' }}
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
