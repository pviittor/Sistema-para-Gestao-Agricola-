<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'
import type { Recibo, CreateReciboPayload } from '@/types/Recibo'
import { FormaPagamentoRecibo, TipoVinculoRecibo } from '@/types/Recibo'
import { valorPorExtenso } from '@/utils/valorPorExtenso'

const props = defineProps<{
  isOpen: boolean
  initialData?: Recibo | null
  loading?: boolean
  viewMode?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [data: CreateReciboPayload]
}>()

const formData = ref<CreateReciboPayload>({
  nomeEmitente: '',
  documentoEmitente: '',
  nomeBeneficiario: '',
  documentoBeneficiario: '',
  valor: 0,
  descricao: '',
  formaPagamento: 'DINHEIRO',
  dataEmissao: new Date().toISOString().split('T')[0] ?? '',
  local: '',
  observacoes: '',
  tipoVinculo: 'AVULSO',
  tituloPagarId: null,
  tituloReceberId: null,
  parcelaId: null,
})

const resetForm = () => {
  formData.value = {
    nomeEmitente: '',
    documentoEmitente: '',
    nomeBeneficiario: '',
    documentoBeneficiario: '',
    valor: 0,
    descricao: '',
    formaPagamento: 'DINHEIRO',
    dataEmissao: new Date().toISOString().split('T')[0] ?? '',
    local: '',
    observacoes: '',
    tipoVinculo: 'AVULSO',
    tituloPagarId: null,
    tituloReceberId: null,
    parcelaId: null,
  }
}

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.initialData) {
        formData.value = {
          nomeEmitente: props.initialData.nomeEmitente || '',
          documentoEmitente: props.initialData.documentoEmitente || '',
          nomeBeneficiario: props.initialData.nomeBeneficiario || '',
          documentoBeneficiario: props.initialData.documentoBeneficiario || '',
          valor: props.initialData.valor || 0,
          descricao: props.initialData.descricao || '',
          formaPagamento: props.initialData.formaPagamento || 'DINHEIRO',
          dataEmissao: props.initialData.dataEmissao || (new Date().toISOString().split('T')[0] ?? ''),
          local: props.initialData.local || '',
          observacoes: props.initialData.observacoes || '',
          tipoVinculo: props.initialData.tipoVinculo || 'AVULSO',
          tituloPagarId: props.initialData.tituloPagarId || null,
          tituloReceberId: props.initialData.tituloReceberId || null,
          parcelaId: props.initialData.parcelaId || null,
        }
      } else {
        resetForm()
      }
    }
  },
)

const valorExtensoPreview = computed(() => {
  if (!formData.value.valor || formData.value.valor <= 0) return ''
  return valorPorExtenso(formData.value.valor)
})

const isEditing = computed(() => !!props.initialData?.id)
const title = computed(() => {
  if (props.viewMode) return 'Visualizar Recibo'
  return isEditing.value ? 'Editar Recibo' : 'Emitir Novo Recibo'
})

const formasPagamento = Object.values(FormaPagamentoRecibo)
const tiposVinculo = Object.values(TipoVinculoRecibo)

const handleSubmit = () => {
  if (!formData.value.nomeEmitente || !formData.value.nomeBeneficiario || !formData.value.valor || !formData.value.descricao) {
    return
  }
  emit('save', { ...formData.value })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="emit('close')"></div>
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 class="text-xl font-bold text-gray-900">{{ title }}</h2>
          <button @click="emit('close')" class="p-2 hover:bg-gray-100 rounded-lg">
            <X class="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <!-- Info badge for editing -->
        <div v-if="isEditing && initialData" class="px-6 pt-4">
          <div class="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            Recibo <strong>{{ initialData.numeroFormatado }}</strong> — Status: <span :class="initialData.status === 'EMITIDO' ? 'text-green-600' : 'text-red-600'" class="font-medium">{{ initialData.status }}</span>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <!-- Emitente -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome Emitente *</label>
              <input v-model="formData.nomeEmitente" type="text" required :disabled="viewMode" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 disabled:bg-gray-50" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ Emitente</label>
              <input v-model="formData.documentoEmitente" type="text" :disabled="viewMode" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 disabled:bg-gray-50" />
            </div>
          </div>

          <!-- Beneficiário -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome Beneficiário *</label>
              <input v-model="formData.nomeBeneficiario" type="text" required :disabled="viewMode" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 disabled:bg-gray-50" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ Beneficiário</label>
              <input v-model="formData.documentoBeneficiario" type="text" :disabled="viewMode" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 disabled:bg-gray-50" />
            </div>
          </div>

          <!-- Valor + Forma Pagamento -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
              <input v-model.number="formData.valor" type="number" step="0.01" min="0.01" required :disabled="viewMode" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 disabled:bg-gray-50" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento *</label>
              <select v-model="formData.formaPagamento" required :disabled="viewMode" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 disabled:bg-gray-50">
                <option v-for="fp in formasPagamento" :key="fp" :value="fp">{{ fp }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data Emissão *</label>
              <input v-model="formData.dataEmissao" type="date" required :disabled="viewMode" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 disabled:bg-gray-50" />
            </div>
          </div>

          <!-- Valor por extenso preview -->
          <div v-if="valorExtensoPreview || (viewMode && initialData?.valorExtenso)" class="bg-lime-50 border border-lime-200 rounded-lg p-3">
            <p class="text-xs text-lime-700 font-medium mb-1">Valor por extenso:</p>
            <p class="text-sm text-lime-800 italic">{{ viewMode && initialData?.valorExtenso ? initialData.valorExtenso : valorExtensoPreview }}</p>
          </div>

          <!-- Descrição -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição / Histórico *</label>
            <textarea v-model="formData.descricao" rows="3" required :disabled="viewMode" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 disabled:bg-gray-50"></textarea>
          </div>

          <!-- Local + Observações -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Local</label>
              <input v-model="formData.local" type="text" :disabled="viewMode" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 disabled:bg-gray-50" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <input v-model="formData.observacoes" type="text" :disabled="viewMode" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 disabled:bg-gray-50" />
            </div>
          </div>

          <!-- Vínculo -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Vínculo</label>
              <select v-model="formData.tipoVinculo" :disabled="viewMode" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 disabled:bg-gray-50">
                <option v-for="tv in tiposVinculo" :key="tv" :value="tv">{{ tv === 'AVULSO' ? 'Avulso' : tv === 'TITULO_PAGAR' ? 'Título a Pagar' : 'Título a Receber' }}</option>
              </select>
            </div>
            <div v-if="formData.tipoVinculo === 'TITULO_PAGAR'">
              <label class="block text-sm font-medium text-gray-700 mb-1">ID Título a Pagar</label>
              <input v-model.number="formData.tituloPagarId" type="number" :disabled="viewMode" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 disabled:bg-gray-50" />
            </div>
            <div v-if="formData.tipoVinculo === 'TITULO_RECEBER'">
              <label class="block text-sm font-medium text-gray-700 mb-1">ID Título a Receber</label>
              <input v-model.number="formData.tituloReceberId" type="number" :disabled="viewMode" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 disabled:bg-gray-50" />
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" @click="emit('close')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              {{ viewMode ? 'Fechar' : 'Cancelar' }}
            </button>
            <button v-if="!viewMode" type="submit" :disabled="loading" class="px-4 py-2 bg-lime-600 text-white rounded-lg text-sm font-medium hover:bg-lime-700 transition-colors disabled:opacity-50">
              {{ loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Emitir Recibo' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
