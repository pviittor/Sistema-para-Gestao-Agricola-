import {
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  Min,
  Validate,
  IsNotEmpty,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateAbastecimentoDto - DTO para criacao de abastecimento
 */
export class CreateAbastecimentoDto extends CreateDto {
  /**
   * Data do abastecimento
   */
  @IsDateString({}, { message: 'Data deve ser uma data valida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data e obrigatoria' })
  data!: string;

  /**
   * ID da maquina abastecida
   */
  @IsInt({ message: 'ID da maquina deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID da maquina e obrigatorio' })
  @Min(1, { message: 'ID da maquina deve ser maior que zero' })
  @Validate(IsExists, ['Maquina', 'id_mqn'], { message: 'Maquina nao encontrada' })
  idMaquina!: number;

  /**
   * Km/horimetro inicio
   */
  @IsNumber({}, { message: 'Km inicio deve ser um numero' })
  @IsNotEmpty({ message: 'Km inicio e obrigatorio' })
  @Min(0, { message: 'Km inicio deve ser maior ou igual a zero' })
  kminicio!: number;

  /**
   * Km/horimetro fim
   */
  @IsNumber({}, { message: 'Km fim deve ser um numero' })
  @IsNotEmpty({ message: 'Km fim e obrigatorio' })
  @Min(0, { message: 'Km fim deve ser maior ou igual a zero' })
  kmfim!: number;

  /**
   * ID do operador da maquina (pessoa)
   */
  @IsOptional()
  @IsInt({ message: 'ID do operador deve ser um numero inteiro' })
  @Min(1, { message: 'ID do operador deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Operador nao encontrado' })
  idOperador?: number;

  /**
   * ID do combustivel usado (produto)
   */
  @IsInt({ message: 'ID do combustivel deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID do combustivel e obrigatorio' })
  @Min(1, { message: 'ID do combustivel deve ser maior que zero' })
  @Validate(IsExists, ['Produto', 'id_prod'], { message: 'Combustivel nao encontrado' })
  idCombustivel!: number;

  /**
   * Volume abastecido (litros)
   */
  @IsNumber({}, { message: 'Volume deve ser um numero' })
  @IsNotEmpty({ message: 'Volume e obrigatorio' })
  @Min(0, { message: 'Volume deve ser maior ou igual a zero' })
  volume!: number;

  /**
   * Preco por litro
   */
  @IsNumber({}, { message: 'Preco deve ser um numero' })
  @IsNotEmpty({ message: 'Preco e obrigatorio' })
  @Min(0, { message: 'Preco deve ser maior ou igual a zero' })
  preco!: number;

  /**
   * Total (volume x preco) - calculado automaticamente se nao informado
   */
  @IsOptional()
  @IsNumber({}, { message: 'Total deve ser um numero' })
  @Min(0, { message: 'Total deve ser maior ou igual a zero' })
  total?: number;

  /**
   * ID da fazenda
   */
  @IsInt({ message: 'ID da fazenda deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID da fazenda e obrigatorio' })
  @Min(1, { message: 'ID da fazenda deve ser maior que zero' })
  @Validate(IsExists, ['Fazenda', 'id'], { message: 'Fazenda nao encontrada' })
  idFazenda!: number;

  /**
   * ID do ciclo/safra de abastecimento
   */
  @IsOptional()
  @IsInt({ message: 'ID do ciclo de abastecimento deve ser um numero inteiro' })
  @Min(1, { message: 'ID do ciclo de abastecimento deve ser maior que zero' })
  @Validate(IsExists, ['Safra', 'id'], { message: 'Ciclo/Safra nao encontrado' })
  idCicloAbastecimento?: number;

  /**
   * ID do operador do abastecimento (pessoa)
   */
  @IsOptional()
  @IsInt({ message: 'ID do operador de abastecimento deve ser um numero inteiro' })
  @Min(1, { message: 'ID do operador de abastecimento deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Operador de abastecimento nao encontrado' })
  idOperadorAbastecimento?: number;
}
