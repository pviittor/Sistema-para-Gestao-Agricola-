<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Warehouse,
  ClipboardList,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-vue-next'
import UnidadeDepositoModal from '@/components/UnidadeDepositoModal.vue'
import RegistroArmazenagemModal from '@/components/RegistroArmazenagemModal.vue'
import type { UnidadeDeposito } from '@/types/UnidadeDeposito'
import type { RegistroArmazenagem } from '@/types/RegistroArmazenagem'
import { unidadeDepositoService } from '@/services/unidadeDepositoService'
import { registroArmazenagemService } from '@/services/registroArmazenagemService'

// Aba ativa
const abaAtiva = ref<'unidades' | 'registros'>('unidades')

// Modal de Unidade de Depósito
const isUnidadeModalOpen = ref(false)
const isSavingUnidade = ref(false)
const editingUnidade = ref<UnidadeDeposito | null>(null)

// Modal de Registro de Armazenagem
const isRegistroModalOpen = ref(false)
const isSavingRegistro = ref(false)
const editingRegistro = ref<RegistroArmazenagem | null>(null)

// Listas
const unidades = ref<UnidadeDeposito[]>([])
const registros = ref<RegistroArmazenagem[]>([])
const isLoadingUnidades = ref(false)
const isLoadingRegistros = ref(false)

// Busca
const searchUnidades = ref('')
const searchRegistros = ref('')

// Filtro por unidade de depósito
const selectedUnidadeId = ref<number | null>(null)
const selectedUnidadeDescricao = ref('')

// Tipos de unidade para exibição
const tipoUnidadeLabels: Record<string, string> = {
  Silo: 'Silo',
  Bag: 'Bag',
  Armazem: 'Armazém',
  Outros: 'Outros',
}

const tipoUnidadeColors: Record<string, string> = {
  Silo: 'bg-blue-100 text-blue-700',
  Bag: 'bg-purple-100 text-purple-700',
  Armazem: 'bg-amber-100 text-amber-700',
  Outros: 'bg-gray-100 text-gray-700',
}

// Tipos de registro para exibição
const tipoRegistroLabels: Record<string, string> = {
  Carga: 'Carga',
  Descarga: 'Descarga',
}

const tipoRegistroColors: Record<string, string> = {
  Carga: 'bg-red-100 text-red-700',
  Descarga: 'bg-green-100 text-green-700',
}

// Filtros de unidades
const filteredUnidades = computed(() => {
  if (!searchUnidades.value.trim()) return unidades.value
  const term = searchUnidades.value.toLowerCase()
  return unidades.value.filter(
    (u) =>
      u.descricao.toLowerCase().includes(term) ||
      (u.produto?.descricao_prod ?? '').toLowerCase().includes(term) ||
      (tipoUnidadeLabels[u.tipo] ?? '').toLowerCase().includes(term),
  )
})

// Filtros de registros
const filteredRegistros = computed(() => {
  if (!searchRegistros.value.trim()) return registros.value
  const term = searchRegistros.value.toLowerCase()
  return registros.value.filter(
    (r) =>
      (r.ticket ?? '').toLowerCase().includes(term) ||
      (r.produto?.descricao_prod ?? '').toLowerCase().includes(term) ||
      (r.unidadeDeposito?.descricao ?? '').toLowerCase().includes(term) ||
      String(r.idOrigem ?? '').includes(term) ||
      (tipoRegistroLabels[r.tipo] ?? '').toLowerCase().includes(term),
  )
})

