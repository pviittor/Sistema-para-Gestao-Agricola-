<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X, Save, Package, BarChart2, Info } from 'lucide-vue-next'
import type { ItemNotaFiscal } from '@/types/ItemNotaFiscal'
import { produtoService } from '@/services/produtoService'
import type { Produto } from '@/types/Produto'
import BaseAutocomplete from '@/components/BaseAutocomplete.vue'

const props = defineProps<{
  isOpen: boolean
  notaFiscalId: number
  nextNumeroItem?: number
  defaultCfop?: string
  initialData?: ItemNotaFiscal | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const activeTab = ref('produto')
const produtos = ref<Produto[]>([])
const loadingProdutos = ref(false)

const tabs = [
  { id: 'produto', label: 'Produto', icon: Package },
  { id: 'fiscal', label: 'Fiscal', icon: BarChart2 },
  { id: 'outros', label: 'Outros', icon: Info },
]

const defaultForm = (): Partial<ItemNotaFiscal> => ({
  notaFiscalId: props.notaFiscalId,
  produtoId: undefined as unknown as number,
  numero_item: props.nextNumeroItem ?? 1,
  codigo_produto: '',
  descricao: '',
  ncm: '',
  cest: '',
  cfop: props.defaultCfop ?? '',
  unidade: 'UN',
  quantidade: 1,
  vl_unitario: 0,
  vl_desconto: 0,
  vl_frete: 0,
  vl_seguro: 0,
  vl_outros: 0,
  cst_icms: '00',
  modalidade_bc_icms: '3', // 3 = Valor da Operação (padrão)
  aliq_icms: 0,
  vl_bc_icms: 0,
  vl_icms: 0,
  aliq_icms_st: 0,
  vl_bc_icms_st: 0,
  vl_icms_st: 0,
  cst_pis: '07',
  aliq_pis: 0,
  cst_cofins: '07',
  aliq_cofins: 0,
  numero_lote: '',
  data_fabricacao: undefined,
  data_validade: undefined,
  numero_serie_item: '',
  informacoes_adicionais: '',
})

const formData = ref<Partial<ItemNotaFiscal>>(defaultForm())

const vlBruto = computed(() => {
  const qtd = formData.value.quantidade ?? 0
  const unit = formData.value.vl_unitario ?? 0
  return qtd * unit
})

const vlTotal = computed(() => {
  const bruto = vlBruto.value
  const desc = formData.value.vl_desconto ?? 0
  const frete = formData.value.vl_frete ?? 0
  const seguro = formData.value.vl_seguro ?? 0
  const outros = formData.value.vl_outros ?? 0
  return bruto - desc + frete + seguro + outros
})

const produtoOptions = computed(() =>
  produtos.value.map((p) => ({
    value: p.id_prod as number,
    label: p.descricao_prod,
  })),
)

const modalidadeBcIcmsOptions = [
  { value: '0', label: 'Margem Valor Agregado (%)' },
  { value: '1', label: 'Pauta (Valor)' },
  { value: '2', label: 'Preço Tabelado Máx. (valor)' },
  { value: '3', label: 'Valor da Operação' },
]

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (!isOpen) return
    activeTab.value = 'produto'
    formData.value = props.initialData ? { ...props.initialData } : defaultForm()
    await loadProdutos()
  },
)

const loadProdutos = async () => {
  if (produtos.value.length > 0) return
  loadingProdutos.value = true
  try {
    const result = await produtoService.getAll(1, 500)
    produtos.value = result.data
  } catch (e) {
    console.error('Erro ao carregar produtos', e)
  } finally {
    loadingProdutos.value = false
  }
}

const onProdutoSelect = (produtoId: string | number | null) => {
  if (!produtoId) return
  const produto = produtos.value.find((p) => p.id_prod === produtoId)
  if (!produto) return
  formData.value.produtoId = produtoId as number
  formData.value.codigo_produto = String(produto.id_prod)
  formData.value.descricao = produto.descricao_prod
  formData.value.vl_unitario = produto.precomedio_prod ?? 0
  if (produto.unidadeMedidaDescricao) {
    formData.value.unidade = produto.unidadeMedidaDescricao
  }
}

