import {
  IsString,
  IsInt,
  IsDateString,
  IsNumber,
  IsBoolean,
  Min,
  Validate,
  IsOptional,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateMoedaCotacaoDto - DTO para atualização de cotação de moeda
 */
export class UpdateMoedaCotacaoDto extends UpdateDto {
  @IsInt({ message: 'ID da moeda deve ser um número inteiro' })
  @Min(1, { message: 'ID da moeda deve ser maior que zero' })
  @Validate(IsExists, ['Moeda', 'id_moeda'])
  @IsOptional()
  idMoeda?: number;

  @IsDateString({}, { message: 'Data da cotação deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  data_cotacao?: string;

  @IsNumber({}, { message: 'Valor da cotação deve ser um número' })
  @Min(0, { message: 'Valor da cotação deve ser maior ou igual a zero' })
  @IsOptional()
  valor_cotacao?: number;

  @IsBoolean({ message: 'Fechamento deve ser um valor booleano' })
  @IsOptional()
  fechamento_cotaca?: boolean;
}
