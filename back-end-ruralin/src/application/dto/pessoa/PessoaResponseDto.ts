/**
 * PessoaResponseDto - DTO para resposta de pessoa
 * 
 * DTO usado para tipar respostas de endpoints de pessoa.
 * 
 * @example
 * ```typescript
 * // GET /api/pessoas/:id
 * {
 *   "id_pessoa": 1,
 *   "tenantId": 1,
 *   "nomerazao_pessoa": "João Silva",
 *   "cpfcnpj_pessoa": "12345678901",
 *   "tipo_pessoa": 1,
 *   "cliente_pessoa": true,
 *   "datecreation": "2025-01-15T10:00:00.000Z"
 * }
 * ```
 */

/**
 * Informações básicas da pessoa (sem relacionamentos)
 */
export interface PessoaResponseDto {
  /**
   * ID único da pessoa
   */
  id_pessoa: number;

  /**
   * ID do tenant ao qual a pessoa pertence
   */
  tenantId: number;

  /**
   * Nome (pessoa física) ou razão social (pessoa jurídica)
   */
  nomerazao_pessoa?: string | null;

  /**
   * Nome fantasia (principalmente para pessoa jurídica)
   */
  nomefantasia_pessoa?: string | null;

  /**
   * CPF (pessoa física) ou CNPJ (pessoa jurídica)
   */
  cpfcnpj_pessoa?: string | null;

  /**
   * Data de nascimento (pessoa física) ou fundação (pessoa jurídica)
   */
  nascimento_pessoa?: Date | null;

  /**
   * Nome do contato da pessoa
   */
  contato_pessoa?: string | null;

  /**
   * Email de contato da pessoa
   */
  email_pessoa?: string | null;

  /**
   * Número da identidade (RG)
   */
  identidade_pessoa?: string | null;

  /**
   * Órgão emissor da identidade
   */
  orgaoidentidade_pessoa?: string | null;

  /**
   * Caixa postal
   */
  caixapostal_pessoa?: string | null;

  /**
   * CEP do endereço
   */
  cep_pessoa?: string | null;

  /**
   * Complemento do endereço
   */
  complemento_pessoa?: string | null;

  /**
   * Certidão negativa
   */
  certidaonegativa_pessoa?: string | null;

  /**
   * Código de autorização
   */
  codigoautorizacao_pessoa?: string | null;

  /**
   * Indica se a pessoa é cliente
   */
  cliente_pessoa: boolean;

  /**
   * Indica se a pessoa é produtor
   */
  produtor_pessoa: boolean;

  /**
   * Indica se a pessoa é portador
   */
  portador_pessoa: boolean;

  /**
   * Indica se a pessoa é funcionário
   */
  funcionario_pessoa: boolean;

  /**
   * Indica se a pessoa é fornecedor
   */
  fornecedor_pessoa: boolean;

  /**
   * Indica se a pessoa é motorista
   */
  motorista_pessoa: boolean;

  /**
   * Indica se a pessoa é operador
   */
  operador_pessoa: boolean;

  /**
   * ID do usuário que criou o registro
   */
  usercreation: number;

  /**
   * Data de criação do registro
   */
  datecreation: Date;

  /**
   * ID do município
   */
  idMunicipio?: number | null;

  /**
   * Tipo de pessoa: 1 = Pessoa Física (PF), 2 = Pessoa Jurídica (PJ)
   */
  tipo_pessoa: number;

  /**
   * Endereço completo da pessoa
   */
  endereco_pessoa?: string | null;

  /**
   * Bairro do endereço
   */
  bairro_pessoa?: string | null;

  /**
   * Número do endereço
   */
  numero_pessoa?: string | null;

  /**
   * Telefone principal de contato
   */
  telefone1_pessoa?: string | null;

  /**
   * Inscrição estadual (pessoa jurídica)
   */
  inscricaoEstadual_pessoa?: string | null;

  /**
   * Observações gerais sobre a pessoa
   */
  observacao_pessoa?: string | null;

  /**
   * Inscrição municipal (pessoa jurídica)
   */
  inscricaoMunicipal_pessoa?: string | null;
}

/**
 * Resposta completa de pessoa (com relacionamentos)
 */
export interface PessoaDetailResponseDto extends PessoaResponseDto {
  /**
   * Usuário que criou a pessoa
   */
  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
    [key: string]: any;
  };
}
