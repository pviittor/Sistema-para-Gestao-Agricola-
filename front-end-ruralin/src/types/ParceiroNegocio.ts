export interface ParceiroNegocio {
  id_pessoa?: number
  tenantId?: number
  nomerazao_pessoa?: string
  nomefantasia_pessoa?: string
  cpfcnpj_pessoa?: string
  nascimento_pessoa?: string
  contato_pessoa?: string
  email_pessoa?: string
  identidade_pessoa?: string
  orgaoidentidade_pessoa?: string
  caixapostal_pessoa?: string
  cep_pessoa?: string
  complemento_pessoa?: string
  certidaonegativa_pessoa?: string
  codigoautorizacao_pessoa?: string
  cliente_pessoa: boolean
  produtor_pessoa: boolean
  portador_pessoa: boolean
  funcionario_pessoa: boolean
  fornecedor_pessoa: boolean
  motorista_pessoa: boolean
  operador_pessoa: boolean
  usercreation?: number
  datecreation?: string
  idMunicipio?: number
  tipo_pessoa: number // 1 = PF, 2 = PJ
  endereco_pessoa?: string
  bairro_pessoa?: string
  numero_pessoa?: string
  telefone1_pessoa?: string
  inscricaoEstadual_pessoa?: string
  observacao_pessoa?: string
  inscricaoMunicipal_pessoa?: string
}
