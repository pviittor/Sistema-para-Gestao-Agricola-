<script setup lang="ts">
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
import type { ProdutividadeOperador } from '@/types/OrdemServico'
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
  dados: ProdutividadeOperador[]
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

  const sorted = [...props.dados]
    .sort((a, b) => b.hasPorHora - a.hasPorHora)
    .slice(0, 10)

  if (sorted.length === 0) return

  const labels = sorted.map(d => d.nomerazaoPessoa)
  const values = sorted.map(d => d.hasPorHora)

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'ha/hora',
          data: values,
          backgroundColor: 'rgba(132, 204, 22, 0.8)',
          borderColor: 'rgb(77, 124, 15)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterBody(items) {
              const idx = items[0]?.dataIndex
              if (idx == null) return ''
              const d = sorted[idx]
              if (!d) return ''
              return [
                `Total OS: ${d.totalOS}`,
                `Concluidas: ${d.totalConcluidas}`,
                `Horas Reais: ${d.horasReaisTotal.toFixed(1)}h`,
                `Area Trabalhada: ${d.areaTrabalhadaTotal.toFixed(2)} ha`,
                `Custo Total: R$ ${d.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                `Media Horas/OS: ${d.mediaHorasPorOS.toFixed(1)}h`,
              ].join('\n')
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          title: { display: true, text: 'ha/hora' },
        },
        y: {
          ticks: {
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
    <h3 class="text-sm font-bold text-gray-700 mb-3">Produtividade por Operador (Top 10)</h3>
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-8 h-8 border-4 border-lime-200 border-t-lime-600 rounded-full animate-spin"></div>
    </div>
    <div v-else-if="dados.length === 0" class="text-sm text-gray-400 text-center py-8">
      Nenhum dado de produtividade encontrado
    </div>
    <div v-else class="relative" style="height: 350px">
      <canvas ref="chartCanvas" />
    </div>
  </div>
</template>
