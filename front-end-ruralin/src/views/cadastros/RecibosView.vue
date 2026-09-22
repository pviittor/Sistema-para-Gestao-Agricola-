<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2, Search, FileText, Ban, Download, Receipt } from 'lucide-vue-next'
import ReciboModal from '@/components/ReciboModal.vue'
import CancelarReciboModal from '@/components/CancelarReciboModal.vue'
import type { Recibo, ReciboKpis, ReciboFiltros, CreateReciboPayload } from '@/types/Recibo'
import { StatusRecibo } from '@/types/Recibo'
import { reciboService } from '@/services/reciboService'

// Modal state
const isModalOpen = ref(false)
const isCancelarModalOpen = ref(false)
const isSaving = ref(false)
const editingItem = ref<Recibo | null>(null)
const cancelingItem = ref<Recibo | null>(null)
const viewMode = ref(false)

// List state
const items = ref<Recibo[]>([])
const searchTerm = ref('')
const isLoading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const limit = 10

// KPIs
const kpis = ref<ReciboKpis>({
  totalEmitidos: 0,
  totalCancelados: 0,
  valorTotalEmitido: 0,
  quantidadePorFormaPagamento: {},
})

// Filters
const filtroStatus = ref('')
const filtroDataInicio = ref('')
const filtroDataFim = ref('')
const filtroBeneficiario = ref('')

// Selection for batch export
const selectedIds = ref<number[]>([])
const selectAll = ref(false)

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIds.value = items.value.map(i => i.id)
  } else {
    selectedIds.value = []
  }
}

const toggleSelect = (id: number) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR')
}

const fetchItems = async () => {
  isLoading.value = true
  try {
    const filtros: ReciboFiltros = {}
    if (filtroStatus.value) filtros.status = filtroStatus.value
    if (filtroDataInicio.value) filtros.dataInicio = filtroDataInicio.value
    if (filtroDataFim.value) filtros.dataFim = filtroDataFim.value
    if (filtroBeneficiario.value) filtros.beneficiario = filtroBeneficiario.value

    const result = await reciboService.getAll(currentPage.value, limit, filtros)
    items.value = result.data
    totalPages.value = result.totalPages
    total.value = result.total
  } catch (error) {
    console.error('Erro ao buscar recibos:', error)
    toast.error('Erro ao carregar recibos.')
  } finally {
    isLoading.value = false
  }
}

const fetchKpis = async () => {
  try {
    const filtros: any = {}
    if (filtroDataInicio.value) filtros.dataInicio = filtroDataInicio.value
    if (filtroDataFim.value) filtros.dataFim = filtroDataFim.value
    kpis.value = await reciboService.getKpis(filtros)
  } catch (error) {
    console.error('Erro ao buscar KPIs:', error)
  }
}

const handleNew = () => {
  editingItem.value = null
  viewMode.value = false
  isModalOpen.value = true
}

const handleView = (item: Recibo) => {
  editingItem.value = item
  viewMode.value = true
  isModalOpen.value = true
}

const handleEdit = (item: Recibo) => {
  if (item.status === StatusRecibo.CANCELADO) {
    toast.warning('Recibo cancelado não pode ser editado.')
    return
  }
  editingItem.value = item
  viewMode.value = false
  isModalOpen.value = true
}

const handleSave = async (data: CreateReciboPayload) => {
  isSaving.value = true
  try {
    if (editingItem.value?.id) {
      await reciboService.update(editingItem.value.id, data)
      toast.success('Recibo atualizado com sucesso!')
    } else {
      await reciboService.create(data)
      toast.success('Recibo emitido com sucesso!')
    }
    isModalOpen.value = false
    fetchItems()
    fetchKpis()
  } catch (error: any) {
    console.error('Erro ao salvar:', error)
    const msg = error?.response?.data?.error?.message || 'Erro ao salvar. Tente novamente.'
    toast.error(msg)
  } finally {
    isSaving.value = false
  }
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir este recibo?')) {
    try {
      await reciboService.delete(id)
      toast.success('Recibo excluído com sucesso!')
      fetchItems()
      fetchKpis()
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || 'Erro ao excluir.'
      toast.error(msg)
    }
  }
}

const handleCancelar = (item: Recibo) => {
  cancelingItem.value = item
  isCancelarModalOpen.value = true
}

const confirmCancelar = async (motivo: string) => {
  if (!cancelingItem.value) return
  try {
    await reciboService.cancelar(cancelingItem.value.id, { motivoCancelamento: motivo })
    toast.success('Recibo cancelado com sucesso!')
    isCancelarModalOpen.value = false
    cancelingItem.value = null
    fetchItems()
    fetchKpis()
  } catch (error: any) {
    const msg = error?.response?.data?.error?.message || 'Erro ao cancelar.'
    toast.error(msg)
  }
}

