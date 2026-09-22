<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Save, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-vue-next'
import type {
  TipoAtividadeOS,
  CreateTipoAtividadeOSPayload,
  CampoCondicionalTipoAtividade,
} from '@/types/TipoAtividadeOS'
import { CategoriaAtividadeOS, TipoCampoCondicional } from '@/types/TipoAtividadeOS'

const props = defineProps<{
  isOpen: boolean
  initialData?: TipoAtividadeOS | null
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [payload: CreateTipoAtividadeOSPayload]
}>()

const categoriaOptions = [
  { value: CategoriaAtividadeOS.AGRICOLA, label: 'Agrícola' },
  { value: CategoriaAtividadeOS.PECUARIA, label: 'Pecuária' },
  { value: CategoriaAtividadeOS.ADMINISTRATIVA, label: 'Administrativa' },
  { value: CategoriaAtividadeOS.MANUTENCAO, label: 'Manutenção' },
]

const tipoCampoOptions = [
  { value: TipoCampoCondicional.TEXT, label: 'Texto' },
  { value: TipoCampoCondicional.NUMBER, label: 'Número' },
  { value: TipoCampoCondicional.DATE, label: 'Data' },
  { value: TipoCampoCondicional.BOOLEAN, label: 'Sim/Não' },
  { value: TipoCampoCondicional.SELECT, label: 'Seleção' },
]

interface CampoForm {
  rotulo: string
  nomeCampo: string
  tipoCampo: TipoCampoCondicional
  obrigatorio: boolean
  unidade: string
  ordem: number
  opcoesTexto: string
  ativo: boolean
}

const nome = ref('')
const categoria = ref<CategoriaAtividadeOS>(CategoriaAtividadeOS.AGRICOLA)
const descricao = ref('')
const icone = ref('')
const cor = ref('#16a34a')
const ativo = ref(true)
const campos = ref<CampoForm[]>([])

const resetForm = () => {
  nome.value = ''
  categoria.value = CategoriaAtividadeOS.AGRICOLA
  descricao.value = ''
  icone.value = ''
  cor.value = '#16a34a'
  ativo.value = true
  campos.value = []
}

const loadFromData = (data: TipoAtividadeOS) => {
  nome.value = data.nome
  categoria.value = data.categoria
  descricao.value = data.descricao || ''
  icone.value = data.icone || ''
  cor.value = data.cor || '#16a34a'
  ativo.value = data.ativo
  campos.value = (data.camposCondicionais || []).map((c) => ({
    rotulo: c.rotulo,
    nomeCampo: c.nomeCampo,
    tipoCampo: c.tipoCampo,
    obrigatorio: c.obrigatorio,
    unidade: c.unidade || '',
    ordem: c.ordem,
    opcoesTexto: c.opcoes ? c.opcoes.join(', ') : '',
    ativo: c.ativo,
  }))
}

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.initialData) {
        loadFromData(props.initialData)
      } else {
        resetForm()
      }
    }
  }
)

const addCampo = () => {
  campos.value.push({
    rotulo: '',
    nomeCampo: '',
    tipoCampo: TipoCampoCondicional.TEXT,
    obrigatorio: false,
    unidade: '',
    ordem: campos.value.length + 1,
    opcoesTexto: '',
    ativo: true,
  })
}

const removeCampo = (index: number) => {
  const campo = campos.value[index]
  if (!campo) return
  if (campo.rotulo.trim() && !confirm(`Remover o campo "${campo.rotulo}"?`)) return
  campos.value.splice(index, 1)
  campos.value.forEach((c, i) => {
    c.ordem = i + 1
  })
}

const moveCampoUp = (index: number) => {
  if (index <= 0) return
  const temp = campos.value[index]!
  campos.value[index] = campos.value[index - 1]!
  campos.value[index - 1] = temp
  campos.value.forEach((c, i) => {
    c.ordem = i + 1
  })
}

const moveCampoDown = (index: number) => {
  if (index >= campos.value.length - 1) return
  const temp = campos.value[index]!
  campos.value[index] = campos.value[index + 1]!
  campos.value[index + 1] = temp
  campos.value.forEach((c, i) => {
    c.ordem = i + 1
  })
}

