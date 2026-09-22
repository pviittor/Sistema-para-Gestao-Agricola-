import { TipoConta } from '../../../models/Conta';

/**
 * ContaResponseDto - DTO para resposta de conta
 * 
 * DTO usado nas respostas da API para conta.
 */
export class ContaResponseDto {
  id!: number;
  tenantId!: number;
  bancoId!: number;
  nome!: string;
  agencia?: string | null;
  conta?: string | null;
  tipo!: TipoConta;
  saldoInicial!: number;
  ativo!: boolean;
  usercreation!: number;
  datecreation!: Date;
  
  // Relacionamentos opcionais
  banco?: {
    id: number;
    codigo: string;
    nome: string;
  } | null;
  
  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}
