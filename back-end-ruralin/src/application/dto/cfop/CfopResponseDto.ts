export class CfopResponseDto {
  id!: number;
  codigo!: string;
  descricao!: string;
  natureza!: string;
  tipo_operacao!: string;
  gera_financeiro!: boolean;
  movimenta_estoque!: boolean;
  aplicacao_ipi!: boolean;
  aplicacao_icms!: boolean;
  aplicacao_pis_cofins!: boolean;
  ativo!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
