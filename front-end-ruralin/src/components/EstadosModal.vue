<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  X,
  FileText,
  MapPin,
  Save,
  Hash
} from 'lucide-vue-next'
import type { Estado } from '../types/Estado'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  isOpen: boolean
  initialData?: Estado | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const activeTab = ref('informacoes')

const formData = ref<Partial<Estado>>({
  nome: '',
  sigla: '',
  codigoIBGE: undefined,
  ativo: true
})

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.initialData) {
        formData.value = { ...props.initialData }
      } else {
        // Reset to default
        formData.value = {
          nome: '',
          sigla: '',
          codigoIBGE: undefined,
          ativo: true
        }
      }
      activeTab.value = 'informacoes'
    }
  }
)

const handleSave = () => {
  if (props.loading) return

  if (!formData.value.nome) {
    toast.warning('O nome é obrigatório.')
    return
  }
  if (!formData.value.sigla) {
    toast.warning('A sigla é obrigatória.')
    return
  }
  if (formData.value.sigla.length !== 2) {
    toast.warning('A sigla deve ter 2 caracteres.')
    return
  }
  emit('save', formData.value)
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Estado' : 'Novo Estado' }}
        </h2>
        <button @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar">
        <div class="space-y-6">

          <!-- Section: Dados Principais -->
          <section>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">

              <!-- Nome -->
              <div class="md:col-span-12">
                <label class="block text-sm font-bold text-gray-700 mb-2">Nome <span class="text-red-500">*</span></label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.nome" type="text"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Nome do estado">
                </div>
              </div>

              <!-- Sigla -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Sigla <span class="text-red-500">*</span></label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.sigla" type="text" maxlength="2"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400 uppercase"
                    placeholder="Ex: SP"
                    @input="formData.sigla = ($event.target as HTMLInputElement).value.toUpperCase()">
                </div>
              </div>

              <!-- Código IBGE -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Código IBGE</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.codigoIBGE" type="number"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Ex: 35">
                </div>
              </div>

              <!-- Ativo -->
              <div class="md:col-span-12 pt-2">
                 <div class="flex items-center gap-4">
                    <label class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all w-full sm:w-auto">
                      <input v-model="formData.ativo" type="checkbox"
                        class="h-5 w-5 rounded border-gray-300 text-lime-600 focus:ring-lime-500">
                      <span class="text-sm text-gray-700 font-medium">Cadastro Ativo</span>
                    </label>
                 </div>
              </div>

            </div>
          </section>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
        <button @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
          Cancelar
        </button>
        <button @click="handleSave"
          :disabled="props.loading"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-lime-600 border border-transparent rounded-lg hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
          <span v-if="props.loading" class="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          <Save v-else class="w-4 h-4 mr-2" />
          {{ props.loading ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>

    </div>
  </div>
</template>
