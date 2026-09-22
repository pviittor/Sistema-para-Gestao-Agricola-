import {
  IsString,
  IsInt,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Min,
  Validate,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateSubGrupoProdutoDto - DTO para criação de subgrupo de produto
 * 
 * DTO usado no endpoint de criação de subgrupo de produto com todas as validações necessárias.
 */
export class CreateSubGrupoProdutoDto extends CreateDto {
  /**
   * Descrição do subgrupo de produto
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  descricao_sub!: string;

  /**
   * ID do grupo de produto ao qual o subgrupo pertence
   */
  @IsInt({ message: 'ID do grupo deve ser um número inteiro' })
  @Min(1, { message: 'ID do grupo deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID do grupo é obrigatório' })
  @Validate(IsExists, ['GrupoProduto', 'id'])
  idGrupo!: number;
}
