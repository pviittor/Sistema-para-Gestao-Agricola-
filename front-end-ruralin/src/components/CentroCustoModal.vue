<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  X,
  FileText,
  Hash,
  Layers,
  Save
} from 'lucide-vue-next'
import type { CentroCusto } from '@/types/CentroCusto'
import { centroCustoService } from '@/services/centroCustoService'
import BaseAutocomplete from './BaseAutocomplete.vue'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  isOpen: boolean
  initialData: CentroCusto | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: CentroCusto): void
}>()

const activeTab = ref('informacoes')

const tabs = [
  { id: 'informacoes', label: 'Informações', icon: FileText },
]

const errors = ref<Partial<Record<keyof CentroCusto, string>>>({})
const formData = ref<Partial<CentroCusto>>({})
const paisOptions = ref<{ value: number | string; label: string }[]>([])
const isLoadingPais = ref(false)

const isEditing = computed(() => !!props.initialData)

const fetchPais = async () => {
  isLoadingPais.value = true
  try {
    const result = await centroCustoService.getAllNoPagination()
    if (result.success) {
      paisOptions.value = result.data.data.filter(cc => {
        return !isEditing.value || cc.id !== props.initialData?.id
      }).map(cc => ({
        value: cc.id || 0,
        label: `${cc.codigo} - ${cc.nome}`
      }))
    }
  } catch {
    toast.error('Erro ao carregar lista de pais')
  } finally {
    isLoadingPais.value = false
  }
}

watch(() => props.isOpen, async (newValue) => {
  if (newValue) {
    await fetchPais()
    if (props.initialData) {
      formData.value = { ...props.initialData }
    } else {
      resetForm()
    }
    errors.value = {}
    activeTab.value = 'informacoes'
  }
})

const resetForm = () => {
  formData.value = {
    codigo: '',
    nome: '',
    centroCustoPaiId: null,
    ativo: true
  }
}

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  if (!formData.value.codigo?.trim()) {
    errors.value.codigo = 'Código é obrigatório'
    isValid = false
  } else if (formData.value.codigo.length < 2) {
    errors.value.codigo = 'Código deve ter pelo menos 2 caracteres'
    isValid = false
  }

  if (!formData.value.nome?.trim()) {
    errors.value.nome = 'Nome é obrigatório'
    isValid = false
  } else if (formData.value.nome.length < 3) {
    errors.value.nome = 'Nome deve ter pelo menos 3 caracteres'
    isValid = false
  }

  return isValid
}

const handleSubmit = () => {
  if (props.loading) return

  if (validateForm()) {
    emit('save', formData.value as CentroCusto)
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ isEditing ? 'Editar Centro de Custo' : 'Novo Centro de Custo' }}
        </h2>
        <button @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-100 px-6 overflow-x-auto bg-white">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none flex items-center gap-2 whitespace-nowrap"
          :class="activeTab === tab.id ? 'border-lime-600 text-lime-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto flex-1 custom-scrollbar bg-white">
        <form @submit.prevent="handleSubmit" class="h-full flex flex-col">

          <div v-show="activeTab === 'informacoes'" class="space-y-8">

            <!-- Section: Identificação -->
            <section>
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <Hash class="w-5 h-5 text-gray-500" />
                Identificação
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                <!-- Código -->
                <div class="md:col-span-4">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Código</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash class="h-4 w-4 text-gray-400" />
                    </div>
                    <input v-model="formData.codigo" type="text" placeholder="Ex: CC001"
                      class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                      :class="{ 'border-red-300': errors.codigo }" />
                  </div>
                  <p v-if="errors.codigo" class="mt-1 text-xs text-red-600">{{ errors.codigo }}</p>
                </div>

                <!-- Nome -->
                <div class="md:col-span-8">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Nome</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText class="h-4 w-4 text-gray-400" />
                    </div>
                    <input v-model="formData.nome" type="text" placeholder="Ex: Administrativo"
                      class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                      :class="{ 'border-red-300': errors.nome }" />
                  </div>
                  <p v-if="errors.nome" class="mt-1 text-xs text-red-600">{{ errors.nome }}</p>
                </div>

                <!-- Centro de Custo Pai -->
                <div class="md:col-span-12">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Centro de Custo Pai</label>
                  <div class="flex gap-2">
                    <BaseAutocomplete v-model="formData.centroCustoPaiId" :options="paisOptions"
                      placeholder="Selecione um pai (opcional)..." class="w-full">
                      <template #prefix>
                        <Layers class="h-4 w-4 text-gray-400" />
                      </template>
                    </BaseAutocomplete>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">Deixe em branco se for um centro de custo raiz.</p>
                </div>

                <!-- Ativo -->
                <div class="md:col-span-12 pt-2">
                  <label
                    class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all">
                    <input type="checkbox" v-model="formData.ativo"
                      class="h-5 w-5 rounded border-gray-300 text-lime-600 focus:ring-lime-500">
                    <span class="text-sm text-gray-700 font-medium">Ativo</span>
                  </label>
                </div>
              </div>
            </section>
          </div>

        </form>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
        <button @click="$emit('close')"
          class="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
          Cancelar
        </button>
        <button @click="handleSubmit"
          :disabled="props.loading"
          class="inline-flex items-center px-6 py-2.5 bg-lime-600 hover:bg-lime-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
          <span v-if="props.loading" class="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          <Save v-else class="w-4 h-4 mr-2" />
          {{ props.loading ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
