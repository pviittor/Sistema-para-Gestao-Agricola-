<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Pencil } from 'lucide-vue-next'
import type { OrdemServico } from '@/types/OrdemServico'
import { StatusOrdemServico } from '@/types/OrdemServico'
import CamposCondicionaisRenderer from '@/components/CamposCondicionaisRenderer.vue'
import OrdemServicoWorkflow from '@/components/OrdemServicoWorkflow.vue'
import VarianciaIndicador from '@/components/VarianciaIndicador.vue'

const props = defineProps<{
  ordemServico: OrdemServico
  loading: boolean
}>()

const emit = defineEmits<{
  statusChange: [payload: { action: string; payload: any }]
  edit: []
  close: []
}>()

const activeTab = ref(0)
const tabs = computed(() => {
  const base = ['Resumo', 'Talhoes', 'Insumos', 'Maquinas', 'Equipe']
  if (showVariancia.value) {
    base.push('Variancia')
  }
  return base
})

const statusLabels: Record<string, string> = {
  PLANEJADA: 'Planejada',
  ATRIBUIDA: 'Atribuida',
  EM_EXECUCAO: 'Em Execucao',
  CONCLUIDA: 'Concluida',
  VALIDADA: 'Validada',
  CANCELADA: 'Cancelada',
}

const statusColors: Record<string, string> = {
  PLANEJADA: 'bg-gray-100 text-gray-700',
  ATRIBUIDA: 'bg-blue-100 text-blue-700',
  EM_EXECUCAO: 'bg-amber-100 text-amber-700',
  CONCLUIDA: 'bg-green-100 text-green-700',
  VALIDADA: 'bg-emerald-100 text-emerald-700',
  CANCELADA: 'bg-red-100 text-red-700',
}

const prioridadeLabels: Record<string, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Media',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
}

const prioridadeColors: Record<string, string> = {
  BAIXA: 'bg-gray-100 text-gray-700',
  MEDIA: 'bg-blue-100 text-blue-700',
  ALTA: 'bg-amber-100 text-amber-700',
  URGENTE: 'bg-red-100 text-red-700',
}

const funcaoLabels: Record<string, string> = {
  RESPONSAVEL: 'Responsavel',
  OPERADOR: 'Operador',
  AUXILIAR: 'Auxiliar',
  FISCAL: 'Fiscal',
}

const canEdit = computed(() => {
  return [StatusOrdemServico.PLANEJADA, StatusOrdemServico.ATRIBUIDA].includes(props.ordemServico.status)
})

const showVariancia = computed(() => {
  return [StatusOrdemServico.CONCLUIDA, StatusOrdemServico.VALIDADA].includes(props.ordemServico.status)
})

// Variancia tab index (T11.2)
const varianciaTabIndex = computed(() => tabs.value.indexOf('Variancia'))

// Calculos para tab Variancia (T11.2)
const areaPlanejadaTotal = computed(() => {
  if (!props.ordemServico.talhoes?.length) return props.ordemServico.areaPlanejadaTotal
  return props.ordemServico.talhoes.reduce((sum, t) => sum + (t.areaPlanejada || 0), 0)
})

const areaRealTotal = computed(() => {
  if (!props.ordemServico.talhoes?.length) return props.ordemServico.areaRealTotal
  return props.ordemServico.talhoes.reduce((sum, t) => sum + (t.areaReal || 0), 0)
})

const prazoPlanejado = computed(() => {
  if (!props.ordemServico.dataPlanejadaInicio || !props.ordemServico.dataPlanejadaFim) return null
  const inicio = new Date(props.ordemServico.dataPlanejadaInicio)
  const fim = new Date(props.ordemServico.dataPlanejadaFim)
  return Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
})

const prazoReal = computed(() => {
  if (!props.ordemServico.dataInicioReal || !props.ordemServico.dataFimReal) return null
  const inicio = new Date(props.ordemServico.dataInicioReal)
  const fim = new Date(props.ordemServico.dataFimReal)
  return Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
})

