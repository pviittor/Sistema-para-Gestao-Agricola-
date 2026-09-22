<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Building,
  Hash,
  Briefcase
} from 'lucide-vue-next'
import type { ParceiroNegocio } from '../types/ParceiroNegocio'
import type { Municipio } from '../types/Municipio'
import { municipioService } from '../services/municipioService'
import BaseAutocomplete from './BaseAutocomplete.vue'
import { maskCPF, maskCNPJ, maskPhone } from '../utils/masks'
import { validateCPF, validateCNPJ, validateEmail, validatePhone } from '../utils/validators'
import { formatDateForInput } from '../utils/formatters'

const props = defineProps<{
  isOpen: boolean
  initialData?: ParceiroNegocio | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

// Form Data
const formData = ref<Partial<ParceiroNegocio>>({})
const errors = ref<Record<string, string>>({})

const activeTab = ref('gerais')

// Reset form when modal opens
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      errors.value = {}
      if (props.initialData) {
        formData.value = { ...props.initialData }
        // Apply masks to initial data if needed
        if (formData.value.cpfcnpj_pessoa) {
           if (formData.value.tipo_pessoa === 1) formData.value.cpfcnpj_pessoa = maskCPF(formData.value.cpfcnpj_pessoa)
           else if (formData.value.tipo_pessoa === 2) formData.value.cpfcnpj_pessoa = maskCNPJ(formData.value.cpfcnpj_pessoa)
        }
        if (formData.value.telefone1_pessoa) {
          formData.value.telefone1_pessoa = maskPhone(formData.value.telefone1_pessoa)
        }
        if (formData.value.nascimento_pessoa) {
          formData.value.nascimento_pessoa = formatDateForInput(formData.value.nascimento_pessoa)
        }
      } else {
        // Reset to default
        formData.value = {
          tipo_pessoa: 1,
        }
      }
      activeTab.value = 'gerais'
    }
  },
)

const handleCpfCnpjInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value
  if (formData.value.tipo_pessoa === 1) {
    formData.value.cpfcnpj_pessoa = maskCPF(value)
  } else {
    formData.value.cpfcnpj_pessoa = maskCNPJ(value)
  }
  // Clear error on input
  if (errors.value.cpfcnpj_pessoa) delete errors.value.cpfcnpj_pessoa
}

const handlePhoneInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  formData.value.telefone1_pessoa = maskPhone(input.value)
  if (errors.value.telefone1_pessoa) delete errors.value.telefone1_pessoa
}

const validateCpfCnpj = () => {
  const value = formData.value.cpfcnpj_pessoa
  if (!value) return

  const isValid = formData.value.tipo_pessoa === 1 
    ? validateCPF(value) 
    : validateCNPJ(value)

  if (!isValid) {
    errors.value.cpfcnpj_pessoa = formData.value.tipo_pessoa === 1 
      ? 'CPF inválido' 
      : 'CNPJ inválido'
  }
}

const validateEmailField = () => {
  const value = formData.value.email_pessoa
  if (!value) return
  
  if (!validateEmail(value)) {
    errors.value.email_pessoa = 'E-mail inválido'
  } else {
    delete errors.value.email_pessoa
  }
}

const validatePhoneField = () => {
  const value = formData.value.telefone1_pessoa
  if (!value) return

  if (!validatePhone(value)) {
    errors.value.telefone1_pessoa = 'Telefone inválido (10 ou 11 dígitos)'
  }
}

const handleSave = async () => {
  if (props.loading) {
    return
  }
  
  // Validate all fields before saving
  validateCpfCnpj()
  validateEmailField()
  validatePhoneField()

  if (Object.keys(errors.value).length > 0) {
    // alert('Por favor, corrija os erros antes de salvar.')
    return
  }

  if (!formData.value.nomerazao_pessoa) {
    alert('A Razão Social / Nome é obrigatória.')
    return
  }
  
  // Clean masks before emitting save
  const payload = { ...formData.value }
  
  if (payload.cpfcnpj_pessoa) {
    payload.cpfcnpj_pessoa = payload.cpfcnpj_pessoa.replace(/\D/g, '')
  }
  
  if (payload.telefone1_pessoa) {
    payload.telefone1_pessoa = payload.telefone1_pessoa.replace(/\D/g, '')
  }
  
  emit('save', payload)
}

// Municipios
const municipios = ref<Municipio[]>([])

const fetchMunicipios = async () => {
  try {
    const response = await municipioService.getAll(1, 1000)
    municipios.value = response.data.data
  } catch (error) {
    console.error('Erro ao buscar municípios:', error)
  }
}

