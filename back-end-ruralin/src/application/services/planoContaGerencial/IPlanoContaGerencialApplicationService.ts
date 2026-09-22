import { PaginatedResult } from '../../../core/repository/types';
import { CreatePlanoContaGerencialDto } from '../../dto/planoContaGerencial/CreatePlanoContaGerencialDto';
import { UpdatePlanoContaGerencialDto } from '../../dto/planoContaGerencial/UpdatePlanoContaGerencialDto';
import { PlanoContaGerencialResponseDto } from '../../dto/planoContaGerencial/PlanoContaGerencialResponseDto';

/**
 * Interface para Application Service de PlanoContaGerencial
 */
export interface IPlanoContaGerencialApplicationService {
  /**
   * Lista todas as contas paginadas
   */
  list(page?: number, limit?: number): Promise<PaginatedResult<PlanoContaGerencialResponseDto>>;

  /**
   * Busca uma conta por ID
   */
  getById(id: number | string): Promise<PlanoContaGerencialResponseDto | null>;

  /**
   * Busca todas as contas de um nível específico
   */
  findByNivel(nivel: number): Promise<PlanoContaGerencialResponseDto[]>;

  /**
   * Busca todas as contas de um tipo específico
   */
  findByTipo(tipo: 'SINTETICA' | 'ANALITICA'): Promise<PlanoContaGerencialResponseDto[]>;

  /**
   * Busca todas as contas filhas de uma conta pai
   */
  findByContaPai(contaPaiId: number): Promise<PlanoContaGerencialResponseDto[]>;

  /**
   * Busca a árvore completa de contas a partir de uma conta raiz
   */
  findArvore(contaId: number): Promise<PlanoContaGerencialResponseDto | null>;

  /**
   * Busca contas por tipo de fluxo financeiro (RECEITA ou DESPESA)
   */
  findByTipoFluxo(tipoFluxo: 'RECEITA' | 'DESPESA', apenasAnaliticas?: boolean, apenasAtivas?: boolean): Promise<PlanoContaGerencialResponseDto[]>;

  /**
   * Cria uma nova conta
   */
  create(dto: CreatePlanoContaGerencialDto): Promise<PlanoContaGerencialResponseDto>;

  /**
   * Atualiza uma conta existente
   */
  update(id: number | string, dto: UpdatePlanoContaGerencialDto): Promise<PlanoContaGerencialResponseDto>;

  /**
   * Deleta uma conta
   */
  delete(id: number | string): Promise<boolean>;
}
