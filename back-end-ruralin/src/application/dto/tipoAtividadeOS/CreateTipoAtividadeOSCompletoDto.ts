import {
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTipoAtividadeOSDto } from './CreateTipoAtividadeOSDto';
import { CampoCondicionalSemIdDto } from './CampoCondicionalSemIdDto';

/**
 * CreateTipoAtividadeOSCompletoDto - DTO para criação completa de tipo de atividade OS
 *
 * DTO usado para criar um tipo de atividade OS com seus campos condicionais
 * em uma única requisição atomicamente.
 * O tipoAtividadeOSId nos campos condicionais será preenchido automaticamente
 * após a criação do tipo de atividade.
 */
export class CreateTipoAtividadeOSCompletoDto extends CreateTipoAtividadeOSDto {
  /**
   * Array de campos condicionais do tipo de atividade (opcional)
   * O tipoAtividadeOSId será preenchido automaticamente, não precisa ser informado
   */
  @IsOptional()
  @IsArray({ message: 'Campos condicionais deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => CampoCondicionalSemIdDto)
  camposCondicionais?: CampoCondicionalSemIdDto[];
}
