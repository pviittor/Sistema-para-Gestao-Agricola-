/**
 * RelatorioFinanceiroApplicationService - Application Service para Relatórios Financeiros
 * 
 * Contém a lógica de negócio para operações de relatórios financeiros, especialmente
 * o cálculo de Planejado vs Realizado.
 * 
 * Responsabilidades:
 * - Cálculo de valores planejados (rateios de títulos abertos/parciais)
 * - Cálculo de valores realizados (movimentos financeiros de parcelas baixadas)
 * - Agregação por Plano de Contas e Centro de Custo
 * - Cálculo de diferença e percentual de realização
 * - Aplicação de filtros (período, safra, fazenda, etc.)
 * 
 * @example
 * ```typescript
 * const service = container.resolve<IRelatorioFinanceiroApplicationService>(TYPES.IRelatorioFinanceiroApplicationService);
 * 
 * const relatorio = await service.calcularPlanejadoRealizado({
 *   dataInicio: '2024-01-01',
 *   dataFim: '2024-12-31',
 *   tipo: TipoTituloRelatorio.TODOS
 * });
 * ```
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IRelatorioFinanceiroApplicationService } from './IRelatorioFinanceiroApplicationService';
import { ITituloPagarRepository } from '../../../infrastructure/repository/ITituloPagarRepository';
import { ITituloReceberRepository } from '../../../infrastructure/repository/ITituloReceberRepository';
import { IRateioPlanoContaTituloPagarRepository } from '../../../infrastructure/repository/IRateioPlanoContaTituloPagarRepository';
import { IRateioPlanoContaTituloReceberRepository } from '../../../infrastructure/repository/IRateioPlanoContaTituloReceberRepository';
import { IRateioCentroCustoTituloPagarRepository } from '../../../infrastructure/repository/IRateioCentroCustoTituloPagarRepository';
import { IRateioCentroCustoTituloReceberRepository } from '../../../infrastructure/repository/IRateioCentroCustoTituloReceberRepository';
import { IMovimentoFinanceiroTituloPagarRepository } from '../../../infrastructure/repository/IMovimentoFinanceiroTituloPagarRepository';
import { IMovimentoFinanceiroTituloReceberRepository } from '../../../infrastructure/repository/IMovimentoFinanceiroTituloReceberRepository';
import { IPlanoContaGerencialRepository } from '../../../infrastructure/repository/IPlanoContaGerencialRepository';
import { ICentroCustoRepository } from '../../../infrastructure/repository/ICentroCustoRepository';
import { FiltroPlanejadoRealizadoDto, TipoTituloRelatorio } from '../../dto/relatorio/FiltroPlanejadoRealizadoDto';
import { PlanejadoRealizadoDto } from '../../dto/relatorio/PlanejadoRealizadoDto';
import { RequirePermission } from '../../../core/authorization';
import { Cacheable } from '../../../core/cache';
import { getRequestContext } from '../../../core/authorization/helpers';
import { ForbiddenException } from '../../../core/exceptions';
import { StatusTituloPagar } from '../../../models/TituloPagar';
import { StatusTituloReceber } from '../../../models/TituloReceber';
import TituloPagar from '../../../models/TituloPagar';
import TituloReceber from '../../../models/TituloReceber';
import RateioPlanoContaTituloPagar from '../../../models/RateioPlanoContaTituloPagar';
import RateioCentroCustoTituloPagar from '../../../models/RateioCentroCustoTituloPagar';
import RateioPlanoContaTituloReceber from '../../../models/RateioPlanoContaTituloReceber';
import RateioCentroCustoTituloReceber from '../../../models/RateioCentroCustoTituloReceber';
import MovimentoFinanceiroTituloPagar from '../../../models/MovimentoFinanceiroTituloPagar';
import MovimentoFinanceiroTituloReceber from '../../../models/MovimentoFinanceiroTituloReceber';

/**
 * Interface auxiliar para agregação de valores planejados
 */
interface AgregacaoPlanejado {
  idPlanoContaGerencial: number;
  idCentroCusto: number;
  valorPlanejado: number;
  itemPlanoConta?: string;
  descricaoPlanoConta?: string;
  codigoCentroCusto?: string;
  nomeCentroCusto?: string;
  idSafra?: number;
  nomeSafra?: string;
}

/**
 * Interface auxiliar para agregação de valores realizados
 */
