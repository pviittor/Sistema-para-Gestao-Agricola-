<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CampoCondicionalTipoAtividade } from '@/types/TipoAtividadeOS'

const props = defineProps<{
  campos: CampoCondicionalTipoAtividade[]
  valores: Record<string, any>
  disabled?: boolean
}>()

const emit = defineEmits<{
  update: [newValues: Record<string, any>]
}>()

const errosValidacao = ref<Record<string, string>>({})

const sortedCampos = computed(() => {
  return [...props.campos].sort((a, b) => a.ordem - b.ordem)
})

function handleChange(nomeCampo: string, value: any) {
  // Limpar erro ao preencher
  if (errosValidacao.value[nomeCampo]) {
    delete errosValidacao.value[nomeCampo]
  }
  emit('update', { ...props.valores, [nomeCampo]: value })
}

function validar(): boolean {
  errosValidacao.value = {}
  let valido = true
  for (const campo of props.campos) {
    if (campo.obrigatorio) {
      const val = props.valores[campo.nomeCampo]
      if (val === undefined || val === null || val === '') {
        errosValidacao.value[campo.nomeCampo] = 'Campo obrigatorio'
        valido = false
      }
    }
  }
  return valido
}

defineExpose({ validar })
</script>

<template>
  <div v-if="sortedCampos.length > 0" class="space-y-4">
    <h4 class="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">
      Campos Condicionais
    </h4>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="campo in sortedCampos" :key="campo.nomeCampo">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ campo.rotulo }}
          <span v-if="campo.obrigatorio" class="text-red-500">*</span>
          <span v-if="campo.unidade" class="text-gray-400 text-xs ml-1">({{ campo.unidade }})</span>
        </label>

        <!-- TEXT -->
        <input
          v-if="campo.tipoCampo === 'TEXT'"
          type="text"
          :value="valores[campo.nomeCampo] || ''"
          :disabled="disabled"
          @input="handleChange(campo.nomeCampo, ($event.target as HTMLInputElement).value)"
          class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          :class="errosValidacao[campo.nomeCampo] ? 'border-red-400' : 'border-gray-200'"
        />

        <!-- NUMBER -->
        <div v-else-if="campo.tipoCampo === 'NUMBER'" class="relative">
          <input
            type="number"
            :value="valores[campo.nomeCampo] ?? ''"
            :disabled="disabled"
            @input="handleChange(campo.nomeCampo, Number(($event.target as HTMLInputElement).value))"
            class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            :class="errosValidacao[campo.nomeCampo] ? 'border-red-400' : 'border-gray-200'"
          />
          <span
            v-if="campo.unidade"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"
          >
            {{ campo.unidade }}
          </span>
        </div>

        <!-- DATE -->
        <input
          v-else-if="campo.tipoCampo === 'DATE'"
          type="date"
          :value="valores[campo.nomeCampo] || ''"
          :disabled="disabled"
          @input="handleChange(campo.nomeCampo, ($event.target as HTMLInputElement).value)"
          class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          :class="errosValidacao[campo.nomeCampo] ? 'border-red-400' : 'border-gray-200'"
        />

        <!-- BOOLEAN -->
        <label
          v-else-if="campo.tipoCampo === 'BOOLEAN'"
          class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer"
          :class="{ 'opacity-60 cursor-not-allowed': disabled }"
        >
          <input
            type="checkbox"
            :checked="!!valores[campo.nomeCampo]"
            :disabled="disabled"
            @change="handleChange(campo.nomeCampo, ($event.target as HTMLInputElement).checked)"
            class="h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
          />
          <span class="text-sm text-gray-700">{{ valores[campo.nomeCampo] ? 'Sim' : 'Nao' }}</span>
        </label>

        <!-- SELECT -->
        <select
          v-else-if="campo.tipoCampo === 'SELECT'"
          :value="valores[campo.nomeCampo] || ''"
          :disabled="disabled"
          @change="handleChange(campo.nomeCampo, ($event.target as HTMLSelectElement).value)"
          class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          :class="errosValidacao[campo.nomeCampo] ? 'border-red-400' : 'border-gray-200'"
        >
          <option value="">Selecione...</option>
          <option
            v-for="opcao in (campo.opcoes || [])"
            :key="opcao"
            :value="opcao"
          >
            {{ opcao }}
          </option>
        </select>

        <!-- Erro de validacao -->
        <p v-if="errosValidacao[campo.nomeCampo]" class="text-xs text-red-500 mt-1">
          {{ errosValidacao[campo.nomeCampo] }}
        </p>
      </div>
    </div>
  </div>
</template>
