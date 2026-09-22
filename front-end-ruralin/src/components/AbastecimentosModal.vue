<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import {
  X,
  FileText,
  Calendar,
  Truck,
  User,
  Fuel,
  MapPin,
  Sprout,
  DollarSign,
  Gauge
} from 'lucide-vue-next'
import type { Abastecimento } from '../types/Abastecimento'
import type { MaquinaVeiculo } from '../types/MaquinaVeiculo'
import type { ParceiroNegocio } from '../types/ParceiroNegocio'
import type { Produto } from '../types/Produto'
import type { Propriedade } from '../types/Propriedade'
import type { Safra } from '../types/Safra'
import BaseAutocomplete from './BaseAutocomplete.vue'
import { maquinaService } from '../services/maquinaService'
import { parceiroNegocioService } from '../services/parceiroNegocioService'
import { produtoService } from '../services/produtoService'
import { propriedadeService } from '../services/propriedadeService'
import { safraService } from '../services/safraService'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  isOpen: boolean
  initialData?: Abastecimento | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const activeTab = ref('informacoes')

const formData = ref<Abastecimento>({
  data: new Date().toISOString().split('T')[0] || '',
  idMaquina: 0,
  kminicio: 0,
  kmfim: 0,
  idOperador: null,
  idOperadorAbastecimento: null,
  idCombustivel: 0,
  volume: 0,
  preco: 0,
  total: 0,
  idFazenda: 0,
  idCicloAbastecimento: null
})

// Options for selects
const maquinasOptions = ref<{ value: number; label: string }[]>([])
const operadoresOptions = ref<{ value: number; label: string }[]>([])
const fazendasOptions = ref<{ value: number; label: string }[]>([])
const safrasOptions = ref<{ value: number; label: string }[]>([])
const combustiveisOptions = ref<{ value: number; label: string }[]>([])

// Fetch functions
const fetchCombustiveis = async () => {
  try {
    const result = await produtoService.getAll(1, 1000)
    const data = result.data || []
    combustiveisOptions.value = data
      .filter((p: Produto) => p.combustivel_prod)
      .map((p: Produto) => ({
        value: p.id_prod!,
        label: p.descricao_prod
      }))
  } catch (error) {
    console.error('Erro ao buscar combustíveis:', error)
  }
}

const fetchMaquinas = async () => {
  try {
    const result = await maquinaService.getAll(1, 1000)
    maquinasOptions.value = result.data.map((m: MaquinaVeiculo) => ({
      value: m.id_mqn!,
      label: `${m.descricao || 'Sem Descrição'} / ${m.placa || 'S/ Placa'}`
    }))
  } catch (error) {
    console.error('Erro ao buscar máquinas:', error)
  }
}

const fetchOperadores = async () => {
  try {
    const result = await parceiroNegocioService.getAll(1, 1000)
    operadoresOptions.value = result.data
      .filter((p: ParceiroNegocio) => p.operador_pessoa || p.motorista_pessoa || p.funcionario_pessoa)
      .map((p: ParceiroNegocio) => ({
        value: p.id_pessoa!,
        label: p.nomefantasia_pessoa || p.nomerazao_pessoa || 'Sem Nome'
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  } catch (error) {
    console.error('Erro ao buscar operadores:', error)
  }
}

const fetchFazendas = async () => {
  try {
    const result = await propriedadeService.getAll(1, 1000)
    // Handling different return structures based on service implementation
    const data = result.data.data || []
    fazendasOptions.value = data.map((f: Propriedade) => ({
      value: f.id!,
      label: f.descricao
    }))
  } catch (error) {
    console.error('Erro ao buscar fazendas:', error)
  }
}

const fetchSafras = async () => {
  try {
    const result = await safraService.getAll(1, 1000)
    const data = result.data.data || []
    safrasOptions.value = data.map((s: Safra) => ({
      value: s.id!,
      label: s.nome
    }))
  } catch (error) {
    console.error('Erro ao buscar safras:', error)
  }
}

const tabs = [
  { id: 'informacoes', label: 'Informações', icon: FileText },
]

// Calculate total automatically
watch(
  () => [formData.value.volume, formData.value.preco],
  ([vol, prc]) => {
    const volume = Number(vol) || 0
    const preco = Number(prc) || 0
    formData.value.total = Number((volume * preco).toFixed(2))
  }
)

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.initialData) {
        formData.value = { ...props.initialData }
        
        // Ensure idOperadorAbastecimento is set if the object exists but the ID field is missing
        if (!formData.value.idOperadorAbastecimento && props.initialData.operadorAbastecimento?.id_pessoa) {
          formData.value.idOperadorAbastecimento = props.initialData.operadorAbastecimento.id_pessoa
        }

        // Format date to YYYY-MM-DD for input type="date"
        if (formData.value.data) {
           formData.value.data = formData.value.data.split('T')[0] || ''
        }
      } else {
        // Reset to default
        formData.value = {
          data: '', // Deixa vazio para o usuário preencher
          idMaquina: 0,
          kminicio: 0,
          kmfim: 0,
          idOperador: null,
          idOperadorAbastecimento: null,
          idCombustivel: 0,
          volume: 0,
          preco: 0,
          total: 0,
          idFazenda: 0,
          idCicloAbastecimento: null
        }
      }
      activeTab.value = 'informacoes'
    }
  }
)

