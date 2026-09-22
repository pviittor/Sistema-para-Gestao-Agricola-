import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { CreateDto } from '../CreateDto';

/**
 * CreateMoedaDto - DTO para criação de moeda
 */
export class CreateMoedaDto extends CreateDto {
  /**
   * Descrição da moeda
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  descricao_moeda!: string;

  /**
   * Símbolo da moeda (ex: R$, $, €)
   */
  @IsString({ message: 'Símbolo deve ser uma string' })
  @IsOptional()
  @MinLength(1, { message: 'Símbolo deve ter no mínimo 1 caractere' })
  @MaxLength(10, { message: 'Símbolo deve ter no máximo 10 caracteres' })
  simbolo_moeda?: string;

  /**
   * Código de integração com Banco Central
   */
  @IsString({ message: 'Código de integração deve ser uma string' })
  @IsOptional()
  @MinLength(1, { message: 'Código de integração deve ter no mínimo 1 caractere' })
  @MaxLength(50, { message: 'Código de integração deve ter no máximo 50 caracteres' })
  codigoIntegracaoBancoCentral?: string;

  /**
   * Sigla da moeda no Banco Central
   */
  @IsString({ message: 'Sigla BC deve ser uma string' })
  @IsOptional()
  @MinLength(1, { message: 'Sigla BC deve ter no mínimo 1 caractere' })
  @MaxLength(10, { message: 'Sigla BC deve ter no máximo 10 caracteres' })
  siglabc_moeda?: string;
}
