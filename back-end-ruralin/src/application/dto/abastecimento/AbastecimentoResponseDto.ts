/**
 * AbastecimentoResponseDto - DTO para resposta de abastecimento
 */
export class AbastecimentoResponseDto {
  id_abast!: number;
  tenantId!: number;
  data!: string;
  idMaquina!: number;
  kminicio!: number;
  kmfim!: number;
  idOperador?: number | null;
  idCombustivel!: number;
  volume!: number;
  preco!: number;
  total!: number;
  idFazenda!: number;
  idCicloAbastecimento?: number | null;
  idOperadorAbastecimento?: number | null;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  maquina?: {
    id_mqn: number;
    descricao: string;
  } | null;

  operador?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
  } | null;

  combustivel?: {
    id_prod: number;
    descricao_prod: string;
  } | null;

  fazenda?: {
    id: number;
    descricao: string;
  } | null;

  cicloAbastecimento?: {
    id: number;
    descricao: string;
  } | null;

  operadorAbastecimento?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
  } | null;

  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}
