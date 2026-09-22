/**
 * ParcelaApplicationService - Application Service para Baixa de Parcelas
 * 
 * Contém a lógica de negócio para operações de baixa de parcelas, separando
 * controllers (HTTP) da lógica de aplicação.
 * 
 * Responsabilidades:
 * - Validações de baixa (RN-011 a RN-013)
 * - Criação automática de movimentos financeiros (RN-019 a RN-022)
 * - Cálculo proporcional de rateios
 * - Atualização automática de status do título (RN-012)
 * - Orquestração de repositórios e mappers
 * 
 * @example
 * ```typescript
 * const service = container.resolve<IParcelaApplicationService>(TYPES.IParcelaApplicationService);
 * 
 * const parcela = await service.baixarParcelaTituloPagar(1, {
 *   dataBaixa: '2024-01-15',
 *   valorBaixa: 2000.00,
 *   observacao: 'Pagamento realizado'
 * });
 * ```
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IParcelaApplicationService } from './IParcelaApplicationService';
import { IParcelaTituloPagarRepository } from '../../../infrastructure/repository/IParcelaTituloPagarRepository';
import { IParcelaTituloReceberRepository } from '../../../infrastructure/repository/IParcelaTituloReceberRepository';
import { ITituloPagarRepository } from '../../../infrastructure/repository/ITituloPagarRepository';
import { ITituloReceberRepository } from '../../../infrastructure/repository/ITituloReceberRepository';
import { IRateioPlanoContaTituloPagarRepository } from '../../../infrastructure/repository/IRateioPlanoContaTituloPagarRepository';
import { IRateioPlanoContaTituloReceberRepository } from '../../../infrastructure/repository/IRateioPlanoContaTituloReceberRepository';
import { IRateioCentroCustoTituloPagarRepository } from '../../../infrastructure/repository/IRateioCentroCustoTituloPagarRepository';
import { IRateioCentroCustoTituloReceberRepository } from '../../../infrastructure/repository/IRateioCentroCustoTituloReceberRepository';
import { IMovimentoFinanceiroTituloPagarRepository } from '../../../infrastructure/repository/IMovimentoFinanceiroTituloPagarRepository';
import { IMovimentoFinanceiroTituloReceberRepository } from '../../../infrastructure/repository/IMovimentoFinanceiroTituloReceberRepository';
import { IMoedaConversionService } from '../moedaConversion/IMoedaConversionService';
import { ParcelaTituloPagarMapper } from '../../mappers/ParcelaTituloPagarMapper';
import { ParcelaTituloReceberMapper } from '../../mappers/ParcelaTituloReceberMapper';
import { BaixaParcelaTituloPagarDto } from '../../dto/parcelaTituloPagar/BaixaParcelaTituloPagarDto';
import { BaixaParcelaTituloReceberDto } from '../../dto/parcelaTituloReceber/BaixaParcelaTituloReceberDto';
import { ParcelaTituloPagarResponseDto } from '../../dto/parcelaTituloPagar/ParcelaTituloPagarResponseDto';
import { ParcelaTituloReceberResponseDto } from '../../dto/parcelaTituloReceber/ParcelaTituloReceberResponseDto';
import { MovimentoFinanceiroTituloPagarResponseDto } from '../../dto/movimentoFinanceiroTituloPagar/MovimentoFinanceiroTituloPagarResponseDto';
import { MovimentoFinanceiroTituloReceberResponseDto } from '../../dto/movimentoFinanceiroTituloReceber/MovimentoFinanceiroTituloReceberResponseDto';
import { NotFoundException, BusinessException, ForbiddenException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { getRequestContext } from '../../../core/authorization/helpers';
import { IAuditService } from '../../../core/audit/IAuditService';
import ParcelaTituloPagar, { StatusParcela } from '../../../models/ParcelaTituloPagar';
import ParcelaTituloReceber from '../../../models/ParcelaTituloReceber';
import TituloPagar, { StatusTituloPagar } from '../../../models/TituloPagar';
import TituloReceber, { StatusTituloReceber } from '../../../models/TituloReceber';
import MovimentoFinanceiroTituloPagar from '../../../models/MovimentoFinanceiroTituloPagar';
import MovimentoFinanceiroTituloReceber from '../../../models/MovimentoFinanceiroTituloReceber';
import RateioPlanoContaTituloPagar from '../../../models/RateioPlanoContaTituloPagar';
import RateioCentroCustoTituloPagar from '../../../models/RateioCentroCustoTituloPagar';
import RateioPlanoContaTituloReceber from '../../../models/RateioPlanoContaTituloReceber';
import RateioCentroCustoTituloReceber from '../../../models/RateioCentroCustoTituloReceber';

/**
 * Application Service para Baixa de Parcelas
 * 
 * Implementa lógica de negócio para operações de baixa de parcelas, usando
 * repositórios para acesso a dados e mapper para conversão DTO-Entidade.
 */
