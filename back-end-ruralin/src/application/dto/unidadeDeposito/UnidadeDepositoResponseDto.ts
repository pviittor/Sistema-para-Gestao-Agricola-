import { TipoUnidadeDeposito } from '../../../models/enums/UnidadeDepositoEnums';

/**
 * UnidadeDepositoResponseDto - DTO para resposta de unidade de depósito
 */
export class UnidadeDepositoResponseDto {
  id!: number;
  tenantId!: number;
  descricao!: string;
  tipo!: TipoUnidadeDeposito;
  capacidade_total!: number;
  idUnidadeMedida!: number;
  idProduto!: number;
  saldo_inicial!: number;
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

  unidadeMedida?: {
    id_unidade: number;
    descricao_unidade: string;
    abreviatura_unidade?: string;
  };

  produto?: {
    id_prod: number;
    descricao_prod: string;
    idGrupo?: number;
    idSubGrupo?: number;
  };
}
