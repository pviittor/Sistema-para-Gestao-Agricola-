import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrdemServicoTalhaoSemIdDto } from './OrdemServicoTalhaoSemIdDto';
import { OrdemServicoInsumoSemIdDto } from './OrdemServicoInsumoSemIdDto';
import { OrdemServicoMaquinaSemIdDto } from './OrdemServicoMaquinaSemIdDto';
import { OrdemServicoResponsavelSemIdDto } from './OrdemServicoResponsavelSemIdDto';

/**
 * ConcluirOrdemServicoDto - DTO para conclusão de uma OS
 *
 * Transiciona o status de EM_EXECUCAO para CONCLUIDA.
 * Permite registrar dados reais de execução dos filhos opcionalmente.
 */
export class ConcluirOrdemServicoDto {
  /**
   * Data real de conclusão da OS
   */
  @IsNotEmpty({ message: 'Data de conclusão é obrigatória' })
  @IsDateString({}, { message: 'Data de conclusão deve ser uma data válida no formato YYYY-MM-DD' })
  dataFimReal!: string;

  /**
   * Observações registradas na conclusão
   */
  @IsOptional()
  @IsString({ message: 'Observações de conclusão deve ser uma string' })
  observacoesConclusao?: string;

  /**
   * Dados reais dos talhões (opcional — atualiza os existentes com dados reais)
   */
  @IsOptional()
  @IsArray({ message: 'Talhões deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => OrdemServicoTalhaoSemIdDto)
  talhoes?: OrdemServicoTalhaoSemIdDto[];

  /**
   * Dados reais dos insumos (opcional — atualiza os existentes com dados reais)
   */
  @IsOptional()
  @IsArray({ message: 'Insumos deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => OrdemServicoInsumoSemIdDto)
  insumos?: OrdemServicoInsumoSemIdDto[];

  /**
   * Dados reais das máquinas (opcional — atualiza os existentes com dados reais)
   */
  @IsOptional()
  @IsArray({ message: 'Máquinas deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => OrdemServicoMaquinaSemIdDto)
  maquinas?: OrdemServicoMaquinaSemIdDto[];

  /**
   * Dados reais dos responsáveis (opcional — atualiza os existentes com dados reais)
   */
  @IsOptional()
  @IsArray({ message: 'Responsáveis deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => OrdemServicoResponsavelSemIdDto)
  responsaveis?: OrdemServicoResponsavelSemIdDto[];
}
