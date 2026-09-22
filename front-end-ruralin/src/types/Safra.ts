export enum StatusSafra {
  PLANEJADA = 'PLANEJADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
}

export interface Safra {
  id?: number;
  tenantId?: number;
  culturaId: number;
  nome: string;
  dataInicio: string; // Using string for date input compatibility
  dataFim?: string | null;
  status: StatusSafra;
  usercreation?: number;
  datecreation?: Date;
}
