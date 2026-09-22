// Enums
export type AgreementType = 'LOAN' | 'RENT_LEASE' | 'NON_CROP_REVENUE'
export type TermUnit = 'YEAR' | 'MONTH'
export type LoanType =
  | 'FIXED_RATE_MORTGAGE'
  | 'EQUITY_LINE'
  | 'LAND_CONTRACT'
  | 'LINE_OF_CREDIT'
  | 'OPERATING'
  | 'FSA_DIRECT'
  | 'FSA_GUARANTEED'
  | 'OTHER'
export type RevenueSource =
  | 'HUNTING'
  | 'MINING'
  | 'OIL'
  | 'WIND'
  | 'EASEMENT'
  | 'CONSERVATION'
  | 'OTHER'
export type LeaseTermType = 'BASE_RENT' | 'CROP_SHARE' | 'YIELD_ADJUSTMENT' | 'EXPENSE_SHARE'
export type ExpenseCategory = 'ALL' | 'INPUTS' | 'FERTILIZER'
export type PaymentPeriod = 'MONTH' | 'YEAR'
export type AmountRate = 'TOTAL' | 'PER_ACRE'

// Label maps
export const AGREEMENT_TYPE_LABELS: Record<AgreementType, string> = {
  LOAN: 'Empréstimo',
  RENT_LEASE: 'Arrendamento',
  NON_CROP_REVENUE: 'Receita Não-Agrícola',
}

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  FIXED_RATE_MORTGAGE: 'Hipoteca Taxa Fixa',
  EQUITY_LINE: 'Linha de Crédito Patrimonial',
  LAND_CONTRACT: 'Contrato de Terra',
  LINE_OF_CREDIT: 'Linha de Crédito',
  OPERATING: 'Operacional',
  FSA_DIRECT: 'FSA Direto',
  FSA_GUARANTEED: 'FSA Garantido',
  OTHER: 'Outro',
}

export const REVENUE_SOURCE_LABELS: Record<RevenueSource, string> = {
  HUNTING: 'Caça',
  MINING: 'Mineração',
  OIL: 'Petróleo',
  WIND: 'Eólica',
  EASEMENT: 'Servidão',
  CONSERVATION: 'Conservação',
  OTHER: 'Outro',
}

export const LEASE_TERM_TYPE_LABELS: Record<LeaseTermType, string> = {
  BASE_RENT: 'Aluguel Base',
  CROP_SHARE: 'Participação na Safra',
  YIELD_ADJUSTMENT: 'Ajuste de Rendimento',
  EXPENSE_SHARE: 'Participação nas Despesas',
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  ALL: 'Todas',
  INPUTS: 'Insumos',
  FERTILIZER: 'Fertilizantes',
}

export const PAYMENT_PERIOD_LABELS: Record<PaymentPeriod, string> = {
  MONTH: 'Mês',
  YEAR: 'Ano',
}

export const AMOUNT_RATE_LABELS: Record<AmountRate, string> = {
  TOTAL: 'Total',
  PER_ACRE: 'Por Hectare',
}

export const TERM_UNIT_LABELS: Record<TermUnit, string> = {
  YEAR: 'Ano',
  MONTH: 'Mês',
}

// Color maps
export const AGREEMENT_TYPE_COLORS: Record<AgreementType, string> = {
  LOAN: 'bg-blue-100 text-blue-700',
  RENT_LEASE: 'bg-amber-100 text-amber-700',
  NON_CROP_REVENUE: 'bg-green-100 text-green-700',
}

// Child interfaces
export interface AgreementLeaseTerm {
  id?: number
  agreementId?: number
  termType: LeaseTermType
  expenseCategory?: ExpenseCategory | null
  tenantCostAllocation?: number | null
}

export interface AgreementPaymentSchedule {
  id?: number
  agreementId?: number
  paymentInterval: number
  paymentPeriod: PaymentPeriod
  paymentDay: number
  amount: number
  amountRate: AmountRate
  startDate: string
  endDate?: string | null
}

export interface AgreementField {
  agreementId?: number
  fieldId: number
  talhao?: {
    id_talhao: number
    descricao: string
    area?: number
  }
}

// Main entity
export interface Agreement {
  id?: number
  tenantId?: number
  fazendaId: number
  agreementType: AgreementType
  notes?: string | null
  ativo?: boolean

  // LOAN + NON_CROP_REVENUE
  startDate?: string | null
  termLength?: number | null
  termUnit?: TermUnit | null

  // LOAN
  lenderName?: string | null
  loanType?: LoanType | null
  originalBalance?: number | null
  interestRate?: number | null

  // RENT_LEASE
  startYear?: number | null
  endYear?: number | null
  idArrendador?: number | null

  // NON_CROP_REVENUE
  revenueSource?: RevenueSource | null

  usercreation?: number
  datecreation?: string

  // Relacionamentos
  fazenda?: {
    id: number
    descricao: string
  }
  arrendador?: {
    id_pessoa: number
    nomerazao_pessoa: string | null
  }
  usuarioCriador?: {
    id: number
    nome: string
  }

  // Children
  leaseTerms?: AgreementLeaseTerm[]
  paymentSchedules?: AgreementPaymentSchedule[]
  agreementFields?: AgreementField[]
}

// DTOs
export interface CreateAgreementCompletoDto {
  fazendaId: number
  agreementType: AgreementType
  notes?: string | null
  ativo?: boolean

  startDate?: string | null
  termLength?: number | null
  termUnit?: TermUnit | null

  lenderName?: string | null
  loanType?: LoanType | null
  originalBalance?: number | null
  interestRate?: number | null

  startYear?: number | null
  endYear?: number | null
  idArrendador?: number | null

  revenueSource?: RevenueSource | null

  fieldIds: number[]
  paymentSchedules?: Omit<AgreementPaymentSchedule, 'id' | 'agreementId'>[]
  leaseTerms?: Omit<AgreementLeaseTerm, 'id' | 'agreementId'>[]
}

export interface UpdateAgreementCompletoDto {
  fazendaId?: number
  agreementType?: AgreementType
  notes?: string | null
  ativo?: boolean

  startDate?: string | null
  termLength?: number | null
  termUnit?: TermUnit | null

  lenderName?: string | null
  loanType?: LoanType | null
  originalBalance?: number | null
  interestRate?: number | null

  startYear?: number | null
  endYear?: number | null
  idArrendador?: number | null

  revenueSource?: RevenueSource | null

  fieldIds?: number[]
  paymentSchedules?: Omit<AgreementPaymentSchedule, 'id' | 'agreementId'>[]
  leaseTerms?: Omit<AgreementLeaseTerm, 'id' | 'agreementId'>[]
}
