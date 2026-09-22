<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2, Search, ShoppingCart, CheckCircle, XCircle, FileText, DollarSign, BarChart3, Eye, X } from 'lucide-vue-next'
import PedidosCompraModal from '@/components/PedidosCompraModal.vue'
import CotacaoModal from '@/components/pedido-compra/CotacaoModal.vue'
import CotacaoRankingPanel from '@/components/pedido-compra/CotacaoRankingPanel.vue'
import ThreeWayMatchTable from '@/components/pedido-compra/ThreeWayMatchTable.vue'
import type { PedidoCompra, PedidoCompraCompletoDto } from '@/types/PedidoCompra'
import type { Cotacao } from '@/types/Cotacao'
import { pedidoCompraService } from '@/services/pedidoCompraService'
import { cotacaoService } from '@/services/cotacaoService'

// Modal state
const isModalOpen = ref(false)
const editingItem = ref<PedidoCompra | null>(null)

// Cotação modal state
const isCotacaoModalOpen = ref(false)
const editingCotacao = ref<Cotacao | null>(null)
const isSavingCotacao = ref(false)

// Detail panel state
const selectedPedido = ref<PedidoCompra | null>(null)
const cotacoesPedido = ref<Cotacao[]>([])
const loadingCotacoes = ref(false)
const rankingPanelRef = ref<InstanceType<typeof CotacaoRankingPanel> | null>(null)

// List state
const items = ref<PedidoCompra[]>([])
const searchTerm = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const gerandoFinanceiro = ref(false)

// Pagination state
const currentPage = ref(1)
const totalPages = ref(1)
const itemsPerPage = ref(10)

const fetchItems = async () => {
  isLoading.value = true
  try {
    const result = await pedidoCompraService.getAll(currentPage.value, itemsPerPage.value)
    items.value = result.data
    currentPage.value = result.page
    totalPages.value = result.totalPages
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    toast.error('Erro ao carregar pedidos de compra.')
  } finally {
    isLoading.value = false
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSave = async (data: PedidoCompra) => {
  isSaving.value = true
  try {
    // Cast para DTO completo, pois o form envia itens
    const payload = data as PedidoCompraCompletoDto
    
    if (data.id_ped_compra) {
      await pedidoCompraService.updateCompleto(data.id_ped_compra, payload)
      toast.success('Pedido atualizado com sucesso!')
    } else {
      await pedidoCompraService.createCompleto(payload)
      toast.success('Pedido criado com sucesso!')
    }
    isModalOpen.value = false
    fetchItems()
  } catch (error) {
    console.error('Erro ao salvar:', error)
    toast.error('Erro ao salvar pedido. Verifique os dados.')
  } finally {
    isSaving.value = false
  }
}

const handleEdit = async (item: PedidoCompra) => {
  // Buscar detalhes completos (incluindo itens) antes de abrir
  try {
    if (item.id_ped_compra) {
       const pedidoData = await pedidoCompraService.getById(item.id_ped_compra)
       const itensData = await pedidoCompraService.getItens(item.id_ped_compra)
       
       // Tenta usar os itens do endpoint específico, mas faz fallback ou merge se necessário
       // Muitas vezes o getById já traz itens com os objetos produto populados,
       // enquanto o getItens pode trazer apenas a lista de associação.
       let finalItens = itensData

       // Se itensData estiver vazio ou sem dados de produto, e pedidoData tiver itens, usamos pedidoData
       if ((!finalItens || finalItens.length === 0 || !finalItens[0].produto) && 
           pedidoData.itens && pedidoData.itens.length > 0) {
           finalItens = pedidoData.itens
       } 
       // Se ambos tiverem dados, podemos tentar enriquecer itensData com dados de produto do pedidoData se faltar
       else if (finalItens && finalItens.length > 0 && !finalItens[0].produto && pedidoData.itens) {
           finalItens = finalItens.map(i => {
              const match = pedidoData.itens?.find((pi: any) => pi.id_item_ped === i.id_item_ped || pi.produtoId === i.produtoId)
              if (match && match.produto) {
                  return { ...i, produto: match.produto, descricao: match.descricao || match.produto.descricao_prod }
              }
              return i
           })
       }
       
       const fullData = {
         ...pedidoData,
         itens: finalItens
       }
       
       editingItem.value = fullData
       isModalOpen.value = true
    }
  } catch (error) {
    console.error('Erro ao carregar detalhes:', error)
    toast.error('Erro ao carregar detalhes do pedido.')
  }
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir este pedido?')) {
    try {
      await pedidoCompraService.delete(id)
      toast.success('Pedido excluído com sucesso!')
      fetchItems()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir. Tente novamente.')
    }
  }
}

const handlePageChange = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    currentPage.value = newPage
    fetchItems()
  }
}

