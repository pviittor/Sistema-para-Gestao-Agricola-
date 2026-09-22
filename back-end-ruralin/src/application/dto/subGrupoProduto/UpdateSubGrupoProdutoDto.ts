import {
  IsString,
  IsInt,
  MinLength,
  MaxLength,
  Min,
  IsOptional,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateSubGrupoProdutoDto - DTO para atualização de subgrupo de produto
 * 
 * DTO usado no endpoint de atualização de subgrupo de produto.
 * Todos os campos são opcionais.
 */
export class UpdateSubGrupoProdutoDto extends UpdateDto {
  /**
   * Descrição do subgrupo de produto
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  @IsOptional()
  descricao_sub?: string;

  /**
   * ID do grupo de produto ao qual o subgrupo pertence
   */
  @IsInt({ message: 'ID do grupo deve ser um número inteiro' })
  @Min(1, { message: 'ID do grupo deve ser maior que zero' })
  @Validate(IsExists, ['GrupoProduto', 'id'])
  @IsOptional()
  idGrupo?: number;
}
