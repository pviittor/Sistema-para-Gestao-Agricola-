<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { X, Save, Plus, Trash2, Users, ChevronRight } from 'lucide-vue-next'
import type { OrdemServico, CreateOrdemServicoCompletoPayload, CargaTrabalho, HistoricoExecucao } from '@/types/OrdemServico'
import { PrioridadeOrdemServico, FuncaoResponsavelOS } from '@/types/OrdemServico'
import type { TipoAtividadeOS, CampoCondicionalTipoAtividade } from '@/types/TipoAtividadeOS'
import type { Propriedade } from '@/types/Propriedade'
import type { Safra } from '@/types/Safra'
import type { Talhao } from '@/types/Talhao'
import type { Produto } from '@/types/Produto'
import type { MaquinaVeiculo } from '@/types/MaquinaVeiculo'
import type { ParceiroNegocio } from '@/types/ParceiroNegocio'
import { tipoAtividadeOSService } from '@/services/tipoAtividadeOSService'
import { propriedadeService } from '@/services/propriedadeService'
import { safraService } from '@/services/safraService'
import { talhaoService } from '@/services/talhaoService'
import { produtoService } from '@/services/produtoService'
import { maquinaService } from '@/services/maquinaService'
import { parceiroNegocioService } from '@/services/parceiroNegocioService'
import { ordemServicoService } from '@/services/ordemServicoService'
import CamposCondicionaisRenderer from '@/components/CamposCondicionaisRenderer.vue'

const props = defineProps<{
  isOpen: boolean
  initialData?: OrdemServico | null
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [payload: CreateOrdemServicoCompletoPayload]
}>()

const activeTab = ref(0)
const tabs = ['Geral', 'Talhoes', 'Insumos', 'Maquinas', 'Equipe']

const prioridadeOptions = [
  { value: PrioridadeOrdemServico.BAIXA, label: 'Baixa' },
  { value: PrioridadeOrdemServico.MEDIA, label: 'Media' },
  { value: PrioridadeOrdemServico.ALTA, label: 'Alta' },
  { value: PrioridadeOrdemServico.URGENTE, label: 'Urgente' },
]

const funcaoOptions = [
  { value: FuncaoResponsavelOS.RESPONSAVEL, label: 'Responsavel' },
  { value: FuncaoResponsavelOS.OPERADOR, label: 'Operador' },
  { value: FuncaoResponsavelOS.AUXILIAR, label: 'Auxiliar' },
  { value: FuncaoResponsavelOS.FISCAL, label: 'Fiscal' },
]

// Form state
const tipoAtividadeOSId = ref<number | null>(null)
const fazendaId = ref<number | null>(null)
const safraId = ref<number | null>(null)
const prioridade = ref<PrioridadeOrdemServico>(PrioridadeOrdemServico.MEDIA)
const descricao = ref('')
const dataPlanejadaInicio = ref('')
const dataPlanejadaFim = ref('')
const custoEstimado = ref<number | null>(null)
const observacoes = ref('')
const camposCondicionaisValores = ref<Record<string, any>>({})

// Children
interface TalhaoForm {
  talhaoId: number | null
  areaPlanejada: number | null
  observacoes: string
}
interface InsumoForm {
  produtoId: number | null
  quantidadePlanejada: number | null
  custoUnitarioPlanejado: number | null
}
interface MaquinaForm {
  maquinaId: number | null
  implementoId: number | null
  operadorId: number | null
  horasPlanejadas: number | null
  custoHoraPlanejado: number | null
}
interface ResponsavelForm {
  pessoaId: number | null
  funcao: FuncaoResponsavelOS
  horasPlanejadas: number | null
  custoHoraPlanejado: number | null
}

const talhoes = ref<TalhaoForm[]>([])
const insumos = ref<InsumoForm[]>([])
const maquinas = ref<MaquinaForm[]>([])
const responsaveis = ref<ResponsavelForm[]>([])

// Select options
const tiposAtividade = ref<TipoAtividadeOS[]>([])
const fazendas = ref<Propriedade[]>([])
const safras = ref<Safra[]>([])
const talhoesList = ref<Talhao[]>([])
const produtos = ref<Produto[]>([])
const maquinasList = ref<MaquinaVeiculo[]>([])
const pessoas = ref<ParceiroNegocio[]>([])

