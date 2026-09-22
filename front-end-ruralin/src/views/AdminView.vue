<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { toast } from 'vue3-toastify'
import { Users, Pencil, Trash2 } from 'lucide-vue-next'
import UsuarioModal from '../components/UsuarioModal.vue'
import type { Usuario } from '../types/Usuario'

// Modal state
const isModalOpen = ref(false)
const editingItem = ref<Usuario | null>(null)

// Summary Cards
const summaryCards = ref([
  {
    title: 'TOTAL DE USUÁRIOS',
    count: 0,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
])

const items = ref<Usuario[]>([])
const isLoading = ref(false)
const isSaving = ref(false)

const fetchItems = async () => {
  try {
    const { data } = await api.get('/usuarios')
    items.value = data
    updateSummaries()
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    toast.error('Erro ao carregar usuários.')
  }
}

const updateSummaries = () => {
  if (summaryCards.value[0]) {
    summaryCards.value[0].count = items.value.length
  }
}

const handleSave = async (data: Usuario) => {
  if (isSaving.value) return

  isSaving.value = true
  const isEditing = editingItem.value && editingItem.value.id !== undefined

  const payload = {
    ...data,
    ...(isEditing && { id: editingItem.value!.id }),
    ...(!isEditing && { tipo: data.tipo || 'ROOT' }), // Use password from modal if available
    ...(!isEditing && { senha: data.senha || 'MinhaSenha@123' }), // Use password from modal if available
  }

  try {
    if (isEditing) {
      await api.put(`/usuarios/${editingItem.value!.id}`, payload)
    } else {
      await api.post('/usuarios', payload)
    }

    await fetchItems()

    toast.success(isEditing ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!')

    isModalOpen.value = false
  } catch (error) {
    console.error('Erro ao salvar usuário:', error)
    toast.error('Erro ao salvar o usuário. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}

const handleEdit = (id: number) => {
  const item = items.value.find((item) => item.id === id)
  if (item) {
    editingItem.value = item
    isModalOpen.value = true
  }
}

const handleAdd = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir este usuário?')) {
    try {
      await api.delete(`/usuarios/${id}`)
      items.value = items.value.filter((item) => item.id !== id)
      updateSummaries()
      toast.success('Usuário excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      toast.error('Erro ao excluir o usuário. Tente novamente.')
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
          <h1 class="text-4xl font-bold text-gray-900">Administrador</h1>
          <p class="text-gray-500 mt-1">Gerencie os usuários do sistema</p>
        </div>
        <button @click="handleAdd"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors">
          <Users class="h-4 w-4 mr-2" />
          Novo Usuário
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="(card, index) in summaryCards" :key="index"
          class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div :class="[card.iconBg, 'p-3 rounded-full flex-shrink-0']">
            <Users :class="[card.iconColor, 'h-6 w-6']" />
          </div>
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              {{ card.title }}
            </p>
            <p class="text-xl font-bold text-gray-900">
              {{ card.count }} <span class="text-sm font-normal text-gray-500">Registros</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100">
          <h2 class="text-lg font-bold text-gray-900">Usuários</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  WhatsApp
                </th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ item.nome }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    item.tipo === 'ROOT' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  ]">
                    {{ item.tipo }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.whatsapp }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-3">
                    <button @click="handleEdit(item.id!)" class="text-gray-400 hover:text-gray-600 transition-colors">
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button @click="handleDelete(item.id!)" class="text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-gray-500 text-sm">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
