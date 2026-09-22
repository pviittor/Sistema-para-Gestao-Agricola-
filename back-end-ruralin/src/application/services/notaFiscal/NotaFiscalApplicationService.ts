import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { INotaFiscalApplicationService } from './INotaFiscalApplicationService';
import { INotaFiscalRepository } from '../../../infrastructure/repository/INotaFiscalRepository';
import { IPessoaRepository } from '../../../infrastructure/repository/IPessoaRepository';
import { IItemNotaFiscalRepository } from '../../../infrastructure/repository/IItemNotaFiscalRepository';
import { IIntegracaoFinanceiraService } from '../integracao/IIntegracaoFinanceiraService';
import { IIntegracaoEstoqueService } from '../integracao/IIntegracaoEstoqueService';
import { INfeXmlGeneratorService } from '../nfe/INfeXmlGeneratorService';
import { INfeAssinaturaService } from '../nfe/INfeAssinaturaService';
import { INfeSefazService } from '../nfe/INfeSefazService';
import { ICertificadoDigitalRepository } from '../../../infrastructure/repository/ICertificadoDigitalRepository';
import { CreateNotaFiscalDto } from '../../dto/notaFiscal/CreateNotaFiscalDto';
import { UpdateNotaFiscalDto } from '../../dto/notaFiscal/UpdateNotaFiscalDto';
import { NotaFiscalResponseDto } from '../../dto/notaFiscal/NotaFiscalResponseDto';
import { CreateNotaFiscalCompletoDto } from '../../dto/notaFiscal/CreateNotaFiscalCompletoDto';
import { UpdateNotaFiscalCompletoDto } from '../../dto/notaFiscal/UpdateNotaFiscalCompletoDto';
import { EmitirNfeResultDto } from '../../dto/nfe/EmitirNfeResultDto';
import { NotaFiscalMapper } from '../../mappers/NotaFiscalMapper';
import { ItemNotaFiscalMapper } from '../../mappers/ItemNotaFiscalMapper';
import { StatusNotaFiscal, ModeloNotaFiscal, FinalidadeNotaFiscal, TipoNotaFiscal } from '../../../models/enums/NotaFiscalEnums';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { BusinessException } from '../../../core/exceptions/BusinessException';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para NotaFiscal
 *
 * Implementa a logica de negocio para operacoes de notas fiscais,
 * incluindo validacoes, cancelamento, autorizacao, inutilizacao,
 * movimentacao de estoque e geracao de financeiro.
 */
@Injectable()
export class NotaFiscalApplicationService implements INotaFiscalApplicationService {
  private itemMapper = new ItemNotaFiscalMapper();

  constructor(
    @Inject(TYPES.INotaFiscalRepository) private notaFiscalRepository: INotaFiscalRepository,
    @Inject(TYPES.IPessoaRepository) private pessoaRepository: IPessoaRepository,
    @Inject(TYPES.IItemNotaFiscalRepository) private itemNotaFiscalRepository: IItemNotaFiscalRepository,
    @Inject(TYPES.IIntegracaoFinanceiraService) private integracaoFinanceiraService: IIntegracaoFinanceiraService,
    @Inject(TYPES.IIntegracaoEstoqueService) private integracaoEstoqueService: IIntegracaoEstoqueService,
    @Inject(TYPES.INfeXmlGeneratorService) private nfeXmlGeneratorService: INfeXmlGeneratorService,
    @Inject(TYPES.INfeAssinaturaService) private nfeAssinaturaService: INfeAssinaturaService,
    @Inject(TYPES.INfeSefazService) private nfeSefazService: INfeSefazService,
    @Inject(TYPES.ICertificadoDigitalRepository) private certificadoDigitalRepository: ICertificadoDigitalRepository,
    private notaFiscalMapper: NotaFiscalMapper
  ) {}

  /**
   * Recalcula o valor total da nota fiscal
   * Rule 1: vl_total = vl_produtos + vl_frete + vl_seguro + vl_outros + vl_ipi - vl_desconto
   */
  private calcularTotal(entity: any): number {
    const vlProdutos = Number(entity.vl_produtos) || 0;
    const vlFrete = Number(entity.vl_frete) || 0;
    const vlSeguro = Number(entity.vl_seguro) || 0;
    const vlOutros = Number(entity.vl_outros) || 0;
    const vlIpi = Number(entity.vl_ipi) || 0;
    const vlDesconto = Number(entity.vl_desconto) || 0;
    return Number((vlProdutos + vlFrete + vlSeguro + vlOutros + vlIpi - vlDesconto).toFixed(2));
  }

