import { IApplicationService } from '../IApplicationService';
import { CreateTalhaoDto } from '../../dto/talhao/CreateTalhaoDto';
import { UpdateTalhaoDto } from '../../dto/talhao/UpdateTalhaoDto';
import { TalhaoResponseDto } from '../../dto/talhao/TalhaoResponseDto';
import { NdviSatelliteResponse } from '../ndvi/INdviService';

/**
 * Interface para Application Service de Talhao
 */
export interface ITalhaoApplicationService extends IApplicationService<TalhaoResponseDto, CreateTalhaoDto, UpdateTalhaoDto> {
  listAll(): Promise<TalhaoResponseDto[]>;
  findByFazenda(fazendaId: number): Promise<TalhaoResponseDto[]>;
  getNdviData(talhaoId: number, startDate?: number, endDate?: number): Promise<NdviSatelliteResponse>;
}
