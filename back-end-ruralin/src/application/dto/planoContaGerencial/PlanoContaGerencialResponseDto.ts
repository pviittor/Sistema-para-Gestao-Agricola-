/**
 * PlanoContaGerencialResponseDto - DTO para resposta de conta do plano de contas gerencial
 */
export class PlanoContaGerencialResponseDto {
  id!: number;
  tenantId!: number;
  item!: string;
  descricao!: string;
  tipo!: 'SINTETICA' | 'ANALITICA';
  tipoFluxo!: 'RECEITA' | 'DESPESA';
  classificacao?: string | null;
  contaPaiId?: number | null;
  nivel!: number;
  ativo!: boolean;
  usercreation!: number;
  datecreation!: Date;

  /**
   * Relacionamentos opcionais (quando incluídos na query)
   */
  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  };

  contaPai?: {
    id: number;
    item: string;
    descricao: string;
    tipo: 'SINTETICA' | 'ANALITICA';
    tipoFluxo: 'RECEITA' | 'DESPESA';
    nivel: number;
  };

  contasFilhas?: PlanoContaGerencialResponseDto[];
}
