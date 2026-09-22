<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus, Pencil, Trash2, Search, Eye, DollarSign } from 'lucide-vue-next'
import EmprestimoModal from '@/components/EmprestimoModal.vue'
import EmprestimoItensModal from '@/components/EmprestimoItensModal.vue'
import type { Emprestimo } from '@/types/Emprestimo'
import { emprestimoService } from '@/services/emprestimoService'
import { propriedadeService } from '@/services/propriedadeService'
import { parceiroNegocioService } from '@/services/parceiroNegocioService'
import type { Propriedade } from '@/types/Propriedade'
import type { ParceiroNegocio } from '@/types/ParceiroNegocio'

// Modal state
const isModalOpen = ref(false)
const editingItem = ref<Emprestimo | null>(null)

// Itens modal state
const isItensModalOpen = ref(false)
const selectedEmprestimo = ref<Emprestimo | null>(null)

// List state
const items = ref<Emprestimo[]>([])
const searchTerm = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

// Lookup data
const fazendas = ref<Propriedade[]>([])
const parceiros = ref<ParceiroNegocio[]>([])

// Filter state
const filterFazenda = ref<number | ''>('')
const filterTipo = ref<number | ''>('')
const filterSituacao = ref<number | ''>('')
const filterApenasVencidos = ref(false)

// Cobrança state
const gerandoCobranca = ref<number | null>(null)

const fetchItems = async () => {
  isLoading.value = true
  try {
    const result = await emprestimoService.getAll(1, 100)
    items.value = result.data
  } catch (error) {
    console.error('Erro ao buscar empréstimos:', error)
    toast.error('Erro ao carregar empréstimos.')
  } finally {
    isLoading.value = false
  }
}

const fetchLookups = async () => {
  try {
    const [fazendasResult, parceirosResult] = await Promise.all([
      propriedadeService.getAllNoPagination(),
      parceiroNegocioService.getAllNoPagination(),
    ])
    fazendas.value = fazendasResult.data
    parceiros.value = parceirosResult.data
  } catch (error) {
    console.error('Erro ao buscar dados de referência:', error)
  }
}

