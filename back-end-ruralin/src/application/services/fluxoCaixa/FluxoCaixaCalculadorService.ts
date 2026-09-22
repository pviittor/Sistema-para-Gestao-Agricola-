/**
 * FluxoCaixaCalculadorService — Serviço de cálculo do fluxo de caixa consolidado
 *
 * Serviço puramente computacional que NUNCA persiste dados.
 * Consulta múltiplas fontes de dados em paralelo (parcelas a pagar/receber,
 * agreements, outras despesas/receitas), agrega por periodicidade e gera alertas.
 */

import { Op } from 'sequelize';
import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IFluxoCaixaCalculadorService, FluxoCaixaQueryParams } from './IFluxoCaixaCalculadorService';
import { IParcelaTituloPagarRepository } from '../../../infrastructure/repository/IParcelaTituloPagarRepository';
import { IParcelaTituloReceberRepository } from '../../../infrastructure/repository/IParcelaTituloReceberRepository';
import { IContaRepository } from '../../../infrastructure/repository/IContaRepository';
import { ISafraRepository } from '../../../infrastructure/repository/ISafraRepository';
import { IFluxoCaixaConfiguracaoRepository } from '../../../infrastructure/repository/IFluxoCaixaConfiguracaoRepository';
import type {
  FluxoCaixaConsolidadoDto,
  FluxoCaixaEntryDto,
  FluxoCaixaPeriodoDto,
  FluxoCaixaSaldoContaDto,
  FluxoCaixaAlertaDto,
} from '../../dto/fluxoCaixa';
import ParcelaTituloPagar, { StatusParcela as StatusParcelaPagar } from '../../../models/ParcelaTituloPagar';
import ParcelaTituloReceber, { StatusParcela as StatusParcelaReceber } from '../../../models/ParcelaTituloReceber';
import AgreementPaymentSchedule from '../../../models/AgreementPaymentSchedule';
import OutraDespesaReceita from '../../../models/OutraDespesaReceita';
import TituloPagar from '../../../models/TituloPagar';
import TituloReceber from '../../../models/TituloReceber';
import Conta from '../../../models/Conta';
import Safra from '../../../models/Safra';
import PlanoContaGerencial from '../../../models/PlanoContaGerencial';

/**
 * Configuração padrão quando o tenant não tem configuração salva
 */
const CONFIG_PADRAO = {
  saldoMinimoAlerta: 0,
  diasProjecaoPadrao: 90,
  periodicidadePadrao: 'mensal',
  incluirAgreements: true,
  incluirTitulos: true,
  incluirRecorrentes: true,
};

@Injectable()
export class FluxoCaixaCalculadorService implements IFluxoCaixaCalculadorService {
  constructor(
    @Inject(TYPES.IParcelaTituloPagarRepository) private parcelaPagarRepo: IParcelaTituloPagarRepository,
    @Inject(TYPES.IParcelaTituloReceberRepository) private parcelaReceberRepo: IParcelaTituloReceberRepository,
    @Inject(TYPES.IContaRepository) private contaRepo: IContaRepository,
    @Inject(TYPES.ISafraRepository) private safraRepo: ISafraRepository,
    @Inject(TYPES.IFluxoCaixaConfiguracaoRepository) private configRepo: IFluxoCaixaConfiguracaoRepository,
  ) {}

  // ============================================================================
  // Métodos públicos
  // ============================================================================

  /**
   * Calcula o fluxo de caixa consolidado (realizado + projetado)
   */
  async calcularConsolidado(tenantId: number, params: FluxoCaixaQueryParams): Promise<FluxoCaixaConsolidadoDto> {
    return this.calcularInterno(tenantId, params, 'consolidado');
  }

  /**
   * Calcula apenas os lançamentos realizados
   */
  async calcularRealizado(tenantId: number, params: FluxoCaixaQueryParams): Promise<FluxoCaixaConsolidadoDto> {
    return this.calcularInterno(tenantId, params, 'realizado');
  }

  /**
   * Calcula apenas os lançamentos projetados
   */
  async calcularProjetado(tenantId: number, params: FluxoCaixaQueryParams): Promise<FluxoCaixaConsolidadoDto> {
    return this.calcularInterno(tenantId, params, 'projetado');
  }