@Injectable()
export class ParcelaApplicationService implements IParcelaApplicationService {
  private parcelaTituloPagarMapper: ParcelaTituloPagarMapper;
  private parcelaTituloReceberMapper: ParcelaTituloReceberMapper;

  constructor(
    @Inject(TYPES.IAuditService)
    private auditService: IAuditService,
    @Inject(TYPES.IParcelaTituloPagarRepository)
    private parcelaTituloPagarRepository: IParcelaTituloPagarRepository,
    @Inject(TYPES.IParcelaTituloReceberRepository)
    private parcelaTituloReceberRepository: IParcelaTituloReceberRepository,
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
    @Inject(TYPES.IMoedaConversionService)
    private moedaConversionService: IMoedaConversionService
  ) {
    this.parcelaTituloPagarMapper = new ParcelaTituloPagarMapper();
    this.parcelaTituloReceberMapper = new ParcelaTituloReceberMapper();
  }

  /**
   * Baixa uma parcela de título a pagar
   * 
   * Implementa validações (RN-011, RN-013), atualiza parcela, cria movimentos financeiros (RN-019 a RN-022)
   * e atualiza status do título (RN-012).
   * 
   * @param idParcela - ID da parcela a ser baixada
   * @param dto - DTO com dados da baixa
   * @returns Promise que resolve com o DTO da parcela atualizada
   * @throws BusinessException se validações de negócio falharem
   * @throws ForbiddenException se usuário não tiver permissão 'tituloPagar.baixar'
   */
  @RequirePermission('tituloPagar.baixar')
  @Transactional()
  @Auditable('ParcelaTituloPagar')
  @CacheEvict('parcelaTituloPagar:*', true)
  @CacheEvict('tituloPagar:*', true)
  async baixarParcelaTituloPagar(idParcela: number, dto: BaixaParcelaTituloPagarDto): Promise<ParcelaTituloPagarResponseDto> {
    // Obter userId e tenantId do contexto
    const context = getRequestContext();
    if (!context || !context.getUserId()) {
      throw new ForbiddenException(
        'Usuário não autenticado. Não é possível baixar parcela sem userId.',
        'USER_NOT_AUTHENTICATED'
      );
    }
    const userId = context.getUserId()!;
    const tenantId = context.getTenantId();
    if (!tenantId) {
      throw new ForbiddenException(
        'Tenant não identificado. Não é possível baixar parcela sem tenantId.',
        'TENANT_NOT_IDENTIFIED'
      );
    }

    // Buscar parcela
    const parcela = await this.parcelaTituloPagarRepository.findById(idParcela);
    if (!parcela) {
      throw new NotFoundException('Parcela de título a pagar', idParcela);
    }

    // RN-022: Validar se parcela pode ser baixada (não pode estar cancelada ou já baixada)
    if (parcela.status === StatusParcela.CANCELADA) {
      throw new BusinessException(
        'Não é possível baixar uma parcela cancelada.',
        'PARCELA_CANCELADA'
      );
    }
    if (parcela.status === StatusParcela.BAIXADA) {
      throw new BusinessException(
        'Esta parcela já foi totalmente baixada.',
        'PARCELA_JA_BAIXADA'
      );
    }

    // Buscar título para validações
    const titulo = await this.tituloPagarRepository.findById(parcela.idTituloPagar);
    if (!titulo) {
      throw new NotFoundException('Título a pagar', parcela.idTituloPagar);
    }

    // RN-013: Validar data de baixa (não pode ser anterior à data de lançamento)
    const dataBaixa = new Date(dto.dataBaixa);
    const dataLancamento = titulo.dataLancamento instanceof Date 
      ? titulo.dataLancamento 
      : new Date(titulo.dataLancamento);
    
    if (dataBaixa < dataLancamento) {
      throw new BusinessException(
        'Data de baixa não pode ser anterior à data de lançamento do título.',
        'DATA_BAIXA_INVALIDA'
      );
    }

    // RN-011: Validar valor da baixa
    const valorParcela = Number(parcela.valorParcela);
    const valorBaixaAnterior = parcela.valorBaixa ? Number(parcela.valorBaixa) : 0;
    const valorPendente = valorParcela - valorBaixaAnterior;

    if (dto.valorBaixa > valorPendente) {
      throw new BusinessException(
        `Valor da baixa (${dto.valorBaixa}) não pode ser maior que o valor pendente (${valorPendente}).`,
        'VALOR_BAIXA_INVALIDO'
      );
    }

    if (dto.valorBaixa <= 0) {
      throw new BusinessException(
        'Valor da baixa deve ser maior que zero.',
        'VALOR_BAIXA_INVALIDO'
      );
    }

    // Calcular novo valor de baixa
    const novoValorBaixa = valorBaixaAnterior + dto.valorBaixa;
    const novoStatus = novoValorBaixa >= valorParcela
      ? StatusParcela.BAIXADA
      : StatusParcela.PARCIAL;
    const novoValorSaldo = Math.max(0, Math.round((valorParcela - novoValorBaixa) * 100) / 100);
    const novoValorPago = Math.round(novoValorBaixa * 100) / 100;

    // Atualizar parcela
    const parcelaAtualizada = await this.parcelaTituloPagarRepository.update(idParcela, {
      dataBaixa: dataBaixa,
      valorBaixa: novoValorBaixa,
      valorPago: novoValorPago,
      valorSaldo: novoValorSaldo,
      status: novoStatus,
      observacao: dto.observacao || parcela.observacao,
    } as any);

    // RN-019, RN-020, RN-021, RN-022: Criar movimentos financeiros
    // Só criar movimentos se parcela foi totalmente ou parcialmente baixada
    if (novoStatus === StatusParcela.BAIXADA || dto.valorBaixa > 0) {
      await this.criarMovimentosFinanceirosTituloPagar(
        parcela.id,
        titulo.id,
        dto.valorBaixa,
        dataBaixa,
        userId,
        tenantId,
        dto.observacao
      );
    }

    // RN-012: Atualizar status do título
    await this.atualizarStatusTituloPagar(titulo.id);

    // Registrar auditoria
    await this.auditService.logUpdate('parcelaTituloPagar', idParcela, parcela, {
      dataBaixa: dto.dataBaixa,
      valorBaixa: dto.valorBaixa,
      status: novoStatus,
    });

    // Retornar como DTO
    return this.parcelaTituloPagarMapper.toDto(parcelaAtualizada);
  }

