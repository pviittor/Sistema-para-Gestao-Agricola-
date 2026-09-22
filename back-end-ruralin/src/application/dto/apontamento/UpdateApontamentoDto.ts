import {
  IsOptional,
  IsInt,
  IsDateString,
  Validate,
  Min,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateApontamentoDto - DTO para atualizacao de apontamento
 *
 * Todos os campos sao opcionais, permitindo atualizacoes parciais.
 */
export class UpdateApontamentoDto extends UpdateDto {
  /**
   * ID da configuracao do ciclo
   */
  @IsOptional()
  @IsInt({ message: 'ID da configuracao deve ser um numero inteiro' })
  @Min(1, { message: 'ID da configuracao deve ser maior que zero' })
  @Validate(IsExists, ['ConfiguradorCiclo', 'id_cfg'], { message: 'Configuracao do ciclo nao encontrada' })
  idConfiguracao?: number;

  /**
   * ID da atividade agricola
   */
  @IsOptional()
  @IsInt({ message: 'ID da atividade deve ser um numero inteiro' })
  @Min(1, { message: 'ID da atividade deve ser maior que zero' })
  @Validate(IsExists, ['AtividadeAgricola', 'id_atv'], { message: 'Atividade agricola nao encontrada' })
  idAtividade?: number;

  /**
   * ID da operacao da atividade
   */
  @IsOptional()
  @IsInt({ message: 'ID da operacao deve ser um numero inteiro' })
  @Min(1, { message: 'ID da operacao deve ser maior que zero' })
  @Validate(IsExists, ['AtividadeOperacao', 'id_op'], { message: 'Operacao da atividade nao encontrada' })
  idOperacao?: number;

  /**
   * Data de inicio do apontamento
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de inicio deve ser uma data valida no formato YYYY-MM-DD' })
  dataInicio?: string;
}
