import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAgreementDto } from './CreateAgreementDto';
import { AgreementPaymentScheduleSemIdDto } from './AgreementPaymentScheduleSemIdDto';
import { AgreementLeaseTermSemIdDto } from './AgreementLeaseTermSemIdDto';

export class CreateAgreementCompletoDto extends CreateAgreementDto {
  @IsOptional()
  @IsArray({ message: 'Cronogramas de pagamento deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => AgreementPaymentScheduleSemIdDto)
  paymentSchedules?: AgreementPaymentScheduleSemIdDto[];

  @IsOptional()
  @IsArray({ message: 'Termos de arrendamento deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => AgreementLeaseTermSemIdDto)
  leaseTerms?: AgreementLeaseTermSemIdDto[];
}
