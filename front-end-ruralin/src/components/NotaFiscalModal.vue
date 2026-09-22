<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X, Save, Hash, Users, Truck, Info, FileText, Package, Search } from 'lucide-vue-next'
import type { NotaFiscal, NotaFiscalTipo, NotaFiscalFinalidade, NotaFiscalModelo, NotaFiscalModalidadeFrete } from '@/types/NotaFiscal'
import type { ParsedNfe } from '@/types/ParsedNfe'
import { NF_FINALIDADE_LABELS, NF_MODALIDADE_FRETE, NF_MODELO_LABELS } from '@/types/NotaFiscal'
import { parceiroNegocioService } from '@/services/parceiroNegocioService'
import { notaFiscalService } from '@/services/notaFiscalService'
import { certificadoDigitalService } from '@/services/certificadoDigitalService'
import { numeracaoNfeService } from '@/services/numeracaoNfeService'
import type { ParceiroNegocio } from '@/types/ParceiroNegocio'
import type { CertificadoDigital } from '@/types/CertificadoDigital'
import type { NumeracaoNfe } from '@/types/NumeracaoNfe'
import BaseAutocomplete from '@/components/BaseAutocomplete.vue'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  isOpen: boolean
  tipo: NotaFiscalTipo
  initialData?: NotaFiscal | null
  parsedNfe?: ParsedNfe | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const activeTab = ref('identificacao')
const parceiros = ref<ParceiroNegocio[]>([])
const notasFiscaisRef = ref<NotaFiscal[]>([])
const certificados = ref<CertificadoDigital[]>([])
const numeracoes = ref<NumeracaoNfe[]>([])
const loadingParceiros = ref(false)
const loadingNfs = ref(false)

const tabs = [
  { id: 'identificacao', label: 'Identificação', icon: Hash },
  { id: 'partes', label: 'Datas e Partes', icon: Users },
  { id: 'transporte', label: 'Transporte', icon: Truck },
  { id: 'informacoes', label: 'Informações', icon: Info },
]

const defaultForm = (): Partial<NotaFiscal> => {
  const today = new Date().toISOString().split('T')[0]
  return {
    tipo: props.tipo,
    numero: '',
    data_emissao: today,
    data_entrada_saida: today,
    hora_entrada_saida: '',
    emitenteId: undefined as unknown as number,
    destinatarioId: undefined as unknown as number,
    empresaId: undefined as unknown as number,
    transportadoraId: undefined,
    modalidade_frete: 'sem_frete',
    vl_frete: 0,
    vl_seguro: 0,
    vl_desconto: 0,
    vl_outros: 0,
    volumes_qtd: undefined,
    volumes_especie: '',
    peso_bruto: undefined,
    peso_liquido: undefined,
    chave_acesso: '',
    informacoes_adicionais: '',
    informacoes_complementares: '',
    notaFiscalRefId: undefined,
  }
}

const formData = ref<Partial<NotaFiscal>>(defaultForm())
const consultandoSefaz = ref(false)

/**
 * Preenche formulário a partir de dados parseados de NF-e (XML ou SEFAZ)
 */
// Mapeia código SEFAZ finNFe para enum do sistema
const mapFinalidade = (finNFe?: string): NotaFiscalFinalidade => {
  const map: Record<string, NotaFiscalFinalidade> = {
    '1': 'normal',
    '2': 'complementar',
    '3': 'ajuste',
    '4': 'devolucao',
  }
  return map[finNFe ?? ''] ?? 'normal'
}

// Extrai hora HH:mm:ss de uma string datetime ISO
const extrairHora = (datetime?: string): string => {
  if (!datetime) return ''
  const match = datetime.match(/T(\d{2}:\d{2}:\d{2})/)
  return match ? match[1] ?? '' : ''
}

