<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, DollarSign, Calendar, FileText, Save } from 'lucide-vue-next'
import type {
  Financeiro,
  FinanceiroConta,
  FinanceiroHistorico,
  FinanceiroPlanoFinanceiro,
  FinanceiroTipoDocumento,
  FinanceiroTipoPagamento,
} from '../types/Financeiro'
import { toast } from 'vue3-toastify'
import BaseAutocomplete from './BaseAutocomplete.vue'

const props = defineProps<{
  isOpen: boolean
  initialData?: Financeiro | null
  apiUrl: string
  contas: FinanceiroConta[]
  historicos: FinanceiroHistorico[]
  planos: FinanceiroPlanoFinanceiro[]
  tiposDocumento: FinanceiroTipoDocumento[]
  tiposPagamento: FinanceiroTipoPagamento[]
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const form = ref<Partial<Financeiro>>({})

const toOptionsContas = (list: FinanceiroConta[]) =>
  list.map((item) => ({
    value: item.id_conta,
    label: item.descricao_conta || '',
  }))

const toOptionsHistoricos = (list: FinanceiroHistorico[]) =>
  list.map((item) => ({
    value: item.codigo,
    label: item.descricao || '',
  }))

const toOptionsPlanos = (list: FinanceiroPlanoFinanceiro[]) =>
  list.map((item) => ({
    value: item.id_plano,
    label: item.descricao_plano || '',
  }))

const toOptionsTiposDocumentos = (list: FinanceiroTipoDocumento[]) =>
  list.map((item) => ({
    value: item.id_tipodoc,
    label: item.descricao_tipodoc || '',
  }))

const toOptionsTiposPagamentos = (list: FinanceiroTipoPagamento[]) =>
  list.map((item) => ({
    value: item.id_tipopgto,
    label: item.descricao_tipopgto || '',
  }))

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.initialData) {
        form.value = { ...props.initialData }
      } else {
        form.value = {
          dataEmissao: new Date().toISOString().split('T')[0],
          dataVencimento: new Date().toISOString().split('T')[0],
          valor: 0,
          observacao: '',
        }
      }
    }
  },
)

const handleSave = () => {
  if (props.loading) return

  if (!form.value.valor || !form.value.dataEmissao || !form.value.dataVencimento) {
    toast.error('Preencha os campos obrigatórios.')
    return
  }

  // Populate descriptions

  const getIdConta = (list: FinanceiroConta[], id?: number) => {
    const item = list.find((i) => i.id_conta === id)
    return item ? item.id_conta || 0 : 0
  }
  const getDescConta = (list: FinanceiroConta[], id?: number) => {
    const item = list.find((i) => i.id_conta === id)
    return item ? item.descricao_conta || '' : ''
  }

  const getIdHistorico = (list: FinanceiroHistorico[], id?: number) => {
    const item = list.find((i) => i.codigo === id)
    return item ? item.codigo || 0 : 0
  }
  const getDescHistorico = (list: FinanceiroHistorico[], id?: number) => {
    const item = list.find((i) => i.codigo === id)
    return item ? item.descricao || '' : ''
  }

  const getIdPlano = (list: FinanceiroPlanoFinanceiro[], id?: number) => {
    const item = list.find((i) => i.id_plano === id)
    return item ? item.id_plano || 0 : 0
  }
  const getDescPlano = (list: FinanceiroPlanoFinanceiro[], id?: number) => {
    const item = list.find((i) => i.id_plano === id)
    return item ? item.descricao_plano || '' : ''
  }

  const getIdTipoDocumento = (list: FinanceiroTipoDocumento[], id?: number) => {
    const item = list.find((i) => i.id_tipodoc === id)
    return item ? item.id_tipodoc || 0 : 0
  }
  const getDescTipoDocumento = (list: FinanceiroTipoDocumento[], id?: number) => {
    const item = list.find((i) => i.id_tipodoc === id)
    return item ? item.descricao_tipodoc || '' : ''
  }

  const getIdTipoPagamento = (list: FinanceiroTipoPagamento[], id?: number) => {
    const item = list.find((i) => i.id_tipopgto === id)
    return item ? item.id_tipopgto || 0 : 0
  }
  const getDescTipoPagamento = (list: FinanceiroTipoPagamento[], id?: number) => {
    const item = list.find((i) => i.id_tipopgto === id)
    return item ? item.descricao_tipopgto || '' : ''
  }

  form.value.contaId = getIdConta(props.contas, form.value.contaId)
  form.value.historicoId = getIdHistorico(props.historicos, form.value.historicoId)
  form.value.planoFinanceiroId = getIdPlano(props.planos, form.value.planoFinanceiroId)
  form.value.tipoDocuentoId = getIdTipoDocumento(props.tiposDocumento, form.value.tipoDocuentoId)
  form.value.tipoPagamentoId = getIdTipoPagamento(props.tiposPagamento, form.value.tipoPagamentoId)

  form.value.contaDesc = getDescConta(props.contas, form.value.contaId)
  form.value.historicoDesc = getDescHistorico(props.historicos, form.value.historicoId)
  form.value.planoFinanceiroDesc = getDescPlano(props.planos, form.value.planoFinanceiroId)
  form.value.tipoDocuentoDesc = getDescTipoDocumento(
    props.tiposDocumento,
    form.value.tipoDocuentoId,
  )
  form.value.tipoPagamentoDesc = getDescTipoPagamento(
    props.tiposPagamento,
    form.value.tipoPagamentoId,
  )

  emit('save', form.value)
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div
      class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Lançamento' : 'Novo Lançamento' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-6 flex-1">
        <!-- Conta -->
        <div>
          <BaseAutocomplete
            label="Conta"
            v-model="form.contaId"
            :options="toOptionsContas(props.contas)"
            placeholder="Selecione uma conta"
          />
        </div>

        <!-- Historico -->
        <div>
          <BaseAutocomplete
            label="Histórico"
            v-model="form.historicoId"
            :options="toOptionsHistoricos(props.historicos)"
            placeholder="Selecione um histórico"
          />
        </div>

        <!-- Plano Financeiro -->
        <div>
          <BaseAutocomplete
            label="Plano Financeiro"
            v-model="form.planoFinanceiroId"
            :options="toOptionsPlanos(props.planos)"
            placeholder="Selecione um plano"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Tipo Documento -->
          <div>
            <BaseAutocomplete
              label="Tipo Documento"
              v-model="form.tipoDocuentoId"
              :options="toOptionsTiposDocumentos(props.tiposDocumento)"
              placeholder="Selecione"
            />
          </div>

          <!-- Tipo Pagamento -->
          <div>
            <BaseAutocomplete
              label="Tipo Pagamento"
              v-model="form.tipoPagamentoId"
              :options="toOptionsTiposPagamentos(props.tiposPagamento)"
              placeholder="Selecione"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Data -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Data de Emissão</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar class="h-5 w-5 text-gray-400" />
              </div>
              <input
                v-model="form.dataEmissao"
                type="date"
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Data de Vencimento</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar class="h-5 w-5 text-gray-400" />
              </div>
              <input
                v-model="form.dataVencimento"
                type="date"
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        <!-- Valor -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">Valor</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="form.valor"
              type="number"
              step="0.01"
              placeholder="0,00"
              class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400"
            />
          </div>
        </div>

        <!-- Observacao -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">Observação</label>
          <div class="relative">
            <div class="absolute top-3 left-3 flex items-start pointer-events-none">
              <FileText class="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              v-model="form.observacao"
              rows="3"
              class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400 resize-none"
            ></textarea>
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
