/**
 * ApontamentoServicoResponseDto - DTO para resposta de apontamento de servico
 */
export class ApontamentoServicoResponseDto {
  id_aptsrv!: number;
  tenantId!: number;
  idApontamento!: number;
  idServico!: number;
  idResponsavel!: number;
  idMoeda?: number | null;
  idPagar?: number | null;
  data!: string;
  valor!: number;
  tempo!: number;
  observacao?: string | null;
  quantidadeTon!: number;
  unitarioTon!: number;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  apontamento?: {
    id_apt: number;
  } | null;

  servico?: {
    id: number;
    descricao: string;
  } | null;

  responsavel?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
  } | null;

  moeda?: {
    id: number;
    descricao: string;
  } | null;

  tituloPagar?: {
    id: number;
  } | null;

  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}
