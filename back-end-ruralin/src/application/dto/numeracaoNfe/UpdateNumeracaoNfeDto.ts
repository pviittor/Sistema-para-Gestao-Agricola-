import { IsString, IsOptional, MaxLength, IsIn, IsBoolean } from 'class-validator';

/**
 * DTO para atualização de NumeracaoNfe
 */
export class UpdateNumeracaoNfeDto {
  @IsOptional()
  @IsString({ message: 'Série deve ser uma string' })
  @MaxLength(5, { message: 'Série deve ter no máximo 5 caracteres' })
  serie?: string;

  @IsOptional()
  @IsString({ message: 'Modelo deve ser uma string' })
  @IsIn(['55', '65'], { message: 'Modelo deve ser 55 (NF-e) ou 65 (NFC-e)' })
  modelo?: string;

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser boolean' })
  ativo?: boolean;
}