  /**
   * Baixa uma parcela de título a receber
   * 
   * Implementa validações (RN-011, RN-013), atualiza parcela, cria movimentos financeiros (RN-019 a RN-022)
   * e atualiza status do título (RN-012).
   * 
   * @param idParcela - ID da parcela a ser baixada
   * @param dto - DTO com dados da baixa
   * @returns Promise que resolve com o DTO da parcela atualizada
   * @throws BusinessException se validações de negócio falharem
   * @throws ForbiddenException se usuário não tiver permissão 'tituloReceber.baixar'
   */
  @RequirePermission('tituloReceber.baixar')
  @Transactional()
  @Auditable('ParcelaTituloReceber')
  @CacheEvict('parcelaTituloReceber:*', true)
  @CacheEvict('tituloReceber:*', true)
  async baixarParcelaTituloReceber(idParcela: number, dto: BaixaParcelaTituloReceberDto): Promise<ParcelaTituloReceberResponseDto> {
    // Obter userId e tenantId do contexto
    const context = getRequestContext();
    if (!context || !context.getUserId()) {
      throw new ForbiddenException(
        'Usuário não autenticado. Não é possível baixar parcela sem userId.',
        'USER_NOT_AUTHENTICATED'
      );
    }
    const userId = context.getUserId()!;
    const tenantId = context.getTenantId();
    if (!tenantId) {
      throw new ForbiddenException(
        'Tenant não identificado. Não é possível baixar parcela sem tenantId.',
        'TENANT_NOT_IDENTIFIED'
      );
    }

    // Buscar parcela
    const parcela = await this.parcelaTituloReceberRepository.findById(idParcela);
    if (!parcela) {
      throw new NotFoundException('Parcela de título a receber', idParcela);
    }

    // RN-022: Validar se parcela pode ser baixada (não pode estar cancelada ou já baixada)
    if (parcela.status === 'CANCELADA') {
      throw new BusinessException(
        'Não é possível baixar uma parcela cancelada.',
        'PARCELA_CANCELADA'
      );
    }
    if (parcela.status === 'BAIXADA') {
      throw new BusinessException(
        'Esta parcela já foi totalmente baixada.',
        'PARCELA_JA_BAIXADA'
      );
    }

    // Buscar título para validações
    const titulo = await this.tituloReceberRepository.findById(parcela.idTituloReceber);
    if (!titulo) {
      throw new NotFoundException('Título a receber', parcela.idTituloReceber);
    }

    // RN-013: Validar data de baixa (não pode ser anterior à data de lançamento)
    const dataBaixa = new Date(dto.dataBaixa);
    const dataLancamento = titulo.dataLancamento instanceof Date 
      ? titulo.dataLancamento 
      : new Date(titulo.dataLancamento);
    
    if (dataBaixa < dataLancamento) {
      throw new BusinessException(
        'Data de baixa não pode ser anterior à data de lançamento do título.',
        'DATA_BAIXA_INVALIDA'
      );
    }

    // RN-011: Validar valor da baixa
    const valorParcela = Number(parcela.valorParcela);
    const valorBaixaAnterior = parcela.valorBaixa ? Number(parcela.valorBaixa) : 0;
    const valorPendente = valorParcela - valorBaixaAnterior;

    if (dto.valorBaixa > valorPendente) {
      throw new BusinessException(
        `Valor da baixa (${dto.valorBaixa}) não pode ser maior que o valor pendente (${valorPendente}).`,
        'VALOR_BAIXA_INVALIDO'
      );
    }

    if (dto.valorBaixa <= 0) {
      throw new BusinessException(
        'Valor da baixa deve ser maior que zero.',
        'VALOR_BAIXA_INVALIDO'
      );
    }

    // Calcular novo valor de baixa
    const novoValorBaixa = valorBaixaAnterior + dto.valorBaixa;
    const novoStatus = novoValorBaixa >= valorParcela
      ? 'BAIXADA'
      : 'PARCIAL';
    const novoValorSaldo = Math.max(0, Math.round((valorParcela - novoValorBaixa) * 100) / 100);
    const novoValorPago = Math.round(novoValorBaixa * 100) / 100;

    // Atualizar parcela
    const parcelaAtualizada = await this.parcelaTituloReceberRepository.update(idParcela, {
      dataBaixa: dataBaixa,
      valorBaixa: novoValorBaixa,
      valorPago: novoValorPago,
      valorSaldo: novoValorSaldo,
      status: novoStatus,
      observacao: dto.observacao || parcela.observacao,
    } as any);

    // RN-019, RN-020, RN-021, RN-022: Criar movimentos financeiros
    // Só criar movimentos se parcela foi totalmente ou parcialmente baixada
    if (novoStatus === 'BAIXADA' || dto.valorBaixa > 0) {
      await this.criarMovimentosFinanceirosTituloReceber(
        parcela.id,
        titulo.id,
        dto.valorBaixa,
        dataBaixa,
        userId,
        tenantId,
        dto.observacao
      );
    }

    // RN-012: Atualizar status do título
    await this.atualizarStatusTituloReceber(titulo.id);

    // Registrar auditoria
    await this.auditService.logUpdate('parcelaTituloReceber', idParcela, parcela, {
      dataBaixa: dto.dataBaixa,
      valorBaixa: dto.valorBaixa,
      status: novoStatus,
    });

    // Retornar como DTO
    return this.parcelaTituloReceberMapper.toDto(parcelaAtualizada);
  }

