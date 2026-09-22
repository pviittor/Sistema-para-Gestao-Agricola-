<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  Satellite,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  Calendar,
  Cloud,
  Leaf,
  AlertCircle
} from 'lucide-vue-next'
import type { Talhao } from '@/types/Talhao'
import { talhaoService } from '@/services/talhaoService'
import { NDVI_SCALE, getNdviColor, getNdviLabel } from '@/utils/satellite'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

const props = defineProps<{
  talhao: Talhao
}>()

interface NdviImage {
  dt: number
  type: string
  cl: number
  image: {
    truecolor: string
    falsecolor: string
    ndvi: string
    evi: string
  }
  stats?: {
    min: number
    max: number
    mean: number
    median: number
  }
}

// Logical dimensions for images
const LOGICAL_W = 600
const LOGICAL_H = 400
const PADDING = 120

const isLoading = ref(false)
const ndviImages = ref<NdviImage[]>([])
const selectedImageIdx = ref(0)
const activeLayer = ref<'satellite' | 'ndvi' | 'truecolor'>('satellite')
const provider = ref('none')
const hasError = ref(false)

const selectedImage = computed(() => {
  if (ndviImages.value.length === 0) return null
  return ndviImages.value[selectedImageIdx.value]
})

const overlayUrl = computed(() => {
  if (!selectedImage.value) return null
  if (activeLayer.value === 'ndvi') return selectedImage.value.image.ndvi || null
  if (activeLayer.value === 'truecolor') return selectedImage.value.image.truecolor || null
  return null
})

// ── Satellite URL: Mapbox renders polygon via geojson overlay + auto fit ──
// This guarantees perfect polygon alignment — Mapbox handles projection internally.

