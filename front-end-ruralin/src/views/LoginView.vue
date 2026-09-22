<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/services/auth'
import { toast } from 'vue3-toastify'
import { Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'
import backgroundImage from '@/assets/background.jpg'
import backgroundImageKompier from '@/assets/backgroundKompier.png'
import logoImage from '@/assets/logo.jpg'
import logoKompierImage from '@/assets/logoKompier.png'

const router = useRouter()

// Estado do formulário
const email = ref('')
const password = ref('')
const isPasswordVisible = ref(false)
const isLoading = ref(false)

// Estado de validação (simples)
const emailTouched = ref(false)
const passwordTouched = ref(false)

// Validações
const isEmailValid = computed(() => {
  return email.value.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
})

const isEmailEmpty = computed(() => email.value.length === 0)

const isPasswordValid = computed(() => {
  return password.value.length >= 6
})

const isPasswordEmpty = computed(() => password.value.length === 0)

const isFormValid = computed(() => isEmailValid.value && isPasswordValid.value)

const currentLogo = computed(() => {
  const hostname = window.location.hostname
  if (hostname.includes('kompier')) {
    return logoKompierImage
  }
  return logoImage
})

const currentBackground = computed(() => {
  const hostname = window.location.hostname
  if (hostname.includes('kompier')) {
    return backgroundImageKompier
  }
  return backgroundImage
})

const currentTheme = computed(() => {
  const hostname = window.location.hostname
  if (hostname.includes('kompier')) {
    return {
      headerBg: 'bg-amber-900',
      buttonBg: 'bg-amber-800 hover:bg-amber-900',
      ringColor: 'focus:ring-amber-500',
    }
  }
  return {
    headerBg: 'bg-lime-700',
    buttonBg: 'bg-lime-600 hover:bg-lime-700',
    ringColor: 'focus:ring-primary',
  }
})

// Ações
const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

const onSubmit = async () => {
  emailTouched.value = true
  passwordTouched.value = true

  if (isFormValid.value) {
    isLoading.value = true
    try {
      await login(email.value, password.value)

      toast.success('Login realizado com sucesso!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Erro ao realizar login. Verifique suas credenciais.')
    } finally {
      isLoading.value = false
    }
  }
}
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat p-4"
    :style="{
      backgroundImage: `linear-gradient(rgba(255,255,255,0.3), rgba(255,255,255,0.3)), url(${currentBackground})`,
    }"
  >
    <div class="w-full max-w-[400px] rounded-2xl shadow-2xl overflow-hidden bg-white">
      <!-- Header / Logo Area -->
      <div :class="[currentTheme.headerBg, 'text-center relative overflow-hidden']">
        <img :src="currentLogo" alt="Rural In" class="brightness-0 invert h-48 mx-auto" />
      </div>

      <!-- Content -->
      <div class="p-8">
        <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
          <!-- E-mail Field -->
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
            <div class="relative">
              <input
                v-model="email"
                type="email"
                placeholder="gabriel@ruralin.digital"
                class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                :class="[{ 'border-red-500 focus:ring-red-200': emailTouched && !isEmailValid }, currentTheme.ringColor]"
                @blur="emailTouched = true"
              />
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <div v-if="emailTouched && !isEmailValid" class="mt-1 text-xs text-red-500">
              <span v-if="isEmailEmpty">O e-mail é obrigatório</span>
              <span v-else>E-mail inválido</span>
            </div>
          </div>

          <!-- Password Field -->
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div class="relative">
              <input
                v-model="password"
                :type="isPasswordVisible ? 'text' : 'password'"
                placeholder="********"
                class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                :class="[
                  {
                    'border-red-500 focus:ring-red-200': passwordTouched && !isPasswordValid,
                  },
                  currentTheme.ringColor,
                ]"
                @blur="passwordTouched = true"
              />
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                :aria-label="isPasswordVisible ? 'Ocultar senha' : 'Exibir senha'"
                :aria-pressed="isPasswordVisible"
              >
                <component :is="isPasswordVisible ? EyeOff : Eye" class="h-5 w-5" />
              </button>
            </div>
            <div v-if="passwordTouched && !isPasswordValid" class="mt-1 text-xs text-red-500">
              <span v-if="isPasswordEmpty">A senha é obrigatória</span>
              <span v-else>Mínimo de 6 caracteres</span>
            </div>
          </div>

          <div class="flex justify-end -mt-2">
            <a
              href="#"
              class="text-xs text-black hover:text-gray-800 font-medium no-underline hover:underline transition-colors"
            >
              Esqueceu a senha?
            </a>
          </div>

          <button
            type="submit"
            class="w-full py-4 text-lg font-medium rounded-lg mt-2 shadow-md hover:shadow-lg transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
            :class="[currentTheme.buttonBg]"
            :disabled="!isFormValid || isLoading"
          >
            {{ isLoading ? 'CARREGANDO...' : 'ENTRAR' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Adicione estilos personalizados aqui se necessário, mas o Tailwind deve cobrir a maioria */
</style>
