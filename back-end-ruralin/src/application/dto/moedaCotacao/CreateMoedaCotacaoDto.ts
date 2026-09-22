import {
  IsString,
  IsInt,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  Min,
  Validate,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateMoedaCotacaoDto - DTO para criação de cotação de moeda
 */
export class CreateMoedaCotacaoDto extends CreateDto {
  /**
   * ID da moeda relacionada
   */
  @IsInt({ message: 'ID da moeda deve ser um número inteiro' })
  @Min(1, { message: 'ID da moeda deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID da moeda é obrigatório' })
  @Validate(IsExists, ['Moeda', 'id_moeda'])
  idMoeda!: number;

  /**
   * Data da cotação
   */
  @IsDateString({}, { message: 'Data da cotação deve ser uma data válida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data da cotação é obrigatória' })
  data_cotacao!: string;

  /**
   * Valor da cotação
   */
  @IsNumber({}, { message: 'Valor da cotação deve ser um número' })
  @Min(0, { message: 'Valor da cotação deve ser maior ou igual a zero' })
  @IsNotEmpty({ message: 'Valor da cotação é obrigatório' })
  valor_cotacao!: number;

  /**
   * Indica se é fechamento oficial (preço de ajuste)
   */
  @IsBoolean({ message: 'Fechamento deve ser um valor booleano' })
  fechamento_cotaca!: boolean;
}
