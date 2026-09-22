<script setup lang="ts">
import { computed } from 'vue'
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  AlertCircle,
} from 'lucide-vue-next'

const props = defineProps<{
  saldoInicial: number
  totalEntradas: number
  totalSaidas: number
  saldoFinal: number
  totalAlertas: number
}>()

function formatCurrency(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const cards = computed(() => [
  {
    titulo: 'Saldo Inicial',
    valor: formatCurrency(props.saldoInicial),
    icon: Wallet,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    titulo: 'Total Entradas',
    valor: formatCurrency(props.totalEntradas),
    icon: ArrowUpCircle,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    titulo: 'Total Saídas',
    valor: formatCurrency(props.totalSaidas),
    icon: ArrowDownCircle,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  {
    titulo: 'Saldo Final',
    valor: formatCurrency(props.saldoFinal),
    icon: TrendingUp,
    iconColor: props.saldoFinal >= 0 ? 'text-green-500' : 'text-red-500',
    bgColor: props.saldoFinal >= 0 ? 'bg-green-50' : 'bg-red-50',
  },
  {
    titulo: 'Alertas',
    valor: String(props.totalAlertas),
    icon: AlertCircle,
    iconColor: props.totalAlertas > 0 ? 'text-amber-500' : 'text-gray-400',
    bgColor: props.totalAlertas > 0 ? 'bg-amber-50' : 'bg-gray-50',
  },
])
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
    <div
      v-for="card in cards"
      :key="card.titulo"
      class="rounded-lg bg-white p-4 shadow-sm"
    >
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-gray-500">{{ card.titulo }}</p>
        <div class="rounded-lg p-2" :class="card.bgColor">
          <component :is="card.icon" :size="20" :class="card.iconColor" />
        </div>
      </div>
      <p class="mt-2 text-xl font-bold text-gray-900">{{ card.valor }}</p>
    </div>
  </div>
</template>
