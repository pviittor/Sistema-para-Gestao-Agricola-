import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsInt,
  IsArray,
  MaxLength,
  Min,
  Validate,
} from 'class-validator';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { TipoCampoCondicional } from '../../../models/enums/OrdemServicoEnums';

/**
 * CampoCondicionalSemIdDto - DTO para campo condicional sem tipoAtividadeOSId
 *
 * Usado no CreateTipoAtividadeOSCompletoDto onde o tipoAtividadeOSId será
 * preenchido automaticamente pelo service após criação do tipo de atividade.
 */
export class CampoCondicionalSemIdDto {
  /**
   * Nome interno do campo (identificador programático)
   */
  @IsNotEmpty({ message: 'Nome do campo é obrigatório' })
  @IsString({ message: 'Nome do campo deve ser uma string' })
  @MaxLength(100, { message: 'Nome do campo deve ter no máximo 100 caracteres' })
  nomeCampo!: string;

  /**
   * Rótulo de exibição do campo
   */
  @IsNotEmpty({ message: 'Rótulo é obrigatório' })
  @IsString({ message: 'Rótulo deve ser uma string' })
  @MaxLength(150, { message: 'Rótulo deve ter no máximo 150 caracteres' })
  rotulo!: string;

  /**
   * Tipo do campo condicional
   */
  @IsNotEmpty({ message: 'Tipo do campo é obrigatório' })
  @Validate(IsValidEnum, [TipoCampoCondicional], { message: 'Tipo de campo inválido. Use: TEXT, NUMBER, DATE, BOOLEAN ou SELECT' })
  tipoCampo!: TipoCampoCondicional;

  /**
   * Indica se o campo é obrigatório
   */
  @IsOptional()
  @IsBoolean({ message: 'Obrigatório deve ser um valor booleano' })
  obrigatorio?: boolean = false;

  /**
   * Opções para campos do tipo SELECT
   */
  @IsOptional()
  @IsArray({ message: 'Opções deve ser um array' })
  opcoes?: any[];

  /**
   * Unidade de medida para campos numéricos
   */
  @IsOptional()
  @IsString({ message: 'Unidade deve ser uma string' })
  @MaxLength(20, { message: 'Unidade deve ter no máximo 20 caracteres' })
  unidade?: string;

  /**
   * Ordem de exibição do campo
   */
  @IsNotEmpty({ message: 'Ordem é obrigatória' })
  @IsInt({ message: 'Ordem deve ser um número inteiro' })
  @Min(0, { message: 'Ordem deve ser maior ou igual a zero' })
  ordem!: number;

  /**
   * Indica se o campo está ativo
   */
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um valor booleano' })
  ativo?: boolean = true;
}
