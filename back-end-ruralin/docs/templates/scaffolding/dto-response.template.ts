/**
 * TEMPLATE: Response DTO
 * 
 * Variáveis de substituição:
 * - {{EntityName}}: Nome da entidade em PascalCase
 */

/**
 * {{EntityName}}ResponseDto - DTO para resposta de {{entityName}}
 * 
 * DTO usado nas respostas da API para {{entityName}}.
 */
export class {{EntityName}}ResponseDto {
  id!: number;
  {{#if multiTenant}}
  tenantId!: number;
  {{/if}}
  // TODO: Adicionar campos baseados na especificação
  // Exemplo:
  // nome!: string;
  // descricao?: string;
  // ativo!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  {{#if hasRelationships}}
  // TODO: Adicionar campos de relacionamentos se necessário
  // related?: RelatedResponseDto;
  {{/if}}
}
