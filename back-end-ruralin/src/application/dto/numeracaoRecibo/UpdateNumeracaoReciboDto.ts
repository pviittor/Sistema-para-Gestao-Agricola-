import { IsString, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class UpdateNumeracaoReciboDto {
  @IsOptional()
  @IsString({ message: 'Serie deve ser uma string' })
  @MaxLength(5, { message: 'Serie deve ter no maximo 5 caracteres' })
  serie?: string;

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  ativo?: boolean;
}
