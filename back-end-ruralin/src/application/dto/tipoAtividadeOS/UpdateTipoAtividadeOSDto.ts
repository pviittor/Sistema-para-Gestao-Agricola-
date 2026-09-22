import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
  Validate,
} from 'class-validator';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { CategoriaAtividadeOS } from '../../../models/enums/OrdemServicoEnums';

/**
 * UpdateTipoAtividadeOSDto - DTO para atualização de tipo de atividade de OS
 *
 * Todos os campos são opcionais para permitir atualizações parciais.
 */
export class UpdateTipoAtividadeOSDto {
  /**
   * Nome do tipo de atividade
   */
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome?: string;

  /**
   * Descrição detalhada do tipo de atividade
   */
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  /**
   * Categoria da atividade
   */
  @IsOptional()
  @Validate(IsValidEnum, [CategoriaAtividadeOS], { message: 'Categoria inválida. Use: AGRICOLA, PECUARIA, ADMINISTRATIVA ou MANUTENCAO' })
  categoria?: CategoriaAtividadeOS;

  /**
   * Ícone representativo da atividade
   */
  @IsOptional()
  @IsString({ message: 'Ícone deve ser uma string' })
  @MaxLength(50, { message: 'Ícone deve ter no máximo 50 caracteres' })
  icone?: string;

  /**
   * Cor em hexadecimal (#RRGGBB)
   */
  @IsOptional()
  @IsString({ message: 'Cor deve ser uma string' })
  @MaxLength(7, { message: 'Cor deve ter no máximo 7 caracteres' })
  cor?: string;

  /**
   * Indica se o tipo de atividade está ativo
   */
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um valor booleano' })
  ativo?: boolean;

  /**
   * Plano de conta gerencial padrão para custeio
   */
  @IsOptional()
  @IsInt({ message: 'planoContaIdPadrao deve ser um número inteiro' })
  planoContaIdPadrao?: number;

  /**
   * Centro de custo padrão para custeio
   */
  @IsOptional()
  @IsInt({ message: 'centroCustoIdPadrao deve ser um número inteiro' })
  centroCustoIdPadrao?: number;
}
