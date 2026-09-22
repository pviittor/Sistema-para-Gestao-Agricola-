<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { toast } from 'vue3-toastify'
import { Search, ChevronRight, ChevronDown } from 'lucide-vue-next'
import type { PlanoContaGerencial } from '@/types/PlanoContaGerencial'
import { planoContaGerencialService } from '@/services/PlanoContaGerencialService'

// State
const items = ref<PlanoContaGerencial[]>([])
const searchTerm = ref('')
const isLoading = ref(false)
const expandedIds = ref<Set<number>>(new Set())

const itemMap = computed(() => {
  const map = new Map<number, PlanoContaGerencial>()
  items.value.forEach(item => {
    if (item.id) map.set(item.id, item)
  })
  return map
})

const getParentIdByCode = (itemCode: string, allItems: PlanoContaGerencial[]): number | null => {
  const parts = itemCode.split('.')
  // Encontrar a última parte não zero
  let lastNonZeroIndex = -1
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i]
    if (part && parseInt(part) !== 0) {
      lastNonZeroIndex = i
      break
    }
  }

  // Se não encontrou ou é o primeiro nível (index 0), não tem pai
  if (lastNonZeroIndex <= 0) return null

  // Construir o código do pai
  // O pai tem a mesma estrutura, mas com a parte atual zerada
  const parentParts = [...parts]
  parentParts[lastNonZeroIndex] = '0'
  const parentCode = parentParts.join('.')

  // Procurar o pai na lista
  const parent = allItems.find(i => i.item === parentCode)
  return parent?.id || null
}

const parentMap = computed(() => {
  const map = new Map<number, number>()
  items.value.forEach(item => {
    if (item.id) {
      // Prioriza o contaPaiId vindo do banco
      if (item.contaPaiId) {
        map.set(item.id, item.contaPaiId)
      } else {
        // Se não tiver, tenta inferir pelo código
        const inferredParentId = getParentIdByCode(item.item, items.value)
        if (inferredParentId) {
          map.set(item.id, inferredParentId)
        }
      }
    }
  })
  return map
})

const childrenMap = computed(() => {
  const map = new Map<number, number[]>()
  parentMap.value.forEach((parentId, childId) => {
    if (!map.has(parentId)) {
      map.set(parentId, [])
    }
    map.get(parentId)!.push(childId)
  })
  return map
})

const filterType = ref('all') // 'all' | 'analitico' | 'sintetico'

const filteredItems = computed(() => {
  let result = items.value

  // 1. Filtrar por termo de busca
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    
    const directMatches = items.value.filter(item => 
      item.descricao.toLowerCase().includes(term) || 
      item.item.includes(term)
    )
    
    const resultIds = new Set<number>()
    
    const addDescendants = (parentId: number) => {
      const children = childrenMap.value.get(parentId)
      if (children) {
        children.forEach(childId => {
          if (!resultIds.has(childId)) {
            resultIds.add(childId)
            addDescendants(childId)
          }
        })
      }
    }

    directMatches.forEach(item => {
      if (item.id) {
        resultIds.add(item.id)
        addDescendants(item.id)
      }
    })
    
    result = items.value.filter(item => item.id && resultIds.has(item.id))
  }

  // 2. Filtrar por tipo (Analítico/Sintético)
  if (filterType.value === 'analitico') {
    result = result.filter(item => item.id && !hasChildrenIds.value.has(item.id))
  } else if (filterType.value === 'sintetico') {
    result = result.filter(item => item.id && hasChildrenIds.value.has(item.id))
  }

  return result
})

const hasChildrenIds = computed(() => {
  const ids = new Set<number>()
  // Usar o parentMap para determinar quem tem filhos
  parentMap.value.forEach((parentId) => {
    ids.add(parentId)
  })
  return ids
})

const isVisible = (item: PlanoContaGerencial) => {
  if (item.nivel === 1) return true
  
  // Usar o parentMap para navegar na hierarquia
  let currentParentId = parentMap.value.get(item.id!)
  
  while (currentParentId) {
    if (!expandedIds.value.has(currentParentId)) return false
    
    // Buscar o próximo pai usando o mapa
    const nextParentId = parentMap.value.get(currentParentId)
    if (!nextParentId) break
    currentParentId = nextParentId
  }
  return true
}

const getItemColorClass = (item: PlanoContaGerencial) => {
  // Encontrar o nó raiz (pai supremo) deste item
  const currentItem = item
  
  // Se já for raiz (nível 1), verifica diretamente
  if (currentItem.nivel === 1) {
    const desc = currentItem.descricao.toLowerCase()
    if (desc.includes('receita')) return 'text-lime-600 font-bold uppercase text-ls'
    if (desc.includes('despesa')) return 'text-red-400 font-bold uppercase text-ls'
    return 'text-gray-900 font-bold uppercase text-ls'
  }

  // Navegar até a raiz usando o parentMap
  let parentId = parentMap.value.get(currentItem.id!)
  while (parentId) {
    const parent = itemMap.value.get(parentId)
    if (!parent) break
    
    if (parent.nivel === 1) {
      const desc = parent.descricao.toLowerCase()
      // Estilo para filhos (níveis inferiores)
      if (desc.includes('receita')) return 'text-lime-600 font-medium uppercase text-ls'
      if (desc.includes('despesa')) return 'text-red-400 font-medium uppercase text-ls'
      break
    }
    parentId = parentMap.value.get(parent.id!)
  }
  
  return 'text-gray-700 font-medium'
}

