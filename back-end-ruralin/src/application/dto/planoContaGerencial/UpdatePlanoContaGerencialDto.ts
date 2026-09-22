import {
  IsString,
  IsInt,
  Validate,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsEnum,
  Matches,
  IsBoolean,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdatePlanoContaGerencialDto - DTO para atualização de conta do plano de contas gerencial
 */
export class UpdatePlanoContaGerencialDto extends UpdateDto {
  /**
   * Sequência lógica de números indicando os níveis da conta
   */
  @IsString({ message: 'Item deve ser uma string' })
  @MinLength(3, { message: 'Item deve ter no mínimo 3 caracteres' })
  @MaxLength(50, { message: 'Item deve ter no máximo 50 caracteres' })
  @Matches(/^\d+\.(\d+\.(\d+\.\d+)?)?$/, {
    message: 'Item deve seguir o formato de 4 níveis (ex: 1.0.0.0, 1.1.0.0, 1.1.1.0, 1.1.2.0)',
  })
  @IsOptional()
  item?: string;

  /**
   * Descrição da conta
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  @IsOptional()
  descricao?: string;

  /**
   * Tipo da conta: Sintética ou Analítica
   */
  @IsEnum(['SINTETICA', 'ANALITICA'], {
    message: 'Tipo deve ser SINTETICA ou ANALITICA',
  })
  @IsOptional()
  tipo?: 'SINTETICA' | 'ANALITICA';

  /**
   * Tipo de fluxo financeiro: RECEITA ou DESPESA
   */
  @IsEnum(['RECEITA', 'DESPESA'], {
    message: 'Tipo de fluxo deve ser RECEITA ou DESPESA',
  })
  @IsOptional()
  tipoFluxo?: 'RECEITA' | 'DESPESA';

  /**
   * Classificação da conta
   */
  @IsString({ message: 'Classificação deve ser uma string' })
  @MaxLength(100, { message: 'Classificação deve ter no máximo 100 caracteres' })
  @IsOptional()
  classificacao?: string;

  /**
   * ID da conta pai (para hierarquia)
   */
  @IsInt({ message: 'ID da conta pai deve ser um número inteiro' })
  @Min(1, { message: 'ID da conta pai deve ser maior que zero' })
  @Validate(IsExists, ['PlanoContaGerencial', 'id'])
  @IsOptional()
  contaPaiId?: number;

  /**
   * Nível hierárquico da conta (1 a 4)
   */
  @IsInt({ message: 'Nível deve ser um número inteiro' })
  @Min(1, { message: 'Nível deve ser no mínimo 1' })
  @Max(4, { message: 'Nível deve ser no máximo 4' })
  @IsOptional()
  nivel?: number;

  /**
   * Se a conta está ativa
   */
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  @IsOptional()
  ativo?: boolean;
}
