<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Save } from 'lucide-vue-next'
import type { Evento } from '@/types/Evento'
import { useCalendarStore } from '@/stores/calendar'

const props = defineProps<{
  isOpen: boolean
  initialDate?: string
  event?: Evento | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', event: Evento): void
}>()

const calendarStore = useCalendarStore()
const locais = computed(() => calendarStore.locais)

const form = ref<{
  titulo: string
  data: string
  horario_inicio: string
  horario_fim: string
  localId: number | null
  descricao: string
}>({
  titulo: '',
  data: '',
  horario_inicio: '',
  horario_fim: '',
  localId: null,
  descricao: ''
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    calendarStore.fetchLocais()
    if (props.event) {
      form.value = {
        titulo: props.event.titulo,
        data: props.event.data,
        horario_inicio: props.event.horario_inicio,
        horario_fim: props.event.horario_fim,
        localId: props.event.localId,
        descricao: props.event.descricao
      }
    } else {
      // Reset form when opening
      form.value = {
        titulo: '',
        data: props.initialDate || '',
        horario_inicio: '',
        horario_fim: '',
        localId: null,
        descricao: ''
      }
    }
  }
})

const save = () => {
  if (props.loading) return

  if (!form.value.titulo || !form.value.data || !form.value.horario_inicio || !form.value.horario_fim || !form.value.localId) {
    alert('Por favor, preencha todos os campos obrigatórios.')
    return
  }

  const event: Evento = {
    titulo: form.value.titulo,
    data: form.value.data,
    horario_inicio: form.value.horario_inicio,
    horario_fim: form.value.horario_fim,
    localId: form.value.localId,
    descricao: form.value.descricao
  }

  if (props.event?.id) {
    event.id = props.event.id
  }

  emit('save', event)
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">
            {{ event ? 'Editar Evento' : 'Novo Evento' }}
          </h2>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="p-6 flex-1 overflow-y-auto space-y-4">
        <!-- Título -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">Título</label>
          <input
            type="text"
            v-model="form.titulo"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Reunião de equipe"
          >
        </div>

        <!-- Data -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">Data</label>
          <input
            type="date"
            v-model="form.data"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
        </div>

        <!-- Horários -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Início</label>
            <input
              type="time"
              v-model="form.horario_inicio"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Fim</label>
            <input
              type="time"
              v-model="form.horario_fim"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
          </div>
        </div>

        <!-- Local -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">Local</label>
          <select
            v-model="form.localId"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
          >
            <option :value="null" disabled>Selecione um local</option>
            <option v-for="local in locais" :key="local.id" :value="local.id">
              {{ local.desc_simples }}
            </option>
          </select>
          <p v-if="form.localId" class="mt-1 text-xs text-gray-500">
            {{ locais.find(l => l.id === form.localId)?.desc_completa }}
          </p>
        </div>

        <!-- Descrição -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
          <textarea
            v-model="form.descricao"
            rows="3"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          ></textarea>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
        <button
          @click="$emit('close')"
          class="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="save"
          :disabled="props.loading"
          class="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <span v-if="props.loading" class="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          <Save v-else class="w-4 h-4 mr-2" />
          {{ props.loading ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </div>
  </div>
</template>
