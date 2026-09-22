import {
  IsString,
  IsInt,
  IsNotEmpty,
  Validate,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateCulturaDto - DTO para criação de cultura
 */
export class CreateCulturaDto extends CreateDto {
  /**
   * Descrição da cultura
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  descricao_clt!: string;

  /**
   * ID do produto relacionado
   */
  @IsInt({ message: 'ID do produto deve ser um número inteiro' })
  @Min(1, { message: 'ID do produto deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID do produto é obrigatório' })
  @Validate(IsExists, ['Produto', 'id_prod'])
  idProduto!: number;
}
