/**
 * Interface para o serviço de relatório de aging
 */

export interface AgingFiltrosDto {
  tipo: 'PAGAR' | 'RECEBER' | 'AMBOS';
  idFazenda?: number;
  idSafra?: number;
  idFornecedorCliente?: number;
  idPlanoContaGerencial?: number;
  dataBase?: string;
}

export interface ParcelaAgingDto {
  idParcela: number;
  idTitulo: number;
  tipo: 'PAGAR' | 'RECEBER';
  numeroParcela: number;
  numeroTotalParcelas: number;
  dataVencimento: string;
  valorTotal: number;
  valorSaldo: number;
  diasAtraso: number;
  fornecedorCliente?: string;
  numeroTitulo?: string;
  fazenda?: string;
}

export interface AgingFaixa {
  label: string;
  diasMin: number | null;
  diasMax: number | null;
  count: number;
  valorTotal: number;
  valorSaldo: number;
  parcelas: ParcelaAgingDto[];
}

export interface AgingReportResponseDto {
  tipo: 'PAGAR' | 'RECEBER' | 'AMBOS';
  dataReferencia: string;
  faixas: AgingFaixa[];
  totalGeral: { count: number; valorTotal: number; valorSaldo: number };
}

export interface IAgingReportService {
  gerarAging(tenantId: number, filtros: AgingFiltrosDto): Promise<AgingReportResponseDto>;
}