const handleDownloadPdf = async (item: Recibo) => {
  try {
    const blob = await reciboService.downloadPdf(item.id)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `recibo-${item.numeroFormatado}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
    toast.success('PDF gerado com sucesso!')
  } catch (error) {
    toast.error('Erro ao gerar PDF.')
  }
}

const handleExportarLote = async () => {
  if (selectedIds.value.length === 0) {
    toast.warning('Selecione pelo menos um recibo.')
    return
  }
  try {
    const blob = await reciboService.exportarLote(selectedIds.value)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'recibos.zip'
    link.click()
    window.URL.revokeObjectURL(url)
    toast.success('Lote exportado com sucesso!')
  } catch (error) {
    toast.error('Erro ao exportar lote.')
  }
}

const handleApplyFilters = () => {
  currentPage.value = 1
  fetchItems()
  fetchKpis()
}

const handleClearFilters = () => {
  filtroStatus.value = ''
  filtroDataInicio.value = ''
  filtroDataFim.value = ''
  filtroBeneficiario.value = ''
  currentPage.value = 1
  fetchItems()
  fetchKpis()
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchItems()
  }
}

onMounted(() => {
  fetchItems()
  fetchKpis()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <ReciboModal
      :is-open="isModalOpen"
      :initial-data="editingItem"
      :loading="isSaving"
      :view-mode="viewMode"
      @close="isModalOpen = false"
      @save="handleSave"
    />

    <CancelarReciboModal
      :is-open="isCancelarModalOpen"
      :recibo="cancelingItem"
      @close="isCancelarModalOpen = false"
      @confirm="confirmCancelar"
    />

    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Recibos</h1>
          <p class="text-gray-500 mt-1">Emissão e controle de recibos financeiros</p>
        </div>
        <div class="flex gap-2">
          <button
            v-if="selectedIds.length > 0"
            @click="handleExportarLote"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Download class="h-4 w-4 mr-2" />
            Exportar Lote ({{ selectedIds.length }})
          </button>
          <button
            @click="handleNew"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
          >
            <Plus class="h-4 w-4 mr-2" />
            Novo Recibo
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p class="text-sm text-gray-500">Recibos Emitidos</p>
          <p class="text-2xl font-bold text-lime-600">{{ kpis.totalEmitidos }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p class="text-sm text-gray-500">Recibos Cancelados</p>
          <p class="text-2xl font-bold text-red-500">{{ kpis.totalCancelados }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p class="text-sm text-gray-500">Valor Total Emitido</p>
          <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(kpis.valorTotalEmitido) }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select v-model="filtroStatus" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500">
            <option value="">Todos os Status</option>
            <option value="EMITIDO">Emitido</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
          <input v-model="filtroDataInicio" type="date" placeholder="Data início" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500" />
          <input v-model="filtroDataFim" type="date" placeholder="Data fim" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500" />
          <input v-model="filtroBeneficiario" type="text" placeholder="Beneficiário..." class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500" />
          <div class="flex gap-2">
            <button @click="handleApplyFilters" class="flex-1 px-4 py-2 bg-lime-600 text-white rounded-lg text-sm hover:bg-lime-700 transition-colors">Filtrar</button>
            <button @click="handleClearFilters" class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors">Limpar</button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div v-if="isLoading" class="flex items-center justify-center py-16">
          <div class="w-6 h-6 border-2 border-lime-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left">
                  <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="rounded border-gray-300" />
                </th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nº Recibo</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Data</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Beneficiário</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Valor</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Forma Pgto</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Vínculo</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3">
                  <input type="checkbox" :checked="selectedIds.includes(item.id)" @change="toggleSelect(item.id)" class="rounded border-gray-300" />
                </td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ item.numeroFormatado }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(item.dataEmissao) }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ item.nomeBeneficiario }}</td>
                <td class="px-4 py-3 text-sm text-gray-900 text-right font-medium">{{ formatCurrency(item.valor) }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.formaPagamento }}</td>
                <td class="px-4 py-3 text-center">
                  <span
                    :class="item.status === 'EMITIDO'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.tipoVinculo === 'AVULSO' ? 'Avulso' : item.tipoVinculo === 'TITULO_PAGAR' ? 'Título Pagar' : 'Título Receber' }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button @click="handleView(item)" class="p-1.5 text-gray-400 hover:text-lime-600 rounded" title="Visualizar">
                      <Receipt class="h-4 w-4" />
                    </button>
                    <button @click="handleDownloadPdf(item)" class="p-1.5 text-gray-400 hover:text-blue-600 rounded" title="PDF">
                      <FileText class="h-4 w-4" />
                    </button>
                    <button v-if="item.status === 'EMITIDO'" @click="handleEdit(item)" class="p-1.5 text-gray-400 hover:text-lime-600 rounded" title="Editar">
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button v-if="item.status === 'EMITIDO'" @click="handleCancelar(item)" class="p-1.5 text-gray-400 hover:text-orange-600 rounded" title="Cancelar">
                      <Ban class="h-4 w-4" />
                    </button>
                    <button v-if="item.status === 'EMITIDO'" @click="handleDelete(item.id)" class="p-1.5 text-gray-400 hover:text-red-600 rounded" title="Excluir">
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                  Nenhum recibo encontrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p class="text-sm text-gray-500">Total: {{ total }} recibos</p>
          <div class="flex gap-1">
            <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1" class="px-3 py-1 border rounded text-sm disabled:opacity-50">Anterior</button>
            <span class="px-3 py-1 text-sm">{{ currentPage }} / {{ totalPages }}</span>
            <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages" class="px-3 py-1 border rounded text-sm disabled:opacity-50">Próximo</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
