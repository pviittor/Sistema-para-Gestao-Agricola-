/**
 * DTO para resposta de Estado
 */
export class EstadoResponseDto {
  id!: number;
  sigla!: string;
  nome!: string;
  codigoIBGE?: number | null;
  ativo!: boolean;
  usercreation!: number;
  datecreation!: Date;
  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
  municipios?: any[] | null;
}
