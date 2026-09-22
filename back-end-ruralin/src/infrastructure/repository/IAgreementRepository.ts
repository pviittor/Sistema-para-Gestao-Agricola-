import { IRepository } from '../../core/repository/IRepository';
import Agreement from '../../models/Agreement';
import { AgreementType } from '../../models/enums/AgreementEnums';

export interface IAgreementRepository extends IRepository<Agreement> {
  findByFazenda(fazendaId: number): Promise<Agreement[]>;
  findByType(type: AgreementType, fazendaId: number): Promise<Agreement[]>;
  findByField(fieldId: number): Promise<Agreement[]>;
  findActiveByPeriod(startDate: Date, endDate: Date): Promise<Agreement[]>;
  findWithSchedules(id: number): Promise<Agreement | null>;
  findWithLeaseTerms(id: number): Promise<Agreement | null>;
}
