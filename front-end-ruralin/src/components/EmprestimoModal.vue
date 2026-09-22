<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { X, Save, FileText, User, Calendar, ChevronDown, ChevronUp } from 'lucide-vue-next'
import type { Emprestimo } from '../types/Emprestimo'
import type { Propriedade } from '../types/Propriedade'
import type { ParceiroNegocio } from '../types/ParceiroNegocio'
import BaseAutocomplete from './BaseAutocomplete.vue'
import { propriedadeService } from '../services/propriedadeService'
import { parceiroNegocioService } from '../services/parceiroNegocioService'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  isOpen: boolean
  initialData?: Emprestimo | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const defaultForm = (): Emprestimo => ({
  fazendaId: 0,
  parceiroId: 0,
  data_emp: '',
  devolucao_emp: null,
  observacao_emp: null,
  tipo_emp: 0,
  situacao_emp: 0,
  prazo_dias: null,
  multa_percentual: null,
  juros_diario_percentual: null,
})

const showFinanceiro = ref(false)

const formData = ref<Emprestimo>(defaultForm())

const fazendasOptions = ref<{ value: number; label: string }[]>([])
const parceirosOptions = ref<{ value: number; label: string }[]>([])

const fetchFazendas = async () => {
  try {
    const result = await propriedadeService.getAllNoPagination()
    fazendasOptions.value = result.data
      .map((f: Propriedade) => ({
        value: f.id ?? 0,
        label: f.descricao,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  } catch (error) {
    console.error('Erro ao buscar fazendas:', error)
    toast.error('Erro ao carregar fazendas.')
  }
}

const fetchParceiros = async () => {
  try {
    const result = await parceiroNegocioService.getAllNoPagination()
    parceirosOptions.value = result.data
      .map((p: ParceiroNegocio) => ({
        value: p.id_pessoa ?? 0,
        label: p.nomefantasia_pessoa
          ? `${p.nomefantasia_pessoa} - ${p.cpfcnpj_pessoa ?? 'N/A'}`
          : `${p.nomerazao_pessoa ?? 'Sem Nome'} - ${p.cpfcnpj_pessoa ?? 'N/A'}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  } catch (error) {
    console.error('Erro ao buscar parceiros:', error)
    toast.error('Erro ao carregar parceiros.')
  }
}

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.initialData) {
        formData.value = { ...props.initialData }
      } else {
        formData.value = defaultForm()
      }
    }
  },
)

const dataLimitePreview = computed(() => {
  if (!formData.value.data_emp || !formData.value.prazo_dias) return null
  const d = new Date(formData.value.data_emp + 'T00:00:00')
  d.setDate(d.getDate() + formData.value.prazo_dias)
  return d.toISOString().split('T')[0]
})

onMounted(() => {
  fetchFazendas()
  fetchParceiros()
})

const handleSave = () => {
  if (props.loading) return

  if (!formData.value.fazendaId) {
    alert('A fazenda é obrigatória.')
    return
  }
  if (!formData.value.parceiroId) {
    alert('O parceiro é obrigatório.')
    return
  }
  if (!formData.value.data_emp) {
    alert('A data do empréstimo é obrigatória.')
    return
  }
  if (formData.value.tipo_emp === null || formData.value.tipo_emp === undefined) {
    alert('O tipo de empréstimo é obrigatório.')
    return
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
      class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Empréstimo' : 'Novo Empréstimo' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar">
        <div class="space-y-6">

          <!-- Fazenda -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">
                Fazenda <span class="text-red-500">*</span>
              </label>
              <BaseAutocomplete
                v-model="formData.fazendaId"
                :options="fazendasOptions"
                placeholder="Selecione a fazenda..."
                class="w-full"
              >
                <template #prefix>
                  <FileText class="h-4 w-4 text-gray-400" />
                </template>
              </BaseAutocomplete>
            </div>

            <!-- Parceiro -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">
                Parceiro <span class="text-red-500">*</span>
              </label>
              <BaseAutocomplete
                v-model="formData.parceiroId"
                :options="parceirosOptions"
                placeholder="Selecione o parceiro..."
                class="w-full"
              >
                <template #prefix>
                  <User class="h-4 w-4 text-gray-400" />
                </template>
              </BaseAutocomplete>
            </div>
          </div>

          <!-- Tipo e Data -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">
                Tipo <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.tipo_emp"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
              >
                <option :value="0">Produto</option>
                <option :value="1">Máquina</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">
                Data do Empréstimo <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="formData.data_emp"
                  type="date"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">
                Previsão de Devolução
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar class="h-4 w-4 text-gray-400" />
                </div>
                <input
                  v-model="formData.devolucao_emp"
                  type="date"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <!-- Observação -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Observação</label>
            <textarea
              v-model="formData.observacao_emp"
              rows="3"
              placeholder="Observações sobre o empréstimo..."
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all resize-none placeholder-gray-400"
            ></textarea>
          </div>

          <!-- Condições Financeiras (colapsável) -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              @click="showFinanceiro = !showFinanceiro"
              class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-bold text-gray-700"
            >
              <span>Condições Financeiras</span>
              <ChevronUp v-if="showFinanceiro" class="h-4 w-4 text-gray-400" />
              <ChevronDown v-else class="h-4 w-4 text-gray-400" />
            </button>
            <div v-if="showFinanceiro" class="p-4 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Prazo para devolução (dias)
                  </label>
                  <input
                    v-model.number="formData.prazo_dias"
                    type="number"
                    min="1"
                    placeholder="Ex: 30"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Multa por atraso (%)
                  </label>
                  <input
                    v-model.number="formData.multa_percentual"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Ex: 10"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Juros diário (%)
                  </label>
                  <input
                    v-model.number="formData.juros_diario_percentual"
                    type="number"
                    min="0"
                    max="10"
                    step="0.0001"
                    placeholder="Ex: 0.1"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                </div>
              </div>

              <!-- Preview data limite -->
              <div v-if="dataLimitePreview" class="text-sm text-gray-600 bg-lime-50 border border-lime-200 rounded-lg p-3">
                <strong>Data limite de devolução:</strong> {{ dataLimitePreview }}
              </div>

              <!-- Custo total (somente em edição com valor existente) -->
              <div
                v-if="props.initialData?.valor_custo_medio_total"
                class="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <strong>Custo total dos itens:</strong>
                R$ {{ Number(props.initialData.valor_custo_medio_total).toFixed(2).replace('.', ',') }}
              </div>
            </div>
          </div>

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
          @click="handleSave"
          :disabled="props.loading"
          class="inline-flex items-center bg-lime-600 hover:bg-lime-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span
            v-if="props.loading"
            class="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"
          ></span>
          <Save v-else class="w-4 h-4 mr-2" />
          {{ props.loading ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </div>
  </div>
</template>
