<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import {
  X,
  Plus,
  Trash2,
  FileText,
  Calendar,
  DollarSign,
  Package,
  User,
  Save,
  Hash,
  Truck,
  Shield,
  Percent,
  CreditCard
} from 'lucide-vue-next'
import type { PedidoCompra } from '../types/PedidoCompra'
import type { ItemPedidoCompra } from '../types/ItemPedidoCompra'
import type { Produto } from '../types/Produto'
import type { ParceiroNegocio } from '../types/ParceiroNegocio'
import BaseAutocomplete from './BaseAutocomplete.vue'
import { produtoService } from '../services/produtoService'
import { parceiroNegocioService } from '../services/parceiroNegocioService'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  isOpen: boolean
  initialData?: PedidoCompra | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const activeTab = ref('geral')

const formData = ref<PedidoCompra>({
  id_ped_compra: 0,
  numero: '',
  empresaId: 1, 
  fornecedorId: 0,
  status: 'rascunho',
  data_emissao: new Date().toISOString().split('T')[0] ?? '',
  data_previsao_entrega: '',
  vl_produtos: 0,
  vl_frete: 0,
  vl_seguro: 0,
  vl_desconto: 0,
  vl_outros: 0,
  vl_total: 0,
  percentual_tolerancia: 0,
  permite_entrega_parcial: false,
  observacoes: '',
  itens: []
})

// Options
const fornecedoresOptions = ref<{ value: number; label: string }[]>([])
const produtosOptions = ref<{ value: number; label: string; produto: Produto }[]>([])

// Loading states
const isLoadingData = ref(false)

const mergeProdutosIntoOptions = () => {
  if (formData.value.itens && formData.value.itens.length > 0) {
    formData.value.itens.forEach((item: any) => {
      // Garantir que ID seja número para comparação consistente
      const pId = Number(item.produtoId)
      
      const exists = produtosOptions.value.some(o => o.value === pId)
      if (!exists && pId) {
        // Tenta pegar o objeto produto de várias fontes
        const produtoObj = item.produto || item.produto_obj || null

        if (produtoObj) {
          produtosOptions.value.push({
            value: pId,
            label: produtoObj.descricao_prod || produtoObj.descricao || item.descricao,
            // @ts-ignore - Usando partial produto apenas para display
            produto: produtoObj
          })
        } else if (item.descricao) {
           // Fallback se não vier o objeto produto, usa a descrição do item
           produtosOptions.value.push({
            value: pId,
            label: item.descricao,
            // @ts-ignore - Mock partial produto
            produto: { id_prod: pId, descricao_prod: item.descricao }
          })
        }
      }
    })
  }
}

const fetchFornecedores = async () => {
  try {
    // Ajustar conforme a implementação real do service de parceiros
    const result = await parceiroNegocioService.getAllNoPagination()
    fornecedoresOptions.value = result.data
      //.filter((p: ParceiroNegocio) => p.fornecedor) // Se houver flag de fornecedor
      .map((p: ParceiroNegocio) => ({
        value: p.id_pessoa || 0,
        label: `${p.nomefantasia_pessoa || p.nomerazao_pessoa || 'Sem Nome'} - ${p.cpfcnpj_pessoa || 'N/A'}`
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error)
    toast.error('Erro ao carregar fornecedores.')
  }
}

const fetchProdutos = async () => {
  try {
    const result = await produtoService.getAll(1, 1000)
    const data = result.data || []
    produtosOptions.value = data.map((p: Produto) => ({
      value: p.id_prod || 0,
      label: `${p.descricao_prod}`,
      produto: p
    }))
    mergeProdutosIntoOptions()
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
  }
}

const tabs = [
  { id: 'geral', label: 'Dados Gerais', icon: FileText },
  { id: 'itens', label: 'Itens do Pedido', icon: Package },
  { id: 'totais', label: 'Totais e Obs', icon: DollarSign },
]

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.initialData) {
        // Deep copy para evitar mutação direta e garantir reatividade dos itens
        formData.value = JSON.parse(JSON.stringify(props.initialData))
        
        // Normalização robusta dos itens para lidar com snake_case do backend
        // Tenta ler diretamente do initialData caso o JSON.parse tenha perdido algo ou se a propriedade for diferente
        const sourceData = props.initialData as any
        const rawItens = sourceData.itens || sourceData.itens_pedido || sourceData.itensPedido || sourceData.items || []
        
        formData.value.itens = rawItens.map((item: any) => ({
          ...item,
          // Normaliza IDs e campos numéricos
          produtoId: Number(item.produtoId || item.produto_id || item.id_produto || 0),
          quantidade_solicitada: Number(item.quantidade_solicitada || item.quantidade || item.qtde || 0),
          vl_unitario: Number(item.vl_unitario || item.valor_unitario || item.preco_unitario || 0),
          vl_desconto: Number(item.vl_desconto || item.valor_desconto || 0),
          vl_bruto: Number(item.vl_bruto || item.valor_bruto || 0),
          vl_total: Number(item.vl_total || item.valor_total || 0),
          // Normaliza textos
          unidade: item.unidade || item.unidade_medida || 'un',
          descricao: item.descricao || item.descricao_produto || item.produto?.descricao_prod || item.produto?.descricao || ''
        }))

        // Mesclar produtos dos itens nas opções caso não existam
        mergeProdutosIntoOptions()
      } else {
        resetForm()
      }
      activeTab.value = 'geral'
    }
  }
)

