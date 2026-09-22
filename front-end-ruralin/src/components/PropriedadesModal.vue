<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  X,
  Plus,
  Hash,
  FileText,
  MapPin,
  Phone,
  User,
  Calendar,
  Layers,
  Save
} from 'lucide-vue-next'
import type { Propriedade } from '../types/Propriedade'
import type { Municipio } from '../types/Municipio'
import type { ParceiroNegocio } from '../types/ParceiroNegocio'
import BaseAutocomplete from './BaseAutocomplete.vue'
import { municipioService } from '../services/municipioService'
import { parceiroNegocioService } from '../services/parceiroNegocioService'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  isOpen: boolean
  initialData?: Propriedade | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const activeTab = ref('informacoes')

const formData = ref<Propriedade>({
  idPessoa: 0,
  descricao: '',
  endereco: '',
  complemento: '',
  idMunicipio: 0,
  inscricaoEstadual: '',
  areaTotal: 0,
  areaCultivada: 0,
  reservaLegal: 0,
  telefone: '',
  gerente: '',
  matricula: '',
  livro: '',
  folha: '',
  itr: '',
  cei: '',
  lcdprTipoExploracao: null,
  lcdprParticipacao: 0,
  arrendada: false,
  idPessoaArrendamento: null,
  documento: '',
  dataInicio: '1900-01-01',
  dataFim: '1900-01-01',
  observacoes: '',
  movimentaLCDPR: false,
  movimentaGado: false
})

const municipiosOptions = ref<{ value: number; label: string }[]>([])

const fetchMunicipios = async () => {
  try {
    const result = await municipioService.getAll(1, 1000)
    municipiosOptions.value = result.data.data.map((m: Municipio) => ({
      value: m.id,
      label: `${m.nome} - ${m.estado?.sigla || 'N/A'}`
    }))
  } catch (error) {
    console.error('Erro ao buscar municípios:', error)
  }
}

const pessoasOptions = ref<{ value: number; label: string }[]>([])

const fetchProprietarios = async () => {
  try {
    const result = await parceiroNegocioService.getAllNoPagination()
    pessoasOptions.value = result.data
      .filter((p: ParceiroNegocio) => p.produtor_pessoa)
      .map((p: ParceiroNegocio) => ({
        value: p.id_pessoa || 0,
        label: `${p.nomefantasia_pessoa || p.nomerazao_pessoa || 'Sem Nome'} - ${p.cpfcnpj_pessoa || 'N/A'}`
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  } catch (error) {
    console.error('Erro ao buscar proprietários:', error)
    toast.error('Erro ao carregar proprietários.')
  }
}

const tabs = [
  { id: 'informacoes', label: 'Informações', icon: FileText },
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
          idPessoa: 0,
          descricao: '',
          endereco: '',
          complemento: '',
          idMunicipio: 0,
          inscricaoEstadual: '',
          areaTotal: 0,
          areaCultivada: 0,
          reservaLegal: 0,
          telefone: '',
          gerente: '',
          matricula: '',
          livro: '',
          folha: '',
          itr: '',
          cei: '',
          lcdprTipoExploracao: null,
          lcdprParticipacao: 0,
          arrendada: false,
          idPessoaArrendamento: null,
          documento: '',
          dataInicio: '1900-01-01',
          dataFim: '1900-01-01',
          observacoes: '',
          movimentaLCDPR: false,
          movimentaGado: false
        }
      }
      activeTab.value = 'informacoes'
    }
  }
)

onMounted(() => {
  fetchMunicipios()
  fetchProprietarios()
})

