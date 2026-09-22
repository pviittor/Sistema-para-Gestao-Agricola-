import { IsString, IsOptional } from 'class-validator';

export class ReciboFiltrosDto {
  @IsOptional()
  @IsString({ message: 'Status deve ser uma string' })
  status?: string;

  @IsOptional()
  @IsString({ message: 'Data inicio deve ser uma string' })
  dataInicio?: string;

  @IsOptional()
  @IsString({ message: 'Data fim deve ser uma string' })
  dataFim?: string;

  @IsOptional()
  @IsString({ message: 'Beneficiario deve ser uma string' })
  beneficiario?: string;
}