  /**
   * Consulta movimentos financeiros de uma parcela de título a pagar
   * 
   * @param idParcela - ID da parcela
   * @returns Promise que resolve com array de DTOs de movimentos financeiros
   * @throws ForbiddenException se usuário não tiver permissão 'tituloPagar.read'
   */
  @RequirePermission('tituloPagar.read')
  @Cacheable('parcelaTituloPagar:movimentos:{0}', 600)
  async consultarMovimentosParcelaTituloPagar(idParcela: number): Promise<MovimentoFinanceiroTituloPagarResponseDto[]> {
    const movimentos = await this.movimentoFinanceiroTituloPagarRepository.findByParcela(idParcela);
    return movimentos.map(movimento => this.movimentoFinanceiroTituloPagarToDto(movimento));
  }

  /**
   * Consulta movimentos financeiros de uma parcela de título a receber
   * 
   * @param idParcela - ID da parcela
   * @returns Promise que resolve com array de DTOs de movimentos financeiros
   * @throws ForbiddenException se usuário não tiver permissão 'tituloReceber.read'
   */
  @RequirePermission('tituloReceber.read')
  @Cacheable('parcelaTituloReceber:movimentos:{0}', 600)
  async consultarMovimentosParcelaTituloReceber(idParcela: number): Promise<MovimentoFinanceiroTituloReceberResponseDto[]> {
    const movimentos = await this.movimentoFinanceiroTituloReceberRepository.findByParcela(idParcela);
    return movimentos.map(movimento => this.movimentoFinanceiroTituloReceberToDto(movimento));
  }