const satelliteUrl = computed(() => {
  if (!MAPBOX_TOKEN || !props.talhao.geometry) return null

  const geojson = {
    type: 'Feature',
    properties: {
      stroke: '#65a30d',
      'stroke-width': 2,
      'stroke-opacity': 0.9,
      fill: '#65a30d',
      'fill-opacity': 0.15
    },
    geometry: props.talhao.geometry
  }
  const encoded = encodeURIComponent(JSON.stringify(geojson))

  return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/geojson(${encoded})/auto/${LOGICAL_W}x${LOGICAL_H}@2x?access_token=${MAPBOX_TOKEN}&padding=${PADDING}`
})

// ── NDVI overlay: Web Mercator projection to position NDVI image over satellite ──
// We replicate Mapbox's auto-fit algorithm to compute where the polygon bbox
// falls in pixel space. Slight misalignment is acceptable since the NDVI
// fills the polygon area (the outline is rendered by Mapbox in the base image).

function mercatorY(lat: number): number {
  const r = (lat * Math.PI) / 180
  return Math.log(Math.tan(Math.PI / 4 + r / 2))
}

interface FitView {
  centerLng: number
  centerLat: number
  zoom: number
  minLng: number
  maxLng: number
  minLat: number
  maxLat: number
}

function computeFitView(coords: number[][]): FitView | null {
  if (!coords || coords.length < 3) return null

  let minLng = Infinity, maxLng = -Infinity
  let minLat = Infinity, maxLat = -Infinity

  for (const c of coords) {
    const lng = c[0]!, lat = c[1]!
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  }

  const centerLng = (minLng + maxLng) / 2
  const centerLat = (minLat + maxLat) / 2

  const availW = LOGICAL_W - 2 * PADDING
  const availH = LOGICAL_H - 2 * PADDING

  const lngSpan = maxLng - minLng
  const mySpan = mercatorY(maxLat) - mercatorY(minLat)

  if (lngSpan <= 0 || mySpan <= 0) return null

  const zoomX = Math.log2((availW * 360) / (lngSpan * 256))
  const zoomY = Math.log2((availH * 2 * Math.PI) / (mySpan * 256))
  const zoom = Math.min(zoomX, zoomY)

  return { centerLng, centerLat, zoom, minLng, maxLng, minLat, maxLat }
}

function geoToPixel(lng: number, lat: number, fv: FitView): { x: number; y: number } {
  const scale = 256 * Math.pow(2, fv.zoom)
  const x = ((lng - fv.centerLng) / 360) * scale + LOGICAL_W / 2
  const y = ((mercatorY(fv.centerLat) - mercatorY(lat)) / (2 * Math.PI)) * scale + LOGICAL_H / 2
  return { x, y }
}

const fitView = computed(() => {
  const coords = props.talhao.geometry?.coordinates?.[0]
  if (!coords) return null
  return computeFitView(coords)
})

// ── NDVI overlay style: position + clip-path as CSS (no SVG, avoids CORS) ──

const ndviOverlayStyle = computed(() => {
  const fv = fitView.value
  const coords = props.talhao.geometry?.coordinates?.[0]
  if (!fv || !coords) return null

  // Bbox in pixel coords
  const topLeft = geoToPixel(fv.minLng, fv.maxLat, fv)
  const bottomRight = geoToPixel(fv.maxLng, fv.minLat, fv)
  const bboxW = bottomRight.x - topLeft.x
  const bboxH = bottomRight.y - topLeft.y

  if (bboxW <= 0 || bboxH <= 0) return null

  // Position as percentages of the container
  const leftPct = (topLeft.x / LOGICAL_W) * 100
  const topPct = (topLeft.y / LOGICAL_H) * 100
  const widthPct = (bboxW / LOGICAL_W) * 100
  const heightPct = (bboxH / LOGICAL_H) * 100

  // Clip-path coordinates relative to the NDVI element (percentages within bbox)
  // Uses linear lat/lng mapping — accurate enough at farm scale
  const lngSpan = fv.maxLng - fv.minLng
  const latSpan = fv.maxLat - fv.minLat
  const clipPoints = coords.map((c) => {
    const xPct = ((c[0]! - fv.minLng) / lngSpan) * 100
    const yPct = ((fv.maxLat - c[1]!) / latSpan) * 100
    return `${xPct}% ${yPct}%`
  })

  return {
    position: 'absolute' as const,
    left: `${leftPct}%`,
    top: `${topPct}%`,
    width: `${widthPct}%`,
    height: `${heightPct}%`,
    objectFit: 'fill' as const,
    clipPath: `polygon(${clipPoints.join(', ')})`,
  }
})

// ── Data fetching ──

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const prevImage = () => {
  if (selectedImageIdx.value > 0) selectedImageIdx.value--
}

const nextImage = () => {
  if (selectedImageIdx.value < ndviImages.value.length - 1) selectedImageIdx.value++
}

const fetchNdviData = async () => {
  if (!props.talhao.id_talhao || !props.talhao.geometry) return

  isLoading.value = true
  hasError.value = false
  try {
    const result = await talhaoService.getNdvi(props.talhao.id_talhao)
    ndviImages.value = result.images || []
    provider.value = result.provider || 'none'
    selectedImageIdx.value = ndviImages.value.length > 0 ? ndviImages.value.length - 1 : 0
  } catch (error) {
    console.error('Erro ao buscar dados NDVI:', error)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.talhao.id_talhao,
  () => {
    activeLayer.value = 'satellite'
    ndviImages.value = []
    fetchNdviData()
  }
)

onMounted(() => {
  fetchNdviData()
})
</script>

<template>
  <div class="flex flex-col h-full space-y-4">
    <!-- Image viewer -->
    <div
      class="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-900 flex items-center justify-center"
      :style="{ aspectRatio: `${LOGICAL_W} / ${LOGICAL_H}` }"
    >
      <!-- Loading -->
      <div v-if="isLoading" class="flex flex-col items-center gap-3 text-gray-400">
        <Loader2 class="h-8 w-8 animate-spin" />
        <span class="text-sm">Carregando imagens de satélite...</span>
      </div>

      <!-- No geometry -->
      <div v-else-if="!talhao.geometry" class="flex flex-col items-center gap-3 text-gray-400 p-8 text-center">
        <AlertCircle class="h-10 w-10" />
        <p class="text-sm">Desenhe o polígono do talhão na aba "Mapa" para visualizar imagens de satélite.</p>
      </div>

      <!-- Image display -->
      <template v-else>
        <div v-if="!satelliteUrl" class="flex flex-col items-center gap-3 text-gray-400">
          <Satellite class="h-10 w-10" />
          <span class="text-sm">Imagem não disponível</span>
        </div>

        <template v-else>
          <!-- Satellite base image (Mapbox renders polygon outline via geojson overlay) -->
          <img
            :src="satelliteUrl"
            :alt="`Imagem satelital - ${talhao.descricao}`"
            class="absolute inset-0 w-full h-full object-fill"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />

          <!-- NDVI/TrueColor overlay — HTML img with CSS clip-path (avoids SVG CORS) -->
          <img
            v-if="overlayUrl && ndviOverlayStyle"
            :src="overlayUrl"
            alt="NDVI overlay"
            class="pointer-events-none"
            :style="ndviOverlayStyle"
          />
        </template>

        <!-- Layer toggle overlay -->
        <div class="absolute top-3 right-3 flex flex-col gap-1 z-10">
          <button
            @click="activeLayer = 'satellite'"
            class="px-3 py-1.5 rounded text-xs font-medium transition-colors backdrop-blur-sm"
            :class="activeLayer === 'satellite' ? 'bg-lime-600 text-white' : 'bg-black/50 text-white hover:bg-black/70'"
          >
            <Satellite class="h-3 w-3 inline mr-1" />
            Satélite
          </button>
          <button
            v-if="ndviImages.length > 0"
            @click="activeLayer = 'ndvi'"
            class="px-3 py-1.5 rounded text-xs font-medium transition-colors backdrop-blur-sm"
            :class="activeLayer === 'ndvi' ? 'bg-lime-600 text-white' : 'bg-black/50 text-white hover:bg-black/70'"
          >
            <Leaf class="h-3 w-3 inline mr-1" />
            NDVI
          </button>
          <button
            v-if="ndviImages.length > 0"
            @click="activeLayer = 'truecolor'"
            class="px-3 py-1.5 rounded text-xs font-medium transition-colors backdrop-blur-sm"
            :class="activeLayer === 'truecolor' ? 'bg-lime-600 text-white' : 'bg-black/50 text-white hover:bg-black/70'"
          >
            <Eye class="h-3 w-3 inline mr-1" />
            True Color
          </button>
        </div>

        <!-- Date info overlay -->
        <div v-if="selectedImage && activeLayer !== 'satellite'" class="absolute bottom-3 left-3 flex items-center gap-2 z-10">
          <span class="bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded flex items-center gap-1.5">
            <Calendar class="h-3 w-3" />
            {{ formatDate(selectedImage.dt) }}
          </span>
          <span class="bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded flex items-center gap-1.5">
            <Cloud class="h-3 w-3" />
            {{ selectedImage.cl.toFixed(0) }}% nuvens
          </span>
          <span class="bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded">
            {{ selectedImage.type }}
          </span>
        </div>
      </template>
    </div>

    <!-- Date navigation (only if NDVI images available) -->
    <div v-if="ndviImages.length > 0" class="flex items-center justify-between">
      <button
        @click="prevImage"
        :disabled="selectedImageIdx === 0"
        class="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft class="h-4 w-4 text-gray-600" />
      </button>
      <div class="flex gap-1 overflow-x-auto px-2">
        <button
          v-for="(img, idx) in ndviImages"
          :key="img.dt"
          @click="selectedImageIdx = idx"
          class="px-2 py-1 rounded text-xs whitespace-nowrap transition-colors"
          :class="idx === selectedImageIdx ? 'bg-lime-100 text-lime-700 font-semibold' : 'text-gray-500 hover:bg-gray-100'"
        >
          {{ formatDate(img.dt) }}
        </button>
      </div>
      <button
        @click="nextImage"
        :disabled="selectedImageIdx === ndviImages.length - 1"
        class="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight class="h-4 w-4 text-gray-600" />
      </button>
    </div>

    <!-- NDVI Stats -->
    <div v-if="selectedImage?.stats && activeLayer === 'ndvi'" class="bg-gray-50 rounded-lg p-4">
      <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Leaf class="h-4 w-4 text-lime-600" />
        Índice de Vegetação (NDVI)
      </h4>
      <div class="grid grid-cols-4 gap-3 mb-3">
        <div class="text-center">
          <p class="text-xs text-gray-500">Mínimo</p>
          <p class="text-lg font-bold" :style="{ color: getNdviColor(selectedImage.stats.min) }">
            {{ selectedImage.stats.min.toFixed(2) }}
          </p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500">Média</p>
          <p class="text-lg font-bold" :style="{ color: getNdviColor(selectedImage.stats.mean) }">
            {{ selectedImage.stats.mean.toFixed(2) }}
          </p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500">Mediana</p>
          <p class="text-lg font-bold" :style="{ color: getNdviColor(selectedImage.stats.median) }">
            {{ selectedImage.stats.median.toFixed(2) }}
          </p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500">Máximo</p>
          <p class="text-lg font-bold" :style="{ color: getNdviColor(selectedImage.stats.max) }">
            {{ selectedImage.stats.max.toFixed(2) }}
          </p>
        </div>
      </div>
      <p class="text-xs text-gray-500">
        Saúde da vegetação: <span class="font-semibold" :style="{ color: getNdviColor(selectedImage.stats.mean) }">{{ getNdviLabel(selectedImage.stats.mean) }}</span>
      </p>
    </div>

    <!-- NDVI Legend -->
    <div v-if="activeLayer === 'ndvi' || ndviImages.length > 0" class="bg-gray-50 rounded-lg p-4">
      <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Legenda NDVI</h4>
      <div class="flex items-center gap-0.5 h-4 rounded-full overflow-hidden">
        <div
          v-for="level in NDVI_SCALE"
          :key="level.label"
          :style="{ backgroundColor: level.color }"
          class="flex-1 h-full"
          :title="level.label"
        ></div>
      </div>
      <div class="flex justify-between mt-1">
        <span class="text-[10px] text-gray-400">-1.0 (sem vegetação)</span>
        <span class="text-[10px] text-gray-400">+1.0 (vegetação densa)</span>
      </div>
    </div>

    <!-- No NDVI provider message -->
    <div v-if="!isLoading && talhao.geometry && provider === 'none' && ndviImages.length === 0" class="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <AlertCircle class="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-medium text-amber-800">Provedor NDVI não configurado</p>
          <p class="text-xs text-amber-600 mt-1">
            A imagem de satélite acima é do Mapbox. Para dados NDVI (índice de vegetação),
            configure a variável <code class="bg-amber-100 px-1 rounded">AGROMONITORING_API_KEY</code> no backend.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
