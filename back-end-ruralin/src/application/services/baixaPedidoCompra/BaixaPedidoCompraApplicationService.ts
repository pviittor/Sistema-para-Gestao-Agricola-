import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IBaixaPedidoCompraApplicationService } from './IBaixaPedidoCompraApplicationService';
import { IBaixaPedidoCompraRepository } from '../../../infrastructure/repository/IBaixaPedidoCompraRepository';
import { IItemBaixaPedidoCompraRepository } from '../../../infrastructure/repository/IItemBaixaPedidoCompraRepository';
import { INotaFiscalRepository } from '../../../infrastructure/repository/INotaFiscalRepository';
import { IPedidoCompraRepository } from '../../../infrastructure/repository/IPedidoCompraRepository';
import { IItemPedidoCompraRepository } from '../../../infrastructure/repository/IItemPedidoCompraRepository';
import { IPessoaRepository } from '../../../infrastructure/repository/IPessoaRepository';
import { CreateBaixaPedidoCompraDto } from '../../dto/baixaPedidoCompra/CreateBaixaPedidoCompraDto';
import { UpdateBaixaPedidoCompraDto } from '../../dto/baixaPedidoCompra/UpdateBaixaPedidoCompraDto';
import { BaixaPedidoCompraResponseDto } from '../../dto/baixaPedidoCompra/BaixaPedidoCompraResponseDto';
import { BaixaPedidoCompraMapper } from '../../mappers/BaixaPedidoCompraMapper';
import { StatusBaixaPedidoCompra, StatusPedidoCompra, StatusItemPedidoCompra } from '../../../models/enums/PedidoCompraEnums';
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
 * Application Service para BaixaPedidoCompra
 *
 * Implementa a logica de negocio para operacoes de baixa de pedidos de compra,
 * incluindo validacoes de NF, pedido, fornecedor, processamento e cancelamento.
 */
@Injectable()
export class BaixaPedidoCompraApplicationService implements IBaixaPedidoCompraApplicationService {
  constructor(
    @Inject(TYPES.IBaixaPedidoCompraRepository) private baixaPedidoCompraRepository: IBaixaPedidoCompraRepository,
    @Inject(TYPES.IItemBaixaPedidoCompraRepository) private itemBaixaPedidoCompraRepository: IItemBaixaPedidoCompraRepository,
    @Inject(TYPES.INotaFiscalRepository) private notaFiscalRepository: INotaFiscalRepository,
    @Inject(TYPES.IPedidoCompraRepository) private pedidoCompraRepository: IPedidoCompraRepository,
    @Inject(TYPES.IItemPedidoCompraRepository) private itemPedidoCompraRepository: IItemPedidoCompraRepository,
    @Inject(TYPES.IPessoaRepository) private pessoaRepository: IPessoaRepository,
    private baixaPedidoCompraMapper: BaixaPedidoCompraMapper
  ) {}

