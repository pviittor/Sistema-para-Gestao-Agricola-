<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { Save, Upload } from 'lucide-vue-next'
import type { ConfiguracaoRecibo } from '@/types/Recibo'
import { configuracaoReciboService } from '@/services/configuracaoReciboService'

const isLoading = ref(false)
const isSaving = ref(false)
const existingId = ref<number | null>(null)

const form = ref({
  nomePropriedade: '',
  cnpjCpf: '',
  inscricaoEstadual: '',
  endereco: '',
  telefone: '',
  logoBase64: '',
  observacaoPadrao: '',
  localPadrao: '',
})

const logoPreview = ref<string | null>(null)

const fetchConfig = async () => {
  isLoading.value = true
  try {
    const config = await configuracaoReciboService.getMinhaConfig()
    if (config && config.id) {
      existingId.value = config.id
      form.value = {
        nomePropriedade: config.nomePropriedade || '',
        cnpjCpf: config.cnpjCpf || '',
        inscricaoEstadual: config.inscricaoEstadual || '',
        endereco: config.endereco || '',
        telefone: config.telefone || '',
        logoBase64: config.logoBase64 || '',
        observacaoPadrao: config.observacaoPadrao || '',
        localPadrao: config.localPadrao || '',
      }
      if (config.logoBase64) logoPreview.value = config.logoBase64
    }
  } catch (error) {
    // No config yet - that's OK
  } finally {
    isLoading.value = false
  }
}

const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    toast.error('Apenas PNG ou JPG são aceitos.')
    return
  }
  if (file.size > 200 * 1024) {
    toast.error('Logo deve ter no máximo 200KB.')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target?.result as string
    form.value.logoBase64 = base64
    logoPreview.value = base64
  }
  reader.readAsDataURL(file)
}

const removeLogo = () => {
  form.value.logoBase64 = ''
  logoPreview.value = null
}

const handleSave = async () => {
  if (!form.value.nomePropriedade) {
    toast.error('Nome da propriedade é obrigatório.')
    return
  }
  isSaving.value = true
  try {
    if (existingId.value) {
      await configuracaoReciboService.update(existingId.value, form.value)
      toast.success('Configuração atualizada com sucesso!')
    } else {
      const result = await configuracaoReciboService.create(form.value)
      existingId.value = result.id
      toast.success('Configuração criada com sucesso!')
    }
  } catch (error: any) {
    const msg = error?.response?.data?.error?.message || 'Erro ao salvar.'
    toast.error(msg)
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchConfig)
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <div class="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 class="text-4xl font-bold text-gray-900">Configuração de Recibos</h1>
        <p class="text-gray-500 mt-1">Configure o modelo de impressão dos recibos da sua fazenda</p>
      </div>

      <div v-if="isLoading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-lime-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <form v-else @submit.prevent="handleSave" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Propriedade *</label>
          <input v-model="form.nomePropriedade" type="text" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500" placeholder="Ex: Fazenda São João" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">CNPJ/CPF</label>
            <input v-model="form.cnpjCpf" type="text" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual</label>
            <input v-model="form.inscricaoEstadual" type="text" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
          <input v-model="form.endereco" type="text" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input v-model="form.telefone" type="text" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Local Padrão de Emissão</label>
            <input v-model="form.localPadrao" type="text" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500" placeholder="Ex: Ribeirão Preto/SP" />
          </div>
        </div>

        <!-- Logo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Logotipo (PNG/JPG, max 200KB)</label>
          <div class="flex items-center gap-4">
            <div v-if="logoPreview" class="w-20 h-20 border rounded-lg overflow-hidden">
              <img :src="logoPreview" class="w-full h-full object-contain" />
            </div>
            <div class="flex gap-2">
              <label class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                <Upload class="h-4 w-4 mr-2" />
                {{ logoPreview ? 'Trocar' : 'Upload' }}
                <input type="file" accept="image/png,image/jpeg" class="hidden" @change="handleLogoUpload" />
              </label>
              <button v-if="logoPreview" type="button" @click="removeLogo" class="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">Remover</button>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Observação Padrão</label>
          <textarea v-model="form.observacaoPadrao" rows="3" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500" placeholder="Texto impresso em todos os recibos"></textarea>
        </div>

        <div class="flex justify-end pt-4 border-t border-gray-100">
          <button type="submit" :disabled="isSaving" class="inline-flex items-center px-6 py-2 bg-lime-600 text-white rounded-lg text-sm font-medium hover:bg-lime-700 disabled:opacity-50 transition-colors">
            <Save class="h-4 w-4 mr-2" />
            {{ isSaving ? 'Salvando...' : 'Salvar Configuração' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
