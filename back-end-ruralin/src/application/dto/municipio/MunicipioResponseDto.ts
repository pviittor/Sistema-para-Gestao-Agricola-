/**
 * DTO para resposta de Municipio
 */
export class MunicipioResponseDto {
  id!: number;
  nome!: string;
  idEstado!: number;
  codigoIBGE?: number | null;
  ativo!: boolean;
  usercreation!: number;
  datecreation!: Date;
  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
  estado?: {
    id: number;
    sigla: string;
    nome: string;
  } | null;
}