  /**
   * Lista todas as notas fiscais com paginacao
   */
  @RequirePermission('nota_fiscal.read')
  @Cacheable('nota_fiscal:list:{0}:{1}', 300)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<NotaFiscalResponseDto>> {
    const result = await this.notaFiscalRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.notaFiscalMapper.toDto(item)),
    };
  }

  /**
   * Busca uma nota fiscal por ID
   */
  @RequirePermission('nota_fiscal.read')
  @Cacheable('nota_fiscal:getById', 300)
  async getById(id: number | string): Promise<NotaFiscalResponseDto | null> {
    const nf = await this.notaFiscalRepository.findById(id);
    return nf ? this.notaFiscalMapper.toDto(nf) : null;
  }

  /**
   * Cria uma nova nota fiscal
   *
   * Regras de negocio aplicadas:
   * - Rule 1: Calculo automatico de vl_total
   * - Rule 2: vl_desconto nao pode exceder vl_produtos
   * - Rule 9: numero+serie+modelo unico por empresa+emitente
   * - Rule 10: finalidade=devolucao requer notaFiscalRefId
   * - Rule 11: tipo=entrada → emitente deve ser fornecedor_pessoa
   * - Rule 12: tipo=saida → destinatario deve ser cliente_pessoa
   */
  @RequirePermission('nota_fiscal.create')
  @Auditable('NotaFiscal')
  @CacheEvict('nota_fiscal:list')
  @Transactional()
  async create(dto: CreateNotaFiscalDto): Promise<NotaFiscalResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto nao disponivel');
    }

    const userId = context.getUserId();
    const tenantId = context.getTenantId();

    if (!userId || !tenantId) {
      throw new BadRequestException('Usuario nao autenticado ou tenant nao identificado');
    }

    const entityData = await this.notaFiscalMapper.toEntity(dto);

    // Rule 10: finalidade=devolucao requer notaFiscalRefId
    if (dto.finalidade === FinalidadeNotaFiscal.DEVOLUCAO && !dto.notaFiscalRefId) {
      throw new BusinessException(
        'Para notas de devolucao, e obrigatorio informar a nota fiscal de referencia',
        'NF_DEVOLUCAO_SEM_REFERENCIA'
      );
    }

    // Rule 11: tipo=entrada → emitente deve ser fornecedor_pessoa
    if (dto.tipo === TipoNotaFiscal.ENTRADA) {
      const emitente = await this.pessoaRepository.findById(dto.emitenteId);
      if (!emitente || !emitente.fornecedor_pessoa) {
        throw new BusinessException(
          'Para notas de entrada, o emitente deve ser um fornecedor',
          'NF_EMITENTE_NAO_FORNECEDOR'
        );
      }
    }

    // Rule 12: tipo=saida → destinatario deve ser cliente_pessoa
    if (dto.tipo === TipoNotaFiscal.SAIDA) {
      const destinatario = await this.pessoaRepository.findById(dto.destinatarioId);
      if (!destinatario || !destinatario.cliente_pessoa) {
        throw new BusinessException(
          'Para notas de saida, o destinatario deve ser um cliente',
          'NF_DESTINATARIO_NAO_CLIENTE'
        );
      }
    }

    // Rule 9: numero+serie+modelo unico por empresa+emitente (tenant scope)
    const existing = await this.notaFiscalRepository.findByNumeroSerie(dto.numero, dto.serie, dto.modelo);
    if (existing) {
      throw new BusinessException(
        'Ja existe uma nota fiscal com este numero, serie e modelo para este emitente',
        'NF_NUMERO_SERIE_DUPLICADO'
      );
    }

    // Rule 2: vl_desconto nao pode exceder vl_produtos
    const vlProdutos = Number(entityData.vl_produtos) || 0;
    const vlDesconto = Number(entityData.vl_desconto) || 0;
    if (vlDesconto > vlProdutos) {
      throw new BusinessException(
        'O valor do desconto nao pode ser maior que o valor dos produtos',
        'NF_DESCONTO_EXCEDE_PRODUTOS'
      );
    }

    // Rule 1: Recalcular vl_total
    (entityData as any).vl_total = this.calcularTotal(entityData);

    (entityData as any).usercreation = userId;
    (entityData as any).tenantId = tenantId;

    const nf = await this.notaFiscalRepository.create(entityData);

    // Buscar com associacoes
    const created = await this.notaFiscalRepository.findById(nf.id_nf);
    return this.notaFiscalMapper.toDto(created!);
  }

  /**
   * Atualiza uma nota fiscal existente
   *
   * Regras de negocio aplicadas:
   * - Rule 1: Recalculo automatico de vl_total
   * - Rule 2: vl_desconto nao pode exceder vl_produtos
   * - Rule 3: status=autorizada → nao pode editar, somente cancelar
   * - Rule 4: status=cancelada → nao pode alterar
   */
  @RequirePermission('nota_fiscal.update')
  @Auditable('NotaFiscal')
  @CacheEvict('nota_fiscal:list:*', true)
  @CacheEvict('nota_fiscal:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateNotaFiscalDto): Promise<NotaFiscalResponseDto> {
    const nf = await this.notaFiscalRepository.findById(id);
    if (!nf) {
      throw new NotFoundException('Nota fiscal', String(id));
    }

    // Rule 4: status=cancelada → nao pode alterar
    if (nf.status === StatusNotaFiscal.CANCELADA) {
      throw new BusinessException(
        'Nota fiscal cancelada nao pode ser alterada',
        'NF_CANCELADA_IMUTAVEL'
      );
    }

    // Rule 3: status=autorizada → nao pode editar, somente cancelar
    if (nf.status === StatusNotaFiscal.AUTORIZADA) {
      throw new BusinessException(
        'Nota fiscal autorizada nao pode ser editada, somente cancelada',
        'NF_AUTORIZADA_IMUTAVEL'
      );
    }

    const entityData = await this.notaFiscalMapper.toEntity(dto);

    // Merge para recalcular totais
    const merged = {
      vl_produtos: entityData.vl_produtos !== undefined ? entityData.vl_produtos : nf.vl_produtos,
      vl_frete: entityData.vl_frete !== undefined ? entityData.vl_frete : nf.vl_frete,
      vl_seguro: entityData.vl_seguro !== undefined ? entityData.vl_seguro : nf.vl_seguro,
      vl_outros: entityData.vl_outros !== undefined ? entityData.vl_outros : nf.vl_outros,
      vl_ipi: entityData.vl_ipi !== undefined ? entityData.vl_ipi : nf.vl_ipi,
      vl_desconto: entityData.vl_desconto !== undefined ? entityData.vl_desconto : nf.vl_desconto,
    };

    // Rule 2: vl_desconto nao pode exceder vl_produtos
    const vlProdutos = Number(merged.vl_produtos) || 0;
    const vlDesconto = Number(merged.vl_desconto) || 0;
    if (vlDesconto > vlProdutos) {
      throw new BusinessException(
        'O valor do desconto nao pode ser maior que o valor dos produtos',
        'NF_DESCONTO_EXCEDE_PRODUTOS'
      );
    }

    // Rule 1: Recalcular vl_total
    (entityData as any).vl_total = this.calcularTotal(merged);

    const updated = await this.notaFiscalRepository.update(id, entityData);
    return this.notaFiscalMapper.toDto(updated);
  }

  /**
   * Remove uma nota fiscal (soft delete via ativo=false)
   */
  @RequirePermission('nota_fiscal.delete')
  @Auditable('NotaFiscal')
  @CacheEvict('nota_fiscal:list:*', true)
  @CacheEvict('nota_fiscal:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const nf = await this.notaFiscalRepository.findById(id);
    if (!nf) {
      return false;
    }

    await this.notaFiscalRepository.delete(id);
    return true;
  }

  /**
   * Cancela uma nota fiscal
   *
   * Regras de negocio:
   * - Rule 4: status=cancelada → nao pode cancelar novamente
   * - Rule 6: Cancelamento somente dentro de 24h para modelos 55/65
   * - Rule 7: Se estoque_movimentado=true, seta flag (reversao pelo servico de itens)
   */
  @RequirePermission('nota_fiscal.cancel')
  @Auditable('NotaFiscal')
  @CacheEvict('nota_fiscal:list:*', true)
  @CacheEvict('nota_fiscal:getById:*', true)
  @Transactional()
  async cancelar(id: number, motivo: string): Promise<NotaFiscalResponseDto> {
    const nf = await this.notaFiscalRepository.findById(id);
    if (!nf) {
      throw new NotFoundException('Nota fiscal', String(id));
    }

    // Rule 4: status=cancelada → nao pode cancelar novamente
    if (nf.status === StatusNotaFiscal.CANCELADA) {
      throw new BusinessException(
        'Nota fiscal ja esta cancelada',
        'NF_JA_CANCELADA'
      );
    }

    // Somente notas autorizadas ou pendentes podem ser canceladas
    if (nf.status !== StatusNotaFiscal.AUTORIZADA && nf.status !== StatusNotaFiscal.PENDENTE && nf.status !== StatusNotaFiscal.RASCUNHO) {
      throw new BusinessException(
        'Somente notas com status rascunho, pendente ou autorizada podem ser canceladas',
        'NF_STATUS_NAO_CANCELAVEL'
      );
    }

    // Rule 6: Cancelamento somente dentro de 24h para modelos 55/65
    if (
      nf.status === StatusNotaFiscal.AUTORIZADA &&
      (nf.modelo === ModeloNotaFiscal.NFE || nf.modelo === ModeloNotaFiscal.NFCE)
    ) {
      const dataAutorizacao = nf.data_autorizacao ? new Date(nf.data_autorizacao) : new Date(nf.data_emissao);
      const agora = new Date();
      const diffHoras = (agora.getTime() - dataAutorizacao.getTime()) / (1000 * 60 * 60);
      if (diffHoras > 24) {
        throw new BusinessException(
          'Para NF-e e NFC-e, o cancelamento deve ser realizado em ate 24 horas apos a autorizacao',
          'NF_PRAZO_CANCELAMENTO_EXPIRADO'
        );
      }
    }

    const updateData: any = {
      status: StatusNotaFiscal.CANCELADA,
      motivo_cancelamento: motivo,
      data_cancelamento: new Date(),
    };

    // Rule 7: Se estoque ja movimentado, a reversao sera tratada pelo servico de itens
    // Aqui apenas registramos o cancelamento

    const updated = await this.notaFiscalRepository.update(id, updateData);
    return this.notaFiscalMapper.toDto(updated);
  }

  /**
   * Autoriza uma nota fiscal
   *
   * Regras de negocio:
   * - Rule 4: status=cancelada → nao pode autorizar
   * - Rule 8: chave_acesso obrigatoria para modelos 55/65
   */
  @RequirePermission('nota_fiscal.authorize')
  @Auditable('NotaFiscal')
  @CacheEvict('nota_fiscal:list:*', true)
  @CacheEvict('nota_fiscal:getById:*', true)
  @Transactional()
  async autorizar(id: number, chaveAcesso?: string, protocoloAutorizacao?: string): Promise<NotaFiscalResponseDto> {
    const nf = await this.notaFiscalRepository.findById(id);
    if (!nf) {
      throw new NotFoundException('Nota fiscal', String(id));
    }

    // Rule 4: status=cancelada → nao pode autorizar
    if (nf.status === StatusNotaFiscal.CANCELADA) {
      throw new BusinessException(
        'Nota fiscal cancelada nao pode ser autorizada',
        'NF_CANCELADA_IMUTAVEL'
      );
    }

    // Somente rascunho ou pendente podem ser autorizadas
    if (nf.status !== StatusNotaFiscal.RASCUNHO && nf.status !== StatusNotaFiscal.PENDENTE) {
      throw new BusinessException(
        'Somente notas com status rascunho ou pendente podem ser autorizadas',
        'NF_STATUS_NAO_AUTORIZAVEL'
      );
    }

    // Rule 8: chave_acesso obrigatoria para modelos 55/65
    const chave = chaveAcesso || nf.chave_acesso;
    if (
      (nf.modelo === ModeloNotaFiscal.NFE || nf.modelo === ModeloNotaFiscal.NFCE) &&
      !chave
    ) {
      throw new BusinessException(
        'Chave de acesso e obrigatoria para autorizacao de NF-e e NFC-e',
        'NF_CHAVE_ACESSO_OBRIGATORIA'
      );
    }

    const updateData: any = {
      status: StatusNotaFiscal.AUTORIZADA,
      data_autorizacao: new Date(),
    };

    if (chaveAcesso) {
      updateData.chave_acesso = chaveAcesso;
    }
    if (protocoloAutorizacao) {
      updateData.protocolo_autorizacao = protocoloAutorizacao;
    }

    const updated = await this.notaFiscalRepository.update(id, updateData);
    return this.notaFiscalMapper.toDto(updated);
  }

  /**
   * Inutiliza uma nota fiscal
   */
  @RequirePermission('nota_fiscal.inutilize')
  @Auditable('NotaFiscal')
  @CacheEvict('nota_fiscal:list:*', true)
  @CacheEvict('nota_fiscal:getById:*', true)
  @Transactional()
  async inutilizar(id: number, motivo: string): Promise<NotaFiscalResponseDto> {
    const nf = await this.notaFiscalRepository.findById(id);
    if (!nf) {
      throw new NotFoundException('Nota fiscal', String(id));
    }

    // Somente rascunho pode ser inutilizada
    if (nf.status !== StatusNotaFiscal.RASCUNHO && nf.status !== StatusNotaFiscal.PENDENTE) {
      throw new BusinessException(
        'Somente notas com status rascunho ou pendente podem ser inutilizadas',
        'NF_STATUS_NAO_INUTILIZAVEL'
      );
    }

    const updateData: any = {
      status: StatusNotaFiscal.INUTILIZADA,
      motivo_cancelamento: motivo,
      data_cancelamento: new Date(),
    };

    const updated = await this.notaFiscalRepository.update(id, updateData);
    return this.notaFiscalMapper.toDto(updated);
  }

  /**
   * Movimenta estoque a partir de uma nota fiscal autorizada
   *
   * Regras de negocio:
   * - Rule 13: somente status=autorizada
   * - Rule 14: nao pode movimentar mais de uma vez
   */
  @RequirePermission('nota_fiscal.stock_move')
  @Auditable('NotaFiscal')
  @CacheEvict('nota_fiscal:list:*', true)
  @CacheEvict('nota_fiscal:getById:*', true)
  @Transactional()
  async movimentarEstoque(id: number): Promise<NotaFiscalResponseDto> {
    const nf = await this.notaFiscalRepository.findById(id);
    if (!nf) {
      throw new NotFoundException('Nota fiscal', String(id));
    }

    // Rule 13: somente status=autorizada
    if (nf.status !== StatusNotaFiscal.AUTORIZADA) {
      throw new BusinessException(
        'Somente notas autorizadas podem ter o estoque movimentado',
        'NF_STATUS_NAO_AUTORIZADA'
      );
    }

    // Rule 14: nao pode movimentar mais de uma vez
    if (nf.estoque_movimentado) {
      throw new BusinessException(
        'O estoque desta nota fiscal ja foi movimentado',
        'NF_ESTOQUE_JA_MOVIMENTADO'
      );
    }

    // Delegar para IntegracaoEstoqueService que cria movimentos reais
    // e marca estoque_movimentado=true na NF
    const context = getRequestContext();
    const tenantId = context?.getTenantId() || (nf as any).tenantId;
    await this.integracaoEstoqueService.gerarMovimentosDeNotaFiscal(id, tenantId);

    // Recarregar NF atualizada
    const nfAtualizada = await this.notaFiscalRepository.findById(id);
    return this.notaFiscalMapper.toDto(nfAtualizada!);
  }

  /**
   * Gera lancamentos financeiros a partir de uma nota fiscal autorizada
   *
   * Regras de negocio:
   * - Rule 13: somente status=autorizada
   * - Rule 14: nao pode gerar mais de uma vez
   */
  @RequirePermission('nota_fiscal.finance_generate')
  @Auditable('NotaFiscal')
  @CacheEvict('nota_fiscal:list:*', true)
  @CacheEvict('nota_fiscal:getById:*', true)
  @Transactional()
  async gerarFinanceiro(id: number): Promise<NotaFiscalResponseDto> {
    const nf = await this.notaFiscalRepository.findById(id);
    if (!nf) {
      throw new NotFoundException('Nota fiscal', String(id));
    }

    // Rule 13: somente status=autorizada
    if (nf.status !== StatusNotaFiscal.AUTORIZADA) {
      throw new BusinessException(
        'Somente notas autorizadas podem gerar lancamentos financeiros',
        'NF_STATUS_NAO_AUTORIZADA'
      );
    }

    // Rule 14: nao pode gerar mais de uma vez
    if (nf.financeiro_gerado) {
      throw new BusinessException(
        'Os lancamentos financeiros desta nota fiscal ja foram gerados',
        'NF_FINANCEIRO_JA_GERADO'
      );
    }

    // Delegar para IntegracaoFinanceiraService conforme tipo da NF
    const context = getRequestContext();
    const tenantId = context?.getTenantId() || (nf as any).tenantId;

    if (nf.tipo === TipoNotaFiscal.SAIDA) {
      // NF saída → gera títulos a receber
      await this.integracaoFinanceiraService.gerarTitulosReceberDeNotaFiscal(id, tenantId);
    } else {
      // NF entrada → gera títulos a pagar
      await this.integracaoFinanceiraService.gerarTitulosPagarDeNotaFiscal(id, tenantId);
    }

    // Recarregar NF atualizada
    const nfAtualizada = await this.notaFiscalRepository.findById(id);
    return this.notaFiscalMapper.toDto(nfAtualizada!);
  }

  /**
   * Busca nota fiscal pela chave de acesso NF-e
   */
  @RequirePermission('nota_fiscal.read')
  @Cacheable('nota_fiscal:findByChaveAcesso', 300)
  async findByChaveAcesso(chaveAcesso: string): Promise<NotaFiscalResponseDto | null> {
    const nf = await this.notaFiscalRepository.findByChaveAcesso(chaveAcesso);
    return nf ? this.notaFiscalMapper.toDto(nf) : null;
  }

  /**
   * Lista notas fiscais por periodo de emissao
   */
  @RequirePermission('nota_fiscal.read')
  @Cacheable('nota_fiscal:findByPeriodo', 300)
  async findByPeriodo(dataInicio: string, dataFim: string, tipo?: string, status?: string): Promise<NotaFiscalResponseDto[]> {
    const notas = await this.notaFiscalRepository.findByPeriodo(dataInicio, dataFim, tipo, status);
    return notas.map(nf => this.notaFiscalMapper.toDto(nf));
  }

  /**
   * Lista notas fiscais por emitente
   */
  @RequirePermission('nota_fiscal.read')
  @Cacheable('nota_fiscal:findByEmitente', 300)
  async findByEmitente(emitenteId: number, tipo?: string): Promise<NotaFiscalResponseDto[]> {
    const notas = await this.notaFiscalRepository.findByEmitente(emitenteId, tipo);
    return notas.map(nf => this.notaFiscalMapper.toDto(nf));
  }

  /**
   * Lista notas fiscais por destinatario
   */
  @RequirePermission('nota_fiscal.read')
  @Cacheable('nota_fiscal:findByDestinatario', 300)
  async findByDestinatario(destinatarioId: number): Promise<NotaFiscalResponseDto[]> {
    const notas = await this.notaFiscalRepository.findByDestinatario(destinatarioId);
    return notas.map(nf => this.notaFiscalMapper.toDto(nf));
  }

  /**
   * Busca notas autorizadas que ainda nao movimentaram estoque
   */
  @RequirePermission('nota_fiscal.read')
  @Cacheable('nota_fiscal:findPendentesMovimentacao', 300)
  async findPendentesMovimentacao(tipo?: string): Promise<NotaFiscalResponseDto[]> {
    const notas = await this.notaFiscalRepository.findPendentesMovimentacao(tipo);
    return notas.map(nf => this.notaFiscalMapper.toDto(nf));
  }

  /**
   * Busca notas autorizadas sem financeiro gerado
   */
  @RequirePermission('nota_fiscal.read')
  @Cacheable('nota_fiscal:findPendentesFinanceiro', 300)
  async findPendentesFinanceiro(tipo?: string): Promise<NotaFiscalResponseDto[]> {
    const notas = await this.notaFiscalRepository.findPendentesFinanceiro(tipo);
    return notas.map(nf => this.notaFiscalMapper.toDto(nf));
  }

  /**
   * Soma de totais agrupados por tipo/periodo
   */
  @RequirePermission('nota_fiscal.read')
  @Cacheable('nota_fiscal:totalPorPeriodo', 300)
  async totalPorPeriodo(dataInicio: string, dataFim: string): Promise<any> {
    return await this.notaFiscalRepository.totalPorPeriodo(dataInicio, dataFim);
  }

  /**
   * Cria uma nota fiscal completa com itens em uma unica operacao atomica
   */
  @RequirePermission('nota_fiscal.create')
  @Transactional()
  @Auditable('NotaFiscal')
  @CacheEvict('notaFiscal:list:*', true)
  @CacheEvict('notaFiscal:periodo:*', true)
  @CacheEvict('notaFiscal:emitente:*', true)
  @CacheEvict('notaFiscal:destinatario:*', true)
  async createCompleto(dto: CreateNotaFiscalCompletoDto): Promise<NotaFiscalResponseDto> {
    // Reusar validacoes do create normal (cross-tenant, business rules)
    // Primeiro criar a NF sem itens usando a logica existente
    const notaFiscalDto = await this.create(dto);

    // Criar itens — injetar FK do pai + tenant + userId
    const context = getRequestContext();
    const userId = context?.getUserId();
    const tenantId = context?.getTenantId();

    for (let i = 0; i < dto.itens.length; i++) {
      const itemDto = dto.itens[i];
      const itemEntity = await this.itemMapper.toEntity({
        ...itemDto,
        notaFiscalId: notaFiscalDto.id_nf,
      } as any);

      // Calcular valores do item
      const quantidade = Number(itemDto.quantidade || 0);
      const vlUnitario = Number(itemDto.vl_unitario || 0);
      const vlDesconto = Number(itemDto.vl_desconto || 0);
      const vlFrete = Number(itemDto.vl_frete || 0);
      const vlSeguro = Number(itemDto.vl_seguro || 0);
      const vlOutros = Number(itemDto.vl_outros || 0);
      const vlBruto = Number((quantidade * vlUnitario).toFixed(2));
      const vlTotal = Number((vlBruto - vlDesconto + vlFrete + vlSeguro + vlOutros).toFixed(2));

      (itemEntity as any).vl_bruto = vlBruto;
      (itemEntity as any).vl_total = vlTotal;
      (itemEntity as any).tenantId = tenantId;
      (itemEntity as any).usercreation = userId;
      (itemEntity as any).datecreation = new Date();

      await this.itemNotaFiscalRepository.create(itemEntity as any);
    }

    // Recalcular totais da NF com base nos itens
    await this.recalcularTotaisNotaFiscal(notaFiscalDto.id_nf);

    // Retornar registro completo com itens
    const notaCompleta = await this.notaFiscalRepository.findByIdWithDetails(notaFiscalDto.id_nf);
    return this.notaFiscalMapper.toDto(notaCompleta!);
  }

  /**
   * Atualiza uma nota fiscal completa com itens (delete-and-recreate) em operacao atomica
   * So permite quando status e rascunho ou pendente
   */
  @RequirePermission('nota_fiscal.update')
  @Transactional()
  @Auditable('NotaFiscal')
  @CacheEvict('notaFiscal:getById:{0}')
  @CacheEvict('notaFiscal:list:*', true)
  @CacheEvict('notaFiscal:periodo:*', true)
  @CacheEvict('notaFiscal:emitente:*', true)
  @CacheEvict('notaFiscal:destinatario:*', true)
  async updateCompleto(id: number, dto: UpdateNotaFiscalCompletoDto): Promise<NotaFiscalResponseDto> {
    // Verificar se NF existe
    const existing = await this.notaFiscalRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('NotaFiscal', String(id));
    }

    // Verificar status — so permite editar itens em rascunho/pendente
    const statusPermitidos = ['rascunho', 'pendente'];
    if (!statusPermitidos.includes(existing.status)) {
      throw new BusinessException(
        `Nao e possivel alterar itens de uma nota fiscal com status "${existing.status}". Apenas notas em rascunho ou pendente podem ser editadas.`,
        'STATUS_NAO_PERMITE_EDICAO'
      );
    }

    // Atualizar campos do pai (via update existente)
    await this.update(id, dto);

    // Delete-and-recreate itens (se fornecidos)
    if (dto.itens) {
      const context = getRequestContext();
      const userId = context?.getUserId();
      const tenantId = context?.getTenantId();

      await this.itemNotaFiscalRepository.deleteByNotaFiscal(id);

      for (let i = 0; i < dto.itens.length; i++) {
        const itemDto = dto.itens[i];
        const itemEntity = await this.itemMapper.toEntity({
          ...itemDto,
          notaFiscalId: id,
        } as any);

        const quantidade = Number(itemDto.quantidade || 0);
        const vlUnitario = Number(itemDto.vl_unitario || 0);
        const vlDesconto = Number(itemDto.vl_desconto || 0);
        const vlFrete = Number(itemDto.vl_frete || 0);
        const vlSeguro = Number(itemDto.vl_seguro || 0);
        const vlOutros = Number(itemDto.vl_outros || 0);
        const vlBruto = Number((quantidade * vlUnitario).toFixed(2));
        const vlTotal = Number((vlBruto - vlDesconto + vlFrete + vlSeguro + vlOutros).toFixed(2));

        (itemEntity as any).vl_bruto = vlBruto;
        (itemEntity as any).vl_total = vlTotal;
        (itemEntity as any).tenantId = tenantId;
        (itemEntity as any).usercreation = userId;
        (itemEntity as any).datecreation = new Date();

        await this.itemNotaFiscalRepository.create(itemEntity as any);
      }

      // Recalcular totais da NF
      await this.recalcularTotaisNotaFiscal(id);
    }

    const notaCompleta = await this.notaFiscalRepository.findByIdWithDetails(id);
    return this.notaFiscalMapper.toDto(notaCompleta!);
  }

  /**
   * Busca uma nota fiscal por ID com todos os detalhes (itens + associacoes)
   */
  @RequirePermission('nota_fiscal.read')
  async getByIdDetalhado(id: number): Promise<NotaFiscalResponseDto | null> {
    const entity = await this.notaFiscalRepository.findByIdWithDetails(id);
    return entity ? this.notaFiscalMapper.toDto(entity) : null;
  }

  /**
   * Emite NF-e/NFC-e: gera XML → assina → transmite para SEFAZ → autoriza
   *
   * Orquestra todo o ciclo de emissão de NF-e de saída:
   * 1. Valida NF (status rascunho/pendente, modelo 55/65, certificado disponível)
   * 2. Gera XML NF-e 4.0 com chave de acesso e numeração sequencial
   * 3. Assina XML com certificado digital A1
   * 4. Transmite para SEFAZ
   * 5. Atualiza NF com protocolo, status e XML autorizado
   */
  @RequirePermission('nota_fiscal.emit')
  @Auditable('NotaFiscal')
  @CacheEvict('nota_fiscal:list:*', true)
  @CacheEvict('nota_fiscal:getById:*', true)
  @Transactional()
  async emitir(id: number, certificadoId?: number): Promise<EmitirNfeResultDto> {
    const nf = await this.notaFiscalRepository.findById(id);
    if (!nf) {
      throw new NotFoundException('Nota fiscal', String(id));
    }

    // Validar status — somente rascunho ou pendente podem ser emitidas
    if (nf.status !== StatusNotaFiscal.RASCUNHO && nf.status !== StatusNotaFiscal.PENDENTE) {
      throw new BusinessException(
        'Somente notas com status rascunho ou pendente podem ser emitidas',
        'NF_STATUS_NAO_EMISSIVEL'
      );
    }

    // Validar modelo — somente NF-e (55) e NFC-e (65)
    if (nf.modelo !== ModeloNotaFiscal.NFE && nf.modelo !== ModeloNotaFiscal.NFCE) {
      throw new BusinessException(
        'Emissão eletrônica disponível apenas para modelos NF-e (55) e NFC-e (65)',
        'NF_MODELO_NAO_ELETRONICO'
      );
    }

    const context = getRequestContext();
    const tenantId = context?.getTenantId() || (nf as any).tenantId;

    // Resolver certificado digital
    let certId = certificadoId;
    if (!certId) {
      // Usar certificado padrão do tenant
      const certPadrao = await this.certificadoDigitalRepository.findPadraoByTenant(tenantId);
      if (certPadrao) {
        certId = certPadrao.id;
      }
    }
    if (!certId) {
      throw new BusinessException(
        'Nenhum certificado digital configurado. Faça upload de um certificado ou informe o ID.',
        'CERTIFICADO_NAO_CONFIGURADO'
      );
    }

    const resultado = new EmitirNfeResultDto();

    try {
      // 1. Gerar XML NF-e 4.0
      const xml = await this.nfeXmlGeneratorService.gerarXml(id, tenantId);

      // 2. Assinar XML com certificado A1
      const xmlAssinado = await this.nfeAssinaturaService.assinarXml(xml, certId);

      // 3. Determinar UF e ambiente
      const uf = this.extrairUfDaChave(nf.chave_acesso || '');
      const ambiente = nf.ambiente_sefaz || 'homologacao';

      // 4. Transmitir para SEFAZ
      const retorno = await this.nfeSefazService.transmitir(xmlAssinado, uf, ambiente);

      // 5. Atualizar NF conforme retorno
      const updateData: any = {
        xml_autorizacao: xmlAssinado,
        ambiente_sefaz: ambiente,
      };

      if (retorno.status === 'autorizada') {
        updateData.status = StatusNotaFiscal.AUTORIZADA;
        updateData.protocolo_autorizacao = retorno.protocolo;
        updateData.data_autorizacao = new Date();
        if (retorno.chaveAcesso) {
          updateData.chave_acesso = retorno.chaveAcesso;
        }
      } else if (retorno.status === 'rejeitada') {
        // Manter em pendente para reenvio
        updateData.status = StatusNotaFiscal.PENDENTE;
      } else if (retorno.status === 'denegada') {
        updateData.status = StatusNotaFiscal.DENEGADA;
      }

      await this.notaFiscalRepository.update(id, updateData);

      // Recarregar NF atualizada
      const nfAtualizada = await this.notaFiscalRepository.findById(id);
      resultado.sucesso = retorno.status === 'autorizada';
      resultado.notaFiscal = this.notaFiscalMapper.toDto(nfAtualizada!);
      resultado.retornoSefaz = retorno;
      resultado.xmlAutorizado = retorno.status === 'autorizada' ? xmlAssinado : undefined;

      return resultado;
    } catch (error: any) {
      if (error instanceof BusinessException) throw error;
      throw new BusinessException(
        `Erro durante emissão da NF-e: ${error.message}`,
        'NF_ERRO_EMISSAO'
      );
    }
  }

  /**
   * Extrai código UF (2 dígitos) da chave de acesso
   */
  private extrairUfDaChave(chaveAcesso: string): string {
    if (chaveAcesso && chaveAcesso.length >= 2) {
      // Mapa cUF → sigla UF
      const cufMap: Record<string, string> = {
        '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA',
        '16': 'AP', '17': 'TO', '21': 'MA', '22': 'PI', '23': 'CE',
        '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL', '28': 'SE',
        '29': 'BA', '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP',
        '41': 'PR', '42': 'SC', '43': 'RS', '50': 'MS', '51': 'MT',
        '52': 'GO', '53': 'DF',
      };
      const cuf = chaveAcesso.substring(0, 2);
      return cufMap[cuf] || 'SP';
    }
    return 'SP'; // fallback
  }

  /**
   * Inutiliza uma faixa de numeração na SEFAZ
   *
   * Diferente da inutilização de NF individual, esta operação
   * comunica à SEFAZ a inutilização de uma faixa de números.
   */
  @RequirePermission('nota_fiscal.inutilize')
  @Auditable('NotaFiscal')
  @CacheEvict('nota_fiscal:list:*', true)
  @Transactional()
  async inutilizarFaixa(
    cnpj: string,
    serie: string,
    numInicial: number,
    numFinal: number,
    justificativa: string,
    certificadoId: number,
    uf: string,
    ambiente: string
  ): Promise<any> {
    return await this.nfeSefazService.inutilizar(
      cnpj, serie, numInicial, numFinal, justificativa, certificadoId, uf, ambiente
    );
  }

  /**
   * Recalcula os totais de uma nota fiscal com base nos itens
   */
  private async recalcularTotaisNotaFiscal(notaFiscalId: number): Promise<void> {
    const itens = await this.itemNotaFiscalRepository.findByNotaFiscal(notaFiscalId);

    let vlProdutos = 0;
    let vlFrete = 0;
    let vlSeguro = 0;
    let vlDesconto = 0;
    let vlOutros = 0;

    for (const item of itens) {
      vlProdutos += Number(item.vl_bruto || 0);
      vlFrete += Number(item.vl_frete || 0);
      vlSeguro += Number(item.vl_seguro || 0);
      vlDesconto += Number(item.vl_desconto || 0);
      vlOutros += Number(item.vl_outros || 0);
    }

    const vlTotal = Number((vlProdutos + vlFrete + vlSeguro - vlDesconto + vlOutros).toFixed(2));

    await this.notaFiscalRepository.update(notaFiscalId, {
      vl_produtos: Number(vlProdutos.toFixed(2)),
      vl_frete: Number(vlFrete.toFixed(2)),
      vl_seguro: Number(vlSeguro.toFixed(2)),
      vl_desconto: Number(vlDesconto.toFixed(2)),
      vl_outros: Number(vlOutros.toFixed(2)),
      vl_total: vlTotal,
    } as any);
  }
}
