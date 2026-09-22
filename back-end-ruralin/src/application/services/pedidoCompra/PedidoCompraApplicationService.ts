import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IPedidoCompraApplicationService } from './IPedidoCompraApplicationService';
import { IPedidoCompraRepository } from '../../../infrastructure/repository/IPedidoCompraRepository';
import { IItemPedidoCompraRepository } from '../../../infrastructure/repository/IItemPedidoCompraRepository';
import { IPessoaRepository } from '../../../infrastructure/repository/IPessoaRepository';
import { CreatePedidoCompraDto } from '../../dto/pedidoCompra/CreatePedidoCompraDto';
import { UpdatePedidoCompraDto } from '../../dto/pedidoCompra/UpdatePedidoCompraDto';
import { PedidoCompraResponseDto } from '../../dto/pedidoCompra/PedidoCompraResponseDto';
import { CreatePedidoCompraCompletoDto } from '../../dto/pedidoCompra/CreatePedidoCompraCompletoDto';
import { UpdatePedidoCompraCompletoDto } from '../../dto/pedidoCompra/UpdatePedidoCompraCompletoDto';
import { PedidoCompraMapper } from '../../mappers/PedidoCompraMapper';
import { ItemPedidoCompraMapper } from '../../mappers/ItemPedidoCompraMapper';
import { StatusPedidoCompra } from '../../../models/enums/PedidoCompraEnums';
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
 * Application Service para PedidoCompra
 *
 * Implementa a logica de negocio para operacoes de pedidos de compra,
 * incluindo validacoes, aprovacao, cancelamento, recalculo de totais
 * e atualizacao de status de atendimento.
 */
@Injectable()
export class PedidoCompraApplicationService implements IPedidoCompraApplicationService {
  private itemMapper = new ItemPedidoCompraMapper();

  constructor(
    @Inject(TYPES.IPedidoCompraRepository) private pedidoCompraRepository: IPedidoCompraRepository,
    @Inject(TYPES.IItemPedidoCompraRepository) private itemPedidoCompraRepository: IItemPedidoCompraRepository,
    @Inject(TYPES.IPessoaRepository) private pessoaRepository: IPessoaRepository,
    private pedidoCompraMapper: PedidoCompraMapper
  ) {}

  /**
   * Recalcula o valor total do pedido de compra
   * vl_total = vl_produtos + vl_frete + vl_seguro + vl_outros - vl_desconto
   */
  private calcularTotal(entity: any): number {
    const vlProdutos = Number(entity.vl_produtos) || 0;
    const vlFrete = Number(entity.vl_frete) || 0;
    const vlSeguro = Number(entity.vl_seguro) || 0;
    const vlOutros = Number(entity.vl_outros) || 0;
    const vlDesconto = Number(entity.vl_desconto) || 0;
    return Number((vlProdutos + vlFrete + vlSeguro + vlOutros - vlDesconto).toFixed(2));
  }

