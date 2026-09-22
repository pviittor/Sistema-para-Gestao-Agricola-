import { Injectable } from '../../../core/di';
import { INdviService, NdviImageResult } from './INdviService';

const AGROMONITORING_BASE_URL = 'https://api.agromonitoring.com/agro';

/**
 * Serviço de NDVI/Satélite via Agromonitoring API (OpenWeather)
 *
 * Requer AGROMONITORING_API_KEY configurada no .env
 * Free tier: 60 calls/min, 1000 calls/day
 */
@Injectable()
export class NdviService implements INdviService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.AGROMONITORING_API_KEY || '26ec0682f8d4f9783f397dd41d91adb0';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async registerPolygon(geometry: object, name: string): Promise<string | null> {
    if (!this.isConfigured()) return null;

    try {
      const response = await fetch(`${AGROMONITORING_BASE_URL}/1.0/polygons?appid=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          geo_json: {
            type: 'Feature',
            properties: {},
            geometry,
          },
        }),
      });

      if (!response.ok) {
        console.error('Agromonitoring registerPolygon error:', response.status, await response.text());
        return null;
      }

      const data: any = await response.json();
      return data.id || null;
    } catch (error) {
      console.error('Agromonitoring registerPolygon error:', error);
      return null;
    }
  }

  async searchImages(
    geometry: object,
    startDate: number,
    endDate: number
  ): Promise<NdviImageResult[]> {
    if (!this.isConfigured()) return [];

    // Primeiro registra o polígono temporário
    const polygonId = await this.registerPolygon(geometry, `temp_${Date.now()}`);
    if (!polygonId) return [];

    try {
      const images = await this.searchImagesByPolygonId(polygonId, startDate, endDate);

      // Limpa o polígono temporário
      await this.deletePolygon(polygonId);

      return images;
    } catch (error) {
      // Tenta limpar mesmo em caso de erro
      await this.deletePolygon(polygonId).catch(() => {});
      throw error;
    }
  }

  async searchImagesByPolygonId(
    polygonId: string,
    startDate: number,
    endDate: number
  ): Promise<NdviImageResult[]> {
    if (!this.isConfigured()) return [];

    try {
      const url = `${AGROMONITORING_BASE_URL}/2.0/image/search?polyid=${polygonId}&start=${startDate}&end=${endDate}&appid=${this.apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error('Agromonitoring searchImages error:', response.status, await response.text());
        return [];
      }

      const data: any = await response.json();

      if (!Array.isArray(data)) return [];

      return data.map((item: any) => ({
        dt: item.dt,
        type: item.type || 'Unknown',
        cl: item.cl || 0,
        image: {
          truecolor: item.image?.truecolor || '',
          falsecolor: item.image?.falsecolor || '',
          ndvi: item.image?.ndvi || '',
          evi: item.image?.evi || '',
        },
        stats: item.stats?.ndvi
          ? {
              min: item.stats.ndvi.min ?? 0,
              max: item.stats.ndvi.max ?? 0,
              mean: item.stats.ndvi.mean ?? 0,
              median: item.stats.ndvi.median ?? 0,
            }
          : undefined,
      }));
    } catch (error) {
      console.error('Agromonitoring searchImages error:', error);
      return [];
    }
  }

  private async deletePolygon(polygonId: string): Promise<void> {
    if (!this.isConfigured()) return;

    try {
      await fetch(`${AGROMONITORING_BASE_URL}/1.0/polygons/${polygonId}?appid=${this.apiKey}`, {
        method: 'DELETE',
      });
    } catch (error) {
      // Silently fail - cleanup is best-effort
    }
  }
}
