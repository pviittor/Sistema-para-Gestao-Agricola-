<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { DollarSign, FileSpreadsheet, FileText, FlaskConical, List } from 'lucide-vue-next'
import { toast } from 'vue3-toastify'
import { useFluxoCaixaStore } from '@/stores/fluxoCaixa'
import { useSafraStore } from '@/stores/safra'
import FluxoCaixaFiltros from '@/components/fluxo-caixa/FluxoCaixaFiltros.vue'
import FluxoCaixaAlertasBanner from '@/components/fluxo-caixa/FluxoCaixaAlertasBanner.vue'
import FluxoCaixaResumoCards from '@/components/fluxo-caixa/FluxoCaixaResumoCards.vue'
import FluxoCaixaGrafico from '@/components/fluxo-caixa/FluxoCaixaGrafico.vue'
import FluxoCaixaTabelaPeriodos from '@/components/fluxo-caixa/FluxoCaixaTabelaPeriodos.vue'
import FluxoCaixaSaldoContas from '@/components/fluxo-caixa/FluxoCaixaSaldoContas.vue'
import FluxoCaixaSimulacaoPanel from '@/components/fluxo-caixa/FluxoCaixaSimulacaoPanel.vue'
import FluxoCaixaSimulacaoModal from '@/components/fluxo-caixa/FluxoCaixaSimulacaoModal.vue'
import { exportarExcel, exportarPDF } from '@/utils/exportFluxoCaixa'
import type { FluxoCaixaSimulacaoDto } from '@/types/FluxoCaixa'

const store = useFluxoCaixaStore()
const safraStore = useSafraStore()
const {
  filtros,
  tabAtiva,
  consolidado,
  carregandoConsolidado,
  temAlertas,
  erroGlobal,
  modalSimulacaoAberto,
  simulacaoEmEdicao,
  carregandoSimulacoes,
} = storeToRefs(store)

const panelAberto = ref(false)
const graficoRef = ref<InstanceType<typeof FluxoCaixaGrafico> | null>(null)

const tabs = [
  { key: 'consolidado' as const, label: 'Consolidado' },
  { key: 'realizado' as const, label: 'Realizado' },
  { key: 'projetado' as const, label: 'Projetado' },
]

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  [filtros, tabAtiva],
  () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      store.buscarConsolidado()
    }, 400)
  },
  { deep: true },
)

function handleSimularCenario() {
  store.abrirModalSimulacao()
}

async function handleAbrirPanel() {
  panelAberto.value = true
  await store.listarSimulacoes()
}

function handleEditarSimulacao(simulacao: FluxoCaixaSimulacaoDto) {
  panelAberto.value = false
  store.abrirModalSimulacao(simulacao as any)
}

async function handleExportarExcel() {
  if (!consolidado.value) {
    toast.warning('Nenhum dado para exportar')
    return
  }
  try {
    await exportarExcel(consolidado.value, filtros.value)
    toast.success('Excel exportado com sucesso')
  } catch {
    toast.error('Erro ao exportar Excel')
  }
}

async function handleExportarPDF() {
  if (!consolidado.value) {
    toast.warning('Nenhum dado para exportar')
    return
  }
  try {
    const canvas = graficoRef.value?.getCanvas() ?? undefined
    await exportarPDF(consolidado.value, filtros.value, canvas)
    toast.success('PDF exportado com sucesso')
  } catch {
    toast.error('Erro ao exportar PDF')
  }
}

watch(
  () => safraStore.selectedSafraId,
  (newId) => {
    store.atualizarFiltros({ idSafra: newId })
  },
)

onMounted(async () => {
  if (safraStore.selectedSafraId) {
    store.atualizarFiltros({ idSafra: safraStore.selectedSafraId })
  }
  await store.buscarConfiguracao()
  await store.buscarConsolidado()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-lime-100 rounded-lg">
            <DollarSign class="h-6 w-6 text-lime-600" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Fluxo de Caixa</h1>
            <p class="text-gray-500 text-sm mt-0.5">
              Acompanhe entradas, saídas e projeções financeiras
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Export buttons -->
          <button
            @click="handleExportarExcel"
            class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <FileSpreadsheet class="h-4 w-4" />
            Excel
          </button>
          <button
            @click="handleExportarPDF"
            class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <FileText class="h-4 w-4" />
            PDF
          </button>

          <!-- Simulation buttons -->
          <button
            @click="handleSimularCenario"
            class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-lime-600 rounded-lg hover:bg-lime-700 transition-colors shadow-sm"
          >
            <FlaskConical class="h-4 w-4" />
            Simular Cenário
          </button>
          <button
            @click="handleAbrirPanel"
            class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-lime-700 bg-lime-50 border border-lime-200 rounded-lg hover:bg-lime-100 transition-colors"
          >
            <List class="h-4 w-4" />
            Simulações Salvas
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <FluxoCaixaFiltros
        :filtros="filtros"
        :loading="carregandoConsolidado"
        @update:filtros="store.atualizarFiltros"
        @atualizar="store.buscarConsolidado()"
      />

      <!-- Alertas -->
      <FluxoCaixaAlertasBanner v-if="temAlertas" :alertas="store.alertas" />

      <!-- Resumo Cards -->
      <FluxoCaixaResumoCards
        :saldo-inicial="store.saldoInicial"
        :total-entradas="store.totalEntradas"
        :total-saidas="store.totalSaidas"
        :saldo-final="store.saldoFinal"
        :total-alertas="store.alertas.length"
      />

      <!-- Tabs -->
      <div class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="tabAtiva = tab.key"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="
            tabAtiva === tab.key
              ? 'bg-lime-600 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          "
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Erro global -->
      <div
        v-if="erroGlobal"
        class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm"
      >
        {{ erroGlobal }}
      </div>

      <!-- Loading -->
      <div v-if="carregandoConsolidado" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
      </div>

      <!-- Conteúdo principal -->
      <template v-else>
        <!-- Gráfico -->
        <FluxoCaixaGrafico ref="graficoRef" :periodos="store.periodos" :periodosComparacao="store.resultadoSimulacaoAtiva?.periodos" />

        <!-- Tabela de Períodos -->
        <FluxoCaixaTabelaPeriodos :periodos="store.periodos" />

        <!-- Saldo por Conta -->
        <FluxoCaixaSaldoContas :saldos="store.saldosPorConta" />
      </template>
    </div>

    <!-- Simulacao Panel -->
    <FluxoCaixaSimulacaoPanel
      :isOpen="panelAberto"
      @close="panelAberto = false"
      @editar="handleEditarSimulacao"
    />

    <!-- Simulacao Modal -->
    <FluxoCaixaSimulacaoModal
      :isOpen="modalSimulacaoAberto"
      :initialData="simulacaoEmEdicao"
      :loading="carregandoSimulacoes"
      @close="store.fecharModalSimulacao()"
      @save="store.fecharModalSimulacao(); store.listarSimulacoes()"
    />
  </div>
</template>
