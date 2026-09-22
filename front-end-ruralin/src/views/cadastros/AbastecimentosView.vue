<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2, Search, Fuel, Calendar, User, Truck, Droplets, DollarSign, Gauge } from 'lucide-vue-next'
import AbastecimentosModal from '@/components/AbastecimentosModal.vue'
import type { Abastecimento } from '@/types/Abastecimento'
import type { ParceiroNegocio } from '@/types/ParceiroNegocio'
import type { Produto } from '@/types/Produto'
import { abastecimentoService } from '@/services/abastecimentoService'
import { parceiroNegocioService } from '@/services/parceiroNegocioService'
import { produtoService } from '@/services/produtoService'

// Modal state
const isModalOpen = ref(false)
const editingItem = ref<Abastecimento | null>(null)

// List state
const items = ref<Abastecimento[]>([])
const operadoresMap = ref<Record<number, string>>({})
const combustiveisMap = ref<Record<number, string>>({})
const searchTerm = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

const fetchOperadores = async () => {
  try {
    const result = await parceiroNegocioService.getAll(1, 1000)
    const data = result.data || []
    const map: Record<number, string> = {}
    data.forEach((p: ParceiroNegocio) => {
      if (p.id_pessoa) {
        map[p.id_pessoa] = p.nomefantasia_pessoa || p.nomerazao_pessoa || 'Sem Nome'
      }
    })
    operadoresMap.value = map
  } catch (error) {
    console.error('Erro ao buscar operadores:', error)
  }
}

const fetchCombustiveis = async () => {
  try {
    const result = await produtoService.getAll(1, 1000)
    const data = result.data || []
    const map: Record<number, string> = {}
    data.forEach((p: Produto) => {
      if (p.id_prod) {
        map[p.id_prod] = p.descricao_prod
      }
    })
    combustiveisMap.value = map
  } catch (error) {
    console.error('Erro ao buscar combustíveis:', error)
  }
}

const getNomeOperador = (item: Abastecimento) => {
  if (item.operadorAbastecimento?.nomefantasia_pessoa) return item.operadorAbastecimento.nomefantasia_pessoa
  if (item.operadorAbastecimento?.nomerazao_pessoa) return item.operadorAbastecimento.nomerazao_pessoa
  
  // Fallback to map lookup
  if (item.idOperadorAbastecimento && operadoresMap.value[item.idOperadorAbastecimento]) {
    return operadoresMap.value[item.idOperadorAbastecimento]
  }
  
  if (item.operador?.nomefantasia_pessoa) return item.operador.nomefantasia_pessoa
  if (item.operador?.nomerazao_pessoa) return item.operador.nomerazao_pessoa
  
  if (item.idOperador && operadoresMap.value[item.idOperador]) {
    return operadoresMap.value[item.idOperador]
  }
  
  return 'Sem Operador'
}

const getDescricaoCombustivel = (item: Abastecimento) => {
  if (item.combustivel?.descricao_prod) return item.combustivel.descricao_prod
  
  if (item.idCombustivel && combustiveisMap.value[item.idCombustivel]) {
    return combustiveisMap.value[item.idCombustivel]
  }
  
  return 'Desconhecido'
}

const fetchItems = async () => {
  isLoading.value = true
  try {
    const result = await abastecimentoService.getAll(1, 100)
    // Adjust based on actual API response structure
    items.value = result.data || []
  } catch (error) {
    console.error('Erro ao buscar abastecimentos:', error)
    toast.error('Erro ao carregar abastecimentos.')
  } finally {
    isLoading.value = false
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSave = async (data: Abastecimento) => {
  isSaving.value = true
  try {
    if (data.id_abast) {
      await abastecimentoService.update(data.id_abast, data)
      toast.success('Abastecimento atualizado com sucesso!')
    } else {
      await abastecimentoService.create(data)
      toast.success('Abastecimento criado com sucesso!')
    }
    isModalOpen.value = false
    fetchItems()
  } catch (error) {
    console.error('Erro ao salvar:', error)
    toast.error('Erro ao salvar. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}

const handleEdit = (item: Abastecimento) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir este abastecimento?')) {
    try {
      await abastecimentoService.delete(id)
      toast.success('Abastecimento excluído com sucesso!')
      fetchItems()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir. Tente novamente.')
    }
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  // Handle ISO string or YYYY-MM-DD
  const [year, month, day] = (dateString.split('T')[0] ?? '').split('-')
  return `${day}/${month}/${year}`
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

onMounted(() => {
  fetchItems()
  fetchOperadores()
  fetchCombustiveis()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <AbastecimentosModal
      :is-open="isModalOpen"
      :initial-data="editingItem"
      :loading="isSaving"
      @close="isModalOpen = false"
      @save="handleSave"
    />
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Abastecimentos</h1>
          <p class="text-gray-500 mt-1">Gerencie o abastecimento da sua frota e máquinas</p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Novo Abastecimento
        </button>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <h2 class="text-lg font-bold text-gray-900 self-center">Lista de Abastecimentos</h2>

          <div class="relative w-full sm:w-64">
             <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search class="h-4 w-4 text-gray-400" />
              </div>
            <input
                v-model="searchTerm"
                type="text"
                placeholder="Buscar abastecimento..."
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Máquina / Operador
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Km / H (Início - Fim)
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Combustível
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Volume / Preço
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in items" :key="item.id_abast" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex items-center gap-2">
                    <Calendar class="h-4 w-4 text-gray-400" />
                    {{ formatDate(item.data) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                        <Truck class="h-4 w-4 text-lime-600" />
                        <span class="font-medium">{{ item.maquina?.descricao || 'Sem Descrição' }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-xs text-gray-500 font-normal ml-6">
                        <User class="h-3 w-3" />
                        {{ getNomeOperador(item) }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex flex-col">
                    <div class="flex items-center gap-1 font-medium text-gray-700">
                      <Gauge class="h-4 w-4 text-gray-400" />
                      {{ item.kminicio }}
                    </div>
                    <div class="text-xs text-gray-500 ml-5">
                      {{ item.kmfim }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   <div class="flex items-center gap-2">
                      <Fuel class="h-4 w-4 text-gray-400" />
                      {{ getDescricaoCombustivel(item) }}
                   </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex flex-col">
                    <div class="flex items-center gap-1 font-medium">
                        <Droplets class="h-3 w-3 text-blue-500" />
                        {{ item.volume }} L
                    </div>
                    <div class="text-xs text-gray-400">
                        {{ formatCurrency(item.preco) }} / L
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                   {{ formatCurrency(item.total) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-3">
                    <button
                      @click="handleEdit(item)"
                      class="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button
                      @click="handleDelete(item.id_abast!)"
                      class="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="items.length === 0 && !isLoading" class="p-8 text-center text-gray-500">
            Nenhum abastecimento encontrado.
          </div>
           <div v-if="isLoading" class="p-8 text-center text-gray-500">
            Carregando...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
