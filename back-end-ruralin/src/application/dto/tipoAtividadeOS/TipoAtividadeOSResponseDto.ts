import { CategoriaAtividadeOS } from '../../../models/enums/OrdemServicoEnums';
import { TipoCampoCondicional } from '../../../models/enums/OrdemServicoEnums';

/**
 * CampoCondicionalResponseDto - DTO de resposta para campo condicional
 */
export interface CampoCondicionalResponseDto {
  id: number;
  nomeCampo: string;
  rotulo: string;
  tipoCampo: TipoCampoCondicional;
  obrigatorio: boolean;
  opcoes: any[] | null;
  unidade: string | null;
  ordem: number;
  ativo: boolean;
}

/**
 * TipoAtividadeOSResponseDto - DTO de resposta para tipo de atividade de OS
 */
export interface TipoAtividadeOSResponseDto {
  id: number;
  tenantId: number;
  nome: string;
  descricao: string | null;
  categoria: CategoriaAtividadeOS;
  icone: string | null;
  cor: string | null;
  ativo: boolean;
  planoContaIdPadrao: number | null;
  centroCustoIdPadrao: number | null;
  camposCondicionais: CampoCondicionalResponseDto[];
  createdAt?: Date;
  updatedAt?: Date;
}
