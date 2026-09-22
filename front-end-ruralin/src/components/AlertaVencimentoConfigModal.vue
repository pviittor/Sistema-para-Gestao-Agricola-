<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Bell, X } from 'lucide-vue-next'
import type { AlertaVencimentoConfig } from '@/types/RecorrenciaFinanceira'

const props = defineProps<{
  isOpen: boolean
  initialData?: AlertaVencimentoConfig | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: Partial<AlertaVencimentoConfig>): void
}>()

const isEditing = computed(() => !!props.initialData?.id)

const defaultFormData = (): Partial<AlertaVencimentoConfig> => ({
  tipoTitulo: 'AMBOS',
  antecedenciaAlerta1Dias: 7,
  antecedenciaAlerta2Dias: 3,
  antecedenciaAlerta3Dias: 1,
  notificarNoVencimento: true,
  notificarVencidos: true,
  frequenciaRenotificacaoVencidosDias: 3,
  ativo: true,
})

const formData = ref<Partial<AlertaVencimentoConfig>>(defaultFormData())

watch(() => props.isOpen, (open) => {
  if (open) {
    formData.value = props.initialData ? { ...props.initialData } : defaultFormData()
  }
})

const handleSubmit = () => {
  emit('save', { ...formData.value })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-amber-50 rounded-xl">
              <Bell class="w-5 h-5 text-amber-600" />
            </div>
            <h2 class="text-xl font-bold text-gray-900">
              {{ isEditing ? 'Editar Alerta' : 'Configurar Alertas de Vencimento' }}
            </h2>
          </div>
          <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-lg">
            <X class="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Tipo de Titulo*</label>
            <select
              v-model="formData.tipoTitulo"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
            >
              <option value="PAGAR">A Pagar</option>
              <option value="RECEBER">A Receber</option>
              <option value="AMBOS">Ambos</option>
            </select>
          </div>

          <div class="space-y-3">
            <label class="block text-sm font-bold text-gray-700">Alertar com antecedencia de:</label>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1">1o Alerta (dias)</label>
                <input
                  v-model.number="formData.antecedenciaAlerta1Dias"
                  type="number"
                  min="0"
                  max="90"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 text-center"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">2o Alerta (dias)</label>
                <input
                  v-model.number="formData.antecedenciaAlerta2Dias"
                  type="number"
                  min="0"
                  max="90"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 text-center"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">3o Alerta (dias)</label>
                <input
                  v-model.number="formData.antecedenciaAlerta3Dias"
                  type="number"
                  min="0"
                  max="90"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 text-center"
                />
              </div>
            </div>
            <p class="text-xs text-gray-400">Use 0 para desabilitar o alerta</p>
          </div>

          <div class="space-y-3">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="formData.notificarNoVencimento"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
              />
              <span class="text-sm text-gray-700">Alertar no dia do vencimento</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="formData.notificarVencidos"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
              />
              <span class="text-sm text-gray-700">Alertar para titulos vencidos</span>
            </label>

            <div v-if="formData.notificarVencidos" class="ml-7">
              <label class="block text-xs text-gray-500 mb-1">Renotificar a cada (dias)</label>
              <input
                v-model.number="formData.frequenciaRenotificacaoVencidosDias"
                type="number"
                min="1"
                max="30"
                class="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 text-center"
              />
            </div>
          </div>

          <label class="flex items-center gap-3 cursor-pointer pt-2 border-t border-gray-100">
            <input
              v-model="formData.ativo"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
            />
            <span class="text-sm font-medium text-gray-700">Alertas ativos</span>
          </label>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            @click="$emit('close')"
            class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="handleSubmit"
            :disabled="loading"
            class="px-6 py-2.5 text-sm font-medium text-white bg-lime-600 rounded-lg hover:bg-lime-700 disabled:opacity-50 inline-flex items-center gap-2"
          >
            <span v-if="loading" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
