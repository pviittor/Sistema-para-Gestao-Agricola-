/**
 * ConsultoriaResponseDto - DTO para resposta de consultoria
 * 
 * DTO usado nas respostas dos endpoints de consultoria.
 */

export class ConsultoriaResponseDto {
  id!: number;
  tenantId?: number | null;
  razaoSocial!: string;
  nomeFantasia?: string | null;
  cnpj!: string;
  email!: string;
  telefone?: string | null;
  ativo!: boolean;
  dataAtivacao!: Date;
  dataDesativacao?: Date | null;
  limiteTenants!: number;
  tenantCount!: number;
  usercreation!: number;
  datecreation!: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
