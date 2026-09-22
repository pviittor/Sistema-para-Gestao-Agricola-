import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsString,
  IsBoolean,
  IsDateString,
  IsArray,
  ArrayMinSize,
  Min,
  Max,
  MaxLength,
  Validate,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { IsRequiredIf } from '../../validators/IsRequiredIf';
import { IsExists } from '../../validators/IsExists';
import {
  AgreementType,
  TermUnit,
  LoanType,
  PaymentMethod,
  CurrencyUnit,
  RevenueSource,
} from '../../../models/enums/AgreementEnums';

export class CreateAgreementDto extends CreateDto {
  @IsNotEmpty({ message: 'ID da fazenda é obrigatório' })
  @IsInt({ message: 'ID da fazenda deve ser um número inteiro' })
  @Min(1, { message: 'ID da fazenda deve ser maior que zero' })
  @Validate(IsExists, ['Fazenda', 'id'], { message: 'Fazenda não encontrada' })
  fazendaId!: number;

  @IsNotEmpty({ message: 'Tipo do acordo é obrigatório' })
  @IsValidEnum(AgreementType, { message: 'Tipo do acordo deve ser LOAN, RENT_LEASE ou NON_CROP_REVENUE' })
  agreementType!: AgreementType;

  @IsOptional()
  @IsString({ message: 'Observações deve ser uma string' })
  notes?: string;

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um valor booleano' })
  ativo?: boolean;

  // === LOAN + NON_CROP_REVENUE shared fields ===
  @IsRequiredIf('agreementType', 'LOAN', { message: 'Data de início é obrigatória para LOAN' })
  @IsRequiredIf('agreementType', 'NON_CROP_REVENUE', { message: 'Data de início é obrigatória para NON_CROP_REVENUE' })
  @IsOptional()
  @IsDateString({}, { message: 'Data de início deve ser uma data válida no formato YYYY-MM-DD' })
  startDate?: string;

  @IsRequiredIf('agreementType', 'LOAN', { message: 'Duração do termo é obrigatória para LOAN' })
  @IsRequiredIf('agreementType', 'NON_CROP_REVENUE', { message: 'Duração do termo é obrigatória para NON_CROP_REVENUE' })
  @IsOptional()
  @IsInt({ message: 'Duração do termo deve ser um número inteiro' })
  @Min(1, { message: 'Duração do termo deve ser no mínimo 1' })
  termLength?: number;

  @IsRequiredIf('agreementType', 'LOAN', { message: 'Unidade do termo é obrigatória para LOAN' })
  @IsRequiredIf('agreementType', 'NON_CROP_REVENUE', { message: 'Unidade do termo é obrigatória para NON_CROP_REVENUE' })
  @IsOptional()
  @IsValidEnum(TermUnit, { message: 'Unidade do termo deve ser YEAR ou MONTH' })
  termUnit?: TermUnit;

  // === LOAN-only fields ===
  @IsRequiredIf('agreementType', 'LOAN', { message: 'Nome do credor é obrigatório para LOAN' })
  @IsOptional()
  @IsString({ message: 'Nome do credor deve ser uma string' })
  @MaxLength(255, { message: 'Nome do credor deve ter no máximo 255 caracteres' })
  lenderName?: string;

  @IsRequiredIf('agreementType', 'LOAN', { message: 'Tipo de empréstimo é obrigatório para LOAN' })
  @IsOptional()
  @IsValidEnum(LoanType, { message: 'Tipo de empréstimo inválido. Valores aceitos: CUSTEIO, INVESTIMENTO, COMERCIALIZACAO, CAPITAL_GIRO, FINANCIAMENTO_RURAL, CPR, CREDITO_FUNDIARIO, OTHER' })
  loanType?: LoanType;

  @IsOptional()
  @IsValidEnum(PaymentMethod, { message: 'Método de pagamento inválido. Valores aceitos: PRICE, SAC, SACRE' })
  paymentMethod?: PaymentMethod;

  @IsRequiredIf('agreementType', 'LOAN', { message: 'Saldo original é obrigatório para LOAN' })
  @IsOptional()
  @IsNumber({}, { message: 'Saldo original deve ser um número' })
  @Min(0, { message: 'Saldo original deve ser no mínimo 0' })
  originalBalance?: number;

  @IsRequiredIf('agreementType', 'LOAN', { message: 'Taxa de juros é obrigatória para LOAN' })
  @IsOptional()
  @IsNumber({}, { message: 'Taxa de juros deve ser um número' })
  @Min(0, { message: 'Taxa de juros deve ser no mínimo 0' })
  @Max(100, { message: 'Taxa de juros deve ser no máximo 100' })
  interestRate?: number;

  // === RENT_LEASE-only fields ===
  @IsRequiredIf('agreementType', 'RENT_LEASE', { message: 'Ano de início é obrigatório para RENT_LEASE' })
  @IsOptional()
  @IsInt({ message: 'Ano de início deve ser um número inteiro' })
  @Min(1900, { message: 'Ano de início deve ser no mínimo 1900' })
  startYear?: number;

  @IsRequiredIf('agreementType', 'RENT_LEASE', { message: 'Ano de fim é obrigatório para RENT_LEASE' })
  @IsOptional()
  @IsInt({ message: 'Ano de fim deve ser um número inteiro' })
  @Min(1900, { message: 'Ano de fim deve ser no mínimo 1900' })
  endYear?: number;

  @IsRequiredIf('agreementType', 'RENT_LEASE', { message: 'Arrendador é obrigatório para RENT_LEASE' })
  @IsOptional()
  @IsInt({ message: 'ID do arrendador deve ser um número inteiro' })
  @Min(1, { message: 'ID do arrendador deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Arrendador não encontrado' })
  idArrendador?: number;

  @IsOptional()
  @IsValidEnum(CurrencyUnit, { message: 'Unidade monetária inválida. Valores aceitos: BRL, SACA_SOJA, SACA_MILHO, SACA_CAFE, ARROBA_BOI' })
  currencyUnit?: CurrencyUnit;

  @IsOptional()
  @IsNumber({}, { message: 'Valor da cotação deve ser um número' })
  @Min(0, { message: 'Valor da cotação deve ser no mínimo 0' })
  cotacaoValor?: number;

  // === NON_CROP_REVENUE-only fields ===
  @IsRequiredIf('agreementType', 'NON_CROP_REVENUE', { message: 'Fonte de receita é obrigatória para NON_CROP_REVENUE' })
  @IsOptional()
  @IsValidEnum(RevenueSource, { message: 'Fonte de receita inválida. Valores aceitos: ARRENDAMENTO_PASTO, ENERGIA_SOLAR, ENERGIA_EOLICA, MINERACAO, TURISMO_RURAL, APICULTURA, PISCICULTURA, SERVIDAO, OTHER' })
  revenueSource?: RevenueSource;

  // === Always required: field IDs ===
  @IsNotEmpty({ message: 'IDs dos talhões são obrigatórios' })
  @IsArray({ message: 'IDs dos talhões deve ser um array' })
  @ArrayMinSize(1, { message: 'Deve haver pelo menos um talhão' })
  @IsInt({ each: true, message: 'Cada ID de talhão deve ser um número inteiro' })
  fieldIds!: number[];
}