// Cor da barra de ocupação
const getOccupationColor = (percentual: number) => {
  if (percentual >= 90) return 'bg-red-500'
  if (percentual >= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getOccupationTextColor = (percentual: number) => {
  if (percentual >= 90) return 'text-red-600'
  if (percentual >= 70) return 'text-yellow-600'
  return 'text-green-600'
}

// Formatação de números
const formatNumber = (value: number | undefined | null, decimals = 2) => {
  if (value == null) return '0'
  return Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

const formatDate = (date: string | undefined | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

// Buscar unidades com saldo
const fetchUnidades = async () => {
  isLoadingUnidades.value = true
  try {
    const result = await unidadeDepositoService.getComSaldo()
    unidades.value = Array.isArray(result) ? result : []
  } catch (error) {
    console.error('Erro ao buscar unidades de depósito:', error)
    toast.error('Erro ao carregar unidades de depósito.')
  } finally {
    isLoadingUnidades.value = false
  }
}

// Buscar registros
const fetchRegistros = async () => {
  if (selectedUnidadeId.value) {
    await fetchRegistrosByUnidade(selectedUnidadeId.value)
    return
  }
  isLoadingRegistros.value = true
  try {
    const result = await registroArmazenagemService.getAll()
    registros.value = result.data ?? []
  } catch (error) {
    console.error('Erro ao buscar registros de armazenagem:', error)
    toast.error('Erro ao carregar registros de armazenagem.')
  } finally {
    isLoadingRegistros.value = false
  }
}

// Recarregar ambas as listas
const reloadAll = () => {
  fetchUnidades()
  fetchRegistros()
}

// Click no card da unidade → filtrar registros
const handleClickUnidade = async (unidade: UnidadeDeposito) => {
  selectedUnidadeId.value = unidade.id!
  selectedUnidadeDescricao.value = unidade.descricao
  abaAtiva.value = 'registros'
  await fetchRegistrosByUnidade(unidade.id!)
}

// Buscar registros filtrados por unidade
const fetchRegistrosByUnidade = async (idUnidadeDeposito: number) => {
  isLoadingRegistros.value = true
  try {
    const result = await registroArmazenagemService.getByUnidadeDeposito(idUnidadeDeposito)
    registros.value = Array.isArray(result) ? result : []
  } catch (error) {
    console.error('Erro ao buscar registros por unidade:', error)
    toast.error('Erro ao carregar registros da unidade.')
  } finally {
    isLoadingRegistros.value = false
  }
}

// Limpar filtro
const handleClearFilter = () => {
  selectedUnidadeId.value = null
  selectedUnidadeDescricao.value = ''
  fetchRegistros()
}

// CRUD Unidade de Depósito
const handleNewUnidade = () => {
  editingUnidade.value = null
  isUnidadeModalOpen.value = true
}

const handleEditUnidade = (item: UnidadeDeposito) => {
  editingUnidade.value = item
  isUnidadeModalOpen.value = true
}

const handleSaveUnidade = async (data: UnidadeDeposito) => {
  isSavingUnidade.value = true
  try {
    if (data.id) {
      await unidadeDepositoService.update(data.id, data)
      toast.success('Unidade de depósito atualizada com sucesso!')
    } else {
      await unidadeDepositoService.create(data)
      toast.success('Unidade de depósito criada com sucesso!')
    }
    isUnidadeModalOpen.value = false
    reloadAll()
  } catch (error) {
    console.error('Erro ao salvar unidade de depósito:', error)
    toast.error('Erro ao salvar. Tente novamente.')
  } finally {
    isSavingUnidade.value = false
  }
}

const handleDeleteUnidade = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta unidade de depósito?')) {
    try {
      await unidadeDepositoService.delete(id)
      toast.success('Unidade de depósito excluída com sucesso!')
      reloadAll()
    } catch (error) {
      console.error('Erro ao excluir unidade de depósito:', error)
      toast.error('Erro ao excluir. Tente novamente.')
    }
  }
}

// CRUD Registro de Armazenagem
const handleNewRegistro = () => {
  editingRegistro.value = null
  isRegistroModalOpen.value = true
}

const handleEditRegistro = (item: RegistroArmazenagem) => {
  editingRegistro.value = item
  isRegistroModalOpen.value = true
}

const handleSaveRegistro = async (data: RegistroArmazenagem) => {
  isSavingRegistro.value = true
  try {
    if (data.id) {
      await registroArmazenagemService.update(data.id, data)
      toast.success('Registro de armazenagem atualizado com sucesso!')
    } else {
      await registroArmazenagemService.create(data)
      toast.success('Registro de armazenagem criado com sucesso!')
    }
    isRegistroModalOpen.value = false
    reloadAll()
  } catch (error) {
    console.error('Erro ao salvar registro de armazenagem:', error)
    toast.error('Erro ao salvar. Tente novamente.')
  } finally {
    isSavingRegistro.value = false
  }
}

const handleDeleteRegistro = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir este registro de armazenagem?')) {
    try {
      await registroArmazenagemService.delete(id)
      toast.success('Registro de armazenagem excluído com sucesso!')
      reloadAll()
    } catch (error) {
      console.error('Erro ao excluir registro de armazenagem:', error)
      toast.error('Erro ao excluir. Tente novamente.')
    }
  }
}

