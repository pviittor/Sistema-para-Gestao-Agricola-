import { NumeracaoNfeResponseDto } from '../../dto/numeracaoNfe';
import { CreateNumeracaoNfeDto, UpdateNumeracaoNfeDto } from '../../dto/numeracaoNfe';

/**
 * Interface do Application Service para NumeracaoNfe
 */
export interface INumeracaoNfeApplicationService {
  list(page?: number, limit?: number): Promise<{ data: NumeracaoNfeResponseDto[]; page: number; limit: number; total: number; totalPages: number }>;
  findById(id: number): Promise<NumeracaoNfeResponseDto>;
  create(dto: CreateNumeracaoNfeDto): Promise<NumeracaoNfeResponseDto>;
  update(id: number, dto: UpdateNumeracaoNfeDto): Promise<NumeracaoNfeResponseDto>;
  delete(id: number): Promise<boolean>;

  /**
   * Obtém o próximo número sequencial para a série/modelo
   * NÃO consome o número — apenas retorna qual seria o próximo
   */
  consultarProximoNumero(serie: string, modelo: string): Promise<number>;

  /**
   * Consome e retorna o próximo número sequencial (com lock atômico)
   */
  proximoNumero(serie: string, modelo: string): Promise<number>;
}
