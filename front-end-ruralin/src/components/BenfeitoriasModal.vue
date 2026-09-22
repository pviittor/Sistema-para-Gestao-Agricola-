<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import {
  X,
  FileText,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  TrendingDown,
  Ruler,
  Save,
  Sprout,
  Package,
  Plus,
  Trash2,
  Edit2
} from 'lucide-vue-next'
import type { Benfeitoria } from '../types/Benfeitoria'
import type { UnidadeMedida } from '../types/UnidadeMedida'
import type { Safra } from '../types/Safra'
import type { Produto } from '../types/Produto'
import type { ProdutoBenfeitoria } from '../types/ProdutoBenfeitoria'
import BaseAutocomplete from './BaseAutocomplete.vue'
import { propriedadeService } from '../services/propriedadeService'
import { unidadeMedidaService } from '../services/unidadeMedidaService'
import { safraService } from '../services/safraService'
import { produtoService } from '../services/produtoService'
import { produtoBenfeitoriaService } from '../services/produtoBenfeitoriaService'

const props = defineProps<{
  isOpen: boolean
  initialData?: Benfeitoria | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const activeTab = ref<'geral' | 'produtos'>('geral')
const produtosBenfeitoria = ref<ProdutoBenfeitoria[]>([])
const loadingProdutos = ref(false)
const itemEmEdicao = ref<number | null>(null)
const itemErrorMessage = ref<string | null>(null)

const defaultForm = (): Benfeitoria => ({
  descricao: '',
  valortotal: 0,
  vidautil: 0,
  percsucata: 0,
  depreciacaoano: 0,
  taxamanutencao: 0,
  manutencaoano: 0,
  idFazenda: 0,
  idUnidadeMedida: null,
  idSafra: null,
  data: null,
  observacao: null,
})

const defaultItemForm = (): ProdutoBenfeitoria => ({
  idBenfeitoria: 0,
  idProduto: 0,
  data: new Date().toISOString().split('T')[0] ?? '',
  quantidade: 0,
  unitario: 0,
  observacao: '',
  idSafra: null,
})

const formData = ref<Benfeitoria>(defaultForm())
const itemForm = ref<ProdutoBenfeitoria>(defaultItemForm())

// Helpers de formatação moeda
const formatarMoedaDisplay = (valor: number | null | undefined): string => {
  if (!valor) return ''
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor)
}

const parseMoeda = (valor: string): number => {
  const limpo = valor.replace(/\./g, '').replace(',', '.')
  const num = parseFloat(limpo)
  return isNaN(num) ? 0 : num
}

// Display refs para campos monetários
const valortotalDisplay = ref('')
const depreciacaoanoDisplay = ref('')
const manutencaoanoDisplay = ref('')
const itemUnitarioDisplay = ref('')

const onValortotalBlur = () => {
  const num = parseMoeda(valortotalDisplay.value)
  formData.value.valortotal = num
  valortotalDisplay.value = num > 0 ? formatarMoedaDisplay(num) : ''
}
const onDepreciacaoanoBlur = () => {
  const num = parseMoeda(depreciacaoanoDisplay.value)
  formData.value.depreciacaoano = num
  depreciacaoanoDisplay.value = num > 0 ? formatarMoedaDisplay(num) : ''
}
const onManutencaoanoBlur = () => {
  const num = parseMoeda(manutencaoanoDisplay.value)
  formData.value.manutencaoano = num
  manutencaoanoDisplay.value = num > 0 ? formatarMoedaDisplay(num) : ''
}
const onItemUnitarioBlur = () => {
  const num = parseMoeda(itemUnitarioDisplay.value)
  itemForm.value.unitario = num
  itemUnitarioDisplay.value = num > 0 ? formatarMoedaDisplay(num) : ''
}

// Options
const fazendasOptions = ref<{ value: number; label: string }[]>([])
const unidadesOptions = ref<{ value: number; label: string }[]>([])
const safrasOptions = ref<{ value: number; label: string }[]>([])
const produtosOptions = ref<{ value: number; label: string }[]>([])

