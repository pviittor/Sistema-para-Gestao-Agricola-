<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import {
  X,
  Save,
  Plus,
  FileText,
  FileSpreadsheet,
  DollarSign,
  Hash,
  Layers,
  Package,
  User,
  Tag
} from 'lucide-vue-next'
import type { Produto } from '@/types/Produto'
import BaseAutocomplete from './BaseAutocomplete.vue'
import { moedaService } from '../services/moedaService'
import { unidadeMedidaService } from '../services/unidadeMedidaService'
import { grupoProdutoService } from '../services/grupoProdutoService'
import { subGrupoProdutoService } from '../services/subGrupoProdutoService'
import { principioAtivoService } from '../services/principioAtivoService'
import { parceiroNegocioService } from '../services/parceiroNegocioService'
import { formatDateForInput } from '@/utils/formatters'

const props = defineProps<{
  isOpen: boolean
  initialData: Produto | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: Produto): void
}>()

const activeTab = ref('informacoes')

const tabs = [
  { id: 'informacoes', label: 'Informações', icon: FileText },
  { id: 'parametros_nfe', label: 'Parâmetros NF-e', icon: FileSpreadsheet },
  { id: 'custo', label: 'Custo', icon: DollarSign },
]

const formData = ref<Produto>({
  descricao_prod: '',
  idUnidadeMedida: undefined,
  pesoliquido_prod: 0,
  idGrupo: undefined,
  idSubGrupo: undefined,
  idPrincipioAtivo: undefined,
  idFabricante: undefined,
  idIndexador: undefined,
  precomedio_prod: 0,
  valorultimaentrada_prod: 0,
  combustivel_prod: false,
  custoUltimoCusto_prod: false,
  valorUltimoCusto_prod: 0,
  observacao_prod: '',
  atualizacaoCusto_prod: '1900-01-01'
})

const errors = ref<Partial<Record<keyof Produto, string>>>({})

// Options
const unidadesMedida = ref<{ value: number, label: string }[]>([])
const grupos = ref<{ value: number, label: string }[]>([])
const subgrupos = ref<{ value: number, label: string }[]>([])
const principiosAtivos = ref<{ value: number, label: string }[]>([])
const indexadores = ref<{ value: number, label: string }[]>([])
const fabricantes = ref<{ value: number, label: string }[]>([])

const loadOptions = async () => {
  try {
    const [moedasData, unidadesData, gruposData, principiosData, pessoasData] = await Promise.all([
      moedaService.getAll(1, 1000),
      unidadeMedidaService.getAll(1, 1000),
      grupoProdutoService.getAll(1, 1000),
      principioAtivoService.getAll(1, 1000),
      parceiroNegocioService.getAll(1, 1000)
    ])

    if (moedasData?.data) {
      indexadores.value = moedasData.data.map(m => ({
        value: m.id_moeda!,
        label: `${m.descricao_moeda} (${m.simbolo_moeda})`
      }))
    }

    if (unidadesData?.data) {
      unidadesMedida.value = unidadesData.data.map(u => ({
        value: u.id_unidade!,
        label: `${u.descricao_unidade} (${u.abreviatura_unidade})`
      }))
    }

    if (gruposData?.data) {
      grupos.value = gruposData.data.map(g => ({
        value: g.id!,
        label: g.descricao_grupo
      }))
    }

    if (principiosData?.data) {
      principiosAtivos.value = principiosData.data.map(p => ({
        value: p.id_principio!,
        label: p.descricao_principio
      }))
    }

    if (pessoasData?.data) {
      // Filtrar apenas os que são fornecedores (fabricantes)
      // Note: Assuming fornecedor_pessoa is the flag for Manufacturer as there is no fabricante_pessoa
      fabricantes.value = pessoasData.data
        .filter(p => p.fornecedor_pessoa)
        .map(p => ({
          value: p.id_pessoa!,
          label: p.nomerazao_pessoa || 'Sem nome'
        }))
    }
  } catch (error) {
    console.error('Erro ao carregar opções:', error)
  }
}

onMounted(() => {
  loadOptions()
})

const isEditing = computed(() => !!props.initialData)

