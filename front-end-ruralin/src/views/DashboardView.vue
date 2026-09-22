<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import {
  RefreshCw,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Mic,
  Paperclip,
  Send,
  Calendar,
  MapPin,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Users,
  House,
  LeafIcon,
  SproutIcon,
  RectangleEllipsisIcon,
  WrenchIcon,
  CarIcon,
  NotepadTextIcon,
  HousePlusIcon,
  Layers3Icon,
  ScanBarcodeIcon,
  HandHelpingIcon,
  UserCogIcon,
  ClipboardListIcon,
  CogIcon,
  FileTextIcon,
  ChartNoAxesCombinedIcon,
  BanknoteArrowUpIcon,
  BanknoteArrowDownIcon,
  ShoppingCartIcon,
  PillBottleIcon,
  SlidersHorizontalIcon,
  ArrowUpDownIcon,
  ScrollTextIcon,
  BookCheckIcon,
  NotebookPenIcon,
  Briefcase,
  Warehouse,
  Receipt,
  DollarSign,
  BarChart3,
  Repeat,
  ReceiptTextIcon,
  SettingsIcon,
  HashIcon,
  ClipboardListIcon as ClipboardCheckIcon,
  ActivityIcon,
  TargetIcon,
  TrendingUpIcon,
  ListOrderedIcon,
  SmartphoneIcon,
  FlaskConicalIcon,
  WaypointsIcon,
} from 'lucide-vue-next'
import SidebarMenuItem from '@/components/SidebarMenuItem.vue'
import SafraSelectorGlobal from '@/components/SafraSelectorGlobal.vue'
import { useSafraStore } from '@/stores/safra'
import type { Usuario } from '@/types/Usuario'
import type { MenuGroup, MenuItem } from '@/types/Menu'

import logoImage from '@/assets/logo.jpg'
import logoKompierImage from '@/assets/logoKompier.png'

const router = useRouter()
const safraStore = useSafraStore()

onMounted(async () => {
  await safraStore.init()
  await safraStore.fetchSafras()
})

const isMenuOpen = ref(false)
const isMobileMenuOpen = ref(false)
const isSidebarCollapsed = ref(false)
const isAiChatOpen = ref(false)
const currentUser = ref<Usuario | null>(null)
const aiPrompt = ref('')
const aiContext = ref('apontamento')
const selectedFile = ref<File | null>(null)
const isRecording = ref(false)
const recordingTime = ref(0)
let recordingTimer: number | null = null

// Spotlight Search Logic
const spotlightQuery = ref('')
const spotlightOpen = ref(false)
const spotlightActiveIndex = ref(0)

const getAllMenuItems = (groups: MenuGroup[]) => {
  const items: MenuItem[] = []

  const traverse = (menuItems: MenuItem[]) => {
    for (const item of menuItems) {
      if (item.path) {
        items.push(item)
      }
      if (item.children) {
        traverse(item.children)
      }
    }
  }

  groups.forEach((group) => traverse(group.items))
  return items
}

const spotlightResults = computed(() => {
  if (!spotlightQuery.value) return []

  const query = spotlightQuery.value.toLowerCase()
  const allItems = getAllMenuItems(menuGroups.value)

  return allItems.filter((item) => item.title.toLowerCase().includes(query))
})

watch(spotlightQuery, () => {
  spotlightActiveIndex.value = 0
})

const spotlightMove = (step: number) => {
  if (!spotlightResults.value.length) return

  const newIndex = spotlightActiveIndex.value + step
  if (newIndex >= 0 && newIndex < spotlightResults.value.length) {
    spotlightActiveIndex.value = newIndex
  }
}

const spotlightSelect = () => {
  if (spotlightResults.value.length && spotlightResults.value[spotlightActiveIndex.value]) {
    const item = spotlightResults.value[spotlightActiveIndex.value]
    if (item?.path) {
      goToRoute(item.path)
      spotlightOpen.value = false
      spotlightQuery.value = ''
    }
  }
}

