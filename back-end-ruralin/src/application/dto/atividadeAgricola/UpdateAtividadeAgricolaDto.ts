import {
  IsOptional,
  IsInt,
  IsString,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { TipoAtividadeAgricola } from '../../../models/enums/AtividadeAgricolaEnums';

/**
 * UpdateAtividadeAgricolaDto - DTO para atualização de atividade agrícola
 *
 * Todos os campos são opcionais, permitindo atualizações parciais.
 */
export class UpdateAtividadeAgricolaDto extends UpdateDto {
  /**
   * Descrição da atividade agrícola
   */
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  /**
   * Tipo da atividade (0=Produção, 1=Manutenção Máquinas, 2=Administrativas)
   */
  @IsOptional()
  @IsInt({ message: 'Tipo deve ser um numero inteiro' })
  @Validate(IsValidEnum, [TipoAtividadeAgricola], { message: 'Tipo de atividade invalido. Valores validos: 0 (PRODUCAO), 1 (MANUTENCAO_MAQUINAS), 2 (ADMINISTRATIVAS)' })
  tipo?: number;
}
