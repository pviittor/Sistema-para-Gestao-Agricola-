<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Plus, Trash2, Pencil, Save } from 'lucide-vue-next'
import type { Lembrete, LembreteDataHora } from '../types/Lembrete'

const props = defineProps<{
  isOpen: boolean
  initialData?: Lembrete | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const descSimples = ref('')
const descCompleta = ref('')
const items = ref<LembreteDataHora[]>([])

const isAddingItem = ref(false)
const editingItemIndex = ref<number | undefined>(undefined)

// Form fields for new item (LembreteDataHora)
const currentItem = ref({
  dia: '',
  data: '',
  horario: '',
})

// Reset form when modal opens
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.initialData) {
        descSimples.value = props.initialData.desc_simples
        descCompleta.value = props.initialData.desc_completa
        items.value = JSON.parse(JSON.stringify(props.initialData.lembrete_data_hora || []))
      } else {
        descSimples.value = ''
        descCompleta.value = ''
        items.value = []
      }
      isAddingItem.value = false
      resetCurrentItem()
    }
  },
)

const resetCurrentItem = () => {
  editingItemIndex.value = undefined
  const today = new Date().toISOString().split('T')[0]!
  currentItem.value = {
    dia: '',
    data: today,
    horario: '',
  }
}

const handleEditItem = (item: LembreteDataHora, index: number) => {
  editingItemIndex.value = index
  currentItem.value = {
    dia: item.dia,
    data: item.data,
    horario: item.horario,
  }
  isAddingItem.value = true
}

const handleAddItem = () => {
  const newItem: LembreteDataHora = {
    id:
      editingItemIndex.value !== undefined && items.value[editingItemIndex.value]
        ? items.value[editingItemIndex.value]!.id
        : undefined,
    dia: currentItem.value.dia,
    data: currentItem.value?.data ?? '',
    horario: currentItem.value.horario,
  }

  if (editingItemIndex.value !== undefined) {
    items.value[editingItemIndex.value] = newItem
  } else {
    items.value.push(newItem)
  }

  isAddingItem.value = false
  resetCurrentItem()
}

const handleRemoveItem = (index: number) => {
  items.value.splice(index, 1)
}

const handleSave = () => {
  if (props.loading) return
  if (!descSimples.value) {
    alert('A descrição simples é obrigatória.')
    return
  }

  emit('save', {
    desc_simples: descSimples.value,
    desc_completa: descCompleta.value,
    lembrete_data_hora: items.value,
  })
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div
      class="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">
          {{ props.initialData ? 'Editar Lembrete' : 'Novo Lembrete' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-8 flex-1">
        <!-- Main Fields -->
        <div class="grid grid-cols-1 gap-6">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Nome do Lembrete</label>
            <input
              v-model="descSimples"
              type="text"
              placeholder="Ex: Dipirona 500mg"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Observação do Lembrete</label>
            <textarea
              v-model="descCompleta"
              rows="3"
              placeholder="Ex: Beber com copo de água em jejum..."
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400 resize-none"
            ></textarea>
          </div>
        </div>

        <!-- Data/Hora List View -->
        <div v-if="!isAddingItem" class="space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 class="text-sm font-bold text-gray-700">Datas e Horários</h3>
            <button
              @click="isAddingItem = true"
              class="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Plus class="h-4 w-4" />
              Adicionar Data
            </button>
          </div>

          <!-- Table -->
          <div class="bg-white border border-gray-100 rounded-lg overflow-hidden overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                    Dia/Data
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">
                    Horário
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="items.length === 0">
                  <td colspan="4" class="px-6 py-8 text-center text-gray-500 text-sm">
                    Nenhuma data adicionada.
                  </td>
                </tr>
                <tr v-for="(item, index) in items" :key="index" class="hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">
                    <div class="flex flex-col">
                      <span v-if="item.dia">{{ item.dia }}</span>
                      <span v-if="item.data">{{
                        new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR')
                      }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center text-sm text-gray-500">{{ item.horario }}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-3">
                      <button
                        @click="handleEditItem(item, index)"
                        class="text-gray-400 hover:text-gray-600"
                      >
                        <Pencil class="h-4 w-4" />
                      </button>
                      <button
                        @click="handleRemoveItem(index)"
                        class="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Add Item Form -->
        <div v-else class="space-y-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-gray-900">Detalhes da Data/Hora</h3>
            <button
              @click="isAddingItem = false"
              class="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Cancelar
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Row 1 -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1"
                >Dia da Semana (Preferência)</label
              >
              <select
                v-model="currentItem.dia"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              >
                <option value="">Selecione</option>
                <option value="segunda-feira">Segunda-feira</option>
                <option value="terça-feira">Terça-feira</option>
                <option value="quarta-feira">Quarta-feira</option>
                <option value="quinta-feira">Quinta-feira</option>
                <option value="sexta-feira">Sexta-feira</option>
                <option value="sabado">Sábado</option>
                <option value="domingo">Domingo</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1"
                >Data (Sobrescreve Preferência)</label
              >
              <input
                v-model="currentItem.data"
                type="date"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            <!-- Row 2 -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Horário *</label>
              <input
                v-model="currentItem.horario"
                type="time"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <button
              @click="handleAddItem"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {{ editingItemIndex !== undefined ? 'Salvar Alterações' : 'Adicionar Data' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
        <button
          @click="$emit('close')"
          class="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="handleSave"
          :disabled="props.loading"
          class="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <span v-if="props.loading" class="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          <Save v-else class="w-4 h-4 mr-2" />
          {{ props.loading ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </div>
  </div>
</template>
