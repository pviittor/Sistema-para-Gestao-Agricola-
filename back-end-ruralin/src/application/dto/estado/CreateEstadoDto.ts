import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, Max, Length } from 'class-validator';
import { IsUnique } from '../../validators/IsUnique';
import { CreateDto } from '../CreateDto';

/**
 * DTO para criação de Estado
 */
export class CreateEstadoDto extends CreateDto {
  /**
   * Sigla do estado (ex: SP, RJ, MG)
   */
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  @IsUnique('Estado', 'sigla', undefined, { message: 'Já existe um estado com esta sigla' })
  sigla!: string;

  /**
   * Nome completo do estado
   */
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  nome!: string;

  /**
   * Código do estado no IBGE
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  codigoIBGE?: number;

  /**
   * Se o estado está ativo
   */
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
