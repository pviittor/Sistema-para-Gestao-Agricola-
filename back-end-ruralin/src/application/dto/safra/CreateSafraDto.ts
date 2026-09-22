import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Length, IsDateString, IsEnum } from 'class-validator';
import { IsExists } from '../../validators/IsExists';
import { CreateDto } from '../CreateDto';
import { StatusSafra } from '../../../models/Safra';

/**
 * DTO para criação de Safra
 */
export class CreateSafraDto extends CreateDto {
  /**
   * ID da cultura
   */
  @IsInt()
  @Min(1)
  @IsExists('Cultura', 'id', { message: 'Cultura não encontrada' })
  culturaId!: number;

  /**
   * Nome da safra
   */
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  nome!: string;

  /**
   * Data de início da safra
   */
  @IsDateString({}, { message: 'Data de início deve ser uma data válida no formato YYYY-MM-DD' })
  dataInicio!: string;

  /**
   * Data de fim da safra
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de fim deve ser uma data válida no formato YYYY-MM-DD' })
  dataFim?: string;

  /**
   * Status da safra
   */
  @IsOptional()
  @IsEnum(StatusSafra, { message: 'Status deve ser PLANEJADA, EM_ANDAMENTO, CONCLUIDA ou CANCELADA' })
  status?: StatusSafra;
}
