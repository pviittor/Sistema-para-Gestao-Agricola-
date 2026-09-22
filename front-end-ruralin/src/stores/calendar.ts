import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import type { Evento } from '@/types/Evento'
import type { Local } from '@/types/Local'

export const useCalendarStore = defineStore('calendar', () => {
  const events = ref<Evento[]>([])
  const locais = ref<Local[]>([])

  const fetchLocais = async () => {
    try {
      const { data } = await api.get('/locais')
      locais.value = data
    } catch (error) {
      console.error('Erro ao buscar locais:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/eventos')
      events.value = data
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
    }
  }

  const addEvent = async (event: Evento) => {
    try {
      const { data } = await api.post('/eventos', event)
      events.value.push(data)
      return data
    } catch (error) {
      console.error('Erro ao adicionar evento:', error)
      throw error
    }
  }

  const updateEvent = async (event: Evento) => {
    try {
      const { data } = await api.put(`/eventos/${event.id}`, event)
      const index = events.value.findIndex(e => e.id === event.id)
      if (index !== -1) {
        events.value[index] = data
        return data
      }
    } catch (error) {
      console.error('Erro ao atualizar evento:', error)
      throw error
    }
  }

  const getEventsByDate = (date: string) => {
    return events.value.filter(e => e.data === date)
  }

  return {
    events,
    locais,
    fetchLocais,
    fetchEvents,
    addEvent,
    updateEvent,
    getEventsByDate
  }
})