const handleNew = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const handleEdit = (item: Emprestimo) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleSave = async (data: Emprestimo) => {
  isSaving.value = true
  try {
    if (data.id) {
      await emprestimoService.update(data.id, data)
      toast.success('Empréstimo atualizado com sucesso!')
    } else {
      await emprestimoService.create(data)
      toast.success('Empréstimo criado com sucesso!')
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

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir este empréstimo?')) {
    try {
      await emprestimoService.delete(id)
      toast.success('Empréstimo excluído com sucesso!')
      fetchItems()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir. Tente novamente.')
    }
  }
}

const handleViewItens = (emp: Emprestimo) => {
  selectedEmprestimo.value = emp
  isItensModalOpen.value = true
}

// Helper functions
const getFazendaName = (fazendaId: number): string => {
  const fazenda = fazendas.value.find((f) => f.id === fazendaId)
  return fazenda ? fazenda.descricao : String(fazendaId)
}

const getParceiroName = (parceiroId: number): string => {
  const parceiro = parceiros.value.find((p) => p.id_pessoa === parceiroId)
  if (!parceiro) return String(parceiroId)
  return parceiro.nomefantasia_pessoa || parceiro.nomerazao_pessoa || String(parceiroId)
}

const getTipoLabel = (tipo: number): string => {
  const tipos: Record<number, string> = {
    0: 'Produto',
    1: 'Máquina',
  }
  return tipos[tipo] ?? String(tipo)
}

const getSituacaoLabel = (situacao: number): string => {
  const situacoes: Record<number, string> = {
    0: 'Em aberto',
    1: 'Parcial',
    2: 'Concluído',
  }
  return situacoes[situacao] ?? String(situacao)
}

const getSituacaoColor = (situacao: number): string => {
  const cores: Record<number, string> = {
    0: 'bg-yellow-100 text-yellow-700',
    1: 'bg-orange-100 text-orange-700',
    2: 'bg-green-100 text-green-700',
  }
  return cores[situacao] ?? 'bg-gray-100 text-gray-700'
}

const isVencido = (item: Emprestimo): boolean => {
  if (!item.data_limite_devolucao) return false
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  // Se concluído, verificar se devolveu com atraso
  if (item.situacao_emp === 2) {
    if (!item.devolucao_emp) return false
    return new Date(item.data_limite_devolucao + 'T00:00:00') < new Date(item.devolucao_emp + 'T00:00:00')
  }
  return new Date(item.data_limite_devolucao + 'T00:00:00') < hoje
}

const getDiasVencido = (item: Emprestimo): number | null => {
  if (!item.data_limite_devolucao) return null
  const dataLimite = new Date(item.data_limite_devolucao + 'T00:00:00')
  // Se concluído, calcular dias de atraso até a devolução
  if (item.situacao_emp === 2) {
    if (!item.devolucao_emp) return null
    const dataDevolucao = new Date(item.devolucao_emp + 'T00:00:00')
    if (dataLimite >= dataDevolucao) return null
    return Math.floor((dataDevolucao.getTime() - dataLimite.getTime()) / (1000 * 60 * 60 * 24))
  }
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  if (dataLimite >= hoje) return null
  return Math.floor((hoje.getTime() - dataLimite.getTime()) / (1000 * 60 * 60 * 24))
}

const podeGerarCobranca = (item: Emprestimo): boolean => {
  return isVencido(item) && !item.financeiro_gerado
}

const calcularPreviewCobranca = (item: Emprestimo) => {
  let valorBase = Number(item.valor_custo_medio_total) || 0
  if (valorBase <= 0 && item.itens?.length) {
    valorBase = item.itens.reduce((sum, i) => sum + (Number(i.total_empi) || Number(i.quantidade_empi) * Number(i.unitario_empi) || 0), 0)
  }
  const multa = Number(item.multa_percentual) || 0
  const juros = Number(item.juros_diario_percentual) || 0
  const dias = getDiasVencido(item) || 0
  const valorMulta = valorBase * (multa / 100)
  const valorJuros = valorBase * (juros / 100) * dias
  const total = valorBase + valorMulta + valorJuros
  return { valorBase, multa, valorMulta, juros, dias, valorJuros, total }
}

const formatBRL = (v: number): string => {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const handleGerarCobranca = async (item: Emprestimo) => {
  const calc = calcularPreviewCobranca(item)
  const msg = [
    `Valor base: ${formatBRL(calc.valorBase)}`,
    calc.multa > 0 ? `Multa (${calc.multa}%): ${formatBRL(calc.valorMulta)}` : null,
    calc.juros > 0 ? `Juros (${calc.juros}%/dia × ${calc.dias} dias): ${formatBRL(calc.valorJuros)}` : null,
    `\nTOTAL: ${formatBRL(calc.total)}`,
  ].filter(Boolean).join('\n')

  if (!confirm(`Gerar cobrança para este empréstimo?\n\n${msg}`)) return

  gerandoCobranca.value = item.id!
  try {
    await emprestimoService.gerarFinanceiro(item.id!)
    toast.success(`Título a receber gerado: ${formatBRL(calc.total)}`)
    fetchItems()
  } catch (error: any) {
    const errMsg = error?.response?.data?.error?.message || 'Erro ao gerar cobrança'
    toast.error(errMsg)
  } finally {
    gerandoCobranca.value = null
  }
}

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    const fazendaNome = item.fazenda?.descricao ?? getFazendaName(item.fazendaId)
    const parceiroNome =
      item.parceiro?.nomefantasia_pessoa ??
      item.parceiro?.nomerazao_pessoa ??
      getParceiroName(item.parceiroId)

    const matchesSearch =
      !searchTerm.value ||
      fazendaNome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      parceiroNome.toLowerCase().includes(searchTerm.value.toLowerCase())

    const matchesFazenda =
      filterFazenda.value === '' || item.fazendaId === Number(filterFazenda.value)

    const matchesTipo = filterTipo.value === '' || item.tipo_emp === Number(filterTipo.value)

    const matchesSituacao =
      filterSituacao.value === '' || item.situacao_emp === Number(filterSituacao.value)

    const matchesVencidos = !filterApenasVencidos.value || isVencido(item)

    return matchesSearch && matchesFazenda && matchesTipo && matchesSituacao && matchesVencidos
  })
})

