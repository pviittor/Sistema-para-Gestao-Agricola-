/**
 * ApontamentoMaquinasResponseDto - DTO para resposta de apontamento de maquina
 */
export class ApontamentoMaquinasResponseDto {
  id_aptmaq!: number;
  tenantId!: number;
  idApontamento!: number;
  idMaquina!: number;
  idImplemento?: number | null;
  idOperador?: number | null;
  idAbastecimento?: number | null;
  data!: string;
  horaInicio!: number;
  horaFim!: number;
  horaTotal!: number;
  valorHora!: number;
  valorHoraImpl!: number;
  vazao!: number;
  haBomba!: number;
  velocidade!: number;
  pulv!: number;
  consumoEstimado!: number;
  estimativaCombustivelUtilizado!: number;
  informouAbastecimento!: boolean;
  consumoHRMaquina!: number;
  consumoHRImplemento!: number;
  consumoHAMaquina!: number;
  consumoHAImplemento!: number;
  custoHAMaquina!: number;
  custoHAImplemento!: number;
  custoHRMaquina!: number;
  custoHRImplemento!: number;
  areaTrabalhada!: number;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  apontamento?: {
    id_apt: number;
  } | null;

  maquina?: {
    id_mqn: number;
    descricao: string;
  } | null;

  implemento?: {
    id_mqn: number;
    descricao: string;
  } | null;

  operador?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
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
