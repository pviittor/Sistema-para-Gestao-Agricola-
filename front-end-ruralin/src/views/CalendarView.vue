<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next'
import { useCalendarStore } from '@/stores/calendar'
import type { Evento } from '@/types/Evento'
import EventoModal from '@/components/EventoModal.vue'
import { toast } from 'vue3-toastify'

const calendarStore = useCalendarStore()

const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const isModalOpen = ref(false)
const isSaving = ref(false)
const selectedDate = ref<string | undefined>(undefined)
const selectedEvent = ref<Evento | undefined | null>(null)

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const currentMonthName = computed(() => months[currentMonth.value])

// Calendar logic
const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

const days = computed(() => {
  const daysArray = []
  // Padding days
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    daysArray.push(null)
  }
  // Actual days
  for (let i = 1; i <= daysInMonth.value; i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    const dateStr = date.toISOString().split('T')[0]
    daysArray.push({
      day: i,
      date: dateStr,
      events: calendarStore.getEventsByDate(dateStr!)
    })
  }
  return daysArray
})

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const openModal = (date?: string, event?: Evento) => {
  selectedDate.value = date
  selectedEvent.value = event
  isModalOpen.value = true
}

const handleSaveEvent = async (event: Evento) => {
  isSaving.value = true
  try {
    if (event.id) {
      await calendarStore.updateEvent(event)
      toast.success('Evento atualizado com sucesso!')
    } else {
      await calendarStore.addEvent(event)
      toast.success('Evento agendado com sucesso!')
    }
    isModalOpen.value = false
  } catch (error) {
    console.error(error)
    toast.error('Erro ao salvar evento. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  calendarStore.fetchEvents()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <EventoModal :is-open="isModalOpen" :initial-date="selectedDate" :event="selectedEvent" :loading="isSaving" @close="isModalOpen = false"
      @save="handleSaveEvent" />
    <header class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Eventos</h1>
          <p class="text-gray-500 mt-1">Gerencie seus eventos nas datas devidas</p>
        </div>
      </div>
    </header>

    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
      <!-- Calendar Controls -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-bold text-gray-900">{{ currentMonthName }} {{ currentYear }}</h2>
          <div class="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
            <button @click="prevMonth" class="p-2 hover:bg-gray-50 border-r border-gray-200">
              <ChevronLeft class="h-5 w-5 text-gray-600" />
            </button>
            <button @click="nextMonth" class="p-2 hover:bg-gray-50">
              <ChevronRight class="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div class="flex items-center gap-2 sm:gap-4">
          <button @click="openModal()"
            class="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors font-medium text-xs sm:text-sm">
            <Plus class="h-3 w-3 sm:h-4 sm:w-4" />
            <span class="hidden sm:inline">Novo Evento</span>
            <span class="sm:hidden">Evento</span>
          </button>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <!-- Weekdays -->
        <div class="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          <div v-for="day in weekDays" :key="day" class="py-3 text-center text-sm font-semibold text-gray-600">
            {{ day }}
          </div>
        </div>

        <!-- Days -->
        <div class="grid grid-cols-7 auto-rows-fr">
          <div v-for="(dayObj, index) in days" :key="index"
            class="min-h-[120px] border-b border-r border-gray-100 p-2 transition-colors hover:bg-gray-50 cursor-pointer relative group"
            :class="{ 'bg-gray-50/50': !dayObj }" @click="dayObj && openModal(dayObj.date)">
            <template v-if="dayObj">
              <span class="text-sm font-medium text-gray-700 block mb-1"
                :class="{ 'text-lime-600 font-bold': dayObj.date === new Date().toISOString().split('T')[0] }">
                {{ dayObj.day }}
              </span>

              <div class="space-y-1">
                <div v-for="event in dayObj.events" :key="event.id"
                  class="text-xs bg-lime-50 text-lime-700 px-1.5 py-1 rounded border border-lime-100 truncate hover:bg-lime-100 cursor-pointer"
                  :title="`${event.horario_inicio} - ${event.titulo}`"
                  @click.stop="openModal(undefined, event)">
                  <span class="font-semibold">{{ event.horario_inicio.split(':')[0] }}:{{ event.horario_inicio.split(':')[1] }}</span> {{ event.titulo }}
                </div>
              </div>

              <!-- Add button on hover -->
              <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="bg-lime-100 p-1 rounded-full text-lime-600">
                  <Plus class="h-3 w-3" />
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
