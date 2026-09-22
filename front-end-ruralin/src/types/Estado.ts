export interface Estado {
  id: number;
  sigla: string;
  nome: string;
  codigoIBGE?: number | null;
  ativo: boolean;
  usercreation: number;
  datecreation: string | Date;
}