const fmt = (v?: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

const handleSave = () => {
  if (props.loading) return
  if (!formData.value.produtoId) {
    alert('Selecione um produto.')
    return
  }
  if (!formData.value.ncm || formData.value.ncm.length !== 8) {
    alert('NCM deve ter 8 dígitos.')
    return
  }
  if (!formData.value.cfop || formData.value.cfop.length !== 4) {
    alert('CFOP deve ter 4 dígitos.')
    return
  }
  if (!formData.value.quantidade || formData.value.quantidade <= 0) {
    alert('Quantidade deve ser maior que zero.')
    return
  }
  emit('save', {
    ...formData.value,
    vl_bruto: vlBruto.value,
    vl_total: vlTotal.value,
  })
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal -->
    <div
      class="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100 rounded-t-xl bg-white">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-lg bg-lime-100 flex items-center justify-center">
            <Package class="h-5 w-5 text-lime-600" />
          </div>
          <h2 class="text-xl font-bold text-gray-900">
            {{ props.initialData ? 'Editar Item' : 'Adicionar Item' }}
          </h2>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-100 px-6 bg-white">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none flex items-center gap-2"
          :class="
            activeTab === tab.id
              ? 'border-lime-600 text-lime-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          "
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto flex-1 custom-scrollbar bg-white">

        <!-- Tab: Produto -->
        <div v-show="activeTab === 'produto'" class="space-y-6">
          <!-- Seleção de produto -->
          <section>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Produto *
            </h3>
            <div v-if="loadingProdutos" class="text-sm text-gray-400 py-2">
              Carregando produtos...
            </div>
            <BaseAutocomplete
              v-else
              :model-value="formData.produtoId ?? null"
              @update:model-value="onProdutoSelect"
              :options="produtoOptions"
              placeholder="Buscar produto..."
            />
          </section>

          <!-- Detalhes do item -->
          <section>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Detalhes
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-bold text-gray-700 mb-2">Nº Item</label>
                <input
                  v-model.number="formData.numero_item"
                  type="number"
                  min="1"
                  max="990"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-bold text-gray-700 mb-2">Código</label>
                <input
                  v-model="formData.codigo_produto"
                  type="text"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
              <div class="md:col-span-8">
                <label class="block text-sm font-bold text-gray-700 mb-2">Descrição *</label>
                <input
                  v-model="formData.descricao"
                  type="text"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
              <div class="md:col-span-3">
                <label class="block text-sm font-bold text-gray-700 mb-2">NCM * (8 dig.)</label>
                <input
                  v-model="formData.ncm"
                  type="text"
                  maxlength="8"
                  placeholder="00000000"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm font-mono"
                />
              </div>
              <div class="md:col-span-3">
                <label class="block text-sm font-bold text-gray-700 mb-2">CEST (7 dig.)</label>
                <input
                  v-model="formData.cest"
                  type="text"
                  maxlength="7"
                  placeholder="0000000"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm font-mono"
                />
              </div>
              <div class="md:col-span-3">
                <label class="block text-sm font-bold text-gray-700 mb-2">CFOP * (4 dig.)</label>
                <input
                  v-model="formData.cfop"
                  type="text"
                  maxlength="4"
                  placeholder="5101"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm font-mono"
                />
              </div>
              <div class="md:col-span-3">
                <label class="block text-sm font-bold text-gray-700 mb-2">Unidade</label>
                <input
                  v-model="formData.unidade"
                  type="text"
                  maxlength="6"
                  placeholder="UN"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
            </div>
          </section>

          <!-- Quantidades e valores -->
          <section>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Quantidades e Valores
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Quantidade *</label>
                <input
                  v-model.number="formData.quantidade"
                  type="number"
                  min="0"
                  step="0.001"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Vl. Unitário (R$)</label>
                <input
                  v-model.number="formData.vl_unitario"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Desconto (R$)</label>
                <input
                  v-model.number="formData.vl_desconto"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Outros (R$)</label>
                <input
                  v-model.number="formData.vl_outros"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
            </div>

            <!-- Totais calculados -->
            <div class="mt-4 p-4 bg-lime-50 rounded-lg border border-lime-100 grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-gray-500">Valor Bruto</span>
                <p class="text-lg font-bold text-gray-800">{{ fmt(vlBruto) }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-500">Valor Total</span>
                <p class="text-lg font-bold text-lime-700">{{ fmt(vlTotal) }}</p>
              </div>
            </div>
          </section>
        </div>

        <!-- Tab: Fiscal -->
        <div v-show="activeTab === 'fiscal'" class="space-y-6">
          <!-- ICMS -->
          <section>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">ICMS</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">CST ICMS *</label>
                <input
                  v-model="formData.cst_icms"
                  type="text"
                  maxlength="3"
                  placeholder="00"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm font-mono"
                />
              </div>
              <div class="md:col-span-3">
                <label class="block text-sm font-bold text-gray-700 mb-2">Modalidade BC ICMS</label>
                <BaseAutocomplete
                  :model-value="formData.modalidade_bc_icms ?? null"
                  @update:model-value="(v) => (formData.modalidade_bc_icms = v as string)"
                  :options="modalidadeBcIcmsOptions"
                  placeholder="Selecione..."
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">BC ICMS (R$)</label>
                <input
                  v-model.number="formData.vl_bc_icms"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Alíq. ICMS (%)</label>
                <input
                  v-model.number="formData.aliq_icms"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Vl. ICMS (R$)</label>
                <input
                  v-model.number="formData.vl_icms"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
            </div>

            <!-- ICMS ST -->
             <div class="mt-4 pt-4 border-t border-gray-100">
              <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">ICMS Substituição Tributária</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">BC ICMS ST (R$)</label>
                  <input
                    v-model.number="formData.vl_bc_icms_st"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Alíq. ICMS ST (%)</label>
                  <input
                    v-model.number="formData.aliq_icms_st"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Vl. ICMS ST (R$)</label>
                  <input
                    v-model.number="formData.vl_icms_st"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- PIS -->
          <section>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">PIS</h3>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">CST PIS *</label>
                <input
                  v-model="formData.cst_pis"
                  type="text"
                  maxlength="2"
                  placeholder="07"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm font-mono"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Alíq. PIS (%)</label>
                <input
                  v-model.number="formData.aliq_pis"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Vl. PIS (R$)</label>
                <input
                  v-model.number="formData.vl_pis"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
            </div>
          </section>

          <!-- COFINS -->
          <section>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">COFINS</h3>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">CST COFINS *</label>
                <input
                  v-model="formData.cst_cofins"
                  type="text"
                  maxlength="2"
                  placeholder="07"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm font-mono"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Alíq. COFINS (%)</label>
                <input
                  v-model.number="formData.aliq_cofins"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Vl. COFINS (R$)</label>
                <input
                  v-model.number="formData.vl_cofins"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
            </div>
          </section>

          <!-- IPI -->
          <section>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              IPI (opcional)
            </h3>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">CST IPI</label>
                <input
                  v-model="formData.cst_ipi"
                  type="text"
                  maxlength="2"
                  placeholder="99"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm font-mono"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Alíq. IPI (%)</label>
                <input
                  v-model.number="formData.aliq_ipi"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Vl. IPI (R$)</label>
                <input
                  v-model.number="formData.vl_ipi"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
            </div>
          </section>
        </div>

        <!-- Tab: Outros -->
        <div v-show="activeTab === 'outros'" class="space-y-6">
          <section>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Rastreabilidade
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Número do Lote</label>
                <input
                  v-model="formData.numero_lote"
                  type="text"
                  placeholder="Lote do produto..."
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Número de Série</label>
                <input
                  v-model="formData.numero_serie_item"
                  type="text"
                  placeholder="Série do produto..."
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Data de Fabricação</label>
                <input
                  v-model="formData.data_fabricacao"
                  type="date"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Data de Validade</label>
                <input
                  v-model="formData.data_validade"
                  type="date"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Informações Adicionais
            </h3>
            <div>
              <textarea
                v-model="formData.informacoes_adicionais"
                rows="4"
                placeholder="Informações adicionais específicas deste item..."
                class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm resize-none"
              />
            </div>
          </section>
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
          {{ props.loading ? 'Salvando...' : 'Salvar Item' }}
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