const spotlightNavigate = (path?: string) => {
  if (path) {
    goToRoute(path)
    spotlightOpen.value = false
    spotlightQuery.value = ''
  }
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const toggleAiChat = () => {
  isAiChatOpen.value = !isAiChatOpen.value
}

const goToRoute = (path?: string) => {
  if (path) router.push(path)
}

const toggleRecording = () => {
  isRecording.value = !isRecording.value
  if (isRecording.value) {
    startRecordingTimer()
  } else {
    stopRecordingTimer()
  }
}

const startRecordingTimer = () => {
  recordingTime.value = 0
  recordingTimer = window.setInterval(() => {
    recordingTime.value++
  }, 1000)
}

const stopRecordingTimer = () => {
  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }
}

const submitAiQuery = () => {
  // Implement submission logic here
  console.log('Submitting:', {
    prompt: aiPrompt.value,
    file: selectedFile.value,
    audioDuration: recordingTime.value,
  }) // Reset

  aiPrompt.value = ''
  selectedFile.value = null
  isRecording.value = false
  stopRecordingTimer()
}

const signOut = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refresh_token')
  router.replace('/')
}

const currentLogo = computed(() => {
  const hostname = window.location.hostname
  if (hostname.includes('kompier')) {
    return logoKompierImage
  }
  return logoImage
})

