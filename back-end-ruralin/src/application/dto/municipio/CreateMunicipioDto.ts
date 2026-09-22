import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, Max, Length } from 'class-validator';
import { IsExists } from '../../validators/IsExists';
import { IsUnique } from '../../validators/IsUnique';
import { CreateDto } from '../CreateDto';

/**
 * DTO para criação de Municipio
 */
export class CreateMunicipioDto extends CreateDto {
  /**
   * Nome do município
   */
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  nome!: string;

  /**
   * ID do estado ao qual o município pertence
   */
  @IsInt()
  @Min(1)
  @IsExists('Estado', 'id', { message: 'Estado não encontrado' })
  idEstado!: number;

  /**
   * Código do município no IBGE
   */
  @IsOptional()
  @IsInt()
  @Min(1000000)
  @Max(9999999)
  @IsUnique('Municipio', 'codigoIBGE', undefined, { message: 'Já existe um município com este código IBGE' })
  codigoIBGE?: number;

  /**
   * Se o município está ativo
   */
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
