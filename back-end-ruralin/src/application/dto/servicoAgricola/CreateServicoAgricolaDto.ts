import {
  IsString,
  IsBoolean,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { CreateDto } from '../CreateDto';

/**
 * CreateServicoAgricolaDto - DTO para criação de serviço agrícola
 */
export class CreateServicoAgricolaDto extends CreateDto {
  /**
   * Descrição do serviço agrícola
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  descricao_srv!: string;

  /**
   * Indica se o serviço gera movimento financeiro (futuro)
   */
  @IsBoolean({ message: 'Financeiro deve ser um valor booleano' })
  financeiro_srv!: boolean;

  /**
   * Observações sobre o serviço
   */
  @IsString({ message: 'Observação deve ser uma string' })
  @IsOptional()
  observacao_srv?: string;
}
