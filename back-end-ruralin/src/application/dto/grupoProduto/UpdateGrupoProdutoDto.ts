import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';

/**
 * UpdateGrupoProdutoDto - DTO para atualização de grupo de produto
 * 
 * DTO usado no endpoint de atualização de grupo de produto.
 * Todos os campos são opcionais.
 */
export class UpdateGrupoProdutoDto extends UpdateDto {
  /**
   * Descrição do grupo de produto
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  @IsOptional()
  descricao_grupo?: string;

  /**
   * Abreviação do grupo de produto
   */
  @IsString({ message: 'Abreviação deve ser uma string' })
  @MinLength(1, { message: 'Abreviação deve ter no mínimo 1 caractere' })
  @MaxLength(50, { message: 'Abreviação deve ter no máximo 50 caracteres' })
  @IsOptional()
  abreviacao_grupo?: string;
}
