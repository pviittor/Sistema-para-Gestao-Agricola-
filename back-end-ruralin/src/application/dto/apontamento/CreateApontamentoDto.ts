import {
  IsOptional,
  IsInt,
  IsDateString,
  Validate,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateApontamentoDto - DTO para criacao de apontamento
 */
export class CreateApontamentoDto extends CreateDto {
  /**
   * ID da configuracao do ciclo
   */
  @IsInt({ message: 'ID da configuracao deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID da configuracao e obrigatorio' })
  @Min(1, { message: 'ID da configuracao deve ser maior que zero' })
  @Validate(IsExists, ['ConfiguradorCiclo', 'id_cfg'], { message: 'Configuracao do ciclo nao encontrada' })
  idConfiguracao!: number;

  /**
   * ID da atividade agricola
   */
  @IsInt({ message: 'ID da atividade deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID da atividade e obrigatorio' })
  @Min(1, { message: 'ID da atividade deve ser maior que zero' })
  @Validate(IsExists, ['AtividadeAgricola', 'id_atv'], { message: 'Atividade agricola nao encontrada' })
  idAtividade!: number;

  /**
   * ID da operacao da atividade
   */
  @IsInt({ message: 'ID da operacao deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID da operacao e obrigatorio' })
  @Min(1, { message: 'ID da operacao deve ser maior que zero' })
  @Validate(IsExists, ['AtividadeOperacao', 'id_op'], { message: 'Operacao da atividade nao encontrada' })
  idOperacao!: number;

  /**
   * Data de inicio do apontamento (se futura = planejado)
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de inicio deve ser uma data valida no formato YYYY-MM-DD' })
  dataInicio?: string;
}
