<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X, Plus, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue3-toastify'
import type { Cotacao, CotacaoItemSemId } from '@/types/Cotacao'
import type { ItemPedidoCompra } from '@/types/PedidoCompra'
import { parceiroNegocioService } from '@/services/parceiroNegocioService'

const props = defineProps<{
  isOpen: boolean
  initialData?: Cotacao | null
  loading?: boolean
  pedidoCompraId: number
  itensPedidoCompra: ItemPedidoCompra[]
}>()

const emit = defineEmits<{
  close: []
  save: [data: any]
}>()

const form = ref({
  fornecedorId: 0,
  numero: '',
  data_cotacao: new Date().toISOString().split('T')[0],
  data_validade: '',
  prazo_entrega_dias: null as number | null,
  condicao_pagamento: '',
  observacoes: '',
})

const itens = ref<CotacaoItemSemId[]>([])
const fornecedores = ref<any[]>([])
const loadingFornecedores = ref(false)

const isEditing = computed(() => !!props.initialData?.id)
const title = computed(() => isEditing.value ? 'Editar Cotacao' : 'Nova Cotacao')

const vlTotalCotacao = computed(() => {
  return itens.value.reduce((sum, item) => {
    return sum + (Number(item.quantidade) || 0) * (Number(item.vl_unitario) || 0)
  }, 0)
})

async function carregarFornecedores() {
  loadingFornecedores.value = true
  try {
    const result = await parceiroNegocioService.getAllNoPagination()
    fornecedores.value = Array.isArray(result) ? result : (result as any).data || []
  } catch {
    fornecedores.value = []
  } finally {
    loadingFornecedores.value = false
  }
}

function resetForm() {
  form.value = {
    fornecedorId: 0,
    numero: '',
    data_cotacao: new Date().toISOString().split('T')[0],
    data_validade: '',
    prazo_entrega_dias: null,
    condicao_pagamento: '',
    observacoes: '',
  }
  // Popular itens a partir dos itens do pedido de compra
  itens.value = props.itensPedidoCompra.map(item => ({
    itemPedidoCompraId: item.id_item_ped || (item as any).id || 0,
    produtoId: item.produtoId,
    descricao: item.descricao,
    quantidade: Number(item.quantidade_solicitada) || 0,
    vl_unitario: 0,
    observacao: '',
  }))
}

function preencherDeInitialData() {
  if (!props.initialData) return
  const d = props.initialData
  form.value = {
    fornecedorId: d.fornecedorId || 0,
    numero: d.numero || '',
    data_cotacao: d.data_cotacao || '',
    data_validade: d.data_validade || '',
    prazo_entrega_dias: d.prazo_entrega_dias ?? null,
    condicao_pagamento: d.condicao_pagamento || '',
    observacoes: d.observacoes || '',
  }
  if (d.itens && d.itens.length > 0) {
    itens.value = d.itens.map(item => ({
      itemPedidoCompraId: item.itemPedidoCompraId,
      produtoId: item.produtoId,
      descricao: item.descricao,
      quantidade: Number(item.quantidade) || 0,
      vl_unitario: Number(item.vl_unitario) || 0,
      observacao: item.observacao || '',
    }))
  }
}

watch(() => props.isOpen, async (open) => {
  if (open) {
    await carregarFornecedores()
    if (props.initialData) {
      preencherDeInitialData()
    } else {
      resetForm()
    }
  }
})

function calcularVlTotalItem(item: CotacaoItemSemId): number {
  return Number(((Number(item.quantidade) || 0) * (Number(item.vl_unitario) || 0)).toFixed(2))
}

