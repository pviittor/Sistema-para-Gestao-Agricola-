import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';

/**
 * UpdateGrupoEquipamentoDto - DTO para atualização de grupo de equipamento
 *
 * DTO usado no endpoint de atualização de grupo de equipamento.
 * Todos os campos são opcionais.
 */
export class UpdateGrupoEquipamentoDto extends UpdateDto {
  /**
   * Descrição do grupo de equipamento
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  @IsOptional()
  descricao_grpequip?: string;
}
