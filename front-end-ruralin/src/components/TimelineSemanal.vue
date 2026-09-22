<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">Timeline Semanal de OS</h3>

    <!-- Loading -->
    <div v-if="props.loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600" />
    </div>

    <!-- Sem dados -->
    <div v-else-if="!props.dados || props.dados.length === 0" class="text-center py-12 text-gray-400 text-sm">
      Nenhum dado disponivel para o periodo
    </div>

    <!-- Grid -->
    <div v-else>
      <!-- Legenda -->
      <div class="flex flex-wrap gap-3 mb-4 text-xs">
        <div v-for="s in statusList" :key="s.key" class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-sm" :class="s.colorClass" />
          <span class="text-gray-600">{{ s.label }}</span>
        </div>
      </div>

      <!-- Headers semanas -->
      <div class="grid gap-1" :style="{ gridTemplateColumns: '2rem repeat(7, 1fr)' }">
        <!-- Header dias -->
        <div class="text-xs text-gray-400 font-medium" />
        <div
          v-for="dia in diasSemana"
          :key="dia"
          class="text-xs text-gray-500 font-medium text-center"
        >
          {{ dia }}
        </div>

        <!-- Rows por semana -->
        <template v-for="(semana, semIdx) in semanas" :key="semIdx">
          <div class="text-xs text-gray-500 font-medium flex items-center">
            S{{ semIdx + 1 }}
          </div>
          <div
            v-for="(dia, diaIdx) in semana"
            :key="diaIdx"
            class="relative group min-h-[36px] rounded border border-gray-100 bg-gray-50 p-0.5 flex flex-col gap-px cursor-default"
          >
            <!-- Mini-barras por status -->
            <template v-if="dia">
              <div
                v-for="s in getStatusBars(dia)"
                :key="s.key"
                class="rounded-sm h-1.5"
                :class="s.colorClass"
                :style="{ width: s.width + '%' }"
              />
              <!-- Data no canto -->
              <span class="absolute bottom-0 right-0.5 text-[9px] text-gray-400">
                {{ formatDia(dia.data) }}
              </span>
            </template>
            <template v-else>
              <span class="text-[9px] text-gray-300 m-auto">-</span>
            </template>

            <!-- Tooltip -->
            <div
              v-if="dia && dia.totalOS > 0"
              class="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block
                     bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg"
            >
              <div class="font-semibold mb-1">{{ formatDataCompleta(dia.data) }}</div>
              <div v-for="s in getStatusBars(dia)" :key="s.key" class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-sm" :class="s.colorClass" />
                <span>{{ s.label }}: {{ s.count }}</span>
              </div>
              <div class="mt-1 border-t border-gray-600 pt-1 font-semibold">
                Total: {{ dia.totalOS }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TimelineEntry } from '@/types/OrdemServico'

const props = defineProps<{
  dados: TimelineEntry[]
  loading: boolean
}>()

const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']

const statusList = [
  { key: 'PLANEJADA', label: 'Planejada', colorClass: 'bg-gray-400' },
  { key: 'ATRIBUIDA', label: 'Atribuida', colorClass: 'bg-blue-500' },
  { key: 'EM_EXECUCAO', label: 'Em Execucao', colorClass: 'bg-amber-500' },
  { key: 'CONCLUIDA', label: 'Concluida', colorClass: 'bg-green-500' },
  { key: 'VALIDADA', label: 'Validada', colorClass: 'bg-emerald-600' },
  { key: 'CANCELADA', label: 'Cancelada', colorClass: 'bg-red-500' },
]

const semanas = computed(() => {
  if (!props.dados.length) return []

  const result: (TimelineEntry | null)[][] = []
  let currentWeek: (TimelineEntry | null)[] = []

  const firstEntry = props.dados[0]
  if (!firstEntry) return []
  const firstDate = new Date(firstEntry.data + 'T00:00:00')
  let dayOfWeek = firstDate.getDay()
  dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  for (let i = 0; i < dayOfWeek; i++) {
    currentWeek.push(null)
  }

  for (const entry of props.dados) {
    currentWeek.push(entry)
    if (currentWeek.length === 7) {
      result.push(currentWeek)
      currentWeek = []
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null)
    }
    result.push(currentWeek)
  }

  return result.slice(0, 4)
})

function getStatusBars(entry: TimelineEntry) {
  const maxCount = Math.max(entry.totalOS, 1)
  return statusList
    .filter(s => (entry.totalPorStatus[s.key] || 0) > 0)
    .map(s => ({
      ...s,
      count: entry.totalPorStatus[s.key] || 0,
      width: Math.max(((entry.totalPorStatus[s.key] || 0) / maxCount) * 100, 15),
    }))
}

function formatDia(data: string): string {
  const d = new Date(data + 'T00:00:00')
  return d.getDate().toString()
}

function formatDataCompleta(data: string): string {
  const d = new Date(data + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
}
</script>
