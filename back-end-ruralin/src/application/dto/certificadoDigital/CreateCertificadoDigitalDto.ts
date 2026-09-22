import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsIn,
  MinLength,
  MaxLength,
} from 'class-validator';
import { CreateDto } from '../CreateDto';

/**
 * CreateCertificadoDigitalDto - DTO para criação de certificado digital
 *
 * @example
 * ```typescript
 * // POST /api/certificados-digitais
 * {
 *   "nome": "Certificado A1 - Fazenda",
 *   "razao_social": "Fazenda Boa Vista LTDA",
 *   "cnpj_cpf": "12.345.678/0001-90",
 *   "arquivo_path": "/uploads/certificados/1/cert.pfx",
 *   "senha": "minhaSenha123",
 *   "data_validade": "2027-03-10",
 *   "status": "ativo",
 *   "ambiente": "producao",
 *   "uf": "SP",
 *   "padrao": true,
 *   "ativo": true
 * }
 * ```
 */
export class CreateCertificadoDigitalDto extends CreateDto {
  /**
   * Nome identificador do certificado
   */
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  nome!: string;

  /**
   * Razão social vinculada ao certificado
   */
  @IsString({ message: 'Razão social deve ser uma string' })
  @IsNotEmpty({ message: 'Razão social é obrigatória' })
  @MaxLength(255, { message: 'Razão social deve ter no máximo 255 caracteres' })
  razao_social!: string;

  /**
   * CNPJ ou CPF vinculado ao certificado
   */
  @IsString({ message: 'CNPJ/CPF deve ser uma string' })
  @IsNotEmpty({ message: 'CNPJ/CPF é obrigatório' })
  @MaxLength(18, { message: 'CNPJ/CPF deve ter no máximo 18 caracteres' })
  cnpj_cpf!: string;

  /**
   * Caminho do arquivo .pfx/.p12
   */
  @IsString({ message: 'Caminho do arquivo deve ser uma string' })
  @IsNotEmpty({ message: 'Caminho do arquivo é obrigatório' })
  @MaxLength(500, { message: 'Caminho do arquivo deve ter no máximo 500 caracteres' })
  arquivo_path!: string;

  /**
   * Senha do certificado digital
   */
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MaxLength(255, { message: 'Senha deve ter no máximo 255 caracteres' })
  senha!: string;

  /**
   * Data de validade do certificado (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data de validade deve ser uma data válida no formato YYYY-MM-DD' })
  data_validade!: string;

  /**
   * Status do certificado: ativo, expirado ou revogado
   */
  @IsOptional()
  @IsIn(['ativo', 'expirado', 'revogado'], { message: 'Status deve ser ativo, expirado ou revogado' })
  status?: string;

  /**
   * Ambiente do certificado: homologacao ou producao
   */
  @IsOptional()
  @IsIn(['homologacao', 'producao'], { message: 'Ambiente deve ser homologacao ou producao' })
  ambiente?: string;

  /**
   * UF (estado) vinculado ao certificado
   */
  @IsString({ message: 'UF deve ser uma string' })
  @IsNotEmpty({ message: 'UF é obrigatória' })
  @MinLength(2, { message: 'UF deve ter exatamente 2 caracteres' })
  @MaxLength(2, { message: 'UF deve ter exatamente 2 caracteres' })
  uf!: string;

  /**
   * Indica se é o certificado padrão do tenant
   */
  @IsOptional()
  @IsBoolean({ message: 'Padrão deve ser um booleano' })
  padrao?: boolean;

  /**
   * Indica se o certificado está ativo
   */
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  ativo?: boolean;
}
