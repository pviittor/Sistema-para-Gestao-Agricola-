import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  Min,
  Validate,
} from 'class-validator';
import { IsExists } from '../../validators/IsExists';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { PrioridadeOrdemServico } from '../../../models/enums/OrdemServicoEnums';

/**
 * UpdateOrdemServicoDto - DTO para atualização de Ordem de Serviço
 *
 * Todos os campos são opcionais para permitir atualizações parciais.
 * Campos de workflow (status, datas reais, responsáveis) são gerenciados
 * por endpoints específicos.
 */
export class UpdateOrdemServicoDto {
  /**
   * ID do tipo de atividade da OS
   */
  @IsOptional()
  @IsInt({ message: 'ID do tipo de atividade deve ser um número inteiro' })
  @Validate(IsExists, ['TipoAtividadeOS', 'id'], { message: 'Tipo de atividade não encontrado' })
  tipoAtividadeOSId?: number;

  /**
   * ID da fazenda onde a OS será executada
   */
  @IsOptional()
  @IsInt({ message: 'ID da fazenda deve ser um número inteiro' })
  @Validate(IsExists, ['Fazenda', 'id'], { message: 'Fazenda não encontrada' })
  fazendaId?: number;

  /**
   * ID da safra associada
   */
  @IsOptional()
  @IsInt({ message: 'ID da safra deve ser um número inteiro' })
  safraId?: number;

  /**
   * Descrição detalhada da OS
   */
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  /**
   * Prioridade da OS
   */
  @IsOptional()
  @Validate(IsValidEnum, [PrioridadeOrdemServico], { message: 'Prioridade inválida. Use: BAIXA, MEDIA, ALTA ou URGENTE' })
  prioridade?: PrioridadeOrdemServico;

  /**
   * Data planejada de início
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data planejada de início deve ser uma data válida no formato YYYY-MM-DD' })
  dataPlanejadaInicio?: string;

  /**
   * Data planejada de conclusão
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data planejada de conclusão deve ser uma data válida no formato YYYY-MM-DD' })
  dataPlanejadaFim?: string;

  /**
   * Custo estimado total da OS
   */
  @IsOptional()
  @IsNumber({}, { message: 'Custo estimado deve ser um número' })
  @Min(0, { message: 'Custo estimado deve ser maior ou igual a zero' })
  custoEstimado?: number;

  /**
   * Campos dinâmicos específicos do tipo de atividade (JSON)
   */
  @IsOptional()
  camposCondicionais?: Record<string, any>;

  /**
   * Observações gerais da OS
   */
  @IsOptional()
  @IsString({ message: 'Observações deve ser uma string' })
  observacoes?: string;
}