interface AgregacaoRealizado {
  idPlanoContaGerencial: number;
  idCentroCusto: number;
  valorRealizado: number;
}

/**
 * Application Service para Relatórios Financeiros
 * 
 * Implementa lógica de negócio para operações de relatórios financeiros, usando
 * repositórios para acesso a dados e cálculos agregados.
 */
@Injectable()
export class RelatorioFinanceiroApplicationService implements IRelatorioFinanceiroApplicationService {
  constructor(
    @Inject(TYPES.ITituloPagarRepository)
    private tituloPagarRepository: ITituloPagarRepository,
    @Inject(TYPES.ITituloReceberRepository)
    private tituloReceberRepository: ITituloReceberRepository,
    @Inject(TYPES.IRateioPlanoContaTituloPagarRepository)
    private rateioPlanoContaTituloPagarRepository: IRateioPlanoContaTituloPagarRepository,
    @Inject(TYPES.IRateioPlanoContaTituloReceberRepository)
    private rateioPlanoContaTituloReceberRepository: IRateioPlanoContaTituloReceberRepository,
    @Inject(TYPES.IRateioCentroCustoTituloPagarRepository)
    private rateioCentroCustoTituloPagarRepository: IRateioCentroCustoTituloPagarRepository,
    @Inject(TYPES.IRateioCentroCustoTituloReceberRepository)
    private rateioCentroCustoTituloReceberRepository: IRateioCentroCustoTituloReceberRepository,
    @Inject(TYPES.IMovimentoFinanceiroTituloPagarRepository)
    private movimentoFinanceiroTituloPagarRepository: IMovimentoFinanceiroTituloPagarRepository,
    @Inject(TYPES.IMovimentoFinanceiroTituloReceberRepository)
    private movimentoFinanceiroTituloReceberRepository: IMovimentoFinanceiroTituloReceberRepository,
    @Inject(TYPES.IPlanoContaGerencialRepository)
    private planoContaGerencialRepository: IPlanoContaGerencialRepository,
    @Inject(TYPES.ICentroCustoRepository)
    private centroCustoRepository: ICentroCustoRepository
  ) {}

  /**
   * Calcula e retorna relatório de Planejado vs Realizado
   * 
   * Implementa cálculo conforme especificação:
   * - Planejado: Soma dos rateios de títulos com status ABERTO ou PARCIAL
   * - Realizado: Soma dos movimentos financeiros de parcelas baixadas
   * - Agrupa por Plano de Contas × Centro de Custo
   * 
   * @param filtros - DTO com filtros do relatório
   * @returns Promise que resolve com array de DTOs agrupados por PC × CC
   * @throws ForbiddenException se usuário não tiver permissão 'financeiro.relatorio.planejadoRealizado'
   */
  @RequirePermission('financeiro.relatorio.planejadoRealizado')
  @Cacheable('relatorioFinanceiro:planejadoRealizado:{0}', 300)
  async calcularPlanejadoRealizado(filtros: FiltroPlanejadoRealizadoDto): Promise<PlanejadoRealizadoDto[]> {
    // Obter tenantId do contexto
    const context = getRequestContext();
    if (!context || !context.getTenantId()) {
      throw new ForbiddenException(
        'Tenant não identificado. Não é possível calcular relatório sem tenantId.',
        'TENANT_NOT_IDENTIFIED'
      );
    }
    const tenantId = context.getTenantId()!;

    // Converter datas
    const dataInicio = new Date(filtros.dataInicio);
    const dataFim = new Date(filtros.dataFim);
    dataFim.setHours(23, 59, 59, 999); // Incluir todo o dia final

    // Calcular planejado e realizado
    const planejado = await this.calcularPlanejado(filtros, dataInicio, dataFim, tenantId);
    const realizado = await this.calcularRealizado(filtros, dataInicio, dataFim, tenantId);

    // Combinar resultados
    const resultado = this.combinarPlanejadoRealizado(planejado, realizado, filtros);

    return resultado;
  }

