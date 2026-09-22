<script setup lang="ts">
import type { RankingTalhao } from '@/types/OrdemServico'

defineProps<{
  dados: RankingTalhao[]
  loading: boolean
}>()

function formatCurrency(v: number | null): string {
  if (v == null) return '-'
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function varianciaBadgeClass(v: number | null): string {
  if (v == null) return 'bg-gray-100 text-gray-600'
  const abs = Math.abs(v)
  if (abs < 10) return 'bg-green-100 text-green-700'
  if (abs < 20) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}
</script>

<template>
  <div>
    <h3 class="text-sm font-bold text-gray-700 mb-3">Ranking de Talhoes por Custo</h3>
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-8 h-8 border-4 border-lime-200 border-t-lime-600 rounded-full animate-spin"></div>
    </div>
    <div v-else-if="dados.length === 0" class="text-sm text-gray-400 text-center py-8">
      Nenhum dado de ranking encontrado
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">#</th>
            <th class="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">Talhao</th>
            <th class="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase">Total OS</th>
            <th class="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase">Custo Real</th>
            <th class="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase">Area (ha)</th>
            <th class="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase">Custo/ha</th>
            <th class="px-3 py-2 text-center text-xs font-bold text-gray-500 uppercase">Variancia</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="(item, idx) in dados"
            :key="item.talhaoId"
            class="hover:bg-gray-50 transition-colors"
            :class="idx < 3 ? 'bg-lime-50' : ''"
          >
            <td class="px-3 py-2 text-gray-700 font-bold">{{ idx + 1 }}</td>
            <td class="px-3 py-2 text-gray-900 font-medium">{{ item.talhaoDescricao }}</td>
            <td class="px-3 py-2 text-gray-700 text-right">{{ item.totalOS }}</td>
            <td class="px-3 py-2 text-gray-700 text-right">{{ formatCurrency(item.custoRealTotal) }}</td>
            <td class="px-3 py-2 text-gray-700 text-right">{{ item.areaTotal?.toFixed(2) || '-' }}</td>
            <td class="px-3 py-2 text-gray-700 text-right">{{ formatCurrency(item.custoPorHa) }}</td>
            <td class="px-3 py-2 text-center">
              <span
                class="px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="varianciaBadgeClass(item.varianciaPercent)"
              >
                {{ item.varianciaPercent != null ? item.varianciaPercent.toFixed(1) + '%' : '-' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
