/**
 * ServicoBenfeitoriaResponseDto - DTO para resposta de servico de benfeitoria
 */
export class ServicoBenfeitoriaResponseDto {
  id_srvbenf!: number;
  tenantId!: number;
  idBenfeitoria!: number;
  idServico!: number;
  idResponsavel!: number;
  idMoeda?: number | null;
  idPagar?: number | null;
  data!: string;
  valor!: number;
  tempo!: number;
  observacao?: string | null;
  idSafra?: number | null;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  benfeitoria?: {
    id_benf: number;
    descricao: string;
  } | null;

  servico?: {
    id_srv: number;
    descricao_srv: string;
  } | null;

  responsavel?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
  } | null;

  moeda?: {
    id_moeda: number;
    descricao: string;
  } | null;

  tituloPagar?: {
    id: number;
  } | null;

  safra?: {
    id: number;
    descricao: string;
  } | null;

  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}
