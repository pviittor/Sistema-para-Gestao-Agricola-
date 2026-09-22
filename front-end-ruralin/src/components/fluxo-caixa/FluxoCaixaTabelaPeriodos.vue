<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import type { FluxoCaixaPeriodoDto } from '@/types/FluxoCaixa'

defineProps<{
  periodos: FluxoCaixaPeriodoDto[]
}>()

const expandedRows = ref<Set<number>>(new Set())

function toggleRow(idx: number) {
  if (expandedRows.value.has(idx)) {
    expandedRows.value.delete(idx)
  } else {
    expandedRows.value.add(idx)
  }
}

function formatCurrency(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function saldoClass(valor: number) {
  return valor >= 0 ? 'text-green-600' : 'text-red-600'
}
</script>

<template>
  <div class="overflow-hidden rounded-lg bg-white shadow-sm">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="w-10 px-4 py-3"></th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            Período
          </th>
          <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
            Entradas
          </th>
          <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
            Saídas
          </th>
          <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
            Saldo Período
          </th>
          <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
            Saldo Acumulado
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <template v-for="(periodo, idx) in periodos" :key="idx">
          <tr
            class="cursor-pointer transition-colors hover:bg-gray-50"
            @click="toggleRow(idx)"
          >
            <td class="px-4 py-3">
              <component
                :is="expandedRows.has(idx) ? ChevronDown : ChevronRight"
                :size="16"
                class="text-gray-400"
              />
            </td>
            <td class="px-4 py-3 text-sm font-medium text-gray-900">
              {{ periodo.rotulo }}
            </td>
            <td class="px-4 py-3 text-right text-sm text-green-600">
              {{ formatCurrency(periodo.totalEntradas) }}
            </td>
            <td class="px-4 py-3 text-right text-sm text-red-600">
              {{ formatCurrency(periodo.totalSaidas) }}
            </td>
            <td class="px-4 py-3 text-right text-sm font-medium" :class="saldoClass(periodo.saldoPeriodo)">
              {{ formatCurrency(periodo.saldoPeriodo) }}
            </td>
            <td class="px-4 py-3 text-right text-sm font-bold" :class="saldoClass(periodo.saldoAcumulado)">
              {{ formatCurrency(periodo.saldoAcumulado) }}
            </td>
          </tr>

          <tr v-if="expandedRows.has(idx)">
            <td colspan="6" class="bg-gray-50 px-4 py-2">
              <div v-if="periodo.lancamentos.length === 0" class="py-3 text-center text-sm text-gray-400">
                Nenhum lançamento neste período
              </div>
              <table v-else class="min-w-full">
                <thead>
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-400">Data</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-400">Descrição</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-400">Origem</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-400">Conta</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-400">Valor</th>
                    <th class="px-3 py-2 text-center text-xs font-medium text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="(lanc, lIdx) in periodo.lancamentos"
                    :key="lIdx"
                    class="text-sm"
                  >
                    <td class="px-3 py-2 text-gray-600">{{ lanc.data }}</td>
                    <td class="px-3 py-2 text-gray-900">{{ lanc.descricao }}</td>
                    <td class="px-3 py-2 text-gray-500">{{ lanc.origem }}</td>
                    <td class="px-3 py-2 text-gray-500">{{ lanc.contaBancariaNome || '-' }}</td>
                    <td
                      class="px-3 py-2 text-right font-medium"
                      :class="lanc.tipoFluxo === 'entrada' ? 'text-green-600' : 'text-red-600'"
                    >
                      {{ lanc.tipoFluxo === 'entrada' ? '+' : '-' }}{{ formatCurrency(lanc.valor) }}
                    </td>
                    <td class="px-3 py-2 text-center">
                      <span
                        class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                        :class="
                          lanc.realizado
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        "
                      >
                        {{ lanc.realizado ? 'Realizado' : 'Projetado' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </template>

        <tr v-if="periodos.length === 0">
          <td colspan="6" class="px-4 py-8 text-center text-sm text-gray-400">
            Nenhum período para exibir
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
