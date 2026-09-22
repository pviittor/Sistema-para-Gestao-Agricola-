<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { toast } from 'vue3-toastify'
import {
  BarChart3, Download, Filter, ChevronDown, ChevronUp,
  DollarSign, AlertTriangle, Clock,
} from 'lucide-vue-next'
import type { AgingReport, AgingFaixa, AgingFiltros } from '@/types/Aging'
import { agingService } from '@/services/agingService'
import { useSafraStore } from '@/stores/safra'

const safraStore = useSafraStore()

// State
const report = ref<AgingReport | null>(null)
const isLoading = ref(false)
const activeTab = ref<'PAGAR' | 'RECEBER'>('PAGAR')
const expandedFaixa = ref<string | null>(null)
const showFilters = ref(false)

// Filtros
const filtros = ref<AgingFiltros>({
  tipo: 'PAGAR',
  idFazenda: undefined,
  idSafra: undefined,
  idFornecedorCliente: undefined,
  idPlanoContaGerencial: undefined,
})

const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)

const formatDate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '-'
  const parts = dateStr.split('T')[0]!.split('-')
  return parts.length >= 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr
}

const getFaixaColor = (label: string) => {
  const l = label.toLowerCase()
  if (l.includes('vencido') || l.includes('atraso')) return 'bg-red-100 text-red-700 border-red-200'
  if (l.includes('hoje')) return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-green-100 text-green-700 border-green-200'
}

const getFaixaBarColor = (label: string) => {
  const l = label.toLowerCase()
  if (l.includes('vencido') || l.includes('atraso')) return 'bg-red-500'
  if (l.includes('hoje')) return 'bg-amber-500'
  return 'bg-green-500'
}

const maxValorSaldo = computed(() => {
  if (!report.value) return 1
  return Math.max(...report.value.faixas.map(f => f.valorSaldo), 1)
})

const fetchAging = async () => {
  isLoading.value = true
  try {
    filtros.value.tipo = activeTab.value
    const result = await agingService.getAging(filtros.value)
    report.value = (result as any).data ?? result
  } catch {
    toast.error('Erro ao carregar relatorio de aging')
  } finally {
    isLoading.value = false
  }
}