watch(() => formData.value.idGrupo, async (newVal, oldVal) => {
  if (newVal === oldVal) return

  const currentSubGroupId = formData.value.idSubGrupo
  subgrupos.value = []

  if (newVal) {
    try {
      const subs = await subGrupoProdutoService.findByGrupo(newVal)
      if (subs) {
        subgrupos.value = subs.map(s => ({
          value: s.id_sub!,
          label: s.descricao_sub
        }))

        // Only keep subGroup if it belongs to the new group
        const exists = subgrupos.value.some(s => s.value === currentSubGroupId)
        if (!exists) {
          formData.value.idSubGrupo = undefined
        }
      } else {
        formData.value.idSubGrupo = undefined
      }
    } catch (error) {
      console.error('Erro ao carregar subgrupos:', error)
      formData.value.idSubGrupo = undefined
    }

    if (formData.value.atualizacaoCusto_prod) {
      formData.value.atualizacaoCusto_prod = formatDateForInput(formData.value.atualizacaoCusto_prod)
    }
  } else {
    formData.value.idSubGrupo = undefined
  }
})

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
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
    descricao_prod: '',
    idUnidadeMedida: undefined,
    pesoliquido_prod: 0,
    idGrupo: undefined,
    idSubGrupo: undefined,
    idPrincipioAtivo: undefined,
    idFabricante: undefined,
    idIndexador: undefined,
    precomedio_prod: 0,
    valorultimaentrada_prod: 0,
    combustivel_prod: false,
    custoUltimoCusto_prod: false,
    valorUltimoCusto_prod: 0,
    observacao_prod: '',
    atualizacaoCusto_prod: '1900-01-01'
  }
}

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  if (!formData.value.descricao_prod?.trim()) {
    errors.value.descricao_prod = 'Descrição é obrigatória'
    isValid = false
  }

  if (!formData.value.idUnidadeMedida) {
    errors.value.idUnidadeMedida = 'Unidade de medida é obrigatória'
    isValid = false
  }

  if (!formData.value.idGrupo) {
    errors.value.idGrupo = 'Grupo é obrigatório'
    isValid = false
  }

  return isValid
}

