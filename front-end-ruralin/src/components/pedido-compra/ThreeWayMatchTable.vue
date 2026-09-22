<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-vue-next'
import type { ItemPedidoCompra } from '@/types/PedidoCompra'
import type { CotacaoItem } from '@/types/Cotacao'

export interface ThreeWayRow {
  produtoId: number
  descricao: string
  unidade: string
  pedido_qty: number
  pedido_vl: number
  cotacao_qty: number | null
  cotacao_vl: number | null
  recebido_qty: number
  recebido_vl: number
}

const props = defineProps<{
  itensPedido: ItemPedidoCompra[]
  itensCotacao?: CotacaoItem[]
}>()

const rows = computed<ThreeWayRow[]>(() => {
  return props.itensPedido.map(ip => {
    const cotItem = props.itensCotacao?.find(
      ci => ci.produtoId === ip.produtoId || ci.itemPedidoCompraId === ip.id_item_ped
    )
    return {
      produtoId: ip.produtoId,
      descricao: ip.descricao || ip.produto?.descricao_prod || `Produto #${ip.produtoId}`,
      unidade: ip.unidade || '-',
      pedido_qty: Number(ip.quantidade_solicitada) || 0,
      pedido_vl: Number(ip.vl_unitario) || 0,
      cotacao_qty: cotItem ? Number(cotItem.quantidade) : null,
      cotacao_vl: cotItem ? Number(cotItem.vl_unitario) : null,
      recebido_qty: Number(ip.quantidade_atendida) || 0,
      recebido_vl: Number(ip.vl_unitario) || 0,
    }
  })
})

function matchStatus(row: ThreeWayRow): 'ok' | 'parcial' | 'divergente' {
  const qtyMatch = row.recebido_qty >= row.pedido_qty
  const qtyCotMatch = row.cotacao_qty == null || row.recebido_qty >= row.cotacao_qty
  if (qtyMatch && qtyCotMatch) return 'ok'
  if (row.recebido_qty > 0) return 'parcial'
  return 'divergente'
}

function formatCurrency(value: number | null) {
  if (value == null) return '-'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatQty(value: number | null) {
  if (value == null) return '-'
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value)
}
</script>

<template>
  <div class="overflow-x-auto border rounded-md">
    <table class="w-full text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-3 py-2 text-left font-medium text-gray-600" rowspan="2">Produto</th>
          <th class="px-3 py-2 text-center font-medium text-blue-600 border-l" colspan="2">Pedido</th>
          <th class="px-3 py-2 text-center font-medium text-amber-600 border-l" colspan="2">Cotação</th>
          <th class="px-3 py-2 text-center font-medium text-green-600 border-l" colspan="2">Recebido</th>
          <th class="px-3 py-2 text-center font-medium text-gray-600 border-l w-20" rowspan="2">Status</th>
        </tr>
        <tr>
          <th class="px-3 py-1 text-right text-xs text-gray-500 border-l">Qty</th>
          <th class="px-3 py-1 text-right text-xs text-gray-500">Vl. Unit.</th>
          <th class="px-3 py-1 text-right text-xs text-gray-500 border-l">Qty</th>
          <th class="px-3 py-1 text-right text-xs text-gray-500">Vl. Unit.</th>
          <th class="px-3 py-1 text-right text-xs text-gray-500 border-l">Qty</th>
          <th class="px-3 py-1 text-right text-xs text-gray-500">Vl. Unit.</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.produtoId"
          class="border-t"
        >
          <td class="px-3 py-2 text-gray-800">
            {{ row.descricao }}
            <span class="text-xs text-gray-400 ml-1">({{ row.unidade }})</span>
          </td>
          <td class="px-3 py-2 text-right text-gray-700 border-l">{{ formatQty(row.pedido_qty) }}</td>
          <td class="px-3 py-2 text-right text-gray-700">{{ formatCurrency(row.pedido_vl) }}</td>
          <td class="px-3 py-2 text-right text-gray-700 border-l">{{ formatQty(row.cotacao_qty) }}</td>
          <td class="px-3 py-2 text-right text-gray-700">{{ formatCurrency(row.cotacao_vl) }}</td>
          <td class="px-3 py-2 text-right text-gray-700 border-l">{{ formatQty(row.recebido_qty) }}</td>
          <td class="px-3 py-2 text-right text-gray-700">{{ formatCurrency(row.recebido_vl) }}</td>
          <td class="px-3 py-2 text-center border-l">
            <CheckCircle
              v-if="matchStatus(row) === 'ok'"
              class="w-5 h-5 text-green-500 mx-auto"
              title="Conferido"
            />
            <AlertTriangle
              v-else-if="matchStatus(row) === 'parcial'"
              class="w-5 h-5 text-amber-500 mx-auto"
              title="Parcialmente recebido"
            />
            <XCircle
              v-else
              class="w-5 h-5 text-red-400 mx-auto"
              title="Pendente"
            />
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td colspan="8" class="px-3 py-6 text-center text-gray-400 text-sm">
            Nenhum item para comparação.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