  /**
   * Lista todas as baixas de pedido de compra com paginacao
   */
  @RequirePermission('baixa_pedido_compra.read')
  @Cacheable('baixa_pedido_compra:list:{0}:{1}', 120)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<BaixaPedidoCompraResponseDto>> {
    const result = await this.baixaPedidoCompraRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.baixaPedidoCompraMapper.toDto(item)),
    };
  }

  /**
   * Busca uma baixa de pedido de compra por ID
   */
  @RequirePermission('baixa_pedido_compra.read')
  @Cacheable('baixa_pedido_compra:getById', 120)
  async getById(id: number | string): Promise<BaixaPedidoCompraResponseDto | null> {
    const baixa = await this.baixaPedidoCompraRepository.findById(id);
    return baixa ? this.baixaPedidoCompraMapper.toDto(baixa) : null;
  }

  /**
   * Cria uma nova baixa de pedido de compra
   *
   * Regras de negocio:
   * - Valida se a nota fiscal existe
   * - Valida se o pedido de compra existe e esta aprovado ou parcialmente_atendido
   * - Valida se o fornecedor da NF (emitenteId) corresponde ao fornecedor do pedido (fornecedorId)
   * - Define status inicial como pendente
   */
  @RequirePermission('baixa_pedido_compra.create')
  @Auditable('BaixaPedidoCompra')
  @CacheEvict('baixa_pedido_compra:*')
  @Transactional()
  async create(dto: CreateBaixaPedidoCompraDto): Promise<BaixaPedidoCompraResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto nao disponivel');
    }

    const userId = context.getUserId();
    const tenantId = context.getTenantId();

    if (!userId || !tenantId) {
      throw new BadRequestException('Usuario nao autenticado ou tenant nao identificado');
    }

    // Validar nota fiscal existe
    const notaFiscal = await this.notaFiscalRepository.findById(dto.notaFiscalId);
    if (!notaFiscal) {
      throw new NotFoundException('Nota fiscal', String(dto.notaFiscalId));
    }
    if (notaFiscal.tenantId !== tenantId) {
      throw new BusinessException('Nota fiscal nao pertence ao tenant atual');
    }

    // Validar pedido de compra existe e esta em status valido
    const pedidoCompra = await this.pedidoCompraRepository.findById(dto.pedidoCompraId);
    if (!pedidoCompra) {
      throw new NotFoundException('Pedido de compra', String(dto.pedidoCompraId));
    }
    if (pedidoCompra.tenantId !== tenantId) {
      throw new BusinessException('Pedido de compra nao pertence ao tenant atual');
    }

    const statusPermitidos = [StatusPedidoCompra.APROVADO, StatusPedidoCompra.PARCIALMENTE_ATENDIDO];
    if (!statusPermitidos.includes(pedidoCompra.status as StatusPedidoCompra)) {
      throw new BusinessException(
        `Pedido de compra deve estar aprovado ou parcialmente atendido para realizar baixa. Status atual: ${pedidoCompra.status}`,
        'BAIXA_PED_STATUS_INVALIDO'
      );
    }

    // Validar fornecedor match: NF emitenteId == pedido fornecedorId
    if (notaFiscal.emitenteId !== pedidoCompra.fornecedorId) {
      throw new BusinessException(
        'O emitente da nota fiscal nao corresponde ao fornecedor do pedido de compra',
        'BAIXA_PED_FORNECEDOR_DIVERGENTE'
      );
    }

    const entityData = await this.baixaPedidoCompraMapper.toEntity(dto);

    (entityData as any).usercreation = userId;
    (entityData as any).usuarioId = userId;
    (entityData as any).tenantId = tenantId;
    (entityData as any).status = StatusBaixaPedidoCompra.PENDENTE;

    const baixa = await this.baixaPedidoCompraRepository.create(entityData);

    // Buscar com associacoes
    const created = await this.baixaPedidoCompraRepository.findById(baixa.id_baixa_ped);
    return this.baixaPedidoCompraMapper.toDto(created!);
  }

  /**
   * Atualiza uma baixa de pedido de compra existente
   *
   * Regras de negocio:
   * - Status cancelada nao pode ser alterada
   * - Status processada nao pode ser editada (somente cancelar)
   */
  @RequirePermission('baixa_pedido_compra.create')
  @Auditable('BaixaPedidoCompra')
  @CacheEvict('baixa_pedido_compra:*')
  @Transactional()
  async update(id: number | string, dto: UpdateBaixaPedidoCompraDto): Promise<BaixaPedidoCompraResponseDto> {
    const baixa = await this.baixaPedidoCompraRepository.findById(id);
    if (!baixa) {
      throw new NotFoundException('Baixa de pedido de compra', String(id));
    }

    // Status cancelada nao pode ser alterada
    if (baixa.status === StatusBaixaPedidoCompra.CANCELADA) {
      throw new BusinessException(
        'Baixa cancelada nao pode ser alterada',
        'BAIXA_PED_CANCELADA_IMUTAVEL'
      );
    }

    // Status processada nao pode ser editada
    if (baixa.status === StatusBaixaPedidoCompra.PROCESSADA) {
      throw new BusinessException(
        'Baixa processada nao pode ser editada, somente cancelada',
        'BAIXA_PED_PROCESSADA_IMUTAVEL'
      );
    }

    const entityData = await this.baixaPedidoCompraMapper.toEntity(dto);

    const updated = await this.baixaPedidoCompraRepository.update(id, entityData);
    return this.baixaPedidoCompraMapper.toDto(updated);
  }

  /**
   * Remove uma baixa de pedido de compra
   */
  @RequirePermission('baixa_pedido_compra.create')
  @Auditable('BaixaPedidoCompra')
  @CacheEvict('baixa_pedido_compra:*')
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const baixa = await this.baixaPedidoCompraRepository.findById(id);
    if (!baixa) {
      return false;
    }

    // Nao permitir exclusao de baixa processada
    if (baixa.status === StatusBaixaPedidoCompra.PROCESSADA) {
      throw new BusinessException(
        'Baixa processada nao pode ser excluida, somente cancelada',
        'BAIXA_PED_PROCESSADA_NAO_EXCLUIVEL'
      );
    }

    await this.baixaPedidoCompraRepository.delete(id);
    return true;
  }

  /**
   * Processa uma baixa de pedido de compra
   *
   * Regras de negocio:
   * - Valida status pendente
   * - Valida que existem itens na baixa
   * - Para cada ItemBaixaPedidoCompra: valida quantidade nao excede pendente+tolerancia
   * - Atualiza ItemPedidoCompra.quantidade_atendida e quantidade_pendente
   * - Atualiza status do item do pedido (pendente/parcialmente_atendido/atendido)
   * - Atualiza status do pedido de compra
   * - Define status=processada
   */
  @RequirePermission('baixa_pedido_compra.process')
  @Auditable('BaixaPedidoCompra')
  @CacheEvict('baixa_pedido_compra:*')
  @Transactional()
  async processar(id: number): Promise<BaixaPedidoCompraResponseDto> {
    const baixa = await this.baixaPedidoCompraRepository.findById(id);
    if (!baixa) {
      throw new NotFoundException('Baixa de pedido de compra', String(id));
    }

    // Validar status pendente
    if (baixa.status !== StatusBaixaPedidoCompra.PENDENTE) {
      throw new BusinessException(
        `Somente baixas com status pendente podem ser processadas. Status atual: ${baixa.status}`,
        'BAIXA_PED_STATUS_NAO_PROCESSAVEL'
      );
    }

    // Validar que existem itens na baixa
    const itensBaixa = await this.itemBaixaPedidoCompraRepository.findByBaixa(id);
    if (itensBaixa.length === 0) {
      throw new BusinessException(
        'A baixa deve possuir pelo menos um item para ser processada',
        'BAIXA_PED_SEM_ITENS'
      );
    }

    let vlTotalBaixa = 0;
    let vlDivergenciaTotal = 0;
    const TOLERANCIA_PERCENTUAL = 5; // 5% de tolerancia

    // Para cada item da baixa
    for (const itemBaixa of itensBaixa) {
      const itemPedido = await this.itemPedidoCompraRepository.findById(itemBaixa.itemPedidoCompraId);
      if (!itemPedido) {
        throw new NotFoundException('Item de pedido de compra', String(itemBaixa.itemPedidoCompraId));
      }

      // Validar que o item do pedido nao esta cancelado
      if (itemPedido.status === StatusItemPedidoCompra.CANCELADO) {
        throw new BusinessException(
          `Item de pedido ${itemBaixa.itemPedidoCompraId} esta cancelado e nao pode receber baixa`,
          'BAIXA_PED_ITEM_CANCELADO'
        );
      }

      const quantidadeBaixa = Number(itemBaixa.quantidade);
      const quantidadePendente = Number(itemPedido.quantidade_pendente) || 0;
      const tolerancia = quantidadePendente * (TOLERANCIA_PERCENTUAL / 100);

      // Validar quantidade nao excede pendente+tolerancia
      if (quantidadeBaixa > quantidadePendente + tolerancia) {
        throw new BusinessException(
          `Quantidade baixada (${quantidadeBaixa}) excede a quantidade pendente (${quantidadePendente}) com tolerancia de ${TOLERANCIA_PERCENTUAL}% para o item ${itemBaixa.itemPedidoCompraId}`,
          'BAIXA_PED_QTD_EXCEDENTE'
        );
      }

      // Atualizar ItemPedidoCompra.quantidade_atendida e quantidade_pendente
      const novaQtdAtendida = (Number(itemPedido.quantidade_atendida) || 0) + quantidadeBaixa;
      const novaQtdPendente = Math.max(0, Number(itemPedido.quantidade_solicitada) - novaQtdAtendida);

      // Determinar novo status do item do pedido
      let novoStatusItem: string;
      if (novaQtdPendente <= 0) {
        novoStatusItem = StatusItemPedidoCompra.ATENDIDO;
      } else if (novaQtdAtendida > 0) {
        novoStatusItem = StatusItemPedidoCompra.PARCIALMENTE_ATENDIDO;
      } else {
        novoStatusItem = StatusItemPedidoCompra.PENDENTE;
      }

      await this.itemPedidoCompraRepository.update(itemPedido.id_item_ped, {
        quantidade_atendida: Number(novaQtdAtendida.toFixed(4)),
        quantidade_pendente: Number(novaQtdPendente.toFixed(4)),
        status: novoStatusItem,
      } as any);

      // Acumular totais
      const vlUnitarioNf = Number(itemBaixa.vl_unitario_nf) || 0;
      vlTotalBaixa += quantidadeBaixa * vlUnitarioNf;
      vlDivergenciaTotal += Number(itemBaixa.vl_divergencia) || 0;
    }

    // Calcular percentual de divergencia
    const percentualDivergencia = vlTotalBaixa > 0
      ? Number(((vlDivergenciaTotal / vlTotalBaixa) * 100).toFixed(2))
      : 0;

    // Atualizar a baixa
    const updateData: any = {
      status: StatusBaixaPedidoCompra.PROCESSADA,
      vl_total_baixa: Number(vlTotalBaixa.toFixed(2)),
      vl_divergencia: Number(vlDivergenciaTotal.toFixed(2)),
      percentual_divergencia: percentualDivergencia,
      estoque_movimentado: true,
      financeiro_gerado: true,
    };

    await this.baixaPedidoCompraRepository.update(id, updateData);

    // Atualizar status de atendimento do pedido de compra
    const pedidoCompra = await this.pedidoCompraRepository.findById(baixa.pedidoCompraId);
    if (pedidoCompra) {
      const itensPedido = await this.itemPedidoCompraRepository.findByPedidoCompra(baixa.pedidoCompraId);
      const itensAtivos = itensPedido.filter(i => i.status !== StatusItemPedidoCompra.CANCELADO);
      const todosAtendidos = itensAtivos.length > 0 && itensAtivos.every(i => i.status === StatusItemPedidoCompra.ATENDIDO);
      const algumAtendido = itensAtivos.some(i =>
        i.status === StatusItemPedidoCompra.ATENDIDO || i.status === StatusItemPedidoCompra.PARCIALMENTE_ATENDIDO
      );

      let novoStatusPedido: string | undefined;
      if (todosAtendidos) {
        novoStatusPedido = StatusPedidoCompra.ATENDIDO;
      } else if (algumAtendido) {
        novoStatusPedido = StatusPedidoCompra.PARCIALMENTE_ATENDIDO;
      }

      if (novoStatusPedido && pedidoCompra.status !== novoStatusPedido) {
        await this.pedidoCompraRepository.update(baixa.pedidoCompraId, {
          status: novoStatusPedido,
        } as any);
      }
    }

    // Buscar com associacoes para retorno
    const processed = await this.baixaPedidoCompraRepository.findById(id);
    return this.baixaPedidoCompraMapper.toDto(processed!);
  }

  /**
   * Cancela uma baixa de pedido de compra
   *
   * Regras de negocio:
   * - Valida status pendente ou processada
   * - Se processada: estorno (reverter quantidade_atendida nos ItemPedidoCompra)
   * - Define status=cancelada, motivo_cancelamento, data_cancelamento
   */
  @RequirePermission('baixa_pedido_compra.cancel')
  @Auditable('BaixaPedidoCompra')
  @CacheEvict('baixa_pedido_compra:*')
  @Transactional()
  async cancelar(id: number, motivo: string): Promise<BaixaPedidoCompraResponseDto> {
    const baixa = await this.baixaPedidoCompraRepository.findById(id);
    if (!baixa) {
      throw new NotFoundException('Baixa de pedido de compra', String(id));
    }

    // Validar status
    if (baixa.status === StatusBaixaPedidoCompra.CANCELADA) {
      throw new BusinessException(
        'Baixa de pedido de compra ja esta cancelada',
        'BAIXA_PED_JA_CANCELADA'
      );
    }

    const statusPermitidos = [StatusBaixaPedidoCompra.PENDENTE, StatusBaixaPedidoCompra.PROCESSADA];
    if (!statusPermitidos.includes(baixa.status as StatusBaixaPedidoCompra)) {
      throw new BusinessException(
        `Somente baixas com status pendente ou processada podem ser canceladas. Status atual: ${baixa.status}`,
        'BAIXA_PED_STATUS_NAO_CANCELAVEL'
      );
    }

    // Se processada: estorno (reverter quantidade_atendida nos ItemPedidoCompra)
    if (baixa.status === StatusBaixaPedidoCompra.PROCESSADA) {
      const itensBaixa = await this.itemBaixaPedidoCompraRepository.findByBaixa(id);

      for (const itemBaixa of itensBaixa) {
        const itemPedido = await this.itemPedidoCompraRepository.findById(itemBaixa.itemPedidoCompraId);
        if (itemPedido) {
          const quantidadeBaixa = Number(itemBaixa.quantidade);
          const novaQtdAtendida = Math.max(0, (Number(itemPedido.quantidade_atendida) || 0) - quantidadeBaixa);
          const novaQtdPendente = Number(itemPedido.quantidade_solicitada) - novaQtdAtendida;

          // Determinar novo status do item do pedido
          let novoStatusItem: string;
          if (novaQtdAtendida <= 0) {
            novoStatusItem = StatusItemPedidoCompra.PENDENTE;
          } else if (novaQtdPendente > 0) {
            novoStatusItem = StatusItemPedidoCompra.PARCIALMENTE_ATENDIDO;
          } else {
            novoStatusItem = StatusItemPedidoCompra.ATENDIDO;
          }

          await this.itemPedidoCompraRepository.update(itemPedido.id_item_ped, {
            quantidade_atendida: Number(novaQtdAtendida.toFixed(4)),
            quantidade_pendente: Number(Math.max(0, novaQtdPendente).toFixed(4)),
            status: novoStatusItem,
          } as any);
        }
      }

      // Atualizar status do pedido de compra apos estorno
      const pedidoCompra = await this.pedidoCompraRepository.findById(baixa.pedidoCompraId);
      if (pedidoCompra && pedidoCompra.status !== StatusPedidoCompra.CANCELADO) {
        const itensPedido = await this.itemPedidoCompraRepository.findByPedidoCompra(baixa.pedidoCompraId);
        const itensAtivos = itensPedido.filter(i => i.status !== StatusItemPedidoCompra.CANCELADO);
        const todosAtendidos = itensAtivos.length > 0 && itensAtivos.every(i => i.status === StatusItemPedidoCompra.ATENDIDO);
        const algumAtendido = itensAtivos.some(i =>
          i.status === StatusItemPedidoCompra.ATENDIDO || i.status === StatusItemPedidoCompra.PARCIALMENTE_ATENDIDO
        );

        let novoStatusPedido: string;
        if (todosAtendidos) {
          novoStatusPedido = StatusPedidoCompra.ATENDIDO;
        } else if (algumAtendido) {
          novoStatusPedido = StatusPedidoCompra.PARCIALMENTE_ATENDIDO;
        } else {
          novoStatusPedido = StatusPedidoCompra.APROVADO;
        }

        if (pedidoCompra.status !== novoStatusPedido) {
          await this.pedidoCompraRepository.update(baixa.pedidoCompraId, {
            status: novoStatusPedido,
          } as any);
        }
      }
    }

    // Atualizar a baixa como cancelada
    const updateData: any = {
      status: StatusBaixaPedidoCompra.CANCELADA,
      motivo_cancelamento: motivo,
      data_cancelamento: new Date().toISOString().split('T')[0],
    };

    await this.baixaPedidoCompraRepository.update(id, updateData);

    // Buscar com associacoes para retorno
    const cancelled = await this.baixaPedidoCompraRepository.findById(id);
    return this.baixaPedidoCompraMapper.toDto(cancelled!);
  }

  /**
   * Busca baixas por nota fiscal
   */
  @RequirePermission('baixa_pedido_compra.read')
  @Cacheable('baixa_pedido_compra:findByNotaFiscal', 120)
  async findByNotaFiscal(notaFiscalId: number): Promise<BaixaPedidoCompraResponseDto[]> {
    const baixas = await this.baixaPedidoCompraRepository.findByNotaFiscal(notaFiscalId);
    return baixas.map(b => this.baixaPedidoCompraMapper.toDto(b));
  }

  /**
   * Busca baixas por pedido de compra
   */
  @RequirePermission('baixa_pedido_compra.read')
  @Cacheable('baixa_pedido_compra:findByPedidoCompra', 120)
  async findByPedidoCompra(pedidoCompraId: number): Promise<BaixaPedidoCompraResponseDto[]> {
    const baixas = await this.baixaPedidoCompraRepository.findByPedidoCompra(pedidoCompraId);
    return baixas.map(b => this.baixaPedidoCompraMapper.toDto(b));
  }

  /**
   * Busca baixas por fornecedor
   */
  @RequirePermission('baixa_pedido_compra.read')
  @Cacheable('baixa_pedido_compra:findByFornecedor', 120)
  async findByFornecedor(fornecedorId: number): Promise<BaixaPedidoCompraResponseDto[]> {
    const baixas = await this.baixaPedidoCompraRepository.findByFornecedor(fornecedorId);
    return baixas.map(b => this.baixaPedidoCompraMapper.toDto(b));
  }

  /**
   * Busca baixas pendentes
   */
  @RequirePermission('baixa_pedido_compra.read')
  @Cacheable('baixa_pedido_compra:findPendentes', 120)
  async findPendentes(): Promise<BaixaPedidoCompraResponseDto[]> {
    const baixas = await this.baixaPedidoCompraRepository.findPendentes();
    return baixas.map(b => this.baixaPedidoCompraMapper.toDto(b));
  }

  /**
   * Busca baixas por periodo
   */
  @RequirePermission('baixa_pedido_compra.read')
  @Cacheable('baixa_pedido_compra:findByPeriodo', 120)
  async findByPeriodo(dataInicio: string, dataFim: string): Promise<BaixaPedidoCompraResponseDto[]> {
    const baixas = await this.baixaPedidoCompraRepository.findByPeriodo(dataInicio, dataFim);
    return baixas.map(b => this.baixaPedidoCompraMapper.toDto(b));
  }
}
