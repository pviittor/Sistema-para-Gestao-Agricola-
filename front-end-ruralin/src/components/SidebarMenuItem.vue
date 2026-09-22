<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import type { MenuItem } from '@/types/Menu'

const props = defineProps<{
  item: MenuItem
  isSidebarCollapsed: boolean
  depth?: number
}>()

const router = useRouter()
const isOpen = ref(props.item.isOpen || false)
const depth = props.depth || 0

const hasChildren = computed(() => props.item.children && props.item.children.length > 0)

const paddingLeft = computed(() => {
  // Base padding 1.5rem (px-6).
  // Level 1 indentation was pl-14 (3.5rem). Difference is 2rem.
  // So we add 2rem per depth level if we want to match exactly, or slightly less for deeper levels.
  // Let's use 1.5rem (6 tailwind units) + depth * 1.5rem.
  if (depth === 0) return '1.5rem'
  return `${1.5 + depth * 1.5}rem`
})

const toggle = () => {
  if (hasChildren.value) {
    isOpen.value = !isOpen.value
  } else if (props.item.path) {
    router.push(props.item.path)
  }
}
</script>

<template>
  <li>
    <a
      @click="toggle"
      class="flex items-center py-3 text-gray-600 hover:bg-gray-50 hover:text-lime-700 cursor-pointer transition-colors group relative select-none"
      :style="{ paddingLeft: paddingLeft, paddingRight: '1.5rem' }"
      :title="isSidebarCollapsed ? item.title : ''"
    >
      <component :is="item.icon" v-if="item.icon" class="h-5 w-5 flex-shrink-0" />
      <!-- If no icon, we might want to align text with icon? -->
      <span v-else-if="depth > 0" class="w-5 flex-shrink-0"></span>

      <span v-if="!isSidebarCollapsed" class="ml-3 font-medium truncate flex-1">{{
        item.title
      }}</span>

      <component
        v-if="hasChildren && !isSidebarCollapsed"
        :is="isOpen ? ChevronDown : ChevronRight"
        class="h-4 w-4 ml-2"
      />
    </a>

    <ul v-if="hasChildren && isOpen && !isSidebarCollapsed" class="bg-gray-50">
      <SidebarMenuItem
        v-for="(child, index) in item.children"
        :key="index"
        :item="child"
        :is-sidebar-collapsed="isSidebarCollapsed"
        :depth="depth + 1"
      />
    </ul>
  </li>
</template>