const preencherDeParsedNfe = (parsed: ParsedNfe) => {
  formData.value.numero = parsed.numero
  formData.value.serie = parsed.serie
  formData.value.modelo = parsed.modelo as NotaFiscalModelo
  formData.value.data_emissao = parsed.dataEmissao?.split('T')[0] ?? ''
  formData.value.data_entrada_saida = parsed.dataEntradaSaida?.split('T')[0] ?? formData.value.data_emissao
  formData.value.hora_entrada_saida = extrairHora(parsed.dataEntradaSaida) || extrairHora(parsed.dataEmissao)
  formData.value.finalidade = mapFinalidade(parsed.finalidade)
  formData.value.natureza_operacao = parsed.naturezaOperacao
  formData.value.cfop = parsed.cfop
  formData.value.chave_acesso = parsed.chaveAcesso
  formData.value.vl_produtos = parsed.vlProdutos
  formData.value.vl_frete = parsed.vlFrete
  formData.value.vl_seguro = parsed.vlSeguro
  formData.value.vl_desconto = parsed.vlDesconto
  formData.value.vl_outros = parsed.vlOutros
  formData.value.vl_ipi = parsed.vlIpi
  formData.value.vl_icms = parsed.vlIcms
  formData.value.vl_pis = parsed.vlPis
  formData.value.vl_cofins = parsed.vlCofins
  formData.value.vl_total = parsed.vlTotal
  formData.value.informacoes_adicionais = parsed.informacoesAdicionais ?? ''

  // Mapear itens do XML para o formato do sistema
  if (parsed.itens && parsed.itens.length > 0) {
    ;(formData.value as any).itens = parsed.itens.map((item, idx) => ({
      numero_item: item.numero || idx + 1,
      codigo_produto: item.codigoProduto || '',
      descricao: item.descricao,
      ncm: item.ncm,
      cfop: item.cfop,
      unidade: item.unidade,
      quantidade: item.quantidade,
      vl_unitario: item.vlUnitario,
      vl_total: item.vlTotal,
      vl_icms: item.vlIcms,
      vl_ipi: item.vlIpi,
      vl_pis: item.vlPis,
      vl_cofins: item.vlCofins,
      cst_icms: '00',
      cst_pis: '08',
      cst_cofins: '08',
    }))
  }

  // Sugerir parcelamento com base nas duplicatas
  if (parsed.duplicatas && parsed.duplicatas.length > 0) {
    formData.value.parcelas_qtd = parsed.duplicatas.length
    if (parsed.duplicatas.length === 1) {
      formData.value.condicao_pagamento = 'a_vista'
    } else {
      formData.value.condicao_pagamento = `${parsed.duplicatas.length}x`
    }
  }
}

const handleConsultarSefaz = async () => {
  const chaveAcesso = formData.value.chave_acesso
  if (!chaveAcesso || chaveAcesso.replace(/\D/g, '').length !== 44) {
    toast.warning('Informe uma chave de acesso válida com 44 dígitos')
    return
  }

  consultandoSefaz.value = true
  try {
    const parsed = await notaFiscalService.consultarSefaz(chaveAcesso)
    preencherDeParsedNfe(parsed)
    toast.success('Dados da NF-e preenchidos com sucesso!')
  } catch (e: any) {
    console.error(e)
    toast.error(e?.response?.data?.error?.message ?? 'Erro ao consultar SEFAZ')
  } finally {
    consultandoSefaz.value = false
  }
}

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (!isOpen) return
    activeTab.value = 'identificacao'
    formData.value = props.initialData ? { ...props.initialData } : defaultForm()

    // Auto-preenchimento quando recebe dados de XML importado
    if (props.parsedNfe) {
      preencherDeParsedNfe(props.parsedNfe)
    }

    await loadParceiros()
    if (props.tipo === 'saida') {
      await Promise.all([loadCertificados(), loadNumeracoes()])
    }
    if (formData.value.finalidade === 'devolucao') {
      await loadNotasFiscaisRef()
    }
  },
)

watch(
  () => formData.value.finalidade,
  async (newVal) => {
    if (newVal === 'devolucao') {
      await loadNotasFiscaisRef()
    } else {
      formData.value.notaFiscalRefId = undefined
    }
  }
)

