<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { Mail, Lock, Eye, EyeOff, User, Phone, Briefcase } from 'lucide-vue-next'
import backgroundImage from '@/assets/background.jpg'
import logoImage from '@/assets/logo.jpg'

const router = useRouter()

// Estado do formulário
const nome = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const whatsapp = ref('')
const tipo = ref('Produtor')
const isPasswordVisible = ref(false)
const isLoading = ref(false)

// Estado de validação (simples)
const touched = ref({
  nome: false,
  username: false,
  email: false,
  password: false,
  whatsapp: false,
  tipo: false
})

// Validações
const isEmailValid = computed(() => {
  return email.value.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
})

const isPasswordValid = computed(() => password.value.length >= 6)
const isNomeValid = computed(() => nome.value.length >= 3)
const isUsernameValid = computed(() => username.value.length >= 3)
const isWhatsappValid = computed(() => whatsapp.value.length >= 10) // Basic length check

const isFormValid = computed(() => 
  isEmailValid.value && 
  isPasswordValid.value && 
  isNomeValid.value && 
  isUsernameValid.value && 
  isWhatsappValid.value &&
  tipo.value.length > 0
)

// Ações
const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

const onSubmit = async () => {
  Object.keys(touched.value).forEach(key => {
    touched.value[key as keyof typeof touched.value] = true
  }) 

 /* if (isFormValid.value) {
    isLoading.value = true
    try {
      await register({
        nome: nome.value,
        username: username.value,
        email: email.value,
        senha: password.value,
        whatsapp: whatsapp.value,
        tipo: tipo.value
      })

      toast.success('Cadastro realizado com sucesso!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Register error:', error)
      const msg = error.response?.data?.error || 'Erro ao realizar cadastro.'
      toast.error(msg)
    } finally {
      isLoading.value = false
    }
  }
}*/
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat p-4"
    :style="{ backgroundImage: `linear-gradient(rgba(255,255,255,0.3), rgba(255,255,255,0.3)), url(${backgroundImage})` }"
  >
    <div class="w-full max-w-[500px] rounded-2xl shadow-2xl overflow-hidden bg-white my-8">
      <!-- Header / Logo Area -->
      <div class="bg-lime-700 text-center relative overflow-hidden py-4">
        <img :src="logoImage" alt="Rural In" class="brightness-0 invert h-32 mx-auto" />
      </div>

      <!-- Content -->
      <div class="p-8">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Criar Conta</h2>
        
        <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
          
          <!-- Nome -->
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <div class="relative">
              <input
                v-model="nome"
                type="text"
                placeholder="Seu Nome"
                class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                :class="{ 'border-red-500 focus:ring-red-200': touched.nome && !isNomeValid }"
                @blur="touched.nome = true"
              />
              <User class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <div v-if="touched.nome && !isNomeValid" class="mt-1 text-xs text-red-500">
              Nome deve ter pelo menos 3 caracteres
            </div>
          </div>

          <!-- Username -->
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome de Usuário (Login)</label>
            <div class="relative">
              <input
                v-model="username"
                type="text"
                placeholder="usuario.login"
                class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                :class="{ 'border-red-500 focus:ring-red-200': touched.username && !isUsernameValid }"
                @blur="touched.username = true"
              />
              <User class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <div v-if="touched.username && !isUsernameValid" class="mt-1 text-xs text-red-500">
              Username deve ter pelo menos 3 caracteres
            </div>
          </div>

          <!-- E-mail -->
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <div class="relative">
              <input
                v-model="email"
                type="email"
                placeholder="seu@email.com"
                class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                :class="{ 'border-red-500 focus:ring-red-200': touched.email && !isEmailValid }"
                @blur="touched.email = true"
              />
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <div v-if="touched.email && !isEmailValid" class="mt-1 text-xs text-red-500">
              E-mail inválido
            </div>
          </div>

          <!-- Whatsapp -->
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <div class="relative">
              <input
                v-model="whatsapp"
                type="text"
                placeholder="11999999999"
                class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                :class="{ 'border-red-500 focus:ring-red-200': touched.whatsapp && !isWhatsappValid }"
                @blur="touched.whatsapp = true"
              />
              <Phone class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <div v-if="touched.whatsapp && !isWhatsappValid" class="mt-1 text-xs text-red-500">
              WhatsApp inválido
            </div>
          </div>

          <!-- Tipo -->
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Usuário</label>
            <div class="relative">
              <select
                v-model="tipo"
                class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none bg-white"
              >
                <option value="Produtor">Produtor</option>
                <option value="Técnico">Técnico</option>
                <option value="Administrador">Administrador</option>
              </select>
              <Briefcase class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>

          <!-- Password -->
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div class="relative">
              <input
                v-model="password"
                :type="isPasswordVisible ? 'text' : 'password'"
                placeholder="********"
                class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                :class="{
                  'border-red-500 focus:ring-red-200': touched.password && !isPasswordValid,
                }"
                @blur="touched.password = true"
              />
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <component :is="isPasswordVisible ? EyeOff : Eye" class="h-5 w-5" />
              </button>
            </div>
            <div v-if="touched.password && !isPasswordValid" class="mt-1 text-xs text-red-500">
              Mínimo de 6 caracteres
            </div>
          </div>

          <button
            type="submit"
            class="w-full py-4 text-lg font-medium rounded-lg mt-2 shadow-md hover:shadow-lg transition-all text-white bg-lime-600 hover:bg-lime-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!isFormValid || isLoading"
          >
            {{ isLoading ? 'CADASTRANDO...' : 'CADASTRAR' }}
          </button>

          <div class="text-center mt-4">
            <router-link to="/" class="text-sm text-lime-700 hover:underline">
              Já tem uma conta? Faça login
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>