onMounted(() => {
  fetchItems()
  fetchLookups()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <EmprestimoModal
      :is-open="isModalOpen"
      :initial-data="editingItem"
      :loading="isSaving"
      @close="isModalOpen = false"
      @save="handleSave"
    />
    <EmprestimoItensModal
      v-if="selectedEmprestimo"
      :is-open="isItensModalOpen"
      :emprestimo="selectedEmprestimo"
      @close="isItensModalOpen = false"
      @updated="fetchItems()"
    />

    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Empréstimos</h1>
          <p class="text-gray-500 mt-1">Controle de empréstimos de produtos</p>
        </div>
        <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Novo Empréstimo
        </button>
      </div>

      <!-- Filters & List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col gap-4">
          <div class="flex flex-col sm:flex-row justify-between gap-4">
            <h2 class="text-lg font-bold text-gray-900 self-center">Lista de Empréstimos</h2>

            <div class="relative w-full sm:w-64">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search class="h-4 w-4 text-gray-400" />
              </div>
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Buscar por fazenda ou parceiro..."
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Filters row -->
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1">
              <select
                v-model="filterFazenda"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option value="">Todas as fazendas</option>
                <option v-for="f in fazendas" :key="f.id" :value="f.id">
                  {{ f.descricao }}
                </option>
              </select>
            </div>
            <div class="flex-1">
              <select
                v-model="filterTipo"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option value="">Todos os tipos</option>
                <option :value="0">Produto</option>
                <option :value="1">Máquina</option>
              </select>
            </div>
            <div class="flex-1">
              <select
                v-model="filterSituacao"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option value="">Todas as situações</option>
                <option :value="0">Em aberto</option>
                <option :value="1">Parcial</option>
                <option :value="2">Concluído</option>
              </select>
            </div>
            <div class="flex items-center">
              <label class="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  v-model="filterApenasVencidos"
                  type="checkbox"
                  class="rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                />
                Apenas vencidos
              </label>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <div v-if="isLoading" class="flex items-center justify-center py-16 text-gray-400">
            <span class="w-6 h-6 border-2 border-gray-200 border-t-lime-600 rounded-full animate-spin mr-3"></span>
            Carregando...
          </div>

          <table v-else class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Data
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Fazenda
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Parceiro
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Tipo
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Situação
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Prazo
                </th>
                <th
                  class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="item in filteredItems"
                :key="item.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ item.data_emp ? item.data_emp.substring(0, 10) : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ item.fazenda?.descricao ?? getFazendaName(item.fazendaId) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{
                    item.parceiro?.nomefantasia_pessoa ??
                    item.parceiro?.nomerazao_pessoa ??
                    getParceiroName(item.parceiroId)
                  }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ getTipoLabel(item.tipo_emp) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getSituacaoColor(item.situacao_emp)"
                    >
                      {{ getSituacaoLabel(item.situacao_emp) }}
                    </span>
                    <span
                      v-if="isVencido(item)"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"
                    >
                      Vencido
                    </span>
                    <span
                      v-else-if="item.data_limite_devolucao && item.situacao_emp !== 2"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-lime-100 text-lime-700"
                    >
                      No prazo
                    </span>
                    <span
                      v-if="item.financeiro_gerado"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                    >
                      Cobrança Gerada
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <template v-if="getDiasVencido(item) != null">
                    <span class="text-red-600 font-medium">{{ getDiasVencido(item) }} dias</span>
                  </template>
                  <template v-else-if="item.data_limite_devolucao">
                    {{ item.data_limite_devolucao.substring(0, 10) }}
                  </template>
                  <template v-else>-</template>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-3">
                    <button
                      v-if="podeGerarCobranca(item)"
                      @click="handleGerarCobranca(item)"
                      :disabled="gerandoCobranca === item.id"
                      class="text-red-500 hover:text-red-700 transition-colors"
                      title="Gerar Cobrança"
                    >
                      <div
                        v-if="gerandoCobranca === item.id"
                        class="h-4 w-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"
                      />
                      <DollarSign v-else class="h-4 w-4" />
                    </button>
                    <button
                      @click="handleViewItens(item)"
                      class="text-gray-400 hover:text-lime-600 transition-colors"
                      title="Ver Itens"
                    >
                      <Eye class="h-4 w-4" />
                    </button>
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
              <tr v-if="filteredItems.length === 0">
                <td colspan="7" class="px-6 py-16 text-center text-sm text-gray-400">
                  Nenhum empréstimo encontrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
