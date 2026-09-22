<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { X, Plus, Pencil, Trash2, Package, FileText } from 'lucide-vue-next'
import type { NotaFiscal } from '@/types/NotaFiscal'
import { NF_STATUS_LABELS, NF_STATUS_COLORS } from '@/types/NotaFiscal'
import type { ItemNotaFiscal } from '@/types/ItemNotaFiscal'
import { itemNotaFiscalService } from '@/services/itemNotaFiscalService'
import ItemNotaFiscalModal from '@/components/ItemNotaFiscalModal.vue'

const props = defineProps<{
  isOpen: boolean
  notaFiscal: NotaFiscal | null
}>()

const emit = defineEmits(['close', 'updated'])

const itens = ref<ItemNotaFiscal[]>([])
const loading = ref(false)
const isItemModalOpen = ref(false)
const isSavingItem = ref(false)
const editingItem = ref<ItemNotaFiscal | null>(null)

const nextNumeroItem = computed(() => {
  if (itens.value.length === 0) return 1
  return Math.max(...itens.value.map((i) => i.numero_item)) + 1
})

const totalItens = computed(() =>
  itens.value.reduce((acc, i) => acc + (i.vl_total ?? 0), 0),
)

const fmt = (v?: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen && props.notaFiscal?.id_nf) {
      await loadItens()
    } else {
      itens.value = []
    }
  },
)

const loadItens = async () => {
  if (!props.notaFiscal?.id_nf) return
  loading.value = true
  try {
    itens.value = await itemNotaFiscalService.getByNotaFiscal(props.notaFiscal.id_nf)
  } catch (e) {
    console.error(e)
    toast.error('Erro ao carregar itens.')
  } finally {
    loading.value = false
  }
}

const handleNewItem = () => {
  editingItem.value = null
  isItemModalOpen.value = true
}

const handleEditItem = (item: ItemNotaFiscal) => {
  editingItem.value = item
  isItemModalOpen.value = true
}

const handleSaveItem = async (data: Partial<ItemNotaFiscal>) => {
  if (!props.notaFiscal?.id_nf) return
  isSavingItem.value = true
  try {
    if (editingItem.value?.id_item_nf) {
      await itemNotaFiscalService.update(editingItem.value.id_item_nf, data)
      toast.success('Item atualizado com sucesso!')
    } else {
      await itemNotaFiscalService.create({ ...data, notaFiscalId: props.notaFiscal.id_nf })
      toast.success('Item adicionado com sucesso!')
    }
    isItemModalOpen.value = false
    await loadItens()
    emit('updated')
  } catch (e: any) {
    console.error(e)
    toast.error(e?.response?.data?.message ?? 'Erro ao salvar item.')
  } finally {
    isSavingItem.value = false
  }
}

const handleDeleteItem = async (item: ItemNotaFiscal) => {
  if (!item.id_item_nf) return
  if (!confirm(`Excluir item ${item.numero_item} - ${item.descricao}?`)) return
  try {
    await itemNotaFiscalService.delete(item.id_item_nf)
    toast.success('Item excluído.')
    await loadItens()
    emit('updated')
  } catch (e: any) {
    console.error(e)
    toast.error(e?.response?.data?.message ?? 'Erro ao excluir item.')
  }
}

const canEdit = computed(() => {
  const status = props.notaFiscal?.status
  return status === 'rascunho' || status === 'pendente' || !status
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Item Modal (nested) -->
    <ItemNotaFiscalModal
      :is-open="isItemModalOpen"
      :nota-fiscal-id="props.notaFiscal?.id_nf ?? 0"
      :next-numero-item="nextNumeroItem"
      :default-cfop="props.notaFiscal?.cfop"
      :initial-data="editingItem"
      :loading="isSavingItem"
      @close="isItemModalOpen = false"
      @save="handleSaveItem"
    />

    <!-- Main Modal -->
    <div
      class="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-lg bg-lime-100 flex items-center justify-center">
            <FileText class="h-5 w-5 text-lime-600" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">
              Itens da NF
              <span class="text-lime-600">
                {{ props.notaFiscal?.numero }}/{{ props.notaFiscal?.serie }}
              </span>
            </h2>
            <div class="flex items-center gap-2 mt-0.5">
              <span
                v-if="props.notaFiscal?.status"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="NF_STATUS_COLORS[props.notaFiscal.status]"
              >
                {{ NF_STATUS_LABELS[props.notaFiscal.status] }}
              </span>
              <span class="text-xs text-gray-400">
                {{ props.notaFiscal?.emitente?.nomerazao_pessoa }} →
                {{ props.notaFiscal?.destinatario?.nomerazao_pessoa }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="canEdit"
            @click="handleNewItem"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 transition-colors"
          >
            <Plus class="h-4 w-4 mr-1.5" />
            Novo Item
          </button>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div v-if="loading" class="flex items-center justify-center py-16">
          <div
            class="w-8 h-8 border-4 border-lime-200 border-t-lime-600 rounded-full animate-spin"
          ></div>
        </div>

        <div v-else-if="itens.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
          <Package class="h-12 w-12 mb-3 opacity-30" />
          <p class="text-sm">Nenhum item adicionado ainda.</p>
          <button
            v-if="canEdit"
            @click="handleNewItem"
            class="mt-3 text-sm text-lime-600 hover:text-lime-700 font-medium"
          >
            + Adicionar primeiro item
          </button>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nº</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Produto</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">NCM</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">CFOP</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Qtd.</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Vl. Unit.</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th v-if="canEdit" class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="item in itens"
                :key="item.id_item_nf"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                  {{ item.numero_item }}
                </td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">
                  <div class="flex items-center gap-2">
                    <div class="h-7 w-7 rounded-full bg-lime-100 flex items-center justify-center flex-shrink-0">
                      <Package class="h-3.5 w-3.5 text-lime-600" />
                    </div>
                    <div>
                      <p class="font-medium">{{ item.descricao }}</p>
                      <p class="text-xs text-gray-400">{{ item.codigo_produto }} · {{ item.unidade }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500 font-mono whitespace-nowrap">
                  {{ item.ncm }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-500 font-mono whitespace-nowrap">
                  {{ item.cfop }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 text-right whitespace-nowrap">
                  {{ item.quantidade }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 text-right whitespace-nowrap">
                  {{ fmt(item.vl_unitario) }}
                </td>
                <td class="px-4 py-3 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
                  {{ fmt(item.vl_total) }}
                </td>
                <td v-if="canEdit" class="px-4 py-3 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="handleEditItem(item)"
                      class="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Editar"
                    >
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button
                      @click="handleDeleteItem(item)"
                      class="text-gray-400 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between rounded-b-xl">
        <div class="text-sm text-gray-500">
          <span class="font-medium text-gray-700">{{ itens.length }}</span> item(s)
        </div>
        <div class="text-sm">
          <span class="text-gray-500">Total Itens: </span>
          <span class="font-bold text-lg text-lime-700">{{ fmt(totalItens) }}</span>
        </div>
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
