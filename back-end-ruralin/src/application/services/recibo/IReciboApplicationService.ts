import { ReciboResponseDto, CreateReciboDto, UpdateReciboDto, CancelarReciboDto, ReciboKpisDto } from '../../dto/recibo';
import { PaginatedResult } from '../../../core/repository/types';

export interface IReciboApplicationService {
  list(page?: number, limit?: number, filtros?: any): Promise<PaginatedResult<ReciboResponseDto>>;
  findById(id: number): Promise<ReciboResponseDto>;
  create(dto: CreateReciboDto): Promise<ReciboResponseDto>;
  update(id: number, dto: UpdateReciboDto): Promise<ReciboResponseDto>;
  delete(id: number): Promise<boolean>;
  cancelar(id: number, dto: CancelarReciboDto): Promise<ReciboResponseDto>;
  getKpis(dataInicio?: string, dataFim?: string): Promise<ReciboKpisDto>;
  prePreencherDeParcela(parcelaId: number, tipoParcela: string): Promise<Partial<CreateReciboDto>>;
}
