/**
 * RecorrenciaFinanceiraApplicationService
 *
 * Gerencia recorrências financeiras (templates de lançamentos periódicos).
 * Orquestra a geração automática de TituloPagar/Receber + LancamentoRecorrente.
 *
 * RN-15 a RN-21: Regras de recorrência
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IRecorrenciaFinanceiraApplicationService } from './IRecorrenciaFinanceiraApplicationService';
import { IRecorrenciaFinanceiraRepository } from '../../../infrastructure/repository/IRecorrenciaFinanceiraRepository';
import { ILancamentoRecorrenteRepository } from '../../../infrastructure/repository/ILancamentoRecorrenteRepository';
import { ITituloPagarRepository } from '../../../infrastructure/repository/ITituloPagarRepository';
import { ITituloReceberRepository } from '../../../infrastructure/repository/ITituloReceberRepository';
import { IParcelaTituloPagarRepository } from '../../../infrastructure/repository/IParcelaTituloPagarRepository';
import { IParcelaTituloReceberRepository } from '../../../infrastructure/repository/IParcelaTituloReceberRepository';
import { RecorrenciaFinanceiraMapper } from '../../mappers/RecorrenciaFinanceiraMapper';
import { LancamentoRecorrenteMapper } from '../../mappers/LancamentoRecorrenteMapper';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, BusinessException, ForbiddenException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { CacheEvict, Cacheable } from '../../../core/cache';
import { getRequestContext } from '../../../core/authorization/helpers';
import { IAuditService } from '../../../core/audit/IAuditService';
import RecorrenciaFinanceira, { Periodicidade, TipoRecorrencia } from '../../../models/RecorrenciaFinanceira';
import { StatusLancamentoRecorrente } from '../../../models/LancamentoRecorrente';
import { StatusTituloPagar } from '../../../models/TituloPagar';

@Injectable()
export class RecorrenciaFinanceiraApplicationService implements IRecorrenciaFinanceiraApplicationService {
  private mapper: RecorrenciaFinanceiraMapper;
  private lancamentoMapper: LancamentoRecorrenteMapper;

  constructor(
    @Inject(TYPES.IAuditService) private auditService: IAuditService,
    @Inject(TYPES.IRecorrenciaFinanceiraRepository) private recorrenciaRepository: IRecorrenciaFinanceiraRepository,
    @Inject(TYPES.ILancamentoRecorrenteRepository) private lancamentoRepository: ILancamentoRecorrenteRepository,
    @Inject(TYPES.ITituloPagarRepository) private tituloPagarRepository: ITituloPagarRepository,
    @Inject(TYPES.ITituloReceberRepository) private tituloReceberRepository: ITituloReceberRepository,
    @Inject(TYPES.IParcelaTituloPagarRepository) private parcelaPagarRepository: IParcelaTituloPagarRepository,
    @Inject(TYPES.IParcelaTituloReceberRepository) private parcelaReceberRepository: IParcelaTituloReceberRepository
  ) {
    this.mapper = new RecorrenciaFinanceiraMapper();
    this.lancamentoMapper = new LancamentoRecorrenteMapper();
  }

  @RequirePermission('recorrenciaFinanceira.create')
  @Transactional()
  @Auditable('RecorrenciaFinanceira')
  @CacheEvict('recorrenciaFinanceira:list:*', true)
  async create(dto: any): Promise<any> {
    const context = getRequestContext();
    if (!context?.getUserId()) throw new ForbiddenException('Usuário não autenticado.', 'USER_NOT_AUTHENTICATED');
    const userId = context.getUserId()!;
    const tenantId = context.getTenantId();
    if (!tenantId) throw new ForbiddenException('Tenant não identificado.', 'TENANT_NOT_IDENTIFIED');

    // Validações de negócio
    if (dto.dataFim && new Date(dto.dataFim) <= new Date(dto.dataInicio)) {
      throw new BusinessException('data_fim deve ser posterior a data_inicio', 'DATA_FIM_INVALIDA');
    }
    if (dto.periodicidade === 'SAFRA' && !dto.idSafra) {
      throw new BusinessException('Para periodicidade SAFRA, idSafra é obrigatório', 'SAFRA_OBRIGATORIA');
    }

    const entity = await this.mapper.toEntity(dto);
    (entity as any).tenantId = tenantId;
    (entity as any).usuarioId = userId;
    (entity as any).usercreation = userId;
    (entity as any).datecreation = new Date();
    (entity as any).geracoesRealizadas = 0;

    const created = await this.recorrenciaRepository.create(entity as any);
    return this.mapper.toDto(created);
  }

  @RequirePermission('recorrenciaFinanceira.update')
  @Transactional()
  @Auditable('RecorrenciaFinanceira')
  @CacheEvict('recorrenciaFinanceira:list:*', true)
  async update(id: number | string, dto: any): Promise<any> {
    const existing = await this.recorrenciaRepository.findById(id);
    if (!existing) throw new NotFoundException('RecorrenciaFinanceira', id);

    if (dto.dataFim && dto.dataInicio && new Date(dto.dataFim) <= new Date(dto.dataInicio)) {
      throw new BusinessException('data_fim deve ser posterior a data_inicio', 'DATA_FIM_INVALIDA');
    }

    const entity = await this.mapper.toEntity(dto);
    const updated = await this.recorrenciaRepository.update(id, entity as any);
    return this.mapper.toDto(updated);
  }

  @RequirePermission('recorrenciaFinanceira.delete')
  @Transactional()
  @Auditable('RecorrenciaFinanceira')
  @CacheEvict('recorrenciaFinanceira:list:*', true)
  async delete(id: number | string): Promise<boolean> {
    const existing = await this.recorrenciaRepository.findById(id);
    if (!existing) return false;

    // RN-20: Não permitir exclusão com lançamentos existentes
    const lancamentos = await this.lancamentoRepository.findByRecorrencia(Number(id));
    if (lancamentos.count > 0) {
      throw new BusinessException(
        'Não é possível excluir recorrência com lançamentos existentes. Considere desativá-la.',
        'RECORRENCIA_COM_LANCAMENTOS'
      );
    }

    return this.recorrenciaRepository.delete(id);
  }

  @RequirePermission('recorrenciaFinanceira.read')
  @Cacheable('recorrenciaFinanceira:getById:{0}', 3600)
  async getById(id: number | string): Promise<any | null> {
    const entity = await this.recorrenciaRepository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  @RequirePermission('recorrenciaFinanceira.read')
  async list(page = 1, limit = 10, tipo?: string, ativa?: boolean, filtros?: Record<string, unknown>): Promise<PaginatedResult<any>> {
    const repoFiltros: any = { ...filtros };
    if (tipo) repoFiltros.tipo = tipo;
    if (ativa !== undefined) repoFiltros.ativa = ativa;

    const result = await this.recorrenciaRepository.findAllPaginatedFiltered(page, limit, repoFiltros);
    return {
      ...result,
      data: result.data.map((e: any) => this.mapper.toDto(e)),
    };
  }

  @RequirePermission('recorrenciaFinanceira.read')
  async getKpis(): Promise<any> {
    return this.recorrenciaRepository.getKpis();
  }

  @RequirePermission('recorrenciaFinanceira.update')
  @Transactional()
  @CacheEvict('recorrenciaFinanceira:list:*', true)
  async toggleAtiva(id: number): Promise<any> {
    const existing = await this.recorrenciaRepository.findById(id);
    if (!existing) throw new NotFoundException('RecorrenciaFinanceira', id);

    const updated = await this.recorrenciaRepository.update(id, {
      ativa: !existing.ativa,
    } as any);
    return this.mapper.toDto(updated);
  }

  /**
   * RN-15: Verifica recorrências ativas e gera títulos quando necessário
   */
  @Transactional()
  async gerarProximosLancamentos(tenantId?: number): Promise<{ gerados: number; ignorados: number; erros: number }> {
    const recorrencias = await this.recorrenciaRepository.findAtivas(tenantId);
    let gerados = 0, ignorados = 0, erros = 0;
    const hoje = new Date();

    for (const rec of recorrencias) {
      try {
        const proximoVencimento = this.calcularProximoVencimento(rec);
        if (!proximoVencimento) {
          ignorados++;
          continue;
        }

        // Verificar se está dentro da antecedência
        const diasAteVencimento = Math.floor((proximoVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        if (diasAteVencimento > rec.antecedenciaGeracaoDias) {
          ignorados++;
          continue;
        }

        // Verificar idempotência
        const dataRef = `${proximoVencimento.getFullYear()}-${String(proximoVencimento.getMonth() + 1).padStart(2, '0')}-01`;
        const existe = await this.lancamentoRepository.existeParaReferencia(rec.id, dataRef);
        if (existe) {
          ignorados++;
          continue;
        }

        // Verificar limite de gerações
        if (rec.numeroMaximoGeracoes && rec.geracoesRealizadas >= rec.numeroMaximoGeracoes) {
          await this.recorrenciaRepository.update(rec.id, { ativa: false } as any);
          ignorados++;
          continue;
        }

        // Gerar título
        await this.gerarTituloRecorrente(rec, proximoVencimento, dataRef);
        gerados++;
      } catch {
        erros++;
      }
    }

    return { gerados, ignorados, erros };
  }

  calcularProximoVencimento(recorrencia: any): Date | null {
    const hoje = new Date();
    const dataInicio = new Date(recorrencia.dataInicio);
    if (dataInicio > hoje) return null;
    if (recorrencia.dataFim && new Date(recorrencia.dataFim) < hoje) return null;

    const mesesPorPeriodicidade: Record<string, number> = {
      SEMANAL: 0,
      QUINZENAL: 0,
      MENSAL: 1,
      BIMESTRAL: 2,
      TRIMESTRAL: 3,
      SEMESTRAL: 6,
      ANUAL: 12,
      SAFRA: 12,
    };

    const meses = mesesPorPeriodicidade[recorrencia.periodicidade] || 1;

    // Calcular baseado em gerações já realizadas
    const proximaData = new Date(dataInicio);

    if (recorrencia.periodicidade === 'SEMANAL') {
      proximaData.setDate(proximaData.getDate() + recorrencia.geracoesRealizadas * 7);
    } else if (recorrencia.periodicidade === 'QUINZENAL') {
      proximaData.setDate(proximaData.getDate() + recorrencia.geracoesRealizadas * 15);
    } else {
      proximaData.setMonth(proximaData.getMonth() + recorrencia.geracoesRealizadas * meses);
    }

    // RN-18: Ajustar dia do vencimento
    const dia = recorrencia.diaVencimento;
    const ano = proximaData.getFullYear();
    const mes = proximaData.getMonth();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    proximaData.setDate(Math.min(dia, ultimoDia));

    return proximaData;
  }

  private async gerarTituloRecorrente(recorrencia: any, dataVencimento: Date, dataReferencia: string): Promise<void> {
    const context = getRequestContext();
    const userId = context?.getUserId() || recorrencia.usercreation;
    const tenantId = recorrencia.tenantId;

    // RN-16: Gerar número do título automaticamente
    const seq = recorrencia.geracoesRealizadas + 1;
    const aaaamm = `${dataVencimento.getFullYear()}${String(dataVencimento.getMonth() + 1).padStart(2, '0')}`;
    const numeroTitulo = `REC-${recorrencia.id}-${aaaamm}`;

    const tituloData: any = {
      tenantId,
      idFornecedor: recorrencia.idFornecedorCliente,
      idPortador: recorrencia.idPortador,
      idProdutor: recorrencia.idProdutor,
      idFazenda: recorrencia.idFazenda,
      idSafra: recorrencia.idSafra,
      idMoeda: recorrencia.idMoeda,
      dataLancamento: new Date().toISOString().split('T')[0],
      numeroTitulo,
      valorTitulo: recorrencia.valor,
      quantidadeParcelas: 1,
      tipoGeracao: 'RECORRENTE',
      recorrenciaFinanceiraId: recorrencia.id,
      status: 'ABERTO',
      usercreation: userId,
      datecreation: new Date(),
    };

    let tituloId: number;

    if (recorrencia.tipo === TipoRecorrencia.PAGAR) {
      const titulo = await this.tituloPagarRepository.create(tituloData);
      tituloId = titulo.id;

      // Criar parcela única
      await this.parcelaPagarRepository.create({
        tenantId,
        idTituloPagar: tituloId,
        numeroParcela: 1,
        dataVencimento: dataVencimento.toISOString().split('T')[0],
        valorParcela: recorrencia.valor,
        valorTotal: recorrencia.valor,
        valorSaldo: recorrencia.valor,
        numeroTotalParcelas: 1,
        status: 'ABERTA',
        usercreation: userId,
        datecreation: new Date(),
      } as any);
    } else {
      const titulo = await this.tituloReceberRepository.create(tituloData);
      tituloId = titulo.id;

      await this.parcelaReceberRepository.create({
        tenantId,
        idTituloReceber: tituloId,
        numeroParcela: 1,
        dataVencimento: dataVencimento.toISOString().split('T')[0],
        valorParcela: recorrencia.valor,
        valorTotal: recorrencia.valor,
        valorSaldo: recorrencia.valor,
        numeroTotalParcelas: 1,
        status: 'ABERTA',
        usercreation: userId,
        datecreation: new Date(),
      } as any);
    }

    // Criar lançamento recorrente
    await this.lancamentoRepository.create({
      tenantId,
      recorrenciaFinanceiraId: recorrencia.id,
      tituloPagarId: recorrencia.tipo === TipoRecorrencia.PAGAR ? tituloId : null,
      tituloReceberId: recorrencia.tipo === TipoRecorrencia.RECEBER ? tituloId : null,
      dataReferencia,
      dataVencimentoGerado: dataVencimento.toISOString().split('T')[0],
      valorGerado: recorrencia.valor,
      status: StatusLancamentoRecorrente.GERADO,
      usercreation: userId,
      datecreation: new Date(),
    } as any);

    // Incrementar geracoesRealizadas
    await this.recorrenciaRepository.update(recorrencia.id, {
      geracoesRealizadas: recorrencia.geracoesRealizadas + 1,
    } as any);

    // RN-16: Auto-desativar se atingiu limite
    if (recorrencia.numeroMaximoGeracoes && (recorrencia.geracoesRealizadas + 1) >= recorrencia.numeroMaximoGeracoes) {
      await this.recorrenciaRepository.update(recorrencia.id, { ativa: false } as any);
    }
  }

  @RequirePermission('recorrenciaFinanceira.create')
  @Transactional()
  async gerarLancamentoManual(id: number): Promise<any> {
    const rec = await this.recorrenciaRepository.findById(id);
    if (!rec) throw new NotFoundException('RecorrenciaFinanceira', id);

    const proximoVencimento = this.calcularProximoVencimento(rec);
    if (!proximoVencimento) {
      throw new BusinessException('Não há próximo vencimento a gerar.', 'SEM_PROXIMO_VENCIMENTO');
    }

    const dataRef = `${proximoVencimento.getFullYear()}-${String(proximoVencimento.getMonth() + 1).padStart(2, '0')}-01`;
    const existe = await this.lancamentoRepository.existeParaReferencia(rec.id, dataRef);
    if (existe) {
      throw new BusinessException('Já existe lançamento para este período.', 'LANCAMENTO_JA_EXISTE');
    }

    await this.gerarTituloRecorrente(rec, proximoVencimento, dataRef);

    const lancamento = await this.lancamentoRepository.findUltimoLancamento(rec.id);
    return lancamento ? this.lancamentoMapper.toDto(lancamento) : null;
  }

  previewProximasGeracoes(dto: any, count: number): Promise<any[]> {
    const previews: any[] = [];
    const mockRec = {
      ...dto,
      geracoesRealizadas: 0,
      id: 0,
    };

    for (let i = 0; i < count; i++) {
      const venc = this.calcularProximoVencimento({ ...mockRec, geracoesRealizadas: i });
      if (!venc) break;
      previews.push({
        numero: i + 1,
        dataReferencia: `${venc.getFullYear()}-${String(venc.getMonth() + 1).padStart(2, '0')}-01`,
        dataVencimento: venc.toISOString().split('T')[0],
        valor: dto.valor,
      });
    }

    return Promise.resolve(previews);
  }
}
