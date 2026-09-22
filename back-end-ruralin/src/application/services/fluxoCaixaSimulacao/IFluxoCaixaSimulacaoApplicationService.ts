import { CreateFluxoCaixaSimulacaoDto } from '../../dto/fluxoCaixaSimulacao/CreateFluxoCaixaSimulacaoDto';
import { CreateFluxoCaixaSimulacaoCompletoDto } from '../../dto/fluxoCaixaSimulacao/CreateFluxoCaixaSimulacaoCompletoDto';
import { UpdateFluxoCaixaSimulacaoDto } from '../../dto/fluxoCaixaSimulacao/UpdateFluxoCaixaSimulacaoDto';
import { FluxoCaixaSimulacaoItemSemIdDto } from '../../dto/fluxoCaixaSimulacao/FluxoCaixaSimulacaoItemSemIdDto';
import { FluxoCaixaSimulacaoResponseDto, FluxoCaixaSimulacaoDetailResponseDto } from '../../dto/fluxoCaixaSimulacao/FluxoCaixaSimulacaoResponseDto';
import { FluxoCaixaSimulacaoItemResponseDto } from '../../dto/fluxoCaixaSimulacao/FluxoCaixaSimulacaoItemResponseDto';
import { FluxoCaixaConsolidadoDto } from '../../dto/fluxoCaixa/FluxoCaixaConsolidadoDto';
import { FluxoCaixaQueryParams } from '../fluxoCaixa/IFluxoCaixaCalculadorService';

/**
 * Interface para o Application Service de FluxoCaixaSimulacao
 *
 * Gerencia o ciclo de vida de simulações de fluxo de caixa e seus itens
 * (master-detail), além do cálculo de resultados com overrides aplicados.
 */
export interface IFluxoCaixaSimulacaoApplicationService {
  // ──── CRUD Simulacao ────

  /**
   * Busca todas as simulações de um usuário em um tenant
   */
  findByUsuario(usuarioId: number, tenantId: number): Promise<FluxoCaixaSimulacaoResponseDto[]>;

  /**
   * Busca uma simulação pelo ID com seus itens incluídos
   */
  findById(id: number, tenantId: number): Promise<FluxoCaixaSimulacaoDetailResponseDto>;

  /**
   * Cria uma simulação sem itens
   */
  create(dto: CreateFluxoCaixaSimulacaoDto, tenantId: number, usuarioId: number): Promise<FluxoCaixaSimulacaoResponseDto>;

  /**
   * Cria uma simulação com itens em uma única transação (master-detail)
   */
  createCompleto(dto: CreateFluxoCaixaSimulacaoCompletoDto, tenantId: number, usuarioId: number): Promise<FluxoCaixaSimulacaoDetailResponseDto>;

  /**
   * Atualiza dados da simulação (RN-14: não permite atualização se arquivada)
   */
  update(id: number, dto: UpdateFluxoCaixaSimulacaoDto, tenantId: number): Promise<FluxoCaixaSimulacaoResponseDto>;

  /**
   * Remove uma simulação (RN-14: não permite remoção se arquivada)
   */
  delete(id: number, tenantId: number): Promise<void>;

  // ──── Items ────

  /**
   * Adiciona um item à simulação (RN-13: invalida resultado_snapshot)
   */
  addItem(simulacaoId: number, dto: FluxoCaixaSimulacaoItemSemIdDto, tenantId: number): Promise<FluxoCaixaSimulacaoItemResponseDto>;

  /**
   * Atualiza um item da simulação (RN-13: invalida resultado_snapshot)
   */
  updateItem(simulacaoId: number, itemId: number, dto: FluxoCaixaSimulacaoItemSemIdDto, tenantId: number): Promise<FluxoCaixaSimulacaoItemResponseDto>;

  /**
   * Remove um item da simulação (RN-13: invalida resultado_snapshot)
   */
  deleteItem(simulacaoId: number, itemId: number, tenantId: number): Promise<void>;

  // ──── Calculation ────

  /**
   * Calcula o resultado da simulação aplicando overrides ao fluxo de caixa projetado
   * e persiste o resultado_snapshot (RN-11, RN-12)
   */
  calcularResultado(simulacaoId: number, tenantId: number, queryParams?: FluxoCaixaQueryParams): Promise<FluxoCaixaConsolidadoDto>;
}
