<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X, Plus, Pencil, Trash2, ChevronDown, ChevronRight, RotateCcw } from 'lucide-vue-next'
import { toast } from 'vue3-toastify'
import type { Emprestimo } from '../types/Emprestimo'
import type { EmprestimoItem } from '../types/EmprestimoItem'
import type { EmprestimoItemDevolucao } from '../types/EmprestimoItemDevolucao'
import { emprestimoItemService } from '../services/emprestimoItemService'
import { emprestimoItemDevolucaoService } from '../services/emprestimoItemDevolucaoService'
import EmprestimoItemModal from './EmprestimoItemModal.vue'
import EmprestimoItemDevolucaoModal from './EmprestimoItemDevolucaoModal.vue'

const props = defineProps<{
  isOpen: boolean
  emprestimo: Emprestimo
}>()

const emit = defineEmits(['close', 'updated'])

// --- Items state ---
const items = ref<EmprestimoItem[]>([])
const isLoadingItems = ref(false)

// --- Item modal state ---
const isItemModalOpen = ref(false)
const editingItem = ref<EmprestimoItem | null>(null)
const isSavingItem = ref(false)

// --- Devolução modal state ---
const isDevolucaoModalOpen = ref(false)
const selectedItemForDevolucao = ref<EmprestimoItem | null>(null)
const editingDevolucao = ref<EmprestimoItemDevolucao | null>(null)
const isSavingDevolucao = ref(false)

// --- Expand/collapse state ---
const expandedItems = ref<Set<number>>(new Set())
const devolucoes = ref<Record<number, EmprestimoItemDevolucao[]>>({})

// --- Data fetching ---
const fetchItems = async () => {
  if (!props.emprestimo?.id) return
  isLoadingItems.value = true
  try {
    const result = await emprestimoItemService.findByEmprestimo(props.emprestimo.id)
    items.value = result
    // Buscar devoluções para todos os itens
    await Promise.all(
      items.value.map(async (item) => {
        if (item.id) {
          await fetchDevolucoes(item.id)
        }
      }),
    )
  } catch (error) {
    console.error('Erro ao buscar itens do empréstimo:', error)
    toast.error('Erro ao carregar itens do empréstimo.')
  } finally {
    isLoadingItems.value = false
  }
}

const fetchDevolucoes = async (itemId: number) => {
  try {
    const result = await emprestimoItemDevolucaoService.findByItem(itemId)
    const data = result
    devolucoes.value = { ...devolucoes.value, [itemId]: data }
  } catch (error) {
    console.error(`Erro ao buscar devoluções do item ${itemId}:`, error)
    toast.error('Erro ao carregar devoluções.')
  }
}

const toggleExpand = async (itemId: number) => {
  const next = new Set(expandedItems.value)
  if (next.has(itemId)) {
    next.delete(itemId)
  } else {
    next.add(itemId)
    await fetchDevolucoes(itemId)
  }
  expandedItems.value = next
}

// --- Item CRUD ---
const handleNewItem = () => {
  editingItem.value = null
  isItemModalOpen.value = true
}

const handleEditItem = (item: EmprestimoItem) => {
  editingItem.value = { ...item }
  isItemModalOpen.value = true
}

const handleSaveItem = async (data: Partial<EmprestimoItem>) => {
  isSavingItem.value = true
  try {
    if (editingItem.value?.id) {
      await emprestimoItemService.update(editingItem.value.id, data)
      toast.success('Item atualizado com sucesso.')
    } else {
      await emprestimoItemService.create({ ...data, emprestimoId: props.emprestimo.id! })
      toast.success('Item adicionado com sucesso.')
    }
    isItemModalOpen.value = false
    editingItem.value = null
    await fetchItems()
    emit('updated')
  } catch (error) {
    console.error('Erro ao salvar item:', error)
    toast.error('Erro ao salvar item.')
  } finally {
    isSavingItem.value = false
  }
}

const handleDeleteItem = async (id: number) => {
  if (hasDevolucoesForItem(id)) {
    toast.error('Não é possível excluir um item que possui devoluções registradas.')
    return
  }
  if (!confirm('Deseja realmente excluir este item?')) return
  try {
    await emprestimoItemService.delete(id)
    toast.success('Item excluído com sucesso.')
    await fetchItems()
    emit('updated')
  } catch (error) {
    console.error('Erro ao excluir item:', error)
    toast.error('Erro ao excluir item.')
  }
}

