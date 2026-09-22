import { NumeracaoReciboResponseDto } from '../../dto/numeracaoRecibo';
import { CreateNumeracaoReciboDto, UpdateNumeracaoReciboDto } from '../../dto/numeracaoRecibo';

export interface INumeracaoReciboApplicationService {
  list(page?: number, limit?: number): Promise<{ data: NumeracaoReciboResponseDto[]; page: number; limit: number; total: number; totalPages: number }>;
  findById(id: number): Promise<NumeracaoReciboResponseDto>;
  create(dto: CreateNumeracaoReciboDto): Promise<NumeracaoReciboResponseDto>;
  update(id: number, dto: UpdateNumeracaoReciboDto): Promise<NumeracaoReciboResponseDto>;
  delete(id: number): Promise<boolean>;
}