const resetForm = () => {
  formData.value = {
    id_ped_compra: 0,
    numero: '', // Será gerado pelo back ou manual? Deixar vazio por enquanto
    empresaId: 1,
    fornecedorId: 0,
    status: 'rascunho',
    data_emissao: new Date().toISOString().split('T')[0] ?? '',
    data_previsao_entrega: '',
    vl_produtos: 0,
    vl_frete: 0,
    vl_seguro: 0,
    vl_desconto: 0,
    vl_outros: 0,
    vl_total: 0,
    percentual_tolerancia: 0,
    permite_entrega_parcial: false,
    observacoes: '',
    itens: []
  }
}

onMounted(() => {
  fetchFornecedores()
  fetchProdutos()
})

// Item Management
const addItem = () => {
  if (!formData.value.itens) {
    formData.value.itens = []
  }
  
  formData.value.itens.push({
    produtoId: 0,
    descricao: '',
    unidade: '',
    quantidade_solicitada: 1,
    vl_unitario: 0,
    vl_desconto: 0,
    vl_bruto: 0,
    vl_total: 0,
    numero_item: (formData.value.itens.length || 0) + 1
  })
}

const removeItem = (index: number) => {
  formData.value.itens?.splice(index, 1)
  calculateTotals()
}

const onProdutoChange = (item: ItemPedidoCompra, val: string | number | null | undefined) => {
  const produtoId = val ? Number(val) : 0
  const produtoOption = produtosOptions.value.find(p => p.value === produtoId)
  
  item.produtoId = produtoId
  
  if (produtoOption) {
    item.descricao = produtoOption.produto.descricao_prod
    item.unidade = produtoOption.produto.unidadeMedidaDescricao || 'un'
    item.vl_unitario = produtoOption.produto.valorUltimoCusto_prod || 0
    calculateItemTotal(item)
  } else {
    // Reset se não encontrar (ou se for 0)
    item.descricao = ''
    item.unidade = ''
    item.vl_unitario = 0
    calculateItemTotal(item)
  }
}

const calculateItemTotal = (item: ItemPedidoCompra) => {
  item.vl_bruto = item.quantidade_solicitada * item.vl_unitario
  item.vl_total = item.vl_bruto - item.vl_desconto
  calculateTotals()
}

const calculateTotals = () => {
  const totalProdutos = formData.value.itens?.reduce((acc, item) => acc + (item.vl_total || 0), 0) || 0
  formData.value.vl_produtos = totalProdutos
  
  formData.value.vl_total = 
    formData.value.vl_produtos + 
    (Number(formData.value.vl_frete) || 0) + 
    (Number(formData.value.vl_seguro) || 0) + 
    (Number(formData.value.vl_outros) || 0) - 
    (Number(formData.value.vl_desconto) || 0)
}

