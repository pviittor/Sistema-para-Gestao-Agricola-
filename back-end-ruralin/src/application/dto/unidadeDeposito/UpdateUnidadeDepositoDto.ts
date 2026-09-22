import {
  IsString,
  IsInt,
  IsNumber,
  IsBoolean,
  IsOptional,
  Validate,
  MaxLength,
  Min,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { TipoUnidadeDeposito } from '../../../models/enums/UnidadeDepositoEnums';

/**
 * UpdateUnidadeDepositoDto - DTO para atualização de unidade de depósito
 */
export class UpdateUnidadeDepositoDto extends UpdateDto {
  /**
   * Descrição da unidade de depósito
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @MaxLength(200, { message: 'Descrição deve ter no máximo 200 caracteres' })
  @IsOptional()
  descricao?: string;

  /**
   * Tipo da unidade de depósito
   */
  @IsValidEnum(TipoUnidadeDeposito, { message: 'Tipo deve ser Silo, Bag, Armazem ou Outros' })
  @IsOptional()
  tipo?: TipoUnidadeDeposito;

  /**
   * Capacidade total da unidade de depósito
   */
  @IsNumber({}, { message: 'Capacidade total deve ser um número' })
  @Min(0, { message: 'Capacidade total deve ser maior ou igual a zero' })
  @IsOptional()
  capacidade_total?: number;

  /**
   * ID da unidade de medida
   */
  @IsInt({ message: 'ID da unidade de medida deve ser um número inteiro' })
  @Min(1, { message: 'ID da unidade de medida deve ser maior que zero' })
  @Validate(IsExists, ['UnidadeMedida', 'id_unidade'])
  @IsOptional()
  idUnidadeMedida?: number;

  /**
   * ID do produto armazenado
   */
  @IsInt({ message: 'ID do produto deve ser um número inteiro' })
  @Min(1, { message: 'ID do produto deve ser maior que zero' })
  @Validate(IsExists, ['Produto', 'id_prod'])
  @IsOptional()
  idProduto?: number;

  /**
   * Saldo inicial da unidade de depósito
   */
  @IsNumber({}, { message: 'Saldo inicial deve ser um número' })
  @Min(0, { message: 'Saldo inicial deve ser maior ou igual a zero' })
  @IsOptional()
  saldo_inicial?: number;

  /**
   * Indica se a unidade de depósito está ativa
   */
  @IsBoolean({ message: 'Ativo deve ser um valor booleano' })
  @IsOptional()
  ativo?: boolean;
}
