import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, Length } from 'class-validator';
import { IsExists } from '../../validators/IsExists';
import { IsUnique } from '../../validators/IsUnique';
import { CreateDto } from '../CreateDto';

/**
 * DTO para criação de CentroCusto
 */
export class CreateCentroCustoDto extends CreateDto {
  /**
   * Código do centro de custo
   */
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  @IsUnique('CentroCusto', 'codigo', undefined, { message: 'Já existe um centro de custo com este código' })
  codigo!: string;

  /**
   * Nome do centro de custo
   */
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  nome!: string;

  /**
   * ID do centro de custo pai (para hierarquia)
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @IsExists('CentroCusto', 'id', { message: 'Centro de custo pai não encontrado' })
  centroCustoPaiId?: number;

  /**
   * Se o centro de custo está ativo
   */
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