// Variancia por insumo (T11.2)
const insumosVariancia = computed(() => {
  if (!props.ordemServico.insumos?.length) return []
  return props.ordemServico.insumos.map(ins => {
    const varPercent = ins.quantidadePlanejada && ins.quantidadeReal
      ? ((ins.quantidadeReal - ins.quantidadePlanejada) / ins.quantidadePlanejada * 100)
      : null
    return {
      nome: ins.produto?.descricao || String(ins.produtoId),
      planejado: ins.quantidadePlanejada,
      real: ins.quantidadeReal,
      variancia: varPercent,
    }
  })
})

// Variancia por maquina (T11.2)
const maquinasVariancia = computed(() => {
  if (!props.ordemServico.maquinas?.length) return []
  return props.ordemServico.maquinas.map(maq => {
    const varPercent = maq.horasPlanejadas && maq.horasReais
      ? ((maq.horasReais - maq.horasPlanejadas) / maq.horasPlanejadas * 100)
      : null
    return {
      nome: maq.maquina?.descricao || String(maq.maquinaId),
      planejado: maq.horasPlanejadas,
      real: maq.horasReais,
      variancia: varPercent,
    }
  })
})

// Variancia por equipe (T11.2)
const equipeVariancia = computed(() => {
  if (!props.ordemServico.responsaveis?.length) return []
  return props.ordemServico.responsaveis.map(resp => {
    const varPercent = resp.horasPlanejadas && resp.horasReais
      ? ((resp.horasReais - resp.horasPlanejadas) / resp.horasPlanejadas * 100)
      : null
    return {
      nome: resp.pessoa?.nomerazao_pessoa || String(resp.pessoaId),
      planejado: resp.horasPlanejadas,
      real: resp.horasReais,
      variancia: varPercent,
    }
  })
})

// Totais para tabelas de variancia
const totalRow = (items: { planejado: number | null; real: number | null; variancia: number | null }[]) => {
  const totalPlan = items.reduce((s, i) => s + (i.planejado || 0), 0)
  const totalReal = items.reduce((s, i) => s + (i.real || 0), 0)
  const varPercent = totalPlan > 0 ? ((totalReal - totalPlan) / totalPlan * 100) : null
  return { totalPlan, totalReal, varPercent }
}

