import {
  IsString,
  IsInt,
  Validate,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateCulturaDto - DTO para atualização de cultura
 */
export class UpdateCulturaDto extends UpdateDto {
  @IsString({ message: 'Descrição deve ser uma string' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  @IsOptional()
  descricao_clt?: string;

  @IsInt({ message: 'ID do produto deve ser um número inteiro' })
  @Min(1, { message: 'ID do produto deve ser maior que zero' })
  @Validate(IsExists, ['Produto', 'id_prod'])
  @IsOptional()
  idProduto?: number;
}