const handleSave = () => {
  if (props.loading) return
  if (!formData.value.descricao) {
    alert('A descrição é obrigatória.')
    return
  }
  if (!formData.value.idPessoa) {
    alert('O proprietário é obrigatório.')
    return
  }
  if (!formData.value.idMunicipio) {
    alert('O município é obrigatório.')
    return
  }
  if (!formData.value.dataInicio) {
    alert('A data de início é obrigatória.')
    return
  }
  if (!formData.value.dataFim) {
    alert('A data de fim é obrigatória.')
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
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Propriedade' : 'Nova Propriedade' }}
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

          <!-- Section: Identificação -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <Hash class="w-5 h-5 text-gray-500" />
              Identificação
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              <!-- Proprietário Principal -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Proprietário Principal <span class="text-red-500">*</span></label>
                <div class="flex gap-2">
                  <BaseAutocomplete v-model="formData.idPessoa" :options="pessoasOptions"
                    placeholder="Selecione..." class="w-full">
                    <template #prefix>
                      <User class="h-4 w-4 text-gray-400" />
                    </template>
                  </BaseAutocomplete>
                </div>
              </div>

              <!-- Descrição -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Descrição <span class="text-red-500">*</span></label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.descricao" type="text"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Nome da propriedade">
                </div>
              </div>

              <!-- Inscrição Estadual -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Inscrição Estadual</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.inscricaoEstadual" type="text"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400">
                </div>
              </div>
              
              <!-- ITR -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">ITR</label>
                <input v-model="formData.itr" type="text"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all">
              </div>

              <!-- CEI -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">CEI</label>
                <input v-model="formData.cei" type="text"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all">
              </div>

              <!-- Matrícula -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Matrícula</label>
                <input v-model="formData.matricula" type="text"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all">
              </div>

              <!-- Livro -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Livro</label>
                <input v-model="formData.livro" type="text"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all">
              </div>

              <!-- Folha -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Folha</label>
                <input v-model="formData.folha" type="text"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all">
              </div>

            </div>
          </section>

          <!-- Section: Localização -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <MapPin class="w-5 h-5 text-gray-500" />
              Localização
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
              <!-- Endereço -->
              <div class="md:col-span-5">
                <label class="block text-sm font-bold text-gray-700 mb-2">Endereço</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.endereco" type="text"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400">
                </div>
              </div>

              <!-- Complemento -->
              <div class="md:col-span-3">
                <label class="block text-sm font-bold text-gray-700 mb-2">Complemento</label>
                <input v-model="formData.complemento" type="text"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400">
              </div>

              <!-- Município -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Município <span class="text-red-500">*</span></label>
                <div class="flex gap-2">
                  <BaseAutocomplete v-model="formData.idMunicipio" :options="municipiosOptions"
                    placeholder="Selecione..." class="w-full">
                    <template #prefix>
                      <MapPin class="h-4 w-4 text-gray-400" />
                    </template>
                  </BaseAutocomplete>
                </div>
              </div>
            </div>
          </section>

          <!-- Section: Dados Operacionais -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <Layers class="w-5 h-5 text-gray-500" />
              Dados Operacionais
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
              <!-- Áreas -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Área Total (HA)</label>
                <input v-model="formData.areaTotal" type="number" step="0.01"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right">
              </div>
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Área Cultivada (HA)</label>
                <input v-model="formData.areaCultivada" type="number" step="0.01"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right">
              </div>
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-2">Reserva Legal (HA)</label>
                <input v-model="formData.reservaLegal" type="number" step="0.01"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right">
              </div>

              <!-- Gerente -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Gerente</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.gerente" type="text"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400">
                </div>
              </div>
              <!-- Telefone -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Telefone</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone class="h-4 w-4 text-gray-400" />
                  </div>
                  <input v-model="formData.telefone" type="text"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400">
                </div>
              </div>

              <!-- Configurações (Checkboxes) -->
              <div class="md:col-span-12 pt-2">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label
                    class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all">
                    <input v-model="formData.movimentaLCDPR" type="checkbox"
                      class="h-5 w-5 rounded border-gray-300 text-lime-600 focus:ring-lime-500">
                    <span class="text-sm text-gray-700 font-medium">Movimenta LCDPR</span>
                  </label>
                  <label
                    class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all">
                    <input v-model="formData.movimentaGado" type="checkbox"
                      class="h-5 w-5 rounded border-gray-300 text-lime-600 focus:ring-lime-500">
                    <span class="text-sm text-gray-700 font-medium">Movimenta Gado</span>
                  </label>
                </div>
              </div>

              <!-- LCDPR Fields (Conditional) -->
              <div v-if="formData.movimentaLCDPR" class="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                <div>
                   <label class="block text-sm font-bold text-gray-700 mb-2">Participação LCDPR (%)</label>
                   <input v-model="formData.lcdprParticipacao" type="number" step="0.01"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right">
                </div>
                 <div>
                   <label class="block text-sm font-bold text-gray-700 mb-2">Tipo Exploração</label>
                   <select v-model="formData.lcdprTipoExploracao" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all">
                      <option :value="null">Selecione...</option>
                      <option :value="1">Exploração individual</option>
                      <option :value="2">Condomínio</option>
                      <option :value="3">Imóvel arrendado</option>
                      <option :value="4">Parceria</option>
                      <option :value="5">Comodato</option>
                   </select>
                </div>
              </div>

            </div>
          </section>

          <!-- Section: Arrendamento -->
          <section>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <FileText class="w-5 h-5 text-gray-500" />
              Arrendamento
            </h3>
            <div class="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="formData.arrendada" type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500">
                <span class="text-sm text-gray-700 font-medium">Propriedade arrendada?</span>
              </label>

              <div v-if="formData.arrendada"
                class="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-top-2 duration-200 pt-2">
                <div class="md:col-span-5">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Proprietário (Arrendador)</label>
                  <div class="flex gap-2">
                    <BaseAutocomplete v-model="formData.idPessoaArrendamento" :options="pessoasOptions"
                      placeholder="Selecione..." class="w-full">
                      <template #prefix>
                        <User class="h-4 w-4 text-gray-400" />
                      </template>
                    </BaseAutocomplete>
                    <button
                      class="p-2.5 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors shadow-sm">
                      <Plus class="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div class="md:col-span-3">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Documento</label>
                  <input v-model="formData.documento" type="text"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all">
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Data início <span class="text-red-500">*</span></label>
                  <input v-model="formData.dataInicio" type="date"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all">
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Data fim <span class="text-red-500">*</span></label>
                  <input v-model="formData.dataFim" type="date"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all">
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
        <button @click="$emit('close')"
          class="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
          Cancelar
        </button>
        <button @click="handleSave" :disabled="props.loading"
          class="inline-flex items-center bg-lime-600 hover:bg-lime-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
          <span v-if="props.loading" class="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          <Save v-else class="w-4 h-4 mr-2" />
          {{ props.loading ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>

    </div>
  </div>
</template>
