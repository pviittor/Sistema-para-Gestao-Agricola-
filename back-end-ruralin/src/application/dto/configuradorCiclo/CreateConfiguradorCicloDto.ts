import {
  IsOptional,
  IsInt,
  IsNumber,
  IsString,
  IsDateString,
  Min,
  Validate,
  IsNotEmpty,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateConfiguradorCicloDto - DTO para criação de configurador de ciclo
 */
export class CreateConfiguradorCicloDto extends CreateDto {
  /**
   * ID do talhão
   */
  @IsInt({ message: 'ID do talhao deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID do talhao e obrigatorio' })
  @Min(1, { message: 'ID do talhao deve ser maior que zero' })
  @Validate(IsExists, ['Talhao', 'id_talhao'], { message: 'Talhao nao encontrado' })
  idTalhao!: number;

  /**
   * ID do ciclo/safra
   */
  @IsInt({ message: 'ID do ciclo deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID do ciclo e obrigatorio' })
  @Min(1, { message: 'ID do ciclo deve ser maior que zero' })
  @Validate(IsExists, ['Safra', 'id'], { message: 'Ciclo/Safra nao encontrado' })
  idCiclo!: number;

  /**
   * ID da cultura
   */
  @IsInt({ message: 'ID da cultura deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID da cultura e obrigatorio' })
  @Min(1, { message: 'ID da cultura deve ser maior que zero' })
  @Validate(IsExists, ['Cultura', 'id'], { message: 'Cultura nao encontrada' })
  idCultura!: number;

  /**
   * ID da variedade do ciclo (produto)
   */
  @IsOptional()
  @IsInt({ message: 'ID da variedade deve ser um numero inteiro' })
  @Min(1, { message: 'ID da variedade deve ser maior que zero' })
  @Validate(IsExists, ['Produto', 'id_prod'], { message: 'Variedade (produto) nao encontrada' })
  idVariedadeCiclo?: number;

  /**
   * Data de início do plantio
   */
  @IsOptional()
  @IsDateString({}, { message: 'Inicio do plantio deve ser uma data valida no formato YYYY-MM-DD' })
  inicioPlantio?: string;

  /**
   * Data de fim do plantio
   */
  @IsOptional()
  @IsDateString({}, { message: 'Fim do plantio deve ser uma data valida no formato YYYY-MM-DD' })
  fimPlantio?: string;

  /**
   * Previsão de colheita
   */
  @IsOptional()
  @IsDateString({}, { message: 'Previsao de colheita deve ser uma data valida no formato YYYY-MM-DD' })
  previsaoColheita?: string;

  /**
   * Data de início da colheita
   */
  @IsOptional()
  @IsDateString({}, { message: 'Inicio da colheita deve ser uma data valida no formato YYYY-MM-DD' })
  inicioColheita?: string;

  /**
   * Data de fim da colheita
   */
  @IsOptional()
  @IsDateString({}, { message: 'Fim da colheita deve ser uma data valida no formato YYYY-MM-DD' })
  fimColheita?: string;

  /**
   * Observações gerais
   */
  @IsOptional()
  @IsString({ message: 'Observacao deve ser uma string' })
  observacao?: string;

  /**
   * Área plantada
   */
  @IsOptional()
  @IsNumber({}, { message: 'Area plantada deve ser um numero' })
  @Min(0, { message: 'Area plantada deve ser maior ou igual a zero' })
  areaPlantada?: number;

  /**
   * Estimativa de produção
   */
  @IsOptional()
  @IsNumber({}, { message: 'Estimativa de producao deve ser um numero' })
  @Min(0, { message: 'Estimativa de producao deve ser maior ou igual a zero' })
  estimativaProducao?: number;
}
