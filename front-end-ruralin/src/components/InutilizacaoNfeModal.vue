<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X, Save, AlertTriangle } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [data: { serie: string; numInicial: number; numFinal: number; justificativa: string }]
}>()

const form = ref({
  serie: '1',
  numInicial: 1,
  numFinal: 1,
  justificativa: '',
})

const errors = computed(() => {
  const e: string[] = []
  if (form.value.numFinal < form.value.numInicial) {
    e.push('Número final deve ser maior ou igual ao inicial')
  }
  if (form.value.justificativa.trim().length < 15) {
    e.push('Justificativa deve ter no mínimo 15 caracteres')
  }
  return e
})

const isValid = computed(() => errors.value.length === 0)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      form.value = { serie: '1', numInicial: 1, numFinal: 1, justificativa: '' }
    }
  },
)

const handleSubmit = () => {
  if (!isValid.value) return
  if (!confirm(`Confirma a inutilização da faixa ${form.value.numInicial} a ${form.value.numFinal} da série ${form.value.serie}? Esta ação é irreversível.`)) return
  emit('save', { ...form.value })
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
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-orange-50">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertTriangle class="h-5 w-5 text-orange-600" />
            </div>
            <h2 class="text-lg font-bold text-gray-900">Inutilizar Faixa de Numeração</h2>
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
          <div class="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
            <strong>Atenção:</strong> A inutilização é irreversível e será comunicada à SEFAZ.
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Série</label>
              <input
                v-model="form.serie"
                type="text"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                placeholder="1"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nº Inicial</label>
              <input
                v-model.number="form.numInicial"
                type="number"
                min="1"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nº Final</label>
              <input
                v-model.number="form.numFinal"
                type="number"
                min="1"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Justificativa <span class="text-gray-400">(mín. 15 caracteres)</span>
            </label>
            <textarea
              v-model="form.justificativa"
              rows="3"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 resize-none"
              placeholder="Informe o motivo da inutilização..."
            />
            <p class="text-xs text-gray-400 mt-1">{{ form.justificativa.length }}/15 caracteres</p>
          </div>

          <div v-if="errors.length > 0" class="text-sm text-red-600 space-y-1">
            <p v-for="(err, idx) in errors" :key="idx">• {{ err }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            @click="emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleSubmit"
            :disabled="!isValid || loading"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save v-if="!loading" class="h-4 w-4 mr-2" />
            <div
              v-else
              class="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"
            />
            Inutilizar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
