export interface MaquinaVeiculo {
  id_mqn?: number
  tenantId?: number
  descricao: string
  chassi?: string | null
  placa?: string | null
  ano?: number | null
  modelo?: string | null
  serie?: string | null
  marca?: string | null

  // Classificação
  idGrupoEquipamento?: number | null
  tipoMarcador?: number | null
  combustivel?: number | null
  tipo?: number | null

  // Aquisição
  dataAquisicao?: string | null
  valorAquisicao?: number | null
  valorAtual?: number | null
  idFornecedor?: number | null
  notaFiscal?: string | null
  serieNotaFiscal?: string | null
  dataNotaFiscal?: string | null

  // Depreciação
  vidaUtil?: number | null
  percsucata?: number | null
  depreciacaoAnual?: number | null
  horaUtilAno?: number | null

  // Horímetros
  horimetroInicial?: number | null
  ultimoHorimetro?: number | null
  horimetroAbastecimento?: number | null
  horimetroManutencao?: number | null
  horimetroApontamento?: number | null

  // Custo
  custoFixo?: boolean | null
  valorCustoFixo?: number | null
  valorConsumoFixo?: number | null
  custoDepreciacao?: boolean | null
  valorHoraDepreciacao?: number | null
  custoManutencao?: boolean | null
  custoCombustivel?: boolean | null
  valorHora?: number | null

  // Combustível
  consumoEstimadoCombustivel?: number | null
  idCombustivelMaquina?: number | null

  // Fazenda / Operação
  idFazenda?: number | null
  idMotorista?: number | null
  consumoHA?: number | null
  custoHA?: number | null

  // Pesagem
  tara?: number | null
  utilizarTaraPesagem?: boolean | null

  // Seguro
  idSeguradora?: number | null
  inicioSeguro?: string | null
  fimSeguro?: string | null
  aplice?: string | null

  // Auditoria
  usercreation?: number
  datecreation?: string

  // Relacionamentos
  grupoEquipamento?: {
    id_grpequip: number
    descricao: string
  } | null
  fornecedor?: {
    id_pessoa: number
    nomerazao_pessoa: string | null
  } | null
  motorista?: {
    id_pessoa: number
    nomerazao_pessoa: string | null
  } | null
  seguradora?: {
    id_pessoa: number
    nomerazao_pessoa: string | null
  } | null
  fazenda?: {
    id: number
    descricao: string
  } | null
  usuarioCriador?: {
    id: number
    nome: string
    email: string
  } | null
}
