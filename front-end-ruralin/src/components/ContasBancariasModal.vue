<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { X, Save, FileText, Landmark, Wallet } from 'lucide-vue-next'
import type { Conta } from '../types/Conta'
import { TipoConta } from '../types/Conta'
import { bancoService } from '../services/bancoService'
import BaseAutocomplete from './BaseAutocomplete.vue'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  isOpen: boolean
  initialData?: Conta | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const activeTab = ref('informacoes')

const formData = ref<Conta>({
  bancoId: 0,
  nome: '',
  agencia: '',
  conta: '',
  tipo: TipoConta.BANCO,
  saldoInicial: 0,
  ativo: true,
})

const tabs = [{ id: 'informacoes', label: 'Informações', icon: FileText }]

// Lista de Bancos
const bancosOptions = ref<{ value: number; label: string }[]>([])

const fetchBancos = async () => {
  try {
    const bancos = await bancoService.getAllNoPagination()
    bancosOptions.value = bancos.data.map((b) => ({
      value: b.id,
      label: `${b.codigo} - ${b.nome}`,
    }))
  } catch (error) {
    console.error('Erro ao buscar bancos:', error)
    toast.error('Erro ao buscar bancos.')
  }
}

onMounted(() => {
  fetchBancos()
})

const tipoOptions = [
  { value: TipoConta.BANCO, label: 'Conta Bancária' },
  { value: TipoConta.CAIXA, label: 'Caixa / Carteira' },
]

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.initialData) {
        formData.value = { ...props.initialData }
      } else {
        // Reset to default
        formData.value = {
          bancoId: 0,
          nome: '',
          agencia: '',
          conta: '',
          tipo: TipoConta.BANCO,
          saldoInicial: 0,
          ativo: true,
        }
      }
      activeTab.value = 'informacoes'
    }
  },
)

const isBanco = computed(() => formData.value.tipo === TipoConta.BANCO)

const handleSave = () => {
  if (props.loading) return

  if (!formData.value.nome) {
    alert('O nome da conta é obrigatório.')
    return
  }

  if (isBanco.value) {
    if (!formData.value.bancoId) {
      alert('Selecione um banco.')
      return
    }
  }

  emit('save', formData.value)
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div
      class="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl h-auto max-h-[90vh] overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Conta' : 'Nova Conta' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-100 px-6 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none flex items-center gap-2 whitespace-nowrap"
          :class="
            activeTab === tab.id
              ? 'border-lime-600 text-lime-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          "
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar">
        <div v-show="activeTab === 'informacoes'" class="space-y-8">
          <!-- Section: Identificação -->
          <section>
            <h3
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2"
            >
              <Wallet class="w-5 h-5 text-gray-500" />
              Identificação
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
              <!-- Nome -->
              <div class="md:col-span-8">
                <label class="block text-sm font-bold text-gray-700 mb-2"
                  >Nome da Conta <span class="text-red-500">*</span></label
                >
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.nome"
                    type="text"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Ex: Conta Corrente Principal"
                  />
                </div>
              </div>

              <!-- Tipo -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2"
                  >Tipo <span class="text-red-500">*</span></label
                >
                <div class="relative">
                  <select
                    v-model="formData.tipo"
                    class="w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all appearance-none bg-white"
                  >
                    <option v-for="opt in tipoOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                  <div
                    class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
                  >
                    <svg
                      class="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Banco (Conditional) -->
              <div class="md:col-span-12 animate-in fade-in slide-in-from-top-2">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div class="md:col-span-6">
                    <label class="block text-sm font-bold text-gray-700 mb-2"
                      >Banco <span class="text-red-500">*</span></label
                    >
                    <BaseAutocomplete
                      v-model="formData.bancoId"
                      :options="bancosOptions"
                      placeholder="Selecione o banco..."
                      class="w-full"
                    >
                      <template #prefix>
                        <Landmark class="h-4 w-4 text-gray-400" />
                      </template>
                    </BaseAutocomplete>
                  </div>

                  <div v-if="isBanco" class="md:col-span-3">
                    <label class="block text-sm font-bold text-gray-700 mb-2">Agência</label>
                    <input
                      v-model="formData.agencia"
                      type="text"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div v-if="isBanco" class="md:col-span-3">
                    <label class="block text-sm font-bold text-gray-700 mb-2">Conta</label>
                    <input
                      v-model="formData.conta"
                      type="text"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section: Financeiro -->
          <section>
            <h3
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2"
            >
              <Wallet class="w-5 h-5 text-gray-500" />
              Financeiro
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
              <!-- Saldo Inicial -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Saldo Inicial</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">R$</span>
                  </div>
                  <input
                    v-model="formData.saldoInicial"
                    type="number"
                    step="0.01"
                    class="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                  />
                </div>
              </div>

              <!-- Ativo -->
              <div class="md:col-span-4 flex items-end pb-2">
                <label class="flex items-center gap-3 cursor-pointer">
                  <div
                    class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full border border-gray-200"
                    :class="formData.ativo ? 'bg-lime-500 border-lime-500' : 'bg-gray-200'"
                  >
                    <input
                      v-model="formData.ativo"
                      type="checkbox"
                      class="absolute w-0 h-0 opacity-0"
                    />
                    <span
                      class="absolute left-0 inline-block w-6 h-6 transition-transform duration-200 ease-in-out transform bg-white rounded-full shadow"
                      :class="formData.ativo ? 'translate-x-6' : 'translate-x-0'"
                    ></span>
                  </div>
                  <span class="text-sm font-medium text-gray-700">Conta Ativa</span>
                </label>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="handleSave"
          :disabled="props.loading"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span
            v-if="props.loading"
            class="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"
          ></span>
          <Save v-else class="h-4 w-4 mr-2" />
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
