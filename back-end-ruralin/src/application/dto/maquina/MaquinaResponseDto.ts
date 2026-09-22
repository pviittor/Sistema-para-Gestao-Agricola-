/**
 * MaquinaResponseDto - DTO para resposta de maquina
 */
export class MaquinaResponseDto {
  // ===== Identificacao =====
  id_mqn!: number;
  tenantId!: number;
  descricao!: string;
  chassi?: string | null;
  placa?: string | null;
  ano?: number | null;
  modelo?: string | null;
  serie?: string | null;
  marca?: string | null;

  // ===== Classificacao =====
  idGrupoEquipamento?: number | null;
  tipoMarcador?: number | null;
  combustivel?: number | null;
  tipo?: number | null;

  // ===== Aquisicao =====
  dataAquisicao?: string | null;
  valorAquisicao?: number | null;
  valorAtual?: number | null;
  idFornecedor?: number | null;
  notaFiscal?: string | null;
  serieNotaFiscal?: string | null;
  dataNotaFiscal?: string | null;

  // ===== Depreciacao =====
  vidaUtil?: number | null;
  percsucata?: number | null;
  depreciacaoAnual?: number | null;
  horaUtilAno?: number | null;

  // ===== Horimetros =====
  horimetroInicial?: number | null;
  ultimoHorimetro?: number | null;
  horimetroAbastecimento?: number | null;
  horimetroManutencao?: number | null;
  horimetroApontamento?: number | null;

  // ===== Custo =====
  custoFixo?: boolean | null;
  valorCustoFixo?: number | null;
  valorConsumoFixo?: number | null;
  custoDepreciacao?: boolean | null;
  valorHoraDepreciacao?: number | null;
  custoManutencao?: boolean | null;
  custoCombustivel?: boolean | null;
  valorHora?: number | null;

  // ===== Combustivel =====
  consumoEstimadoCombustivel?: number | null;
  idCombustivelMaquina?: number | null;

  // ===== Fazenda/Operacao =====
  idFazenda?: number | null;
  idMotorista?: number | null;
  consumoHA?: number | null;
  custoHA?: number | null;

  // ===== Pesagem =====
  tara?: number | null;
  utilizarTaraPesagem?: boolean | null;

  // ===== Seguro =====
  idSeguradora?: number | null;
  inicioSeguro?: string | null;
  fimSeguro?: string | null;
  aplice?: string | null;

  // ===== Auditoria =====
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  grupoEquipamento?: {
    id_grpequip: number;
    descricao: string;
  } | null;

  fornecedor?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
    cpfcnpj_pessoa: string | null;
  } | null;

  motorista?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
    cpfcnpj_pessoa: string | null;
  } | null;

  seguradora?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
    cpfcnpj_pessoa: string | null;
  } | null;

  combustivelProduto?: {
    id_prod: number;
    descricao_prod: string;
  } | null;

  fazenda?: {
    id: number;
    descricao: string;
  } | null;

  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}
