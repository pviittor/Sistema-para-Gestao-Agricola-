<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { Plus } from 'lucide-vue-next'
import PlanoContaGerencialModal from '@/components/PlanoContaGerencialModal.vue'
import PlanoContaTreeItem, { type TreeItem } from '@/components/ListagemCategoriaConta.vue'
import type { PlanoContaGerencial } from '@/types/PlanoContaGerencial'
import { planoContaGerencialService } from '@/services/PlanoContaGerencialService'

// Modal state
const isModalOpen = ref(false)
const editingItem = ref<PlanoContaGerencial | null>(null)

// List state
const items = ref<PlanoContaGerencial[]>([])
const isLoading = ref(false)
const isSaving = ref(false)

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

const generateNextCode = (parent: PlanoContaGerencial | null, allItems: PlanoContaGerencial[]) => {
    if (!parent) {
        // Nível raiz (1)
        const roots = allItems.filter(i => i.nivel === 1);
        let max = 0;
        roots.forEach(r => {
            const parts = r.item.split('.');
            const first = parseInt(parts[0] || '0');
            if (!isNaN(first) && first > max) max = first;
        });
        return `${max + 1}.0.0.0`;
    }

    // Nível filho
    // Quebra o código do pai
    const parentParts = parent.item.split('.').map(p => parseInt(p));
    // Nível do filho é nivel pai + 1. Índice correspondente é nivel pai (0-based: nivel 1 -> indice 0. filho nivel 2 -> indice 1)
    const targetIndex = parent.nivel; 
    
    // Filtra irmãos (filhos do mesmo pai)
    // Se tivermos o ID do pai, usamos ele. Se não, tentamos filtrar pelo código
    const siblings = allItems.filter(i => i.contaPaiId === parent.id);
    if (siblings.length === 0) {
        // Fallback: busca por prefixo se não tiver contaPaiId setado corretamente
        // Prefixo do pai: "1." para pai "1.0.0.0"
    }
    
    let max = 0;
    
    siblings.forEach(s => {
        const parts = s.item.split('.');
        const val = parseInt(parts[targetIndex] || '0');
        if (!isNaN(val) && val > max) max = val;
    });
    
    const newParts = [...parentParts];
    newParts[targetIndex] = max + 1;
    
    // Zerar níveis inferiores
    for(let i = targetIndex + 1; i < 4; i++) newParts[i] = 0;
    
    return newParts.join('.');
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

const handleNew = () => {
  const nextCode = generateNextCode(null, items.value)
  editingItem.value = {
    item: nextCode,
    descricao: '',
    tipo: 'SINTETICA',
    nivel: 1,
    ativo: true,
    contaPaiId: null,
    classificacao: ''
  }
  isModalOpen.value = true
}

const handleSave = async (data: PlanoContaGerencial) => {
  const isEditing = editingItem.value && editingItem.value.id !== undefined
  isSaving.value = true

  try {
    if (isEditing && editingItem.value?.id) {
      await planoContaGerencialService.update(editingItem.value.id, data)
    } else {
      await planoContaGerencialService.create(data)
    }

    toast.success(isEditing ? 'Conta atualizada com sucesso!' : 'Conta criada com sucesso!')
    isModalOpen.value = false
    await fetchItems()
    
  } catch (error) {
    console.error('Erro ao salvar:', error)
    toast.error('Erro ao salvar. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}


const handleEdit = (item: PlanoContaGerencial) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleAddChild = (parent: PlanoContaGerencial) => {
  if (parent.nivel >= 4) {
    toast.warning('Nível máximo atingido.')
    return
  }
  const nextCode = generateNextCode(parent, items.value)
  editingItem.value = {
    item: nextCode,
    descricao: '',
    tipo: 'ANALITICA',
    nivel: parent.nivel + 1,
    ativo: true,
    contaPaiId: parent.id
  }
  isModalOpen.value = true
}

const handleDelete = async (item: PlanoContaGerencial) => {
  if (!confirm(`Tem certeza que deseja excluir a conta "${item.descricao}"?`)) return
  
  try {
    if (item.id) {
        await planoContaGerencialService.delete(item.id)
        toast.success('Conta excluída com sucesso!')
        await fetchItems()
    }
  } catch (error) {
    console.error('Erro ao excluir:', error)
    toast.error('Erro ao excluir conta.')
  }
}

const buildTree = (allItems: PlanoContaGerencial[]) => {
  const map = new Map<number, TreeItem>()
  const roots: TreeItem[] = []

  // Criar nós
  allItems.forEach(item => {
    if (item.id) {
      map.set(item.id, { ...item, children: [] })
    }
  })

  // Montar hierarquia
  allItems.forEach(item => {
    if (item.id) {
      const node = map.get(item.id)!
      // Tenta pegar o pai pelo mapa de pais calculado
      const parentId = parentMap.value.get(item.id)
      
      if (parentId && map.has(parentId)) {
        map.get(parentId)!.children.push(node)
      } else {
        // Se não tem pai identificado, é raiz
        if (item.nivel === 1) {
             roots.push(node)
        }
      }
    }
  })
  
  // Ordenar
  const sortNodes = (nodes: TreeItem[]) => {
      nodes.sort((a, b) => a.item.localeCompare(b.item))
      nodes.forEach(node => sortNodes(node.children))
  }
  sortNodes(roots)
  
  return roots
}

const treeRoots = computed(() => buildTree(items.value))

onMounted(async () => {
  await fetchItems()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
    <PlanoContaGerencialModal
      :is-open="isModalOpen"
      :initial-data="editingItem"
      :has-children="false"
      :loading="isSaving"
      @close="isModalOpen = false"
      @save="handleSave"
    />
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Plano Financeiro</h1>
          <p class="text-gray-500 mt-1">Gerencie seu plano de contas gerencial (Receitas e Despesas)</p>
        </div>
        <!-- <button
          @click="handleNew"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
        >
          <Plus class="h-4 w-4 mr-2" />
          Nova Categoria de Conta
        </button> -->
      </div>

      <!-- Estrutura -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
         <div class="flex flex-row gap-12 min-w-max">
            <div v-for="root in treeRoots" :key="root.id" class="flex-1 min-w-[300px]">
                <!-- Root Header Card -->
                 <div 
                    class="rounded-lg shadow-md p-3 mb-6 flex items-center justify-between gap-3 text-white font-bold uppercase tracking-wide group"
                    :class="root.descricao.toLowerCase().includes('receita') ? 'bg-lime-600' : (root.descricao.toLowerCase().includes('despesa') ? 'bg-red-600' : 'bg-gray-700')"
                 >
                    <div class="flex items-center gap-3 pl-8">
                        {{ root.descricao }}
                    </div>
                    <div class="flex items-center gap-3">
                         <button @click.stop="handleAddChild(root)" class="p-0.5 hover:bg-white/20 rounded-full transition-colors" title="Adicionar Filho">
                            <Plus class="h-4 w-4 text-white" />
                         </button>
                    </div>
                 </div>
                 
                 <!-- Children Tree -->
                 <div class="pl-4">
                     <PlanoContaTreeItem
                        v-for="child in root.children"
                        :key="child.id"
                        :item="child"
                        color-class=""
                        :theme-color="root.descricao.toLowerCase().includes('receita') ? 'lime' : (root.descricao.toLowerCase().includes('despesa') ? 'red' : 'gray')"
                        @edit="handleEdit"
                        @add-child="handleAddChild"
                        @delete="handleDelete"
                     />
                 </div>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>
