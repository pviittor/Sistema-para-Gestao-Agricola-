<script setup lang="ts">
import { ref, watch } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import type { FluxoCaixaFiltros, FluxoCaixaPeriodicidade } from '@/types/FluxoCaixa'
import { PERIODICIDADE_LABELS } from '@/types/FluxoCaixa'

const props = defineProps<{
  filtros: FluxoCaixaFiltros
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:filtros': [filtros: Partial<FluxoCaixaFiltros>]
  'atualizar': []
}>()

const periodicidades: FluxoCaixaPeriodicidade[] = ['diario', 'semanal', 'mensal', 'safra']

const dataInicio = ref(props.filtros.dataInicio)
const dataFim = ref(props.filtros.dataFim)
const periodicidade = ref(props.filtros.periodicidade)

watch(() => props.filtros, (novo) => {
  dataInicio.value = novo.dataInicio
  dataFim.value = novo.dataFim
  periodicidade.value = novo.periodicidade
}, { deep: true })

function onDataInicioChange(e: Event) {
  const val = (e.target as HTMLInputElement).value
  dataInicio.value = val
  emit('update:filtros', { dataInicio: val })
}

function onDataFimChange(e: Event) {
  const val = (e.target as HTMLInputElement).value
  dataFim.value = val
  emit('update:filtros', { dataFim: val })
}

function onPeriodicidadeChange(p: FluxoCaixaPeriodicidade) {
  periodicidade.value = p
  emit('update:filtros', { periodicidade: p })
}

function onAtualizar() {
  emit('atualizar')
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
    <div class="flex items-center gap-2">
      <label class="text-sm font-medium text-gray-700">De</label>
      <input
        type="date"
        :value="dataInicio"
        :disabled="loading"
        class="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-lime-600 focus:outline-none focus:ring-1 focus:ring-lime-600 disabled:opacity-50"
        @change="onDataInicioChange"
      />
    </div>

    <div class="flex items-center gap-2">
      <label class="text-sm font-medium text-gray-700">Até</label>
      <input
        type="date"
        :value="dataFim"
        :disabled="loading"
        class="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-lime-600 focus:outline-none focus:ring-1 focus:ring-lime-600 disabled:opacity-50"
        @change="onDataFimChange"
      />
    </div>

    <div class="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
      <button
        v-for="p in periodicidades"
        :key="p"
        :disabled="loading"
        class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
        :class="
          periodicidade === p
            ? 'bg-lime-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-200'
        "
        @click="onPeriodicidadeChange(p)"
      >
        {{ PERIODICIDADE_LABELS[p] }}
      </button>
    </div>

    <button
      :disabled="loading"
      class="ml-auto flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lime-700 disabled:opacity-50"
      @click="onAtualizar"
    >
      <RefreshCw :size="16" :class="{ 'animate-spin': loading }" />
      Atualizar
    </button>
  </div>
</template>