// === Detalhe / Cotações ===
const handleViewDetail = async (item: PedidoCompra) => {
  try {
    const pedidoData = item.id_ped_compra
      ? await pedidoCompraService.getById(item.id_ped_compra)
      : item
    const itensData = item.id_ped_compra
      ? await pedidoCompraService.getItens(item.id_ped_compra)
      : []
    selectedPedido.value = {
      ...pedidoData,
      itens: itensData?.length > 0 ? itensData : pedidoData.itens || [],
    }
    await carregarCotacoesPedido()
  } catch {
    toast.error('Erro ao carregar detalhes do pedido.')
  }
}

const fecharDetalhe = () => {
  selectedPedido.value = null
  cotacoesPedido.value = []
}

const carregarCotacoesPedido = async () => {
  if (!selectedPedido.value?.id_ped_compra) return
  loadingCotacoes.value = true
  try {
    const result = await cotacaoService.getByPedidoCompra(selectedPedido.value.id_ped_compra)
    cotacoesPedido.value = Array.isArray(result) ? result : []
  } catch {
    cotacoesPedido.value = []
  } finally {
    loadingCotacoes.value = false
  }
}

const handleNovaCotacao = () => {
  editingCotacao.value = null
  isCotacaoModalOpen.value = true
}

const handleEditCotacao = (cotacao: Cotacao) => {
  editingCotacao.value = cotacao
  isCotacaoModalOpen.value = true
}

const handleSaveCotacao = async (payload: any) => {
  isSavingCotacao.value = true
  try {
    if (editingCotacao.value?.id) {
      await cotacaoService.updateCompleto(editingCotacao.value.id, payload)
      toast.success('Cotação atualizada com sucesso!')
    } else {
      await cotacaoService.createCompleto(payload)
      toast.success('Cotação criada com sucesso!')
    }
    isCotacaoModalOpen.value = false
    await carregarCotacoesPedido()
    rankingPanelRef.value?.carregarRanking()
  } catch (error: any) {
    toast.error(error?.response?.data?.error?.message || 'Erro ao salvar cotação.')
  } finally {
    isSavingCotacao.value = false
  }
}

const handleDeleteCotacao = async (cotacaoId: number) => {
  if (!confirm('Excluir esta cotação?')) return
  try {
    await cotacaoService.delete(cotacaoId)
    toast.success('Cotação excluída!')
    await carregarCotacoesPedido()
    rankingPanelRef.value?.carregarRanking()
  } catch (error: any) {
    toast.error(error?.response?.data?.error?.message || 'Erro ao excluir cotação.')
  }
}

const handleVencedoraSelecionada = async () => {
  await carregarCotacoesPedido()
  await fetchItems()
  if (selectedPedido.value?.id_ped_compra) {
    selectedPedido.value = await pedidoCompraService.getById(selectedPedido.value.id_ped_compra)
  }
}

