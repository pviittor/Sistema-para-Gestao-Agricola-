import type { Estado } from './Estado';

export interface Municipio {
  id: number;
  nome: string;
  idEstado: number;
  codigoIBGE?: number | null;
  ativo: boolean;
  usercreation: number;
  datecreation: string | Date;
  estado?: Estado;
}
