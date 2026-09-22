export interface AgreementLeaseTermResponseDto {
  id: number;
  termType: string;
  expenseCategory?: string | null;
  tenantCostAllocation?: number | null;
}

export interface AgreementPaymentScheduleResponseDto {
  id: number;
  paymentInterval: number;
  paymentPeriod: string;
  paymentDay: number;
  amount: number;
  amountRate: string;
  startDate: string;
  endDate?: string | null;
  status?: string | null;
  dataLiquidacao?: string | null;
}

export interface AgreementFieldResponseDto {
  agreementId: number;
  fieldId: number;
  talhao?: {
    id_talhao: number;
    descricao: string;
    area: number;
  };
}

export interface AgreementResponseDto {
  id: number;
  tenantId: number;
  fazendaId: number;
  agreementType: string;
  notes?: string | null;
  ativo: boolean;

  // LOAN + NON_CROP_REVENUE
  startDate?: string | null;
  termLength?: number | null;
  termUnit?: string | null;

  // LOAN
  lenderName?: string | null;
  loanType?: string | null;
  paymentMethod?: string | null;
  originalBalance?: number | null;
  interestRate?: number | null;

  // RENT_LEASE
  startYear?: number | null;
  endYear?: number | null;
  idArrendador?: number | null;
  currencyUnit?: string | null;
  cotacaoValor?: number | null;

  // NON_CROP_REVENUE
  revenueSource?: string | null;

  usercreation: number;
  datecreation: Date;

  // Relations
  fazenda?: {
    id: number;
    descricao: string;
  };
  arrendador?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
  };
  usuarioCriador?: {
    id: number;
    nome: string;
  };

  // Children
  leaseTerms?: AgreementLeaseTermResponseDto[];
  paymentSchedules?: AgreementPaymentScheduleResponseDto[];
  agreementFields?: AgreementFieldResponseDto[];
}
