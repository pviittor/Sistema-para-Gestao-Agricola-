import { ConfiguracaoReciboResponseDto } from '../../dto/configuracaoRecibo';
import { CreateConfiguracaoReciboDto, UpdateConfiguracaoReciboDto } from '../../dto/configuracaoRecibo';

export interface IConfiguracaoReciboApplicationService {
  list(page?: number, limit?: number): Promise<{ data: ConfiguracaoReciboResponseDto[]; page: number; limit: number; total: number; totalPages: number }>;
  findById(id: number): Promise<ConfiguracaoReciboResponseDto>;
  create(dto: CreateConfiguracaoReciboDto): Promise<ConfiguracaoReciboResponseDto>;
  update(id: number, dto: UpdateConfiguracaoReciboDto): Promise<ConfiguracaoReciboResponseDto>;
  delete(id: number): Promise<boolean>;
  getConfigTenant(): Promise<ConfiguracaoReciboResponseDto | null>;
}
