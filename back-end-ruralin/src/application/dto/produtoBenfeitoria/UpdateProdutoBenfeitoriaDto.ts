import {
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  IsString,
  Min,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateProdutoBenfeitoriaDto - DTO para atualizacao de produto benfeitoria
 *
 * Todos os campos sao opcionais, permitindo atualizacoes parciais.
 */
export class UpdateProdutoBenfeitoriaDto extends UpdateDto {
  /**
   * ID da benfeitoria relacionada
   */
  @IsOptional()
  @IsInt({ message: 'ID da benfeitoria deve ser um numero inteiro' })
  @Min(1, { message: 'ID da benfeitoria deve ser maior que zero' })
  @Validate(IsExists, ['Benfeitoria', 'id_benf'], { message: 'Benfeitoria nao encontrada' })
  idBenfeitoria?: number;

  /**
   * ID do produto utilizado
   */
  @IsOptional()
  @IsInt({ message: 'ID do produto deve ser um numero inteiro' })
  @Min(1, { message: 'ID do produto deve ser maior que zero' })
  @Validate(IsExists, ['Produto', 'id_prod'], { message: 'Produto nao encontrado' })
  idProduto?: number;

  /**
   * Data de utilizacao do produto
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data deve ser uma data valida no formato YYYY-MM-DD' })
  data?: string;

  /**
   * Quantidade utilizada
   */
  @IsOptional()
  @IsNumber({}, { message: 'Quantidade deve ser um numero' })
  @Min(0, { message: 'Quantidade deve ser maior ou igual a zero' })
  quantidade?: number;

  /**
   * Valor unitario do produto
   */
  @IsOptional()
  @IsNumber({}, { message: 'Unitario deve ser um numero' })
  @Min(0, { message: 'Unitario deve ser maior ou igual a zero' })
  unitario?: number;

  /**
   * Observacoes adicionais
   */
  @IsOptional()
  @IsString({ message: 'Observacao deve ser uma string' })
  observacao?: string;

  /**
   * ID da safra
   */
  @IsOptional()
  @IsInt({ message: 'ID da safra deve ser um numero inteiro' })
  @Min(1, { message: 'ID da safra deve ser maior que zero' })
  @Validate(IsExists, ['Safra', 'id'], { message: 'Safra nao encontrada' })
  idSafra?: number;
}
