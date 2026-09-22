<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ordemServicoService } from '@/services/ordemServicoService'
import { propriedadeService } from '@/services/propriedadeService'
import { useSafraStore } from '@/stores/safra'
import type {
  ProdutividadeOperador,
  RendimentoMaquina,
  CustoCategoria,
  RankingTalhao,
} from '@/types/OrdemServico'
import GraficoProdutividadeOperador from '@/components/GraficoProdutividadeOperador.vue'
import GraficoRendimentoMaquina from '@/components/GraficoRendimentoMaquina.vue'
import GraficoCustoCategoria from '@/components/GraficoCustoCategoria.vue'
import RankingTalhoes from '@/components/RankingTalhoes.vue'

const safraStore = useSafraStore()

interface FazendaOption {
  id: number
  nome: string
  descricao?: string
}

const fazendas = ref<FazendaOption[]>([])

const filtroFazendaId = ref<number | ''>('')
const filtroDataInicio = ref('')
const filtroDataFim = ref('')

const produtividadeData = ref<ProdutividadeOperador[]>([])
const rendimentoData = ref<RendimentoMaquina[]>([])
const custoData = ref<CustoCategoria[]>([])
const rankingData = ref<RankingTalhao[]>([])

const loadingProdutividade = ref(false)
const loadingRendimento = ref(false)
const loadingCusto = ref(false)
const loadingRanking = ref(false)

function buildFilters() {
  const f: Record<string, any> = {}
  if (safraStore.selectedSafraId) f.safraId = safraStore.selectedSafraId
  if (filtroFazendaId.value) f.fazendaId = filtroFazendaId.value
  if (filtroDataInicio.value) f.dataInicio = filtroDataInicio.value
  if (filtroDataFim.value) f.dataFim = filtroDataFim.value
  return f
}

async function fetchProdutividade() {
  loadingProdutividade.value = true
  try {
    const res = await ordemServicoService.getProdutividadeOperador(buildFilters())
    produtividadeData.value = res.data as ProdutividadeOperador[]
  } catch {
    produtividadeData.value = []
  } finally {
    loadingProdutividade.value = false
  }
}

async function fetchRendimento() {
  loadingRendimento.value = true
  try {
    const res = await ordemServicoService.getRendimentoMaquina(buildFilters())
    rendimentoData.value = res.data as RendimentoMaquina[]
  } catch {
    rendimentoData.value = []
  } finally {
    loadingRendimento.value = false
  }
}

async function fetchCusto() {
  loadingCusto.value = true
  try {
    const res = await ordemServicoService.getCustoCategoria(buildFilters())
    custoData.value = res.data as CustoCategoria[]
  } catch {
    custoData.value = []
  } finally {
    loadingCusto.value = false
  }
}

async function fetchRanking() {
  loadingRanking.value = true
  try {
    const res = await ordemServicoService.getRankingTalhoes(buildFilters())
    rankingData.value = res.data as RankingTalhao[]
  } catch {
    rankingData.value = []
  } finally {
    loadingRanking.value = false
  }
}

function carregarTodos() {
  fetchProdutividade()
  fetchRendimento()
  fetchCusto()
  fetchRanking()
}

async function carregarFiltros() {
  try {
    const fazendaRes = await propriedadeService.getAllNoPagination()
    fazendas.value = ((fazendaRes as any).data || fazendaRes) as FazendaOption[]
  } catch {
    // silent
  }
}

watch(() => safraStore.selectedSafraId, () => {
  carregarTodos()
})

onMounted(async () => {
  await carregarFiltros()
  carregarTodos()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-4xl font-bold text-gray-900">Analytics de Operacoes</h1>
        <p class="text-gray-500 mt-1">Indicadores de desempenho das ordens de servico</p>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Fazenda</label>
            <select
              v-model="filtroFazendaId"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
            >
              <option value="">Todas</option>
              <option v-for="f in fazendas" :key="f.id" :value="f.id">
                {{ f.descricao || f.nome }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Data Inicio</label>
            <input
              v-model="filtroDataInicio"
              type="date"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Data Fim</label>
            <input
              v-model="filtroDataFim"
              type="date"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button
            @click="carregarTodos"
            class="px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      <!-- Grid 2x2 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Produtividade Operador -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <GraficoProdutividadeOperador
            :dados="produtividadeData"
            :loading="loadingProdutividade"
          />
        </div>

        <!-- Rendimento Maquina -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <GraficoRendimentoMaquina
            :dados="rendimentoData"
            :loading="loadingRendimento"
          />
        </div>

        <!-- Custo Categoria -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <GraficoCustoCategoria
            :dados="custoData"
            :loading="loadingCusto"
          />
        </div>

        <!-- Ranking Talhoes -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <RankingTalhoes
            :dados="rankingData"
            :loading="loadingRanking"
          />
        </div>
      </div>
    </div>
  </div>
</template>
