<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { Search, Square, Circle, PenTool, Trash2 } from 'lucide-vue-next'
import type { Talhao } from '@/types/Talhao'

const props = withDefaults(defineProps<{
  modelValue?: object | null
  existingFields?: Talhao[]
  center?: [number, number]
}>(), {
  modelValue: null,
  existingFields: () => [],
  center: () => [-49.27, -16.68] // Brasil central (Goiânia)
})

const emit = defineEmits<{
  'update:modelValue': [value: object | null]
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
const searchInput = ref('')
const calculatedArea = ref<number | null>(null)
const drawMode = ref<'polygon' | 'rectangle' | 'circle'>('polygon')

let map: mapboxgl.Map | null = null
let draw: MapboxDraw | null = null

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

// Calculate area from GeoJSON polygon (Shoelace formula with approximate projection)
const calculatePolygonArea = (coordinates: number[][][]): number => {
  if (!coordinates || !coordinates[0] || coordinates[0].length < 3) return 0
  const ring = coordinates[0]

  // Use approximate area calculation (meters^2)
  // Convert to approximate planar coords using center latitude
  const centerLat = ring.reduce((s, c) => s + (c?.[1] ?? 0), 0) / ring.length
  const latFactor = 111320 // meters per degree latitude
  const lngFactor = 111320 * Math.cos((centerLat * Math.PI) / 180)

  let area = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const p1 = ring[i]!
    const p2 = ring[i + 1]!
    const x1 = p1[0]! * lngFactor
    const y1 = p1[1]! * latFactor
    const x2 = p2[0]! * lngFactor
    const y2 = p2[1]! * latFactor
    area += x1 * y2 - x2 * y1
  }
  area = Math.abs(area) / 2

  // Convert to hectares
  return area / 10000
}

const handleDrawUpdate = () => {
  if (!draw) return
  const data = draw.getAll()
  if (data.features.length > 0) {
    const feature = data.features[data.features.length - 1]!
    if (feature.geometry!.type === 'Polygon') {
      const geom = feature.geometry as GeoJSON.Polygon
      const geojson = {
        type: 'Polygon',
        coordinates: geom.coordinates
      }
      calculatedArea.value = calculatePolygonArea(geom.coordinates)
      emit('update:modelValue', geojson)
    }
  } else {
    calculatedArea.value = null
    emit('update:modelValue', null)
  }
}

const clearDrawing = () => {
  if (!draw) return
  draw.deleteAll()
  calculatedArea.value = null
  emit('update:modelValue', null)
}

const startDraw = (mode: 'polygon' | 'rectangle' | 'circle') => {
  if (!draw) return
  drawMode.value = mode

  // Clear existing drawings first
  draw.deleteAll()

  switch (mode) {
    case 'polygon':
      draw.changeMode('draw_polygon')
      break
    case 'rectangle':
      // Use simple_select as fallback, draw_polygon for rectangle approximation
      draw.changeMode('draw_polygon')
      break
    case 'circle':
      // Circle: use draw_polygon, user will draw approximate circle
      draw.changeMode('draw_polygon')
      break
  }
}