onMounted(() => {
  reloadAll()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <!-- Modais -->
    <UnidadeDepositoModal
      :is-open="isUnidadeModalOpen"
      :initial-data="editingUnidade"
      :loading="isSavingUnidade"
      @close="isUnidadeModalOpen = false"
      @save="handleSaveUnidade"
    />

    <RegistroArmazenagemModal
      :is-open="isRegistroModalOpen"
      :initial-data="editingRegistro"
      :loading="isSavingRegistro"
      @close="isRegistroModalOpen = false"
      @save="handleSaveRegistro"
    />

    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Armazém</h1>
          <p class="text-gray-500 mt-1">Gerencie suas unidades de depósito e registros de armazenagem</p>
        </div>
        <button
          v-if="abaAtiva === 'unidades'"
          @click="handleNewUnidade"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Nova Unidade
        </button>
        <button
          v-else
          @click="handleNewRegistro"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Novo Registro
        </button>
      </div>

      <!-- Abas -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="border-b border-gray-100">
          <nav class="flex">
            <button
              @click="abaAtiva = 'unidades'"
              class="flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors"
              :class="
                abaAtiva === 'unidades'
                  ? 'border-lime-600 text-lime-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              "
            >
              <Warehouse class="h-4 w-4" />
              Unidades de Depósito
            </button>
            <button
              @click="abaAtiva = 'registros'"
              class="flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors"
              :class="
                abaAtiva === 'registros'
                  ? 'border-lime-600 text-lime-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              "
            >
              <ClipboardList class="h-4 w-4" />
              Registros de Armazenagem
            </button>
          </nav>
        </div>

        <!-- Conteúdo da Aba: Unidades de Depósito -->
        <div v-if="abaAtiva === 'unidades'">
          <!-- Busca -->
          <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
            <h2 class="text-lg font-bold text-gray-900 self-center">Unidades de Depósito</h2>
            <div class="relative w-full sm:w-64">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search class="h-4 w-4 text-gray-400" />
              </div>
              <input
                v-model="searchUnidades"
                type="text"
                placeholder="Buscar unidade..."
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Loading -->
          <div v-if="isLoadingUnidades" class="flex items-center justify-center py-16">
            <div
              class="w-6 h-6 border-2 border-lime-600 border-t-transparent rounded-full animate-spin"
            ></div>
          </div>

          <!-- Grid de cards -->
          <div v-else class="p-6">
            <div
              v-if="filteredUnidades.length > 0"
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <div
                v-for="unidade in filteredUnidades"
                :key="unidade.id"
                class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4 cursor-pointer"
                @click="handleClickUnidade(unidade)"
              >
                <!-- Cabeçalho do card -->
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-base font-semibold text-gray-900 truncate">
                      {{ unidade.descricao }}
                    </h3>
                    <div class="flex items-center gap-2 mt-1.5">
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="tipoUnidadeColors[unidade.tipo] ?? 'bg-gray-100 text-gray-700'"
                      >
                        {{ tipoUnidadeLabels[unidade.tipo] ?? unidade.tipo }}
                      </span>
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="
                          unidade.ativo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        "
                      >
                        {{ unidade.ativo ? 'Ativo' : 'Inativo' }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 ml-2 flex-shrink-0">
                    <button
                      @click.stop="handleEditUnidade(unidade)"
                      class="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button
                      @click.stop="handleDeleteUnidade(unidade.id!)"
                      class="text-gray-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <!-- Informações -->
                <div class="space-y-2 text-sm text-gray-600">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Produto</span>
                    <span class="font-medium text-gray-900">
                      {{ unidade.produto?.descricao_prod ?? '-' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Capacidade</span>
                    <span class="font-medium text-gray-900">
                      {{ formatNumber(unidade.capacidade_total) }}
                      {{ unidade.unidadeMedida?.abreviatura_unidade ?? '' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Saldo Atual</span>
                    <span class="font-medium text-gray-900">
                      {{ formatNumber(unidade.saldoAtual ?? 0) }}
                      {{ unidade.unidadeMedida?.abreviatura_unidade ?? '' }}
                    </span>
                  </div>
                </div>

                <!-- Barra de ocupação -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-xs text-gray-500">Ocupação</span>
                    <span
                      class="text-xs font-semibold"
                      :class="getOccupationTextColor(unidade.percentualUtilizado ?? 0)"
                    >
                      {{ formatNumber(unidade.percentualUtilizado ?? 0, 1) }}%
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      class="h-2.5 rounded-full transition-all"
                      :class="getOccupationColor(unidade.percentualUtilizado ?? 0)"
                      :style="{ width: Math.min(unidade.percentualUtilizado ?? 0, 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Vazio -->
            <div v-else class="text-center py-12 text-gray-500 text-sm">
              Nenhuma unidade de depósito encontrada.
            </div>
          </div>
        </div>

        <!-- Conteúdo da Aba: Registros de Armazenagem -->
        <div v-if="abaAtiva === 'registros'">
          <!-- Busca -->
          <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
            <div class="flex items-center gap-3 self-center">
              <h2 class="text-lg font-bold text-gray-900">Registros de Armazenagem</h2>
              <div v-if="selectedUnidadeId" class="flex items-center gap-2">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-lime-100 text-lime-700">
                  Filtrando: {{ selectedUnidadeDescricao }}
                </span>
                <button
                  @click="handleClearFilter"
                  class="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Ver todos
                </button>
              </div>
            </div>
            <div class="relative w-full sm:w-64">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search class="h-4 w-4 text-gray-400" />
              </div>
              <input
                v-model="searchRegistros"
                type="text"
                placeholder="Buscar registro..."
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Loading -->
          <div v-if="isLoadingRegistros" class="flex items-center justify-center py-16">
            <div
              class="w-6 h-6 border-2 border-lime-600 border-t-transparent rounded-full animate-spin"
            ></div>
          </div>

          <!-- Tabela -->
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    Tipo
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    Data
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    Ticket
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    Placa
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    Produto
                  </th>
                  <th
                    class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    Peso Bruto
                  </th>
                  <th
                    class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    Peso Tara
                  </th>
                  <th
                    class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    Peso Líquido
                  </th>
                  <th
                    class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    Desc. Total
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    Origem
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    Unidade Depósito
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
                  v-for="registro in filteredRegistros"
                  :key="registro.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      :class="tipoRegistroColors[registro.tipo] ?? 'bg-gray-100 text-gray-700'"
                    >
                      <ArrowUpFromLine
                        v-if="registro.tipo === 'Carga'"
                        class="h-3 w-3"
                      />
                      <ArrowDownToLine v-else class="h-3 w-3" />
                      {{ tipoRegistroLabels[registro.tipo] ?? registro.tipo }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(registro.data) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ registro.ticket ?? '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                    {{ registro.placa ?? '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ registro.produto?.descricao_prod ?? '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {{ formatNumber(registro.peso_bruto, 4) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {{ formatNumber(registro.peso_tara, 4) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {{ formatNumber(registro.peso_liquido) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {{ formatNumber(registro.desconto_total ?? 0) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ registro.origem?.talhao?.descricao ?? (registro.origem ? `Ciclo ${registro.origem.id_cfg}` : '-') }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ registro.unidadeDeposito?.descricao ?? '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end gap-3">
                      <button
                        @click="handleEditRegistro(registro)"
                        class="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Pencil class="h-4 w-4" />
                      </button>
                      <button
                        @click="handleDeleteRegistro(registro.id!)"
                        class="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredRegistros.length === 0">
                  <td colspan="12" class="px-6 py-12 text-center text-gray-500 text-sm">
                    Nenhum registro de armazenagem encontrado.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