  /**
   * Calcula valores planejados (rateios de títulos abertos/parciais)
   * 
   * @param filtros - Filtros do relatório
   * @param dataInicio - Data inicial do período
   * @param dataFim - Data final do período
   * @param tenantId - ID do tenant
   * @returns Promise que resolve com mapa de agregações planejadas
   */
  private async calcularPlanejado(
    filtros: FiltroPlanejadoRealizadoDto,
    dataInicio: Date,
    dataFim: Date,
    tenantId: number
  ): Promise<Map<string, AgregacaoPlanejado>> {
    const agregacoes = new Map<string, AgregacaoPlanejado>();

    // Determinar quais tipos processar
    const processarPagar = filtros.tipo === TipoTituloRelatorio.TODOS || filtros.tipo === TipoTituloRelatorio.PAGAR || !filtros.tipo;
    const processarReceber = filtros.tipo === TipoTituloRelatorio.TODOS || filtros.tipo === TipoTituloRelatorio.RECEBER || !filtros.tipo;

    // Processar títulos a pagar
    if (processarPagar) {
      const titulosPagar = await this.buscarTitulosPagarParaPlanejado(filtros, dataInicio, dataFim);
      
      for (const titulo of titulosPagar) {
        // Buscar rateios do título
        const rateiosPC = await this.rateioPlanoContaTituloPagarRepository.findByTituloPagar(titulo.id);
        const rateiosCC = await this.rateioCentroCustoTituloPagarRepository.findByTituloPagar(titulo.id);

        // Combinar rateios (PC × CC)
        for (const rateioPC of rateiosPC) {
          for (const rateioCC of rateiosCC) {
            const chave = `${rateioPC.idPlanoContaGerencial}_${rateioCC.idCentroCusto}`;
            
            // Calcular valor planejado proporcional
            // Para cada combinação PC × CC, o valor planejado é calculado como:
            // valorPlanejado = valorTitulo × (percentualRateioPC / 100) × (percentualRateioCC / 100)
            const valorTitulo = Number(titulo.valorTitulo);
            const percentualPC = Number(rateioPC.percentualRateio) / 100;
            const percentualCC = Number(rateioCC.percentualRateio) / 100;
            const valorPlanejado = valorTitulo * percentualPC * percentualCC;

            if (agregacoes.has(chave)) {
              agregacoes.get(chave)!.valorPlanejado += valorPlanejado;
            } else {
              agregacoes.set(chave, {
                idPlanoContaGerencial: rateioPC.idPlanoContaGerencial,
                idCentroCusto: rateioCC.idCentroCusto,
                valorPlanejado: valorPlanejado,
                idSafra: titulo.idSafra,
              });
            }
          }
        }
      }
    }

    // Processar títulos a receber
    if (processarReceber) {
      const titulosReceber = await this.buscarTitulosReceberParaPlanejado(filtros, dataInicio, dataFim);
      
      for (const titulo of titulosReceber) {
        // Buscar rateios do título
        const rateiosPC = await this.rateioPlanoContaTituloReceberRepository.findByTituloReceber(titulo.id);
        const rateiosCC = await this.rateioCentroCustoTituloReceberRepository.findByTituloReceber(titulo.id);

        // Combinar rateios (PC × CC)
        for (const rateioPC of rateiosPC) {
          for (const rateioCC of rateiosCC) {
            const chave = `${rateioPC.idPlanoContaGerencial}_${rateioCC.idCentroCusto}`;
            
            // Calcular valor planejado proporcional
            const valorTitulo = Number(titulo.valorTitulo);
            const percentualCC = Number(rateioCC.percentualRateio) / 100;
            const valorPlanejado = Number(rateioPC.valorRateio) * percentualCC;

            if (agregacoes.has(chave)) {
              agregacoes.get(chave)!.valorPlanejado += valorPlanejado;
            } else {
              agregacoes.set(chave, {
                idPlanoContaGerencial: rateioPC.idPlanoContaGerencial,
                idCentroCusto: rateioCC.idCentroCusto,
                valorPlanejado: valorPlanejado,
                idSafra: titulo.idSafra,
              });
            }
          }
        }
      }
    }

    return agregacoes;
  }