const handleSearch = async () => {
  if (!searchInput.value || !map || !MAPBOX_TOKEN) return

  // Check if it's coordinates (lng, lat format)
  const coordMatch = searchInput.value.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/)
  if (coordMatch) {
    const lng = parseFloat(coordMatch[1]!)
    const lat = parseFloat(coordMatch[2]!)
    map.flyTo({ center: [lng, lat], zoom: 15 })
    return
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchInput.value)}.json?access_token=${MAPBOX_TOKEN}&country=br&limit=1`
    )
    const data = await response.json()
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center
      map.flyTo({ center: [lng, lat], zoom: 15 })
    }
  } catch (error) {
    console.error('Erro na busca de endereço:', error)
  }
}

const addExistingFieldsLayer = () => {
  if (!map) return

  const features = props.existingFields
    .filter(f => f.geometry && f.geometry.coordinates)
    .map(f => ({
      type: 'Feature' as const,
      properties: { name: f.descricao, id: f.id_talhao },
      geometry: f.geometry as GeoJSON.Geometry
    }))

  if (features.length === 0) return

  const sourceId = 'existing-fields'

  if (map.getSource(sourceId)) {
    (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features
    })
    return
  }

  map.addSource(sourceId, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features
    }
  })

  map.addLayer({
    id: 'existing-fields-fill',
    type: 'fill',
    source: sourceId,
    paint: {
      'fill-color': '#94a3b8',
      'fill-opacity': 0.3
    }
  })

  map.addLayer({
    id: 'existing-fields-outline',
    type: 'line',
    source: sourceId,
    paint: {
      'line-color': '#64748b',
      'line-width': 2
    }
  })

  map.addLayer({
    id: 'existing-fields-labels',
    type: 'symbol',
    source: sourceId,
    layout: {
      'text-field': ['get', 'name'],
      'text-size': 12,
      'text-anchor': 'center'
    },
    paint: {
      'text-color': '#1e293b',
      'text-halo-color': '#ffffff',
      'text-halo-width': 1
    }
  })
}

const initMap = () => {
  if (!mapContainer.value || !MAPBOX_TOKEN) return

  mapboxgl.accessToken = MAPBOX_TOKEN

  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: props.center,
    zoom: 14
  })

  draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {}
  })

  map.addControl(draw, 'top-left')
  map.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

  map.on('draw.create', handleDrawUpdate)
  map.on('draw.update', handleDrawUpdate)
  map.on('draw.delete', handleDrawUpdate)

  map.on('load', () => {
    addExistingFieldsLayer()

    // If there's an initial polygon, draw it
    if (props.modelValue && (props.modelValue as any).coordinates) {
      const feature = {
        type: 'Feature' as const,
        properties: {},
        geometry: props.modelValue as any
      }
      draw!.add(feature as any)
      calculatedArea.value = calculatePolygonArea((props.modelValue as any).coordinates)

      // Fit bounds to the polygon
      const coords = (props.modelValue as any).coordinates[0]
      if (coords && coords.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()
        coords.forEach((c: number[]) => bounds.extend([c[0]!, c[1]!] as [number, number]))
        map!.fitBounds(bounds, { padding: 50 })
      }
    }
  })
}

watch(() => props.existingFields, () => {
  if (map && map.loaded()) {
    addExistingFieldsLayer()
  }
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    initMap()
  })
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
    draw = null
  }
})
</script>

<template>
  <div class="flex flex-col h-full min-h-[400px]">
    <!-- Search bar -->
    <div class="flex gap-2 mb-3">
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="h-4 w-4 text-gray-400" />
        </div>
        <input
          v-model="searchInput"
          type="text"
          placeholder="Buscar endereço ou coordenadas (lng, lat)..."
          class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
          @keyup.enter="handleSearch"
        />
      </div>
      <button
        @click="handleSearch"
        class="px-4 py-2 bg-lime-600 text-white rounded-lg text-sm hover:bg-lime-700 transition-colors"
      >
        Buscar
      </button>
    </div>

    <!-- Map container -->
    <div ref="mapContainer" class="flex-1 rounded-lg overflow-hidden border border-gray-200 min-h-[350px]"></div>

    <!-- Draw toolbar -->
    <div class="flex items-center justify-between mt-3">
      <div class="flex gap-2">
        <button
          @click="startDraw('polygon')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors"
          :class="drawMode === 'polygon' ? 'bg-lime-100 border-lime-300 text-lime-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
        >
          <PenTool class="h-3.5 w-3.5" />
          Livre
        </button>
        <button
          @click="startDraw('rectangle')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors"
          :class="drawMode === 'rectangle' ? 'bg-lime-100 border-lime-300 text-lime-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
        >
          <Square class="h-3.5 w-3.5" />
          Quadrado
        </button>
        <button
          @click="startDraw('circle')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors"
          :class="drawMode === 'circle' ? 'bg-lime-100 border-lime-300 text-lime-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
        >
          <Circle class="h-3.5 w-3.5" />
          Círculo
        </button>
        <button
          @click="clearDrawing"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 class="h-3.5 w-3.5" />
          Limpar
        </button>
      </div>
      <div v-if="calculatedArea !== null" class="text-sm text-gray-600">
        Área calculada: <span class="font-semibold text-lime-700">{{ calculatedArea.toFixed(2) }} ha</span>
      </div>
    </div>
  </div>
</template>
