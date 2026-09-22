import {
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrdemServicoDto } from './CreateOrdemServicoDto';
import { OrdemServicoTalhaoSemIdDto } from './OrdemServicoTalhaoSemIdDto';
import { OrdemServicoInsumoSemIdDto } from './OrdemServicoInsumoSemIdDto';
import { OrdemServicoMaquinaSemIdDto } from './OrdemServicoMaquinaSemIdDto';
import { OrdemServicoResponsavelSemIdDto } from './OrdemServicoResponsavelSemIdDto';

/**
 * CreateOrdemServicoCompletoDto - DTO para criação completa de Ordem de Serviço
 *
 * Cria a OS com todos os seus filhos (talhões, insumos, máquinas, responsáveis)
 * em uma única requisição atomicamente.
 * Os IDs da OS nos filhos serão preenchidos automaticamente após a criação da OS.
 */
export class CreateOrdemServicoCompletoDto extends CreateOrdemServicoDto {
  /**
   * Array de talhões da OS (opcional)
   */
  @IsOptional()
  @IsArray({ message: 'Talhões deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => OrdemServicoTalhaoSemIdDto)
  talhoes?: OrdemServicoTalhaoSemIdDto[];

  /**
   * Array de insumos da OS (opcional)
   */
  @IsOptional()
  @IsArray({ message: 'Insumos deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => OrdemServicoInsumoSemIdDto)
  insumos?: OrdemServicoInsumoSemIdDto[];

  /**
   * Array de máquinas da OS (opcional)
   */
  @IsOptional()
  @IsArray({ message: 'Máquinas deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => OrdemServicoMaquinaSemIdDto)
  maquinas?: OrdemServicoMaquinaSemIdDto[];

  /**
   * Array de responsáveis da OS (opcional)
   */
  @IsOptional()
  @IsArray({ message: 'Responsáveis deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => OrdemServicoResponsavelSemIdDto)
  responsaveis?: OrdemServicoResponsavelSemIdDto[];
}
