import { IRepository } from '../../core/repository/IRepository';
import AgreementPaymentSchedule from '../../models/AgreementPaymentSchedule';

export interface IAgreementPaymentScheduleRepository extends IRepository<AgreementPaymentSchedule> {
  findByAgreement(agreementId: number): Promise<AgreementPaymentSchedule[]>;
  deleteByAgreement(agreementId: number): Promise<number>;
}