  /**
   * Cria movimentos financeiros para uma parcela de título a pagar baixada (RN-019, RN-020, RN-021)
   * 
   * Para cada combinação de Plano de Contas × Centro de Custo, cria um movimento financeiro
   * com valor calculado proporcionalmente aos percentuais de rateio.
   * 
   * @param idParcela - ID da parcela baixada
   * @param idTitulo - ID do título
   * @param valorBaixa - Valor da baixa
   * @param dataBaixa - Data da baixa
   * @param userId - ID do usuário
   * @param tenantId - ID do tenant
   * @param observacao - Observação opcional
   */
  private async criarMovimentosFinanceirosTituloPagar(
    idParcela: number,
    idTitulo: number,
    valorBaixa: number,
    dataBaixa: Date,
    userId: number,
    tenantId: number,
    observacao?: string
  ): Promise<void> {
    // Buscar título para obter moeda e data de lançamento
    const titulo = await this.tituloPagarRepository.findById(idTitulo);
    if (!titulo) {
      throw new NotFoundException('Título a pagar', idTitulo);
    }

    // Buscar rateios do título
    const rateiosPlanoConta = await this.rateioPlanoContaTituloPagarRepository.findByTituloPagar(idTitulo);
    const rateiosCentroCusto = await this.rateioCentroCustoTituloPagarRepository.findByTituloPagar(idTitulo);

    // Rateios são opcionais — se não existem, baixa segue sem criar movimentos detalhados
    if (rateiosPlanoConta.length === 0 || rateiosCentroCusto.length === 0) {
      return;
    }

    // RN-009: Converter valor da baixa para moeda padrão (BRL)
    const valoresConvertidos = await this.moedaConversionService.converterParaMoedaPadrao(
      titulo.idMoeda,
      valorBaixa,
      dataBaixa,
      tenantId
    );

    const movimentos: Partial<MovimentoFinanceiroTituloPagar>[] = [];
    let somaMovimentos = 0;

    // Para cada combinação de Plano de Contas × Centro de Custo
    for (const rateioPC of rateiosPlanoConta) {
      for (const rateioCC of rateiosCentroCusto) {
        // RN-020: Calcular valor do movimento proporcionalmente
        // valorMovimento = valorBaixa × (percentualRateioPC / 100) × (percentualRateioCC / 100)
        const percentualPC = Number(rateioPC.percentualRateio) / 100;
        const percentualCC = Number(rateioCC.percentualRateio) / 100;
        const valorMovimento = valoresConvertidos.valorMoedaPadrao * percentualPC * percentualCC;
        const valorMovimentoOriginal = valoresConvertidos.valorMoedaOriginal * percentualPC * percentualCC;

        movimentos.push({
          idParcelaTituloPagar: idParcela,
          idTituloPagar: idTitulo,
          idPlanoContaGerencial: rateioPC.idPlanoContaGerencial,
          idCentroCusto: rateioCC.idCentroCusto,
          dataMovimento: dataBaixa,
          valorMovimento: valorMovimento,
          valorMovimentoMoedaOriginal: valorMovimentoOriginal,
          valorMovimentoMoedaPadrao: valorMovimento,
          percentualRateioPlanoConta: Number(rateioPC.percentualRateio),
          percentualRateioCentroCusto: Number(rateioCC.percentualRateio),
          observacao: observacao || null,
          tenantId: tenantId,
          usercreation: userId,
          datecreation: new Date(),
        } as any);

        somaMovimentos += valorMovimento;
      }
    }

    // RN-021: Validar que soma dos movimentos = valorBaixa convertido (com tolerância de arredondamento)
    const diferenca = Math.abs(somaMovimentos - valoresConvertidos.valorMoedaPadrao);
    const tolerancia = 0.01; // Tolerância de 1 centavo para arredondamentos

    if (diferenca > tolerancia) {
      // Ajustar o último movimento para compensar diferença de arredondamento
      if (movimentos.length > 0) {
        const ultimoMovimento = movimentos[movimentos.length - 1];
        const ajuste = valoresConvertidos.valorMoedaPadrao - somaMovimentos;
        (ultimoMovimento as any).valorMovimento = Number(ultimoMovimento.valorMovimento) + ajuste;
        (ultimoMovimento as any).valorMovimentoMoedaPadrao = Number(ultimoMovimento.valorMovimento) + ajuste;
      }
    }

    // Criar todos os movimentos
    for (const movimento of movimentos) {
      await this.movimentoFinanceiroTituloPagarRepository.create(movimento as any);
    }
  }

