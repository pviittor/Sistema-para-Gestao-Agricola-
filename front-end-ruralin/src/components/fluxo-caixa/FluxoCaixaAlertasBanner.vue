<script setup lang="ts">
import { ref } from 'vue'
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-vue-next'
import type { FluxoCaixaAlertaDto } from '@/types/FluxoCaixa'

defineProps<{
  alertas: FluxoCaixaAlertaDto[]
}>()

const expandido = ref(true)

function formatCurrency(valor: number | null) {
  if (valor === null || valor === undefined) return ''
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function severidadeClasses(severidade: string) {
  switch (severidade) {
    case 'danger':
      return 'border-red-200 bg-red-50 text-red-800'
    case 'warning':
      return 'border-yellow-200 bg-yellow-50 text-yellow-800'
    default:
      return 'border-blue-200 bg-blue-50 text-blue-800'
  }
}

function severidadeIconColor(severidade: string) {
  switch (severidade) {
    case 'danger':
      return 'text-red-500'
    case 'warning':
      return 'text-yellow-500'
    default:
      return 'text-blue-500'
  }
}
</script>

<template>
  <div
    v-if="alertas.length > 0"
    class="rounded-lg border border-amber-200 bg-amber-50"
  >
    <button
      class="flex w-full items-center justify-between px-4 py-3"
      @click="expandido = !expandido"
    >
      <div class="flex items-center gap-2">
        <AlertTriangle :size="20" class="text-amber-600" />
        <span class="text-sm font-semibold text-amber-800">
          {{ alertas.length }} alerta{{ alertas.length > 1 ? 's' : '' }} encontrado{{ alertas.length > 1 ? 's' : '' }}
        </span>
      </div>
      <component
        :is="expandido ? ChevronUp : ChevronDown"
        :size="18"
        class="text-amber-600"
      />
    </button>

    <div v-if="expandido" class="space-y-2 px-4 pb-4">
      <div
        v-for="(alerta, idx) in alertas"
        :key="idx"
        class="flex items-start gap-3 rounded-md border p-3"
        :class="severidadeClasses(alerta.severidade)"
      >
        <AlertTriangle
          :size="16"
          class="mt-0.5 shrink-0"
          :class="severidadeIconColor(alerta.severidade)"
        />
        <div class="flex-1">
          <p class="text-sm font-medium">{{ alerta.mensagem }}</p>
          <div class="mt-1 flex items-center gap-3 text-xs opacity-75">
            <span v-if="alerta.data">{{ alerta.data }}</span>
            <span v-if="alerta.valor !== null">{{ formatCurrency(alerta.valor) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
