import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IItemNotaFiscalApplicationService } from './IItemNotaFiscalApplicationService';
import { IItemNotaFiscalRepository } from '../../../infrastructure/repository/IItemNotaFiscalRepository';
import { INotaFiscalRepository } from '../../../infrastructure/repository/INotaFiscalRepository';
import { IProdutoRepository } from '../../../infrastructure/repository/IProdutoRepository';
import { CreateItemNotaFiscalDto } from '../../dto/itemNotaFiscal/CreateItemNotaFiscalDto';
import { UpdateItemNotaFiscalDto } from '../../dto/itemNotaFiscal/UpdateItemNotaFiscalDto';
import { ItemNotaFiscalResponseDto } from '../../dto/itemNotaFiscal/ItemNotaFiscalResponseDto';
import { ItemNotaFiscalMapper } from '../../mappers/ItemNotaFiscalMapper';
import { StatusNotaFiscal } from '../../../models/enums/NotaFiscalEnums';
import { Auditable } from '../../../core/audit';
import { CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { BusinessException } from '../../../core/exceptions/BusinessException';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para ItemNotaFiscal
 *
 * Implementa a logica de negocio para operacoes de itens de nota fiscal,
 * incluindo calculo automatico de valores e recalculo dos totais da NF.
 */
@Injectable()
export class ItemNotaFiscalApplicationService implements IItemNotaFiscalApplicationService {
  constructor(
    @Inject(TYPES.IItemNotaFiscalRepository) private itemNotaFiscalRepository: IItemNotaFiscalRepository,
    @Inject(TYPES.INotaFiscalRepository) private notaFiscalRepository: INotaFiscalRepository,
    @Inject(TYPES.IProdutoRepository) private produtoRepository: IProdutoRepository,
    private itemNotaFiscalMapper: ItemNotaFiscalMapper
  ) {}

  /**
   * Lista todos os itens com paginacao
   */
  @RequirePermission('item_nota_fiscal.read')
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<ItemNotaFiscalResponseDto>> {
    const result = await this.itemNotaFiscalRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.itemNotaFiscalMapper.toDto(item)),
    };
  }

  /**
   * Busca um item por ID
   */
  @RequirePermission('item_nota_fiscal.read')
  async getById(id: number | string): Promise<ItemNotaFiscalResponseDto | null> {
    const item = await this.itemNotaFiscalRepository.findById(id);
    return item ? this.itemNotaFiscalMapper.toDto(item) : null;
  }

  /**
   * Cria um novo item de nota fiscal
   *
   * Regras de negocio:
   * 1. Valida se a nota fiscal existe e pertence ao mesmo tenant
   * 2. Valida se a nota esta em status rascunho ou pendente
   * 3. Auto-calcula vl_bruto e vl_total
   * 4. Valida que vl_desconto nao excede vl_bruto
   * 5. Recalcula os totais da nota fiscal pai
   */
  @RequirePermission('item_nota_fiscal.create')
  @Auditable('ItemNotaFiscal')
  @CacheEvict('nota_fiscal:*')
  @Transactional()
  async create(dto: CreateItemNotaFiscalDto): Promise<ItemNotaFiscalResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto nao disponivel');
    }

    const userId = context.getUserId();
    const tenantId = context.getTenantId();

    if (!userId || !tenantId) {
      throw new BadRequestException('Usuario nao autenticado ou tenant nao identificado');
    }

    // Validar nota fiscal existe e pertence ao mesmo tenant
    const notaFiscal = await this.notaFiscalRepository.findById(dto.notaFiscalId);
    if (!notaFiscal) {
      throw new NotFoundException('Nota fiscal', String(dto.notaFiscalId));
    }
    if (notaFiscal.tenantId !== tenantId) {
      throw new BusinessException('Nota fiscal nao pertence ao tenant atual');
    }

    // Validar status da nota fiscal
    this.validarStatusNotaFiscalParaEdicao(notaFiscal.status);

    // Validar numero_item unico dentro da nota
    const itensExistentes = await this.itemNotaFiscalRepository.findByNotaFiscal(dto.notaFiscalId);
    const itemComMesmoNumero = itensExistentes.find(i => i.numero_item === dto.numero_item);
    if (itemComMesmoNumero) {
      throw new BusinessException(`Ja existe um item com numero_item ${dto.numero_item} nesta nota fiscal`);
    }

    // Calcular valores
    const quantidade = Number(dto.quantidade);
    const vlUnitario = Number(dto.vl_unitario);
    const vlDesconto = Number(dto.vl_desconto || 0);
    const vlFrete = Number(dto.vl_frete || 0);
    const vlSeguro = Number(dto.vl_seguro || 0);
    const vlOutros = Number(dto.vl_outros || 0);

    const vlBruto = Number((quantidade * vlUnitario).toFixed(2));

    // Validar que desconto nao excede bruto
    if (vlDesconto > vlBruto) {
      throw new BusinessException('Valor do desconto nao pode exceder o valor bruto do item');
    }

    const vlTotal = Number((vlBruto - vlDesconto + vlFrete + vlSeguro + vlOutros).toFixed(2));

    const entityData = await this.itemNotaFiscalMapper.toEntity(dto);
    (entityData as any).tenantId = tenantId;
    (entityData as any).usercreation = userId;
    (entityData as any).vl_bruto = vlBruto;
    (entityData as any).vl_total = vlTotal;

    const item = await this.itemNotaFiscalRepository.create(entityData);

    // Recalcular totais da nota fiscal
    await this.recalcularTotaisNotaFiscal(dto.notaFiscalId);

    // Buscar item com associacoes para retorno
    const itemCompleto = await this.itemNotaFiscalRepository.findById(item.id_item_nf);
    return this.itemNotaFiscalMapper.toDto(itemCompleto || item);
  }

  /**
   * Atualiza um item de nota fiscal existente
   */
  @RequirePermission('item_nota_fiscal.update')
  @Auditable('ItemNotaFiscal')
  @CacheEvict('nota_fiscal:*')
  @Transactional()
  async update(id: number | string, dto: UpdateItemNotaFiscalDto): Promise<ItemNotaFiscalResponseDto> {
    const item = await this.itemNotaFiscalRepository.findById(id);
    if (!item) {
      throw new NotFoundException('Item de nota fiscal', String(id));
    }

    // Validar status da nota fiscal
    const notaFiscal = await this.notaFiscalRepository.findById(item.notaFiscalId);
    if (!notaFiscal) {
      throw new NotFoundException('Nota fiscal', String(item.notaFiscalId));
    }
    this.validarStatusNotaFiscalParaEdicao(notaFiscal.status);

    // Validar numero_item unico dentro da nota (se alterado)
    if (dto.numero_item !== undefined && dto.numero_item !== item.numero_item) {
      const itensExistentes = await this.itemNotaFiscalRepository.findByNotaFiscal(item.notaFiscalId);
      const itemComMesmoNumero = itensExistentes.find(i => i.numero_item === dto.numero_item && i.id_item_nf !== item.id_item_nf);
      if (itemComMesmoNumero) {
        throw new BusinessException(`Ja existe um item com numero_item ${dto.numero_item} nesta nota fiscal`);
      }
    }

    // Recalcular valores se quantidade ou vl_unitario alterados
    const quantidade = dto.quantidade !== undefined ? Number(dto.quantidade) : Number(item.quantidade);
    const vlUnitario = dto.vl_unitario !== undefined ? Number(dto.vl_unitario) : Number(item.vl_unitario);
    const vlDesconto = dto.vl_desconto !== undefined ? Number(dto.vl_desconto) : Number(item.vl_desconto);
    const vlFrete = dto.vl_frete !== undefined ? Number(dto.vl_frete) : Number(item.vl_frete);
    const vlSeguro = dto.vl_seguro !== undefined ? Number(dto.vl_seguro) : Number(item.vl_seguro);
    const vlOutros = dto.vl_outros !== undefined ? Number(dto.vl_outros) : Number(item.vl_outros);

    const vlBruto = Number((quantidade * vlUnitario).toFixed(2));

    // Validar que desconto nao excede bruto
    if (vlDesconto > vlBruto) {
      throw new BusinessException('Valor do desconto nao pode exceder o valor bruto do item');
    }

    const vlTotal = Number((vlBruto - vlDesconto + vlFrete + vlSeguro + vlOutros).toFixed(2));

    const entityData = await this.itemNotaFiscalMapper.toEntity(dto);
    (entityData as any).vl_bruto = vlBruto;
    (entityData as any).vl_total = vlTotal;

    const updated = await this.itemNotaFiscalRepository.update(id, entityData);

    // Recalcular totais da nota fiscal
    await this.recalcularTotaisNotaFiscal(item.notaFiscalId);

    // Buscar item com associacoes para retorno
    const itemCompleto = await this.itemNotaFiscalRepository.findById(updated.id_item_nf);
    return this.itemNotaFiscalMapper.toDto(itemCompleto || updated);
  }

  /**
   * Remove um item de nota fiscal
   */
  @RequirePermission('item_nota_fiscal.delete')
  @Auditable('ItemNotaFiscal')
  @CacheEvict('nota_fiscal:*')
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const item = await this.itemNotaFiscalRepository.findById(id);
    if (!item) {
      return false;
    }

    // Validar status da nota fiscal
    const notaFiscal = await this.notaFiscalRepository.findById(item.notaFiscalId);
    if (!notaFiscal) {
      throw new NotFoundException('Nota fiscal', String(item.notaFiscalId));
    }
    this.validarStatusNotaFiscalParaEdicao(notaFiscal.status);

    const notaFiscalId = item.notaFiscalId;

    await this.itemNotaFiscalRepository.delete(id);

    // Recalcular totais da nota fiscal
    await this.recalcularTotaisNotaFiscal(notaFiscalId);

    return true;
  }

  /**
   * Lista todos os itens de uma nota fiscal
   */
  @RequirePermission('item_nota_fiscal.read')
  async findByNotaFiscal(notaFiscalId: number): Promise<ItemNotaFiscalResponseDto[]> {
    const itens = await this.itemNotaFiscalRepository.findByNotaFiscal(notaFiscalId);
    return itens.map(item => this.itemNotaFiscalMapper.toDto(item));
  }

  /**
   * Busca historico de movimentacao de produto em notas fiscais
   */
  @RequirePermission('item_nota_fiscal.read')
  async findByProduto(produtoId: number, dataInicio?: string, dataFim?: string): Promise<ItemNotaFiscalResponseDto[]> {
    const itens = await this.itemNotaFiscalRepository.findByProduto(produtoId, dataInicio, dataFim);
    return itens.map(item => this.itemNotaFiscalMapper.toDto(item));
  }

  /**
   * Rastreabilidade por numero de lote
   */
  @RequirePermission('item_nota_fiscal.read')
  async findByLote(numeroLote: string, produtoId?: number): Promise<ItemNotaFiscalResponseDto[]> {
    const itens = await this.itemNotaFiscalRepository.findByLote(numeroLote, produtoId);
    return itens.map(item => this.itemNotaFiscalMapper.toDto(item));
  }

  /**
   * Rastreabilidade por numero de serie
   */
  @RequirePermission('item_nota_fiscal.read')
  async findByNumeroSerie(numeroSerie: string): Promise<ItemNotaFiscalResponseDto | null> {
    const item = await this.itemNotaFiscalRepository.findByNumeroSerie(numeroSerie);
    return item ? this.itemNotaFiscalMapper.toDto(item) : null;
  }

  /**
   * Consolida quantidade e valor vendido por produto em um periodo
   */
  @RequirePermission('item_nota_fiscal.read')
  async totalVendidoPorProduto(produtoId: number, dataInicio: string, dataFim: string): Promise<{ qtd: number; vlTotal: number }> {
    return await this.itemNotaFiscalRepository.totalVendidoPorProduto(produtoId, dataInicio, dataFim);
  }

  /**
   * Valida se o status da nota fiscal permite edicao de itens
   */
  private validarStatusNotaFiscalParaEdicao(status: string): void {
    const statusPermitidos = [StatusNotaFiscal.RASCUNHO, StatusNotaFiscal.PENDENTE];
    if (!statusPermitidos.includes(status as StatusNotaFiscal)) {
      throw new BusinessException(
        `Itens so podem ser adicionados/editados/removidos quando a nota fiscal esta com status rascunho ou pendente. Status atual: ${status}`
      );
    }
  }

  /**
   * Recalcula os totais da nota fiscal com base nos itens
   *
   * Soma todos os valores dos itens e atualiza o cabecalho da NF:
   * - vl_produtos = SUM(itens.vl_bruto)
   * - vl_desconto = SUM(itens.vl_desconto)
   * - vl_frete = SUM(itens.vl_frete)
   * - vl_seguro = SUM(itens.vl_seguro)
   * - vl_outros = SUM(itens.vl_outros)
   * - vl_ipi = SUM(itens.vl_ipi)
   * - vl_icms = SUM(itens.vl_icms)
   * - vl_pis = SUM(itens.vl_pis)
   * - vl_cofins = SUM(itens.vl_cofins)
   * - vl_total = vl_produtos - vl_desconto + vl_frete + vl_seguro + vl_outros + vl_ipi
   */
  private async recalcularTotaisNotaFiscal(notaFiscalId: number): Promise<void> {
    const itens = await this.itemNotaFiscalRepository.findByNotaFiscal(notaFiscalId);

    let vlProdutos = 0;
    let vlDesconto = 0;
    let vlFrete = 0;
    let vlSeguro = 0;
    let vlOutros = 0;
    let vlIpi = 0;
    let vlIcms = 0;
    let vlPis = 0;
    let vlCofins = 0;

    for (const item of itens) {
      vlProdutos += Number(item.vl_bruto) || 0;
      vlDesconto += Number(item.vl_desconto) || 0;
      vlFrete += Number(item.vl_frete) || 0;
      vlSeguro += Number(item.vl_seguro) || 0;
      vlOutros += Number(item.vl_outros) || 0;
      vlIpi += Number(item.vl_ipi) || 0;
      vlIcms += Number(item.vl_icms) || 0;
      vlPis += Number(item.vl_pis) || 0;
      vlCofins += Number(item.vl_cofins) || 0;
    }

    const vlTotal = Number((vlProdutos - vlDesconto + vlFrete + vlSeguro + vlOutros + vlIpi).toFixed(2));

    await this.notaFiscalRepository.update(notaFiscalId, {
      vl_produtos: Number(vlProdutos.toFixed(2)),
      vl_desconto: Number(vlDesconto.toFixed(2)),
      vl_frete: Number(vlFrete.toFixed(2)),
      vl_seguro: Number(vlSeguro.toFixed(2)),
      vl_outros: Number(vlOutros.toFixed(2)),
      vl_ipi: Number(vlIpi.toFixed(2)),
      vl_icms: Number(vlIcms.toFixed(2)),
      vl_pis: Number(vlPis.toFixed(2)),
      vl_cofins: Number(vlCofins.toFixed(2)),
      vl_total: vlTotal,
    } as any);
  }
}