  // ============================================================================
  // Orquestração principal
  // ============================================================================

  /**
   * Método interno que orquestra todo o cálculo do fluxo de caixa
   */
  private async calcularInterno(
    tenantId: number,
    params: FluxoCaixaQueryParams,
    modo: 'consolidado' | 'realizado' | 'projetado',
  ): Promise<FluxoCaixaConsolidadoDto> {
    const { dataInicio, dataFim, periodicidade, contaBancariaIds } = params;

    // 1. Carregar configuração do tenant e safras em paralelo
    const [config, safras] = await Promise.all([
      this.carregarConfiguracao(tenantId, params),
      periodicidade === 'safra' ? this.carregarSafras(tenantId) : Promise.resolve([]),
    ]);

    // 2. Coletar todas as entradas de todas as fontes em paralelo
    const todasEntradas = await this.coletarEntradas(tenantId, dataInicio, dataFim, config);

    // 3. Filtrar por modo (consolidado inclui tudo)
    const entradasFiltradas = this.filtrarPorModo(todasEntradas, modo);

    // 4. Filtrar por contas bancárias se especificado
    const entradasFinais = this.filtrarPorContaBancaria(entradasFiltradas, contaBancariaIds);

    // 5. Calcular saldo inicial (realizados antes do período)
    const saldoInicial = await this.calcularSaldoInicial(tenantId, dataInicio, contaBancariaIds);

    // 6. Agrupar por periodicidade
    const periodos = this.agruparPorPeriodicidade(entradasFinais, periodicidade, dataInicio, dataFim, safras);

    // 7. Calcular saldo acumulado por período
    this.calcularSaldoAcumulado(periodos, saldoInicial);

    // 8. Calcular saldos por conta bancária
    const saldosPorConta = await this.calcularSaldosPorConta(tenantId, entradasFinais, contaBancariaIds);

    // 9. Gerar alertas
    const alertas = this.gerarAlertas(periodos, saldosPorConta, config.saldoMinimoAlerta);

    // 10. Calcular totais gerais
    const totalEntradas = entradasFinais
      .filter(e => e.tipoFluxo === 'entrada')
      .reduce((sum, e) => sum + e.valor, 0);
    const totalSaidas = entradasFinais
      .filter(e => e.tipoFluxo === 'saida')
      .reduce((sum, e) => sum + e.valor, 0);

    const saldoFinal = periodos.length > 0
      ? periodos[periodos.length - 1].saldoAcumulado
      : saldoInicial;

    return {
      periodicidade,
      dataInicio,
      dataFim,
      saldoInicial,
      saldoFinal,
      totalEntradas,
      totalSaidas,
      periodos,
      saldosPorConta,
      alertas,
    };
  }

  // ============================================================================
  // Coleta de dados (fontes paralelas)
  // ============================================================================

  /**
   * Coleta lançamentos de todas as fontes de dados em paralelo
   */
  private async coletarEntradas(
    tenantId: number,
    dataInicio: string,
    dataFim: string,
    config: { incluirTitulos: boolean; incluirAgreements: boolean },
  ): Promise<FluxoCaixaEntryDto[]> {
    const promises: Promise<FluxoCaixaEntryDto[]>[] = [];

    if (config.incluirTitulos) {
      promises.push(this.queryParcelasPagar(tenantId, dataInicio, dataFim));
      promises.push(this.queryParcelasReceber(tenantId, dataInicio, dataFim));
    }

    if (config.incluirAgreements) {
      promises.push(this.queryAgreements(tenantId, dataInicio, dataFim));
    }

    // OutraDespesaReceita sempre é incluída (DA-06: apenas realizados)
    promises.push(this.queryOutrasDespesasReceitas(tenantId, dataInicio, dataFim));

    const resultados = await Promise.all(promises);
    return resultados.flat();
  }