function handleSave() {
  if (!form.value.fornecedorId) {
    toast.error('Selecione um fornecedor')
    return
  }
  if (!form.value.numero) {
    toast.error('Informe o numero da cotacao')
    return
  }
  if (!form.value.data_cotacao) {
    toast.error('Informe a data da cotacao')
    return
  }
  if (itens.value.length === 0) {
    toast.error('Adicione pelo menos um item')
    return
  }
  const itensComValor = itens.value.filter(i => Number(i.vl_unitario) > 0)
  if (itensComValor.length === 0) {
    toast.error('Informe o valor unitario de pelo menos um item')
    return
  }

  const payload = {
    pedidoCompraId: props.pedidoCompraId,
    ...form.value,
    data_validade: form.value.data_validade || undefined,
    prazo_entrega_dias: form.value.prazo_entrega_dias || undefined,
    condicao_pagamento: form.value.condicao_pagamento || undefined,
    observacoes: form.value.observacoes || undefined,
    itens: itens.value.filter(i => Number(i.vl_unitario) > 0).map(i => ({
      ...i,
      observacao: i.observacao || undefined,
    })),
  }

  emit('save', payload)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="emit('close')"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b">
          <h2 class="text-lg font-semibold text-gray-800">{{ title }}</h2>
          <button
            class="p-1 hover:bg-gray-100 rounded"
            @click="emit('close')"
          >
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-4 space-y-4">
          <!-- Campos do cabecalho -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fornecedor *</label>
              <select
                v-model="form.fornecedorId"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
              >
                <option :value="0" disabled>Selecione...</option>
                <option
                  v-for="f in fornecedores"
                  :key="f.id_pessoa || f.id"
                  :value="f.id_pessoa || f.id"
                >
                  {{ f.nome }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Numero *</label>
              <input
                v-model="form.numero"
                type="text"
                maxlength="20"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data Cotacao *</label>
              <input
                v-model="form.data_cotacao"
                type="date"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data Validade</label>
              <input
                v-model="form.data_validade"
                type="date"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prazo Entrega (dias)</label>
              <input
                v-model.number="form.prazo_entrega_dias"
                type="number"
                min="0"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cond. Pagamento</label>
              <input
                v-model="form.condicao_pagamento"
                type="text"
                placeholder="Ex: 30/60/90"
                maxlength="100"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
            <textarea
              v-model="form.observacoes"
              rows="2"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>

          <!-- Tabela de Itens -->
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Itens da Cotacao</h3>
            <div class="overflow-x-auto border rounded-md">
              <table class="w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left font-medium text-gray-600">Produto</th>
                    <th class="px-3 py-2 text-right font-medium text-gray-600 w-28">Quantidade</th>
                    <th class="px-3 py-2 text-right font-medium text-gray-600 w-32">Vl. Unitario</th>
                    <th class="px-3 py-2 text-right font-medium text-gray-600 w-32">Vl. Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, idx) in itens"
                    :key="idx"
                    class="border-t"
                  >
                    <td class="px-3 py-2 text-gray-800">{{ item.descricao }}</td>
                    <td class="px-3 py-2">
                      <input
                        v-model.number="item.quantidade"
                        type="number"
                        min="0"
                        step="0.01"
                        class="w-full text-right border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-lime-500"
                      />
                    </td>
                    <td class="px-3 py-2">
                      <input
                        v-model.number="item.vl_unitario"
                        type="number"
                        min="0"
                        step="0.01"
                        class="w-full text-right border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-lime-500"
                      />
                    </td>
                    <td class="px-3 py-2 text-right text-gray-700 font-medium">
                      {{ calcularVlTotalItem(item).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-50 border-t">
                  <tr>
                    <td colspan="3" class="px-3 py-2 text-right font-semibold text-gray-700">Total:</td>
                    <td class="px-3 py-2 text-right font-bold text-lime-700">
                      {{ vlTotalCotacao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 p-4 border-t">
          <button
            class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            @click="emit('close')"
          >
            Cancelar
          </button>
          <button
            class="px-4 py-2 text-sm text-white bg-lime-600 rounded-md hover:bg-lime-700 disabled:opacity-50"
            :disabled="loading"
            @click="handleSave"
          >
            {{ loading ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