const loadParceiros = async () => {
  if (parceiros.value.length > 0) return
  loadingParceiros.value = true
  try {
    const result = await parceiroNegocioService.getAll(1, 500)
    parceiros.value = result.data
  } catch (e) {
    console.error('Erro ao carregar parceiros', e)
  } finally {
    loadingParceiros.value = false
  }
}

const loadNotasFiscaisRef = async () => {
  if (notasFiscaisRef.value.length > 0) return
  loadingNfs.value = true
  try {
    const result = await notaFiscalService.getAll(1, 100)
    // Filtra apenas notas autorizadas para referenciar
    notasFiscaisRef.value = result.data.filter(nf => nf.status === 'autorizada')
  } catch (e) {
    console.error('Erro ao carregar notas fiscais', e)
  } finally {
    loadingNfs.value = false
  }
}

const loadCertificados = async () => {
  if (certificados.value.length > 0) return
  try {
    const result = await certificadoDigitalService.getAll(1, 100)
    certificados.value = (result.data.data || []).filter((c: any) => c.ativo)
  } catch (e) {
    console.error('Erro ao carregar certificados', e)
  }
}

const loadNumeracoes = async () => {
  if (numeracoes.value.length > 0) return
  try {
    const result = await numeracaoNfeService.getAll(1, 100)
    numeracoes.value = (result.data || []).filter((n: NumeracaoNfe) => n.ativo)
  } catch (e) {
    console.error('Erro ao carregar numerações', e)
  }
}

const certificadoOptions = computed(() =>
  certificados.value.map((c: any) => ({
    value: c.id,
    label: c.razao_social || c.nome || `Certificado #${c.id}`,
  })),
)

const serieNfeOptions = computed(() => {
  const unique = [...new Set(numeracoes.value.map((n) => n.serie))]
  return unique.map((s) => ({ value: s, label: `Série ${s}` }))
})

const ambienteOptions = [
  { value: 'homologacao', label: 'Homologação' },
  { value: 'producao', label: 'Produção' },
]

// Options para BaseAutocomplete
const finalidadeOptions = Object.entries(NF_FINALIDADE_LABELS).map(([k, v]) => ({
  value: k,
  label: v,
}))

const modalidadeFreteOptions = Object.entries(NF_MODALIDADE_FRETE).map(([k, v]) => ({
  value: k,
  label: v,
}))

const modeloOptions = Object.entries(NF_MODELO_LABELS).map(([k, v]) => ({
  value: k,
  label: `${k} - ${v}`,
}))

const parceiroOptions = computed(() =>
  parceiros.value.map((p) => ({
    value: p.id_pessoa as number,
    label: p.cpfcnpj_pessoa
      ? `${p.nomerazao_pessoa} · ${p.cpfcnpj_pessoa}`
      : (p.nomerazao_pessoa ?? ''),
  })),
)

const emitenteOptions = computed(() => {
  let list = parceiros.value
  if (props.tipo === 'entrada') {
    list = list.filter((p) => p.fornecedor_pessoa)
  }
  return list.map((p) => ({
    value: p.id_pessoa as number,
    label: p.cpfcnpj_pessoa
      ? `${p.nomerazao_pessoa} · ${p.cpfcnpj_pessoa}`
      : (p.nomerazao_pessoa ?? ''),
  }))
})

const destinatarioOptions = computed(() => {
  let list = parceiros.value
  if (props.tipo === 'saida') {
    list = list.filter((p) => p.cliente_pessoa)
  }
  return list.map((p) => ({
    value: p.id_pessoa as number,
    label: p.cpfcnpj_pessoa
      ? `${p.nomerazao_pessoa} · ${p.cpfcnpj_pessoa}`
      : (p.nomerazao_pessoa ?? ''),
  }))
})

const transportadoraOptions = computed(() =>
  parceiros.value.map((p) => ({
    value: p.id_pessoa as number,
    label: p.nomerazao_pessoa ?? '',
  })),
)

