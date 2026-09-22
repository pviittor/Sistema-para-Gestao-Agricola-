<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, ShieldAlert, ShieldCheck } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  contingenciaAtiva: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [data: { acao: 'ativar' | 'desativar'; tipo?: string; justificativa?: string }]
}>()

const form = ref({
  tipo: 'SVC-AN' as string,
  justificativa: '',
})

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      form.value = { tipo: 'SVC-AN', justificativa: '' }
    }
  },
)

const handleAtivar = () => {
  if (!form.value.justificativa.trim()) return
  if (!confirm('Confirma a ativação do modo de contingência? Todas as NF-e emitidas seguirão este modo.')) return
  emit('save', {
    acao: 'ativar',
    tipo: form.value.tipo,
    justificativa: form.value.justificativa,
  })
}

const handleDesativar = () => {
  if (!confirm('Confirma a desativação do modo de contingência?')) return
  emit('save', { acao: 'desativar' })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      @click.self="emit('close')"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <!-- Header -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          :class="contingenciaAtiva ? 'bg-yellow-50' : 'bg-gray-50'"
        >
          <div class="flex items-center gap-3">
            <div
              class="h-9 w-9 rounded-lg flex items-center justify-center"
              :class="contingenciaAtiva ? 'bg-yellow-100' : 'bg-gray-100'"
            >
              <ShieldAlert
                v-if="contingenciaAtiva"
                class="h-5 w-5 text-yellow-600"
              />
              <ShieldCheck v-else class="h-5 w-5 text-gray-600" />
            </div>
            <h2 class="text-lg font-bold text-gray-900">Contingência NF-e</h2>
          </div>
          <button
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4">
          <!-- Contingência ATIVA -->
          <template v-if="contingenciaAtiva">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <ShieldAlert class="h-5 w-5 text-yellow-600" />
                <span class="font-semibold text-yellow-800">Contingência Ativa</span>
              </div>
              <p class="text-sm text-yellow-700">
                O modo de contingência está ativo. Todas as NF-e emitidas estão sendo processadas
                em modo de contingência.
              </p>
            </div>

            <button
              @click="handleDesativar"
              :disabled="loading"
              class="w-full px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {{ loading ? 'Desativando...' : 'Desativar Contingência' }}
            </button>
          </template>

          <!-- Contingência INATIVA -->
          <template v-else>
            <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              Contingência está <strong>desativada</strong>. NF-e sendo emitidas normalmente.
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Contingência</label>
              <select
                v-model="form.tipo"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
              >
                <option value="SVC-AN">SVC-AN (Sefaz Virtual de Contingência — Ambiente Nacional)</option>
                <option value="SVC-RS">SVC-RS (Sefaz Virtual de Contingência — Rio Grande do Sul)</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Justificativa</label>
              <textarea
                v-model="form.justificativa"
                rows="3"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 resize-none"
                placeholder="Motivo para ativação da contingência..."
              />
            </div>

            <button
              @click="handleAtivar"
              :disabled="loading || !form.justificativa.trim()"
              class="w-full px-4 py-2.5 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
            >
              {{ loading ? 'Ativando...' : 'Ativar Contingência' }}
            </button>
          </template>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            @click="emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
