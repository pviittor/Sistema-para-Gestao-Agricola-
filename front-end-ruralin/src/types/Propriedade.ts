import type { Municipio } from './Municipio';
import type { ParceiroNegocio } from './ParceiroNegocio';
import type { Usuario } from './Usuario';

export interface Propriedade {
  id?: number;
  tenantId?: number;
  idPessoa: number;
  descricao: string;
  endereco?: string | null;
  complemento?: string | null;
  idMunicipio: number;
  inscricaoEstadual?: string | null;
  areaTotal: number;
  areaCultivada: number;
  reservaLegal: number;
  telefone?: string | null;
  gerente?: string | null;
  matricula?: string | null;
  livro?: string | null;
  folha?: string | null;
  itr?: string | null;
  cei?: string | null;
  lcdprTipoExploracao?: number | null;
  lcdprParticipacao: number;
  arrendada: boolean;
  idPessoaArrendamento?: number | null;
  documento?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  observacoes?: string | null;
  movimentaLCDPR: boolean;
  movimentaGado: boolean;
  usercreation?: number;
  datecreation?: string;

  // Relacionamentos
  pessoa?: ParceiroNegocio;
  municipio?: Municipio;
  pessoaArrendamento?: ParceiroNegocio;
  usuarioCriador?: Usuario;
}
