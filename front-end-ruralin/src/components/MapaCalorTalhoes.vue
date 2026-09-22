<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">Mapa de Calor - Atividades por Talhao</h3>

    <!-- Loading -->
    <div v-if="props.loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600" />
    </div>

    <!-- Sem dados -->
    <div v-else-if="!dados || dados.length === 0" class="text-center py-12 text-gray-400 text-sm">
      Nenhum talhao com dados de atividade
    </div>

    <div v-else>
      <!-- Legenda -->
      <div class="flex items-center gap-2 mb-4 text-xs text-gray-500">
        <span>Menos OS</span>
        <div class="flex h-3 rounded overflow-hidden">
          <div class="w-6 bg-green-200" />
          <div class="w-6 bg-green-400" />
          <div class="w-6 bg-yellow-300" />
          <div class="w-6 bg-orange-400" />
          <div class="w-6 bg-red-400" />
          <div class="w-6 bg-red-600" />
        </div>
        <span>Mais OS</span>
      </div>

      <!-- Grid de cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <div
          v-for="entry in sortedDados"
          :key="entry.talhaoId"
          class="rounded-lg border border-gray-200 p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
          :class="cardBgClass(entry)"
          @click="toggleExpand(entry.talhaoId)"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-semibold text-gray-800 truncate">
              {{ entry.talhaoDescricao }}
            </span>
            <span
              v-if="entry.totalOS === 0"
              class="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full"
            >
              Sem geometria
            </span>
          </div>

          <!-- Metricas resumo -->
          <div class="space-y-0.5 text-xs text-gray-700">
            <div class="flex justify-between">
              <span>Total OS</span>
              <span class="font-semibold">{{ entry.totalOS }}</span>
            </div>
            <div class="flex justify-between">
              <span>Custo Total</span>
              <span class="font-semibold">{{ formatCurrency(entry.custoTotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Em Execucao</span>
              <span class="font-semibold text-amber-600">{{ entry.totalEmExecucao }}</span>
            </div>
          </div>

          <!-- Detalhes expandidos -->
          <div
            v-if="expandedId === entry.talhaoId"
            class="mt-2 pt-2 border-t border-gray-300/50 space-y-0.5 text-xs text-gray-600"
          >
            <div class="flex justify-between">
              <span>Concluidas</span>
              <span class="font-semibold text-green-600">{{ entry.totalConcluidas }}</span>
            </div>
            <div class="flex justify-between">
              <span>Area Total</span>
              <span class="font-semibold">{{ entry.areaTotal?.toFixed(2) || '0' }} ha</span>
            </div>
            <div v-if="entry.areaTotal && entry.areaTotal > 0" class="flex justify-between">
              <span>Custo/ha</span>
              <span class="font-semibold">
                {{ formatCurrency(entry.custoTotal / entry.areaTotal) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MapaCalorEntry } from '@/types/OrdemServico'

const props = defineProps<{
  dados: MapaCalorEntry[]
  fazendaId?: number | ''
  loading?: boolean
}>()

const expandedId = ref<number | null>(null)

const sortedDados = computed(() => {
  return [...props.dados].sort((a, b) => b.totalOS - a.totalOS)
})

const maxOS = computed(() => {
  if (!props.dados.length) return 1
  return Math.max(...props.dados.map(d => d.totalOS), 1)
})

function cardBgClass(entry: MapaCalorEntry): string {
  if (entry.totalOS === 0) return 'bg-gray-50'
  const ratio = entry.totalOS / maxOS.value
  if (ratio < 0.15) return 'bg-green-50'
  if (ratio < 0.3) return 'bg-green-100'
  if (ratio < 0.45) return 'bg-yellow-50'
  if (ratio < 0.6) return 'bg-yellow-100'
  if (ratio < 0.75) return 'bg-orange-50'
  if (ratio < 0.9) return 'bg-orange-100'
  return 'bg-red-50'
}

function toggleExpand(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}

function formatCurrency(value: number): string {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>
