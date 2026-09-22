<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2, Calendar } from 'lucide-vue-next'
import FinanceiroModal from '../components/FinanceiroModal.vue'
import type {
  Financeiro,
  FinanceiroConta,
  FinanceiroHistorico,
  FinanceiroPlanoFinanceiro,
  FinanceiroTipoDocumento,
  FinanceiroTipoPagamento,
} from '../types/Financeiro'
import type { Usuario } from '@/types/Usuario'

// Modal state
const isModalOpen = ref(false)
const isSaving = ref(false)
const editingItem = ref<Financeiro | null>(null)

const items = ref<Financeiro[]>([])
const usuario = ref<Usuario | null>(null)

// Auxiliary lists
const contas = ref<FinanceiroConta[]>([])
const historicos = ref<FinanceiroHistorico[]>([])
const planos = ref<FinanceiroPlanoFinanceiro[]>([])
const tiposDocumento = ref<FinanceiroTipoDocumento[]>([])
const tiposPagamento = ref<FinanceiroTipoPagamento[]>([])

const fetchAuxiliaryLists = async () => {
  const apiUrl = usuario.value?.apiUrl || 'https://placeholder.ruralin.digital'
  if (!apiUrl) return

  try {
    const [resContas, resHistoricos, resPlanos, resTiposDoc, resTiposPag] = await Promise.all([
      axios.get(`${apiUrl}/api/Conta`),
      axios.get(`${apiUrl}/api/Historico`),
      axios.get(`${apiUrl}/api/PlanoFinanceiro`),
      axios.get(`${apiUrl}/api/TipoDocumento`),
      axios.get(`${apiUrl}/api/TipoPagamento`),
    ])

    contas.value = resContas.data
    historicos.value = resHistoricos.data
    planos.value = resPlanos.data
    tiposDocumento.value = resTiposDoc.data
    tiposPagamento.value = resTiposPag.data
  } catch (error) {
    console.error('Erro ao buscar listas auxiliares:', error)
  }
}

const fetchItems = async () => {
  try {
    const { data } = await api.get('/financeiro')
    items.value = data
  } catch (error) {
    console.error('Erro ao buscar lançamentos:', error)
    toast.error('Erro ao carregar lançamentos.')
  }
}

const fetchMeuUsuario = async () => {
  try {
    const { data } = await api.get('/usuarios/me')
    usuario.value = data
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    toast.error('Erro ao carregar usuário.')
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSave = async (data: Partial<Financeiro>) => {
  const isEditing = editingItem.value && editingItem.value.id !== undefined
  isSaving.value = true

  const payload = {
    ...data,
    ...(isEditing && { id: editingItem.value!.id }),
  }

  try {
    if (isEditing) {
      const { status } = await api.put(`/financeiro/${editingItem.value!.id}`, payload)
      if (status >= 200 && status < 300) {
        toast.success('Lançamento atualizado!')
        isModalOpen.value = false
        fetchItems()
      }
    } else {
      const { status } = await api.post('/financeiro', payload)
      if (status >= 200 && status < 300) {
        toast.success('Lançamento criado!')
        isModalOpen.value = false
        fetchItems()
      }
    }
  } catch {
    toast.error('Erro ao salvar. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}

const handleEdit = (id: number) => {
  const item = items.value.find((i) => i.id === id)
  if (item) {
    editingItem.value = item
    isModalOpen.value = true
  }
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir?')) {
    try {
      const { status } = await api.delete(`/financeiro/${id}`)
      if (status >= 200 && status < 300) {
        toast.success('Excluído com sucesso!')
        fetchItems()
      }
    } catch {
      toast.error('Erro ao excluir.')
    }
  }
}

onMounted(async () => {
  await fetchMeuUsuario()
  await fetchItems()
  await fetchAuxiliaryLists()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <FinanceiroModal
      :is-open="isModalOpen"
      :initial-data="editingItem"
      :loading="isSaving"
      :api-url="usuario?.apiUrl || 'https://placeholder.ruralin.digital'"
      :contas="contas"
      :historicos="historicos"
      :planos="planos"
      :tipos-documento="tiposDocumento"
      :tipos-pagamento="tiposPagamento"
      @close="isModalOpen = false"
      @save="handleSave"
    />
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Financeiro</h1>
          <p class="text-gray-500 mt-1">Gerencie seus lançamentos financeiros</p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Novo Lançamento
        </button>
      </div>

      <!-- List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100">
          <h2 class="text-lg font-bold text-gray-900">Lançamentos</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Data de Emissão
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Data de Vencimento
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Conta
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Histórico
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Valor
                </th>
                <th
                  class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex items-center gap-2">
                    <Calendar class="h-4 w-4 text-gray-400" />
                    {{ new Date(item.dataEmissao + 'T12:00:00').toLocaleDateString('pt-BR') }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex items-center gap-2">
                    <Calendar class="h-4 w-4 text-gray-400" />
                    {{ new Date(item.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR') }}
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ item.contaDesc || '-' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ item.historicoDesc || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  R$ {{ Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-3">
                    <button @click="handleEdit(item.id!)" class="text-gray-400 hover:text-gray-600">
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button
                      @click="handleDelete(item.id!)"
                      class="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500 text-sm">
                  Nenhum lançamento encontrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
