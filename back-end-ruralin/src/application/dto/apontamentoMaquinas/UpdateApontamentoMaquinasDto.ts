import {
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  IsBoolean,
  Min,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateApontamentoMaquinasDto - DTO para atualizacao de apontamento de maquina
 *
 * Todos os campos sao opcionais, permitindo atualizacoes parciais.
 */
export class UpdateApontamentoMaquinasDto extends UpdateDto {
  /**
   * ID do apontamento
   */
  @IsOptional()
  @IsInt({ message: 'ID do apontamento deve ser um numero inteiro' })
  @Min(1, { message: 'ID do apontamento deve ser maior que zero' })
  @Validate(IsExists, ['Apontamento', 'id_apt'], { message: 'Apontamento nao encontrado' })
  idApontamento?: number;

  /**
   * ID da maquina
   */
  @IsOptional()
  @IsInt({ message: 'ID da maquina deve ser um numero inteiro' })
  @Min(1, { message: 'ID da maquina deve ser maior que zero' })
  @Validate(IsExists, ['Maquina', 'id_mqn'], { message: 'Maquina nao encontrada' })
  idMaquina?: number;

  /**
   * ID do implemento (maquina)
   */
  @IsOptional()
  @IsInt({ message: 'ID do implemento deve ser um numero inteiro' })
  @Min(1, { message: 'ID do implemento deve ser maior que zero' })
  @Validate(IsExists, ['Maquina', 'id_mqn'], { message: 'Implemento nao encontrado' })
  idImplemento?: number;

  /**
   * ID do operador (pessoa)
   */
  @IsOptional()
  @IsInt({ message: 'ID do operador deve ser um numero inteiro' })
  @Min(1, { message: 'ID do operador deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Operador nao encontrado' })
  idOperador?: number;

  /**
   * ID do abastecimento
   */
  @IsOptional()
  @IsInt({ message: 'ID do abastecimento deve ser um numero inteiro' })
  @Min(1, { message: 'ID do abastecimento deve ser maior que zero' })
  @Validate(IsExists, ['Abastecimento', 'id_abast'], { message: 'Abastecimento nao encontrado' })
  idAbastecimento?: number;

  /**
   * Data do apontamento de maquina
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data deve ser uma data valida no formato YYYY-MM-DD' })
  data?: string;

  /**
   * Hora de inicio
   */
  @IsOptional()
  @IsNumber({}, { message: 'Hora inicio deve ser um numero' })
  @Min(0, { message: 'Hora inicio deve ser maior ou igual a zero' })
  horaInicio?: number;

  /**
   * Hora de fim
   */
  @IsOptional()
  @IsNumber({}, { message: 'Hora fim deve ser um numero' })
  @Min(0, { message: 'Hora fim deve ser maior ou igual a zero' })
  horaFim?: number;

  /**
   * Hora total
   */
  @IsOptional()
  @IsNumber({}, { message: 'Hora total deve ser um numero' })
  @Min(0, { message: 'Hora total deve ser maior ou igual a zero' })
  horaTotal?: number;

  /**
   * Valor por hora da maquina
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor hora deve ser um numero' })
  @Min(0, { message: 'Valor hora deve ser maior ou igual a zero' })
  valorHora?: number;

  /**
   * Valor por hora do implemento
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor hora implemento deve ser um numero' })
  @Min(0, { message: 'Valor hora implemento deve ser maior ou igual a zero' })
  valorHoraImpl?: number;

  /**
   * Vazao
   */
  @IsOptional()
  @IsNumber({}, { message: 'Vazao deve ser um numero' })
  @Min(0, { message: 'Vazao deve ser maior ou igual a zero' })
  vazao?: number;

  /**
   * Hectares por bomba
   */
  @IsOptional()
  @IsNumber({}, { message: 'HA bomba deve ser um numero' })
  @Min(0, { message: 'HA bomba deve ser maior ou igual a zero' })
  haBomba?: number;

  /**
   * Velocidade
   */
  @IsOptional()
  @IsNumber({}, { message: 'Velocidade deve ser um numero' })
  @Min(0, { message: 'Velocidade deve ser maior ou igual a zero' })
  velocidade?: number;

  /**
   * Pulverizacao
   */
  @IsOptional()
  @IsNumber({}, { message: 'Pulverizacao deve ser um numero' })
  @Min(0, { message: 'Pulverizacao deve ser maior ou igual a zero' })
  pulv?: number;

  /**
   * Consumo estimado
   */
  @IsOptional()
  @IsNumber({}, { message: 'Consumo estimado deve ser um numero' })
  @Min(0, { message: 'Consumo estimado deve ser maior ou igual a zero' })
  consumoEstimado?: number;

  /**
   * Estimativa de combustivel utilizado
   */
  @IsOptional()
  @IsNumber({}, { message: 'Estimativa combustivel deve ser um numero' })
  @Min(0, { message: 'Estimativa combustivel deve ser maior ou igual a zero' })
  estimativaCombustivelUtilizado?: number;

  /**
   * Indica se informou abastecimento
   */
  @IsOptional()
  @IsBoolean({ message: 'Informou abastecimento deve ser verdadeiro ou falso' })
  informouAbastecimento?: boolean;

  /**
   * Consumo HR da maquina
   */
  @IsOptional()
  @IsNumber({}, { message: 'Consumo HR maquina deve ser um numero' })
  @Min(0, { message: 'Consumo HR maquina deve ser maior ou igual a zero' })
  consumoHRMaquina?: number;

  /**
   * Consumo HR do implemento
   */
  @IsOptional()
  @IsNumber({}, { message: 'Consumo HR implemento deve ser um numero' })
  @Min(0, { message: 'Consumo HR implemento deve ser maior ou igual a zero' })
  consumoHRImplemento?: number;

  /**
   * Consumo HA da maquina
   */
  @IsOptional()
  @IsNumber({}, { message: 'Consumo HA maquina deve ser um numero' })
  @Min(0, { message: 'Consumo HA maquina deve ser maior ou igual a zero' })
  consumoHAMaquina?: number;

  /**
   * Consumo HA do implemento
   */
  @IsOptional()
  @IsNumber({}, { message: 'Consumo HA implemento deve ser um numero' })
  @Min(0, { message: 'Consumo HA implemento deve ser maior ou igual a zero' })
  consumoHAImplemento?: number;

  /**
   * Custo HA da maquina
   */
  @IsOptional()
  @IsNumber({}, { message: 'Custo HA maquina deve ser um numero' })
  @Min(0, { message: 'Custo HA maquina deve ser maior ou igual a zero' })
  custoHAMaquina?: number;

  /**
   * Custo HA do implemento
   */
  @IsOptional()
  @IsNumber({}, { message: 'Custo HA implemento deve ser um numero' })
  @Min(0, { message: 'Custo HA implemento deve ser maior ou igual a zero' })
  custoHAImplemento?: number;

  /**
   * Custo HR da maquina
   */
  @IsOptional()
  @IsNumber({}, { message: 'Custo HR maquina deve ser um numero' })
  @Min(0, { message: 'Custo HR maquina deve ser maior ou igual a zero' })
  custoHRMaquina?: number;

  /**
   * Custo HR do implemento
   */
  @IsOptional()
  @IsNumber({}, { message: 'Custo HR implemento deve ser um numero' })
  @Min(0, { message: 'Custo HR implemento deve ser maior ou igual a zero' })
  custoHRImplemento?: number;

  /**
   * Area trabalhada
   */
  @IsOptional()
  @IsNumber({}, { message: 'Area trabalhada deve ser um numero' })
  @Min(0, { message: 'Area trabalhada deve ser maior ou igual a zero' })
  areaTrabalhada?: number;
}
