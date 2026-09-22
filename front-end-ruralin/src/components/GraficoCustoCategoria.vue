<script setup lang="ts">
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
import type { CustoCategoria } from '@/types/OrdemServico'
import {
  Chart,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

Chart.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps<{
  dados: CustoCategoria[]
  loading: boolean
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

function renderChart() {
  if (!chartCanvas.value) return

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  if (props.dados.length === 0) return

  const labels = props.dados.map(d => d.tipoNome)
  const planejado = props.dados.map(d => d.custoEstimadoTotal)
  const real = props.dados.map(d => d.custoRealTotal)

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Planejado',
          data: planejado,
          backgroundColor: 'rgba(156, 163, 175, 0.7)',
          borderColor: 'rgb(107, 114, 128)',
          borderWidth: 1,
        },
        {
          label: 'Real',
          data: real,
          backgroundColor: 'rgba(132, 204, 22, 0.8)',
          borderColor: 'rgb(77, 124, 15)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            afterBody(items) {
              const idx = items[0]?.dataIndex
              if (idx == null) return ''
              const d = props.dados[idx]
              if (!d) return ''
              return [
                `Categoria: ${d.categoria}`,
                `Total OS: ${d.totalOS}`,
                `Variancia: ${d.varianciaCustoPercent.toFixed(1)}%`,
                `Custo Medio/OS: R$ ${d.custoMedioOS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
              ].join('\n')
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => 'R$ ' + Number(value).toLocaleString('pt-BR'),
          },
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 0,
            font: { size: 11 },
          },
        },
      },
    },
  })
}

watch(
  () => props.dados,
  async () => {
    await nextTick()
    renderChart()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<template>
  <div>
    <h3 class="text-sm font-bold text-gray-700 mb-3">Custo por Categoria de Atividade</h3>
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-8 h-8 border-4 border-lime-200 border-t-lime-600 rounded-full animate-spin"></div>
    </div>
    <div v-else-if="dados.length === 0" class="text-sm text-gray-400 text-center py-8">
      Nenhum dado de custo por categoria encontrado
    </div>
    <div v-else class="relative" style="height: 350px">
      <canvas ref="chartCanvas" />
    </div>
  </div>
</template>
