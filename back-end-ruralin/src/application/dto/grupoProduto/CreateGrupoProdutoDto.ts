import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { CreateDto } from '../CreateDto';

/**
 * CreateGrupoProdutoDto - DTO para criação de grupo de produto
 * 
 * DTO usado no endpoint de criação de grupo de produto com todas as validações necessárias.
 */
export class CreateGrupoProdutoDto extends CreateDto {
  /**
   * Descrição do grupo de produto
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  descricao_grupo!: string;

  /**
   * Abreviação do grupo de produto
   */
  @IsString({ message: 'Abreviação deve ser uma string' })
  @IsOptional()
  @MinLength(1, { message: 'Abreviação deve ter no mínimo 1 caractere' })
  @MaxLength(50, { message: 'Abreviação deve ter no máximo 50 caracteres' })
  abreviacao_grupo?: string;
}
