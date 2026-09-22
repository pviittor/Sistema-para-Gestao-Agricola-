<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, Pencil, ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-vue-next'
import type { PlanoContaGerencial } from '@/types/PlanoContaGerencial'
import ListagemCategoriaConta from './ListagemCategoriaConta.vue'

// Estende a interface para incluir filhos na estrutura de árvore
export interface TreeItem extends PlanoContaGerencial {
  children: TreeItem[]
}

const props = defineProps<{
  item: TreeItem
  colorClass: string // 'text-red-700 bg-red-100' etc
  isRoot?: boolean
  themeColor?: 'lime' | 'red' | 'gray'
}>()

const themeClasses = computed(() => {
  const color = props.themeColor || 'lime'
  return {
    hoverText: color === 'red' ? 'hover:text-red-600' : (color === 'gray' ? 'hover:text-gray-600' : 'hover:text-lime-600'),
    hoverBg: 'hover:bg-gray-100'
  }
})

const emit = defineEmits<{
  (e: 'edit', item: PlanoContaGerencial): void
  (e: 'add-child', item: PlanoContaGerencial): void
  (e: 'delete', item: PlanoContaGerencial): void
}>()

const isOpen = ref(true)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const hasChildren = computed(() => props.item.children && props.item.children.length > 0)
</script>

<template>
  <div class="relative">
    <!-- Item Card -->
    <div class="flex items-center mb-4">
      <!-- Linha horizontal conectora se não for raiz -->
      <div v-if="!isRoot" class="w-8 h-0.5 bg-gray-500 mr-2"></div>
      
      <div class="flex items-center">
        <!-- Toggle Button (Seta) -->
        <button 
          v-if="hasChildren" 
          @click.stop="toggle"
          class="mr-2 p-1 hover:bg-gray-100 rounded-full text-gray-500 focus:outline-none transition-colors"
        >
          <ChevronDown v-if="isOpen" class="h-4 w-4" />
          <ChevronRight v-else class="h-4 w-4" />
        </button>
        <div v-else class="w-6 mr-2 "></div> <!-- Espaçamento para alinhar itens sem filhos -->

        <div 
          class="flex items-center gap-3 px-4 py-2 rounded-lg shadow-sm border border-gray-200 min-w-[200px] hover:shadow-md transition-shadow group"
          :class="{
            'border-l-4': true,
            'bg-white': item.ativo,
            'bg-gray-200': !item.ativo
          }"
          :style="{ borderLeftColor: isRoot ? '' : 'transparent' }"
        >
          <button 
            v-if="item.tipo === 'SINTETICA' && item.nivel < 4"
            @click.stop="emit('add-child', item)"
            class="p-1 rounded-full text-gray-400 transition-colors"
            :class="[themeClasses.hoverBg, themeClasses.hoverText]"
            title="Adicionar Filho"
          >
            <Plus class="h-4 w-4" />
          </button>

          <button
            @click.stop="emit('edit', item)"
            class="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            :class="isRoot ? 'bg-white/20 text-white hover:bg-white/30' : 'text-gray-600'"
            title="Editar"
          >
              <Pencil v-if="item.tipo === 'SINTETICA'" class="h-4 w-4" />
              <Pencil v-else class="h-4 w-4" />
          </button>
          
          <span class="font-medium text-sm" :class="isRoot ? 'text-white font-bold uppercase' : 'text-gray-700'">
              {{ item.descricao }}
          </span>
        </div>

        <button
            v-if="!isRoot"
            @click.stop="emit('delete', item)"
            class="p-1.5 rounded-md hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500 ml-2"
            title="Excluir"
          >
             <Trash2 class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Children -->
    <div v-if="hasChildren && isOpen" class="ml-8 border-l border-gray-500 -mt-10 pt-7">
      <ListagemCategoriaConta
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :color-class="colorClass"
        :theme-color="themeColor"
        @edit="emit('edit', $event)"
        @add-child="emit('add-child', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </div>
</template>
