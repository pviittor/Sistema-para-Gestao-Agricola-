import {
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateOrdemServicoDto } from './UpdateOrdemServicoDto';
import { OrdemServicoTalhaoSemIdDto } from './OrdemServicoTalhaoSemIdDto';
import { OrdemServicoInsumoSemIdDto } from './OrdemServicoInsumoSemIdDto';
import { OrdemServicoMaquinaSemIdDto } from './OrdemServicoMaquinaSemIdDto';
import { OrdemServicoResponsavelSemIdDto } from './OrdemServicoResponsavelSemIdDto';

/**
 * UpdateOrdemServicoCompletoDto - DTO para atualização completa de Ordem de Serviço
 *
 * Atualiza a OS com todos os seus filhos (talhões, insumos, máquinas, responsáveis)
 * em uma única requisição atomicamente (delete-and-recreate para os filhos).
 * Todos os campos são opcionais.
 */
export class UpdateOrdemServicoCompletoDto extends UpdateOrdemServicoDto {
  /**
   * Array de talhões da OS (opcional — se informado, substitui os existentes)
   */
  @IsOptional()
  @IsArray({ message: 'Talhões deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => OrdemServicoTalhaoSemIdDto)
  talhoes?: OrdemServicoTalhaoSemIdDto[];

  /**
   * Array de insumos da OS (opcional — se informado, substitui os existentes)
   */
  @IsOptional()
  @IsArray({ message: 'Insumos deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => OrdemServicoInsumoSemIdDto)
  insumos?: OrdemServicoInsumoSemIdDto[];

  /**
   * Array de máquinas da OS (opcional — se informado, substitui os existentes)
   */
  @IsOptional()
  @IsArray({ message: 'Máquinas deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => OrdemServicoMaquinaSemIdDto)
  maquinas?: OrdemServicoMaquinaSemIdDto[];

  /**
   * Array de responsáveis da OS (opcional — se informado, substitui os existentes)
   */
  @IsOptional()
  @IsArray({ message: 'Responsáveis deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => OrdemServicoResponsavelSemIdDto)
  responsaveis?: OrdemServicoResponsavelSemIdDto[];
}
