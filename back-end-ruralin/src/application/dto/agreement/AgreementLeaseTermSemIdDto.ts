import { IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { LeaseTermType, ExpenseCategory } from '../../../models/enums/AgreementEnums';

export class AgreementLeaseTermSemIdDto {
  @IsNotEmpty({ message: 'Tipo do termo é obrigatório' })
  @IsValidEnum(LeaseTermType, { message: 'Tipo do termo deve ser BASE_RENT, CROP_SHARE, YIELD_ADJUSTMENT ou EXPENSE_SHARE' })
  termType!: LeaseTermType;

  @IsOptional()
  @IsValidEnum(ExpenseCategory, { message: 'Categoria de despesa deve ser ALL, INPUTS ou FERTILIZER' })
  expenseCategory?: ExpenseCategory;

  @IsOptional()
  @IsNumber({}, { message: 'Alocação de custo do arrendatário deve ser um número' })
  @Min(0, { message: 'Alocação de custo deve ser no mínimo 0' })
  @Max(100, { message: 'Alocação de custo deve ser no máximo 100' })
  tenantCostAllocation?: number;
}