  /**
   * Cria movimentos financeiros para uma parcela de título a receber baixada (RN-019, RN-020, RN-021)
   * 
   * Para cada combinação de Plano de Contas × Centro de Custo, cria um movimento financeiro
   * com valor calculado proporcionalmente aos percentuais de rateio.
   * 
   * @param idParcela - ID da parcela baixada
   * @param idTitulo - ID do título
   * @param valorBaixa - Valor da baixa
   * @param dataBaixa - Data da baixa
   * @param userId - ID do usuário
   * @param tenantId - ID do tenant
   * @param observacao - Observação opcional
   */
  private async criarMovimentosFinanceirosTituloReceber(
    idParcela: number,
    idTitulo: number,
    valorBaixa: number,
    dataBaixa: Date,
    userId: number,
    tenantId: number,
    observacao?: string
  ): Promise<void> {
    // Buscar título para obter moeda e data de lançamento
    const titulo = await this.tituloReceberRepository.findById(idTitulo);
    if (!titulo) {
      throw new NotFoundException('Título a receber', idTitulo);
    }

    // Buscar rateios do título
    const rateiosPlanoConta = await this.rateioPlanoContaTituloReceberRepository.findByTituloReceber(idTitulo);
    const rateiosCentroCusto = await this.rateioCentroCustoTituloReceberRepository.findByTituloReceber(idTitulo);

    // Rateios são opcionais — se não existem, baixa segue sem criar movimentos detalhados
    if (rateiosPlanoConta.length === 0 || rateiosCentroCusto.length === 0) {
      return;
    }

    // RN-009: Converter valor da baixa para moeda padrão (BRL)
    const valoresConvertidos = await this.moedaConversionService.converterParaMoedaPadrao(
      titulo.idMoeda,
      valorBaixa,
      dataBaixa,
      tenantId
    );

    const movimentos: Partial<MovimentoFinanceiroTituloReceber>[] = [];
    let somaMovimentos = 0;

    // Para cada combinação de Plano de Contas × Centro de Custo
    for (const rateioPC of rateiosPlanoConta) {
      for (const rateioCC of rateiosCentroCusto) {
        // RN-020: Calcular valor do movimento proporcionalmente
        // valorMovimento = valorBaixa × (percentualRateioPC / 100) × (percentualRateioCC / 100)
        const percentualPC = Number(rateioPC.percentualRateio) / 100;
        const percentualCC = Number(rateioCC.percentualRateio) / 100;
        const valorMovimento = valoresConvertidos.valorMoedaPadrao * percentualPC * percentualCC;
        const valorMovimentoOriginal = valoresConvertidos.valorMoedaOriginal * percentualPC * percentualCC;

        movimentos.push({
          idParcelaTituloReceber: idParcela,
          idTituloReceber: idTitulo,
          idPlanoContaGerencial: rateioPC.idPlanoContaGerencial,
          idCentroCusto: rateioCC.idCentroCusto,
          dataMovimento: dataBaixa,
          valorMovimento: valorMovimento,
          valorMovimentoMoedaOriginal: valorMovimentoOriginal,
          valorMovimentoMoedaPadrao: valorMovimento,
          percentualRateioPlanoConta: Number(rateioPC.percentualRateio),
          percentualRateioCentroCusto: Number(rateioCC.percentualRateio),
          observacao: observacao || null,
          tenantId: tenantId,
          usercreation: userId,
          datecreation: new Date(),
        } as any);

        somaMovimentos += valorMovimento;
      }
    }

    // RN-021: Validar que soma dos movimentos = valorBaixa convertido (com tolerância de arredondamento)
    const diferenca = Math.abs(somaMovimentos - valoresConvertidos.valorMoedaPadrao);
    const tolerancia = 0.01; // Tolerância de 1 centavo para arredondamentos

    if (diferenca > tolerancia) {
      // Ajustar o último movimento para compensar diferença de arredondamento
      if (movimentos.length > 0) {
        const ultimoMovimento = movimentos[movimentos.length - 1];
        const ajuste = valoresConvertidos.valorMoedaPadrao - somaMovimentos;
        (ultimoMovimento as any).valorMovimento = Number(ultimoMovimento.valorMovimento) + ajuste;
        (ultimoMovimento as any).valorMovimentoMoedaPadrao = Number(ultimoMovimento.valorMovimento) + ajuste;
      }
    }

    // Criar todos os movimentos
    for (const movimento of movimentos) {
      await this.movimentoFinanceiroTituloReceberRepository.create(movimento as any);
    }
  }

  /**
   * Atualiza status do título a pagar baseado no status das parcelas (RN-012)
   * 
   * @param idTitulo - ID do título
   */
  private async atualizarStatusTituloPagar(idTitulo: number): Promise<void> {
    const titulo = await this.tituloPagarRepository.findById(idTitulo);
    if (!titulo) {
      return;
    }

    const parcelas = await this.parcelaTituloPagarRepository.findByTituloPagar(idTitulo);
    
    if (parcelas.length === 0) {
      return;
    }

    const parcelasBaixadas = parcelas.filter(p => p.status === StatusParcela.BAIXADA);
    const parcelasAbertas = parcelas.filter(p => p.status === StatusParcela.ABERTA);
    const parcelasCanceladas = parcelas.filter(p => p.status === StatusParcela.CANCELADA);

    let novoStatus: StatusTituloPagar;

    // Se todas parcelas baixadas: status = 'BAIXADO'
    if (parcelasBaixadas.length === parcelas.length) {
      novoStatus = StatusTituloPagar.BAIXADO;
    }
    // Se pelo menos uma parcela baixada: status = 'PARCIAL'
    else if (parcelasBaixadas.length > 0) {
      novoStatus = StatusTituloPagar.PARCIAL;
    }
    // Se todas parcelas canceladas: status = 'CANCELADO'
    else if (parcelasCanceladas.length === parcelas.length) {
      novoStatus = StatusTituloPagar.CANCELADO;
    }
    // Se nenhuma parcela baixada: status = 'ABERTO'
    else {
      novoStatus = StatusTituloPagar.ABERTO;
    }

    // Atualizar apenas se status mudou
    if (titulo.status !== novoStatus) {
      await this.tituloPagarRepository.update(idTitulo, {
        status: novoStatus,
      } as any);
    }
  }