onMounted(() => {
  fetchMaquinas()
  fetchOperadores()
  fetchFazendas()
  fetchSafras()
  fetchCombustiveis()
})

const handleSave = () => {
  if (props.loading) return
  
  if (!formData.value.data) {
    alert('A data é obrigatória.')
    return
  }
  if (!formData.value.idMaquina) {
    alert('A máquina é obrigatória.')
    return
  }
  if (!formData.value.idCombustivel) {
    alert('O combustível é obrigatório.')
    return
  }
  if (!formData.value.idFazenda) {
    alert('A fazenda é obrigatória.')
    return
  }
  if (formData.value.volume <= 0) {
    alert('O volume deve ser maior que zero.')
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
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Abastecimento' : 'Novo Abastecimento' }}
        </h2>
        <button @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-100 px-6 overflow-x-auto">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none flex items-center gap-2 whitespace-nowrap"
          :class="activeTab === tab.id ? 'border-lime-600 text-lime-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar">
        <div v-show="activeTab === 'informacoes'" class="space-y-8">

          <!-- Section: Dados Gerais -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <FileText class="w-5 h-5 text-gray-500" />
              Dados Gerais
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              <!-- Data -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Data <span class="text-red-500">*</span></label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.data" type="date"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all">
                </div>
              </div>

              <!-- Fazenda -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Fazenda <span class="text-red-500">*</span></label>
                <BaseAutocomplete v-model="formData.idFazenda" :options="fazendasOptions"
                  placeholder="Selecione..." class="w-full">
                  <template #prefix>
                    <MapPin class="h-4 w-4 text-gray-400" />
                  </template>
                </BaseAutocomplete>
              </div>

              <!-- Safra -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Safra/Ciclo</label>
                <BaseAutocomplete v-model="formData.idCicloAbastecimento" :options="safrasOptions"
                  placeholder="Selecione..." class="w-full">
                  <template #prefix>
                    <Sprout class="h-4 w-4 text-gray-400" />
                  </template>
                </BaseAutocomplete>
              </div>

              <!-- Máquina -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Máquina <span class="text-red-500">*</span></label>
                <BaseAutocomplete v-model="formData.idMaquina" :options="maquinasOptions"
                  placeholder="Selecione..." class="w-full">
                  <template #prefix>
                    <Truck class="h-4 w-4 text-gray-400" />
                  </template>
                </BaseAutocomplete>
              </div>

              <!-- Operador -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Operador</label>
                <BaseAutocomplete v-model="formData.idOperadorAbastecimento" :options="operadoresOptions"
                  placeholder="Selecione..." class="w-full">
                  <template #prefix>
                    <User class="h-4 w-4 text-gray-400" />
                  </template>
                </BaseAutocomplete>
              </div>

            </div>
          </section>

          <!-- Section: Detalhes do Abastecimento -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <Fuel class="w-5 h-5 text-gray-500" />
              Detalhes do Abastecimento
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">

              <!-- Combustível -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Combustível <span class="text-red-500">*</span></label>
                <BaseAutocomplete v-model="formData.idCombustivel" :options="combustiveisOptions"
                  placeholder="Selecione..." class="w-full">
                  <template #prefix>
                    <Fuel class="h-4 w-4 text-gray-400" />
                  </template>
                </BaseAutocomplete>
              </div>

              <!-- Volume -->
              <div class="md:col-span-3">
                <label class="block text-sm font-bold text-gray-700 mb-2">Volume (L) <span class="text-red-500">*</span></label>
                <input v-model="formData.volume" type="number" step="0.01"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right">
              </div>

              <!-- Preço -->
              <div class="md:col-span-3">
                <label class="block text-sm font-bold text-gray-700 mb-2">Preço Unit. (R$)</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign class="h-4 w-4 text-gray-400" />
                    </div>
                    <input v-model="formData.preco" type="number" step="0.01"
                        class="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right">
                </div>
              </div>
              
              <!-- Total -->
              <div class="md:col-span-3">
                <label class="block text-sm font-bold text-gray-700 mb-2">Total (R$)</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign class="h-4 w-4 text-gray-400" />
                    </div>
                    <input v-model="formData.total" type="number" step="0.01" readonly
                        class="w-full pl-8 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none text-right font-bold text-gray-700">
                </div>
              </div>

              <!-- Km Início -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Km/Horímetro Início</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Gauge class="h-4 w-4 text-gray-400" />
                    </div>
                    <input v-model="formData.kminicio" type="number" step="0.1"
                        class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right">
                </div>
              </div>

              <!-- Km Fim -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Km/Horímetro Fim</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Gauge class="h-4 w-4 text-gray-400" />
                    </div>
                    <input v-model="formData.kmfim" type="number" step="0.1"
                        class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right">
                </div>
              </div>

            </div>
          </section>

        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <button @click="$emit('close')"
          class="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
          Cancelar
        </button>
        <button @click="handleSave" :disabled="loading"
          class="px-6 py-2.5 bg-lime-600 text-white font-medium rounded-lg hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span v-else>Salvar Abastecimento</span>
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
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
</style>