const handleSave = () => {
  if (props.loading) return
  
  if (!formData.value.fornecedorId) {
    toast.warning('Selecione um fornecedor.')
    return
  }
  
  if (!formData.value.data_emissao) {
    toast.warning('Data de emissão é obrigatória.')
    return
  }

  if (!formData.value.itens || formData.value.itens.length === 0) {
    toast.warning('Adicione pelo menos um item ao pedido.')
    return
  }

  // Validação dos itens
  for (const item of formData.value.itens) {
    if (!item.produtoId) {
      toast.warning('Selecione o produto para todos os itens.')
      return
    }
    if (item.quantidade_solicitada <= 0) {
      toast.warning('Quantidade deve ser maior que zero.')
      return
    }
  }

  emit('save', formData.value)
}

// Formatação de Moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] overflow-hidden flex flex-col">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h2 class="text-xl font-bold text-gray-900">
            {{ props.initialData ? `Editar Pedido #${props.initialData.numero || props.initialData.id_ped_compra}` : 'Novo Pedido de Compra' }}
          </h2>
          <p class="text-sm font-bold text-gray-600 mt-1" v-if="formData.status">
            Status: <span class="uppercase font-bold">{{ formData.status.replace('_', ' ') }}</span>
          </p>
        </div>
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
        
        <!-- Tab: Dados Gerais -->
        <div v-show="activeTab === 'geral'" class="space-y-8">
          
          <section>
            <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <FileText class="w-4 h-4 text-gray-500" />
              Informações Básicas
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <!-- Fornecedor -->
              <div class="md:col-span-2">
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Fornecedor <span class="text-red-500">*</span></label>
                <div class="relative">
                   <BaseAutocomplete 
                      v-model="formData.fornecedorId"
                      :options="fornecedoresOptions"
                      placeholder="Selecione um fornecedor..."
                   >
                    <template #prefix>
                      <User class="h-4 w-4 text-gray-400" />
                    </template>
                   </BaseAutocomplete>
                </div>
              </div>

              <!-- Data Emissão -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Data Emissão <span class="text-red-500">*</span></label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.data_emissao"
                    type="date"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Previsão Entrega -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Previsão de Entrega</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.data_previsao_entrega"
                    type="date"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

               <!-- Número (Opcional/Manual) -->
               <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Número do Pedido</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.numero"
                    type="text"
                    placeholder="Gerado automaticamente se vazio"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

               <!-- Forma de Pagamento -->
               <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Forma de Pagamento</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.forma_pagamento"
                    type="text"
                    placeholder="Ex: Boleto 30 dias"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Tab: Itens -->
        <div v-show="activeTab === 'itens'" class="space-y-4">
          <section>
             <div class="flex justify-between items-center mb-4 border-b pb-2">
              <h3 class="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Package class="w-4 h-4 text-gray-500" />
                Itens do Pedido
              </h3>
              <button
                @click="addItem"
                type="button"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
              >
                <Plus class="h-4 w-4 mr-1" />
                Adicionar Item
              </button>
            </div>

            <div class="overflow-x-auto rounded-lg border border-gray-200">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Produto</th>
                    <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Unid.</th>
                    <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Qtde</th>
                    <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Vl. Unit.</th>
                    <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Desc.</th>
                    <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Total</th>
                    <th scope="col" class="relative px-3 py-3"><span class="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(item, index) in formData.itens" :key="index">
                    <td class="px-3 py-2">
                      <BaseAutocomplete 
                        :model-value="item.produtoId"
                        @update:model-value="(val) => onProdutoChange(item, val)"
                        :options="produtosOptions"
                        placeholder="Selecione..."
                      />
                    </td>
                    <td class="px-3 py-2 text-sm text-gray-500">
                      {{ item.unidade }}
                    </td>
                    <td class="px-3 py-2">
                      <input
                        v-model.number="item.quantidade_solicitada"
                        @input="calculateItemTotal(item)"
                        type="number"
                        min="0.01"
                        step="0.01"
                        class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                      />
                    </td>
                    <td class="px-3 py-2">
                      <input
                        v-model.number="item.vl_unitario"
                        @input="calculateItemTotal(item)"
                        type="number"
                        min="0"
                        step="0.01"
                        class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                      />
                    </td>
                    <td class="px-3 py-2">
                      <input
                        v-model.number="item.vl_desconto"
                        @input="calculateItemTotal(item)"
                        type="number"
                        min="0"
                        step="0.01"
                        class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                      />
                    </td>
                    <td class="px-3 py-2 text-sm font-medium text-gray-900 text-right">
                      {{ formatCurrency(item.vl_total) }}
                    </td>
                    <td class="px-3 py-2 text-right">
                      <button @click="removeItem(index)" class="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-full transition-colors">
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="(!formData.itens || formData.itens.length === 0)">
                    <td colspan="7" class="px-3 py-8 text-center text-sm text-gray-500">
                      Nenhum item adicionado.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <!-- Tab: Totais e Obs -->
        <div v-show="activeTab === 'totais'" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Totais -->
             <section>
               <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <DollarSign class="w-4 h-4 text-gray-500" />
                Totais do Pedido
              </h3>
              
              <div class="space-y-4">
                 <div class="flex justify-between items-center py-2 border-b border-gray-50">
                    <span class="text-gray-600 font-medium">Total Produtos</span>
                    <span class="font-medium text-gray-900">{{ formatCurrency(formData.vl_produtos) }}</span>
                 </div>
                 
                 <div class="grid grid-cols-2 gap-4 items-center">
                    <label class="text-sm text-gray-600 flex items-center gap-2">
                      <Truck class="w-4 h-4 text-gray-400" />
                      Frete (+)
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span class="text-gray-400 text-xs">R$</span>
                      </div>
                      <input 
                        v-model.number="formData.vl_frete" 
                        @input="calculateTotals" 
                        type="number" 
                        step="0.01" 
                        class="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right" 
                      />
                    </div>
                 </div>
                 
                 <div class="grid grid-cols-2 gap-4 items-center">
                    <label class="text-sm text-gray-600 flex items-center gap-2">
                      <Shield class="w-4 h-4 text-gray-400" />
                      Seguro (+)
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span class="text-gray-400 text-xs">R$</span>
                      </div>
                      <input 
                        v-model.number="formData.vl_seguro" 
                        @input="calculateTotals" 
                        type="number" 
                        step="0.01" 
                        class="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right" 
                      />
                    </div>
                 </div>
                 
                 <div class="grid grid-cols-2 gap-4 items-center">
                    <label class="text-sm text-gray-600 flex items-center gap-2">
                      <Plus class="w-4 h-4 text-gray-400" />
                      Outros (+)
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span class="text-gray-400 text-xs">R$</span>
                      </div>
                      <input 
                        v-model.number="formData.vl_outros" 
                        @input="calculateTotals" 
                        type="number" 
                        step="0.01" 
                        class="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right" 
                      />
                    </div>
                 </div>
                 
                 <div class="grid grid-cols-2 gap-4 items-center">
                    <label class="text-sm text-gray-600 flex items-center gap-2">
                      <Percent class="w-4 h-4 text-gray-400" />
                      Desconto Geral (-)
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span class="text-gray-400 text-xs">R$</span>
                      </div>
                      <input 
                        v-model.number="formData.vl_desconto" 
                        @input="calculateTotals" 
                        type="number" 
                        step="0.01" 
                        class="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-right" 
                      />
                    </div>
                 </div>

                 <div class="flex justify-between items-center py-4 border-t border-gray-200 mt-4">
                    <span class="text-lg font-bold text-gray-900">Total Geral</span>
                    <span class="text-2xl font-bold text-lime-600">{{ formatCurrency(formData.vl_total) }}</span>
                 </div>
              </div>
             </section>

             <!-- Observações -->
             <section>
                <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                  <FileText class="w-4 h-4 text-gray-500" />
                  Observações
                </h3>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1.5">Observações Internas</label>
                    <textarea
                      v-model="formData.observacoes"
                      rows="4"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none transition-all"
                    ></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1.5">Observações para Fornecedor</label>
                    <textarea
                      v-model="formData.observacoes_fornecedor"
                      rows="4"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none transition-all"
                    ></textarea>
                  </div>
                </div>
             </section>
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