  /**
   * Atualiza status do título a receber baseado no status das parcelas (RN-012)
   * 
   * @param idTitulo - ID do título
   */
  private async atualizarStatusTituloReceber(idTitulo: number): Promise<void> {
    const titulo = await this.tituloReceberRepository.findById(idTitulo);
    if (!titulo) {
      return;
    }

    const parcelas = await this.parcelaTituloReceberRepository.findByTituloReceber(idTitulo);
    
    if (parcelas.length === 0) {
      return;
    }

    const parcelasBaixadas = parcelas.filter(p => p.status === 'BAIXADA');
    const parcelasAbertas = parcelas.filter(p => p.status === 'ABERTA');
    const parcelasCanceladas = parcelas.filter(p => p.status === 'CANCELADA');

    let novoStatus: StatusTituloReceber;

    // Se todas parcelas baixadas: status = 'BAIXADO'
    if (parcelasBaixadas.length === parcelas.length) {
      novoStatus = StatusTituloReceber.BAIXADO;
    }
    // Se pelo menos uma parcela baixada: status = 'PARCIAL'
    else if (parcelasBaixadas.length > 0) {
      novoStatus = StatusTituloReceber.PARCIAL;
    }
    // Se todas parcelas canceladas: status = 'CANCELADO'
    else if (parcelasCanceladas.length === parcelas.length) {
      novoStatus = StatusTituloReceber.CANCELADO;
    }
    // Se nenhuma parcela baixada: status = 'ABERTO'
    else {
      novoStatus = StatusTituloReceber.ABERTO;
    }

    // Atualizar apenas se status mudou
    if (titulo.status !== novoStatus) {
      await this.tituloReceberRepository.update(idTitulo, {
        status: novoStatus,
      } as any);
    }
  }

  /**
   * Converte entidade MovimentoFinanceiroTituloPagar para DTO
   * 
   * @param movimento - Entidade do movimento financeiro
   * @returns DTO de resposta
   */
  private movimentoFinanceiroTituloPagarToDto(movimento: MovimentoFinanceiroTituloPagar): MovimentoFinanceiroTituloPagarResponseDto {
    const dto: MovimentoFinanceiroTituloPagarResponseDto = {
      id: movimento.id,
      tenantId: movimento.tenantId,
      idParcelaTituloPagar: movimento.idParcelaTituloPagar,
      idTituloPagar: movimento.idTituloPagar,
      idPlanoContaGerencial: movimento.idPlanoContaGerencial,
      idCentroCusto: movimento.idCentroCusto,
      dataMovimento: movimento.dataMovimento instanceof Date 
        ? movimento.dataMovimento 
        : new Date(movimento.dataMovimento),
      valorMovimento: Number(movimento.valorMovimento),
      valorMovimentoMoedaOriginal: movimento.valorMovimentoMoedaOriginal 
        ? Number(movimento.valorMovimentoMoedaOriginal) 
        : null,
      valorMovimentoMoedaPadrao: movimento.valorMovimentoMoedaPadrao 
        ? Number(movimento.valorMovimentoMoedaPadrao) 
        : null,
      percentualRateioPlanoConta: Number(movimento.percentualRateioPlanoConta),
      percentualRateioCentroCusto: Number(movimento.percentualRateioCentroCusto),
      observacao: movimento.observacao,
      usercreation: movimento.usercreation,
      datecreation: movimento.datecreation instanceof Date 
        ? movimento.datecreation 
        : new Date(movimento.datecreation),
    };

    // Mapear relacionamentos se disponíveis
    if ((movimento as any).parcelaTituloPagar) {
      const parcela = (movimento as any).parcelaTituloPagar;
      dto.parcelaTituloPagar = {
        id: parcela.id,
        numeroParcela: parcela.numeroParcela,
        dataVencimento: parcela.dataVencimento instanceof Date 
          ? parcela.dataVencimento.toISOString().split('T')[0] 
          : parcela.dataVencimento,
        valorParcela: Number(parcela.valorParcela),
        dataBaixa: parcela.dataBaixa 
          ? (parcela.dataBaixa instanceof Date 
              ? parcela.dataBaixa.toISOString().split('T')[0] 
              : parcela.dataBaixa)
          : null,
        valorBaixa: parcela.valorBaixa ? Number(parcela.valorBaixa) : null,
        status: parcela.status,
      };
    }

    if ((movimento as any).tituloPagar) {
      const titulo = (movimento as any).tituloPagar;
      dto.tituloPagar = {
        id: titulo.id,
        numeroTitulo: titulo.numeroTitulo,
        valorTitulo: Number(titulo.valorTitulo),
        dataLancamento: titulo.dataLancamento instanceof Date 
          ? titulo.dataLancamento.toISOString().split('T')[0] 
          : titulo.dataLancamento,
        status: titulo.status,
      };
    }

    if ((movimento as any).planoContaGerencial) {
      const planoConta = (movimento as any).planoContaGerencial;
      dto.planoContaGerencial = {
        id: planoConta.id,
        item: planoConta.item,
        descricao: planoConta.descricao,
        tipo: planoConta.tipo,
        nivel: planoConta.nivel,
      };
    }

    if ((movimento as any).centroCusto) {
      const centroCusto = (movimento as any).centroCusto;
      dto.centroCusto = {
        id: centroCusto.id,
        codigo: centroCusto.codigo,
        nome: centroCusto.nome,
        ativo: centroCusto.ativo,
      };
    }

    if ((movimento as any).usuarioCriador) {
      const usuario = (movimento as any).usuarioCriador;
      dto.usuarioCriador = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      };
    }

