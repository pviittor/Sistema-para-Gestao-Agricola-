import {
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  IsString,
  Min,
  Validate,
  IsNotEmpty,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateProdutoBenfeitoriaDto - DTO para criacao de produto benfeitoria
 */
export class CreateProdutoBenfeitoriaDto extends CreateDto {
  /**
   * ID da benfeitoria relacionada
   */
  @IsInt({ message: 'ID da benfeitoria deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID da benfeitoria e obrigatorio' })
  @Min(1, { message: 'ID da benfeitoria deve ser maior que zero' })
  @Validate(IsExists, ['Benfeitoria', 'id_benf'], { message: 'Benfeitoria nao encontrada' })
  idBenfeitoria!: number;

  /**
   * ID do produto utilizado
   */
  @IsInt({ message: 'ID do produto deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID do produto e obrigatorio' })
  @Min(1, { message: 'ID do produto deve ser maior que zero' })
  @Validate(IsExists, ['Produto', 'id_prod'], { message: 'Produto nao encontrado' })
  idProduto!: number;

  /**
   * Data de utilizacao do produto
   */
  @IsDateString({}, { message: 'Data deve ser uma data valida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data e obrigatoria' })
  data!: string;

  /**
   * Quantidade utilizada
   */
  @IsNumber({}, { message: 'Quantidade deve ser um numero' })
  @IsNotEmpty({ message: 'Quantidade e obrigatoria' })
  @Min(0, { message: 'Quantidade deve ser maior ou igual a zero' })
  quantidade!: number;

  /**
   * Valor unitario do produto
   */
  @IsNumber({}, { message: 'Unitario deve ser um numero' })
  @IsNotEmpty({ message: 'Unitario e obrigatorio' })
  @Min(0, { message: 'Unitario deve ser maior ou igual a zero' })
  unitario!: number;

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
