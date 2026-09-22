import {
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateTipoAtividadeOSDto } from './UpdateTipoAtividadeOSDto';
import { CampoCondicionalSemIdDto } from './CampoCondicionalSemIdDto';

/**
 * UpdateTipoAtividadeOSCompletoDto - DTO para atualização completa de tipo de atividade OS
 *
 * DTO usado para atualizar um tipo de atividade OS com seus campos condicionais
 * em uma única requisição atomicamente (delete-and-recreate nos campos condicionais).
 */
export class UpdateTipoAtividadeOSCompletoDto extends UpdateTipoAtividadeOSDto {
  /**
   * Array de campos condicionais do tipo de atividade (opcional)
   * Se informado, os campos condicionais existentes serão removidos e recriados
   */
  @IsOptional()
  @IsArray({ message: 'Campos condicionais deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => CampoCondicionalSemIdDto)
  camposCondicionais?: CampoCondicionalSemIdDto[];
}
