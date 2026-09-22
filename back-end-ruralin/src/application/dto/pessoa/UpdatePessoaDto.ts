/**
 * UpdatePessoaDto - DTO para atualização de pessoa
 * 
 * DTO usado no endpoint de atualização de pessoa.
 * Todos os campos são opcionais, permitindo atualizações parciais.
 * 
 * @example
 * ```typescript
 * // PUT /api/pessoas/:id
 * {
 *   "nomerazao_pessoa": "João Silva Atualizado",
 *   "email_pessoa": "joao.novo@example.com"
 * }
 * ```
 */

import {
  IsString,
  IsOptional,
  IsDateString,
  IsEmail,
  IsInt,
  Min,
  Max,
  IsBoolean,
  Matches,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsUnique } from '../../validators/IsUnique';

export class UpdatePessoaDto extends UpdateDto {
  /**
   * Nome (pessoa física) ou razão social (pessoa jurídica)
   */
  @IsString({ message: 'Nome/Razão Social deve ser uma string' })
  @IsOptional()
  nomerazao_pessoa?: string;

  /**
   * Nome fantasia (principalmente para pessoa jurídica)
   */
  @IsString({ message: 'Nome fantasia deve ser uma string' })
  @IsOptional()
  nomefantasia_pessoa?: string;

  /**
   * CPF (pessoa física) ou CNPJ (pessoa jurídica)
   * Deve ser único no sistema
   */
  @IsString({ message: 'CPF/CNPJ deve ser uma string' })
  @IsOptional()
  @Validate(IsUnique, ['Pessoa', 'cpfcnpj_pessoa'])
  cpfcnpj_pessoa?: string;

  /**
   * Data de nascimento (pessoa física) ou fundação (pessoa jurídica)
   */
  @IsDateString({}, { message: 'Data de nascimento deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  nascimento_pessoa?: string;

  /**
   * Nome do contato da pessoa
   */
  @IsString({ message: 'Contato deve ser uma string' })
  @IsOptional()
  contato_pessoa?: string;

  /**
   * Email de contato da pessoa
   */
  @IsEmail({}, { message: 'Email deve ser um email válido' })
  @IsOptional()
  email_pessoa?: string;

  /**
   * Número da identidade (RG)
   */
  @IsString({ message: 'Identidade deve ser uma string' })
  @IsOptional()
  identidade_pessoa?: string;

  /**
   * Órgão emissor da identidade
   */
  @IsString({ message: 'Órgão emissor deve ser uma string' })
  @IsOptional()
  orgaoidentidade_pessoa?: string;

  /**
   * Caixa postal
   */
  @IsString({ message: 'Caixa postal deve ser uma string' })
  @IsOptional()
  caixapostal_pessoa?: string;

  /**
   * CEP do endereço (formato: 00000-000)
   */
  @IsString({ message: 'CEP deve ser uma string' })
  @IsOptional()
  @Matches(/^[0-9]{5}-[0-9]{3}$/, {
    message: 'CEP deve estar no formato 00000-000',
  })
  cep_pessoa?: string;

  /**
   * Complemento do endereço
   */
  @IsString({ message: 'Complemento deve ser uma string' })
  @IsOptional()
  complemento_pessoa?: string;

  /**
   * Certidão negativa
   */
  @IsString({ message: 'Certidão negativa deve ser uma string' })
  @IsOptional()
  certidaonegativa_pessoa?: string;

  /**
   * Código de autorização
   */
  @IsString({ message: 'Código de autorização deve ser uma string' })
  @IsOptional()
  codigoautorizacao_pessoa?: string;

  /**
   * Indica se a pessoa é cliente
   */
  @IsBoolean({ message: 'Cliente deve ser um valor booleano' })
  @IsOptional()
  cliente_pessoa?: boolean;

  /**
   * Indica se a pessoa é produtor
   */
  @IsBoolean({ message: 'Produtor deve ser um valor booleano' })
  @IsOptional()
  produtor_pessoa?: boolean;

  /**
   * Indica se a pessoa é portador
   */
  @IsBoolean({ message: 'Portador deve ser um valor booleano' })
  @IsOptional()
  portador_pessoa?: boolean;

  /**
   * Indica se a pessoa é funcionário
   */
  @IsBoolean({ message: 'Funcionário deve ser um valor booleano' })
  @IsOptional()
  funcionario_pessoa?: boolean;

  /**
   * Indica se a pessoa é fornecedor
   */
  @IsBoolean({ message: 'Fornecedor deve ser um valor booleano' })
  @IsOptional()
  fornecedor_pessoa?: boolean;

  /**
   * Indica se a pessoa é motorista
   */
  @IsBoolean({ message: 'Motorista deve ser um valor booleano' })
  @IsOptional()
  motorista_pessoa?: boolean;

  /**
   * Indica se a pessoa é operador
   */
  @IsBoolean({ message: 'Operador deve ser um valor booleano' })
  @IsOptional()
  operador_pessoa?: boolean;

  /**
   * ID do município
   */
  @IsInt({ message: 'Município ID deve ser um número inteiro' })
  @Min(1, { message: 'Município ID deve ser maior que zero' })
  @IsOptional()
  idMunicipio?: number;

  /**
   * Tipo de pessoa: 1 = Pessoa Física (PF), 2 = Pessoa Jurídica (PJ)
   */
  @IsInt({ message: 'Tipo de pessoa deve ser um número inteiro' })
  @Min(1, { message: 'Tipo de pessoa deve ser 1 (PF) ou 2 (PJ)' })
  @Max(2, { message: 'Tipo de pessoa deve ser 1 (PF) ou 2 (PJ)' })
  @IsOptional()
  tipo_pessoa?: number;

  /**
   * Endereço completo da pessoa
   */
  @IsString({ message: 'Endereço deve ser uma string' })
  @IsOptional()
  endereco_pessoa?: string;

  /**
   * Bairro do endereço
   */
  @IsString({ message: 'Bairro deve ser uma string' })
  @IsOptional()
  bairro_pessoa?: string;

  /**
   * Número do endereço
   */
  @IsString({ message: 'Número deve ser uma string' })
  @IsOptional()
  numero_pessoa?: string;

  /**
   * Telefone principal de contato
   */
  @IsString({ message: 'Telefone deve ser uma string' })
  @IsOptional()
  telefone1_pessoa?: string;

  /**
   * Inscrição estadual (pessoa jurídica)
   */
  @IsString({ message: 'Inscrição estadual deve ser uma string' })
  @IsOptional()
  inscricaoEstadual_pessoa?: string;

  /**
   * Observações gerais sobre a pessoa
   */
  @IsString({ message: 'Observação deve ser uma string' })
  @IsOptional()
  observacao_pessoa?: string;

  /**
   * Inscrição municipal (pessoa jurídica)
   */
  @IsString({ message: 'Inscrição municipal deve ser uma string' })
  @IsOptional()
  inscricaoMunicipal_pessoa?: string;
}