    return dto;
  }

  /**
   * Converte entidade MovimentoFinanceiroTituloReceber para DTO
   * 
   * @param movimento - Entidade do movimento financeiro
   * @returns DTO de resposta
   */
  private movimentoFinanceiroTituloReceberToDto(movimento: MovimentoFinanceiroTituloReceber): MovimentoFinanceiroTituloReceberResponseDto {
    const dto: MovimentoFinanceiroTituloReceberResponseDto = {
      id: movimento.id,
      tenantId: movimento.tenantId,
      idParcelaTituloReceber: movimento.idParcelaTituloReceber,
      idTituloReceber: movimento.idTituloReceber,
      idPlanoContaGerencial: movimento.idPlanoContaGerencial,
      idCentroCusto: movimento.idCentroCusto,
      dataMovimento: movimento.dataMovimento instanceof Date 
        ? movimento.dataMovimento 
        : new Date(movimento.dataMovimento),
      valorMovimento: Number(movimento.valorMovimento),
      valorMovimentoMoedaOriginal: movimento.valorMovimentoMoedaOriginal 
        ? Number(movimento.valorMovimentoMoedaOriginal) 
        : null,
      valorMovimentoMoedaPadrao: movimento.valorMovimentoMoedaPadrao 
        ? Number(movimento.valorMovimentoMoedaPadrao) 
        : null,
      percentualRateioPlanoConta: Number(movimento.percentualRateioPlanoConta),
      percentualRateioCentroCusto: Number(movimento.percentualRateioCentroCusto),
      observacao: movimento.observacao,
      usercreation: movimento.usercreation,
      datecreation: movimento.datecreation instanceof Date 
        ? movimento.datecreation 
        : new Date(movimento.datecreation),
    };

    // Mapear relacionamentos se disponíveis
    if ((movimento as any).parcelaTituloReceber) {
      const parcela = (movimento as any).parcelaTituloReceber;
      dto.parcelaTituloReceber = {
        id: parcela.id,
        numeroParcela: parcela.numeroParcela,
        dataVencimento: parcela.dataVencimento instanceof Date 
          ? parcela.dataVencimento.toISOString().split('T')[0] 
          : parcela.dataVencimento,
        valorParcela: Number(parcela.valorParcela),
        dataBaixa: parcela.dataBaixa 
          ? (parcela.dataBaixa instanceof Date 
              ? parcela.dataBaixa.toISOString().split('T')[0] 
              : parcela.dataBaixa)
          : null,
        valorBaixa: parcela.valorBaixa ? Number(parcela.valorBaixa) : null,
        status: parcela.status,
      };
    }

    if ((movimento as any).tituloReceber) {
      const titulo = (movimento as any).tituloReceber;
      dto.tituloReceber = {
        id: titulo.id,
        numeroTitulo: titulo.numeroTitulo,
        valorTitulo: Number(titulo.valorTitulo),
        dataLancamento: titulo.dataLancamento instanceof Date 
          ? titulo.dataLancamento.toISOString().split('T')[0] 
          : titulo.dataLancamento,
        status: titulo.status,
      };
    }

    if ((movimento as any).planoContaGerencial) {
      const planoConta = (movimento as any).planoContaGerencial;
      dto.planoContaGerencial = {
        id: planoConta.id,
        item: planoConta.item,
        descricao: planoConta.descricao,
        tipo: planoConta.tipo,
        nivel: planoConta.nivel,
      };
    }

    if ((movimento as any).centroCusto) {
      const centroCusto = (movimento as any).centroCusto;
      dto.centroCusto = {
        id: centroCusto.id,
        codigo: centroCusto.codigo,
        nome: centroCusto.nome,
        ativo: centroCusto.ativo,
      };
    }

    if ((movimento as any).usuarioCriador) {
      const usuario = (movimento as any).usuarioCriador;
      dto.usuarioCriador = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      };
    }

    return dto;
  }
}