const loadOptions = async () => {
  try {
    const [fazendas, unidades, safras, produtos] = await Promise.all([
      propriedadeService.getAllNoPagination(),
      unidadeMedidaService.getAllNoPagination(),
      safraService.getAllNoPagination(),
      produtoService.getAllNoPagination()
    ])

    const fazendasData = (fazendas as any).data || fazendas
    fazendasOptions.value = (Array.isArray(fazendasData) ? fazendasData : [])
      .filter((f: any) => f.id && f.descricao)
      .map((f: any) => ({
        value: f.id!,
        label: `${f.id} - ${f.descricao}`,
      }))

    const unidadesData = (unidades as any).data || unidades
    unidadesOptions.value = (Array.isArray(unidadesData) ? unidadesData : [])
      .filter((u: any) => u.id_unidade && u.descricao_unidade)
      .map((u: any) => ({
        value: u.id_unidade!,
        label: `${u.descricao_unidade} (${u.abreviatura_unidade})`,
      }))

    const safrasData = (safras as any).data || safras
    safrasOptions.value = (Array.isArray(safrasData) ? safrasData : [])
      .filter((s: any) => s.id && s.nome)
      .map((s: any) => ({
        value: s.id!,
        label: s.nome,
      }))
    
    const produtosData = (produtos as any).data || produtos
    produtosOptions.value = (Array.isArray(produtosData) ? produtosData : [])
      .filter((p: Produto) => p.id_prod && p.descricao_prod)
      .map((p: Produto) => ({
        value: p.id_prod!,
        label: p.descricao_prod,
      }))
  } catch (error) {
    console.error('Erro ao carregar opções em BenfeitoriasModal:', error)
  }
}

onMounted(() => {
  loadOptions()
})

const loadProdutosBenfeitoria = async (idBenfeitoria: number) => {
  loadingProdutos.value = true
  try {
    const result = await produtoBenfeitoriaService.getAll(1, 1000)
    produtosBenfeitoria.value = result.data.filter(p => p.idBenfeitoria === idBenfeitoria)
  } catch (error) {
    console.error('Erro ao carregar produtos da benfeitoria:', error)
  } finally {
    loadingProdutos.value = false
  }
}

const saveItem = async () => {
  itemErrorMessage.value = null
  if (!itemForm.value.idProduto || !itemForm.value.quantidade || !itemForm.value.unitario) {
    itemErrorMessage.value = 'Preencha os campos obrigatórios (Produto, Quantidade, Valor Unitário)'
    return
  }

  try {
    const payload: any = {
      ...itemForm.value,
      quantidade: Number(itemForm.value.quantidade),
      unitario: Number(itemForm.value.unitario),
      idBenfeitoria: formData.value.id_benf!,
      // Garante que a data esteja no formato correto (YYYY-MM-DD)
      data: itemForm.value.data ? itemForm.value.data.split('T')[0] : new Date().toISOString().split('T')[0]
    }

    // Remove campos opcionais vazios ou nulos para evitar erro 400
    if (!payload.idSafra) delete payload.idSafra
    if (!payload.observacao) delete payload.observacao
    
    // Remove campos de controle de UI ou relacionamentos que não devem ir para o backend
    delete payload.produto
    delete payload.safra
    delete payload.benfeitoria
    delete payload.usuarioCriador
    delete payload.id_prodbenf // Se for criação, não deve ir id
    delete payload.tenantId
    delete payload.usercreation
    delete payload.datecreation

    if (itemEmEdicao.value) {
      await produtoBenfeitoriaService.update(itemEmEdicao.value, payload)
    } else {
      await produtoBenfeitoriaService.create(payload)
    }
    
    await loadProdutosBenfeitoria(formData.value.id_benf!)
    cancelEdit()
  } catch (error: any) {
    console.error('Erro ao salvar item:', error)
    if (error.response && error.response.data) {
      const errorData = error.response.data
      if (errorData.error && errorData.error.message) {
        itemErrorMessage.value = errorData.error.message
      } else if (errorData.message) {
        itemErrorMessage.value = errorData.message
      } else {
        itemErrorMessage.value = `Erro ao salvar item: ${JSON.stringify(errorData)}`
      }
    } else {
      itemErrorMessage.value = 'Erro ao salvar item. Tente novamente.'
    }
  }
}

const deleteItem = async (id: number) => {
  if (!confirm('Deseja realmente remover este item?')) return
  try {
    await produtoBenfeitoriaService.delete(id)
    await loadProdutosBenfeitoria(formData.value.id_benf!)
  } catch (error) {
    console.error('Erro ao remover item:', error)
    alert('Erro ao remover item')
  }
}