// Campos condicionais do tipo selecionado
const camposCondicionaisTipo = ref<CampoCondicionalTipoAtividade[]>([])

// Ref para CamposCondicionaisRenderer (T15.3)
const camposCondicionaisRef = ref<{ validar: () => boolean } | null>(null)

// Painel de carga de trabalho (T12.3)
const showCargaPanel = ref(false)
const cargaPessoaId = ref<number | null>(null)
const cargaTrabalhoData = ref<CargaTrabalho | null>(null)
const historicoData = ref<HistoricoExecucao | null>(null)
const isLoadingCarga = ref(false)

const talhoesFiltrados = computed(() => {
  if (!fazendaId.value) return talhoesList.value
  return talhoesList.value.filter((t) => t.idFazenda === fazendaId.value)
})

const loadSelectOptions = async () => {
  const results = await Promise.allSettled([
    tipoAtividadeOSService.getAllNoPagination(),
    propriedadeService.getAllNoPagination(),
    safraService.getAllNoPagination(),
    talhaoService.getAllNoPagination(),
    produtoService.getAllNoPagination(),
    maquinaService.getAll(1, 999),
    parceiroNegocioService.getAll(1, 999),
  ])
  const val = (r: PromiseSettledResult<any>) => r.status === 'fulfilled' ? r.value : null
  const tiposRes = val(results[0])
  const fazendasRes = val(results[1])
  const safrasRes = val(results[2])
  const talhoesRes = val(results[3])
  const produtosRes = val(results[4])
  const maquinasRes = val(results[5])
  const pessoasRes = val(results[6])
  if (tiposRes) tiposAtividade.value = tiposRes.data as TipoAtividadeOS[]
  if (fazendasRes) fazendas.value = (fazendasRes as any).data || fazendasRes as any
  if (safrasRes) safras.value = (safrasRes as any).data || safrasRes as any
  if (talhoesRes) talhoesList.value = Array.isArray(talhoesRes) ? talhoesRes : (talhoesRes as any).data || []
  if (produtosRes) produtos.value = (produtosRes as any).data || produtosRes as any
  if (maquinasRes) maquinasList.value = (maquinasRes as any).data || maquinasRes as any
  if (pessoasRes) pessoas.value = (pessoasRes as any).data || pessoasRes as any
}

// Watch tipo atividade para buscar campos condicionais (T15.3 - clear on change)
watch(tipoAtividadeOSId, async (newVal, oldVal) => {
  // Se havia valores preenchidos e estamos trocando de tipo, confirmar
  if (oldVal && newVal !== oldVal && Object.keys(camposCondicionaisValores.value).length > 0) {
    const hasValues = Object.values(camposCondicionaisValores.value).some(v => v !== '' && v !== null && v !== undefined)
    if (hasValues) {
      if (!confirm('Trocar o tipo de atividade ira limpar os campos condicionais ja preenchidos. Deseja continuar?')) {
        // Revert
        tipoAtividadeOSId.value = oldVal
        return
      }
    }
    camposCondicionaisValores.value = {}
  }

  if (newVal) {
    const tipo = tiposAtividade.value.find((t) => t.id === newVal)
    if (tipo && tipo.camposCondicionais) {
      camposCondicionaisTipo.value = tipo.camposCondicionais
    } else {
      try {
        const res = await tipoAtividadeOSService.getById(newVal)
        const data = (res as any).data || res
        camposCondicionaisTipo.value = data.camposCondicionais || []
      } catch {
        camposCondicionaisTipo.value = []
      }
    }
  } else {
    camposCondicionaisTipo.value = []
  }
})

const resetForm = () => {
  activeTab.value = 0
  tipoAtividadeOSId.value = null
  fazendaId.value = null
  safraId.value = null
  prioridade.value = PrioridadeOrdemServico.MEDIA
  descricao.value = ''
  dataPlanejadaInicio.value = ''
  dataPlanejadaFim.value = ''
  custoEstimado.value = null
  observacoes.value = ''
  camposCondicionaisValores.value = {}
  talhoes.value = []
  insumos.value = []
  maquinas.value = []
  responsaveis.value = []
  camposCondicionaisTipo.value = []
  showCargaPanel.value = false
  cargaPessoaId.value = null
  cargaTrabalhoData.value = null
  historicoData.value = null
}