const menuGroups = ref<MenuGroup[]>([
  {
    title: 'Cadastros',
    isOpen: true,
    items: [
      {
        title: 'Usuários',
        icon: Users,
        // Example of nested structure
        children: [
          {
            title: 'Usuários e Permissões',
            path: '/dashboard/usuarios',
            icon: UserCogIcon,
          },
          {
            title: 'Parceiros de Negócio',
            path: '/dashboard/parceiros',
            icon: Briefcase,
          },
        ],
      },
      {
        title: 'Patrimônio',
        icon: HousePlusIcon,
        // Example of nesructure
        children: [
          {
            title: 'Propriedades',
            path: '/dashboard/propriedades',
            icon: House,
          },
          {
            title: 'Benfeitorias',
            path: '/dashboard/benfeitorias',
            icon: NotepadTextIcon,
          },
          {
            title: 'Máquinas e Veículos',
            path: '/dashboard/maquinas',
            icon: CarIcon,
          },
        ],
      },
      {
        title: 'Estoque',
        icon: Layers3Icon,
        // Example of nesructure
        children: [
          {
            title: 'Produtos',
            path: '/dashboard/produtos',
            icon: ScanBarcodeIcon,
          },
          {
            title: 'Serviços',
            path: '/dashboard/servicos',
            icon: HandHelpingIcon,
          },
        ],
      },
      {
        title: 'Financeiro',
        icon: CreditCard,
        children: [
          {
            title: 'Contas',
            path: '/dashboard/contas-bancarias',
            icon: ClipboardListIcon,
          },
          {
            title: 'Plano Financeiro Gerencial',
            path: '/dashboard/plano-conta-gerencial',
            icon: ChartNoAxesCombinedIcon,
          },
        ],
      },
      {
        title: 'Produção',
        icon: CogIcon,
        // Example of nesructure
        children: [
          {
            title: 'Safras',
            path: '/dashboard/safras',
            icon: SproutIcon,
          },
          {
            title: 'Culturas',
            path: '/dashboard/culturas',
            icon: LeafIcon,
          },
          {
            title: 'Talhão',
            path: '/dashboard/talhoes',
            icon: RectangleEllipsisIcon,
          },
          {
            title: 'Operações de Campo',
            path: '/dashboard/operacoes-campo',
            icon: CogIcon,
          },
          {
            title: 'Tipos de Atividade',
            path: '/dashboard/tipos-atividade',
            icon: FlaskConicalIcon,
          },
        ],
      },
    ],
  },
  {
    title: 'Estoque',
    isOpen: true,
    items: [
      {
        title: 'Armazém',
        path: '/dashboard/armazem',
        icon: Warehouse,
      },
      {
        title: 'Movimentação de Produtos',
        icon: WaypointsIcon,
        children: [
          {
            title: 'Nota de Entrada',
            path: '/dashboard/nf-entrada',
            icon: BanknoteArrowUpIcon,
          },
          {
            title: 'Nota de Saída',
            path: '/dashboard/nf-saida',
            icon: BanknoteArrowDownIcon,
          },
          {
            title: 'Pedido de Compra',
            path: '/dashboard/pedidos-compra',
            icon: ShoppingCartIcon,
          },
          {
            title: 'Abastecimento',
            path: '/dashboard/abastecimentos',
            icon: PillBottleIcon,
          },
          {
            title: 'Controle de Empréstimo',
            path: '/dashboard/emprestimos',
            icon: SlidersHorizontalIcon,
          },
        ],
      },
    ],
  },
  {
    title: 'Financeiro',
    isOpen: true,
    items: [
      {
        title: 'Contas a Pagar',
        path: '/dashboard/contas-pagar',
        icon: DollarSign,
      },
      {
        title: 'Contas a Receber',
        path: '/dashboard/contas-receber',
        icon: DollarSign,
      },
      {
        title: 'Lançamento de Títulos',
        path: '/dashboard/financeiro',
        icon: BookCheckIcon,
      },
      {
        title: 'Outras Despesas/Receitas',
        path: '/dashboard/outras-despesas-receitas',
        icon: Receipt,
      },
      {
        title: 'Contratos',
        path: '/dashboard/agreements',
        icon: ScrollTextIcon,
      },
      {
        title: 'Lançamentos Recorrentes',
        path: '/dashboard/recorrencia-financeira',
        icon: Repeat,
      },
      {
        title: 'Fluxo de Caixa',
        path: '/dashboard/fluxo-caixa',
        icon: TrendingUpIcon,
      },
      {
        title: 'Centros de Custo',
        path: '/dashboard/centros-custo',
        icon: TargetIcon,
      },
      {
        title: 'Recibos',
        icon: ReceiptTextIcon,
        children: [
          {
            title: 'Recibos',
            path: '/dashboard/recibos',
            icon: ReceiptTextIcon,
          },
          {
            title: 'Numeração',
            path: '/dashboard/numeracao-recibos',
            icon: HashIcon,
          },
          {
            title: 'Configuração',
            path: '/dashboard/configuracao-recibos',
            icon: SettingsIcon,
          },
        ],
      },
      {
        title: 'Relatório de Aging',
        path: '/dashboard/aging',
        icon: BarChart3,
      },
      {
        title: 'Relatórios',
        path: '/dashboard/relatorio-financeiro',
        icon: FileTextIcon,
      },
    ],
  },
  {
    title: 'Ordens de Serviço',
    isOpen: true,
    items: [
      {
        title: 'Ordens de Serviço',
        path: '/dashboard/ordens-servico',
        icon: ClipboardCheckIcon,
      },
      {
        title: 'Custeio por Talhão',
        path: '/dashboard/custeio-talhao',
        icon: BarChart3,
      },
      {
        title: 'Analytics',
        path: '/dashboard/analytics-os',
        icon: ActivityIcon,
      },
    ],
  },
  {
    title: 'Máquinas',
    isOpen: true,
    items: [
      {
        title: 'Manutenção de Máquinas/Veículos',
        path: '/dashboard/maquinas',
        icon: NotebookPenIcon,
      },
    ],
  },
  {
    title: 'Agenda',
    isOpen: true,
    items: [
      {
        title: 'Calendário',
        path: '/dashboard/calendario',
        icon: Calendar,
      },
      {
        title: 'Lembrete',
        path: '/dashboard/lembrete',
        icon: RefreshCw,
      },
      {
        title: 'Locais',
        path: '/dashboard/locais',
        icon: MapPin,
      },
    ],
  },
])

