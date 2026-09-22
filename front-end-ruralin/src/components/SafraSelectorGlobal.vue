<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { CalendarDays, ChevronDown, Check, Layers } from 'lucide-vue-next'
import { useSafraStore } from '@/stores/safra'
import { StatusSafra } from '@/types/Safra'

const safraStore = useSafraStore()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

function toggle() {
  isOpen.value = !isOpen.value
}

function selectSafra(id: number | null) {
  safraStore.selectSafra(id)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

function statusLabel(status: StatusSafra): string {
  const labels: Record<StatusSafra, string> = {
    [StatusSafra.EM_ANDAMENTO]: 'Em Andamento',
    [StatusSafra.PLANEJADA]: 'Planejada',
    [StatusSafra.CONCLUIDA]: 'Concluída',
    [StatusSafra.CANCELADA]: 'Cancelada',
  }
  return labels[status] ?? status
}

function statusClasses(status: StatusSafra): string {
  const map: Record<StatusSafra, string> = {
    [StatusSafra.EM_ANDAMENTO]: 'bg-green-100 text-green-700',
    [StatusSafra.PLANEJADA]: 'bg-blue-100 text-blue-700',
    [StatusSafra.CONCLUIDA]: 'bg-gray-100 text-gray-600',
    [StatusSafra.CANCELADA]: 'bg-red-100 text-red-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  safraStore.init()
  safraStore.fetchSafras()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <!-- Pill trigger -->
    <button
      @click="toggle"
      class="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lime-500/40"
      :class="
        safraStore.selectedSafra
          ? 'border-lime-300 bg-lime-50 text-lime-700 hover:bg-lime-100'
          : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
      "
    >
      <CalendarDays class="h-4 w-4 shrink-0" />
      <span class="hidden sm:inline truncate max-w-[160px]">
        {{ safraStore.selectedSafra?.nome ?? 'Todas as Safras' }}
      </span>
      <span class="sm:hidden">
        {{ safraStore.selectedSafra ? safraStore.selectedSafra.nome.substring(0, 8) : 'Safras' }}
      </span>
      <ChevronDown
        class="h-3.5 w-3.5 shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
      >
        <!-- "Todas as Safras" option -->
        <button
          @click="selectSafra(null)"
          class="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50"
          :class="!safraStore.selectedSafraId ? 'text-lime-700 font-medium' : 'text-gray-700'"
        >
          <Layers class="h-4 w-4 shrink-0 text-gray-400" />
          <span class="flex-1">Todas as Safras</span>
          <Check
            v-if="!safraStore.selectedSafraId"
            class="h-4 w-4 shrink-0 text-lime-600"
          />
        </button>

        <div class="mx-3 border-t border-gray-100" />

        <!-- Loading state -->
        <div v-if="safraStore.loading" class="px-3 py-4 text-center text-sm text-gray-400">
          Carregando safras...
        </div>

        <!-- Safra list -->
        <div v-else class="max-h-60 overflow-y-auto py-1">
          <button
            v-for="s in safraStore.safras"
            :key="s.id"
            @click="selectSafra(s.id!)"
            class="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50"
            :class="
              safraStore.selectedSafraId === s.id
                ? 'text-lime-700 font-medium bg-lime-50/50'
                : 'text-gray-700'
            "
          >
            <CalendarDays class="h-4 w-4 shrink-0 text-gray-400" />
            <div class="flex flex-1 items-center gap-2 min-w-0">
              <span class="truncate">{{ s.nome }}</span>
              <span
                class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase leading-none"
                :class="statusClasses(s.status)"
              >
                {{ statusLabel(s.status) }}
              </span>
            </div>
            <Check
              v-if="safraStore.selectedSafraId === s.id"
              class="h-4 w-4 shrink-0 text-lime-600"
            />
          </button>
        </div>

        <!-- Empty state -->
        <div
          v-if="!safraStore.loading && safraStore.safras.length === 0"
          class="px-3 py-4 text-center text-sm text-gray-400"
        >
          Nenhuma safra encontrada
        </div>
      </div>
    </Transition>
  </div>
</template>
