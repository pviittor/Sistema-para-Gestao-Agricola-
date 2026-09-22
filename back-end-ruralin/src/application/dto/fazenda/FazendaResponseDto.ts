/**
 * DTO para resposta de Fazenda
 */
export class FazendaResponseDto {
  id!: number;
  tenantId!: number;
  idPessoa!: number;
  descricao!: string;
  endereco?: string | null;
  complemento?: string | null;
  idMunicipio!: number;
  inscricaoEstadual?: string | null;
  areaTotal!: number;
  areaCultivada!: number;
  reservaLegal!: number;
  telefone?: string | null;
  gerente?: string | null;
  matricula?: string | null;
  livro?: string | null;
  folha?: string | null;
  itr?: string | null;
  cei?: string | null;
  lcdprTipoExploracao?: number | null;
  lcdprParticipacao!: number;
  arrendada!: boolean;
  idPessoaArrendamento?: number | null;
  documento?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  observacoes?: string | null;
  movimentaLCDPR!: boolean;
  movimentaGado!: boolean;
  usercreation!: number;
  datecreation!: Date;
  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
  pessoa?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
    cpfcnpj_pessoa: string | null;
  } | null;
  municipio?: {
    id: number;
    nome: string;
    idEstado: number;
  } | null;
  pessoaArrendamento?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
    cpfcnpj_pessoa: string | null;
  } | null;
}