const notaRefOptions = computed(() =>
  notasFiscaisRef.value.map((nf) => ({
    value: nf.id_nf as number,
    label: `${nf.numero} - ${nf.emitente?.nomerazao_pessoa} (${nf.data_emissao})`,
  })),
)

const handleSave = () => {
  if (props.loading) return
  if (!formData.value.numero || !formData.value.serie || !formData.value.modelo) {
    alert('Número, série e modelo são obrigatórios.')
    return
  }
  if (!formData.value.natureza_operacao || !formData.value.cfop) {
    alert('Natureza da operação e CFOP são obrigatórios.')
    return
  }
  if (!formData.value.emitenteId || !formData.value.destinatarioId || !formData.value.empresaId) {
    alert('Emitente, destinatário e empresa são obrigatórios.')
    return
  }
  if (!formData.value.data_emissao || !formData.value.data_entrada_saida) {
    alert('Datas de emissão e entrada/saída são obrigatórias.')
    return
  }
  if (formData.value.finalidade === 'devolucao' && !formData.value.notaFiscalRefId) {
    alert('Para finalidade Devolução, é obrigatório informar a NF de referência.')
    return
  }
  emit('save', { ...formData.value, tipo: props.tipo })
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal -->
    <div
      class="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl min-h-[80vh] max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100 rounded-t-xl bg-white">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-lg bg-lime-100 flex items-center justify-center">
            <FileText class="h-5 w-5 text-lime-600" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">
              {{
                props.initialData
                  ? `Editar NF de ${props.tipo === 'entrada' ? 'Entrada' : 'Saída'}`
                  : `Nova NF de ${props.tipo === 'entrada' ? 'Entrada' : 'Saída'}`
              }}
            </h2>
            <p class="text-xs text-gray-500 mt-0.5">Modelo 55 · CFOP {{ formData.cfop }}</p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-100 px-6 bg-white overflow-x-auto">
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

      <!-- Body — overflow-y-auto para scroll, sem overflow-hidden no container pai -->
      <div class="p-6 overflow-y-auto flex-1 custom-scrollbar bg-white">

        <!-- Tab: Identificação -->
        <div v-show="activeTab === 'identificacao'" class="space-y-6">
          <section>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Hash class="w-4 h-4" />
              Dados da Nota
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
              <!-- Tipo -->
              <div class="md:col-span-2">
                <label class="block text-sm font-bold text-gray-700 mb-2">Tipo</label>
                <div class="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50">
                  <Package class="h-4 w-4 text-gray-400" />
                  <span class="text-sm font-medium text-gray-700 capitalize">{{ props.tipo }}</span>
                </div>
              </div>

              <!-- Número -->
              <div class="md:col-span-3">
                <label class="block text-sm font-bold text-gray-700 mb-2">Número *</label>
                <input
                  v-model="formData.numero"
                  type="text"
                  placeholder="000000001"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                />
              </div>

              <!-- Série -->
              <div class="md:col-span-1">
                <label class="block text-sm font-bold text-gray-700 mb-2">Série *</label>
                <input
                  v-model="formData.serie"
                  type="text"
                  placeholder="1"
                  maxlength="3"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                />
              </div>

              <!-- Modelo -->
              <div class="md:col-span-3">
                <label class="block text-sm font-bold text-gray-700 mb-2">Modelo *</label>
                <BaseAutocomplete
                  :model-value="formData.modelo ?? null"
                  @update:model-value="(v) => (formData.modelo = v as NotaFiscalModelo)"
                  :options="modeloOptions"
                  placeholder="Selecione..."
                />
              </div>

              <!-- Finalidade -->
              <div class="md:col-span-3">
                <label class="block text-sm font-bold text-gray-700 mb-2">Finalidade *</label>
                <BaseAutocomplete
                  :model-value="formData.finalidade ?? null"
                  @update:model-value="(v) => (formData.finalidade = v as NotaFiscalFinalidade)"
                  :options="finalidadeOptions"
                  placeholder="Selecione..."
                />
              </div>

              <!-- NF Referência (Devolução) -->
              <div v-if="formData.finalidade === 'devolucao'" class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">NF Referência *</label>
                <div v-if="loadingNfs" class="text-xs text-gray-400 mb-1">Carregando notas...</div>
                <BaseAutocomplete
                  v-else
                  :model-value="formData.notaFiscalRefId ?? null"
                  @update:model-value="(v) => (formData.notaFiscalRefId = v as number)"
                  :options="notaRefOptions"
                  placeholder="Busque a nota fiscal..."
                />
              </div>

              <!-- Natureza da Operação -->
              <div :class="formData.finalidade === 'devolucao' ? 'md:col-span-6' : 'md:col-span-8'">
                <label class="block text-sm font-bold text-gray-700 mb-2">Natureza da Operação *</label>
                <input
                  v-model="formData.natureza_operacao"
                  type="text"
                  placeholder="Ex: VENDA DE MERCADORIAS"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                />
              </div>

              <!-- CFOP -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">CFOP *</label>
                <input
                  v-model="formData.cfop"
                  type="text"
                  placeholder="5101"
                  maxlength="4"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </section>

          <!-- Seção: Emissão NF-e (apenas saída) -->
          <section v-if="tipo === 'saida'">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText class="w-4 h-4" />
              Emissão NF-e
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
              <!-- Certificado Digital -->
              <div class="md:col-span-5">
                <label class="block text-sm font-bold text-gray-700 mb-2">Certificado Digital</label>
                <BaseAutocomplete
                  :model-value="formData.certificadoDigitalId ?? null"
                  @update:model-value="(v) => (formData.certificadoDigitalId = v as number)"
                  :options="certificadoOptions"
                  placeholder="Selecione o certificado..."
                />
              </div>

              <!-- Série NF-e -->
              <div class="md:col-span-2">
                <label class="block text-sm font-bold text-gray-700 mb-2">Série NF-e</label>
                <select
                  v-model="formData.serie"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                >
                  <option v-for="s in serieNfeOptions" :key="s.value" :value="s.value">
                    {{ s.label }}
                  </option>
                </select>
              </div>

              <!-- Modelo NF-e -->
              <div class="md:col-span-2">
                <label class="block text-sm font-bold text-gray-700 mb-2">Modelo</label>
                <select
                  v-model="formData.modelo"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                >
                  <option value="55">55 - NF-e</option>
                  <option value="65">65 - NFC-e</option>
                </select>
              </div>

              <!-- Ambiente SEFAZ -->
              <div class="md:col-span-3">
                <label class="block text-sm font-bold text-gray-700 mb-2">Ambiente SEFAZ</label>
                <select
                  v-model="formData.ambiente_sefaz"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                >
                  <option v-for="a in ambienteOptions" :key="a.value" :value="a.value">
                    {{ a.label }}
                  </option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <!-- Tab: Datas e Partes -->
        <div v-show="activeTab === 'partes'" class="space-y-6">
          <section>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Datas</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Data de Emissão *</label>
                <input
                  v-model="formData.data_emissao"
                  type="date"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Data Entrada/Saída *</label>
                <input
                  v-model="formData.data_entrada_saida"
                  type="date"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Hora</label>
                <input
                  v-model="formData.hora_entrada_saida"
                  type="time"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users class="w-4 h-4" />
              Partes Envolvidas
            </h3>
            <div v-if="loadingParceiros" class="text-sm text-gray-400 py-4">
              Carregando parceiros...
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-12 gap-4">
              <!-- Emitente -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Emitente *</label>
                <BaseAutocomplete
                  :model-value="formData.emitenteId ?? null"
                  @update:model-value="(v) => (formData.emitenteId = v as number)"
                  :options="emitenteOptions"
                  placeholder="Buscar emitente..."
                />
              </div>

              <!-- Destinatário -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Destinatário *</label>
                <BaseAutocomplete
                  :model-value="formData.destinatarioId ?? null"
                  @update:model-value="(v) => (formData.destinatarioId = v as number)"
                  :options="destinatarioOptions"
                  placeholder="Buscar destinatário..."
                />
              </div>

              <!-- Empresa -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Empresa *</label>
                <BaseAutocomplete
                  :model-value="formData.empresaId ?? null"
                  @update:model-value="(v) => (formData.empresaId = v as number)"
                  :options="parceiroOptions"
                  placeholder="Buscar empresa..."
                />
              </div>
            </div>
          </section>
        </div>

        <!-- Tab: Transporte -->
        <div v-show="activeTab === 'transporte'" class="space-y-6">
          <section>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Truck class="w-4 h-4" />
              Transportadora e Frete
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
              <!-- Transportadora -->
              <div class="md:col-span-8">
                <label class="block text-sm font-bold text-gray-700 mb-2">Transportadora</label>
                <BaseAutocomplete
                  :model-value="formData.transportadoraId ?? null"
                  @update:model-value="(v) => (formData.transportadoraId = v ? (v as number) : undefined)"
                  :options="transportadoraOptions"
                  placeholder="Sem transportadora (opcional)"
                />
              </div>

              <!-- Modalidade Frete -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Modalidade Frete</label>
                <BaseAutocomplete
                  :model-value="formData.modalidade_frete ?? null"
                  @update:model-value="(v) => (formData.modalidade_frete = v as NotaFiscalModalidadeFrete)"
                  :options="modalidadeFreteOptions"
                  placeholder="Selecione..."
                />
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Valores Adicionais
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Frete (R$)</label>
                <input
                  v-model.number="formData.vl_frete"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Seguro (R$)</label>
                <input
                  v-model.number="formData.vl_seguro"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Desconto (R$)</label>
                <input
                  v-model.number="formData.vl_desconto"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Outros (R$)</label>
                <input
                  v-model.number="formData.vl_outros"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Volumes e Peso
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Qtd. Volumes</label>
                <input
                  v-model.number="formData.volumes_qtd"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Espécie</label>
                <input
                  v-model="formData.volumes_especie"
                  type="text"
                  placeholder="Ex: CAIXA"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Peso Bruto (kg)</label>
                <input
                  v-model.number="formData.peso_bruto"
                  type="number"
                  min="0"
                  step="0.001"
                  placeholder="0,000"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Peso Líquido (kg)</label>
                <input
                  v-model.number="formData.peso_liquido"
                  type="number"
                  min="0"
                  step="0.001"
                  placeholder="0,000"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </section>
        </div>

        <!-- Tab: Informações -->
        <div v-show="activeTab === 'informacoes'" class="space-y-6">
          <section>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">
                Chave de Acesso (44 dígitos)
              </label>
              <div class="flex gap-2">
                <input
                  v-model="formData.chave_acesso"
                  type="text"
                  maxlength="44"
                  placeholder="44 dígitos numéricos"
                  class="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm font-mono"
                />
                <button
                  type="button"
                  @click="handleConsultarSefaz"
                  :disabled="consultandoSefaz || !formData.chave_acesso"
                  class="inline-flex items-center px-3 py-2.5 border border-lime-600 rounded-lg text-sm font-medium text-lime-700 bg-white hover:bg-lime-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  title="Consultar dados na SEFAZ"
                >
                  <Search class="h-4 w-4 mr-1" :class="{ 'animate-spin': consultandoSefaz }" />
                  {{ consultandoSefaz ? 'Consultando...' : 'Consultar SEFAZ' }}
                </button>
              </div>
            </div>
          </section>

          <section>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Informações Adicionais</label>
                <textarea
                  v-model="formData.informacoes_adicionais"
                  rows="3"
                  placeholder="Informações adicionais de interesse do fisco..."
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm resize-none"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Informações Complementares</label>
                <textarea
                  v-model="formData.informacoes_complementares"
                  rows="3"
                  placeholder="Informações complementares de interesse do contribuinte..."
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm resize-none"
                />
              </div>
            </div>
          </section>
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
