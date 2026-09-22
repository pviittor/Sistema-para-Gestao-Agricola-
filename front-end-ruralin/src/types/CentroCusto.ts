export interface CentroCusto {
  id?: number;
  tenantId?: number;
  codigo: string;
  nome: string;
  centroCustoPaiId?: number | null;
  ativo: boolean;
  usercreation?: number;
  datecreation?: string;
  
  // Helper fields for UI display/Nested objects
  centroCustoPai?: {
    id: number;
    codigo: string;
    nome: string;
  } | null;
  
  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;

  centrosCustoFilhos?: {
    id: number;
    codigo: string;
    nome: string;
  }[] | null;
}