// --- Devolução CRUD ---
const handleNewDevolucao = (item: EmprestimoItem) => {
  selectedItemForDevolucao.value = item
  editingDevolucao.value = null
  isDevolucaoModalOpen.value = true
}

const handleEditDevolucao = (dev: EmprestimoItemDevolucao, item: EmprestimoItem) => {
  selectedItemForDevolucao.value = item
  editingDevolucao.value = { ...dev }
  isDevolucaoModalOpen.value = true
}

const handleSaveDevolucao = async (data: Partial<EmprestimoItemDevolucao>) => {
  isSavingDevolucao.value = true
  try {
    if (editingDevolucao.value?.id) {
      await emprestimoItemDevolucaoService.update(editingDevolucao.value.id, data)
      toast.success('Devolução atualizada com sucesso.')
    } else {
      await emprestimoItemDevolucaoService.create({
        ...data,
        itemDevolucaoId: selectedItemForDevolucao.value!.id!,
      })
      toast.success('Devolução registrada com sucesso.')
    }
    isDevolucaoModalOpen.value = false
    editingDevolucao.value = null
    const itemId = selectedItemForDevolucao.value?.id
    if (itemId) {
      await fetchDevolucoes(itemId)
      // Ensure expand is open so the user can see the new devolução
      const next = new Set(expandedItems.value)
      next.add(itemId)
      expandedItems.value = next
    }
    emit('updated')
  } catch (error) {
    console.error('Erro ao salvar devolução:', error)
    toast.error('Erro ao salvar devolução.')
  } finally {
    isSavingDevolucao.value = false
  }
}

const handleDeleteDevolucao = async (id: number, itemId: number) => {
  if (!confirm('Deseja realmente excluir esta devolução?')) return
  try {
    await emprestimoItemDevolucaoService.delete(id)
    toast.success('Devolução excluída com sucesso.')
    await fetchDevolucoes(itemId)
    emit('updated')
  } catch (error) {
    console.error('Erro ao excluir devolução:', error)
    toast.error('Erro ao excluir devolução.')
  }
}

// --- Watchers ---
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      expandedItems.value = new Set()
      devolucoes.value = {}
      fetchItems()
    }
  },
)

// --- Computed ---
const totalItens = computed(() => items.value.length)
const totalValor = computed(() => items.value.reduce((sum, item) => sum + (item.total_empi ?? 0), 0))

