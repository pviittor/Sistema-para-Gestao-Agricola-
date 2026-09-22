/**
 * TenantResponseDto - DTO para resposta de tenant
 * 
 * DTO usado nas respostas dos endpoints de tenant.
 */

export class TenantResponseDto {
  id!: number;
  consultoriaId!: number;
  nome!: string;
  slug!: string;
  ativo!: boolean;
  dataAtivacao!: Date;
  dataDesativacao?: Date | null;
  configuracoes?: Record<string, any> | null;
  limiteUsuarios!: number;
  usercreation!: number;
  datecreation!: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