const loadFromData = (data: OrdemServico) => {
  activeTab.value = 0
  tipoAtividadeOSId.value = data.tipoAtividadeOSId
  fazendaId.value = data.fazendaId
  safraId.value = data.safraId
  prioridade.value = data.prioridade
  descricao.value = data.descricao || ''
  dataPlanejadaInicio.value = data.dataPlanejadaInicio?.split('T')[0] || ''
  dataPlanejadaFim.value = data.dataPlanejadaFim?.split('T')[0] || ''
  custoEstimado.value = data.custoEstimado
  observacoes.value = data.observacoes || ''
  camposCondicionaisValores.value = data.camposCondicionais || {}

  talhoes.value = (data.talhoes || []).map((t) => ({
    talhaoId: t.talhaoId,
    areaPlanejada: t.areaPlanejada,
    observacoes: t.observacoes || '',
  }))
  insumos.value = (data.insumos || []).map((i) => ({
    produtoId: i.produtoId,
    quantidadePlanejada: i.quantidadePlanejada,
    custoUnitarioPlanejado: i.custoUnitarioPlanejado,
  }))
  maquinas.value = (data.maquinas || []).map((m) => ({
    maquinaId: m.maquinaId,
    implementoId: m.implementoId,
    operadorId: m.operadorId,
    horasPlanejadas: m.horasPlanejadas,
    custoHoraPlanejado: m.custoHoraPlanejado,
  }))
  responsaveis.value = (data.responsaveis || []).map((r) => ({
    pessoaId: r.pessoaId,
    funcao: r.funcao,
    horasPlanejadas: r.horasPlanejadas,
    custoHoraPlanejado: r.custoHoraPlanejado,
  }))
}

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      loadSelectOptions()
      if (props.initialData) {
        loadFromData(props.initialData)
      } else {
        resetForm()
      }
    }
  }
)

// Child add/remove
const addTalhao = () => talhoes.value.push({ talhaoId: null, areaPlanejada: null, observacoes: '' })
const removeTalhao = (i: number) => talhoes.value.splice(i, 1)
const addInsumo = () => insumos.value.push({ produtoId: null, quantidadePlanejada: null, custoUnitarioPlanejado: null })
const removeInsumo = (i: number) => insumos.value.splice(i, 1)
const addMaquina = () => maquinas.value.push({ maquinaId: null, implementoId: null, operadorId: null, horasPlanejadas: null, custoHoraPlanejado: null })
const removeMaquina = (i: number) => maquinas.value.splice(i, 1)
const addResponsavel = () => responsaveis.value.push({ pessoaId: null, funcao: FuncaoResponsavelOS.AUXILIAR, horasPlanejadas: null, custoHoraPlanejado: null })
const removeResponsavel = (i: number) => responsaveis.value.splice(i, 1)

// Painel de carga de trabalho (T12.3)
const handleVerCarga = async (pessoaId: number | null) => {
  if (!pessoaId) return
  cargaPessoaId.value = pessoaId
  showCargaPanel.value = true
  isLoadingCarga.value = true
  try {
    const [cargaRes, historicoRes] = await Promise.all([
      ordemServicoService.getCargaTrabalho({ fazendaId: fazendaId.value || undefined }),
      ordemServicoService.getHistoricoExecucao(pessoaId),
    ])
    const cargaList = cargaRes.data as CargaTrabalho[]
    cargaTrabalhoData.value = cargaList.find(c => c.pessoaId === pessoaId) || null
    historicoData.value = historicoRes.data as HistoricoExecucao
  } catch {
    cargaTrabalhoData.value = null
    historicoData.value = null
  } finally {
    isLoadingCarga.value = false
  }
}

const closeCargaPanel = () => {
  showCargaPanel.value = false
  cargaPessoaId.value = null
}

const cargaCorClass = computed(() => {
  if (!cargaTrabalhoData.value) return 'bg-gray-200'
  const h = cargaTrabalhoData.value.horasPlanejadas
  if (h < 30) return 'bg-green-500'
  if (h <= 40) return 'bg-amber-500'
  return 'bg-red-500'
})