const handleSave = () => {
  if (props.loading) return

  if (!nome.value.trim()) {
    alert('O nome é obrigatório.')
    return
  }
  if (!categoria.value) {
    alert('A categoria é obrigatória.')
    return
  }

  for (let i = 0; i < campos.value.length; i++) {
    const c = campos.value[i]!
    if (!c.rotulo.trim()) {
      alert(`O rótulo do campo ${i + 1} é obrigatório.`)
      return
    }
    if (!c.tipoCampo) {
      alert(`O tipo do campo ${i + 1} é obrigatório.`)
      return
    }
    if (c.tipoCampo === TipoCampoCondicional.SELECT && !c.opcoesTexto.trim()) {
      alert(`As opções do campo "${c.rotulo}" são obrigatórias para tipo Seleção.`)
      return
    }
  }

  const camposCondicionais = campos.value.map((c) => ({
    rotulo: c.rotulo,
    nomeCampo: c.nomeCampo || c.rotulo.toLowerCase().replace(/\s+/g, '_'),
    tipoCampo: c.tipoCampo,
    obrigatorio: c.obrigatorio,
    opcoes:
      c.tipoCampo === TipoCampoCondicional.SELECT && c.opcoesTexto
        ? c.opcoesTexto.split(',').map((o) => o.trim()).filter(Boolean)
        : null,
    unidade: c.unidade || null,
    ordem: c.ordem,
    ativo: c.ativo,
  }))

  const payload: CreateTipoAtividadeOSPayload = {
    nome: nome.value.trim(),
    categoria: categoria.value,
    descricao: descricao.value.trim() || undefined,
    icone: icone.value.trim() || undefined,
    cor: cor.value || undefined,
    ativo: ativo.value,
    camposCondicionais,
  }

  emit('save', payload)
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div
      class="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Tipo de Atividade' : 'Novo Tipo de Atividade' }}
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
          <!-- Nome + Categoria -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Nome *</label>
              <input
                v-model="nome"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                placeholder="Nome do tipo de atividade"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Categoria *</label>
              <select
                v-model="categoria"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
              >
                <option v-for="opt in categoriaOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Descrição -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
            <textarea
              v-model="descricao"
              rows="3"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none placeholder-gray-400"
              placeholder="Descrição opcional do tipo de atividade..."
            ></textarea>
          </div>

          <!-- Ícone + Cor + Ativo -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Ícone</label>
              <input
                v-model="icone"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                placeholder="Ex: tractor, leaf"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Cor</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="cor"
                  type="color"
                  class="h-10 w-12 border border-gray-200 rounded-lg cursor-pointer"
                />
                <input
                  v-model="cor"
                  type="text"
                  class="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                  placeholder="#16a34a"
                />
              </div>
            </div>
            <div class="flex items-end">
              <label
                class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all w-full"
              >
                <input
                  v-model="ativo"
                  type="checkbox"
                  class="h-5 w-5 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                />
                <span class="text-sm text-gray-700 font-medium">Ativo</span>
              </label>
            </div>
          </div>

          <!-- Campos Condicionais -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <label class="text-sm font-bold text-gray-700">Campos Condicionais</label>
              <button
                @click="addCampo"
                type="button"
                class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-lime-700 bg-lime-50 border border-lime-200 rounded-lg hover:bg-lime-100 transition-colors"
              >
                <Plus class="h-3.5 w-3.5 mr-1" />
                Adicionar Campo
              </button>
            </div>

            <div v-if="campos.length === 0" class="text-sm text-gray-400 text-center py-4">
              Nenhum campo condicional adicionado.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(campo, index) in campos"
                :key="index"
                class="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-500 uppercase">
                    Campo {{ index + 1 }}
                  </span>
                  <div class="flex items-center gap-1">
                    <button
                      @click="moveCampoUp(index)"
                      type="button"
                      :disabled="index === 0"
                      class="p-1 text-gray-400 hover:text-lime-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover para cima"
                    >
                      <ChevronUp class="h-4 w-4" />
                    </button>
                    <button
                      @click="moveCampoDown(index)"
                      type="button"
                      :disabled="index === campos.length - 1"
                      class="p-1 text-gray-400 hover:text-lime-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover para baixo"
                    >
                      <ChevronDown class="h-4 w-4" />
                    </button>
                    <button
                      @click="removeCampo(index)"
                      type="button"
                      class="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remover campo"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <!-- Rótulo -->
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Rotulo *</label>
                    <input
                      v-model="campo.rotulo"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      placeholder="Ex: Dosagem"
                    />
                  </div>

                  <!-- Nome Campo (camelCase) -->
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Nome Campo (camelCase)</label>
                    <input
                      v-model="campo.nomeCampo"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      placeholder="Ex: dosagem"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <!-- Tipo -->
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Tipo *</label>
                    <select
                      v-model="campo.tipoCampo"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    >
                      <option
                        v-for="tipo in tipoCampoOptions"
                        :key="tipo.value"
                        :value="tipo.value"
                      >
                        {{ tipo.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Unidade -->
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Unidade</label>
                    <input
                      v-model="campo.unidade"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      placeholder="Ex: kg/ha"
                    />
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="campo.obrigatorio"
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                    />
                    <span class="text-xs text-gray-600">Obrigatorio</span>
                  </label>

                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="campo.ativo"
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                    />
                    <span class="text-xs text-gray-600">Ativo</span>
                  </label>
                </div>

                <!-- Opções (apenas para SELECT) -->
                <div v-if="campo.tipoCampo === 'SELECT'">
                  <label class="block text-xs font-medium text-gray-600 mb-1">
                    Opcoes (separadas por virgula) *
                  </label>
                  <textarea
                    v-model="campo.opcoesTexto"
                    rows="2"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none"
                    placeholder="Ex: Opcao A, Opcao B, Opcao C"
                  ></textarea>
                </div>

                <!-- Preview visual -->
                <div class="mt-2 p-2 bg-white border border-dashed border-gray-300 rounded-lg">
                  <p class="text-xs text-gray-400 mb-1">Preview:</p>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-medium text-gray-700">
                      {{ campo.rotulo || 'Rotulo' }}
                      <span v-if="campo.obrigatorio" class="text-red-500">*</span>
                      <span v-if="campo.unidade" class="text-gray-400 ml-1">({{ campo.unidade }})</span>
                    </span>
                    <span class="text-xs text-gray-400">
                      [{{ tipoCampoOptions.find(t => t.value === campo.tipoCampo)?.label || campo.tipoCampo }}]
                    </span>
                  </div>
                </div>
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
          class="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
