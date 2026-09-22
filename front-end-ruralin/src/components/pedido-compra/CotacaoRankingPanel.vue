<script setup lang="ts">
import { ref, watch } from 'vue'
import { toast } from 'vue3-toastify'
import { Trophy, Star, ChevronUp, ChevronDown } from 'lucide-vue-next'
import type { Cotacao } from '@/types/Cotacao'
import { cotacaoService } from '@/services/cotacaoService'

const props = defineProps<{
  pedidoCompraId: number
  cotacaoVencedoraId?: number | null
}>()

const emit = defineEmits<{
  'vencedora-selecionada': [cotacaoId: number]
}>()

const cotacoes = ref<Cotacao[]>([])
const loading = ref(false)
const selecionando = ref(false)

async function carregarRanking() {
  if (!props.pedidoCompraId) return
  loading.value = true
  try {
    const result = await cotacaoService.getRanking(props.pedidoCompraId)
    cotacoes.value = Array.isArray(result) ? result : []
  } catch {
    cotacoes.value = []
  } finally {
    loading.value = false
  }
}

async function selecionarVencedora(cotacaoId: number) {
  if (selecionando.value) return
  if (!confirm('Confirma a seleção desta cotação como vencedora?')) return
  selecionando.value = true
  try {
    await cotacaoService.selecionarVencedora(cotacaoId)
    toast.success('Cotação selecionada como vencedora!')
    emit('vencedora-selecionada', cotacaoId)
    await carregarRanking()
  } catch (error: any) {
    toast.error(error?.response?.data?.error?.message || 'Erro ao selecionar vencedora')
  } finally {
    selecionando.value = false
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

function calcularDiferenca(cotacao: Cotacao): string | null {
  if (cotacoes.value.length < 2) return null
  const melhor = cotacoes.value[0]?.vl_total || 0
  if (!melhor || melhor === cotacao.vl_total) return null
  const diff = ((cotacao.vl_total - melhor) / melhor) * 100
  return `+${diff.toFixed(1)}%`
}

function isVencedora(cotacao: Cotacao): boolean {
  return cotacao.status === 'selecionada'
}

watch(() => props.pedidoCompraId, (id) => {
  if (id) carregarRanking()
}, { immediate: true })

defineExpose({ carregarRanking })
</script>

<template>
  <div>
    <div v-if="loading" class="text-center py-6 text-sm text-gray-500">
      Carregando ranking...
    </div>

    <div v-else-if="cotacoes.length === 0" class="text-center py-6 text-sm text-gray-400">
      Nenhuma cotação registrada para este pedido.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(cotacao, idx) in cotacoes"
        :key="cotacao.id"
        :class="[
          'border rounded-lg p-4 transition-all',
          isVencedora(cotacao)
            ? 'border-lime-600 bg-lime-50 ring-2 ring-lime-200'
            : idx === 0
              ? 'border-lime-400 bg-lime-50/50'
              : 'border-gray-200 bg-white',
        ]"
      >
        <div class="flex items-center justify-between gap-4">
          <!-- Posição + Fornecedor -->
          <div class="flex items-center gap-3 min-w-0">
            <div
              :class="[
                'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0',
                idx === 0 ? 'bg-lime-600 text-white' : 'bg-gray-200 text-gray-600',
              ]"
            >
              {{ cotacao.ranking_posicao || idx + 1 }}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-900 truncate">
                  {{ cotacao.fornecedor?.nome || `Fornecedor #${cotacao.fornecedorId}` }}
                </span>
                <span
                  v-if="isVencedora(cotacao)"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-lime-600 text-white flex-shrink-0"
                >
                  <Star class="w-3 h-3" />
                  Selecionada
                </span>
              </div>
              <div class="text-xs text-gray-500 mt-0.5">
                Cotação {{ cotacao.numero }}
                <span v-if="cotacao.condicao_pagamento"> · {{ cotacao.condicao_pagamento }}</span>
                <span v-if="cotacao.prazo_entrega_dias"> · {{ cotacao.prazo_entrega_dias }} dias entrega</span>
              </div>
            </div>
          </div>

          <!-- Valor + Ações -->
          <div class="flex items-center gap-4 flex-shrink-0">
            <div class="text-right">
              <div class="font-bold text-gray-900">{{ formatCurrency(cotacao.vl_total) }}</div>
              <div
                v-if="calcularDiferenca(cotacao)"
                class="text-xs text-red-500 font-medium"
              >
                {{ calcularDiferenca(cotacao) }}
              </div>
            </div>
            <button
              v-if="!isVencedora(cotacao) && cotacao.status === 'pendente' && !cotacaoVencedoraId"
              :disabled="selecionando"
              class="px-3 py-1.5 text-xs font-medium text-lime-700 bg-lime-100 rounded-md hover:bg-lime-200 disabled:opacity-50 transition-colors"
              @click="selecionarVencedora(cotacao.id!)"
            >
              Selecionar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
