<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  FileText,
  Landmark,
  FileSignature,
  TrendingUp,
} from 'lucide-vue-next'
import AgreementModal from '@/components/AgreementModal.vue'
import BaseAutocomplete from '@/components/BaseAutocomplete.vue'
import type { Agreement, AgreementType } from '@/types/Agreement'
import {
  AGREEMENT_TYPE_LABELS,
  AGREEMENT_TYPE_COLORS,
  LOAN_TYPE_LABELS,
  REVENUE_SOURCE_LABELS,
} from '@/types/Agreement'
import type { CreateAgreementCompletoDto, UpdateAgreementCompletoDto } from '@/types/Agreement'
import { agreementService } from '@/services/agreementService'
import { propriedadeService } from '@/services/propriedadeService'

const isModalOpen = ref(false)
const editingItem = ref<Agreement | null>(null)
const agreements = ref<Agreement[]>([])
const searchTerm = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

const selectedFazendaId = ref<number | null>(null)
const fazendaOptions = ref<{ value: number; label: string }[]>([])
const activeTypeFilter = ref<AgreementType | null>(null)
const sortKey = ref<'datecreation' | 'agreementType' | 'contraparte'>('datecreation')

const typeFilters: { label: string; value: AgreementType | null }[] = [
  { label: 'Todos', value: null },
  { label: 'Empréstimo', value: 'LOAN' },
  { label: 'Arrendamento', value: 'RENT_LEASE' },
  { label: 'Receita Não-Agrícola', value: 'NON_CROP_REVENUE' },
]

const filteredAgreements = computed(() => {
  if (!searchTerm.value) return agreements.value
  const term = searchTerm.value.toLowerCase()
  return agreements.value.filter((a) => {
    const desc = getDescription(a).toLowerCase()
    const notes = (a.notes || '').toLowerCase()
    const contraparte = getContraparte(a).toLowerCase()
    return desc.includes(term) || notes.includes(term) || contraparte.includes(term)
  })
})

const sortedAgreements = computed(() => {
  const list = [...filteredAgreements.value]
  list.sort((a, b) => {
    switch (sortKey.value) {
      case 'datecreation':
        return (b.datecreation || '').localeCompare(a.datecreation || '')
      case 'agreementType':
        return (a.agreementType || '').localeCompare(b.agreementType || '')
      case 'contraparte':
        return getContraparte(a).localeCompare(getContraparte(b))
      default:
        return 0
    }
  })
  return list
})

const summaryStats = computed(() => ({
  total: filteredAgreements.value.length,
  allTotal: agreements.value.length,
  loans: filteredAgreements.value.filter((a) => a.agreementType === 'LOAN').length,
  leases: filteredAgreements.value.filter((a) => a.agreementType === 'RENT_LEASE').length,
  revenue: filteredAgreements.value.filter((a) => a.agreementType === 'NON_CROP_REVENUE').length,
}))

function getDescription(a: Agreement): string {
  switch (a.agreementType) {
    case 'LOAN':
      return `${a.lenderName || ''} - ${a.loanType ? LOAN_TYPE_LABELS[a.loanType] : ''}`
    case 'RENT_LEASE': {
      const nome = a.arrendador?.nomerazao_pessoa || ''
      return `${nome} - ${a.startYear || ''}-${a.endYear || ''}`
    }
    case 'NON_CROP_REVENUE':
      return a.revenueSource ? REVENUE_SOURCE_LABELS[a.revenueSource] : ''
    default:
      return ''
  }
}

function getContraparte(a: Agreement): string {
  switch (a.agreementType) {
    case 'LOAN':
      return a.lenderName || '-'
    case 'RENT_LEASE':
      return a.arrendador?.nomerazao_pessoa || '-'
    default:
      return '-'
  }
}

