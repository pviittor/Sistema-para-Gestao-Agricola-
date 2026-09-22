<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RefreshCw, Calendar, DollarSign, MapPin, X } from 'lucide-vue-next'
import BaseAutocomplete from '@/components/BaseAutocomplete.vue'
import type { RecorrenciaFinanceira } from '@/types/RecorrenciaFinanceira'

const props = defineProps<{
  isOpen: boolean
  initialData?: RecorrenciaFinanceira | null
  loading?: boolean
  pessoasOptions?: Array<{ value: number; label: string }>
  fazendasOptions?: Array<{ value: number; label: string }>
  safrasOptions?: Array<{ value: number; label: string }>
  talhoesOptions?: Array<{ value: number; label: string }>
  moedasOptions?: Array<{ value: number; label: string }>
  contasOptions?: Array<{ value: number; label: string }>
  planosContaOptions?: Array<{ value: number; label: string }>
  centrosCustoOptions?: Array<{ value: number; label: string }>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: Partial<RecorrenciaFinanceira>): void
}>()

const isEditing = computed(() => !!props.initialData?.id)

const defaultFormData = (): Partial<RecorrenciaFinanceira> => ({
  tipo: 'PAGAR',
  descricao: '',
  valor: 0,
  periodicidade: 'MENSAL',
  diaVencimento: 1,
  dataInicio: new Date().toISOString().split('T')[0],
  dataFim: null,
  ativa: true,
  idFornecedorCliente: null,
  idPortador: null,
  idProdutor: null,
  idContaDebCred: null,
  idPlanoContaGerencial: null,
  idCentroCusto: null,
  idFazenda: null,
  idSafra: null,
  idTalhao: null,
  idMoeda: null,
  antecedenciaGeracaoDias: 5,
  numeroMaximoGeracoes: null,
  observacao: null,
})

const formData = ref<Partial<RecorrenciaFinanceira>>(defaultFormData())
const valorDisplay = ref('')

const periodicidadeOptions = [
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'QUINZENAL', label: 'Quinzenal' },
  { value: 'MENSAL', label: 'Mensal' },
  { value: 'BIMESTRAL', label: 'Bimestral' },
  { value: 'TRIMESTRAL', label: 'Trimestral' },
  { value: 'SEMESTRAL', label: 'Semestral' },
  { value: 'ANUAL', label: 'Anual' },
  { value: 'SAFRA', label: 'Safra' },
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

const onValorBlur = () => {
  const val = parseCurrency(valorDisplay.value)
  formData.value.valor = val
  valorDisplay.value = val > 0 ? val.toFixed(2).replace('.', ',') : ''
}

watch(() => props.isOpen, (open) => {
  if (open) {
    if (props.initialData) {
      formData.value = { ...props.initialData }
      valorDisplay.value = props.initialData.valor
        ? props.initialData.valor.toFixed(2).replace('.', ',')
        : ''
    } else {
      formData.value = defaultFormData()
      valorDisplay.value = ''
    }
  }
})

