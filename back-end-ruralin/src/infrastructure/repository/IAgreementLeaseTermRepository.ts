import { IRepository } from '../../core/repository/IRepository';
import AgreementLeaseTerm from '../../models/AgreementLeaseTerm';

export interface IAgreementLeaseTermRepository extends IRepository<AgreementLeaseTerm> {
  findByAgreement(agreementId: number): Promise<AgreementLeaseTerm[]>;
  deleteByAgreement(agreementId: number): Promise<number>;
}
