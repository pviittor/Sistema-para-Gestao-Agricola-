/**
 * TalhaoResponseDto - DTO para resposta de talhão
 */
export class TalhaoResponseDto {
  id_talhao!: number;
  tenantId!: number;
  descricao!: string;
  idFazenda!: number;
  area!: number;
  geometry?: object | null;
  grupo?: string | null;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  fazenda?: {
    id: number;
    descricao: string;
  } | null;

  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;

  culturas?: Array<{
    id: number;
    descricao: string;
    areaPlantada?: number;
  }>;
}
