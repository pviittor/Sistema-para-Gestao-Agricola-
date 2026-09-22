<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue3-toastify'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  CheckCircle,
  XCircle,
  FileText,
  ArrowDownToLine,
  RefreshCw,
  TrendingDown,
  Upload,
  DollarSign,
} from 'lucide-vue-next'
import NotaFiscalModal from '@/components/NotaFiscalModal.vue'
import NotaFiscalItensModal from '@/components/NotaFiscalItensModal.vue'
import type { NotaFiscal } from '@/types/NotaFiscal'
import type { ParsedNfe } from '@/types/ParsedNfe'
import { NF_STATUS_LABELS, NF_STATUS_COLORS } from '@/types/NotaFiscal'
import { notaFiscalService } from '@/services/notaFiscalService'

// Estado do modal NF
const isNfModalOpen = ref(false)
const isSavingNf = ref(false)
const editingNf = ref<NotaFiscal | null>(null)
const parsedNfeData = ref<ParsedNfe | null>(null)

// Estado do upload XML
const isImporting = ref(false)
const xmlFileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

// Estado do modal de itens
const isItensModalOpen = ref(false)
const selectedNf = ref<NotaFiscal | null>(null)

// Lista
const items = ref<NotaFiscal[]>([])
const loading = ref(false)
const searchTerm = ref('')
const filterStatus = ref('')

const filteredItems = computed(() => {
  let list = items.value
  if (filterStatus.value) {
    list = list.filter((i) => i.status === filterStatus.value)
  }
  if (!searchTerm.value) return list
  const term = searchTerm.value.toLowerCase()
  return list.filter(
    (i) =>
      i.numero.toLowerCase().includes(term) ||
      (i.emitente?.nomerazao_pessoa ?? '').toLowerCase().includes(term) ||
      (i.destinatario?.nomerazao_pessoa ?? '').toLowerCase().includes(term) ||
      (i.chave_acesso ?? '').includes(term),
  )
})

const totais = computed(() => ({
  qtd: filteredItems.value.length,
  valor: filteredItems.value.reduce((acc, i) => acc + (i.vl_total ?? 0), 0),
  pendentes: filteredItems.value.filter((i) => !i.estoque_movimentado && i.status === 'autorizada')
    .length,
}))

