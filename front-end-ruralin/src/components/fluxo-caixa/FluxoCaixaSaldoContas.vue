<script setup lang="ts">
import { CreditCard } from 'lucide-vue-next'
import type { FluxoCaixaSaldoContaDto } from '@/types/FluxoCaixa'

defineProps<{
  saldos: FluxoCaixaSaldoContaDto[]
}>()

function formatCurrency(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function saldoClass(valor: number) {
  return valor >= 0 ? 'text-green-600' : 'text-red-600'
}
</script>

<template>
  <div>
    <h3 class="mb-3 text-sm font-semibold text-gray-700">Saldo por Conta Bancária</h3>

    <div v-if="saldos.length === 0" class="rounded-lg bg-white p-6 text-center text-sm text-gray-400 shadow-sm">
      Nenhuma conta bancária encontrada
    </div>

    <div v-else class="flex gap-4 overflow-x-auto pb-2">
      <div
        v-for="conta in saldos"
        :key="conta.contaBancariaId"
        class="min-w-[240px] flex-shrink-0 rounded-lg bg-white p-4 shadow-sm"
      >
        <div class="mb-3 flex items-center gap-2">
          <div class="rounded-lg bg-lime-50 p-2">
            <CreditCard :size="18" class="text-lime-600" />
          </div>
          <span class="text-sm font-semibold text-gray-800 truncate">
            {{ conta.contaBancariaNome }}
          </span>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">Saldo Atual</span>
            <span class="text-sm font-bold" :class="saldoClass(conta.saldoAtual)">
              {{ formatCurrency(conta.saldoAtual) }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">Entradas Proj.</span>
            <span class="text-sm text-green-600">
              +{{ formatCurrency(conta.entradasProjetadas) }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">Saídas Proj.</span>
            <span class="text-sm text-red-600">
              -{{ formatCurrency(conta.saidasProjetadas) }}
            </span>
          </div>
          <div class="border-t border-gray-100 pt-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-gray-600">Saldo Projetado</span>
              <span class="text-sm font-bold" :class="saldoClass(conta.saldoProjetado)">
                {{ formatCurrency(conta.saldoProjetado) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