const editItem = (item: ProdutoBenfeitoria) => {
  itemForm.value = { ...item }
  itemEmEdicao.value = item.id_prodbenf!
  itemUnitarioDisplay.value = formatarMoedaDisplay(item.unitario)
}

const cancelEdit = () => {
  itemForm.value = defaultItemForm()
  itemEmEdicao.value = null
  itemUnitarioDisplay.value = ''
  itemErrorMessage.value = null
}

const totalProdutos = computed(() => {
  return produtosBenfeitoria.value.reduce((acc, curr) => acc + (Number(curr.quantidade) * Number(curr.unitario)), 0)
})

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      loadOptions()
      activeTab.value = 'geral'
      formData.value = props.initialData ? { ...props.initialData } : defaultForm()
      valortotalDisplay.value = formatarMoedaDisplay(formData.value.valortotal)
      depreciacaoanoDisplay.value = formatarMoedaDisplay(formData.value.depreciacaoano)
      manutencaoanoDisplay.value = formatarMoedaDisplay(formData.value.manutencaoano)
      
      produtosBenfeitoria.value = []
      cancelEdit()
    }
  },
)

watch(activeTab, (newTab) => {
  if (newTab === 'produtos' && formData.value.id_benf) {
    loadProdutosBenfeitoria(formData.value.id_benf)
  }
})