function getTipo(a: Agreement): string {
  switch (a.agreementType) {
    case 'LOAN':
      return a.loanType ? LOAN_TYPE_LABELS[a.loanType] : AGREEMENT_TYPE_LABELS.LOAN
    case 'RENT_LEASE':
      return AGREEMENT_TYPE_LABELS.RENT_LEASE
    case 'NON_CROP_REVENUE':
      return a.revenueSource ? REVENUE_SOURCE_LABELS[a.revenueSource] : AGREEMENT_TYPE_LABELS.NON_CROP_REVENUE
    default:
      return ''
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('pt-BR')
}

function computeEndDate(startDate: string, termLength: number, termUnit: string): string {
  const d = new Date(startDate)
  if (isNaN(d.getTime())) return ''
  if (termUnit === 'YEAR') {
    d.setFullYear(d.getFullYear() + termLength)
  } else {
    d.setMonth(d.getMonth() + termLength)
  }
  return d.toLocaleDateString('pt-BR')
}

function getPeriodo(a: Agreement): string {
  if (a.agreementType === 'RENT_LEASE') {
    return `${a.startYear || '?'} - ${a.endYear || '?'}`
  }
  if (a.startDate && a.termLength && a.termUnit) {
    return `${formatDate(a.startDate)} - ${computeEndDate(a.startDate, a.termLength, a.termUnit)}`
  }
  if (a.startDate) {
    return formatDate(a.startDate)
  }
  return '-'
}

function getFieldDisplay(a: Agreement): { first: string; extra: number; all: string } {
  if (!a.agreementFields?.length) return { first: '-', extra: 0, all: '-' }
  const names = a.agreementFields.map((f) => f.talhao?.descricao || `#${f.fieldId}`)
  return {
    first: names[0]!,
    extra: names.length - 1,
    all: names.join(', '),
  }
}

function getValorTotal(a: Agreement): number {
  if (a.agreementType === 'LOAN') {
    return a.originalBalance || 0
  }
  if (a.paymentSchedules?.length) {
    return a.paymentSchedules.reduce((sum, ps) => sum + (ps.amount || 0), 0)
  }
  return 0
}

function formatCurrency(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getValorTotalFormatted(a: Agreement): string {
  const valor = getValorTotal(a)
  return valor === 0 ? '-' : formatCurrency(valor)
}

function getValorHa(a: Agreement): string {
  const valor = getValorTotal(a)
  if (valor === 0) return '-'

  let totalHa = 0
  if (a.agreementFields?.length) {
    totalHa = a.agreementFields.reduce((sum, f) => sum + (f.talhao?.area || 0), 0)
  }

  if (totalHa > 0) {
    return `${formatCurrency(valor / totalHa)} / ha`
  }
  return '-'
}

async function fetchFazendas() {
  try {
    const res = await propriedadeService.getAllNoPagination()
    fazendaOptions.value = res.data.map((f) => ({
      value: f.id!,
      label: f.descricao,
    }))
  } catch {
    toast.error('Erro ao carregar fazendas.')
  }
}

async function fetchAgreements() {
  if (!selectedFazendaId.value) {
    agreements.value = []
    return
  }
  isLoading.value = true
  try {
    if (activeTypeFilter.value) {
      agreements.value = await agreementService.getByType(
        activeTypeFilter.value,
        selectedFazendaId.value,
      )
    } else {
      agreements.value = await agreementService.getByFazenda(selectedFazendaId.value)
    }
  } catch {
    toast.error('Erro ao carregar acordos.')
  } finally {
    isLoading.value = false
  }
}

function onFazendaChange() {
  activeTypeFilter.value = null
  fetchAgreements()
}

function onTypeFilter(type: AgreementType | null) {
  activeTypeFilter.value = type
  fetchAgreements()
}

function handleNew() {
  editingItem.value = null
  isModalOpen.value = true
}

async function handleEdit(agreement: Agreement) {
  try {
    const full = await agreementService.getById(agreement.id!)
    editingItem.value = full
    isModalOpen.value = true
  } catch {
    toast.error('Erro ao carregar acordo.')
  }
}

async function handleDelete(id: number) {
  if (confirm('Tem certeza que deseja excluir este acordo?')) {
    try {
      await agreementService.delete(id)
      toast.success('Acordo excluído com sucesso!')
      fetchAgreements()
    } catch {
      toast.error('Erro ao excluir. Tente novamente.')
    }
  }
}

async function handleSave(payload: CreateAgreementCompletoDto | UpdateAgreementCompletoDto) {
  isSaving.value = true
  try {
    if (editingItem.value?.id) {
      await agreementService.updateCompleto(editingItem.value.id, payload as UpdateAgreementCompletoDto)
      toast.success('Acordo atualizado com sucesso!')
    } else {
      await agreementService.createCompleto(payload as CreateAgreementCompletoDto)
      toast.success('Acordo criado com sucesso!')
    }
    isModalOpen.value = false
    fetchAgreements()
  } catch {
    toast.error('Erro ao salvar. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchFazendas()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <AgreementModal
      :is-open="isModalOpen"
      :initial-data="editingItem"
      :loading="isSaving"
      :fazenda-id="selectedFazendaId ?? 0"
      @close="isModalOpen = false"
      @save="handleSave"
    />

    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Acordos</h1>
      <p class="text-gray-500 mt-0.5 text-sm">Empréstimos, arrendamentos e receitas não-agrícolas</p>
    </div>

    <!-- Fazenda selector -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div class="max-w-md">
        <BaseAutocomplete
          v-model="selectedFazendaId"
          :options="fazendaOptions"
          label="Fazenda"
          placeholder="Selecione uma fazenda..."
          :required="true"
          @change="onFazendaChange"
        />
      </div>
    </div>

    <template v-if="selectedFazendaId">
      <!-- Summary Bar -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Acordos</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ summaryStats.total }} <span class="text-sm font-normal text-gray-400">de {{ summaryStats.allTotal }}</span></p>
            </div>
            <div class="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText class="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Empréstimos</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ summaryStats.loans }}</p>
            </div>
            <div class="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Landmark class="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Arrendamentos</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ summaryStats.leases }}</p>
            </div>
            <div class="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <FileSignature class="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Receitas</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ summaryStats.revenue }}</p>
            </div>
            <div class="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp class="h-5 w-5 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      <!-- Type filter tabs -->
      <div class="flex gap-2 mb-4 flex-wrap">
        <button
          v-for="filter in typeFilters"
          :key="filter.label"
          @click="onTypeFilter(filter.value)"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="
            activeTypeFilter === filter.value
              ? 'bg-lime-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          "
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Table Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <!-- Toolbar: Search + Sort + New button -->
        <div class="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div class="relative flex-1 max-w-md">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar..."
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            />
          </div>
          <div class="flex items-center gap-3 sm:ml-auto">
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-500 whitespace-nowrap">Ordenar por</label>
              <select
                v-model="sortKey"
                class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option value="datecreation">Data de Criação</option>
                <option value="agreementType">Tipo</option>
                <option value="contraparte">Contraparte</option>
              </select>
            </div>
            <button
              @click="handleNew"
              :disabled="!selectedFazendaId"
              class="inline-flex items-center gap-2 px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Plus class="w-4 h-4" />
              Novo Acordo
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center py-12">
          <div class="w-8 h-8 border-4 border-lime-200 border-t-lime-600 rounded-full animate-spin"></div>
        </div>

        <!-- Table -->
        <div v-else-if="sortedAgreements.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="w-10 px-4 py-3">
                  <input type="checkbox" disabled class="rounded border-gray-300" />
                </th>
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">ID</th>
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Tipo</th>
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Período</th>
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Talhões</th>
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Contraparte</th>
                <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Valor Total</th>
                <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Valor / ha</th>
                <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="agreement in sortedAgreements" :key="agreement.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-4">
                  <input type="checkbox" class="rounded border-gray-300" />
                </td>
                <td class="px-4 py-4 text-sm text-gray-700 font-medium">{{ agreement.id }}</td>
                <td class="px-4 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="AGREEMENT_TYPE_COLORS[agreement.agreementType]"
                  >
                    {{ getTipo(agreement) }}
                  </span>
                </td>
                <td class="px-4 py-4 text-sm text-gray-600">{{ getPeriodo(agreement) }}</td>
                <td class="px-4 py-4 text-sm text-gray-600">
                  <span :title="getFieldDisplay(agreement).all">
                    {{ getFieldDisplay(agreement).first }}
                    <span
                      v-if="getFieldDisplay(agreement).extra > 0"
                      class="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500"
                    >
                      + {{ getFieldDisplay(agreement).extra }} mais
                    </span>
                  </span>
                </td>
                <td class="px-4 py-4 text-sm text-gray-600">{{ getContraparte(agreement) }}</td>
                <td class="px-4 py-4 text-sm text-gray-700 text-right font-medium">{{ getValorTotalFormatted(agreement) }}</td>
                <td class="px-4 py-4 text-sm text-gray-700 text-right font-medium">{{ getValorHa(agreement) }}</td>
                <td class="px-4 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="handleEdit(agreement)" class="p-1.5 text-gray-400 hover:text-lime-600 transition-colors">
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button @click="handleDelete(agreement.id!)" class="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-12">
          <p class="text-gray-500 text-sm">Nenhum acordo encontrado.</p>
        </div>
      </div>
    </template>
  </div>
</template>
