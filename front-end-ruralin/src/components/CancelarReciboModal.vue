<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import type { Recibo } from '@/types/Recibo'

const props = defineProps<{
  isOpen: boolean
  recibo?: Recibo | null
}>()

const emit = defineEmits<{
  close: []
  confirm: [motivo: string]
}>()

const motivo = ref('')

watch(() => props.isOpen, (val) => {
  if (val) motivo.value = ''
})

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const handleConfirm = () => {
  if (motivo.value.trim().length < 10) return
  emit('confirm', motivo.value.trim())
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="emit('close')"></div>
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div class="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">Cancelar Recibo</h2>
          <button @click="emit('close')" class="p-2 hover:bg-gray-100 rounded-lg">
            <X class="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div v-if="recibo" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-700">
              <strong>Recibo:</strong> {{ recibo.numeroFormatado }}<br />
              <strong>Valor:</strong> {{ formatCurrency(recibo.valor) }}<br />
              <strong>Beneficiário:</strong> {{ recibo.nomeBeneficiario }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Motivo do Cancelamento *</label>
            <textarea v-model="motivo" rows="4" placeholder="Informe o motivo (mínimo 10 caracteres)..." class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"></textarea>
            <p v-if="motivo.length > 0 && motivo.length < 10" class="text-xs text-red-500 mt-1">Mínimo de 10 caracteres</p>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button @click="emit('close')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Voltar</button>
            <button @click="handleConfirm" :disabled="motivo.trim().length < 10" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">Confirmar Cancelamento</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
