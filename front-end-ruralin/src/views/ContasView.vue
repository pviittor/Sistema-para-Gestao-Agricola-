<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  User, 
  Shield, 
  Mail, 
  Phone,
  Briefcase
} from 'lucide-vue-next'
import UsuarioModal from '@/components/UsuarioModal.vue'
import type { Usuario } from '@/types/Usuario'
import { usuarioService } from '@/services/usuarioService'

// Modal state
const isModalOpen = ref(false)
const editingItem = ref<Usuario | null>(null)

// List state
const items = ref<Usuario[]>([])
const searchTerm = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

const filteredItems = computed(() => {
  if (!searchTerm.value) return items.value
  const lowerTerm = searchTerm.value.toLowerCase()
  return items.value.filter(item => 
    item.nome.toLowerCase().includes(lowerTerm) ||
    item.email.toLowerCase().includes(lowerTerm) ||
    item.username.toLowerCase().includes(lowerTerm)
  )
})

const fetchItems = async () => {
  isLoading.value = true
  try {
    const result = await usuarioService.getAll(1, 100)
    // Handle both paginated and flat responses if needed, though service defines PaginatedResult
    if (result && result.data) {
      items.value = result.data
    } else {
      items.value = []
    }
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    toast.error('Erro ao carregar usuários.')
  } finally {
    isLoading.value = false
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleSave = async (data: any) => {
  isSaving.value = true
  try {
    if (editingItem.value && editingItem.value.id) {
      await usuarioService.update(editingItem.value.id, data)
      toast.success('Usuário atualizado com sucesso!')
    } else {
      await usuarioService.create(data)
      toast.success('Usuário criado com sucesso!')
    }
    isModalOpen.value = false
    fetchItems()
  } catch (error: any) {
    console.error('Erro ao salvar:', error)
    // Show specific error message if available
    const msg = error.response?.data?.message || 'Erro ao salvar. Tente novamente.'
    toast.error(msg)
  } finally {
    isSaving.value = false
  }
}

const handleEdit = (item: Usuario) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir este usuário?')) {
    try {
      await usuarioService.delete(id)
      toast.success('Usuário excluído com sucesso!')
      fetchItems()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir. Tente novamente.')
    }
  }
}

onMounted(() => {
  fetchItems()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <UsuarioModal
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
          <h1 class="text-4xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p class="text-gray-500 mt-1">Gerencie os usuários e suas permissões de acesso ao sistema</p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Novo Usuário
        </button>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <h2 class="text-lg font-bold text-gray-900 self-center">Lista de Usuários</h2>

          <div class="relative w-full sm:w-64">
             <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search class="h-4 w-4 text-gray-400" />
              </div>
            <input
                v-model="searchTerm"
                type="text"
                placeholder="Buscar usuário..."
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tipo & Permissões
                </th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="isLoading">
                <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                  <div class="flex items-center justify-center gap-2">
                    <span class="animate-spin">⏳</span> Carregando usuários...
                  </div>
                </td>
              </tr>
              <tr v-else-if="filteredItems.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                  Nenhum usuário encontrado.
                </td>
              </tr>
              <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full bg-lime-100 flex items-center justify-center text-lime-600 font-bold text-lg">
                      {{ item.nome.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ item.nome }}</div>
                      <div class="text-xs text-gray-500 flex items-center gap-1">
                        <Mail class="h-3 w-3" /> {{ item.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col gap-1">
                    <div class="text-sm text-gray-900 flex items-center gap-1">
                      <Shield class="h-3 w-3 text-gray-400" />
                      {{ item.username }}
                    </div>
                    <div class="text-xs text-gray-500 flex items-center gap-1">
                      <Phone class="h-3 w-3" />
                      {{ item.whatsapp || '-' }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span 
                        class="px-2 py-0.5 text-xs rounded-full border"
                        :class="item.tipo === 'ROOT' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'"
                      >
                        {{ item.tipo }}
                      </span>
                    </div>
                    <div class="flex flex-wrap gap-1">
                      <span 
                        v-for="role in item.roles" 
                        :key="role.id"
                        class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200"
                      >
                        {{ role.nome }}
                      </span>
                      <span v-if="!item.roles || item.roles.length === 0" class="text-xs text-gray-400 italic">
                        Sem perfis
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-3">
                    <button
                      @click="handleEdit(item)"
                      class="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Editar"
                    >
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button
                      @click="handleDelete(item.id!)"
                      class="text-gray-400 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