const toggleGroup = (group: MenuGroup) => {
  group.isOpen = !group.isOpen
}
</script>

<template>
  <div class="h-screen overflow-hidden flex flex-col font-sans bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-100">
      <div class="mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center">
        <!-- Logo -->

        <div class="flex items-center gap-4">
          <!-- Logo -->
          <img :src="currentLogo" alt="Rural In" class="h-32 py-2" />
        </div>

        <!-- Spotlight Search -->
        <div class="w-full max-w-lg ml-4 md:ml-24 mr-auto hidden md:block">
          <div class="relative">
            <input
              v-model="spotlightQuery"
              @focus="spotlightOpen = true"
              @blur="spotlightOpen = false"
              @keydown.down.prevent="spotlightMove(1)"
              @keydown.up.prevent="spotlightMove(-1)"
              @keydown.enter.prevent="spotlightSelect"
              type="text"
              placeholder="Buscar módulos..."
              class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
            />
            <svg
              class="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <!-- Spotlight Results -->
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="spotlightOpen && spotlightResults.length"
                class="absolute z-30 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-100 max-h-64 overflow-y-auto"
              >
                <ul>
                  <li
                    v-for="(item, idx) in spotlightResults"
                    :key="item.path"
                    @mousedown="spotlightNavigate(item.path)"
                    :class="[
                      'px-4 py-2 text-sm cursor-pointer flex items-center gap-3',
                      idx === spotlightActiveIndex
                        ? 'bg-lime-50 text-lime-700'
                        : 'text-gray-700 hover:bg-gray-50',
                    ]"
                  >
                    <component :is="item.icon" class="h-4 w-4" />
                    <span>{{ item.title }}</span>
                  </li>
                </ul>
              </div>
            </transition>
          </div>
        </div>

        <!-- Safra Selector Global -->
        <div class="hidden md:flex items-center mr-4">
          <SafraSelectorGlobal />
        </div>

        <!-- Navigation -->

        <nav class="hidden md:flex items-center gap-8">
          <button
            v-if="currentUser?.tipo === 'ROOT'"
            @click="goToRoute('/dashboard/administrador')"
            class="px-4 py-2 text-sm font-medium text-lime-700 border border-lime-700 rounded hover:bg-lime-700 hover:text-white transition-colors cursor-pointer"
          >
            Administrador
          </button>

          <!-- Dropdown "Mais" -->
          <div class="relative">
            <button
              @click="toggleMenu"
              class="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors focus:outline-none"
            >
              Mais
              <ChevronDown class="h-4 w-4" />
            </button>

            <!-- Dropdown Menu -->

            <div
              v-if="isMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-10"
            >
              <a
                href="#"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >Ajuda</a
              >

              <a
                @click="signOut"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >Sair</a
              >
            </div>
          </div>
        </nav>

        <!-- Mobile Menu Button -->

        <div class="md:hidden flex items-center ml-auto">
          <button
            @click="toggleMobileMenu"
            class="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <Menu v-if="!isMobileMenuOpen" class="h-6 w-6" />
            <X v-else class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->

      <div
        v-if="isMobileMenuOpen"
        class="md:hidden border-t border-gray-100 bg-white max-h-[calc(100vh-5rem)] overflow-y-auto"
      >
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <!-- Safra Selector Mobile -->
          <div class="pb-3 mb-3 border-b border-gray-100">
            <SafraSelectorGlobal />
          </div>

          <!-- Search for Mobile -->
          <div class="pb-3 mb-3 border-b border-gray-100">
            <div class="relative">
              <input
                v-model="spotlightQuery"
                @focus="spotlightOpen = true"
                @blur="spotlightOpen = false"
                @keydown.down.prevent="spotlightMove(1)"
                @keydown.up.prevent="spotlightMove(-1)"
                @keydown.enter.prevent="spotlightSelect"
                type="text"
                placeholder="Buscar módulos..."
                class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
              />
              <svg
                class="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <!-- Spotlight Results Mobile -->
              <div
                v-if="spotlightOpen && spotlightResults.length"
                class="absolute z-30 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-100 max-h-64 overflow-y-auto"
              >
                <ul>
                  <li
                    v-for="(item, idx) in spotlightResults"
                    :key="item.path"
                    @mousedown="spotlightNavigate(item.path)"
                    :class="[
                      'px-4 py-2 text-sm cursor-pointer flex items-center gap-3',
                      idx === spotlightActiveIndex
                        ? 'bg-lime-50 text-lime-700'
                        : 'text-gray-700 hover:bg-gray-50',
                    ]"
                  >
                    <component :is="item.icon" class="h-4 w-4" />
                    <span>{{ item.title }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Menu Groups (from Sidebar) -->
          <div v-for="(group, idx) in menuGroups" :key="idx" class="mb-4">
            <div class="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {{ group.title }}
            </div>
            <ul class="space-y-1">
              <SidebarMenuItem
                v-for="(item, itemIdx) in group.items"
                :key="itemIdx"
                :item="item"
                :is-sidebar-collapsed="false"
              />
            </ul>
          </div>

          <div class="border-t border-gray-100 my-2"></div>

          <button
            v-if="currentUser?.tipo === 'ROOT'"
            @click="goToRoute('/dashboard/administrador')"
            class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Administrador
          </button>

          <div class="border-t border-gray-100 my-2"></div>

          <a
            href="#"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
            >Ajuda</a
          >

          <a
            @click="signOut"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
            >Sair</a
          >
        </div>
      </div>
    </header>

    <!-- Sidebar & Main Content Wrapper -->
    <div class="flex flex-grow overflow-hidden">
      <!-- Sidebar -->
      <aside
        :class="[
          'bg-white border-r border-gray-200 transition-all duration-300 flex-col z-20 hidden md:flex h-full overflow-hidden',
          isSidebarCollapsed ? 'w-20' : 'w-68',
        ]"
      >
        <div class="p-4 flex justify-end">
          <button
            @click="isSidebarCollapsed = !isSidebarCollapsed"
            class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none transition-colors"
          >
            <ChevronLeft v-if="!isSidebarCollapsed" class="h-5 w-5" />
            <ChevronRight v-else class="h-5 w-5" />
          </button>
        </div>

        <nav class="flex-1 overflow-y-auto py-4">
          <div v-for="(group, idx) in menuGroups" :key="idx" class="mb-6">
            <!-- Group Header -->
            <button
              v-if="!isSidebarCollapsed"
              @click="toggleGroup(group)"
              class="w-full flex items-center justify-between px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors focus:outline-none"
            >
              <span>{{ group.title }}</span>
              <component :is="group.isOpen ? ChevronDown : ChevronRight" class="h-3 w-3" />
            </button>
            <div v-else class="h-4"></div>

            <!-- Group Items -->
            <ul v-if="isSidebarCollapsed || group.isOpen">
              <SidebarMenuItem
                v-for="(item, itemIdx) in group.items"
                :key="itemIdx"
                :item="item"
                :is-sidebar-collapsed="isSidebarCollapsed"
              />
            </ul>

            <div
              v-if="idx < menuGroups.length - 1"
              class="border-t border-gray-100 mt-4 mx-4"
            ></div>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-grow overflow-y-auto bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <RouterView />

          <!-- AI Input Section Removed (Moved to floating chat) -->
        </div>
      </main>
    </div>
    <!-- Floating AI Assistant -->
    <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <!-- Chat Container -->
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="transform opacity-0 translate-y-4 scale-95"
        enter-to-class="transform opacity-100 translate-y-0 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="transform opacity-100 translate-y-0 scale-100"
        leave-to-class="transform opacity-0 translate-y-4 scale-95"
      >
        <div
          v-if="isAiChatOpen"
          class="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 sm:w-96 flex flex-col overflow-hidden"
          style="max-height: calc(100vh - 120px)"
        >
          <!-- Header -->
          <div class="p-4 bg-lime-600 text-white flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Sparkles class="w-5 h-5 text-lime-200" />
              <h2 class="font-semibold">Assistente IA</h2>
            </div>
            <button
              @click="isAiChatOpen = false"
              class="text-lime-100 hover:text-white transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Content -->
          <div class="p-4 flex flex-col gap-4 overflow-y-auto">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium text-gray-700">Contexto:</span>
              <select
                v-model="aiContext"
                class="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none cursor-pointer hover:border-lime-300 transition-colors"
              >
                <option value="apontamento">Apontamento</option>
                <option value="financeiro">Financeiro</option>
                <option value="notafiscal">N. Fiscal</option>
              </select>
            </div>

            <div class="relative group">
              <textarea
                v-model="aiPrompt"
                placeholder="Como posso ajudar?"
                class="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none h-32 text-sm transition-all duration-200 ease-in-out shadow-inner"
              ></textarea>
            </div>

            <!-- File/Recording Feedback -->
            <div v-if="selectedFile || isRecording" class="flex flex-wrap gap-2">
              <div
                v-if="selectedFile"
                class="flex items-center gap-2 text-xs text-lime-700 bg-lime-50 px-2 py-1 rounded-full border border-lime-100 animate-fade-in"
              >
                <Paperclip class="w-3 h-3" />
                <span class="font-medium truncate max-w-[120px]">{{ selectedFile.name }}</span>
                <button
                  @click="selectedFile = null"
                  class="ml-1 hover:bg-lime-200 rounded-full p-0.5 transition-colors"
                >
                  <X class="w-3 h-3" />
                </button>
              </div>

              <div
                v-if="isRecording"
                class="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100 animate-pulse"
              >
                <div class="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                <span class="font-medium">{{ recordingTime }}s</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-between pt-2 border-t border-gray-100">
              <div class="flex items-center gap-2">
                <label
                  class="p-2 rounded-full transition-all duration-200 text-gray-400 hover:text-lime-600 hover:bg-lime-50 cursor-pointer"
                  title="Anexar arquivo"
                >
                  <Paperclip class="w-5 h-5" />
                  <input
                    type="file"
                    accept=".pdf"
                    class="hidden"
                    @change="
                      (e) => (selectedFile = (e.target as HTMLInputElement).files?.[0] || null)
                    "
                  />
                </label>

                <button
                  @click="toggleRecording"
                  :class="[
                    'p-2 rounded-full transition-all duration-200',
                    isRecording
                      ? 'text-red-500 bg-lime-50 hover:bg-lime-100 ring-2 ring-lime-200'
                      : 'text-gray-400 hover:text-lime-600 hover:bg-lime-50',
                  ]"
                  title="Gravar áudio"
                >
                  <Mic class="w-5 h-5" />
                </button>
              </div>

              <button
                @click="submitAiQuery"
                class="p-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 active:bg-lime-800 transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center"
                title="Enviar"
              >
                <Send class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- FAB Button -->
      <button
        @click="toggleAiChat"
        class="w-14 h-14 bg-lime-600 text-white rounded-full shadow-lg hover:bg-lime-700 active:scale-95 transition-all duration-200 flex items-center justify-center group"
      >
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 rotate-45 scale-50"
          enter-to-class="opacity-100 rotate-0 scale-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 rotate-0 scale-100"
          leave-to-class="opacity-0 rotate-45 scale-50"
          mode="out-in"
        >
          <X v-if="isAiChatOpen" class="w-6 h-6" />
          <Sparkles v-else class="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </transition>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos se necessário, mas Tailwind deve resolver */
</style>
