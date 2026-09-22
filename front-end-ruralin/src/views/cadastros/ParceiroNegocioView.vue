<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2, Search } from 'lucide-vue-next'
import ParceiroNegocioModal from '@/components/ParceiroNegocioModal.vue'
import type { ParceiroNegocio } from '@/types/ParceiroNegocio'
import { parceiroNegocioService } from '@/services/parceiroNegocioService'
import { maskCPF, maskCNPJ, maskPhone } from '@/utils/masks'

// Modal state
const isModalOpen = ref(false)
const editingItem = ref<ParceiroNegocio | null>(null)

// History table
const items = ref<ParceiroNegocio[]>([])
const searchTerm = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

const fetchParceiros = async () => {
  isLoading.value = true
  try {
    const response = await parceiroNegocioService.getAll()
    if (response) {
      items.value = response.data
    } else {
      toast.error('Falha ao carregar parceiros')
    }
  } catch {
    toast.error('Erro ao carregar lista de parceiros')
  } finally {
    isLoading.value = false
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSave = async (data: ParceiroNegocio) => {
  if (isSaving.value) return

  isSaving.value = true

  const isEditing = editingItem.value && editingItem.value.id_pessoa !== undefined

  try {
    if (isEditing) {
      await parceiroNegocioService.update(editingItem.value!.id_pessoa!, data)
    } else {
      await parceiroNegocioService.create(data)
    }

    toast.success(isEditing ? 'Parceiro atualizado com sucesso!' : 'Parceiro criado com sucesso!')
    isModalOpen.value = false
    await fetchParceiros()
  } catch (error) {
    console.error('Erro ao salvar:', error)
    toast.error('Erro ao salvar. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}

const handleEdit = (item: ParceiroNegocio) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir este parceiro?')) {
    try {
      await parceiroNegocioService.delete(id)
      toast.success('Parceiro excluído com sucesso!')
      await fetchParceiros()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir. Tente novamente.')
    }
  }
}

onMounted(() => {
  fetchParceiros()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <ParceiroNegocioModal
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
          <h1 class="text-4xl font-bold text-gray-900">Parceiros de Negócio</h1>
          <p class="text-gray-500 mt-1">Gerencie clientes, fornecedores e outros parceiros</p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Novo Parceiro
        </button>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <h2 class="text-lg font-bold text-gray-900 self-center">Lista de Parceiros</h2>

          <div class="relative w-full sm:w-64">
             <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search class="h-4 w-4 text-gray-400" />
              </div>
            <input
                v-model="searchTerm"
                type="text"
                placeholder="Buscar parceiro..."
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Cód.
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Razão Social / Nome
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  CPF / CNPJ
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                 <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in items" :key="item.id_pessoa" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.id_pessoa }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ item.nomerazao_pessoa }}
                   <div v-if="item.nomefantasia_pessoa" class="text-xs text-gray-400 font-normal">{{ item.nomefantasia_pessoa }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.cpfcnpj_pessoa?.length == 11 ? maskCPF(item.cpfcnpj_pessoa || '') : maskCNPJ(item.cpfcnpj_pessoa || '') }}
                </td>
                 <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div v-if="item.telefone1_pessoa">{{ maskPhone(item.telefone1_pessoa) }}</div>
                  <div v-if="item.email_pessoa" class="text-xs text-gray-400">{{ item.email_pessoa }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span v-if="item.cliente_pessoa" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1">Cliente</span>
                    <span v-if="item.fornecedor_pessoa" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mr-1">Fornecedor</span>
                    <span v-if="item.produtor_pessoa" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-1">Produtor</span>
                    <!-- Add more badges as needed -->
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
                      @click="handleDelete(item.id_pessoa!)"
                      class="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-500 text-sm">
                  <div v-if="isLoading">Carregando...</div>
                  <div v-else>Nenhum parceiro encontrado.</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