const handleSubmit = () => {
  if (props.loading) return
  if (validateForm()) {
    // Fill descriptions based on IDs (optional, mainly for display in list)
    const unidade = unidadesMedida.value.find(u => u.value === formData.value.idUnidadeMedida)
    if (unidade) formData.value.unidadeMedidaDescricao = unidade.label

    const grupo = grupos.value.find(g => g.value === formData.value.idGrupo)
    if (grupo) formData.value.grupoDescricao = grupo.label

    emit('save', formData.value)
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ isEditing ? 'Editar Produto' : 'Novo Produto' }}
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
                <!-- Descrição -->
                <div class="md:col-span-12">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText class="h-4 w-4 text-gray-400" />
                    </div>
                    <input v-model="formData.descricao_prod" type="text"
                      class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                      :class="{ 'border-red-300': errors.descricao_prod }" />
                  </div>
                  <p v-if="errors.descricao_prod" class="mt-1 text-xs text-red-600">{{ errors.descricao_prod }}</p>
                </div>

                <!-- Checkboxes -->
                <div class="md:col-span-12 flex gap-6 pt-2">
                  <label
                    class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all">
                    <input type="checkbox" v-model="formData.combustivel_prod"
                      class="h-5 w-5 rounded border-gray-300 text-lime-600 focus:ring-lime-500">
                    <span class="text-sm text-gray-700 font-medium">Combustível?</span>
                  </label>
                </div>
              </div>
            </section>

            <!-- Section: Classificação -->
            <section>
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <Layers class="w-5 h-5 text-gray-500" />
                Classificação
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                <!-- Grupo -->
                <div class="md:col-span-6">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Grupo</label>
                  <div class="flex gap-2">
                    <BaseAutocomplete v-model="formData.idGrupo" :options="grupos" placeholder="Selecione..."
                      class="w-full">
                      <template #prefix>
                        <Layers class="h-4 w-4 text-gray-400" />
                      </template>
                    </BaseAutocomplete>
                    <button type="button"
                      class="p-2.5 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors shadow-sm shrink-0">
                      <Plus class="h-5 w-5" />
                    </button>
                  </div>
                  <p v-if="errors.idGrupo" class="mt-1 text-xs text-red-600">{{ errors.idGrupo }}</p>
                </div>

                <!-- Subgrupo -->
                <div class="md:col-span-6">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Subgrupo</label>
                  <div class="flex gap-2">
                    <BaseAutocomplete v-model="formData.idSubGrupo" :options="subgrupos" placeholder="Selecione..."
                      class="w-full">
                      <template #prefix>
                        <Layers class="h-4 w-4 text-gray-400" />
                      </template>
                    </BaseAutocomplete>
                    <button type="button"
                      class="p-2.5 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors shadow-sm shrink-0">
                      <Plus class="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <!-- Princípio Ativo -->
                <div class="md:col-span-6">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Princípio Ativo</label>
                  <div class="flex gap-2">
                    <BaseAutocomplete v-model="formData.idPrincipioAtivo" :options="principiosAtivos"
                      placeholder="Selecione..." class="w-full">
                      <template #prefix>
                        <Tag class="h-4 w-4 text-gray-400" />
                      </template>
                    </BaseAutocomplete>
                    <button type="button"
                      class="p-2.5 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors shadow-sm shrink-0">
                      <Plus class="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <!-- Fabricante -->
                <div class="md:col-span-6">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Fabricante</label>
                  <div class="flex gap-2">
                    <BaseAutocomplete v-model="formData.idFabricante" :options="fabricantes" placeholder="Selecione..."
                      class="w-full">
                      <template #prefix>
                        <User class="h-4 w-4 text-gray-400" />
                      </template>
                    </BaseAutocomplete>
                    <button type="button"
                      class="p-2.5 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors shadow-sm shrink-0">
                      <Plus class="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- Section: Estoque & Medidas -->
            <section>
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <Package class="w-5 h-5 text-gray-500" />
                Estoque & Medidas
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                <!-- Unidade Medida -->
                <div class="md:col-span-6">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Und. de medida</label>
                  <div class="flex gap-2">
                    <BaseAutocomplete v-model="formData.idUnidadeMedida" :options="unidadesMedida"
                      placeholder="Selecione..." class="w-full">
                      <template #prefix>
                        <Package class="h-4 w-4 text-gray-400" />
                      </template>
                    </BaseAutocomplete>
                    <button type="button"
                      class="p-2.5 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors shadow-sm shrink-0">
                      <Plus class="h-5 w-5" />
                    </button>
                  </div>
                  <p v-if="errors.idUnidadeMedida" class="mt-1 text-xs text-red-600">{{ errors.idUnidadeMedida }}</p>
                </div>

                <!-- Peso Líquido -->
                <div class="md:col-span-6">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Peso líquido</label>
                  <input v-model="formData.pesoliquido_prod" type="number" step="0.001"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right" />
                </div>
              </div>
            </section>

            <!-- Section: Dados Comerciais -->
            <section>
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <DollarSign class="w-5 h-5 text-gray-500" />
                Dados Comerciais
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                <!-- Indexador -->
                <div class="md:col-span-6">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Indexador</label>
                  <BaseAutocomplete v-model="formData.idIndexador" :options="indexadores" placeholder="Selecione..."
                    class="w-full">
                    <template #prefix>
                      <DollarSign class="h-4 w-4 text-gray-400" />
                    </template>
                  </BaseAutocomplete>
                </div>

                <!-- Custo Checkbox -->
                <div class="md:col-span-6 flex items-end">
                  <label
                    class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all w-full">
                    <input type="checkbox" v-model="formData.custoUltimoCusto_prod"
                      class="h-5 w-5 rounded border-gray-300 text-lime-600 focus:ring-lime-500">
                    <span class="text-sm text-gray-700 font-medium">Custo baseado na última entrada?</span>
                  </label>
                </div>
              </div>
            </section>

            <!-- Section: Observações -->
            <section>
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <FileText class="w-5 h-5 text-gray-500" />
                Observações
              </h3>
              <textarea v-model="formData.observacao_prod" rows="4"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none placeholder-gray-400"
                placeholder="Insira observações adicionais aqui..."></textarea>
            </section>

          </div>

          <div v-show="activeTab === 'parametros_nfe'" class="space-y-6">
            <div class="flex items-center justify-center h-48 text-gray-500">
              Parâmetros NF-e em construção...
            </div>
          </div>

          <div v-show="activeTab === 'custo'" class="space-y-6">
            <section>
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <DollarSign class="w-5 h-5 text-gray-500" />
                Custo do produto
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Valor Custo</label>
                  <input v-model="formData.valorUltimoCusto_prod" type="number" step="0.01"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right" />
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Data atualização</label>
                  <input v-model="formData.atualizacaoCusto_prod" type="date"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all" />
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
        <button @click="handleSubmit" :disabled="props.loading"
          class="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          <span v-if="props.loading" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          <Save v-else class="w-4 h-4" />
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