const handleGerarFinanceiro = async () => {
  if (!selectedPedido.value?.id_ped_compra) return
  if (!confirm('Gerar títulos financeiros a partir deste pedido?')) return
  gerandoFinanceiro.value = true
  try {
    await pedidoCompraService.gerarFinanceiro(selectedPedido.value.id_ped_compra)
    toast.success('Títulos financeiros gerados com sucesso!')
    await fetchItems()
  } catch (error: any) {
    toast.error(error?.response?.data?.error?.message || 'Erro ao gerar financeiro.')
  } finally {
    gerandoFinanceiro.value = false
  }
}

const cotacaoVencedora = () => {
  return cotacoesPedido.value.find(c => c.status === 'selecionada')
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'rascunho': return 'bg-gray-100 text-gray-800'
    case 'aguardando_aprovacao': return 'bg-yellow-100 text-yellow-800'
    case 'aprovado': return 'bg-blue-100 text-blue-800'
    case 'parcialmente_atendido': return 'bg-purple-100 text-purple-800'
    case 'atendido': return 'bg-green-100 text-green-800'
    case 'cancelado': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status?: string) => {
  return status ? status.replace(/_/g, ' ').toUpperCase() : 'N/A'
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

onMounted(() => {
  fetchItems()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <PedidosCompraModal
      :is-open="isModalOpen"
      :initial-data="editingItem"
      :loading="isSaving"
      @close="isModalOpen = false"
      @save="handleSave"
    />
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Pedidos de Compra</h1>
          <p class="text-gray-500 mt-1">Gerencie suas aquisições de insumos e produtos</p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Novo Pedido
        </button>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <h2 class="text-lg font-bold text-gray-900 self-center">Lista de Pedidos</h2>

          <div class="relative w-full sm:w-64">
             <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search class="h-4 w-4 text-gray-400" />
              </div>
            <input
                v-model="searchTerm"
                type="text"
                placeholder="Buscar pedido..."
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                @keyup.enter="fetchItems" 
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Data Emissão
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in items" :key="item.id_ped_compra" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                   <div class="flex items-center gap-2">
                      <FileText class="h-4 w-4 text-gray-400" />
                      {{ item.numero || `#${item.id_ped_compra}` }}
                   </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ item.fornecedor?.nomefantasia_pessoa || item.fornecedor?.nomerazao_pessoa || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ formatDate(item.data_emissao) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {{ formatCurrency(item.vl_total) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                   <span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusColor(item.status)]">
                      {{ getStatusLabel(item.status) }}
                   </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-3">
                    <button
                      @click="handleViewDetail(item)"
                      class="text-gray-400 hover:text-lime-600 transition-colors"
                      title="Ver detalhes / Cotações"
                    >
                      <Eye class="h-4 w-4" />
                    </button>
                    <button
                      @click="handleEdit(item)"
                      class="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Editar"
                    >
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button
                      @click="handleDelete(item.id_ped_compra!)"
                      class="text-gray-400 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="items.length === 0 && !isLoading">
                <td colspan="6" class="px-6 py-8 text-center text-sm text-gray-500">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between" v-if="totalPages > 1">
          <button 
            @click="handlePageChange(currentPage - 1)" 
            :disabled="currentPage === 1"
            class="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50"
          >
            Anterior
          </button>
          <span class="text-sm text-gray-600">Página {{ currentPage }} de {{ totalPages }}</span>
          <button 
            @click="handlePageChange(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>
      <!-- Painel de Detalhes do Pedido -->
      <div v-if="selectedPedido" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 class="text-lg font-bold text-gray-900">
            Detalhes — Pedido {{ selectedPedido.numero || `#${selectedPedido.id_ped_compra}` }}
          </h2>
          <div class="flex items-center gap-3">
            <button
              v-if="selectedPedido.status === 'aprovado' || selectedPedido.status === 'parcialmente_atendido'"
              :disabled="gerandoFinanceiro"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              @click="handleGerarFinanceiro"
            >
              <DollarSign class="h-4 w-4 mr-1" />
              {{ gerandoFinanceiro ? 'Gerando...' : 'Gerar Financeiro' }}
            </button>
            <button class="p-1 hover:bg-gray-100 rounded" @click="fecharDetalhe">
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Cotações -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BarChart3 class="w-4 h-4" />
                Cotações
              </h3>
              <button
                class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-lime-700 bg-lime-100 rounded-md hover:bg-lime-200 transition-colors"
                @click="handleNovaCotacao"
              >
                <Plus class="h-3 w-3 mr-1" />
                Nova Cotação
              </button>
            </div>

            <div v-if="loadingCotacoes" class="text-center py-4 text-sm text-gray-500">
              Carregando cotações...
            </div>
            <div v-else-if="cotacoesPedido.length === 0" class="text-center py-4 text-sm text-gray-400">
              Nenhuma cotação registrada.
            </div>
            <div v-else class="overflow-x-auto border rounded-md">
              <table class="w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left font-medium text-gray-600">Número</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-600">Fornecedor</th>
                    <th class="px-3 py-2 text-right font-medium text-gray-600">Valor Total</th>
                    <th class="px-3 py-2 text-center font-medium text-gray-600">Prazo</th>
                    <th class="px-3 py-2 text-center font-medium text-gray-600">Status</th>
                    <th class="px-3 py-2 text-right font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="cot in cotacoesPedido"
                    :key="cot.id"
                    class="border-t"
                  >
                    <td class="px-3 py-2 text-gray-800">{{ cot.numero }}</td>
                    <td class="px-3 py-2 text-gray-700">{{ cot.fornecedor?.nome || '-' }}</td>
                    <td class="px-3 py-2 text-right font-medium text-gray-900">
                      {{ formatCurrency(cot.vl_total) }}
                    </td>
                    <td class="px-3 py-2 text-center text-gray-600">
                      {{ cot.prazo_entrega_dias ? `${cot.prazo_entrega_dias}d` : '-' }}
                    </td>
                    <td class="px-3 py-2 text-center">
                      <span
                        :class="[
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          cot.status === 'selecionada' ? 'bg-lime-100 text-lime-800' :
                          cot.status === 'rejeitada' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        ]"
                      >
                        {{ cot.status?.toUpperCase() || 'PENDENTE' }}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          @click="handleEditCotacao(cot)"
                          class="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Editar cotação"
                        >
                          <Pencil class="h-3.5 w-3.5" />
                        </button>
                        <button
                          v-if="cot.status !== 'selecionada'"
                          @click="handleDeleteCotacao(cot.id!)"
                          class="text-gray-400 hover:text-red-600 transition-colors"
                          title="Excluir cotação"
                        >
                          <Trash2 class="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Ranking -->
          <div v-if="cotacoesPedido.length > 0">
            <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <BarChart3 class="w-4 h-4" />
              Ranking de Cotações
            </h3>
            <CotacaoRankingPanel
              ref="rankingPanelRef"
              :pedido-compra-id="selectedPedido.id_ped_compra!"
              :cotacao-vencedora-id="selectedPedido.cotacao_vencedora_id"
              @vencedora-selecionada="handleVencedoraSelecionada"
            />
          </div>

          <!-- Three-Way Match -->
          <div v-if="selectedPedido.itens && selectedPedido.itens.length > 0">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">
              Conferência Three-Way Match
            </h3>
            <ThreeWayMatchTable
              :itens-pedido="selectedPedido.itens"
              :itens-cotacao="cotacaoVencedora()?.itens"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Cotação Modal -->
    <CotacaoModal
      v-if="selectedPedido"
      :is-open="isCotacaoModalOpen"
      :initial-data="editingCotacao"
      :loading="isSavingCotacao"
      :pedido-compra-id="selectedPedido.id_ped_compra!"
      :itens-pedido-compra="selectedPedido.itens || []"
      @close="isCotacaoModalOpen = false"
      @save="handleSaveCotacao"
    />
  </div>
</template>
