import { IApplicationService } from '../IApplicationService';
import { CreateAgreementDto } from '../../dto/agreement/CreateAgreementDto';
import { CreateAgreementCompletoDto } from '../../dto/agreement/CreateAgreementCompletoDto';
import { UpdateAgreementDto } from '../../dto/agreement/UpdateAgreementDto';
import { UpdateAgreementCompletoDto } from '../../dto/agreement/UpdateAgreementCompletoDto';
import { AgreementResponseDto } from '../../dto/agreement/AgreementResponseDto';
import { AgreementType } from '../../../models/enums/AgreementEnums';
import { PaginatedResult } from '../../../core/repository/types';

export interface IAgreementApplicationService extends IApplicationService<AgreementResponseDto, CreateAgreementDto, UpdateAgreementDto> {
  findByFazenda(fazendaId: number, page?: number, limit?: number): Promise<PaginatedResult<AgreementResponseDto>>;
  findByType(type: AgreementType, fazendaId: number, page?: number, limit?: number): Promise<PaginatedResult<AgreementResponseDto>>;
  findByField(fieldId: number): Promise<AgreementResponseDto[]>;
  findActiveByPeriod(startDate: string, endDate: string): Promise<AgreementResponseDto[]>;
  createCompleto(dto: CreateAgreementCompletoDto): Promise<AgreementResponseDto>;
  updateCompleto(id: number, dto: UpdateAgreementCompletoDto): Promise<AgreementResponseDto>;
}
