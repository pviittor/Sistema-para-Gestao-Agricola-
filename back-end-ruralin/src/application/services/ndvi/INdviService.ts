/**
 * Interface para o serviço de NDVI/Satélite
 *
 * Abstração para integração com provedores de imagens de satélite e NDVI.
 * Implementação padrão: Agromonitoring API (OpenWeather).
 */
export interface NdviImageResult {
  /** Timestamp Unix da imagem */
  dt: number;
  /** Tipo de satélite (ex: "Landsat 8", "Sentinel-2") */
  type: string;
  /** Cobertura de nuvens (%) */
  cl: number;
  /** URLs das imagens */
  image: {
    truecolor: string;
    falsecolor: string;
    ndvi: string;
    evi: string;
  };
  /** Estatísticas NDVI */
  stats?: {
    min: number;
    max: number;
    mean: number;
    median: number;
  };
}

export interface NdviSatelliteResponse {
  talhaoId: number;
  polygonId?: string;
  images: NdviImageResult[];
  provider: string;
}

export interface INdviService {
  /**
   * Busca imagens de satélite e NDVI para um polígono
   * @param geometry GeoJSON Polygon
   * @param startDate Data inicial (Unix timestamp)
   * @param endDate Data final (Unix timestamp)
   */
  searchImages(
    geometry: object,
    startDate: number,
    endDate: number
  ): Promise<NdviImageResult[]>;

  /**
   * Registra um polígono com o provedor de satélite
   * @param geometry GeoJSON Polygon
   * @param name Nome identificador
   * @returns ID do polígono no provedor externo
   */
  registerPolygon(geometry: object, name: string): Promise<string | null>;

  /**
   * Busca imagens usando um polygonId já registrado
   */
  searchImagesByPolygonId(
    polygonId: string,
    startDate: number,
    endDate: number
  ): Promise<NdviImageResult[]>;

  /**
   * Verifica se o serviço está configurado (API key presente)
   */
  isConfigured(): boolean;
}