const formatCurrency = (v: number | null) => {
  if (v == null) return '-'
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (d: string | null) => {
  if (!d) return '-'
  const date = new Date(d)
  return date.toLocaleDateString('pt-BR')
}

const formatNumber = (v: number | null) => {
  if (v == null) return '-'
  return v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

function varianciaClass(value: number | null, thresholds: [number, number] = [10, 20]) {
  if (value == null) return 'text-gray-400'
  const abs = Math.abs(value)
  if (abs < thresholds[0]) return 'text-green-600'
  if (abs < thresholds[1]) return 'text-amber-600'
  return 'text-red-600'
}

function varianciaDiasClass(value: number | null) {
  if (value == null) return 'text-gray-400'
  if (value <= 0) return 'text-green-600'
  if (value <= 3) return 'text-amber-600'
  return 'text-red-600'
}

const camposCondicionaisList = computed(() => {
  if (!props.ordemServico.tipoAtividade) return []
  // Campos condicionais vem do tipo de atividade associado, se disponivel
  return []
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-full sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h2 class="text-xl font-bold text-gray-900">
              OS #{{ String(ordemServico.numero).padStart(4, '0') }}
            </h2>
            <span
              class="px-2.5 py-1 text-xs font-medium rounded-full"
              :class="statusColors[ordemServico.status]"
            >
              {{ statusLabels[ordemServico.status] }}
            </span>
            <span
              class="px-2.5 py-1 text-xs font-medium rounded-full"
              :class="prioridadeColors[ordemServico.prioridade]"
            >
              {{ prioridadeLabels[ordemServico.prioridade] }}
            </span>
          </div>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <X class="h-6 w-6" />
          </button>
        </div>
        <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span v-if="ordemServico.tipoAtividade" class="flex items-center gap-1">
            <span
              v-if="ordemServico.tipoAtividade.cor"
              class="inline-block w-3 h-3 rounded-full"
              :style="{ backgroundColor: ordemServico.tipoAtividade.cor }"
            ></span>
            {{ ordemServico.tipoAtividade.nome }}
          </span>
          <span v-if="ordemServico.fazenda">{{ ordemServico.fazenda.nome }}</span>
          <span v-if="ordemServico.safra">{{ ordemServico.safra.nome }}</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 px-6">
        <button
          v-for="(tab, i) in tabs"
          :key="tab"
          @click="activeTab = i"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px"
          :class="activeTab === i ? 'border-lime-600 text-lime-700' : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
        <!-- Tab Resumo -->
        <div v-show="activeTab === 0" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Descricao</p>
              <p class="text-sm text-gray-900 mt-1">{{ ordemServico.descricao || '-' }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Observacoes</p>
              <p class="text-sm text-gray-900 mt-1">{{ ordemServico.observacoes || '-' }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Data Plan. Inicio</p>
              <p class="text-sm text-gray-900 mt-1">{{ formatDate(ordemServico.dataPlanejadaInicio) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Data Plan. Fim</p>
              <p class="text-sm text-gray-900 mt-1">{{ formatDate(ordemServico.dataPlanejadaFim) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Data Inicio Real</p>
              <p class="text-sm text-gray-900 mt-1">{{ formatDate(ordemServico.dataInicioReal) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Data Fim Real</p>
              <p class="text-sm text-gray-900 mt-1">{{ formatDate(ordemServico.dataFimReal) }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Area Planejada</p>
              <p class="text-sm text-gray-900 mt-1">{{ formatNumber(ordemServico.areaPlanejadaTotal) }} ha</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Area Real</p>
              <p class="text-sm text-gray-900 mt-1">{{ formatNumber(ordemServico.areaRealTotal) }} ha</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Custo Estimado</p>
              <p class="text-sm text-gray-900 mt-1">{{ formatCurrency(ordemServico.custoEstimado) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Custo Real</p>
              <p class="text-sm text-gray-900 mt-1">{{ formatCurrency(ordemServico.custoReal) }}</p>
            </div>
          </div>

          <!-- Campos condicionais readonly -->
          <CamposCondicionaisRenderer
            v-if="ordemServico.camposCondicionais && Object.keys(ordemServico.camposCondicionais).length > 0"
            :campos="camposCondicionaisList"
            :valores="ordemServico.camposCondicionais"
            :disabled="true"
          />

          <!-- Indicadores de Variancia no Resumo (T10.5) -->
          <div v-if="showVariancia" class="border border-gray-200 rounded-lg p-4">
            <h4 class="text-sm font-bold text-gray-700 mb-3">Indicadores de Variancia</h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <VarianciaIndicador
                label="Area"
                :planejado="areaPlanejadaTotal"
                :real="areaRealTotal"
                :variancia="ordemServico.varianciaAreaPercent"
                unidade="ha"
                tipo="percentual"
              />
              <VarianciaIndicador
                label="Custo"
                :planejado="ordemServico.custoEstimado"
                :real="ordemServico.custoReal"
                :variancia="ordemServico.varianciaCustoPercent"
                unidade="R$"
                tipo="valor"
              />
              <VarianciaIndicador
                label="Prazo"
                :planejado="prazoPlanejado"
                :real="prazoReal"
                :variancia="ordemServico.varianciaDias"
                unidade="dias"
                tipo="dias"
              />
            </div>
          </div>

          <!-- Observacoes de conclusao / motivo cancelamento -->
          <div v-if="ordemServico.observacoesConclusao" class="border-l-4 border-green-400 pl-4">
            <p class="text-xs font-medium text-gray-500 uppercase">Observacoes de Conclusao</p>
            <p class="text-sm text-gray-900 mt-1">{{ ordemServico.observacoesConclusao }}</p>
          </div>
          <div v-if="ordemServico.motivoCancelamento" class="border-l-4 border-red-400 pl-4">
            <p class="text-xs font-medium text-gray-500 uppercase">Motivo do Cancelamento</p>
            <p class="text-sm text-gray-900 mt-1">{{ ordemServico.motivoCancelamento }}</p>
          </div>
        </div>

        <!-- Tab Talhoes -->
        <div v-show="activeTab === 1" class="overflow-x-auto">
          <div v-if="!ordemServico.talhoes?.length" class="text-sm text-gray-400 text-center py-8">Nenhum talhao vinculado.</div>
          <table v-else class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Talhao</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Area Plan. (ha)</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Area Real (ha)</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Observacoes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="t in ordemServico.talhoes" :key="t.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">{{ t.talhao?.descricao || t.talhaoId }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 text-right">{{ formatNumber(t.areaPlanejada) }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 text-right">{{ formatNumber(t.areaReal) }}</td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ t.observacoes || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tab Insumos -->
        <div v-show="activeTab === 2" class="overflow-x-auto">
          <div v-if="!ordemServico.insumos?.length" class="text-sm text-gray-400 text-center py-8">Nenhum insumo vinculado.</div>
          <table v-else class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Produto</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Qtd Plan.</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Qtd Real</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Custo Unit. Plan.</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Custo Unit. Real</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="ins in ordemServico.insumos" :key="ins.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">{{ ins.produto?.descricao || ins.produtoId }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 text-right">{{ formatNumber(ins.quantidadePlanejada) }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 text-right">{{ formatNumber(ins.quantidadeReal) }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 text-right">{{ formatCurrency(ins.custoUnitarioPlanejado) }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 text-right">{{ formatCurrency(ins.custoUnitarioReal) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tab Maquinas -->
        <div v-show="activeTab === 3" class="overflow-x-auto">
          <div v-if="!ordemServico.maquinas?.length" class="text-sm text-gray-400 text-center py-8">Nenhuma maquina vinculada.</div>
          <table v-else class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Maquina</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Implemento</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Operador</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Horas Plan.</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Horas Reais</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="maq in ordemServico.maquinas" :key="maq.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">{{ maq.maquina?.descricao || maq.maquinaId }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ maq.implemento?.descricao || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ maq.operador?.nomerazao_pessoa || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 text-right">{{ formatNumber(maq.horasPlanejadas) }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 text-right">{{ formatNumber(maq.horasReais) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tab Equipe -->
        <div v-show="activeTab === 4" class="overflow-x-auto">
          <div v-if="!ordemServico.responsaveis?.length" class="text-sm text-gray-400 text-center py-8">Nenhum membro vinculado.</div>
          <table v-else class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Pessoa</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Funcao</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Horas Plan.</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Horas Reais</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Custo/Hora</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="resp in ordemServico.responsaveis" :key="resp.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">{{ resp.pessoa?.nomerazao_pessoa || resp.pessoaId }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ funcaoLabels[resp.funcao] || resp.funcao }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 text-right">{{ formatNumber(resp.horasPlanejadas) }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 text-right">{{ formatNumber(resp.horasReais) }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 text-right">{{ formatCurrency(resp.custoHoraPlanejado) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tab Variancia (T11.2) - Planned vs Actual -->
        <div v-if="showVariancia" v-show="activeTab === varianciaTabIndex" class="space-y-6">
          <!-- Indicadores grandes -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <VarianciaIndicador
              label="Area"
              :planejado="areaPlanejadaTotal"
              :real="areaRealTotal"
              :variancia="ordemServico.varianciaAreaPercent"
              unidade="ha"
              tipo="percentual"
            />
            <VarianciaIndicador
              label="Custo"
              :planejado="ordemServico.custoEstimado"
              :real="ordemServico.custoReal"
              :variancia="ordemServico.varianciaCustoPercent"
              unidade="R$"
              tipo="valor"
            />
            <VarianciaIndicador
              label="Prazo"
              :planejado="prazoPlanejado"
              :real="prazoReal"
              :variancia="ordemServico.varianciaDias"
              unidade="dias"
              tipo="dias"
            />
          </div>

          <!-- Tabela comparativa: Insumos -->
          <div v-if="insumosVariancia.length > 0">
            <h4 class="text-sm font-bold text-gray-700 mb-2">Insumos</h4>
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Produto</th>
                  <th class="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Qtd Plan.</th>
                  <th class="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Qtd Real</th>
                  <th class="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Variancia</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(item, idx) in insumosVariancia" :key="idx" class="hover:bg-gray-50">
                  <td class="px-4 py-2 text-sm text-gray-900">{{ item.nome }}</td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">{{ formatNumber(item.planejado) }}</td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">{{ formatNumber(item.real) }}</td>
                  <td class="px-4 py-2 text-sm text-right font-medium" :class="varianciaClass(item.variancia)">
                    {{ item.variancia != null ? item.variancia.toFixed(1) + '%' : '-' }}
                  </td>
                </tr>
                <!-- Total -->
                <tr class="bg-gray-50 font-bold">
                  <td class="px-4 py-2 text-sm text-gray-900">Total</td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">{{ formatNumber(totalRow(insumosVariancia).totalPlan) }}</td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">{{ formatNumber(totalRow(insumosVariancia).totalReal) }}</td>
                  <td class="px-4 py-2 text-sm text-right" :class="varianciaClass(totalRow(insumosVariancia).varPercent)">
                    {{ totalRow(insumosVariancia).varPercent != null ? totalRow(insumosVariancia).varPercent!.toFixed(1) + '%' : '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tabela comparativa: Maquinas -->
          <div v-if="maquinasVariancia.length > 0">
            <h4 class="text-sm font-bold text-gray-700 mb-2">Maquinas</h4>
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Maquina</th>
                  <th class="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Horas Plan.</th>
                  <th class="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Horas Real</th>
                  <th class="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Variancia</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(item, idx) in maquinasVariancia" :key="idx" class="hover:bg-gray-50">
                  <td class="px-4 py-2 text-sm text-gray-900">{{ item.nome }}</td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">{{ formatNumber(item.planejado) }}</td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">{{ formatNumber(item.real) }}</td>
                  <td class="px-4 py-2 text-sm text-right font-medium" :class="varianciaClass(item.variancia)">
                    {{ item.variancia != null ? item.variancia.toFixed(1) + '%' : '-' }}
                  </td>
                </tr>
                <tr class="bg-gray-50 font-bold">
                  <td class="px-4 py-2 text-sm text-gray-900">Total</td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">{{ formatNumber(totalRow(maquinasVariancia).totalPlan) }}</td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">{{ formatNumber(totalRow(maquinasVariancia).totalReal) }}</td>
                  <td class="px-4 py-2 text-sm text-right" :class="varianciaClass(totalRow(maquinasVariancia).varPercent)">
                    {{ totalRow(maquinasVariancia).varPercent != null ? totalRow(maquinasVariancia).varPercent!.toFixed(1) + '%' : '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tabela comparativa: Equipe -->
          <div v-if="equipeVariancia.length > 0">
            <h4 class="text-sm font-bold text-gray-700 mb-2">Equipe</h4>
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Pessoa</th>
                  <th class="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Horas Plan.</th>
                  <th class="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Horas Real</th>
                  <th class="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Variancia</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(item, idx) in equipeVariancia" :key="idx" class="hover:bg-gray-50">
                  <td class="px-4 py-2 text-sm text-gray-900">{{ item.nome }}</td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">{{ formatNumber(item.planejado) }}</td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">{{ formatNumber(item.real) }}</td>
                  <td class="px-4 py-2 text-sm text-right font-medium" :class="varianciaClass(item.variancia)">
                    {{ item.variancia != null ? item.variancia.toFixed(1) + '%' : '-' }}
                  </td>
                </tr>
                <tr class="bg-gray-50 font-bold">
                  <td class="px-4 py-2 text-sm text-gray-900">Total</td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">{{ formatNumber(totalRow(equipeVariancia).totalPlan) }}</td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">{{ formatNumber(totalRow(equipeVariancia).totalReal) }}</td>
                  <td class="px-4 py-2 text-sm text-right" :class="varianciaClass(totalRow(equipeVariancia).varPercent)">
                    {{ totalRow(equipeVariancia).varPercent != null ? totalRow(equipeVariancia).varPercent!.toFixed(1) + '%' : '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Footer with workflow + edit -->
      <div class="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
        <OrdemServicoWorkflow
          :ordem-servico="ordemServico"
          :loading="loading"
          @status-change="$emit('statusChange', $event)"
        />
        <div class="flex justify-end gap-3">
          <button
            v-if="canEdit"
            @click="$emit('edit')"
            class="inline-flex items-center px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Pencil class="h-4 w-4 mr-2" />
            Editar
          </button>
          <button @click="$emit('close')" class="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
</style>
