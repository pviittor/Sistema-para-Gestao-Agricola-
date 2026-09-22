/**
 * Utilitários para geração de URLs de imagem satelital via Mapbox Static Images API
 */

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

export interface SatelliteImageOptions {
  width?: number
  height?: number
  padding?: number
  retina?: boolean
  style?: 'satellite-v9' | 'satellite-streets-v12'
}

/**
 * Gera URL de imagem satelital estática para um polígono GeoJSON via Mapbox
 */
export function getSatelliteImageUrl(
  geometry: { type: string; coordinates: number[][][] } | null | undefined,
  options: SatelliteImageOptions = {}
): string | null {
  if (!geometry || !geometry.coordinates || !MAPBOX_TOKEN) return null

  const {
    width = 400,
    height = 250,
    padding = 30,
    retina = true,
    style = 'satellite-v9'
  } = options

  const geojson = {
    type: 'Feature',
    properties: {
      stroke: '#65a30d',
      'stroke-width': 2,
      'stroke-opacity': 0.9,
      fill: '#65a30d',
      'fill-opacity': 0.15
    },
    geometry
  }

  const encoded = encodeURIComponent(JSON.stringify(geojson))
  const retinaStr = retina ? '@2x' : ''

  return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/geojson(${encoded})/auto/${width}x${height}${retinaStr}?access_token=${MAPBOX_TOKEN}&padding=${padding}`
}

/**
 * Gera URL de imagem satelital para coordenadas específicas (sem polígono)
 */
export function getSatelliteImageUrlByCenter(
  lng: number,
  lat: number,
  zoom: number = 15,
  options: SatelliteImageOptions = {}
): string | null {
  if (!MAPBOX_TOKEN) return null

  const {
    width = 400,
    height = 250,
    retina = true,
    style = 'satellite-v9'
  } = options

  const retinaStr = retina ? '@2x' : ''
  return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${lng},${lat},${zoom}/${width}x${height}${retinaStr}?access_token=${MAPBOX_TOKEN}`
}

/**
 * Calcula o centro de um polígono GeoJSON
 */
export function getPolygonCenter(geometry: { type: string; coordinates: number[][][] }): [number, number] {
  const coords = geometry.coordinates[0]!
  const lng = coords.reduce((s, c) => s + c[0]!, 0) / coords.length
  const lat = coords.reduce((s, c) => s + c[1]!, 0) / coords.length
  return [lng, lat]
}

/**
 * Escala de cores NDVI para uso em legendas
 * Valores de NDVI: -1.0 a 1.0
 * < 0.1: Água/solo nu/rocha
 * 0.1-0.2: Solo exposto / vegetação morta
 * 0.2-0.4: Vegetação rala / estresse hídrico
 * 0.4-0.6: Vegetação moderada
 * 0.6-0.8: Vegetação densa saudável
 * 0.8-1.0: Vegetação muito densa
 */
export const NDVI_SCALE = [
  { min: -1.0, max: 0.1, color: '#d73027', label: 'Sem vegetação' },
  { min: 0.1, max: 0.2, color: '#fc8d59', label: 'Solo exposto' },
  { min: 0.2, max: 0.4, color: '#fee08b', label: 'Vegetação rala' },
  { min: 0.4, max: 0.6, color: '#d9ef8b', label: 'Vegetação moderada' },
  { min: 0.6, max: 0.8, color: '#66bd63', label: 'Vegetação densa' },
  { min: 0.8, max: 1.0, color: '#1a9850', label: 'Vegetação muito densa' },
]

/**
 * Retorna a cor NDVI para um valor dado
 */
export function getNdviColor(value: number): string {
  for (const level of NDVI_SCALE) {
    if (value >= level.min && value < level.max) return level.color
  }
  return NDVI_SCALE[NDVI_SCALE.length - 1]!.color
}

/**
 * Retorna o label NDVI para um valor dado
 */
export function getNdviLabel(value: number): string {
  for (const level of NDVI_SCALE) {
    if (value >= level.min && value < level.max) return level.label
  }
  return NDVI_SCALE[NDVI_SCALE.length - 1]!.label
}