const handleSubmit = () => {
  if (!formData.value.descricao || !formData.value.valor || !formData.value.dataInicio) return
  emit('save', { ...formData.value })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col z-10">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-lime-50 rounded-xl">
              <RefreshCw class="w-5 h-5 text-lime-600" />
            </div>
            <h2 class="text-xl font-bold text-gray-900">
              {{ isEditing ? 'Editar Recorrencia' : 'Nova Recorrencia Financeira' }}
            </h2>
          </div>
          <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X class="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Tipo Toggle -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Tipo*</label>
            <div class="flex gap-2">
              <button
                @click="formData.tipo = 'PAGAR'"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  formData.tipo === 'PAGAR'
                    ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                ]"
              >
                A Pagar
              </button>
              <button
                @click="formData.tipo = 'RECEBER'"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  formData.tipo === 'RECEBER'
                    ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                ]"
              >
                A Receber
              </button>
            </div>
          </div>

          <!-- Identificacao -->
          <section>
            <h3 class="text-base font-semibold text-gray-900 mb-4 border-b pb-2">Identificacao</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-bold text-gray-700 mb-1">Descricao*</label>
                <input
                  v-model="formData.descricao"
                  type="text"
                  placeholder="Ex: Arrendamento Fazenda Sao Joao"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-bold text-gray-700 mb-1">Observacao</label>
                <textarea
                  v-model="formData.observacao"
                  rows="2"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          <!-- Valor e Periodicidade -->
          <section>
            <h3 class="text-base font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
              <DollarSign class="w-4 h-4 text-gray-500" />
              Valor e Periodicidade
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Valor*</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-3 flex items-center text-gray-500 text-sm">R$</span>
                  <input
                    :value="valorDisplay"
                    @input="valorDisplay = ($event.target as HTMLInputElement).value"
                    @blur="onValorBlur"
                    type="text"
                    inputmode="decimal"
                    placeholder="0,00"
                    class="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-right"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Periodicidade*</label>
                <select
                  v-model="formData.periodicidade"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                >
                  <option v-for="opt in periodicidadeOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Dia Vencimento* (1-31)</label>
                <input
                  v-model.number="formData.diaVencimento"
                  type="number"
                  min="1"
                  max="31"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-right"
                />
                <p v-if="(formData.diaVencimento ?? 0) > 28" class="text-xs text-amber-600 mt-1">
                  Em meses com menos dias, sera ajustado para o ultimo dia do mes.
                </p>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Data Inicio*</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.dataInicio"
                    type="date"
                    class="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Data Fim</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.dataFim"
                    type="date"
                    class="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Max. Geracoes</label>
                <input
                  v-model.number="formData.numeroMaximoGeracoes"
                  type="number"
                  min="1"
                  placeholder="Ilimitado"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-right"
                />
              </div>
            </div>
          </section>

          <!-- Vinculacoes -->
          <section>
            <h3 class="text-base font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
              <MapPin class="w-4 h-4 text-gray-500" />
              Vinculacoes
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">
                  {{ formData.tipo === 'PAGAR' ? 'Fornecedor' : 'Cliente' }}
                </label>
                <BaseAutocomplete
                  v-model="formData.idFornecedorCliente"
                  :options="pessoasOptions || []"
                  placeholder="Selecione..."
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Fazenda</label>
                <select
                  v-model="formData.idFazenda"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                >
                  <option :value="null">Selecione...</option>
                  <option v-for="f in fazendasOptions" :key="f.value" :value="f.value">{{ f.label }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Safra</label>
                <select
                  v-model="formData.idSafra"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                >
                  <option :value="null">Selecione...</option>
                  <option v-for="s in safrasOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Talhao</label>
                <select
                  v-model="formData.idTalhao"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                >
                  <option :value="null">Selecione...</option>
                  <option v-for="t in talhoesOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Conta Debito/Credito</label>
                <select
                  v-model="formData.idContaDebCred"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                >
                  <option :value="null">Selecione...</option>
                  <option v-for="c in contasOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Plano de Conta</label>
                <select
                  v-model="formData.idPlanoContaGerencial"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                >
                  <option :value="null">Selecione...</option>
                  <option v-for="p in planosContaOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Centro de Custo</label>
                <select
                  v-model="formData.idCentroCusto"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                >
                  <option :value="null">Selecione...</option>
                  <option v-for="cc in centrosCustoOptions" :key="cc.value" :value="cc.value">{{ cc.label }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Antecedencia Geracao (dias)</label>
                <input
                  v-model.number="formData.antecedenciaGeracaoDias"
                  type="number"
                  min="0"
                  max="90"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-right"
                />
              </div>
            </div>
          </section>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            @click="$emit('close')"
            class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleSubmit"
            :disabled="loading"
            class="px-6 py-2.5 text-sm font-medium text-white bg-lime-600 rounded-lg hover:bg-lime-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            <span v-if="loading" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            {{ isEditing ? 'Salvar' : 'Criar Recorrencia' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
