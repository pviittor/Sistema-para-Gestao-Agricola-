/**
 * TEMPLATE: Mapper
 * 
 * Variáveis de substituição:
 * - {{EntityName}}: Nome da entidade em PascalCase
 * - {{entityName}}: Nome da entidade em camelCase
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import {{EntityName}} from '../../models/{{EntityName}}';
import { Create{{EntityName}}Dto } from '../dto/{{entityName}}/Create{{EntityName}}Dto';
import { Update{{EntityName}}Dto } from '../dto/{{entityName}}/Update{{EntityName}}Dto';
import { {{EntityName}}ResponseDto } from '../dto/{{entityName}}/{{EntityName}}ResponseDto';

/**
 * Mapper para entidade {{EntityName}}
 * 
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Datas sejam convertidas corretamente
 * - Campos opcionais sejam tratados corretamente
 * - Valores booleanos sejam preservados
 */
@Injectable()
export class {{EntityName}}Mapper implements IMapper<{{EntityName}}, {{EntityName}}ResponseDto, Create{{EntityName}}Dto, Update{{EntityName}}Dto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: Create{{EntityName}}Dto | Update{{EntityName}}Dto): Promise<Partial<{{EntityName}}>> {
    const entity: any = {};

    // TODO: Mapear campos do DTO para a entidade baseado na especificação
    // Exemplo:
    // if ('nome' in dto && dto.nome !== undefined) entity.nome = dto.nome;
    // if ('ativo' in dto && dto.ativo !== undefined) entity.ativo = dto.ativo;

    return entity;
  }

  /**
   * Converte entidade para DTO de resposta
   * 
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toResponseDto(entity: {{EntityName}}): {{EntityName}}ResponseDto {
    const dto: {{EntityName}}ResponseDto = {
      id: entity.id,
      {{#if multiTenant}}
      tenantId: entity.tenantId,
      {{/if}}
      // TODO: Mapear campos da entidade para o DTO baseado na especificação
      // Exemplo:
      // nome: entity.nome,
      // descricao: entity.descricao,
      // ativo: entity.ativo,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    return dto;
  }
}
