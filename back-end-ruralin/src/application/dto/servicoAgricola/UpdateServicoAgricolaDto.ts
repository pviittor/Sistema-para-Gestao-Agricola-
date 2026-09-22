import {
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';

/**
 * UpdateServicoAgricolaDto - DTO para atualização de serviço agrícola
 */
export class UpdateServicoAgricolaDto extends UpdateDto {
  @IsString({ message: 'Descrição deve ser uma string' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  @IsOptional()
  descricao_srv?: string;

  @IsBoolean({ message: 'Financeiro deve ser um valor booleano' })
  @IsOptional()
  financeiro_srv?: boolean;

  @IsString({ message: 'Observação deve ser uma string' })
  @IsOptional()
  observacao_srv?: string;
}