const getItemTheme = (item: PlanoContaGerencial) => {
  const currentItem = item
  
  // Se já for raiz (nível 1), verifica diretamente
  if (currentItem.nivel === 1) {
    const desc = currentItem.descricao.toLowerCase()
    if (desc.includes('receita')) return 'lime'
    if (desc.includes('despesa')) return 'red'
    return 'default'
  }

  // Navegar até a raiz usando o parentMap
  let parentId = parentMap.value.get(currentItem.id!)
  while (parentId) {
    const parent = itemMap.value.get(parentId)
    if (!parent) break
    
    if (parent.nivel === 1) {
      const desc = parent.descricao.toLowerCase()
      if (desc.includes('receita')) return 'lime'
      if (desc.includes('despesa')) return 'red'
      break
    }
    parentId = parentMap.value.get(parent.id!)
  }
  
  return 'default'
}

const displayItems = computed(() => {
  return filteredItems.value.filter(isVisible)
})

watch([filteredItems, filterType], ([newItems]) => {
  if (searchTerm.value || filterType.value !== 'all') {
    const idsToExpand = new Set<number>(expandedIds.value)
    
    newItems.forEach(item => {
      if (item.id) {
        // Expandir o item se tiver filhos (para mostrar os filhos)
        if (hasChildrenIds.value.has(item.id)) {
          idsToExpand.add(item.id)
        }
        
        // Expandir todos os ancestrais para que este item seja visível
        let parentId = parentMap.value.get(item.id)
        while (parentId) {
          idsToExpand.add(parentId)
          parentId = parentMap.value.get(parentId)
        }
      }
    })
    
    expandedIds.value = idsToExpand
  }
})

const toggleExpand = (id: number) => {
  const newSet = new Set(expandedIds.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  expandedIds.value = newSet
}

const fetchItems = async () => {
  isLoading.value = true
  try {
    const response = await planoContaGerencialService.getAll()
    if (response.data && Array.isArray(response.data)) {
      items.value = response.data.sort((a, b) => a.item.localeCompare(b.item))
    } else {
       items.value = []
    }
  } catch (error) {
    console.error('Erro ao buscar contas:', error)
    toast.error('Erro ao carregar contas.')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchItems()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Relatório Financeiro</h1>
          <p class="text-gray-500 mt-1">Visualize a estrutura do seu plano de contas financeiro.</p>
        </div>
      </div>

      <!-- Relatório (Antiga Tabela) -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <h2 class="text-lg font-bold text-gray-900 self-center">Estrutura do Plano de Contas</h2>

          <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
             <div class="relative w-full sm:w-48">
               <select
                 v-model="filterType"
                 class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white"
               >
                 <option value="all">Todos</option>
                 <option value="analitico">Analítico</option>
                 <option value="sintetico">Sintético</option>
               </select>
             </div>

             <div class="relative w-full sm:w-64">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search class="h-4 w-4 text-gray-400" />
                </div>
              <input
                  v-model="searchTerm"
                  type="text"
                  placeholder="Buscar conta..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="flex justify-center items-center p-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 shadow-sm min-w-[300px]">
                  Categoria de Conta
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in displayItems" :key="item.id" 
                class="group transition-colors duration-300 ease-in-out"
                :class="{
                  'bg-lime-50 hover:bg-lime-100': getItemTheme(item) === 'lime',
                  'bg-red-50 hover:bg-red-100': getItemTheme(item) === 'red',
                  'bg-white hover:bg-gray-50': getItemTheme(item) === 'default'
                }"
              >
                <td class="px-3 py-4 text-sm sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors duration-300 ease-in-out"
                  :class="{
                    'bg-lime-50 group-hover:bg-lime-100': getItemTheme(item) === 'lime',
                    'bg-red-50 group-hover:bg-red-100': getItemTheme(item) === 'red',
                    'bg-white group-hover:bg-gray-50': getItemTheme(item) === 'default'
                  }"
                >
                  <div class="flex items-center" :style="{ paddingLeft: `${(item.nivel - 1) * 20}px` }">
                    <button 
                      v-if="hasChildrenIds.has(item.id!)"
                      @click.stop="toggleExpand(item.id!)"
                      class="p-1 hover:bg-gray-100 rounded mr-1 focus:outline-none"
                    >
                      <ChevronDown v-if="expandedIds.has(item.id!)" class="h-4 w-4 text-gray-400" />
                      <ChevronRight v-else class="h-4 w-4 text-gray-400" />
                    </button>
                    <div v-else class="w-6 mr-1"></div>
                    <span :class="getItemColorClass(item)">
                      {{ item.descricao }}
                    </span>
                  </div>
                </td>
              </tr>
              <tr v-if="displayItems.length === 0">
                <td colspan="1" class="px-6 py-8 text-center text-gray-500 text-sm">
                  Nenhuma conta encontrada.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
