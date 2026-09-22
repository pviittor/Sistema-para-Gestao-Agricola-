<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold text-gray-800">Custeio por Talhao</h1>

    <!-- Filtros Toggle Mobile (T16.3) -->
    <div class="sm:hidden">
      <button
        @click="showMobileFilters = !showMobileFilters"
        class="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Filtros
        <svg v-if="!showMobileFilters" class="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        <svg v-else class="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg border border-gray-200 p-4" :class="{ 'hidden sm:block': !showMobileFilters }">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Fazenda -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fazenda</label>
          <select
            v-model="filtros.fazendaId"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
            @change="carregarDados"
          >
            <option :value="undefined">Todas</option>
            <option v-for="f in fazendas" :key="f.id" :value="f.id">{{ f.nome }}</option>
          </select>
        </div>

        <!-- Data Inicio -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Inicio</label>
          <input
            v-model="filtros.dataInicio"
            type="date"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
            @change="carregarDados"
          />
        </div>

        <!-- Data Fim -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
          <input
            v-model="filtros.dataFim"
            type="date"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
            @change="carregarDados"
          />
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-lime-600" />
    </div>

    <template v-else>
      <!-- Cards resumo -->
      <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <p class="text-xs text-gray-500 uppercase font-semibold">Custo Total</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ formatCurrency(resumoAgregado.custoTotal) }}</p>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <p class="text-xs text-gray-500 uppercase font-semibold">Custo Medio/ha</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ formatCurrency(resumoAgregado.custoMedioHa) }}</p>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <p class="text-xs text-gray-500 uppercase font-semibold">Total Talhoes</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ resumoAgregado.totalTalhoes }}</p>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <p class="text-xs text-gray-500 uppercase font-semibold">Total OS</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ resumoAgregado.totalOS }}</p>
        </div>
      </div>

      <!-- Tabela -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Talhao</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Safra</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Total OS</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Custo Real (R$)</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Custo Estimado (R$)</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Variancia (%)</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Area (ha)</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Custo/ha (R$)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in custeioData" :key="`${item.talhaoId}-${item.safraId}`" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-900 font-medium">{{ item.talhaoDescricao }}</td>
                <td class="px-4 py-3 text-gray-700">{{ item.safraNome }}</td>
                <td class="px-4 py-3 text-gray-700 text-right">{{ item.totalOS }}</td>
                <td class="px-4 py-3 text-gray-700 text-right">{{ formatCurrency(item.custoRealTotal) }}</td>
                <td class="px-4 py-3 text-gray-700 text-right">{{ formatCurrency(item.custoEstimadoTotal) }}</td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-semibold"
                    :class="varianciaBadgeClass(item.varianciaCustoPercent)"
                  >
                    {{ item.varianciaCustoPercent?.toFixed(1) || '0.0' }}%
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-700 text-right">{{ item.areaTotal?.toFixed(2) || '-' }}</td>
                <td class="px-4 py-3 text-gray-700 text-right">{{ formatCurrency(item.custoPorHa) }}</td>
              </tr>
            </tbody>
            <!-- Linha de totais -->
            <tfoot class="bg-gray-50 border-t-2 border-gray-300">
              <tr class="font-bold text-gray-800">
                <td class="px-4 py-3">Total</td>
                <td class="px-4 py-3" />
                <td class="px-4 py-3 text-right">{{ totais.totalOS }}</td>
                <td class="px-4 py-3 text-right">{{ formatCurrency(totais.custoReal) }}</td>
                <td class="px-4 py-3 text-right">{{ formatCurrency(totais.custoEstimado) }}</td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-semibold"
                    :class="varianciaBadgeClass(totais.variancia)"
                  >
                    {{ totais.variancia.toFixed(1) }}%
                  </span>
                </td>
                <td class="px-4 py-3 text-right">{{ totais.area.toFixed(2) }}</td>
                <td class="px-4 py-3 text-right">{{ formatCurrency(totais.custoPorHa) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Grafico Chart.js -->
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Custo Real vs Estimado por Talhao</h3>
        <div class="relative" style="height: 350px">
          <canvas ref="chartCanvas" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { ordemServicoService } from '@/services/ordemServicoService'
import { propriedadeService } from '@/services/propriedadeService'
import { useSafraStore } from '@/stores/safra'
import type { CusteioTalhao, CusteioResumo } from '@/types/OrdemServico'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const safraStore = useSafraStore()

interface Fazenda {
  id: number
  nome: string
}

const showMobileFilters = ref(false)
const loading = ref(false)
const custeioData = ref<CusteioTalhao[]>([])
const resumoData = ref<CusteioResumo[]>([])
const fazendas = ref<Fazenda[]>([])
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const filtros = reactive<{
  fazendaId?: number
  dataInicio?: string
  dataFim?: string
}>({})

const resumoAgregado = computed(() => {
  const custoTotal = resumoData.value.reduce((acc, r) => acc + (r.custoTotal || 0), 0)
  const areaTotal = resumoData.value.reduce((acc, r) => acc + (r.areaTotal || 0), 0)
  const totalTalhoes = resumoData.value.reduce((acc, r) => acc + (r.totalTalhoes || 0), 0)
  const totalOS = custeioData.value.reduce((acc, r) => acc + (r.totalOS || 0), 0)
  const custoMedioHa = areaTotal > 0 ? custoTotal / areaTotal : 0
  return { custoTotal, custoMedioHa, totalTalhoes, totalOS }
})

const totais = computed(() => {
  const custoReal = custeioData.value.reduce((acc, i) => acc + (i.custoRealTotal || 0), 0)
  const custoEstimado = custeioData.value.reduce((acc, i) => acc + (i.custoEstimadoTotal || 0), 0)
  const totalOS = custeioData.value.reduce((acc, i) => acc + (i.totalOS || 0), 0)
  const area = custeioData.value.reduce((acc, i) => acc + (i.areaTotal || 0), 0)
  const variancia = custoEstimado > 0 ? ((custoReal - custoEstimado) / custoEstimado) * 100 : 0
  const custoPorHa = area > 0 ? custoReal / area : 0
  return { custoReal, custoEstimado, totalOS, area, variancia, custoPorHa }
})

function varianciaBadgeClass(variancia: number | null): string {
  const abs = Math.abs(variancia || 0)
  if (abs < 10) return 'bg-green-100 text-green-700'
  if (abs < 20) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

function formatCurrency(value: number | null): string {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function carregarFiltros() {
  try {
    const fazendaRes = await propriedadeService.getAllNoPagination()
    fazendas.value = (fazendaRes.data || []) as unknown as Fazenda[]
  } catch (e) {
    console.error('Erro ao carregar filtros:', e)
  }
}

async function carregarDados() {
  loading.value = true
  try {
    const params: Record<string, any> = {}
    if (safraStore.selectedSafraId) params.safraId = safraStore.selectedSafraId
    if (filtros.fazendaId) params.fazendaId = filtros.fazendaId
    if (filtros.dataInicio) params.dataInicio = filtros.dataInicio
    if (filtros.dataFim) params.dataFim = filtros.dataFim

    const [custeioRes, resumoRes] = await Promise.all([
      ordemServicoService.getCusteio(params),
      ordemServicoService.getCusteioResumo(params),
    ])

    custeioData.value = custeioRes.data as CusteioTalhao[]
    resumoData.value = resumoRes.data as CusteioResumo[]

    await nextTick()
    renderChart()
  } catch (e) {
    console.error('Erro ao carregar custeio:', e)
  } finally {
    loading.value = false
  }
}

function renderChart() {
  if (!chartCanvas.value) return

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const labels = custeioData.value.map(i => i.talhaoDescricao)
  const custoReal = custeioData.value.map(i => i.custoRealTotal || 0)
  const custoEstimado = custeioData.value.map(i => i.custoEstimadoTotal || 0)

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Custo Real',
          data: custoReal,
          backgroundColor: 'rgba(101, 163, 13, 0.8)',
          borderColor: 'rgb(101, 163, 13)',
          borderWidth: 1,
        },
        {
          label: 'Custo Estimado',
          data: custoEstimado,
          backgroundColor: 'rgba(156, 163, 175, 0.6)',
          borderColor: 'rgb(156, 163, 175)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed.y || 0
              return `${ctx.dataset.label}: ${val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => {
              return 'R$ ' + Number(value).toLocaleString('pt-BR')
            },
          },
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 0,
          },
        },
      },
    },
  })
}

watch(() => safraStore.selectedSafraId, () => {
  carregarDados()
})

onMounted(async () => {
  await carregarFiltros()
  await carregarDados()
})
</script>
