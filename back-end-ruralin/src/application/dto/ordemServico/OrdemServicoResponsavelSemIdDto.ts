import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  Validate,
} from 'class-validator';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { FuncaoResponsavelOS } from '../../../models/enums/OrdemServicoEnums';

/**
 * OrdemServicoResponsavelSemIdDto - DTO para responsável da OS sem ordemServicoId
 *
 * Usado nos DTOs de criação/atualização completa onde o ordemServicoId
 * será preenchido automaticamente pelo service.
 */
export class OrdemServicoResponsavelSemIdDto {
  /**
   * ID da pessoa responsável
   */
  @IsNotEmpty({ message: 'ID da pessoa é obrigatório' })
  @IsInt({ message: 'ID da pessoa deve ser um número inteiro' })
  pessoaId!: number;

  /**
   * Função do responsável na OS
   */
  @IsNotEmpty({ message: 'Função é obrigatória' })
  @Validate(IsValidEnum, [FuncaoResponsavelOS], { message: 'Função inválida. Use: RESPONSAVEL, OPERADOR, FISCAL ou AUXILIAR' })
  funcao!: FuncaoResponsavelOS;

  /**
   * Horas planejadas de trabalho
   */
  @IsOptional()
  @IsNumber({}, { message: 'Horas planejadas deve ser um número' })
  @Min(0, { message: 'Horas planejadas deve ser maior ou igual a zero' })
  horasPlanejadas?: number;

  /**
   * Custo por hora planejado
   */
  @IsOptional()
  @IsNumber({}, { message: 'Custo/hora planejado deve ser um número' })
  @Min(0, { message: 'Custo/hora planejado deve ser maior ou igual a zero' })
  custoHoraPlanejado?: number;

  /**
   * Horas reais trabalhadas
   */
  @IsOptional()
  @IsNumber({}, { message: 'Horas reais deve ser um número' })
  @Min(0, { message: 'Horas reais deve ser maior ou igual a zero' })
  horasReais?: number;

  /**
   * Custo por hora real
   */
  @IsOptional()
  @IsNumber({}, { message: 'Custo/hora real deve ser um número' })
  @Min(0, { message: 'Custo/hora real deve ser maior ou igual a zero' })
  custoHoraReal?: number;

  /**
   * Observações sobre o responsável
   */
  @IsOptional()
  @IsString({ message: 'Observações deve ser uma string' })
  observacoes?: string;
}