const handleExport = async (format: 'pdf' | 'xlsx') => {
  try {
    const blob = await agingService.exportAging({ ...filtros.value, format })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aging_${activeTab.value.toLowerCase()}_${new Date().toISOString().split('T')[0]}.${format}`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Exportacao realizada!')
  } catch {
    toast.error('Erro ao exportar relatorio')
  }
}

const toggleFaixa = (label: string) => {
  expandedFaixa.value = expandedFaixa.value === label ? null : label
}

const switchTab = (tab: 'PAGAR' | 'RECEBER') => {
  activeTab.value = tab
  fetchAging()
}

watch(
  () => safraStore.selectedSafraId,
  (newId) => {
    filtros.value.idSafra = newId ?? undefined
    fetchAging()
  },
)

onMounted(() => {
  if (safraStore.selectedSafraId) {
    filtros.value.idSafra = safraStore.selectedSafraId
  }
  fetchAging()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Relatorio de Aging</h1>
          <p class="text-gray-500 mt-1">Analise de vencimentos por faixa de dias</p>
        </div>
        <div class="flex gap-2">
          <button
            @click="showFilters = !showFilters"
            class="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Filter class="h-4 w-4 mr-2" />
            Filtros
          </button>
          <button
            @click="handleExport('xlsx')"
            class="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Download class="h-4 w-4 mr-2" />
            Excel
          </button>
          <button
            @click="handleExport('pdf')"
            class="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Download class="h-4 w-4 mr-2" />
            PDF
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          @click="switchTab('PAGAR')"
          :class="[
            'px-6 py-2 rounded-md text-sm font-medium transition-all',
            activeTab === 'PAGAR'
              ? 'bg-white shadow text-gray-900'
              : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          A Pagar
        </button>
        <button
          @click="switchTab('RECEBER')"
          :class="[
            'px-6 py-2 rounded-md text-sm font-medium transition-all',
            activeTab === 'RECEBER'
              ? 'bg-white shadow text-gray-900'
              : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          A Receber
        </button>
      </div>

      <!-- Totais -->
      <div v-if="report" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-blue-50 rounded-xl"><DollarSign class="w-5 h-5 text-blue-600" /></div>
            <div>
              <p class="text-xs text-gray-500 font-medium">Total Geral</p>
              <p class="text-lg font-bold text-gray-900">{{ formatCurrency(report.totalGeral.valorSaldo) }}</p>
              <p class="text-xs text-gray-400">{{ report.totalGeral.count }} parcelas</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-red-50 rounded-xl"><AlertTriangle class="w-5 h-5 text-red-600" /></div>
            <div>
              <p class="text-xs text-gray-500 font-medium">Total Vencido</p>
              <p class="text-lg font-bold text-red-600">
                {{ formatCurrency(report.faixas.filter(f => f.label.toLowerCase().includes('vencido') || f.label.toLowerCase().includes('atraso')).reduce((s, f) => s + f.valorSaldo, 0)) }}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-green-50 rounded-xl"><Clock class="w-5 h-5 text-green-600" /></div>
            <div>
              <p class="text-xs text-gray-500 font-medium">Total a Vencer</p>
              <p class="text-lg font-bold text-green-600">
                {{ formatCurrency(report.faixas.filter(f => f.label.toLowerCase().includes('vencer')).reduce((s, f) => s + f.valorSaldo, 0)) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
        Carregando relatorio...
      </div>

      <!-- Aging Table -->
      <div v-else-if="report" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center gap-2">
            <BarChart3 class="w-5 h-5 text-gray-400" />
            <h2 class="text-lg font-bold text-gray-900">Faixas de Aging</h2>
            <span class="text-xs text-gray-400 ml-2">Referencia: {{ formatDate(report.dataReferencia) }}</span>
          </div>
        </div>

        <div class="divide-y divide-gray-100">
          <div v-for="faixa in report.faixas" :key="faixa.label">
            <!-- Faixa Row -->
            <div
              class="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              @click="toggleFaixa(faixa.label)"
            >
              <div class="w-6">
                <component :is="expandedFaixa === faixa.label ? ChevronUp : ChevronDown" class="w-4 h-4 text-gray-400" />
              </div>
              <div class="flex-1">
                <span :class="['px-3 py-1 rounded-full text-xs font-medium', getFaixaColor(faixa.label)]">
                  {{ faixa.label }}
                </span>
              </div>
              <div class="text-sm text-gray-500 w-20 text-center">{{ faixa.count }} parc.</div>
              <div class="text-sm font-medium text-gray-900 w-36 text-right">{{ formatCurrency(faixa.valorSaldo) }}</div>
              <div class="w-48">
                <div class="w-full bg-gray-100 rounded-full h-2">
                  <div
                    :class="['h-2 rounded-full transition-all', getFaixaBarColor(faixa.label)]"
                    :style="{ width: `${(faixa.valorSaldo / maxValorSaldo) * 100}%` }"
                  />
                </div>
              </div>
            </div>

            <!-- Drill-down -->
            <div v-if="expandedFaixa === faixa.label && faixa.parcelas.length > 0" class="bg-gray-50 px-6 py-4">
              <table class="w-full">
                <thead>
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-bold text-gray-500">Titulo</th>
                    <th class="px-3 py-2 text-left text-xs font-bold text-gray-500">{{ activeTab === 'PAGAR' ? 'Fornecedor' : 'Cliente' }}</th>
                    <th class="px-3 py-2 text-left text-xs font-bold text-gray-500">Parcela</th>
                    <th class="px-3 py-2 text-left text-xs font-bold text-gray-500">Vencimento</th>
                    <th class="px-3 py-2 text-right text-xs font-bold text-gray-500">Valor</th>
                    <th class="px-3 py-2 text-right text-xs font-bold text-gray-500">Saldo</th>
                    <th class="px-3 py-2 text-center text-xs font-bold text-gray-500">Dias</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="p in faixa.parcelas" :key="p.id" class="hover:bg-white">
                    <td class="px-3 py-2 text-sm text-gray-900">{{ p.numeroTitulo }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700">{{ p.fornecedorCliente }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700">{{ p.numeroParcela }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700">{{ formatDate(p.dataVencimento) }}</td>
                    <td class="px-3 py-2 text-sm text-right">{{ formatCurrency(p.valorTotal) }}</td>
                    <td class="px-3 py-2 text-sm text-right font-medium">{{ formatCurrency(p.valorSaldo) }}</td>
                    <td class="px-3 py-2 text-sm text-center">
                      <span :class="[
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        p.diasAtraso > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      ]">
                        {{ p.diasAtraso > 0 ? `${p.diasAtraso}d` : `${Math.abs(p.diasAtraso)}d` }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
