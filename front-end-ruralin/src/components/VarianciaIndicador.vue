<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'

const props = defineProps<{
  label: string
  planejado: number | null
  real: number | null
  variancia: number | null
  unidade?: string
  tipo?: 'percentual' | 'dias' | 'valor'
}>()

const formatValue = (v: number | null) => {
  if (v == null) return '-'
  if (props.unidade === 'R$') {
    return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

const suffix = computed(() => {
  if (props.unidade === 'R$') return ''
  return props.unidade ? ` ${props.unidade}` : ''
})

const varianciaFormatted = computed(() => {
  if (props.variancia == null) return '-'
  if (props.tipo === 'dias') return `${props.variancia} dias`
  return `${props.variancia.toFixed(1)}%`
})

const colorClass = computed(() => {
  if (props.variancia == null) return 'text-gray-400'
  if (props.tipo === 'dias') {
    if (props.variancia <= 0) return 'text-green-600'
    if (props.variancia <= 3) return 'text-amber-600'
    return 'text-red-600'
  }
  const abs = Math.abs(props.variancia)
  if (abs < 10) return 'text-green-600'
  if (abs < 20) return 'text-amber-600'
  return 'text-red-600'
})

const bgClass = computed(() => {
  if (props.variancia == null) return 'bg-gray-50'
  if (props.tipo === 'dias') {
    if (props.variancia <= 0) return 'bg-green-50'
    if (props.variancia <= 3) return 'bg-amber-50'
    return 'bg-red-50'
  }
  const abs = Math.abs(props.variancia)
  if (abs < 10) return 'bg-green-50'
  if (abs < 20) return 'bg-amber-50'
  return 'bg-red-50'
})

const iconComponent = computed(() => {
  if (props.variancia == null) return Minus
  return props.variancia > 0 ? TrendingUp : props.variancia < 0 ? TrendingDown : Minus
})
</script>

<template>
  <div class="rounded-xl border border-gray-200 p-4" :class="bgClass">
    <div class="flex items-center justify-between mb-3">
      <p class="text-xs font-bold text-gray-500 uppercase">{{ label }}</p>
      <component
        :is="iconComponent"
        class="h-5 w-5"
        :class="colorClass"
      />
    </div>
    <div class="space-y-2">
      <div class="flex justify-between items-baseline">
        <span class="text-xs text-gray-500">Planejado</span>
        <span class="text-sm font-medium text-gray-700">{{ formatValue(planejado) }}{{ suffix }}</span>
      </div>
      <div class="flex justify-between items-baseline">
        <span class="text-xs text-gray-500">Real</span>
        <span class="text-sm font-medium text-gray-700">{{ formatValue(real) }}{{ suffix }}</span>
      </div>
      <div class="border-t border-gray-200 pt-2 flex justify-between items-baseline">
        <span class="text-xs font-bold text-gray-500">Variancia</span>
        <span class="text-lg font-bold" :class="colorClass">{{ varianciaFormatted }}</span>
      </div>
    </div>
  </div>
</template>
