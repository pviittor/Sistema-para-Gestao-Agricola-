import { IsString, IsNotEmpty, MaxLength, IsIn } from 'class-validator';

/**
 * DTO para criação de NumeracaoNfe
 */
export class CreateNumeracaoNfeDto {
  @IsString({ message: 'Série deve ser uma string' })
  @IsNotEmpty({ message: 'Série é obrigatória' })
  @MaxLength(5, { message: 'Série deve ter no máximo 5 caracteres' })
  serie!: string;

  @IsString({ message: 'Modelo deve ser uma string' })
  @IsNotEmpty({ message: 'Modelo é obrigatório' })
  @IsIn(['55', '65'], { message: 'Modelo deve ser 55 (NF-e) ou 65 (NFC-e)' })
  modelo!: string;
}