const cargaCorLabel = computed(() => {
  if (!cargaTrabalhoData.value) return 'text-gray-500'
  const h = cargaTrabalhoData.value.horasPlanejadas
  if (h < 30) return 'text-green-600'
  if (h <= 40) return 'text-amber-600'
  return 'text-red-600'
})

const cargaPercent = computed(() => {
  if (!cargaTrabalhoData.value) return 0
  return Math.min((cargaTrabalhoData.value.horasPlanejadas / 40) * 100, 100)
})

const taxaConclusao = computed(() => {
  if (!historicoData.value || !historicoData.value.totalOS) return 0
  return ((historicoData.value.totalConcluidas + historicoData.value.totalValidadas) / historicoData.value.totalOS * 100)
})

const pessoaNome = computed(() => {
  if (!cargaPessoaId.value) return ''
  const p = pessoas.value.find(p => p.id_pessoa === cargaPessoaId.value)
  return p?.nomerazao_pessoa || ''
})

const handleSave = () => {
  if (props.loading) return
  if (!tipoAtividadeOSId.value) { alert('Tipo de Atividade e obrigatorio.'); return }
  if (!fazendaId.value) { alert('Fazenda e obrigatoria.'); return }
  // Validar campos condicionais obrigatorios (T15.3)
  if (camposCondicionaisRef.value && !camposCondicionaisRef.value.validar()) {
    activeTab.value = 0
    return
  }

  const payload: CreateOrdemServicoCompletoPayload = {
    tipoAtividadeOSId: tipoAtividadeOSId.value,
    fazendaId: fazendaId.value,
    safraId: safraId.value || undefined,
    prioridade: prioridade.value,
    descricao: descricao.value || undefined,
    dataPlanejadaInicio: dataPlanejadaInicio.value || undefined,
    dataPlanejadaFim: dataPlanejadaFim.value || undefined,
    custoEstimado: custoEstimado.value || undefined,
    observacoes: observacoes.value || undefined,
    camposCondicionais: Object.keys(camposCondicionaisValores.value).length > 0 ? camposCondicionaisValores.value : undefined,
    talhoes: talhoes.value.filter((t) => t.talhaoId).map((t) => ({
      talhaoId: t.talhaoId!,
      areaPlanejada: t.areaPlanejada,
      areaReal: null,
      percentualArea: null,
      custoRateado: null,
      observacoes: t.observacoes || null,
    })),
    insumos: insumos.value.filter((i) => i.produtoId).map((i) => ({
      produtoId: i.produtoId!,
      unidadeMedidaId: null,
      quantidadePlanejada: i.quantidadePlanejada,
      custoUnitarioPlanejado: i.custoUnitarioPlanejado,
      quantidadeReal: null,
      custoUnitarioReal: null,
      dosagem: null,
      areaAplicada: null,
      observacoes: null,
    })),
    maquinas: maquinas.value.filter((m) => m.maquinaId).map((m) => ({
      maquinaId: m.maquinaId!,
      implementoId: m.implementoId,
      operadorId: m.operadorId,
      horasPlanejadas: m.horasPlanejadas,
      custoHoraPlanejado: m.custoHoraPlanejado,
      horasReais: null,
      custoHoraReal: null,
      horimetroInicio: null,
      horimetroFim: null,
      areaTrabalhada: null,
      consumoCombustivel: null,
      observacoes: null,
    })),
    responsaveis: responsaveis.value.filter((r) => r.pessoaId).map((r) => ({
      pessoaId: r.pessoaId!,
      funcao: r.funcao,
      horasPlanejadas: r.horasPlanejadas,
      custoHoraPlanejado: r.custoHoraPlanejado,
      horasReais: null,
      custoHoraReal: null,
      observacoes: null,
    })),
  }

  emit('save', payload)
}

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent'
const selectClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent'
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-full sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ initialData ? 'Editar Ordem de Servico' : 'Nova Ordem de Servico' }}
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Tabs navigation -->
      <div class="flex border-b border-gray-200 px-6">
        <button
          v-for="(tab, i) in tabs"
          :key="tab"
          @click="activeTab = i"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px"
          :class="activeTab === i ? 'border-lime-600 text-lime-700' : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          {{ tab }}
          <span
            v-if="i === 1 && talhoes.length > 0"
            class="ml-1 px-1.5 py-0.5 bg-lime-100 text-lime-700 text-xs rounded-full"
          >{{ talhoes.length }}</span>
          <span
            v-if="i === 2 && insumos.length > 0"
            class="ml-1 px-1.5 py-0.5 bg-lime-100 text-lime-700 text-xs rounded-full"
          >{{ insumos.length }}</span>
          <span
            v-if="i === 3 && maquinas.length > 0"
            class="ml-1 px-1.5 py-0.5 bg-lime-100 text-lime-700 text-xs rounded-full"
          >{{ maquinas.length }}</span>
          <span
            v-if="i === 4 && responsaveis.length > 0"
            class="ml-1 px-1.5 py-0.5 bg-lime-100 text-lime-700 text-xs rounded-full"
          >{{ responsaveis.length }}</span>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
        <!-- Tab Geral -->
        <div v-show="activeTab === 0" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Tipo Atividade -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Tipo de Atividade *</label>
              <select v-model.number="tipoAtividadeOSId" :class="selectClass">
                <option :value="null">Selecione...</option>
                <option v-for="tipo in tiposAtividade" :key="tipo.id" :value="tipo.id">
                  {{ tipo.nome }}
                </option>
              </select>
            </div>
            <!-- Fazenda -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Fazenda *</label>
              <select v-model.number="fazendaId" :class="selectClass">
                <option :value="null">Selecione...</option>
                <option v-for="f in fazendas" :key="f.id" :value="f.id">
                  {{ f.descricao }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Safra -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Safra</label>
              <select v-model.number="safraId" :class="selectClass">
                <option :value="null">Nenhuma</option>
                <option v-for="s in safras" :key="(s as any).id || (s as any).id_safra" :value="(s as any).id || (s as any).id_safra">
                  {{ (s as any).nome || (s as any).descricao }}
                </option>
              </select>
            </div>
            <!-- Prioridade -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Prioridade</label>
              <select v-model="prioridade" :class="selectClass">
                <option v-for="p in prioridadeOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
              </select>
            </div>
          </div>

          <!-- Descricao -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Descricao</label>
            <textarea v-model="descricao" rows="2" :class="inputClass + ' resize-none'" placeholder="Descricao da OS..."></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Data Planejada Inicio</label>
              <input v-model="dataPlanejadaInicio" type="date" :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Data Planejada Fim</label>
              <input v-model="dataPlanejadaFim" type="date" :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Custo Estimado (R$)</label>
              <input v-model.number="custoEstimado" type="number" step="0.01" :class="inputClass" placeholder="0,00" />
            </div>
          </div>

          <!-- Observacoes -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Observacoes</label>
            <textarea v-model="observacoes" rows="2" :class="inputClass + ' resize-none'" placeholder="Observacoes..."></textarea>
          </div>

          <!-- Campos condicionais -->
          <CamposCondicionaisRenderer
            v-if="camposCondicionaisTipo.length > 0"
            ref="camposCondicionaisRef"
            :campos="camposCondicionaisTipo"
            :valores="camposCondicionaisValores"
            @update="camposCondicionaisValores = $event"
          />
        </div>

        <!-- Tab Talhoes -->
        <div v-show="activeTab === 1" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-gray-700">Talhoes</h3>
            <button @click="addTalhao" type="button" class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-lime-700 bg-lime-50 border border-lime-200 rounded-lg hover:bg-lime-100 transition-colors">
              <Plus class="h-3.5 w-3.5 mr-1" /> Adicionar Talhao
            </button>
          </div>
          <div v-if="talhoes.length === 0" class="text-sm text-gray-400 text-center py-8">Nenhum talhao adicionado.</div>
          <div v-else class="space-y-3">
            <div v-for="(t, i) in talhoes" :key="i" class="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div class="flex items-start gap-3">
                <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Talhao *</label>
                    <select v-model.number="t.talhaoId" :class="selectClass">
                      <option :value="null">Selecione...</option>
                      <option v-for="tl in talhoesFiltrados" :key="tl.id_talhao" :value="tl.id_talhao">{{ tl.descricao }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Area Planejada (ha)</label>
                    <input v-model.number="t.areaPlanejada" type="number" step="0.01" :class="inputClass" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Observacoes</label>
                    <input v-model="t.observacoes" type="text" :class="inputClass" />
                  </div>
                </div>
                <button @click="removeTalhao(i)" class="mt-5 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Insumos -->
        <div v-show="activeTab === 2" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-gray-700">Insumos</h3>
            <button @click="addInsumo" type="button" class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-lime-700 bg-lime-50 border border-lime-200 rounded-lg hover:bg-lime-100 transition-colors">
              <Plus class="h-3.5 w-3.5 mr-1" /> Adicionar Insumo
            </button>
          </div>
          <div v-if="insumos.length === 0" class="text-sm text-gray-400 text-center py-8">Nenhum insumo adicionado.</div>
          <div v-else class="space-y-3">
            <div v-for="(ins, i) in insumos" :key="i" class="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div class="flex items-start gap-3">
                <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Produto *</label>
                    <select v-model.number="ins.produtoId" :class="selectClass">
                      <option :value="null">Selecione...</option>
                      <option v-for="p in produtos" :key="(p as any).id || (p as any).id_produto" :value="(p as any).id || (p as any).id_produto">{{ (p as any).descricao || (p as any).nome }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Qtd Planejada</label>
                    <input v-model.number="ins.quantidadePlanejada" type="number" step="0.01" :class="inputClass" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Custo Unit. (R$)</label>
                    <input v-model.number="ins.custoUnitarioPlanejado" type="number" step="0.01" :class="inputClass" />
                  </div>
                </div>
                <button @click="removeInsumo(i)" class="mt-5 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Maquinas -->
        <div v-show="activeTab === 3" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-gray-700">Maquinas</h3>
            <button @click="addMaquina" type="button" class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-lime-700 bg-lime-50 border border-lime-200 rounded-lg hover:bg-lime-100 transition-colors">
              <Plus class="h-3.5 w-3.5 mr-1" /> Adicionar Maquina
            </button>
          </div>
          <div v-if="maquinas.length === 0" class="text-sm text-gray-400 text-center py-8">Nenhuma maquina adicionada.</div>
          <div v-else class="space-y-3">
            <div v-for="(maq, i) in maquinas" :key="i" class="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div class="flex items-start gap-3">
                <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Maquina *</label>
                    <select v-model.number="maq.maquinaId" :class="selectClass">
                      <option :value="null">Selecione...</option>
                      <option v-for="m in maquinasList" :key="m.id_mqn" :value="m.id_mqn">{{ m.descricao }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Implemento</label>
                    <select v-model.number="maq.implementoId" :class="selectClass">
                      <option :value="null">Nenhum</option>
                      <option v-for="m in maquinasList" :key="m.id_mqn" :value="m.id_mqn">{{ m.descricao }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Operador</label>
                    <select v-model.number="maq.operadorId" :class="selectClass">
                      <option :value="null">Nenhum</option>
                      <option v-for="p in pessoas" :key="p.id_pessoa" :value="p.id_pessoa">{{ p.nomerazao_pessoa }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Horas Planejadas</label>
                    <input v-model.number="maq.horasPlanejadas" type="number" step="0.5" :class="inputClass" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Custo/Hora (R$)</label>
                    <input v-model.number="maq.custoHoraPlanejado" type="number" step="0.01" :class="inputClass" />
                  </div>
                </div>
                <button @click="removeMaquina(i)" class="mt-5 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Equipe (T12.3 - com painel de carga) -->
        <div v-show="activeTab === 4" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-gray-700">Equipe</h3>
            <button @click="addResponsavel" type="button" class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-lime-700 bg-lime-50 border border-lime-200 rounded-lg hover:bg-lime-100 transition-colors">
              <Plus class="h-3.5 w-3.5 mr-1" /> Adicionar Membro
            </button>
          </div>

          <div class="flex gap-4">
            <!-- Lista de responsaveis -->
            <div class="flex-1">
              <div v-if="responsaveis.length === 0" class="text-sm text-gray-400 text-center py-8">Nenhum membro adicionado.</div>
              <div v-else class="space-y-3">
                <div v-for="(resp, i) in responsaveis" :key="i" class="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div class="flex items-start gap-3">
                    <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">Pessoa *</label>
                        <div class="flex gap-1">
                          <select v-model.number="resp.pessoaId" :class="selectClass">
                            <option :value="null">Selecione...</option>
                            <option v-for="p in pessoas" :key="p.id_pessoa" :value="p.id_pessoa">{{ p.nomerazao_pessoa }}</option>
                          </select>
                          <button
                            v-if="resp.pessoaId"
                            @click="handleVerCarga(resp.pessoaId)"
                            type="button"
                            class="shrink-0 px-2 py-1 text-xs font-medium text-lime-700 bg-lime-50 border border-lime-200 rounded-lg hover:bg-lime-100 transition-colors"
                            title="Ver carga de trabalho"
                          >
                            <Users class="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">Funcao</label>
                        <select v-model="resp.funcao" :class="selectClass">
                          <option v-for="f in funcaoOptions" :key="f.value" :value="f.value">{{ f.label }}</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">Horas Plan.</label>
                        <input v-model.number="resp.horasPlanejadas" type="number" step="0.5" :class="inputClass" />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">Custo/Hora (R$)</label>
                        <input v-model.number="resp.custoHoraPlanejado" type="number" step="0.01" :class="inputClass" />
                      </div>
                    </div>
                    <button @click="removeResponsavel(i)" class="mt-5 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Painel lateral de carga (T12.3) -->
            <div
              v-if="showCargaPanel"
              class="w-72 shrink-0 border border-gray-200 rounded-lg bg-white p-4 space-y-4"
            >
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-bold text-gray-700">Carga de Trabalho</h4>
                <button @click="closeCargaPanel" class="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100">
                  <X class="h-4 w-4" />
                </button>
              </div>

              <!-- Loading -->
              <div v-if="isLoadingCarga" class="flex items-center justify-center py-6">
                <div class="w-6 h-6 border-3 border-lime-200 border-t-lime-600 rounded-full animate-spin"></div>
              </div>

              <template v-else>
                <p class="text-xs font-medium text-gray-500 truncate">{{ pessoaNome }}</p>

                <!-- Barra visual de carga semanal -->
                <div v-if="cargaTrabalhoData" class="space-y-2">
                  <div>
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-gray-500">Horas da Semana</span>
                      <span class="font-bold" :class="cargaCorLabel">
                        {{ cargaTrabalhoData.horasPlanejadas.toFixed(0) }}h / 40h
                      </span>
                    </div>
                    <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-300"
                        :class="cargaCorClass"
                        :style="{ width: cargaPercent + '%' }"
                      ></div>
                    </div>
                  </div>

                  <!-- Horas reais -->
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-500">Horas Reais</span>
                    <span class="font-medium text-gray-700">{{ cargaTrabalhoData.horasReais.toFixed(0) }}h</span>
                  </div>

                  <!-- OS ativas -->
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-500">OS Ativas</span>
                    <span class="font-bold text-gray-900">{{ cargaTrabalhoData.osAtivas }}</span>
                  </div>
                </div>

                <div v-else class="text-xs text-gray-400 text-center py-2">
                  Sem dados de carga para esta semana.
                </div>

                <!-- Historico resumido -->
                <div v-if="historicoData" class="border-t border-gray-200 pt-3 space-y-2">
                  <p class="text-xs font-bold text-gray-600 uppercase">Historico</p>
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-500">Total OS</span>
                    <span class="font-medium text-gray-700">{{ historicoData.totalOS }}</span>
                  </div>
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-500">Taxa Conclusao</span>
                    <span class="font-medium text-gray-700">{{ taxaConclusao.toFixed(0) }}%</span>
                  </div>
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-500">Media Horas/OS</span>
                    <span class="font-medium text-gray-700">{{ historicoData.mediaHorasPorOS.toFixed(1) }}h</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
        <button @click="$emit('close')" class="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
          Cancelar
        </button>
        <button
          @click="handleSave"
          :disabled="loading"
          class="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <span v-if="loading" class="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          <Save v-else class="w-4 h-4 mr-2" />
          {{ loading ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
</style>