  /**
   * Lista todos os pedidos de compra com paginacao
   */
  @RequirePermission('pedido_compra.read')
  @Cacheable('pedido_compra:list:{0}:{1}', 300)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<PedidoCompraResponseDto>> {
    const result = await this.pedidoCompraRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.pedidoCompraMapper.toDto(item)),
    };
  }

  /**
   * Busca um pedido de compra por ID
   */
  @RequirePermission('pedido_compra.read')
  @Cacheable('pedido_compra:getById', 300)
  async getById(id: number | string): Promise<PedidoCompraResponseDto | null> {
    const pedido = await this.pedidoCompraRepository.findById(id);
    return pedido ? this.pedidoCompraMapper.toDto(pedido) : null;
  }

  /**
   * Cria um novo pedido de compra
   *
   * Regras de negocio:
   * - Gera numero sequencial automatico por empresa (max numero + 1)
   * - Status inicial: rascunho
   * - Calcula vl_total = vl_produtos + vl_frete + vl_seguro + vl_outros - vl_desconto
   * - Valida se fornecedor e uma pessoa ativa com flag fornecedor_pessoa
   */
  @RequirePermission('pedido_compra.create')
  @Auditable('PedidoCompra')
  @CacheEvict('pedido_compra:list')
  @Transactional()
  async create(dto: CreatePedidoCompraDto): Promise<PedidoCompraResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto nao disponivel');
    }

    const userId = context.getUserId();
    const tenantId = context.getTenantId();

    if (!userId || !tenantId) {
      throw new BadRequestException('Usuario nao autenticado ou tenant nao identificado');
    }

    const entityData = await this.pedidoCompraMapper.toEntity(dto);

    // Validar se fornecedor e uma pessoa ativa com flag fornecedor_pessoa
    const fornecedor = await this.pessoaRepository.findById(dto.fornecedorId);
    if (!fornecedor || !fornecedor.fornecedor_pessoa) {
      throw new BusinessException(
        'O fornecedor informado deve ser uma pessoa cadastrada como fornecedor',
        'PED_FORNECEDOR_INVALIDO'
      );
    }

    // vl_desconto nao pode exceder vl_produtos (quando houver)
    const vlProdutos = Number((entityData as any).vl_produtos) || 0;
    const vlDesconto = Number((entityData as any).vl_desconto) || 0;
    if (vlDesconto > vlProdutos && vlProdutos > 0) {
      throw new BusinessException(
        'O valor do desconto nao pode ser maior que o valor dos produtos',
        'PED_DESCONTO_EXCEDE_PRODUTOS'
      );
    }

    // Calcular vl_total
    (entityData as any).vl_total = this.calcularTotal(entityData);

    // Gerar numero sequencial por empresa
    const existing = await this.pedidoCompraRepository.findByNumero('', dto.empresaId);
    // Buscar o ultimo numero usado para essa empresa via listagem
    const pedidosEmpresa = await this.pedidoCompraRepository.findByPeriodo('1900-01-01', '2999-12-31');
    const numerosEmpresa = pedidosEmpresa
      .filter(p => p.empresaId === dto.empresaId)
      .map(p => {
        const num = parseInt(p.numero, 10);
        return isNaN(num) ? 0 : num;
      });
    const maxNumero = numerosEmpresa.length > 0 ? Math.max(...numerosEmpresa) : 0;
    (entityData as any).numero = String(maxNumero + 1).padStart(6, '0');

    (entityData as any).usercreation = userId;
    (entityData as any).tenantId = tenantId;
    (entityData as any).status = StatusPedidoCompra.RASCUNHO;

    const pedido = await this.pedidoCompraRepository.create(entityData);

    const created = await this.pedidoCompraRepository.findById(pedido.id_ped_compra);
    return this.pedidoCompraMapper.toDto(created!);
  }

  /**
   * Atualiza um pedido de compra existente
   *
   * Regras de negocio:
   * - Somente pedidos em rascunho podem ser editados
   * - Recalcula vl_total automaticamente
   * - vl_desconto nao pode exceder vl_produtos
   */
  @RequirePermission('pedido_compra.update')
  @Auditable('PedidoCompra')
  @CacheEvict('pedido_compra:list:*', true)
  @CacheEvict('pedido_compra:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdatePedidoCompraDto): Promise<PedidoCompraResponseDto> {
    const pedido = await this.pedidoCompraRepository.findById(id);
    if (!pedido) {
      throw new NotFoundException('Pedido de compra', String(id));
    }

    // Somente pedidos em rascunho podem ser editados
    if (pedido.status !== StatusPedidoCompra.RASCUNHO) {
      throw new BusinessException(
        `Somente pedidos com status rascunho podem ser editados. Status atual: ${pedido.status}`,
        'PED_STATUS_NAO_EDITAVEL'
      );
    }

    const entityData = await this.pedidoCompraMapper.toEntity(dto);

    // Merge para recalcular totais
    const merged = {
      vl_produtos: entityData.vl_produtos !== undefined ? entityData.vl_produtos : pedido.vl_produtos,
      vl_frete: entityData.vl_frete !== undefined ? entityData.vl_frete : pedido.vl_frete,
      vl_seguro: entityData.vl_seguro !== undefined ? entityData.vl_seguro : pedido.vl_seguro,
      vl_outros: entityData.vl_outros !== undefined ? entityData.vl_outros : pedido.vl_outros,
      vl_desconto: entityData.vl_desconto !== undefined ? entityData.vl_desconto : pedido.vl_desconto,
    };

    // vl_desconto nao pode exceder vl_produtos
    const vlProdutos = Number(merged.vl_produtos) || 0;
    const vlDesconto = Number(merged.vl_desconto) || 0;
    if (vlDesconto > vlProdutos && vlProdutos > 0) {
      throw new BusinessException(
        'O valor do desconto nao pode ser maior que o valor dos produtos',
        'PED_DESCONTO_EXCEDE_PRODUTOS'
      );
    }

    // Recalcular vl_total
    (entityData as any).vl_total = this.calcularTotal(merged);

    const updated = await this.pedidoCompraRepository.update(id, entityData);
    return this.pedidoCompraMapper.toDto(updated);
  }

  /**
   * Remove um pedido de compra (soft delete via ativo=false)
   */
  @RequirePermission('pedido_compra.delete')
  @Auditable('PedidoCompra')
  @CacheEvict('pedido_compra:list:*', true)
  @CacheEvict('pedido_compra:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const pedido = await this.pedidoCompraRepository.findById(id);
    if (!pedido) {
      return false;
    }

    await this.pedidoCompraRepository.delete(id);
    return true;
  }

  /**
   * Aprova um pedido de compra
   *
   * Regras de negocio:
   * - Somente pedidos com status rascunho ou aguardando_aprovacao podem ser aprovados
   * - Pedido deve ter pelo menos um item
   * - Registra usuario e data de aprovacao
   */
  @RequirePermission('pedido_compra.approve')
  @Auditable('PedidoCompra')
  @CacheEvict('pedido_compra:list:*', true)
  @CacheEvict('pedido_compra:getById:*', true)
  @Transactional()
  async aprovar(id: number): Promise<PedidoCompraResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto nao disponivel');
    }

    const userId = context.getUserId();

    const pedido = await this.pedidoCompraRepository.findById(id);
    if (!pedido) {
      throw new NotFoundException('Pedido de compra', String(id));
    }

    const statusPermitidos = [StatusPedidoCompra.RASCUNHO, StatusPedidoCompra.AGUARDANDO_APROVACAO];
    if (!statusPermitidos.includes(pedido.status as StatusPedidoCompra)) {
      throw new BusinessException(
        `Somente pedidos com status rascunho ou aguardando aprovacao podem ser aprovados. Status atual: ${pedido.status}`,
        'PED_STATUS_NAO_APROVAVEL'
      );
    }

    // Validar que o pedido tem pelo menos um item
    const itens = await this.itemPedidoCompraRepository.findByPedidoCompra(id);
    if (itens.length === 0) {
      throw new BusinessException(
        'Pedido de compra deve ter pelo menos um item para ser aprovado',
        'PED_SEM_ITENS'
      );
    }

    const updateData: any = {
      status: StatusPedidoCompra.APROVADO,
      data_aprovacao: new Date().toISOString().split('T')[0],
      aprovadoPorId: userId,
    };

    const updated = await this.pedidoCompraRepository.update(id, updateData);
    return this.pedidoCompraMapper.toDto(updated);
  }

  /**
   * Cancela um pedido de compra
   *
   * Regras de negocio:
   * - Pedido ja cancelado nao pode ser cancelado novamente
   * - Pedido totalmente atendido nao pode ser cancelado
   * - Registra motivo e data de cancelamento
   */
  @RequirePermission('pedido_compra.cancel')
  @Auditable('PedidoCompra')
  @CacheEvict('pedido_compra:list:*', true)
  @CacheEvict('pedido_compra:getById:*', true)
  @Transactional()
  async cancelar(id: number, motivo: string): Promise<PedidoCompraResponseDto> {
    const pedido = await this.pedidoCompraRepository.findById(id);
    if (!pedido) {
      throw new NotFoundException('Pedido de compra', String(id));
    }

    if (pedido.status === StatusPedidoCompra.CANCELADO) {
      throw new BusinessException(
        'Pedido de compra ja esta cancelado',
        'PED_JA_CANCELADO'
      );
    }

    if (pedido.status === StatusPedidoCompra.ATENDIDO) {
      throw new BusinessException(
        'Pedido de compra totalmente atendido nao pode ser cancelado',
        'PED_ATENDIDO_NAO_CANCELAVEL'
      );
    }

    const updateData: any = {
      status: StatusPedidoCompra.CANCELADO,
      motivo_cancelamento: motivo,
      data_cancelamento: new Date().toISOString().split('T')[0],
    };

    const updated = await this.pedidoCompraRepository.update(id, updateData);
    return this.pedidoCompraMapper.toDto(updated);
  }

  /**
   * Busca pedidos de compra por fornecedor
   */
  @RequirePermission('pedido_compra.read')
  @Cacheable('pedido_compra:findByFornecedor', 300)
  async findByFornecedor(fornecedorId: number, status?: string): Promise<PedidoCompraResponseDto[]> {
    const pedidos = await this.pedidoCompraRepository.findByFornecedor(fornecedorId, status);
    return pedidos.map(p => this.pedidoCompraMapper.toDto(p));
  }

  /**
   * Lista pedidos de compra por periodo de emissao
   */
  @RequirePermission('pedido_compra.read')
  @Cacheable('pedido_compra:findByPeriodo', 300)
  async findByPeriodo(dataInicio: string, dataFim: string, status?: string): Promise<PedidoCompraResponseDto[]> {
    const pedidos = await this.pedidoCompraRepository.findByPeriodo(dataInicio, dataFim, status);
    return pedidos.map(p => this.pedidoCompraMapper.toDto(p));
  }

  /**
   * Busca pedidos pendentes de entrega
   */
  @RequirePermission('pedido_compra.read')
  @Cacheable('pedido_compra:findPendentesEntrega', 300)
  async findPendentesEntrega(dataPrevisaoAte?: string): Promise<PedidoCompraResponseDto[]> {
    const pedidos = await this.pedidoCompraRepository.findPendentesEntrega(dataPrevisaoAte);
    return pedidos.map(p => this.pedidoCompraMapper.toDto(p));
  }

  /**
   * Busca pedido de compra por numero e empresa
   */
  @RequirePermission('pedido_compra.read')
  @Cacheable('pedido_compra:findByNumero', 300)
  async findByNumero(numero: string, empresaId: number): Promise<PedidoCompraResponseDto | null> {
    const pedido = await this.pedidoCompraRepository.findByNumero(numero, empresaId);
    return pedido ? this.pedidoCompraMapper.toDto(pedido) : null;
  }

  /**
   * Soma de totais agrupados por fornecedor em um periodo
   */
  @RequirePermission('pedido_compra.read')
  @Cacheable('pedido_compra:totalPorPeriodo', 300)
  async totalPorPeriodo(dataInicio: string, dataFim: string): Promise<any> {
    return await this.pedidoCompraRepository.totalPorPeriodo(dataInicio, dataFim);
  }

  /**
   * Recalcula os totais do pedido com base nos itens
   *
   * - vl_produtos = SUM(itens.vl_bruto)
   * - vl_total = vl_produtos + vl_frete + vl_seguro + vl_outros - vl_desconto
   */
  @CacheEvict('pedido_compra:list:*', true)
  @CacheEvict('pedido_compra:getById:*', true)
  @Transactional()
  async recalcularTotais(id: number): Promise<void> {
    const pedido = await this.pedidoCompraRepository.findById(id);
    if (!pedido) {
      throw new NotFoundException('Pedido de compra', String(id));
    }

    const itens = await this.itemPedidoCompraRepository.findByPedidoCompra(id);

    let vlProdutos = 0;

    for (const item of itens) {
      vlProdutos += Number(item.vl_bruto) || 0;
    }

    const vlTotal = this.calcularTotal({
      vl_produtos: vlProdutos,
      vl_frete: pedido.vl_frete,
      vl_seguro: pedido.vl_seguro,
      vl_outros: pedido.vl_outros,
      vl_desconto: pedido.vl_desconto,
    });

    await this.pedidoCompraRepository.update(id, {
      vl_produtos: Number(vlProdutos.toFixed(2)),
      vl_total: vlTotal,
    } as any);
  }

  /**
   * Atualiza o status de atendimento do pedido com base nos itens
   *
   * - Se todos os itens atendidos → pedido atendido
   * - Se pelo menos um item atendido ou parcialmente atendido → parcialmente_atendido
   * - Se nenhum atendido → mantem status atual
   */
  @CacheEvict('pedido_compra:list:*', true)
  @CacheEvict('pedido_compra:getById:*', true)
  @Transactional()
  async atualizarStatusAtendimento(id: number): Promise<void> {
    const pedido = await this.pedidoCompraRepository.findById(id);
    if (!pedido) {
      throw new NotFoundException('Pedido de compra', String(id));
    }

    if (pedido.status === StatusPedidoCompra.CANCELADO) {
      throw new BusinessException(
        'Pedido cancelado nao pode ter status de atendimento atualizado',
        'PED_CANCELADO_IMUTAVEL'
      );
    }

    const itens = await this.itemPedidoCompraRepository.findByPedidoCompra(id);

    if (itens.length === 0) {
      return;
    }

    const itensAtivos = itens.filter(i => i.status !== 'cancelado');
    const todosAtendidos = itensAtivos.length > 0 && itensAtivos.every(i => i.status === 'atendido');
    const algumAtendido = itensAtivos.some(i => i.status === 'atendido' || i.status === 'parcialmente_atendido');

    let novoStatus: string;
    if (todosAtendidos) {
      novoStatus = StatusPedidoCompra.ATENDIDO;
    } else if (algumAtendido) {
      novoStatus = StatusPedidoCompra.PARCIALMENTE_ATENDIDO;
    } else {
      return;
    }

    if (pedido.status !== novoStatus) {
      await this.pedidoCompraRepository.update(id, {
        status: novoStatus,
      } as any);
    }
  }

  /**
   * Cria um pedido de compra completo com itens em uma unica operacao atomica
   */
  @RequirePermission('pedido_compra.create')
  @Transactional()
  @Auditable('PedidoCompra')
  @CacheEvict('pedidoCompra:list:*', true)
  @CacheEvict('pedidoCompra:fornecedor:*', true)
  @CacheEvict('pedidoCompra:periodo:*', true)
  async createCompleto(dto: CreatePedidoCompraCompletoDto): Promise<PedidoCompraResponseDto> {
    // Criar o pedido usando a logica existente (valida fornecedor, gera numero, etc.)
    const pedidoDto = await this.create(dto);

    const context = getRequestContext();
    const userId = context?.getUserId();
    const tenantId = context?.getTenantId();

    // Criar itens — injetar FK, numero_item sequencial, calcular valores
    for (let i = 0; i < dto.itens.length; i++) {
      const itemDto = dto.itens[i];
      const itemEntity = await this.itemMapper.toEntity({
        ...itemDto,
        pedidoCompraId: pedidoDto.id_ped_compra,
      } as any);

      // Auto-gerar numero_item sequencial (1-based)
      (itemEntity as any).numero_item = i + 1;

      // Calcular valores
      const qtdSolicitada = Number(itemDto.quantidade_solicitada || 0);
      const vlUnitario = Number(itemDto.vl_unitario || 0);
      const vlDesconto = Number(itemDto.vl_desconto || 0);
      const vlBruto = Number((qtdSolicitada * vlUnitario).toFixed(2));
      const vlTotal = Number((vlBruto - vlDesconto).toFixed(2));

      (itemEntity as any).vl_bruto = vlBruto;
      (itemEntity as any).vl_total = vlTotal;
      (itemEntity as any).quantidade_atendida = 0;
      (itemEntity as any).quantidade_pendente = qtdSolicitada;
      (itemEntity as any).status = 'pendente';
      (itemEntity as any).tenantId = tenantId;
      (itemEntity as any).usercreation = userId;
      (itemEntity as any).datecreation = new Date();

      await this.itemPedidoCompraRepository.create(itemEntity as any);
    }

    // Recalcular totais do pedido com base nos itens criados
    await this.recalcularTotais(pedidoDto.id_ped_compra);

    // Retornar registro completo com itens
    const pedidoCompleto = await this.pedidoCompraRepository.findByIdWithDetails(pedidoDto.id_ped_compra);
    return this.pedidoCompraMapper.toDto(pedidoCompleto!);
  }

  /**
   * Atualiza um pedido de compra completo com itens (delete-and-recreate)
   * Permitido somente quando status eh rascunho (antes de qualquer atendimento)
   */
  @RequirePermission('pedido_compra.update')
  @Transactional()
  @Auditable('PedidoCompra')
  @CacheEvict('pedidoCompra:getById:{0}')
  @CacheEvict('pedidoCompra:list:*', true)
  @CacheEvict('pedidoCompra:fornecedor:*', true)
  @CacheEvict('pedidoCompra:periodo:*', true)
  async updateCompleto(id: number, dto: UpdatePedidoCompraCompletoDto): Promise<PedidoCompraResponseDto> {
    // Verificar se pedido existe
    const existing = await this.pedidoCompraRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('PedidoCompra', id);
    }

    // Verificar status — so permite editar itens em rascunho
    if (existing.status !== 'rascunho') {
      throw new BusinessException(
        `Nao e possivel substituir itens de um pedido com status "${existing.status}". Apenas pedidos em rascunho podem ter itens substituidos.`,
        'STATUS_NAO_PERMITE_EDICAO_ITENS'
      );
    }

    // Atualizar campos do pai
    await this.update(id, dto);

    // Delete-and-recreate itens (se fornecidos)
    if (dto.itens) {
      const context = getRequestContext();
      const userId = context?.getUserId();
      const tenantId = context?.getTenantId();

      await this.itemPedidoCompraRepository.deleteByPedidoCompra(id);

      for (let i = 0; i < dto.itens.length; i++) {
        const itemDto = dto.itens[i];
        const itemEntity = await this.itemMapper.toEntity({
          ...itemDto,
          pedidoCompraId: id,
        } as any);

        (itemEntity as any).numero_item = i + 1;

        const qtdSolicitada = Number(itemDto.quantidade_solicitada || 0);
        const vlUnitario = Number(itemDto.vl_unitario || 0);
        const vlDesconto = Number(itemDto.vl_desconto || 0);
        const vlBruto = Number((qtdSolicitada * vlUnitario).toFixed(2));
        const vlTotal = Number((vlBruto - vlDesconto).toFixed(2));

        (itemEntity as any).vl_bruto = vlBruto;
        (itemEntity as any).vl_total = vlTotal;
        (itemEntity as any).quantidade_atendida = 0;
        (itemEntity as any).quantidade_pendente = qtdSolicitada;
        (itemEntity as any).status = 'pendente';
        (itemEntity as any).tenantId = tenantId;
        (itemEntity as any).usercreation = userId;
        (itemEntity as any).datecreation = new Date();

        await this.itemPedidoCompraRepository.create(itemEntity as any);
      }

      // Recalcular totais do pedido com base nos novos itens
      await this.recalcularTotais(id);
    }

    const pedidoCompleto = await this.pedidoCompraRepository.findByIdWithDetails(id);
    return this.pedidoCompraMapper.toDto(pedidoCompleto!);
  }

  /**
   * Busca um pedido de compra por ID com todos os detalhes (itens + associacoes)
   */
  @RequirePermission('pedido_compra.read')
  async getByIdDetalhado(id: number): Promise<PedidoCompraResponseDto | null> {
    const entity = await this.pedidoCompraRepository.findByIdWithDetails(id);
    return entity ? this.pedidoCompraMapper.toDto(entity) : null;
  }
}
