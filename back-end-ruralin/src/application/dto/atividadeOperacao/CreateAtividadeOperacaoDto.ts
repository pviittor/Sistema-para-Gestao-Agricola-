import {
  IsInt,
  IsString,
  IsBoolean,
  IsOptional,
  Min,
  Validate,
  IsNotEmpty,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateAtividadeOperacaoDto - DTO para criação de operação de atividade
 */
export class CreateAtividadeOperacaoDto extends CreateDto {
  /**
   * Descrição da operação
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  descricao!: string;

  /**
   * ID da atividade agrícola
   */
  @IsInt({ message: 'ID da atividade deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID da atividade e obrigatorio' })
  @Min(1, { message: 'ID da atividade deve ser maior que zero' })
  @Validate(IsExists, ['AtividadeAgricola', 'id_atv'], { message: 'Atividade agricola nao encontrada' })
  idAtividade!: number;

  /**
   * Indica se a operação é financeira
   */
  @IsOptional()
  @IsBoolean({ message: 'Financeiro deve ser um valor booleano' })
  financeiro?: boolean;
}
