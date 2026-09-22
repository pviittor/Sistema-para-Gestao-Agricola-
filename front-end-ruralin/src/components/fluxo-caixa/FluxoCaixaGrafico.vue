<script setup lang="ts">
import { computed, ref } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { FluxoCaixaPeriodoDto } from '@/types/FluxoCaixa'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
)

const props = defineProps<{
  periodos: FluxoCaixaPeriodoDto[]
  periodosComparacao?: FluxoCaixaPeriodoDto[]
}>()

const chartData = computed(() => {
  const labels = props.periodos.map((p) => p.rotulo)

  const datasets: any[] = [
    {
      label: 'Entradas',
      data: props.periodos.map((p) => p.totalEntradas),
      backgroundColor: 'rgba(34, 197, 94, 0.7)',
      borderColor: 'rgb(34, 197, 94)',
      borderWidth: 1,
      borderRadius: 4,
      order: 2,
    },
    {
      label: 'Saídas',
      data: props.periodos.map((p) => p.totalSaidas),
      backgroundColor: 'rgba(239, 68, 68, 0.7)',
      borderColor: 'rgb(239, 68, 68)',
      borderWidth: 1,
      borderRadius: 4,
      order: 2,
    },
    {
      label: 'Saldo Acumulado',
      data: props.periodos.map((p) => p.saldoAcumulado),
      type: 'line' as const,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: 'rgb(59, 130, 246)',
      fill: false,
      tension: 0.3,
      order: 1,
    },
  ]

  if (props.periodosComparacao && props.periodosComparacao.length > 0) {
    datasets.push({
      label: 'Saldo Simulação',
      data: props.periodosComparacao.map((p) => p.saldoAcumulado),
      type: 'line' as const,
      borderColor: 'rgb(168, 85, 247)',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      borderWidth: 2,
      borderDash: [5, 5],
      pointRadius: 4,
      pointBackgroundColor: 'rgb(168, 85, 247)',
      fill: false,
      tension: 0.3,
      order: 0,
    })
  }

  return { labels, datasets }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 16,
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx: any) => {
          const value = ctx.parsed.y
          const formatted = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
          return `${ctx.dataset.label}: ${formatted}`
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      ticks: {
        callback: (value: any) =>
          value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
          }),
      },
    },
  },
}))

const chartComponentRef = ref<InstanceType<typeof Bar> | null>(null)

function getCanvas(): HTMLCanvasElement | null {
  return (chartComponentRef.value as any)?.chart?.canvas ?? null
}

defineExpose({ getCanvas })
</script>

<template>
  <div class="rounded-lg bg-white p-4 shadow-sm">
    <h3 class="mb-4 text-sm font-semibold text-gray-700">
      Fluxo de Caixa por Período
    </h3>
    <div class="h-80">
      <Bar
        v-if="periodos.length > 0"
        ref="chartComponentRef"
        :data="chartData"
        :options="chartOptions"
      />
      <div
        v-else
        class="flex h-full items-center justify-center text-sm text-gray-400"
      >
        Nenhum dado para exibir
      </div>
    </div>
  </div>
</template>
