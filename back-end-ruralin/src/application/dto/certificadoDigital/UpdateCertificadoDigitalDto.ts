import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsIn,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';

/**
 * UpdateCertificadoDigitalDto - DTO para atualização de certificado digital
 *
 * Todos os campos são opcionais, permitindo atualizações parciais.
 *
 * @example
 * ```typescript
 * // PUT /api/certificados-digitais/:id
 * {
 *   "nome": "Certificado A1 - Atualizado",
 *   "padrao": true
 * }
 * ```
 */
export class UpdateCertificadoDigitalDto extends UpdateDto {
  /**
   * Nome identificador do certificado
   */
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  nome?: string;

  /**
   * Razão social vinculada ao certificado
   */
  @IsOptional()
  @IsString({ message: 'Razão social deve ser uma string' })
  @MaxLength(255, { message: 'Razão social deve ter no máximo 255 caracteres' })
  razao_social?: string;

  /**
   * CNPJ ou CPF vinculado ao certificado
   */
  @IsOptional()
  @IsString({ message: 'CNPJ/CPF deve ser uma string' })
  @MaxLength(18, { message: 'CNPJ/CPF deve ter no máximo 18 caracteres' })
  cnpj_cpf?: string;

  /**
   * Caminho do arquivo .pfx/.p12
   */
  @IsOptional()
  @IsString({ message: 'Caminho do arquivo deve ser uma string' })
  @MaxLength(500, { message: 'Caminho do arquivo deve ter no máximo 500 caracteres' })
  arquivo_path?: string;

  /**
   * Senha do certificado digital
   */
  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @MaxLength(255, { message: 'Senha deve ter no máximo 255 caracteres' })
  senha?: string;

  /**
   * Data de validade do certificado (formato: YYYY-MM-DD)
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de validade deve ser uma data válida no formato YYYY-MM-DD' })
  data_validade?: string;

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
  @IsOptional()
  @IsString({ message: 'UF deve ser uma string' })
  @MinLength(2, { message: 'UF deve ter exatamente 2 caracteres' })
  @MaxLength(2, { message: 'UF deve ter exatamente 2 caracteres' })
  uf?: string;

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
