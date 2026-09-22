/**
 * MovimentoEstoqueResponseDto - DTO para resposta de movimento de estoque
 */
export class MovimentoEstoqueResponseDto {
  id_mov!: number;
  tenantId!: number;
  idProduto!: number;
  idProdutor?: number | null;
  idFazenda!: number;
  idAbastecimento?: number | null;
  tipomov!: number;
  operacao!: number;
  quantidade!: number;
  data!: string;
  valor!: number;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  produto?: {
    id_prod: number;
    descricao_prod: string;
  } | null;

  produtor?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
  } | null;

  fazenda?: {
    id: number;
    descricao: string;
  } | null;

  abastecimento?: {
    id_abast: number;
    data: string;
  } | null;

  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}
