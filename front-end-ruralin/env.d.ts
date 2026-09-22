/// <reference types="vite/client" />

declare module '@mapbox/mapbox-gl-draw' {
  import type { IControl } from 'mapbox-gl'

  interface DrawOptions {
    displayControlsDefault?: boolean
    controls?: Record<string, boolean>
    defaultMode?: string
  }

  class MapboxDraw implements IControl {
    constructor(options?: DrawOptions)
    onAdd(map: mapboxgl.Map): HTMLElement
    onRemove(): void
    add(geojson: any): string[]
    deleteAll(): this
    getAll(): GeoJSON.FeatureCollection
    changeMode(mode: string, options?: any): this
  }

  export default MapboxDraw
}
