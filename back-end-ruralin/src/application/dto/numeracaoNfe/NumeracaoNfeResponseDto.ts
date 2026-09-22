/**
 * DTO de resposta para NumeracaoNfe
 */
export class NumeracaoNfeResponseDto {
  id!: number;
  tenantId!: number;
  serie!: string;
  modelo!: string;
  ultimo_numero!: number;
  ativo!: boolean;
  createdAt!: string;
  updatedAt!: string;
}
