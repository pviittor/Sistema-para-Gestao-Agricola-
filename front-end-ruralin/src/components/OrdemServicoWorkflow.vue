<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ClipboardList,
  UserCheck,
  Play,
  CheckCircle,
  ShieldCheck,
  XCircle,
  X,
} from 'lucide-vue-next'
import type { OrdemServico } from '@/types/OrdemServico'
import { StatusOrdemServico } from '@/types/OrdemServico'

const props = defineProps<{
  ordemServico: OrdemServico
  loading: boolean
}>()

const emit = defineEmits<{
  statusChange: [payload: { action: string; payload: any }]
}>()

const steps = [
  { status: StatusOrdemServico.PLANEJADA, label: 'Planejada', icon: ClipboardList, color: 'gray' },
  { status: StatusOrdemServico.ATRIBUIDA, label: 'Atribuida', icon: UserCheck, color: 'blue' },
  { status: StatusOrdemServico.EM_EXECUCAO, label: 'Em Execucao', icon: Play, color: 'amber' },
  { status: StatusOrdemServico.CONCLUIDA, label: 'Concluida', icon: CheckCircle, color: 'green' },
  { status: StatusOrdemServico.VALIDADA, label: 'Validada', icon: ShieldCheck, color: 'emerald' },
]

const statusOrder: Record<string, number> = {
  PLANEJADA: 0,
  ATRIBUIDA: 1,
  EM_EXECUCAO: 2,
  CONCLUIDA: 3,
  VALIDADA: 4,
}

const currentStepIndex = computed(() => statusOrder[props.ordemServico.status] ?? -1)
const isCancelada = computed(() => props.ordemServico.status === StatusOrdemServico.CANCELADA)

function getStepClass(index: number) {
  if (isCancelada.value) return 'bg-red-100 text-red-600 border-red-300'
  if (index < currentStepIndex.value) return 'bg-green-100 text-green-600 border-green-300'
  if (index === currentStepIndex.value) {
    const s = steps[index]
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-200 text-gray-700 border-gray-400 ring-2 ring-gray-300',
      blue: 'bg-blue-100 text-blue-700 border-blue-400 ring-2 ring-blue-300',
      amber: 'bg-amber-100 text-amber-700 border-amber-400 ring-2 ring-amber-300',
      green: 'bg-green-100 text-green-700 border-green-400 ring-2 ring-green-300',
      emerald: 'bg-emerald-100 text-emerald-700 border-emerald-400 ring-2 ring-emerald-300',
    }
    return (s?.color ? colorMap[s.color] : undefined) || 'bg-gray-100 text-gray-600 border-gray-300'
  }
  return 'bg-gray-50 text-gray-400 border-gray-200'
}

function getLineClass(index: number) {
  if (isCancelada.value) return 'bg-red-300'
  if (index < currentStepIndex.value) return 'bg-green-400'
  return 'bg-gray-200'
}

// Mini-modal state
const showConfirmModal = ref(false)
const confirmAction = ref('')
const confirmTitle = ref('')
const confirmDataInicio = ref(new Date().toISOString().split('T')[0])
const confirmDataFim = ref('')
const confirmObservacoes = ref('')
const confirmMotivo = ref('')

function openConfirm(action: string, title: string) {
  confirmAction.value = action
  confirmTitle.value = title
  confirmDataInicio.value = new Date().toISOString().split('T')[0]
  confirmDataFim.value = ''
  confirmObservacoes.value = ''
  confirmMotivo.value = ''
  showConfirmModal.value = true
}

function closeConfirm() {
  showConfirmModal.value = false
}

function doConfirm() {
  const action = confirmAction.value
  let payload: any = {}

  if (action === 'iniciar') {
    payload = { dataInicioReal: confirmDataInicio.value }
  } else if (action === 'concluir') {
    if (!confirmDataFim.value) return
    payload = { dataFimReal: confirmDataFim.value, observacoesConclusao: confirmObservacoes.value || undefined }
  } else if (action === 'validar') {
    payload = { observacoes: confirmObservacoes.value || undefined }
  } else if (action === 'cancelar') {
    if (!confirmMotivo.value || confirmMotivo.value.length < 10) return
    payload = { motivoCancelamento: confirmMotivo.value }
  }

  emit('statusChange', { action, payload })
  closeConfirm()
}

const motivoError = computed(() => {
  if (confirmAction.value === 'cancelar' && confirmMotivo.value.length > 0 && confirmMotivo.value.length < 10) {
    return 'Minimo 10 caracteres'
  }
  return ''
})
</script>

