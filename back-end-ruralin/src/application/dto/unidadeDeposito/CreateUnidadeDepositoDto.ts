import {
  IsString,
  IsInt,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  Validate,
  MaxLength,
  Min,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { TipoUnidadeDeposito } from '../../../models/enums/UnidadeDepositoEnums';

/**
 * CreateUnidadeDepositoDto - DTO para criação de unidade de depósito
 */
export class CreateUnidadeDepositoDto extends CreateDto {
  /**
   * Descrição da unidade de depósito
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MaxLength(200, { message: 'Descrição deve ter no máximo 200 caracteres' })
  descricao!: string;

  /**
   * Tipo da unidade de depósito
   */
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  @IsValidEnum(TipoUnidadeDeposito, { message: 'Tipo deve ser Silo, Bag, Armazem ou Outros' })
  tipo!: TipoUnidadeDeposito;

  /**
   * Capacidade total da unidade de depósito
   */
  @IsNumber({}, { message: 'Capacidade total deve ser um número' })
  @IsNotEmpty({ message: 'Capacidade total é obrigatória' })
  @Min(0, { message: 'Capacidade total deve ser maior ou igual a zero' })
  capacidade_total!: number;

  /**
   * ID da unidade de medida
   */
  @IsInt({ message: 'ID da unidade de medida deve ser um número inteiro' })
  @Min(1, { message: 'ID da unidade de medida deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID da unidade de medida é obrigatório' })
  @Validate(IsExists, ['UnidadeMedida', 'id_unidade'])
  idUnidadeMedida!: number;

  /**
   * ID do produto armazenado
   */
  @IsInt({ message: 'ID do produto deve ser um número inteiro' })
  @Min(1, { message: 'ID do produto deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID do produto é obrigatório' })
  @Validate(IsExists, ['Produto', 'id_prod'])
  idProduto!: number;

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
