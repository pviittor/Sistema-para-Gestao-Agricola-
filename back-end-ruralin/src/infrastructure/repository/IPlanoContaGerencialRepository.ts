import { IRepository } from '../../core/repository/IRepository';
import PlanoContaGerencial from '../../models/PlanoContaGerencial';

/**
 * Interface para repositório de PlanoContaGerencial
 */
export interface IPlanoContaGerencialRepository extends IRepository<PlanoContaGerencial> {
  /**
   * Busca todas as contas de um nível específico
   */
  findByNivel(nivel: number): Promise<PlanoContaGerencial[]>;

  /**
   * Busca todas as contas de um tipo específico
   */
  findByTipo(tipo: 'SINTETICA' | 'ANALITICA'): Promise<PlanoContaGerencial[]>;

  /**
   * Busca todas as contas filhas de uma conta pai
   */
  findByContaPai(contaPaiId: number): Promise<PlanoContaGerencial[]>;

  /**
   * Busca a árvore completa de contas a partir de uma conta raiz
   */
  findArvore(contaId: number): Promise<PlanoContaGerencial | null>;

  /**
   * Busca contas por tipo de fluxo financeiro (RECEITA ou DESPESA)
   * Opcionalmente filtra apenas contas analíticas e/ou ativas
   */
  findByTipoFluxo(tipoFluxo: 'RECEITA' | 'DESPESA', apenasAnaliticas?: boolean, apenasAtivas?: boolean): Promise<PlanoContaGerencial[]>;
}