watch(() => itemForm.value.idProduto, async (newId) => {
  if (newId && !itemEmEdicao.value) {
    try {
      const produto = await produtoService.getById(newId)
      if (produto) {
        // Usa o valor de última entrada ou último custo como sugestão
        const precoSugerido = produto.valorultimaentrada_prod || produto.valorUltimoCusto_prod || 0
        if (precoSugerido > 0) {
          itemForm.value.unitario = precoSugerido
          itemUnitarioDisplay.value = formatarMoedaDisplay(precoSugerido)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do produto:', error)
    }
  }
})

const handleSave = () => {
  if (props.loading) return

  if (!formData.value.descricao?.trim()) {
    alert('A descrição é obrigatória.')
    return
  }
  if (!formData.value.idFazenda) {
    alert('A fazenda é obrigatória.')
    return
  }
  if (!formData.value.valortotal || formData.value.valortotal <= 0) {
    alert('O valor total é obrigatório e deve ser maior que zero.')
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
      class="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Benfeitoria' : 'Nova Benfeitoria' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Tabs Navigation -->
      <div class="flex border-b border-gray-100 px-6">
        <button
          @click="activeTab = 'geral'"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
          :class="
            activeTab === 'geral'
              ? 'border-lime-500 text-lime-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          "
        >
          <FileText class="w-4 h-4" />
          Dados Gerais
        </button>
        <button
          @click="activeTab = 'produtos'"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
          :class="
            activeTab === 'produtos'
              ? 'border-lime-500 text-lime-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          "
        >
          <Package class="w-4 h-4" />
          Produtos/Insumos
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar space-y-8">

        <!-- Tab Geral -->
        <div v-show="activeTab === 'geral'" class="space-y-8">
          <!-- Section: Informações Principais -->
          <section>
            <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <FileText class="w-4 h-4 text-gray-500" />
              Informações Principais
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
              <!-- Descrição -->
              <div class="md:col-span-8">
                <label class="block text-sm font-bold text-gray-700 mb-1.5">
                  Descrição <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.descricao"
                    type="text"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Descrição da benfeitoria"
                  />
                </div>
              </div>

              <!-- Fazenda -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-1.5">
                  Fazenda <span class="text-red-500">*</span>
                </label>
                <BaseAutocomplete
                  v-model="formData.idFazenda"
                  :options="fazendasOptions"
                  placeholder="Selecione..."
                  class="w-full"
                >
                  <template #prefix>
                    <MapPin class="h-4 w-4 text-gray-400" />
                  </template>
                </BaseAutocomplete>
              </div>

              <!-- Safra -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Safra</label>
                <BaseAutocomplete
                  v-model="formData.idSafra"
                  :options="safrasOptions"
                  placeholder="Selecione..."
                  class="w-full"
                >
                  <template #prefix>
                    <Sprout class="h-4 w-4 text-gray-400" />
                  </template>
                </BaseAutocomplete>
              </div>

              <!-- Unidade de Medida -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Unidade de Medida</label>
                <BaseAutocomplete
                  v-model="formData.idUnidadeMedida"
                  :options="unidadesOptions"
                  placeholder="Selecione..."
                  class="w-full"
                >
                  <template #prefix>
                    <Ruler class="h-4 w-4 text-gray-400" />
                  </template>
                </BaseAutocomplete>
              </div>

              <!-- Data -->
              <div class="md:col-span-4">
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Data</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.data"
                    type="date"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Valor Total -->
              <div class="md:col-span-6">
                <label class="block text-sm font-bold text-gray-700 mb-1.5">
                  Valor Total (R$) <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign class="h-4 w-4 text-gray-400" />
                  </div>
                  <span class="absolute inset-y-0 left-8 flex items-center text-gray-500 text-sm pointer-events-none select-none">
                    R$
                  </span>
                  <input
                    :value="valortotalDisplay"
                    @input="valortotalDisplay = ($event.target as HTMLInputElement).value"
                    @blur="onValortotalBlur"
                    type="text"
                    inputmode="decimal"
                    placeholder="0,00"
                    class="w-full pl-14 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- Section: Depreciação e Manutenção -->
          <section>
            <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <TrendingDown class="w-4 h-4 text-gray-500" />
              Depreciação e Manutenção
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-5">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">Vida Útil (anos)</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.vidautil"
                    type="number"
                    min="0"
                    class="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">Perc. Sucata (%)</label>
                <input
                  v-model="formData.percsucata"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">Deprec. (R$/ano)</label>
                <input
                  :value="depreciacaoanoDisplay"
                  @input="depreciacaoanoDisplay = ($event.target as HTMLInputElement).value"
                  @blur="onDepreciacaoanoBlur"
                  type="text"
                  inputmode="decimal"
                  placeholder="0,00"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">Manut. (R$/ano)</label>
                <input
                  :value="manutencaoanoDisplay"
                  @input="manutencaoanoDisplay = ($event.target as HTMLInputElement).value"
                  @blur="onManutencaoanoBlur"
                  type="text"
                  inputmode="decimal"
                  placeholder="0,00"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">Taxa Manut. (%)</label>
                <input
                  v-model="formData.taxamanutencao"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right"
                />
              </div>
            </div>
          </section>

          <!-- Section: Observações -->
          <section>
            <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <FileText class="w-4 h-4 text-gray-500" />
              Observações
            </h3>
            <textarea
              v-model="formData.observacao"
              rows="3"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none placeholder-gray-400"
              placeholder="Insira observações adicionais aqui..."
            ></textarea>
          </section>
        </div>

        <!-- Tab Produtos -->
        <div v-show="activeTab === 'produtos'" class="space-y-8">
          <div v-if="!formData.id_benf" class="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div class="bg-white p-4 rounded-full shadow-sm mb-4">
              <Package class="w-8 h-8 text-lime-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1">Salve a benfeitoria primeiro</h3>
            <p class="text-gray-500 text-center max-w-sm">
              É necessário salvar os dados gerais da benfeitoria antes de adicionar produtos ou insumos.
            </p>
          </div>

          <div v-else class="space-y-8">
            <!-- Form Adicionar Produto -->
            <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
              <h4 class="font-semibold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                <div class="bg-lime-100 p-1.5 rounded-lg">
                  <Plus class="w-4 h-4 text-lime-700" />
                </div>
                {{ itemEmEdicao ? 'Editar Produto' : 'Adicionar Produto' }}
              </h4>
              
              <div v-if="itemErrorMessage" class="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-start gap-3">
                <TrendingDown class="w-5 h-5 mt-0.5 shrink-0" />
                <span class="font-medium">{{ itemErrorMessage }}</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-[24] gap-5">
                <!-- Produto -->
                <div class="md:col-span-12">
                  <label class="block text-sm font-bold text-gray-700 mb-1.5">Produto <span class="text-red-500">*</span></label>
                  <BaseAutocomplete
                    v-model="itemForm.idProduto"
                    :options="produtosOptions"
                    placeholder="Selecione um produto..."
                    class="w-full"
                  />
                </div>

                <!-- Quantidade (1.5 colunas do grid antigo = 3 colunas do grid novo) -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-bold text-gray-700 mb-1.5">Qtd <span class="text-red-500">*</span></label>
                  <input
                    v-model="itemForm.quantidade"
                    type="text"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right placeholder-gray-400"
                  />
                </div>

                <!-- Unitário (2 colunas do grid antigo = 4 colunas do grid novo) -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-bold text-gray-700 mb-1.5">Unitário (R$) <span class="text-red-500">*</span></label>
                  <input
                    :value="itemUnitarioDisplay"
                    @input="itemUnitarioDisplay = ($event.target as HTMLInputElement).value"
                    @blur="onItemUnitarioBlur"
                    type="text"
                    inputmode="decimal"
                    class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right placeholder-gray-400"
                    placeholder="0,00"
                  />
                </div>

                <!-- Safra -->
                <div class="md:col-span-4 ">
                  <label class="block text-sm font-bold text-gray-700 mb-1.5">Safra</label>
                  <BaseAutocomplete
                    v-model="itemForm.idSafra"
                    :options="safrasOptions"
                    placeholder="Selecione..."
                    class="w-full"
                  />
                </div>

                <!-- Data -->
                <div class="md:col-span-4">
                  <label class="block text-sm font-bold text-gray-700 mb-1.5">Data</label>
                  <input
                    v-model="itemForm.data"
                    type="date"
                    class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-gray-600"
                  />
                </div>

                <!-- Botões -->
                <div class="md:col-span-[24] flex justify-end gap-3 pt-2">
                  <button
                    v-if="itemEmEdicao"
                    @click="cancelEdit"
                    class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    @click="saveItem"
                    class="px-5 py-2.5 bg-lime-600 text-white rounded-lg text-sm font-medium hover:bg-lime-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-1 flex items-center gap-2"
                  >
                    <Save class="w-4 h-4" />
                    {{ itemEmEdicao ? 'Atualizar Item' : 'Adicionar Item' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Tabela de Produtos -->
            <div class="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <table class="w-full text-sm text-left">
                <thead class="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200">
                  <tr>
                    <th class="px-6 py-4">Produto</th>
                    <th class="px-6 py-4 text-right">Qtd</th>
                    <th class="px-6 py-4 text-right">Unitário</th>
                    <th class="px-6 py-4 text-right">Total</th>
                    <th class="px-6 py-4 text-center">Safra</th>
                    <th class="px-6 py-4 text-center">Data</th>
                    <th class="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-if="loadingProdutos">
                    <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                      <div class="flex flex-col items-center justify-center gap-2">
                        <div class="w-6 h-6 border-2 border-lime-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Carregando produtos...</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="produtosBenfeitoria.length === 0">
                    <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                      Nenhum produto adicionado. Utilize o formulário acima.
                    </td>
                  </tr>
                  <tr v-else v-for="item in produtosBenfeitoria" :key="item.id_prodbenf" class="hover:bg-gray-50/50 transition-colors">
                    <td class="px-6 py-4 font-medium text-gray-900">{{ item.produto?.descricao_prod || 'Produto #' + item.idProduto }}</td>
                    <td class="px-6 py-4 text-right font-medium text-gray-600">{{ Number(item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</td>
                    <td class="px-6 py-4 text-right text-gray-600">{{ Number(item.unitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</td>
                    <td class="px-6 py-4 text-right font-bold text-gray-900">{{ (Number(item.quantidade) * Number(item.unitario)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</td>
                    <td class="px-6 py-4 text-center">
                      <span v-if="item.safra" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lime-100 text-lime-800">
                        {{ item.safra.nome }}
                      </span>
                      <span v-else class="text-gray-400">-</span>
                    </td>
                    <td class="px-6 py-4 text-center text-gray-600 whitespace-nowrap">{{ item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-' }}</td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex justify-end gap-2">
                        <button
                          @click="editItem(item)"
                          class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          title="Editar item"
                        >
                          <Edit2 class="w-4 h-4" />
                        </button>
                        <button
                          @click="deleteItem(item.id_prodbenf!)"
                          class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          title="Remover item"
                        >
                          <Trash2 class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tfoot v-if="produtosBenfeitoria.length > 0" class="bg-gray-50/50 border-t border-gray-200 font-bold text-gray-900">
                  <tr>
                    <td colspan="3" class="px-6 py-4 text-right text-gray-600 uppercase text-xs tracking-wider">Total de Insumos:</td>
                    <td class="px-6 py-4 text-right text-base text-lime-700">{{ totalProdutos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</td>
                    <td colspan="3"></td>
                  </tr>
                </tfoot>
              </table>
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
