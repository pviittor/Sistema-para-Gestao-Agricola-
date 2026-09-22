<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'
import type { NumeracaoRecibo } from '@/types/Recibo'

const props = defineProps<{
  isOpen: boolean
  initialData?: NumeracaoRecibo | null
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [data: { serie: string; ativo: boolean }]
}>()

const serie = ref('')
const ativo = ref(true)

const isEditing = computed(() => !!props.initialData?.id)

watch(() => props.isOpen, (val) => {
  if (val) {
    if (props.initialData) {
      serie.value = props.initialData.serie
      ativo.value = props.initialData.ativo
    } else {
      serie.value = ''
      ativo.value = true
    }
  }
})

const handleSubmit = () => {
  if (!serie.value.trim()) return
  emit('save', { serie: serie.value.trim(), ativo: ativo.value })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="emit('close')"></div>
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div class="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">{{ isEditing ? 'Editar Série' : 'Nova Série' }}</h2>
          <button @click="emit('close')" class="p-2 hover:bg-gray-100 rounded-lg"><X class="h-5 w-5 text-gray-400" /></button>
        </div>
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Série *</label>
            <input v-model="serie" type="text" maxlength="5" required :disabled="isEditing" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 disabled:bg-gray-100" placeholder="Ex: 001" />
          </div>
          <div class="flex items-center gap-2">
            <input v-model="ativo" type="checkbox" id="ativo" class="rounded border-gray-300 text-lime-600 focus:ring-lime-500" />
            <label for="ativo" class="text-sm text-gray-700">Série ativa</label>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="emit('close')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" :disabled="loading" class="px-4 py-2 bg-lime-600 text-white rounded-lg text-sm font-medium hover:bg-lime-700 disabled:opacity-50">{{ loading ? 'Salvando...' : 'Salvar' }}</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
