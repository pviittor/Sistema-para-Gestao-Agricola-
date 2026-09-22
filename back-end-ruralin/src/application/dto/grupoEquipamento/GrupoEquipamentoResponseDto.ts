/**
 * GrupoEquipamentoResponseDto - DTO para resposta de grupo de equipamento
 *
 * DTO usado nas respostas da API para grupo de equipamento.
 */
export class GrupoEquipamentoResponseDto {
  id_grpequip!: number;
  tenantId!: number;
  descricao_grpequip!: string;
  usercreation!: number;
  datecreation!: Date;
}