  /**
   * Calcula valores realizados (movimentos financeiros de parcelas baixadas)
   * 
   * @param filtros - Filtros do relatório
   * @param dataInicio - Data inicial do período
   * @param dataFim - Data final do período
   * @param tenantId - ID do tenant
   * @returns Promise que resolve com mapa de agregações realizadas
   */
  private async calcularRealizado(
    filtros: FiltroPlanejadoRealizadoDto,
    dataInicio: Date,
    dataFim: Date,
    tenantId: number
  ): Promise<Map<string, AgregacaoRealizado>> {
    const agregacoes = new Map<string, AgregacaoRealizado>();

    // Determinar quais tipos processar
    const processarPagar = filtros.tipo === TipoTituloRelatorio.TODOS || filtros.tipo === TipoTituloRelatorio.PAGAR || !filtros.tipo;
    const processarReceber = filtros.tipo === TipoTituloRelatorio.TODOS || filtros.tipo === TipoTituloRelatorio.RECEBER || !filtros.tipo;

    // Processar movimentos de títulos a pagar
    if (processarPagar) {
      const movimentosPagar = await this.movimentoFinanceiroTituloPagarRepository.findByDataMovimento(dataInicio, dataFim);
      
      // Aplicar filtros adicionais
      let movimentosFiltrados = movimentosPagar;
      
      if (filtros.idPlanoContaGerencial) {
        movimentosFiltrados = movimentosFiltrados.filter(m => m.idPlanoContaGerencial === filtros.idPlanoContaGerencial);
      }
      
      if (filtros.idCentroCusto) {
        movimentosFiltrados = movimentosFiltrados.filter(m => m.idCentroCusto === filtros.idCentroCusto);
      }

      // Agrupar por PC × CC
      for (const movimento of movimentosFiltrados) {
        const chave = `${movimento.idPlanoContaGerencial}_${movimento.idCentroCusto}`;
        const valorMovimento = Number(movimento.valorMovimento);

        if (agregacoes.has(chave)) {
          agregacoes.get(chave)!.valorRealizado += valorMovimento;
        } else {
          agregacoes.set(chave, {
            idPlanoContaGerencial: movimento.idPlanoContaGerencial,
            idCentroCusto: movimento.idCentroCusto,
            valorRealizado: valorMovimento,
          });
        }
      }
    }

    // Processar movimentos de títulos a receber
    if (processarReceber) {
      const movimentosReceber = await this.movimentoFinanceiroTituloReceberRepository.findByDataMovimento(dataInicio, dataFim);
      
      // Aplicar filtros adicionais
      let movimentosFiltrados = movimentosReceber;
      
      if (filtros.idPlanoContaGerencial) {
        movimentosFiltrados = movimentosFiltrados.filter(m => m.idPlanoContaGerencial === filtros.idPlanoContaGerencial);
      }
      
      if (filtros.idCentroCusto) {
        movimentosFiltrados = movimentosFiltrados.filter(m => m.idCentroCusto === filtros.idCentroCusto);
      }

      // Agrupar por PC × CC
      for (const movimento of movimentosFiltrados) {
        const chave = `${movimento.idPlanoContaGerencial}_${movimento.idCentroCusto}`;
        const valorMovimento = Number(movimento.valorMovimento);

        if (agregacoes.has(chave)) {
          agregacoes.get(chave)!.valorRealizado += valorMovimento;
        } else {
          agregacoes.set(chave, {
            idPlanoContaGerencial: movimento.idPlanoContaGerencial,
            idCentroCusto: movimento.idCentroCusto,
            valorRealizado: valorMovimento,
          });
        }
      }
    }

    return agregacoes;
  }

  /**
   * Busca títulos a pagar para cálculo de planejado
   * 
   * @param filtros - Filtros do relatório
   * @param dataInicio - Data inicial
   * @param dataFim - Data final
   * @returns Promise que resolve com array de títulos
   */
  private async buscarTitulosPagarParaPlanejado(
    filtros: FiltroPlanejadoRealizadoDto,
    dataInicio: Date,
    dataFim: Date
  ): Promise<TituloPagar[]> {
    // Buscar títulos por data de lançamento no período
    let titulos = await this.tituloPagarRepository.findByDataLancamento(dataInicio, dataFim);

    // Filtrar por status (apenas ABERTO ou PARCIAL)
    titulos = titulos.filter(t => 
      t.status === StatusTituloPagar.ABERTO || t.status === StatusTituloPagar.PARCIAL
    );

    // Aplicar filtros adicionais
    if (filtros.idSafra) {
      titulos = titulos.filter(t => t.idSafra === filtros.idSafra);
    }

    if (filtros.idFazenda) {
      titulos = titulos.filter(t => t.idFazenda === filtros.idFazenda);
    }

    return titulos;
  }

