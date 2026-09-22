import {
  IsOptional,
  IsInt,
  IsString,
  IsBoolean,
  Min,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateAtividadeOperacaoDto - DTO para atualização de operação de atividade
 *
 * Todos os campos são opcionais, permitindo atualizações parciais.
 */
export class UpdateAtividadeOperacaoDto extends UpdateDto {
  /**
   * Descrição da operação
   */
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  /**
   * ID da atividade agrícola
   */
  @IsOptional()
  @IsInt({ message: 'ID da atividade deve ser um numero inteiro' })
  @Min(1, { message: 'ID da atividade deve ser maior que zero' })
  @Validate(IsExists, ['AtividadeAgricola', 'id_atv'], { message: 'Atividade agricola nao encontrada' })
  idAtividade?: number;

  /**
   * Indica se a operação é financeira
   */
  @IsOptional()
  @IsBoolean({ message: 'Financeiro deve ser um valor booleano' })
  financeiro?: boolean;
}
