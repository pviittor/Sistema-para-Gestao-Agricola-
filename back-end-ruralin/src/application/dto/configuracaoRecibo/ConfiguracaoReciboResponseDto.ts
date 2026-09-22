export class ConfiguracaoReciboResponseDto {
  id!: number;
  tenantId!: number;
  nomePropriedade!: string;
  cnpjCpf?: string | null;
  inscricaoEstadual?: string | null;
  endereco?: string | null;
  telefone?: string | null;
  logoBase64?: string | null;
  observacaoPadrao?: string | null;
  localPadrao?: string | null;
  ativo!: boolean;
  createdAt!: string;
  updatedAt!: string;
}