const fmt = (v?: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

const fmtDate = (d?: string) => {
  if (!d) return '-'
  const [y, m, day] = (d.split('T')[0] ?? d).split('-')
  return `${day ?? ''}/${m ?? ''}/${y ?? ''}`
}

const loadItems = async () => {
  loading.value = true
  try {
    const currentYear = new Date().getFullYear()
    items.value = await notaFiscalService.findByPeriodo(
      `${currentYear - 1}-01-01`,
      `${currentYear + 1}-12-31`,
      'entrada',
    )
  } catch (e: any) {
    console.error(e)
    toast.error(e?.response?.data?.message ?? 'Erro ao carregar notas fiscais.')
  } finally {
    loading.value = false
  }
}

onMounted(loadItems)

const handleNew = () => {
  editingNf.value = null
  isNfModalOpen.value = true
}

const handleEdit = (nf: NotaFiscal) => {
  editingNf.value = nf
  isNfModalOpen.value = true
}

const handleSaveNf = async (data: Partial<NotaFiscal>) => {
  isSavingNf.value = true
  try {
    if (editingNf.value?.id_nf) {
      await notaFiscalService.update(editingNf.value.id_nf, data)
      toast.success('Nota fiscal atualizada com sucesso!')
    } else if ((data as any).itens?.length > 0) {
      await notaFiscalService.createCompleto(data)
      toast.success('Nota fiscal criada com itens importados!')
    } else {
      await notaFiscalService.create(data)
      toast.success('Nota fiscal criada com sucesso!')
    }
    isNfModalOpen.value = false
    await loadItems()
  } catch (e: any) {
    console.error(e)
    toast.error(e?.response?.data?.message ?? 'Erro ao salvar nota fiscal.')
  } finally {
    isSavingNf.value = false
  }
}

const handleDelete = async (nf: NotaFiscal) => {
  if (!nf.id_nf) return
  if (!confirm(`Excluir NF ${nf.numero}/${nf.serie}?`)) return
  try {
    await notaFiscalService.delete(nf.id_nf)
    toast.success('Nota fiscal excluída.')
    await loadItems()
  } catch (e: any) {
    console.error(e)
    toast.error(e?.response?.data?.message ?? 'Erro ao excluir.')
  }
}

const handleAutorizar = async (nf: NotaFiscal) => {
  if (!nf.id_nf) return
  if (!confirm(`Autorizar NF ${nf.numero}/${nf.serie}?`)) return
  try {
    const updatedNf = await notaFiscalService.autorizar(nf.id_nf)
    toast.success('NF autorizada com sucesso!')
    
    // Atualiza localmente
    const index = items.value.findIndex((i) => i.id_nf === nf.id_nf)
    if (index !== -1) {
      items.value[index] = updatedNf
    } else {
      await loadItems()
    }
  } catch (e: any) {
    console.error(e)
    toast.error(e?.response?.data?.message ?? 'Erro ao autorizar.')
  }
}

const handleCancelar = async (nf: NotaFiscal) => {
  if (!nf.id_nf) return
  const motivo = prompt('Informe o motivo do cancelamento:')
  if (!motivo) return
  try {
    await notaFiscalService.cancelar(nf.id_nf, motivo)
    toast.success('NF cancelada.')
    await loadItems()
  } catch (e: any) {
    console.error(e)
    toast.error(e?.response?.data?.message ?? 'Erro ao cancelar.')
  }
}

const handleMovimentarEstoque = async (nf: NotaFiscal) => {
  if (!nf.id_nf) return
  if (!confirm(`Movimentar estoque para NF ${nf.numero}/${nf.serie}?`)) return
  try {
    await notaFiscalService.movimentarEstoque(nf.id_nf)
    toast.success('Estoque movimentado com sucesso!')
    await loadItems()
  } catch (e: any) {
    console.error(e)
    toast.error(e?.response?.data?.message ?? 'Erro ao movimentar estoque.')
  }
}

const handleGerenciarItens = (nf: NotaFiscal) => {
  selectedNf.value = nf
  isItensModalOpen.value = true
}

const onItensUpdated = async () => {
  await loadItems()
  if (selectedNf.value?.id_nf) {
    const updated = items.value.find((i) => i.id_nf === selectedNf.value?.id_nf)
    if (updated) selectedNf.value = updated
  }
}

const handleImportarXml = () => {
  xmlFileInput.value?.click()
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  if (!file.name.toLowerCase().endsWith('.xml')) {
    toast.warning('Apenas arquivos .xml são permitidos')
    return
  }
  await processXmlFile(file)
}

const processXmlFile = async (file: File) => {
  isImporting.value = true
  try {
    const parsed = await notaFiscalService.importarXml(file)
    parsedNfeData.value = parsed
    editingNf.value = null
    isNfModalOpen.value = true
    toast.success('XML importado com sucesso!')
  } catch (e: any) {
    console.error(e)
    toast.error(e?.response?.data?.error?.message ?? 'Erro ao importar XML.')
  } finally {
    isImporting.value = false
  }
}

const onXmlFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  await processXmlFile(file)
  input.value = '' // limpar input para permitir re-upload do mesmo arquivo
}

const handleGerarFinanceiro = async (nf: NotaFiscal) => {
  if (!nf.id_nf) return
  if (!confirm(`Gerar títulos a pagar para NF ${nf.numero}/${nf.serie}?`)) return
  try {
    await notaFiscalService.gerarFinanceiro(nf.id_nf)
    toast.success('Financeiro gerado com sucesso!')
    await loadItems()
  } catch (e: any) {
    console.error(e)
    toast.error(e?.response?.data?.error?.message ?? 'Erro ao gerar financeiro.')
  }
}

