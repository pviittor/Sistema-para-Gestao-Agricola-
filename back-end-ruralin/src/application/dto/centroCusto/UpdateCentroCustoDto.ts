import { IsString, IsOptional, IsBoolean, IsInt, Min, Length } from 'class-validator';
import { IsExists } from '../../validators/IsExists';
import { IsUnique } from '../../validators/IsUnique';
import { UpdateDto } from '../UpdateDto';

/**
 * DTO para atualização de CentroCusto
 */
export class UpdateCentroCustoDto extends UpdateDto {
  /**
   * Código do centro de custo
   */
  @IsOptional()
  @IsString()
  @Length(2, 50)
  @IsUnique('CentroCusto', 'codigo', 'id', { message: 'Já existe um centro de custo com este código' })
  codigo?: string;

  /**
   * Nome do centro de custo
   */
  @IsOptional()
  @IsString()
  @Length(3, 255)
  nome?: string;

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
