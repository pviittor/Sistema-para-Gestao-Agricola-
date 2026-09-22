import {
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrdemServicoResponsavelSemIdDto } from './OrdemServicoResponsavelSemIdDto';

/**
 * AtribuirOrdemServicoDto - DTO para atribuição de responsáveis à OS
 *
 * Usado no endpoint de workflow para atribuir responsáveis a uma OS.
 * Transiciona o status para AGUARDANDO.
 */
export class AtribuirOrdemServicoDto {
  /**
   * Array de responsáveis a serem atribuídos à OS
   */
  @IsOptional()
  @IsArray({ message: 'Responsáveis deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => OrdemServicoResponsavelSemIdDto)
  responsaveis?: OrdemServicoResponsavelSemIdDto[];
}
