import { IsNotEmpty, IsOptional, IsInt, IsNumber, Min, Max, IsDateString } from 'class-validator';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { IsDateAfter } from '../../validators/IsDateAfter';
import { PaymentPeriod, AmountRate } from '../../../models/enums/AgreementEnums';

export class AgreementPaymentScheduleSemIdDto {
  @IsNotEmpty({ message: 'Intervalo de pagamento é obrigatório' })
  @IsInt({ message: 'Intervalo de pagamento deve ser um número inteiro' })
  @Min(1, { message: 'Intervalo de pagamento deve ser no mínimo 1' })
  @Max(20, { message: 'Intervalo de pagamento deve ser no máximo 20' })
  paymentInterval!: number;

  @IsNotEmpty({ message: 'Período de pagamento é obrigatório' })
  @IsValidEnum(PaymentPeriod, { message: 'Período de pagamento deve ser MONTH ou YEAR' })
  paymentPeriod!: PaymentPeriod;

  @IsNotEmpty({ message: 'Dia de pagamento é obrigatório' })
  @IsInt({ message: 'Dia de pagamento deve ser um número inteiro' })
  @Min(1, { message: 'Dia de pagamento deve ser no mínimo 1' })
  @Max(31, { message: 'Dia de pagamento deve ser no máximo 31' })
  paymentDay!: number;

  @IsNotEmpty({ message: 'Valor é obrigatório' })
  @IsNumber({}, { message: 'Valor deve ser um número' })
  @Min(0, { message: 'Valor deve ser no mínimo 0' })
  amount!: number;

  @IsNotEmpty({ message: 'Taxa/valor é obrigatório' })
  @IsValidEnum(AmountRate, { message: 'Taxa deve ser TOTAL ou PER_HECTARE' })
  amountRate!: AmountRate;

  @IsNotEmpty({ message: 'Data de início é obrigatória' })
  @IsDateString({}, { message: 'Data de início deve ser uma data válida no formato YYYY-MM-DD' })
  startDate!: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data de fim deve ser uma data válida no formato YYYY-MM-DD' })
  @IsDateAfter('startDate', true, { message: 'Data de fim deve ser posterior ou igual à data de início' })
  endDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data de liquidação deve ser uma data válida no formato YYYY-MM-DD' })
  dataLiquidacao?: string;

  @IsOptional()
  status?: string;
}
