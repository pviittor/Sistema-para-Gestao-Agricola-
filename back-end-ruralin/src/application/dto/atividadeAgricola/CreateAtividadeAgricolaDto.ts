import {
  IsInt,
  IsString,
  Validate,
  IsNotEmpty,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { TipoAtividadeAgricola } from '../../../models/enums/AtividadeAgricolaEnums';

/**
 * CreateAtividadeAgricolaDto - DTO para criação de atividade agrícola
 */
export class CreateAtividadeAgricolaDto extends CreateDto {
  /**
   * Descrição da atividade agrícola
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  descricao!: string;

  /**
   * Tipo da atividade (0=Produção, 1=Manutenção Máquinas, 2=Administrativas)
   */
  @IsInt({ message: 'Tipo deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'Tipo e obrigatorio' })
  @Validate(IsValidEnum, [TipoAtividadeAgricola], { message: 'Tipo de atividade invalido. Valores validos: 0 (PRODUCAO), 1 (MANUTENCAO_MAQUINAS), 2 (ADMINISTRATIVAS)' })
  tipo!: number;
}