  /**
   * Consulta parcelas de títulos a pagar
   * - ABERTA/PARCIAL → projetado (usa dataVencimento)
   * - BAIXADA → realizado (usa dataBaixa)
   */
  private async queryParcelasPagar(
    tenantId: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<FluxoCaixaEntryDto[]> {
    const parcelas = await ParcelaTituloPagar.findAll({
      where: {
        tenantId,
        status: {
          [Op.in]: [StatusParcelaPagar.ABERTA, StatusParcelaPagar.PARCIAL, StatusParcelaPagar.BAIXADA],
        },
        [Op.or]: [
          // Projetadas: dataVencimento no intervalo
          {
            status: { [Op.in]: [StatusParcelaPagar.ABERTA, StatusParcelaPagar.PARCIAL] },
            dataVencimento: { [Op.between]: [dataInicio, dataFim] },
          },
          // Realizadas: dataBaixa no intervalo
          {
            status: StatusParcelaPagar.BAIXADA,
            dataBaixa: { [Op.between]: [dataInicio, dataFim] },
          },
        ],
      },
      include: [
        {
          model: TituloPagar,
          as: 'tituloPagar',
          attributes: ['id', 'numeroTitulo', 'contaBancariaId'],
          include: [
            {
              model: Conta,
              as: 'contaBancaria',
              attributes: ['id', 'nome'],
              required: false,
            },
          ],
        },
      ],
      order: [['dataVencimento', 'ASC']],
    });

    return parcelas.map(parcela => {
      const tituloPagar = (parcela as any).tituloPagar;
      const contaBancaria = tituloPagar?.contaBancaria;
      const isRealizado = parcela.status === StatusParcelaPagar.BAIXADA;

      return {
        tipoFluxo: 'saida',
        origem: 'titulo_pagar',
        origemId: parcela.id,
        descricao: `Parcela ${parcela.numeroParcela}/${parcela.numeroTotalParcelas} - ${tituloPagar?.numeroTitulo || 'S/N'}`,
        data: isRealizado
          ? this.formatarData(parcela.dataBaixa!)
          : this.formatarData(parcela.dataVencimento),
        valor: isRealizado
          ? Number(parcela.valorBaixa ?? parcela.valorPago ?? parcela.valorParcela ?? 0)
          : Number(parcela.valorSaldo || parcela.valorParcela || 0),
        contaBancariaId: tituloPagar?.contaBancariaId ?? parcela.idConta ?? null,
        contaBancariaNome: contaBancaria?.nome ?? null,
        realizado: isRealizado,
        planoContaId: null,
        planoContaNome: null,
      };
    });
  }

  /**
   * Consulta parcelas de títulos a receber
   * - ABERTA/PARCIAL → projetado (usa dataVencimento)
   * - BAIXADA → realizado (usa dataBaixa)
   */
  private async queryParcelasReceber(
    tenantId: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<FluxoCaixaEntryDto[]> {
    const parcelas = await ParcelaTituloReceber.findAll({
      where: {
        tenantId,
        status: {
          [Op.in]: [StatusParcelaReceber.ABERTA, StatusParcelaReceber.PARCIAL, StatusParcelaReceber.BAIXADA],
        },
        [Op.or]: [
          {
            status: { [Op.in]: [StatusParcelaReceber.ABERTA, StatusParcelaReceber.PARCIAL] },
            dataVencimento: { [Op.between]: [dataInicio, dataFim] },
          },
          {
            status: StatusParcelaReceber.BAIXADA,
            dataBaixa: { [Op.between]: [dataInicio, dataFim] },
          },
        ],
      },
      include: [
        {
          model: TituloReceber,
          as: 'tituloReceber',
          attributes: ['id', 'numeroTitulo', 'contaBancariaId'],
          include: [
            {
              model: Conta,
              as: 'contaBancaria',
              attributes: ['id', 'nome'],
              required: false,
            },
          ],
        },
      ],
      order: [['dataVencimento', 'ASC']],
    });

    return parcelas.map(parcela => {
      const tituloReceber = (parcela as any).tituloReceber;
      const contaBancaria = tituloReceber?.contaBancaria;
      const isRealizado = parcela.status === StatusParcelaReceber.BAIXADA;

      return {
        tipoFluxo: 'entrada',
        origem: 'titulo_receber',
        origemId: parcela.id,
        descricao: `Parcela ${parcela.numeroParcela}/${parcela.numeroTotalParcelas} - ${tituloReceber?.numeroTitulo || 'S/N'}`,
        data: isRealizado
          ? this.formatarData(parcela.dataBaixa!)
          : this.formatarData(parcela.dataVencimento),
        valor: isRealizado
          ? Number(parcela.valorBaixa ?? parcela.valorPago ?? parcela.valorParcela ?? 0)
          : Number(parcela.valorSaldo || parcela.valorParcela || 0),
        contaBancariaId: tituloReceber?.contaBancariaId ?? parcela.idConta ?? null,
        contaBancariaNome: contaBancaria?.nome ?? null,
        realizado: isRealizado,
        planoContaId: null,
        planoContaNome: null,
      };
    });
  }

  /**
   * Consulta cronogramas de pagamento de agreements (contratos de arrendamento)
   * - status 'pendente' → projetado (entrada)
   * - status 'liquidado' → realizado (entrada)
   */
  private async queryAgreements(
    tenantId: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<FluxoCaixaEntryDto[]> {
    const schedules = await AgreementPaymentSchedule.findAll({
      where: {
        tenantId,
        startDate: { [Op.between]: [dataInicio, dataFim] },
        status: { [Op.in]: ['pendente', 'liquidado'] },
      },
      order: [['startDate', 'ASC']],
    });

    return schedules.map(schedule => {
      const isRealizado = schedule.status === 'liquidado';
      return {
        tipoFluxo: 'entrada',
        origem: 'agreement',
        origemId: schedule.id,
        descricao: `Agreement #${schedule.agreementId} - Pagamento`,
        data: isRealizado && schedule.dataLiquidacao
          ? schedule.dataLiquidacao
          : schedule.startDate,
        valor: schedule.amount,
        contaBancariaId: null,
        contaBancariaNome: null,
        realizado: isRealizado,
        planoContaId: null,
        planoContaNome: null,
      };
    });
  }

  /**
   * Consulta outras despesas e receitas (DA-06: sempre realizado)
   * - tipo RECEITA → entrada
   * - tipo DESPESA → saída
   */
  private async queryOutrasDespesasReceitas(
    tenantId: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<FluxoCaixaEntryDto[]> {
    const registros = await OutraDespesaReceita.findAll({
      where: {
        tenantId,
        dataMovimento: { [Op.between]: [dataInicio, dataFim] },
      },
      include: [
        {
          model: PlanoContaGerencial,
          as: 'planoGerencial',
          attributes: ['id', 'descricao'],
          required: false,
        },
      ],
      order: [['dataMovimento', 'ASC']],
    });

    return registros.map(registro => {
      const plano = (registro as any).planoGerencial;
      return {
        tipoFluxo: registro.tipo === 'RECEITA' ? 'entrada' : 'saida',
        origem: 'outra_despesa_receita',
        origemId: registro.id,
        descricao: `${registro.tipo === 'RECEITA' ? 'Receita' : 'Despesa'} - ${plano?.descricao || 'Sem classificação'}`,
        data: registro.dataMovimento,
        valor: registro.valor,
        contaBancariaId: null,
        contaBancariaNome: null,
        realizado: true, // OutraDespesaReceita é sempre realizado (DA-06)
        planoContaId: plano?.id ?? null,
        planoContaNome: plano?.descricao ?? null,
      };
    });
  }

  // ============================================================================
  // Filtros
  // ============================================================================

  /**
   * Filtra lançamentos por modo (consolidado, realizado ou projetado)
   */
  private filtrarPorModo(
    entradas: FluxoCaixaEntryDto[],
    modo: 'consolidado' | 'realizado' | 'projetado',
  ): FluxoCaixaEntryDto[] {
    if (modo === 'consolidado') return entradas;
    if (modo === 'realizado') return entradas.filter(e => e.realizado);
    return entradas.filter(e => !e.realizado);
  }

  /**
   * Filtra lançamentos por contas bancárias
   * Lançamentos sem contaBancariaId são sempre incluídos
   */
  private filtrarPorContaBancaria(
    entradas: FluxoCaixaEntryDto[],
    contaBancariaIds?: number[],
  ): FluxoCaixaEntryDto[] {
    if (!contaBancariaIds || contaBancariaIds.length === 0) return entradas;
    return entradas.filter(
      e => e.contaBancariaId === null || contaBancariaIds.includes(e.contaBancariaId),
    );
  }

  // ============================================================================
  // Agrupamento por periodicidade
  // ============================================================================

  /**
   * Agrupa lançamentos em períodos de acordo com a periodicidade escolhida
   */
  private agruparPorPeriodicidade(
    entradas: FluxoCaixaEntryDto[],
    periodicidade: string,
    dataInicio: string,
    dataFim: string,
    safras: Safra[],
  ): FluxoCaixaPeriodoDto[] {
    switch (periodicidade) {
      case 'diario':
        return this.agruparDiario(entradas, dataInicio, dataFim);
      case 'semanal':
        return this.agruparSemanal(entradas, dataInicio, dataFim);
      case 'mensal':
        return this.agruparMensal(entradas, dataInicio, dataFim);
      case 'safra':
        return this.agruparPorSafra(entradas, safras, dataInicio, dataFim);
      default:
        return this.agruparMensal(entradas, dataInicio, dataFim);
    }
  }

  /**
   * Agrupamento diário: um período por dia no intervalo
   */
  private agruparDiario(
    entradas: FluxoCaixaEntryDto[],
    dataInicio: string,
    dataFim: string,
  ): FluxoCaixaPeriodoDto[] {
    const periodos: FluxoCaixaPeriodoDto[] = [];
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
      const dataStr = this.formatarData(d);
      const lancamentos = entradas.filter(e => e.data === dataStr);

      periodos.push(this.criarPeriodo(dataStr, dataStr, dataStr, lancamentos));
    }

    return periodos;
  }

  /**
   * Agrupamento semanal: um período por semana ISO
   */
  private agruparSemanal(
    entradas: FluxoCaixaEntryDto[],
    dataInicio: string,
    dataFim: string,
  ): FluxoCaixaPeriodoDto[] {
    const periodos: FluxoCaixaPeriodoDto[] = [];
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    // Ajustar início para segunda-feira da semana
    let inicioSemana = new Date(inicio);
    const diaSemana = inicioSemana.getDay();
    const diffSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
    inicioSemana.setDate(inicioSemana.getDate() + diffSegunda);
    // Se a segunda-feira calculada é depois do dataInicio, usar dataInicio
    if (inicioSemana > inicio) {
      inicioSemana = new Date(inicio);
    }

    while (inicioSemana <= fim) {
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(fimSemana.getDate() + 6);

      const inicioStr = this.formatarData(inicioSemana < inicio ? inicio : inicioSemana);
      const fimStr = this.formatarData(fimSemana > fim ? fim : fimSemana);

      const semanaISO = this.obterSemanaISO(inicioSemana);
      const rotulo = `Semana ${semanaISO.semana}/${semanaISO.ano}`;

      const lancamentos = entradas.filter(e => e.data >= inicioStr && e.data <= fimStr);

      periodos.push(this.criarPeriodo(rotulo, inicioStr, fimStr, lancamentos));

      // Avançar para próxima segunda-feira
      inicioSemana.setDate(inicioSemana.getDate() + 7);
    }

    return periodos;
  }

  /**
   * Agrupamento mensal: um período por mês
   */
  private agruparMensal(
    entradas: FluxoCaixaEntryDto[],
    dataInicio: string,
    dataFim: string,
  ): FluxoCaixaPeriodoDto[] {
    const periodos: FluxoCaixaPeriodoDto[] = [];
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    let mesAtual = new Date(inicio.getFullYear(), inicio.getMonth(), 1);

    while (mesAtual <= fim) {
      const proximoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1);
      const ultimoDiaMes = new Date(proximoMes.getTime() - 24 * 60 * 60 * 1000);

      const inicioStr = this.formatarData(mesAtual < inicio ? inicio : mesAtual);
      const fimStr = this.formatarData(ultimoDiaMes > fim ? fim : ultimoDiaMes);

      const nomesMes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const rotulo = `${nomesMes[mesAtual.getMonth()]}/${mesAtual.getFullYear()}`;

      const lancamentos = entradas.filter(e => e.data >= inicioStr && e.data <= fimStr);

      periodos.push(this.criarPeriodo(rotulo, inicioStr, fimStr, lancamentos));

      mesAtual = proximoMes;
    }

    return periodos;
  }

  /**
   * Agrupamento por safra: um período por safra, com "Sem Safra" para lançamentos não associados
   */
  private agruparPorSafra(
    entradas: FluxoCaixaEntryDto[],
    safras: Safra[],
    dataInicio: string,
    dataFim: string,
  ): FluxoCaixaPeriodoDto[] {
    const periodos: FluxoCaixaPeriodoDto[] = [];
    const entradasNaoAssociadas: FluxoCaixaEntryDto[] = [];
    const entradasAssociadas = new Set<FluxoCaixaEntryDto>();

    // Para cada safra, encontrar lançamentos cujas datas caem no período da safra
    for (const safra of safras) {
      const safraInicio = this.formatarData(safra.dataInicio);
      const safraFim = safra.dataFim ? this.formatarData(safra.dataFim) : dataFim;

      const lancamentos = entradas.filter(e => {
        const dentroSafra = e.data >= safraInicio && e.data <= safraFim;
        if (dentroSafra) entradasAssociadas.add(e);
        return dentroSafra;
      });

      if (lancamentos.length > 0) {
        periodos.push(this.criarPeriodo(
          safra.nome,
          safraInicio < dataInicio ? dataInicio : safraInicio,
          safraFim > dataFim ? dataFim : safraFim,
          lancamentos,
        ));
      }
    }

    // Lançamentos que não caem em nenhuma safra
    for (const entrada of entradas) {
      if (!entradasAssociadas.has(entrada)) {
        entradasNaoAssociadas.push(entrada);
      }
    }

    if (entradasNaoAssociadas.length > 0) {
      periodos.push(this.criarPeriodo('Sem Safra', dataInicio, dataFim, entradasNaoAssociadas));
    }

    return periodos;
  }

  // ============================================================================
  // Saldo acumulado
  // ============================================================================

  /**
   * Calcula o saldo acumulado sequencialmente por período
   */
  private calcularSaldoAcumulado(periodos: FluxoCaixaPeriodoDto[], saldoInicial: number): void {
    let saldoAcumulado = saldoInicial;
    for (const periodo of periodos) {
      saldoAcumulado += periodo.saldoPeriodo;
      periodo.saldoAcumulado = saldoAcumulado;
    }
  }

  /**
   * Calcula o saldo inicial: soma dos saldos iniciais das contas bancárias
   * mais todos os lançamentos realizados ANTES do período de consulta
   */
  private async calcularSaldoInicial(
    tenantId: number,
    dataInicio: string,
    contaBancariaIds?: number[],
  ): Promise<number> {
    // Buscar contas bancárias ativas do tenant
    const whereContas: any = { tenantId, ativo: true };
    if (contaBancariaIds && contaBancariaIds.length > 0) {
      whereContas.id = { [Op.in]: contaBancariaIds };
    }

    const contas = await Conta.findAll({ where: whereContas, attributes: ['id', 'saldoInicial'] });
    const saldoInicialContas = contas.reduce((sum, c) => sum + (c.saldoInicial || 0), 0);

    // Somar parcelas baixadas ANTES do período
    const [parcelasPagarAntes, parcelasReceberAntes] = await Promise.all([
      ParcelaTituloPagar.findAll({
        where: {
          tenantId,
          status: StatusParcelaPagar.BAIXADA,
          dataBaixa: { [Op.lt]: dataInicio },
        },
        attributes: ['valorBaixa', 'valorPago', 'valorParcela'],
      }),
      ParcelaTituloReceber.findAll({
        where: {
          tenantId,
          status: StatusParcelaReceber.BAIXADA,
          dataBaixa: { [Op.lt]: dataInicio },
        },
        attributes: ['valorBaixa', 'valorPago', 'valorParcela'],
      }),
    ]);

    const totalSaidasAntes = parcelasPagarAntes.reduce(
      (sum, p) => sum + Number(p.valorBaixa ?? p.valorPago ?? p.valorParcela ?? 0), 0,
    );
    const totalEntradasAntes = parcelasReceberAntes.reduce(
      (sum, p) => sum + Number(p.valorBaixa ?? p.valorPago ?? p.valorParcela ?? 0), 0,
    );

    // Somar OutraDespesaReceita antes do período
    const outrasAntes = await OutraDespesaReceita.findAll({
      where: {
        tenantId,
        dataMovimento: { [Op.lt]: dataInicio },
      },
      attributes: ['valor', 'tipo'],
    });

    const totalOutrasEntradasAntes = outrasAntes
      .filter(r => r.tipo === 'RECEITA')
      .reduce((sum, r) => sum + r.valor, 0);
    const totalOutrasSaidasAntes = outrasAntes
      .filter(r => r.tipo === 'DESPESA')
      .reduce((sum, r) => sum + r.valor, 0);

    return saldoInicialContas
      + totalEntradasAntes
      - totalSaidasAntes
      + totalOutrasEntradasAntes
      - totalOutrasSaidasAntes;
  }

  // ============================================================================
  // Saldos por conta bancária
  // ============================================================================

  /**
   * Calcula saldos atuais e projetados por conta bancária
   */
  private async calcularSaldosPorConta(
    tenantId: number,
    entradas: FluxoCaixaEntryDto[],
    contaBancariaIds?: number[],
  ): Promise<FluxoCaixaSaldoContaDto[]> {
    // Buscar contas ativas do tenant
    const whereContas: any = { tenantId, ativo: true };
    if (contaBancariaIds && contaBancariaIds.length > 0) {
      whereContas.id = { [Op.in]: contaBancariaIds };
    }

    const contas = await Conta.findAll({
      where: whereContas,
      attributes: ['id', 'nome', 'saldoInicial'],
      order: [['nome', 'ASC']],
    });

    const saldosPorConta: FluxoCaixaSaldoContaDto[] = [];

    for (const conta of contas) {
      // Lançamentos realizados da conta
      const entradasConta = entradas.filter(e => e.contaBancariaId === conta.id);

      const entradasRealizadas = entradasConta.filter(e => e.realizado && e.tipoFluxo === 'entrada');
      const saidasRealizadas = entradasConta.filter(e => e.realizado && e.tipoFluxo === 'saida');
      const entradasProjetadas = entradasConta.filter(e => !e.realizado && e.tipoFluxo === 'entrada');
      const saidasProjetadas = entradasConta.filter(e => !e.realizado && e.tipoFluxo === 'saida');

      const saldoAtual = (conta.saldoInicial || 0)
        + entradasRealizadas.reduce((sum, e) => sum + e.valor, 0)
        - saidasRealizadas.reduce((sum, e) => sum + e.valor, 0);

      const totalEntradasProj = entradasProjetadas.reduce((sum, e) => sum + e.valor, 0);
      const totalSaidasProj = saidasProjetadas.reduce((sum, e) => sum + e.valor, 0);

      saldosPorConta.push({
        contaBancariaId: conta.id,
        contaBancariaNome: conta.nome,
        saldoAtual,
        entradasProjetadas: totalEntradasProj,
        saidasProjetadas: totalSaidasProj,
        saldoProjetado: saldoAtual + totalEntradasProj - totalSaidasProj,
      });
    }

    return saldosPorConta;
  }

  // ============================================================================
  // Alertas
  // ============================================================================

  /**
   * Gera alertas de saldo negativo e saldo crítico (abaixo do mínimo)
   */
  private gerarAlertas(
    periodos: FluxoCaixaPeriodoDto[],
    saldosPorConta: FluxoCaixaSaldoContaDto[],
    saldoMinimoAlerta: number,
  ): FluxoCaixaAlertaDto[] {
    const alertas: FluxoCaixaAlertaDto[] = [];

    // Alertas por período (consolidado)
    for (const periodo of periodos) {
      if (periodo.saldoAcumulado < 0) {
        alertas.push({
          tipo: 'saldo_negativo',
          severidade: 'danger',
          mensagem: `Saldo negativo de R$ ${Math.abs(periodo.saldoAcumulado).toFixed(2)} no período ${periodo.rotulo}`,
          data: periodo.dataInicio,
          valor: periodo.saldoAcumulado,
        });
      } else if (saldoMinimoAlerta > 0 && periodo.saldoAcumulado < saldoMinimoAlerta) {
        alertas.push({
          tipo: 'saldo_minimo',
          severidade: 'warning',
          mensagem: `Saldo abaixo do mínimo (R$ ${saldoMinimoAlerta.toFixed(2)}) no período ${periodo.rotulo}: R$ ${periodo.saldoAcumulado.toFixed(2)}`,
          data: periodo.dataInicio,
          valor: periodo.saldoAcumulado,
        });
      }
    }

    // Alertas por conta bancária
    for (const conta of saldosPorConta) {
      if (conta.saldoProjetado < 0) {
        alertas.push({
          tipo: 'saldo_negativo',
          severidade: 'danger',
          mensagem: `Saldo projetado negativo na conta "${conta.contaBancariaNome}": R$ ${conta.saldoProjetado.toFixed(2)}`,
          data: '',
          valor: conta.saldoProjetado,
        });
      } else if (saldoMinimoAlerta > 0 && conta.saldoProjetado < saldoMinimoAlerta) {
        alertas.push({
          tipo: 'saldo_minimo',
          severidade: 'warning',
          mensagem: `Saldo projetado abaixo do mínimo na conta "${conta.contaBancariaNome}": R$ ${conta.saldoProjetado.toFixed(2)}`,
          data: '',
          valor: conta.saldoProjetado,
        });
      }
    }

    // Alertas de concentração de saídas (>70% das saídas totais em um único período)
    const totalSaidasGeral = periodos.reduce((sum, p) => sum + p.totalSaidas, 0);
    if (totalSaidasGeral > 0) {
      for (const periodo of periodos) {
        const percentual = (periodo.totalSaidas / totalSaidasGeral) * 100;
        if (percentual > 70 && periodos.length > 1) {
          alertas.push({
            tipo: 'concentracao_saidas',
            severidade: 'info',
            mensagem: `Concentração de ${percentual.toFixed(0)}% das saídas no período ${periodo.rotulo}`,
            data: periodo.dataInicio,
            valor: periodo.totalSaidas,
          });
        }
      }
    }

    return alertas;
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  /**
   * Carrega a configuração do tenant, mesclando com os parâmetros da query
   */
  private async carregarConfiguracao(
    tenantId: number,
    params: FluxoCaixaQueryParams,
  ): Promise<{
    saldoMinimoAlerta: number;
    incluirTitulos: boolean;
    incluirAgreements: boolean;
    incluirRecorrentes: boolean;
  }> {
    const config = await this.configRepo.findByTenant(tenantId);

    return {
      saldoMinimoAlerta: config?.saldoMinimoAlerta ?? CONFIG_PADRAO.saldoMinimoAlerta,
      incluirTitulos: params.incluirTitulos ?? config?.incluirTitulos ?? CONFIG_PADRAO.incluirTitulos,
      incluirAgreements: params.incluirAgreements ?? config?.incluirAgreements ?? CONFIG_PADRAO.incluirAgreements,
      incluirRecorrentes: params.incluirRecorrentes ?? config?.incluirRecorrentes ?? CONFIG_PADRAO.incluirRecorrentes,
    };
  }

  /**
   * Carrega todas as safras do tenant para agrupamento por safra
   */
  private async carregarSafras(tenantId: number): Promise<Safra[]> {
    return Safra.findAll({
      where: { tenantId },
      order: [['dataInicio', 'ASC']],
    });
  }

  /**
   * Cria um FluxoCaixaPeriodoDto a partir de lançamentos
   */
  private criarPeriodo(
    rotulo: string,
    dataInicio: string,
    dataFim: string,
    lancamentos: FluxoCaixaEntryDto[],
  ): FluxoCaixaPeriodoDto {
    const totalEntradas = lancamentos
      .filter(e => e.tipoFluxo === 'entrada')
      .reduce((sum, e) => sum + e.valor, 0);
    const totalSaidas = lancamentos
      .filter(e => e.tipoFluxo === 'saida')
      .reduce((sum, e) => sum + e.valor, 0);

    return {
      rotulo,
      dataInicio,
      dataFim,
      totalEntradas,
      totalSaidas,
      saldoPeriodo: totalEntradas - totalSaidas,
      saldoAcumulado: 0, // Será calculado em calcularSaldoAcumulado
      lancamentos,
    };
  }

  /**
   * Formata uma Date ou string para formato YYYY-MM-DD
   */
  private formatarData(data: Date | string): string {
    if (typeof data === 'string') {
      // Se já está no formato YYYY-MM-DD, retornar direto
      if (/^\d{4}-\d{2}-\d{2}$/.test(data)) return data;
      return data.substring(0, 10);
    }
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  /**
   * Obtém o número da semana ISO e o ano de uma data
   */
  private obterSemanaISO(data: Date): { semana: number; ano: number } {
    const d = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const semana = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return { semana, ano: d.getUTCFullYear() };
  }
}
