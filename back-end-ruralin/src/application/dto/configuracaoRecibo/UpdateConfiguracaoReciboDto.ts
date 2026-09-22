import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateConfiguracaoReciboDto {
  @IsOptional()
  @IsString({ message: 'Nome da propriedade deve ser uma string' })
  @MinLength(2, { message: 'Nome da propriedade deve ter pelo menos 2 caracteres' })
  @MaxLength(255, { message: 'Nome da propriedade deve ter no maximo 255 caracteres' })
  nomePropriedade?: string;

  @IsOptional()
  @IsString({ message: 'CNPJ/CPF deve ser uma string' })
  @MaxLength(18, { message: 'CNPJ/CPF deve ter no maximo 18 caracteres' })
  cnpjCpf?: string;

  @IsOptional()
  @IsString({ message: 'Inscricao estadual deve ser uma string' })
  @MaxLength(20, { message: 'Inscricao estadual deve ter no maximo 20 caracteres' })
  inscricaoEstadual?: string;

  @IsOptional()
  @IsString({ message: 'Endereco deve ser uma string' })
  @MaxLength(500, { message: 'Endereco deve ter no maximo 500 caracteres' })
  endereco?: string;

  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  @MaxLength(20, { message: 'Telefone deve ter no maximo 20 caracteres' })
  telefone?: string;

  @IsOptional()
  @IsString({ message: 'Logo deve ser uma string' })
  logoBase64?: string;

  @IsOptional()
  @IsString({ message: 'Observacao padrao deve ser uma string' })
  observacaoPadrao?: string;

  @IsOptional()
  @IsString({ message: 'Local padrao deve ser uma string' })
  @MaxLength(255, { message: 'Local padrao deve ter no maximo 255 caracteres' })
  localPadrao?: string;
}
