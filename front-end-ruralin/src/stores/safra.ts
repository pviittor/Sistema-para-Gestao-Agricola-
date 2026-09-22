import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Safra } from '@/types/Safra'
import { safraService } from '@/services/safraService'

export const useSafraStore = defineStore('safra', () => {
  const safras = ref<Safra[]>([])
  const selectedSafraId = ref<number | null>(null)
  const loading = ref(false)

  const selectedSafra = computed(() =>
    safras.value.find((s) => s.id === selectedSafraId.value) ?? null,
  )

  async function fetchSafras() {
    if (safras.value.length > 0) return // already loaded
    loading.value = true
    try {
      const result = await safraService.getAllNoPagination()
      // Format A wrapped: { success, data: Safra[] }
      if (result.success && result.data) {
        safras.value = result.data
      }
    } catch (error) {
      console.error('Erro ao carregar safras:', error)
    } finally {
      loading.value = false
    }
  }

  function selectSafra(id: number | null) {
    selectedSafraId.value = id
    if (id) {
      localStorage.setItem('ruralin_selected_safra', String(id))
    } else {
      localStorage.removeItem('ruralin_selected_safra')
    }
  }

  function init() {
    const saved = localStorage.getItem('ruralin_selected_safra')
    if (saved) {
      selectedSafraId.value = Number(saved)
    }
  }

  return {
    safras,
    selectedSafraId,
    selectedSafra,
    loading,
    fetchSafras,
    selectSafra,
    init,
  }
})
