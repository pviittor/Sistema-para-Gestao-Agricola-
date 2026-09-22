import AgreementField from '../../models/AgreementField';

export interface IAgreementFieldRepository {
  findByAgreement(agreementId: number): Promise<AgreementField[]>;
  deleteByAgreement(agreementId: number): Promise<number>;
  bulkCreate(entries: Partial<AgreementField>[]): Promise<AgreementField[]>;
}
