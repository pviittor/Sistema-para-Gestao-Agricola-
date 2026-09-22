<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Edit3, GitCompare, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue3-toastify'
import { useFluxoCaixaStore } from '@/stores/fluxoCaixa'
import type { FluxoCaixaSimulacaoDto, SimulacaoStatus } from '@/types/FluxoCaixa'
import { SIMULACAO_STATUS_LABELS } from '@/types/FluxoCaixa'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  editar: [simulacao: FluxoCaixaSimulacaoDto]
}>()

const store = useFluxoCaixaStore()

const statusFiltro = ref<SimulacaoStatus | 'todos'>('todos')

const tabs: { key: SimulacaoStatus | 'todos'; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'rascunho', label: 'Rascunho' },
  { key: 'salvo', label: 'Salvo' },
  { key: 'arquivado', label: 'Arquivado' },
]

const simulacoesFiltradas = computed(() => {
  if (statusFiltro.value === 'todos') return store.simulacoes
  return store.simulacoes.filter((s) => s.status === statusFiltro.value)
})

const statusBadgeClasses: Record<SimulacaoStatus, string> = {
  rascunho: 'bg-yellow-100 text-yellow-700',
  salvo: 'bg-green-100 text-green-700',
  arquivado: 'bg-gray-100 text-gray-500',
}

function formatData(dateStr: string): string {
  if (!dateStr) return ''
  const d = dateStr.split('T')[0] ?? dateStr
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function formatDataHora(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleComparar(simulacao: FluxoCaixaSimulacaoDto) {
  try {
    store.ativarModoComparacao(simulacao as any)
    await store.calcularSimulacao(simulacao.id)
    toast.success('Modo comparacao ativado')
    emit('close')
  } catch (err: any) {
    toast.error(err?.response?.data?.error?.message || 'Erro ao calcular simulacao')
  }
}

async function handleExcluir(simulacao: FluxoCaixaSimulacaoDto) {
  if (!confirm(`Deseja excluir a simulacao "${simulacao.nome}"?`)) return
  try {
    await store.deletarSimulacao(simulacao.id)
    toast.success('Simulacao excluida com sucesso')
  } catch (err: any) {
    toast.error(err?.response?.data?.error?.message || 'Erro ao excluir simulacao')
  }
}
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/30 z-40"
        @click="emit('close')"
      />
    </Transition>

    <!-- Panel -->
    <div
      class="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ease-in-out"
      :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Simulacoes Salvas</h2>
        <button
          @click="emit('close')"
          class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Status filter tabs -->
      <div class="flex gap-1 px-5 pt-4 pb-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="statusFiltro = tab.key"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          :class="
            statusFiltro === tab.key
              ? 'bg-lime-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          "
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto px-5 py-3 space-y-3">
        <div
          v-if="simulacoesFiltradas.length === 0"
          class="text-center text-gray-400 text-sm py-12"
        >
          Nenhuma simulacao encontrada
        </div>

        <div
          v-for="sim in simulacoesFiltradas"
          :key="sim.id"
          class="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3"
        >
          <!-- Nome + Status -->
          <div class="flex items-start justify-between gap-2">
            <h3 class="text-sm font-semibold text-gray-900 leading-tight">
              {{ sim.nome }}
            </h3>
            <span
              class="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
              :class="statusBadgeClasses[sim.status]"
            >
              {{ SIMULACAO_STATUS_LABELS[sim.status] }}
            </span>
          </div>

          <!-- Periodo -->
          <p class="text-xs text-gray-500">
            {{ formatData(sim.dataInicio) }} - {{ formatData(sim.dataFim) }}
          </p>

          <!-- Updated at -->
          <p class="text-xs text-gray-400">
            Atualizado em {{ formatDataHora(sim.updatedAt) }}
          </p>

          <!-- Actions -->
          <div class="flex gap-2 pt-1">
            <button
              @click="emit('editar', sim)"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-lime-700 bg-lime-50 border border-lime-200 rounded-lg hover:bg-lime-100 transition-colors"
            >
              <Edit3 class="h-3.5 w-3.5" />
              Editar
            </button>
            <button
              @click="handleComparar(sim)"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <GitCompare class="h-3.5 w-3.5" />
              Comparar
            </button>
            <button
              @click="handleExcluir(sim)"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 class="h-3.5 w-3.5" />
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
