import {
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  Min,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateAbastecimentoDto - DTO para atualizacao de abastecimento
 *
 * Todos os campos sao opcionais, permitindo atualizacoes parciais.
 */
export class UpdateAbastecimentoDto extends UpdateDto {
  /**
   * Data do abastecimento
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data deve ser uma data valida no formato YYYY-MM-DD' })
  data?: string;

  /**
   * ID da maquina abastecida
   */
  @IsOptional()
  @IsInt({ message: 'ID da maquina deve ser um numero inteiro' })
  @Min(1, { message: 'ID da maquina deve ser maior que zero' })
  @Validate(IsExists, ['Maquina', 'id_mqn'], { message: 'Maquina nao encontrada' })
  idMaquina?: number;

  /**
   * Km/horimetro inicio
   */
  @IsOptional()
  @IsNumber({}, { message: 'Km inicio deve ser um numero' })
  @Min(0, { message: 'Km inicio deve ser maior ou igual a zero' })
  kminicio?: number;

  /**
   * Km/horimetro fim
   */
  @IsOptional()
  @IsNumber({}, { message: 'Km fim deve ser um numero' })
  @Min(0, { message: 'Km fim deve ser maior ou igual a zero' })
  kmfim?: number;

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
  @IsOptional()
  @IsInt({ message: 'ID do combustivel deve ser um numero inteiro' })
  @Min(1, { message: 'ID do combustivel deve ser maior que zero' })
  @Validate(IsExists, ['Produto', 'id_prod'], { message: 'Combustivel nao encontrado' })
  idCombustivel?: number;

  /**
   * Volume abastecido (litros)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Volume deve ser um numero' })
  @Min(0, { message: 'Volume deve ser maior ou igual a zero' })
  volume?: number;

  /**
   * Preco por litro
   */
  @IsOptional()
  @IsNumber({}, { message: 'Preco deve ser um numero' })
  @Min(0, { message: 'Preco deve ser maior ou igual a zero' })
  preco?: number;

  /**
   * Total (volume x preco)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Total deve ser um numero' })
  @Min(0, { message: 'Total deve ser maior ou igual a zero' })
  total?: number;

  /**
   * ID da fazenda
   */
  @IsOptional()
  @IsInt({ message: 'ID da fazenda deve ser um numero inteiro' })
  @Min(1, { message: 'ID da fazenda deve ser maior que zero' })
  @Validate(IsExists, ['Fazenda', 'id'], { message: 'Fazenda nao encontrada' })
  idFazenda?: number;

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