// --- Helpers ---
const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const formatDate = (date: string | null | undefined) => {
  if (!date) return '-'
  const parts = date.substring(0, 10).split('-')
  if (parts.length !== 3) return date
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

const getSituacaoLabel = (s: number | undefined) => {
  if (s === 0) return 'Em aberto'
  if (s === 1) return 'Parcial'
  if (s === 2) return 'Concluído'
  return '-'
}

const getSituacaoColor = (s: number | undefined) => {
  if (s === 0) return 'text-yellow-600'
  if (s === 1) return 'text-orange-600'
  if (s === 2) return 'text-green-600'
  return 'text-gray-500'
}

const getQuantidadeDevolvida = (itemId: number): number => {
  const devs = devolucoes.value[itemId] || []
  return devs.reduce((sum, d) => sum + (d.quantidadedevolvida_empdev ?? 0), 0)
}

const getQuantidadePendente = (item: EmprestimoItem): number => {
  return item.quantidade_empi - getQuantidadeDevolvida(item.id!)
}

const hasDevolucoesForItem = (itemId: number): boolean => {
  return (devolucoes.value[itemId] || []).length > 0
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div
      class="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-start justify-between p-6 border-b border-gray-100">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Itens do Empréstimo</h2>
          <p class="text-sm text-gray-500 mt-1">
            <span class="font-medium text-gray-700">Fazenda:</span>
            {{ emprestimo?.fazenda?.descricao || 'N/A' }}
            &nbsp;|&nbsp;
            <span class="font-medium text-gray-700">Parceiro:</span>
            {{
              emprestimo?.parceiro?.nomefantasia_pessoa ||
              emprestimo?.parceiro?.nomerazao_pessoa ||
              'N/A'
            }}
            &nbsp;|&nbsp;
            <span class="font-medium text-gray-700">Situação:</span>
            <span :class="getSituacaoColor(emprestimo?.situacao_emp)">
              {{ getSituacaoLabel(emprestimo?.situacao_emp) }}
            </span>
          </p>
        </div>
        <div class="flex items-center gap-2 ml-4 shrink-0">
          <button
            @click="handleNewItem"
            class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 rounded-lg transition-colors shadow-sm"
          >
            <Plus class="h-4 w-4 mr-1" />
            Adicionar Item
          </button>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-auto p-6">
        <div v-if="isLoadingItems" class="flex items-center justify-center py-12">
          <span class="w-6 h-6 border-2 border-lime-600/30 border-t-lime-600 rounded-full animate-spin"></span>
          <span class="ml-3 text-sm text-gray-500">Carregando itens...</span>
        </div>

        <template v-else>
          <table v-if="items.length > 0" class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
                <th class="pb-3 w-8"></th>
                <th class="pb-3">Produto</th>
                <th class="pb-3 text-right">Quantidade</th>
                <th class="pb-3 text-right">Unitário</th>
                <th class="pb-3 text-right">Total</th>
                <th class="pb-3 text-right">Devolvido</th>
                <th class="pb-3 text-right">Pendente</th>
                <th class="pb-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="item in items" :key="item.id">
                <!-- Item row -->
                <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td class="py-3 pr-2">
                    <button
                      @click="toggleExpand(item.id!)"
                      class="text-gray-400 hover:text-gray-600 transition-colors"
                      :title="expandedItems.has(item.id!) ? 'Ocultar devoluções' : 'Ver devoluções'"
                    >
                      <ChevronDown v-if="expandedItems.has(item.id!)" class="h-4 w-4" />
                      <ChevronRight v-else class="h-4 w-4" />
                    </button>
                  </td>
                  <td class="py-3 font-medium text-gray-800">
                    {{ item.produto?.descricao_prod || 'Produto #' + item.produtoId }}
                  </td>
                  <td class="py-3 text-right text-gray-700">{{ item.quantidade_empi }}</td>
                  <td class="py-3 text-right text-gray-700">
                    {{ formatCurrency(item.unitario_empi) }}
                  </td>
                  <td class="py-3 text-right font-medium text-gray-800">
                    {{ formatCurrency(item.total_empi ?? 0) }}
                  </td>
                  <td class="py-3 text-right text-gray-700">
                    {{ getQuantidadeDevolvida(item.id!) }}
                  </td>
                  <td
                    class="py-3 text-right font-medium"
                    :class="
                      getQuantidadePendente(item) <= 0 ? 'text-green-600' : 'text-orange-600'
                    "
                  >
                    {{ getQuantidadePendente(item) }}
                  </td>
                  <td class="py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button
                        @click="handleNewDevolucao(item)"
                        class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Registrar Devolução"
                      >
                        <RotateCcw class="h-4 w-4" />
                      </button>
                      <button
                        @click="handleEditItem(item)"
                        class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Editar item"
                      >
                        <Pencil class="h-4 w-4" />
                      </button>
                      <button
                        @click="handleDeleteItem(item.id!)"
                        class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Excluir item"
                        :disabled="hasDevolucoesForItem(item.id!)"
                      >
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Expanded devoluções sub-table -->
                <tr v-if="expandedItems.has(item.id!)" :key="'dev-' + item.id">
                  <td colspan="8" class="bg-gray-50 px-8 py-4 border-b border-gray-100">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-semibold text-gray-700">Devoluções registradas</span>
                      <button
                        @click="handleNewDevolucao(item)"
                        class="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Plus class="h-3 w-3 mr-1" />
                        Nova devolução
                      </button>
                    </div>

                    <table
                      v-if="(devolucoes[item.id!] || []).length > 0"
                      class="w-full text-xs"
                    >
                      <thead>
                        <tr class="text-gray-500 border-b border-gray-200">
                          <th class="text-left pb-2 font-semibold">Data</th>
                          <th class="text-left pb-2 font-semibold">Produto devolvido</th>
                          <th class="text-right pb-2 font-semibold">Qtd devolvida</th>
                          <th class="text-center pb-2 font-semibold">Produto similar</th>
                          <th class="text-center pb-2 font-semibold">Gera financeiro</th>
                          <th class="text-center pb-2 font-semibold">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="dev in devolucoes[item.id!]"
                          :key="dev.id"
                          class="border-t border-gray-100 hover:bg-white transition-colors"
                        >
                          <td class="py-1.5 text-gray-700">
                            {{ formatDate(dev.datadevolucao_empdev) }}
                          </td>
                          <td class="py-1.5 text-gray-700">
                            {{ dev.produtoDevolucao?.descricao_prod || 'N/A' }}
                            <span
                              v-if="dev.devolucaoProdutoSimilar_empdev && dev.produtoSimilar"
                              class="text-gray-400"
                            >
                              → {{ dev.produtoSimilar.descricao_prod }}
                            </span>
                          </td>
                          <td class="py-1.5 text-right font-medium text-gray-800">
                            {{ dev.quantidadedevolvida_empdev }}
                          </td>
                          <td class="py-1.5 text-center">
                            <span
                              :class="
                                dev.devolucaoProdutoSimilar_empdev
                                  ? 'text-orange-600 font-medium'
                                  : 'text-gray-400'
                              "
                            >
                              {{ dev.devolucaoProdutoSimilar_empdev ? 'Sim' : 'Não' }}
                            </span>
                          </td>
                          <td class="py-1.5 text-center">
                            <span
                              :class="
                                dev.devolucaoGeraFinanceiro_empdev
                                  ? 'text-green-600 font-medium'
                                  : 'text-gray-400'
                              "
                            >
                              {{ dev.devolucaoGeraFinanceiro_empdev ? 'Sim' : 'Não' }}
                            </span>
                          </td>
                          <td class="py-1.5 text-center">
                            <div class="flex items-center justify-center gap-1">
                              <button
                                @click="handleEditDevolucao(dev, item)"
                                class="p-1 text-amber-600 hover:bg-amber-50 rounded"
                                title="Editar"
                              >
                                <Pencil class="h-3 w-3" />
                              </button>
                              <button
                                @click="handleDeleteDevolucao(dev.id!, item.id!)"
                                class="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Excluir devolução"
                              >
                                <Trash2 class="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <p v-else class="text-gray-400 text-xs">Nenhuma devolução registrada.</p>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>

          <div v-else class="flex flex-col items-center justify-center py-16 text-gray-400">
            <span class="text-4xl mb-3">📦</span>
            <p class="text-sm">Nenhum item adicionado a este empréstimo.</p>
            <button
              @click="handleNewItem"
              class="mt-4 inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 rounded-lg transition-colors"
            >
              <Plus class="h-4 w-4 mr-1" />
              Adicionar primeiro item
            </button>
          </div>
        </template>
      </div>

      <!-- Footer -->
      <div
        class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-b-xl"
      >
        <div class="text-sm text-gray-600">
          <span class="font-semibold text-gray-800">{{ totalItens }}</span>
          {{ totalItens === 1 ? ' item' : ' itens' }}
          &nbsp;|&nbsp; Total:
          <span class="font-semibold text-gray-800">{{ formatCurrency(totalValor) }}</span>
        </div>
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>

  <!-- Child modals -->
  <EmprestimoItemModal
    :isOpen="isItemModalOpen"
    :initialData="editingItem"
    :loading="isSavingItem"
    :emprestimoId="emprestimo?.id ?? 0"
    @close="isItemModalOpen = false"
    @save="handleSaveItem"
  />

  <EmprestimoItemDevolucaoModal
    :isOpen="isDevolucaoModalOpen"
    :initialData="editingDevolucao"
    :loading="isSavingDevolucao"
    :item="selectedItemForDevolucao"
    :devolucoes="selectedItemForDevolucao ? (devolucoes[selectedItemForDevolucao.id!] || []) : []"
    @close="isDevolucaoModalOpen = false"
    @save="handleSaveDevolucao"
  />
</template>
