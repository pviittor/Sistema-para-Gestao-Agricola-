<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ChevronDown, Check } from 'lucide-vue-next'

interface Option {
  value: string | number
  label: string
}

const props = defineProps<{
  modelValue?: string | number | null
  options: Option[]
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const search = ref('')
const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref({
  top: '0px',
  left: '0px',
  width: '0px'
})

// Initialize search with selected option label
watch([() => props.modelValue, () => props.options], ([newVal, newOptions]) => {
  const selected = newOptions.find(o => o.value === newVal)
  if (selected) {
    if (!isOpen.value || search.value !== selected.label) {
       search.value = selected.label
    }
  } else if (!newVal) {
    if (!isOpen.value) {
       search.value = ''
    }
  }
}, { immediate: true })

const filteredOptions = computed(() => {
  if (!search.value) return props.options
  const term = search.value.toLowerCase()
  
  // If search matches selected option label exactly, show all options
  const selected = props.options.find(o => o.value === props.modelValue)
  if (selected && search.value === selected.label) {
    return props.options
  }
  
  return props.options.filter(option => 
    option.label.toLowerCase().includes(term)
  )
})

const handleSelect = (option: Option) => {
  emit('update:modelValue', option.value)
  emit('change', option)
  search.value = option.label
  isOpen.value = false
}

const updatePosition = () => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    // Find the input element specifically if possible, or use container
    // The input is inside containerRef. Let's use inputRef if available.
    const targetRect = inputRef.value ? inputRef.value.getBoundingClientRect() : rect
    
    dropdownStyle.value = {
      top: `${targetRect.bottom}px`,
      left: `${targetRect.left}px`,
      width: `${targetRect.width}px`
    }
  }
}

const handleOpen = () => {
  if (props.disabled) return
  isOpen.value = true
  updatePosition()
  nextTick(() => {
    inputRef.value?.select()
  })
}

const toggleDropdown = (e: Event) => {
  e.stopPropagation()
  if (props.disabled) return
  
  if (isOpen.value) {
    isOpen.value = false
  } else {
    isOpen.value = true
    updatePosition()
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
}

const handleInput = () => {
  if (!isOpen.value) {
    isOpen.value = true
    updatePosition()
  }
  if (search.value === '') {
    emit('update:modelValue', null)
  }
}

// Close on click outside
const handleClickOutside = (e: MouseEvent) => {
  // Check if click is inside container OR inside dropdown (since it's fixed/teleported logic)
  const isInsideContainer = containerRef.value && containerRef.value.contains(e.target as Node)
  const isInsideDropdown = dropdownRef.value && dropdownRef.value.contains(e.target as Node)
  
  if (!isInsideContainer && !isInsideDropdown) {
    isOpen.value = false
    const selected = props.options.find(o => o.value === props.modelValue)
    if (selected) {
      search.value = selected.label
    } else {
      search.value = ''
    }
  }
}

// Close on scroll to avoid detachment
const handleScroll = (e: Event) => {
  if (isOpen.value) {
    // Check if the scroll event comes from inside the dropdown itself
    if (dropdownRef.value && dropdownRef.value.contains(e.target as Node)) {
      return
    }
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', handleScroll)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleScroll)
})
</script>

<template>
  <div ref="containerRef" class="relative">
    <label v-if="label" class="block text-sm font-bold text-gray-700 mb-2">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative">
      <div v-if="$slots.prefix" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        <slot name="prefix"></slot>
      </div>

      <input
        ref="inputRef"
        type="text"
        v-model="search"
        @focus="handleOpen"
        @click="handleOpen"
        @input="handleInput"
        :placeholder="placeholder"
        :disabled="disabled"
        class="w-full pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
        :class="[$slots.prefix ? 'pl-10' : 'pl-4']"
      />
      
      <div 
        class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer z-20"
        @click="toggleDropdown"
      >
        <ChevronDown class="h-5 w-5 text-gray-400" />
      </div>
    </div>

    <!-- Dropdown -->
    <Teleport to="body">
      <div 
        v-if="isOpen" 
        ref="dropdownRef"
        class="fixed z-[9999] bg-white rounded-lg shadow-lg border border-gray-100 max-h-60 overflow-y-auto min-w-[200px]"
        :style="dropdownStyle"
      >
        <ul class="py-1">
          <li
            v-for="option in filteredOptions"
            :key="option.value"
            @click="handleSelect(option)"
            class="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between text-sm text-gray-700"
            :class="{ 'bg-lime-50 text-lime-700 font-medium': modelValue === option.value }"
          >
            {{ option.label }}
            <Check v-if="modelValue === option.value" class="h-4 w-4 text-lime-600" />
          </li>
          <li v-if="filteredOptions.length === 0" class="px-4 py-2 text-sm text-gray-500 text-center">
            Nenhuma opção encontrada
          </li>
        </ul>
      </div>
    </Teleport>
  </div>
</template>
