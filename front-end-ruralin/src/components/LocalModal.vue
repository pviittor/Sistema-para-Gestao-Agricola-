<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, MapPin, Save } from 'lucide-vue-next'
import type { Local } from '../types/Local'

const props = defineProps<{
  isOpen: boolean
  initialData?: Local | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const descSimples = ref('')
const descCompleta = ref('')

// Reset form when modal opens
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.initialData) {
        descSimples.value = props.initialData.desc_simples
        descCompleta.value = props.initialData.desc_completa
      } else {
        descSimples.value = ''
        descCompleta.value = ''
      }
    }
  },
)

const handleSave = () => {
  if (props.loading) return
  if (!descSimples.value) {
    alert('A descrição simples é obrigatória.')
    return
  }

  emit('save', {
    desc_simples: descSimples.value,
    desc_completa: descCompleta.value,
  })
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Local' : 'Novo Local' }}
        </h2>
        <button @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-8 flex-1">
        <!-- Main Fields -->
        <div class="grid grid-cols-1 gap-6">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Nome do Local</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin class="h-5 w-5 text-gray-400" />
              </div>
              <input v-model="descSimples" type="text" placeholder="Ex: Consultório Central"
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Endereço / Detalhes</label>
            <textarea v-model="descCompleta" rows="4" placeholder="Ex: Rua das Flores, 123 - Sala 4..."
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400 resize-none"></textarea>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
        <button @click="$emit('close')"
          class="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
          Cancelar
        </button>
        <button @click="handleSave"
          :disabled="props.loading"
          class="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
          <span v-if="props.loading" class="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          <Save v-else class="w-4 h-4 mr-2" />
          {{ props.loading ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </div>
  </div>
</template>
