import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { CreateDto } from '../CreateDto';

/**
 * CreateGrupoEquipamentoDto - DTO para criação de grupo de equipamento
 *
 * DTO usado no endpoint de criação de grupo de equipamento com todas as validações necessárias.
 */
export class CreateGrupoEquipamentoDto extends CreateDto {
  /**
   * Descrição do grupo de equipamento
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  descricao_grpequip!: string;
}