onMounted(() => {
  fetchMunicipios()
})

const municipioOptions = computed(() => {
  return municipios.value.map((m) => ({
    value: m.id,
    label: `${m.nome} - ${m.estado?.sigla || ''}`,
  }))
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Parceiro' : 'Novo Parceiro' }}
        </h2>
        <button @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-100 px-6 pt-2">
        <button @click="activeTab = 'gerais'"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none flex items-center gap-2"
          :class="activeTab === 'gerais' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'">
          <User class="w-4 h-4" />
          Dados Gerais
        </button>
        <button @click="activeTab = 'enderecos'"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none flex items-center gap-2"
          :class="activeTab === 'enderecos' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'">
          <MapPin class="w-4 h-4" />
          Endereços
        </button>
        <button @click="activeTab = 'nfe'"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none flex items-center gap-2"
          :class="activeTab === 'nfe' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'">
          <FileText class="w-4 h-4" />
          NF-e
        </button>
        <button @click="activeTab = 'lcdpr'"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none flex items-center gap-2"
          :class="activeTab === 'lcdpr' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'">
          <Building class="w-4 h-4" />
          Movimento LCDPR
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar">
        <div v-show="activeTab === 'gerais'" class="space-y-8">

          <!-- Section: Identificação -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <Hash class="w-5 h-5 text-gray-500" />
              Identificação e Classificação
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Tipo de cadastro</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User class="h-4 w-4 text-gray-400" />
                  </div>
                  <select v-model="formData.tipo_pessoa"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white appearance-none">
                    <option :value="1">Pessoa Física</option>
                    <option :value="2">Pessoa Jurídica</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">
                  {{ formData.tipo_pessoa === 2 ? 'CNPJ' : 'CPF' }}
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText class="h-4 w-4 text-gray-400" />
                  </div>
                  <input :value="formData.cpfcnpj_pessoa" @input="handleCpfCnpjInput" @blur="validateCpfCnpj"
                    type="text" :placeholder="formData.tipo_pessoa === 2 ? '00.000.000/0000-00' : '000.000.000-00'"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400"
                    :class="{ 'border-red-500': errors.cpfcnpj_pessoa }" />
                </div>
                <span v-if="errors.cpfcnpj_pessoa" class="text-xs text-red-500 mt-1">{{ errors.cpfcnpj_pessoa }}</span>
              </div>
            </div>

            <!-- Partner Types Grid -->
            <div class="mt-6">
              <label class="block text-sm font-bold text-gray-700 mb-3">Tipos de Parceiro</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <label
                  class="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 hover:border-gray-200 transition-all">
                  <input type="checkbox" v-model="formData.cliente_pessoa"
                    class="rounded border-gray-300 text-black focus:ring-black h-4 w-4">
                  <span class="text-sm text-gray-700">Cliente</span>
                </label>
                <label
                  class="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 hover:border-gray-200 transition-all">
                  <input type="checkbox" v-model="formData.produtor_pessoa"
                    class="rounded border-gray-300 text-black focus:ring-black h-4 w-4">
                  <span class="text-sm text-gray-700">Produtor</span>
                </label>
                <label
                  class="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 hover:border-gray-200 transition-all">
                  <input type="checkbox" v-model="formData.fornecedor_pessoa"
                    class="rounded border-gray-300 text-black focus:ring-black h-4 w-4">
                  <span class="text-sm text-gray-700">Fornecedor</span>
                </label>
                <label
                  class="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 hover:border-gray-200 transition-all">
                  <input type="checkbox" v-model="formData.funcionario_pessoa"
                    class="rounded border-gray-300 text-black focus:ring-black h-4 w-4">
                  <span class="text-sm text-gray-700">Funcionário</span>
                </label>
                <label
                  class="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 hover:border-gray-200 transition-all">
                  <input type="checkbox" v-model="formData.motorista_pessoa"
                    class="rounded border-gray-300 text-black focus:ring-black h-4 w-4">
                  <span class="text-sm text-gray-700">Motorista</span>
                </label>
                <label
                  class="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 hover:border-gray-200 transition-all">
                  <input type="checkbox" v-model="formData.operador_pessoa"
                    class="rounded border-gray-300 text-black focus:ring-black h-4 w-4">
                  <span class="text-sm text-gray-700">Operador</span>
                </label>
                <label
                  class="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 hover:border-gray-200 transition-all">
                  <input type="checkbox" v-model="formData.portador_pessoa"
                    class="rounded border-gray-300 text-black focus:ring-black h-4 w-4">
                  <span class="text-sm text-gray-700">Portador</span>
                </label>
              </div>
            </div>
          </section>

          <!-- Section: Dados Principais -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <Building class="w-5 h-5 text-gray-500" />
              Dados Principais
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Razão Social / Nome</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.nomerazao_pessoa" type="text" placeholder="Nome completo ou Razão Social"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Nome Fantasia</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.nomefantasia_pessoa" type="text" placeholder="Nome comercial"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400" />
                </div>
              </div>
            </div>
          </section>

          <!-- Section: Contato -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <Phone class="w-5 h-5 text-gray-500" />
              Contato
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-1">
                <label class="block text-sm font-bold text-gray-700 mb-2">E-Mail</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.email_pessoa" type="email" placeholder="exemplo@email.com"
                    @blur="validateEmailField"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400"
                    :class="{ 'border-red-500': errors.email_pessoa }" />
                </div>
                <span v-if="errors.email_pessoa" class="text-xs text-red-500 mt-1">{{ errors.email_pessoa }}</span>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Telefone Principal</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone class="h-4 w-4 text-gray-400" />
                  </div>
                  <input :value="formData.telefone1_pessoa" @input="handlePhoneInput" @blur="validatePhoneField"
                    type="text" placeholder="(00) 00000-0000"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400"
                    :class="{ 'border-red-500': errors.telefone1_pessoa }" />
                </div>
                <span v-if="errors.telefone1_pessoa" class="text-xs text-red-500 mt-1">{{ errors.telefone1_pessoa }}</span>
              </div>
            </div>
          </section>

          <!-- Section: Documentos Pessoais (Collapsible logic or just grouped) -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <FileText class="w-5 h-5 text-gray-500" />
              Documentação
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Data Nascimento</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.nascimento_pessoa" type="date"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Identidade (RG)</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.identidade_pessoa" type="text" placeholder="Número do RG"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Órgão Emissor</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.orgaoidentidade_pessoa" type="text" placeholder="Ex: SSP/SP"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400" />
                </div>
              </div>
            </div>
          </section>

          <!-- Section: Endereço -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <MapPin class="w-5 h-5 text-gray-500" />
              Endereço Principal
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div class="md:col-span-3">
                <label class="block text-sm font-bold text-gray-700 mb-2">CEP</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.cep_pessoa" type="text" placeholder="00000-000"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400" />
                </div>
              </div>

              <div class="md:col-span-4">
                <BaseAutocomplete label="Município" v-model="formData.idMunicipio" :options="municipioOptions"
                  placeholder="Selecione o município">
                  <template #prefix>
                    <MapPin class="h-4 w-4 text-gray-400" />
                  </template>
                </BaseAutocomplete>
              </div>

              <div class="md:col-span-5">
                <label class="block text-sm font-bold text-gray-700 mb-2">Endereço</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.endereco_pessoa" type="text" placeholder="Rua, Avenida, Travessa..."
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400" />
                </div>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-bold text-gray-700 mb-2">Número</label>
                <input v-model="formData.numero_pessoa" type="text" placeholder="S/N"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400" />
              </div>

              <div class="md:col-span-5">
                <label class="block text-sm font-bold text-gray-700 mb-2">Bairro</label>
                <input v-model="formData.bairro_pessoa" type="text" placeholder="Bairro"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400" />
              </div>

              <div class="md:col-span-5">
                <label class="block text-sm font-bold text-gray-700 mb-2">Complemento</label>
                <input v-model="formData.complemento_pessoa" type="text" placeholder="Apto, Bloco, Sala..."
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400" />
              </div>
            </div>
          </section>

          <!-- Section: Observações -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <FileText class="w-5 h-5 text-gray-500" />
              Observações
            </h3>
            <div>
              <div class="relative">
                <div class="absolute top-3 left-3 flex items-start pointer-events-none">
                  <FileText class="h-4 w-4 text-gray-400" />
                </div>
                <textarea v-model="formData.observacao_pessoa" rows="4"
                  placeholder="Informações adicionais sobre o parceiro..."
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400 resize-none"></textarea>
              </div>
            </div>
          </section>

        </div>

        <!-- Outras Abas (Placeholder) -->
        <div v-show="activeTab !== 'gerais'" class="flex items-center justify-center h-64 text-gray-500">
          <div class="text-center">
            <Briefcase class="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Conteúdo da aba {{ activeTab }} em desenvolvimento</p>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
        <button @click="$emit('close')"
          class="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
          Cancelar
        </button>
        <button @click="handleSave" :disabled="props.loading"
          class="bg-lime-600 hover:bg-lime-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          <span v-if="props.loading" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
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
