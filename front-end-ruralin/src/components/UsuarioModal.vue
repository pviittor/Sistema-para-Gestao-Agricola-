<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Briefcase,
  Shield,
  Eye,
  EyeOff
} from 'lucide-vue-next'
import type { Usuario } from '../types/Usuario'
import type { Role } from '../types/Role'
import { roleService } from '../services/roleService'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  isOpen: boolean
  initialData?: Usuario | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const rolesOptions = ref<Role[]>([])
const isPasswordVisible = ref(false)

const formData = ref<Partial<Usuario> & { password?: string; roleIds: number[] }>({
  nome: '',
  username: '',
  email: '',
  whatsapp: '',
  tipo: 'CLIENT',
  password: '',
  roleIds: []
})

const fetchRoles = async () => {
  try {
    const result = await roleService.getAll()
    result.sort((r1: Role, r2: Role) => {
      return r1.nome.localeCompare(r2.nome);
    });
    // The service returns PaginatedResult<Role> or Role[]?
    // Let's check roleService.ts again. 
    // It returns data.data which is Role[].
    rolesOptions.value = result.filter((r) => {
      return r.id != 7;
    }) || []
  } catch (error) {
    console.error('Erro ao buscar roles:', error)
    toast.error('Erro ao carregar perfis de acesso.')
  }
}

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.initialData) {
        formData.value = {
          ...props.initialData,
          password: '', // Don't show existing password hash
          roleIds: props.initialData.roles?.map(r => r.id!) || []
        }
      } else {
        formData.value = {
          nome: '',
          username: '',
          email: '',
          whatsapp: '',
          tipo: 'CLIENT',
          password: '',
          roleIds: []
        }
      }
    }
  }
)

onMounted(() => {
  fetchRoles()
})

const handleSave = () => {
  if (props.loading) return

  if (!formData.value.nome) {
    toast.warning('O nome é obrigatório.')
    return
  }
  if (!formData.value.username) {
    toast.warning('O usuário (login) é obrigatório.')
    return
  }
  if (!formData.value.email) {
    toast.warning('O e-mail é obrigatório.')
    return
  }
  if (!props.initialData && !formData.value.password) {
    toast.warning('A senha é obrigatória para novos usuários.')
    return
  }

  // Prepare payload
  const payload = {
    ...formData.value,
    senha: formData.value.password // Map password to senha for DTO
  }

  // Remove helper fields if needed or let parent handle
  delete payload.password

  emit('save', payload)
}

const toggleRole = (roleId: number) => {
  const index = formData.value.roleIds.indexOf(roleId)
  if (index === -1) {
    formData.value.roleIds.push(roleId)
  } else {
    formData.value.roleIds.splice(index, 1)
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
        <div>
          <h2 class="text-xl font-bold text-gray-900">
            {{ props.initialData ? 'Editar Usuário' : 'Novo Usuário' }}
          </h2>
          <p class="text-sm text-gray-500 mt-1">Preencha os dados do usuário e suas permissões</p>
        </div>
        <button @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto custom-scrollbar space-y-6">

        <!-- Identificação -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <User class="w-4 h-4" /> Dados Pessoais
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Nome Completo</label>
              <div class="relative">
                <input v-model="formData.nome" type="text" placeholder="Ex: João Silva"
                  class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all" />
                <User class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Nome de Usuário (Login)</label>
              <div class="relative">
                <input v-model="formData.username" type="text" placeholder="Ex: joao.silva"
                  class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all" />
                <Shield class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">E-mail</label>
              <div class="relative">
                <input v-model="formData.email" type="email" placeholder="Ex: joao@email.com"
                  class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all" />
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">WhatsApp</label>
              <div class="relative">
                <input v-model="formData.whatsapp" type="tel" placeholder="Ex: 11999999999"
                  class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all" />
                <Phone class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-100 pt-4 space-y-4">
          <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Lock class="w-4 h-4" /> Segurança
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Tipo de Conta</label>
              <div class="relative">
                <select v-model="formData.tipo"
                  class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all appearance-none bg-white">
                  <option value="CLIENT">Usuário Padrão (Client)</option>
                  <option value="ROOT">Super Administrador (Root)</option>
                </select>
                <Briefcase class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">
                {{ props.initialData ? 'Nova Senha (Opcional)' : 'Senha' }}
              </label>
              <div class="relative">
                <input v-model="formData.password" :type="isPasswordVisible ? 'text' : 'password'"
                  placeholder="********"
                  class="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all" />
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <button type="button" @click="isPasswordVisible = !isPasswordVisible"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                  <component :is="isPasswordVisible ? EyeOff : Eye" class="h-4 w-4" />
                </button>
              </div>
              <p v-if="props.initialData" class="text-xs text-gray-500 mt-1">Deixe em branco para manter a senha atual.
              </p>
            </div>
          </div>
        </div>

        <!-- Roles -->
        <div class="border-t border-gray-100 pt-4 space-y-4">
          <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Shield class="w-4 h-4" /> Perfis de Acesso (Roles)
          </h3>

          <div v-if="rolesOptions.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="role in rolesOptions" :key="role.id" @click="toggleRole(role.id!)"
              class="flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50"
              :class="formData.roleIds.includes(role.id!) ? 'border-lime-500 bg-lime-50 ring-1 ring-lime-500' : 'border-gray-200'">
              <div class="flex items-center h-5">
                <input type="checkbox" :checked="formData.roleIds.includes(role.id!)"
                  class="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-300 rounded" />
              </div>
              <div class="ml-3 text-sm">
                <label class="font-medium text-gray-700 cursor-pointer select-none">
                  {{ role.nome }}
                </label>
              </div>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500 italic">
            Nenhum perfil encontrado.
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <button @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
          Cancelar
        </button>
        <button @click="handleSave" :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <span v-if="loading" class="animate-spin mr-2">⏳</span>
          {{ loading ? 'Salvando...' : 'Salvar Usuário' }}
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
