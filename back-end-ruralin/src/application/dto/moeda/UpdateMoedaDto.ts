import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';

/**
 * UpdateMoedaDto - DTO para atualização de moeda
 */
export class UpdateMoedaDto extends UpdateDto {
  @IsString({ message: 'Descrição deve ser uma string' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  @IsOptional()
  descricao_moeda?: string;

  @IsString({ message: 'Símbolo deve ser uma string' })
  @MinLength(1, { message: 'Símbolo deve ter no mínimo 1 caractere' })
  @MaxLength(10, { message: 'Símbolo deve ter no máximo 10 caracteres' })
  @IsOptional()
  simbolo_moeda?: string;

  @IsString({ message: 'Código de integração deve ser uma string' })
  @MinLength(1, { message: 'Código de integração deve ter no mínimo 1 caractere' })
  @MaxLength(50, { message: 'Código de integração deve ter no máximo 50 caracteres' })
  @IsOptional()
  codigoIntegracaoBancoCentral?: string;

  @IsString({ message: 'Sigla BC deve ser uma string' })
  @MinLength(1, { message: 'Sigla BC deve ter no mínimo 1 caractere' })
  @MaxLength(10, { message: 'Sigla BC deve ter no máximo 10 caracteres' })
  @IsOptional()
  siglabc_moeda?: string;
}