const handleCloseNfModal = () => {
  isNfModalOpen.value = false
  parsedNfeData.value = null
}

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'autorizada', label: 'Autorizada' },
  { value: 'cancelada', label: 'Cancelada' },
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <!-- Input oculto para upload XML -->
    <input
      ref="xmlFileInput"
      type="file"
      accept=".xml"
      class="hidden"
      @change="onXmlFileSelected"
    />

    <!-- NF Modal -->
    <NotaFiscalModal
      :is-open="isNfModalOpen"
      tipo="entrada"
      :initial-data="editingNf"
      :parsed-nfe="parsedNfeData"
      :loading="isSavingNf"
      @close="handleCloseNfModal"
      @save="handleSaveNf"
    />

    <!-- Itens Modal -->
    <NotaFiscalItensModal
      :is-open="isItensModalOpen"
      :nota-fiscal="selectedNf"
      @close="isItensModalOpen = false"
      @updated="onItensUpdated"
    />

    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="h-12 w-12 rounded-xl bg-lime-100 flex items-center justify-center">
            <ArrowDownToLine class="h-6 w-6 text-lime-600" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">NF de Entrada</h1>
            <p class="text-gray-500 mt-0.5 text-sm">Notas fiscais recebidas de fornecedores</p>
          </div>
        </div>
        <div
          class="flex items-center gap-2 p-2 rounded-lg border-2 border-dashed transition-colors"
          :class="isDragging ? 'border-lime-500 bg-lime-50' : 'border-transparent'"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <button
            @click="handleImportarXml"
            :disabled="isImporting"
            class="inline-flex items-center px-4 py-2 border border-lime-600 rounded-lg shadow-sm text-sm font-medium text-lime-700 bg-white hover:bg-lime-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors disabled:opacity-50"
          >
            <Upload class="h-4 w-4 mr-2" :class="{ 'animate-spin': isImporting }" />
            {{ isImporting ? 'Importando...' : 'Importar XML' }}
          </button>
          <button
            @click="handleNew"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
          >
            <Plus class="h-4 w-4 mr-2" />
            Nova NF de Entrada
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total NFs</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ totais.qtd }}</p>
            </div>
            <div class="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText class="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Valor Total</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ fmt(totais.valor) }}</p>
            </div>
            <div class="h-10 w-10 rounded-lg bg-lime-50 flex items-center justify-center">
              <TrendingDown class="h-5 w-5 text-lime-600" />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Pend. Estoque</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ totais.pendentes }}</p>
            </div>
            <div class="h-10 w-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Package class="h-5 w-5 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-bold text-gray-900">Registros</h2>
            <button
              @click="loadItems"
              :disabled="loading"
              class="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              title="Recarregar"
            >
              <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': loading }" />
            </button>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative">
              <select
                v-model="filterStatus"
                class="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 appearance-none bg-white"
              >
                <option v-for="s in statusOptions" :key="s.value" :value="s.value">
                  {{ s.label }}
                </option>
              </select>
            </div>
            <div class="relative w-full sm:w-64">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search class="h-4 w-4 text-gray-400" />
              </div>
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Buscar por número ou emitente..."
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-16">
          <div class="w-8 h-8 border-4 border-lime-200 border-t-lime-600 rounded-full animate-spin"></div>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">NF</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Emitente (Fornecedor)</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dt. Emissão</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Valor Total</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Estoque</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Financeiro</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="nf in filteredItems"
                :key="nf.id_nf"
                class="hover:bg-gray-50 transition-colors"
              >
                <!-- NF info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="h-9 w-9 rounded-full bg-lime-100 flex items-center justify-center flex-shrink-0">
                      <ArrowDownToLine class="h-4 w-4 text-lime-600" />
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-900">{{ nf.numero }}/{{ nf.serie }}</p>
                      <p class="text-xs text-gray-400">Mod. {{ nf.modelo }}</p>
                    </div>
                  </div>
                </td>

                <!-- Emitente -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ nf.emitente?.nomerazao_pessoa ?? `ID: ${nf.emitenteId}` }}
                </td>

                <!-- Data -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ fmtDate(nf.data_emissao) }}
                </td>

                <!-- Valor -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                  {{ fmt(nf.vl_total) }}
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    v-if="nf.status"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="NF_STATUS_COLORS[nf.status]"
                  >
                    {{ NF_STATUS_LABELS[nf.status] }}
                  </span>
                </td>

                <!-- Estoque -->
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    v-if="nf.estoque_movimentado"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"
                  >
                    <CheckCircle class="h-3 w-3" />
                    Mov.
                  </span>
                  <span
                    v-else-if="nf.status === 'autorizada'"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"
                  >
                    Pendente
                  </span>
                  <span v-else class="text-gray-300 text-xs">-</span>
                </td>

                <!-- Financeiro -->
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    v-if="nf.financeiro_gerado"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"
                  >
                    <DollarSign class="h-3 w-3" />
                    Gerado
                  </span>
                  <span
                    v-else-if="nf.status === 'autorizada'"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"
                  >
                    Pendente
                  </span>
                  <span v-else class="text-gray-300 text-xs">-</span>
                </td>

                <!-- Ações -->
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">
                    <!-- Gerenciar Itens -->
                    <button
                      @click="handleGerenciarItens(nf)"
                      class="text-gray-400 hover:text-lime-600 transition-colors"
                      title="Gerenciar Itens"
                    >
                      <Package class="h-4 w-4" />
                    </button>

                    <!-- Editar -->
                    <button
                      v-if="nf.status === 'rascunho' || nf.status === 'pendente' || !nf.status"
                      @click="handleEdit(nf)"
                      class="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Editar"
                    >
                      <Pencil class="h-4 w-4" />
                    </button>

                    <!-- Autorizar -->
                    <button
                      v-if="nf.status === 'rascunho' || nf.status === 'pendente'"
                      @click="handleAutorizar(nf)"
                      class="text-gray-400 hover:text-green-600 transition-colors"
                      title="Autorizar"
                    >
                      <CheckCircle class="h-4 w-4" />
                    </button>

                    <!-- Movimentar Estoque -->
                    <button
                      v-if="nf.status === 'autorizada' && !nf.estoque_movimentado"
                      @click="handleMovimentarEstoque(nf)"
                      class="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Movimentar Estoque"
                    >
                      <Package class="h-4 w-4" />
                    </button>

                    <!-- Gerar Financeiro -->
                    <button
                      v-if="nf.status === 'autorizada' && !nf.financeiro_gerado"
                      @click="handleGerarFinanceiro(nf)"
                      class="text-gray-400 hover:text-emerald-600 transition-colors"
                      title="Gerar Financeiro"
                    >
                      <DollarSign class="h-4 w-4" />
                    </button>

                    <!-- Cancelar -->
                    <button
                      v-if="nf.status === 'autorizada'"
                      @click="handleCancelar(nf)"
                      class="text-gray-400 hover:text-orange-600 transition-colors"
                      title="Cancelar"
                    >
                      <XCircle class="h-4 w-4" />
                    </button>

                    <!-- Excluir -->
                    <button
                      v-if="nf.status === 'rascunho' || nf.status === 'pendente' || !nf.status"
                      @click="handleDelete(nf)"
                      class="text-gray-400 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredItems.length === 0 && !loading">
                <td colspan="8" class="px-6 py-12 text-center text-gray-400 text-sm">
                  <div class="flex flex-col items-center gap-2">
                    <FileText class="h-10 w-10 opacity-20" />
                    <p>Nenhuma nota fiscal de entrada encontrada.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
