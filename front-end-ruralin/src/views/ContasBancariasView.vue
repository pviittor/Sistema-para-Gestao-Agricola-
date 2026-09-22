<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2, Search, Wallet, Landmark } from 'lucide-vue-next'
import ContasBancariasModal from '@/components/ContasBancariasModal.vue'
import type { Conta } from '@/types/Conta'
import { TipoConta } from '@/types/Conta'
import { contaService } from '@/services/contaService'
import { bancoService } from '@/services/bancoService'
import type { Banco } from '@/types/Banco'

// Modal state
const isModalOpen = ref(false)
const isSaving = ref(false)
const editingItem = ref<Conta | null>(null)

// List state
const items = ref<Conta[]>([])
const bancos = ref<Banco[]>([])
const searchTerm = ref('')
const isLoading = ref(false)

const getBancoNome = (id: number) => {
  const banco = bancos.value.find((b) => b.id === id)
  return banco ? banco.nome : 'Desconhecido'
}

const fetchBancos = async () => {
  try {
    const result = await bancoService.getAllNoPagination()
    bancos.value = result.data
  } catch (error) {
    console.error('Erro ao buscar bancos:', error)
    toast.error('Erro ao carregar lista de bancos.')
  }
}

const fetchItems = async () => {
  isLoading.value = true
  try {
    const result = await contaService.getAll(1, 100)
    items.value = result.data.data
  } catch (error) {
    console.error('Erro ao buscar contas:', error)
    toast.error('Erro ao carregar contas.')
  } finally {
    isLoading.value = false
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSave = async (data: Conta) => {
  isSaving.value = true
  try {
    if (data.id) {
      await contaService.update(data.id, data)
      toast.success('Conta atualizada com sucesso!')
    } else {
      await contaService.create(data)
      toast.success('Conta criada com sucesso!')
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

const handleEdit = (item: Conta) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta conta?')) {
    try {
      await contaService.delete(id)
      toast.success('Conta excluída com sucesso!')
      fetchItems()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir. Tente novamente.')
    }
  }
}

onMounted(() => {
  fetchItems()
  fetchBancos()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <ContasBancariasModal
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
          <h1 class="text-4xl font-bold text-gray-900">Contas Bancárias</h1>
          <p class="text-gray-500 mt-1">Gerencie suas contas bancárias e caixas</p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Nova Conta
        </button>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <h2 class="text-lg font-bold text-gray-900 self-center">Lista de Contas</h2>

          <div class="relative w-full sm:w-64">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-4 w-4 text-gray-400" />
            </div>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar conta..."
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Nome
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Tipo
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Banco
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Agência / Conta
                </th>
                <th
                  class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Saldo Inicial
                </th>
                <th
                  class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Status
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
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div class="flex items-center gap-3">
                    <div
                      class="h-8 w-8 rounded-full flex items-center justify-center"
                      :class="
                        item.tipo === TipoConta.BANCO
                          ? 'bg-green-100 text-green-600'
                          : 'bg-blue-100 text-blue-600'
                      "
                    >
                      <Landmark v-if="item.tipo === TipoConta.BANCO" class="h-4 w-4" />
                      <Wallet v-else class="h-4 w-4" />
                    </div>
                    <div>
                      {{ item.nome }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span class="text-gray-500 italic"> Caixa Interno </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span class="font-medium text-gray-700">
                    {{ getBancoNome(item.bancoId) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div v-if="item.tipo === TipoConta.BANCO">
                    <div class="flex flex-col">
                      <span class="text-xs text-gray-400">Ag: {{ item.agencia }}</span>
                      <span class="text-xs text-gray-400">CC: {{ item.conta }}</span>
                    </div>
                  </div>
                  <div v-else class="text-gray-400">-</div>
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900"
                >
                  R$
                  {{
                    item.saldoInicial?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) ||
                    '0,00'
                  }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ item.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
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
                      @click="handleDelete(item.id!)"
                      class="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="items.length === 0 && !isLoading">
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                  Nenhuma conta cadastrada.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