  /**
   * Busca títulos a receber para cálculo de planejado
   * 
   * @param filtros - Filtros do relatório
   * @param dataInicio - Data inicial
   * @param dataFim - Data final
   * @returns Promise que resolve com array de títulos
   */
  private async buscarTitulosReceberParaPlanejado(
    filtros: FiltroPlanejadoRealizadoDto,
    dataInicio: Date,
    dataFim: Date
  ): Promise<TituloReceber[]> {
    // Buscar títulos por data de lançamento no período
    let titulos = await this.tituloReceberRepository.findByDataLancamento(dataInicio, dataFim);

    // Filtrar por status (apenas ABERTO ou PARCIAL)
    titulos = titulos.filter(t => 
      t.status === StatusTituloReceber.ABERTO || t.status === StatusTituloReceber.PARCIAL
    );

    // Aplicar filtros adicionais
    if (filtros.idSafra) {
      titulos = titulos.filter(t => t.idSafra === filtros.idSafra);
    }

    if (filtros.idFazenda) {
      titulos = titulos.filter(t => t.idFazenda === filtros.idFazenda);
    }

    return titulos;
  }

  /**
   * Combina resultados de planejado e realizado em DTOs finais
   * 
   * @param planejado - Mapa de agregações planejadas
   * @param realizado - Mapa de agregações realizadas
   * @param filtros - Filtros do relatório
   * @returns Array de DTOs combinados
   */
  private async combinarPlanejadoRealizado(
    planejado: Map<string, AgregacaoPlanejado>,
    realizado: Map<string, AgregacaoRealizado>,
    filtros: FiltroPlanejadoRealizadoDto
  ): Promise<PlanejadoRealizadoDto[]> {
    const resultado: PlanejadoRealizadoDto[] = [];
    const chavesProcessadas = new Set<string>();

    // Processar todas as chaves de planejado e realizado
    const todasChaves = new Set([...planejado.keys(), ...realizado.keys()]);

    for (const chave of todasChaves) {
      if (chavesProcessadas.has(chave)) continue;
      chavesProcessadas.add(chave);

      const agregacaoPlanejado = planejado.get(chave);
      const agregacaoRealizado = realizado.get(chave);

      const valorPlanejado = agregacaoPlanejado?.valorPlanejado || 0;
      const valorRealizado = agregacaoRealizado?.valorRealizado || 0;
      const diferenca = valorRealizado - valorPlanejado;
      const percentualRealizacao = valorPlanejado > 0 
        ? (valorRealizado / valorPlanejado) * 100 
        : 0;

      // Buscar informações do plano de contas e centro de custo
      const idPlanoConta = agregacaoPlanejado?.idPlanoContaGerencial || agregacaoRealizado?.idPlanoContaGerencial!;
      const idCentroCusto = agregacaoPlanejado?.idCentroCusto || agregacaoRealizado?.idCentroCusto!;

      const planoConta = await this.planoContaGerencialRepository.findById(idPlanoConta);
      const centroCusto = await this.centroCustoRepository.findById(idCentroCusto);

      const dto: PlanejadoRealizadoDto = {
        idPlanoContaGerencial: idPlanoConta,
        itemPlanoConta: planoConta?.item || '',
        descricaoPlanoConta: planoConta?.descricao || '',
        idCentroCusto: idCentroCusto,
        codigoCentroCusto: centroCusto?.codigo || '',
        nomeCentroCusto: centroCusto?.nome || '',
        valorPlanejado: Number(valorPlanejado.toFixed(2)),
        valorRealizado: Number(valorRealizado.toFixed(2)),
        diferenca: Number(diferenca.toFixed(2)),
        percentualRealizacao: Number(percentualRealizacao.toFixed(2)),
        idSafra: agregacaoPlanejado?.idSafra,
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
      };

      // Buscar nome da safra se disponível
      if (dto.idSafra) {
        // Nota: Assumindo que existe um repositório de Safra
        // Se não existir, pode ser null ou buscar de outra forma
        // dto.nomeSafra = safra?.nome;
      }

      resultado.push(dto);
    }

    // Ordenar por plano de contas e centro de custo
    resultado.sort((a, b) => {
      if (a.itemPlanoConta !== b.itemPlanoConta) {
        return a.itemPlanoConta.localeCompare(b.itemPlanoConta);
      }
      return a.codigoCentroCusto.localeCompare(b.codigoCentroCusto);
    });

    return resultado;
  }
}