<template>
  <div class="space-y-4">
    <!-- Stepper -->
    <div class="flex items-center justify-between gap-1">
      <template v-for="(step, index) in steps" :key="step.status">
        <div class="flex flex-col items-center gap-1">
          <div
            class="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all"
            :class="getStepClass(index)"
          >
            <component :is="step.icon" class="h-5 w-5" />
          </div>
          <span class="text-xs font-medium text-gray-600 whitespace-nowrap">{{ step.label }}</span>
        </div>
        <div
          v-if="index < steps.length - 1"
          class="flex-1 h-1 rounded-full mb-5"
          :class="getLineClass(index)"
        ></div>
      </template>
    </div>

    <!-- Cancelada badge -->
    <div v-if="isCancelada" class="flex justify-center">
      <span class="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full flex items-center gap-1">
        <XCircle class="h-4 w-4" />
        Cancelada
      </span>
    </div>

    <!-- Action buttons -->
    <div class="flex flex-wrap gap-2 justify-center">
      <!-- PLANEJADA -> Atribuir -->
      <button
        v-if="ordemServico.status === StatusOrdemServico.PLANEJADA"
        @click="openConfirm('atribuir', 'Atribuir Ordem de Servico')"
        :disabled="loading"
        class="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        Atribuir
      </button>

      <!-- ATRIBUIDA -> Iniciar / Reatribuir -->
      <button
        v-if="ordemServico.status === StatusOrdemServico.ATRIBUIDA"
        @click="openConfirm('iniciar', 'Iniciar Execucao')"
        :disabled="loading"
        class="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
      >
        Iniciar Execucao
      </button>

      <!-- EM_EXECUCAO -> Concluir -->
      <button
        v-if="ordemServico.status === StatusOrdemServico.EM_EXECUCAO"
        @click="openConfirm('concluir', 'Concluir Ordem de Servico')"
        :disabled="loading"
        class="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        Concluir
      </button>

      <!-- CONCLUIDA -> Validar -->
      <button
        v-if="ordemServico.status === StatusOrdemServico.CONCLUIDA"
        @click="openConfirm('validar', 'Validar Ordem de Servico')"
        :disabled="loading"
        class="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        Validar
      </button>

      <!-- Cancelar (sempre visivel exceto VALIDADA e CANCELADA) -->
      <button
        v-if="ordemServico.status !== StatusOrdemServico.VALIDADA && ordemServico.status !== StatusOrdemServico.CANCELADA"
        @click="openConfirm('cancelar', 'Cancelar Ordem de Servico')"
        :disabled="loading"
        class="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        Cancelar
      </button>
    </div>

    <!-- Mini-modal de confirmacao -->
    <div v-if="showConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeConfirm"></div>
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-900">{{ confirmTitle }}</h3>
          <button @click="closeConfirm" class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="p-4 space-y-4">
          <!-- Atribuir: sem campos extras -->
          <p v-if="confirmAction === 'atribuir'" class="text-sm text-gray-600">
            Confirma a atribuicao desta ordem de servico?
          </p>

          <!-- Iniciar: data inicio -->
          <div v-if="confirmAction === 'iniciar'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Data de Inicio</label>
            <input
              v-model="confirmDataInicio"
              type="date"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>

          <!-- Concluir: data fim + observacoes -->
          <template v-if="confirmAction === 'concluir'">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data de Conclusao *</label>
              <input
                v-model="confirmDataFim"
                type="date"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
              <textarea
                v-model="confirmObservacoes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 resize-none"
                placeholder="Observacoes sobre a conclusao..."
              ></textarea>
            </div>
          </template>

          <!-- Validar: observacoes -->
          <div v-if="confirmAction === 'validar'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
            <textarea
              v-model="confirmObservacoes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 resize-none"
              placeholder="Observacoes sobre a validacao..."
            ></textarea>
          </div>

          <!-- Cancelar: motivo -->
          <div v-if="confirmAction === 'cancelar'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Motivo do Cancelamento *</label>
            <textarea
              v-model="confirmMotivo"
              rows="3"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 resize-none"
              placeholder="Informe o motivo do cancelamento (min. 10 caracteres)..."
            ></textarea>
            <p v-if="motivoError" class="text-xs text-red-500 mt-1">{{ motivoError }}</p>
          </div>
        </div>

        <div class="p-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            @click="closeConfirm"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="doConfirm"
            :disabled="loading || (confirmAction === 'concluir' && !confirmDataFim) || (confirmAction === 'cancelar' && confirmMotivo.length < 10)"
            class="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
            :class="{
              'bg-blue-600 hover:bg-blue-700': confirmAction === 'atribuir',
              'bg-amber-500 hover:bg-amber-600': confirmAction === 'iniciar',
              'bg-green-600 hover:bg-green-700': confirmAction === 'concluir',
              'bg-emerald-600 hover:bg-emerald-700': confirmAction === 'validar',
              'bg-red-600 hover:bg-red-700': confirmAction === 'cancelar',
            }"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
