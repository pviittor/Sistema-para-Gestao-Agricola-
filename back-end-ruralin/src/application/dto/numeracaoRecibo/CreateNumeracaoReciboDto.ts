import { IsString, IsNotEmpty, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateNumeracaoReciboDto {
  @IsString({ message: 'Serie deve ser uma string' })
  @IsNotEmpty({ message: 'Serie e obrigatoria' })
  @MaxLength(5, { message: 'Serie deve ter no maximo 5 caracteres' })
  serie!: string;

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  ativo?: boolean;
}
