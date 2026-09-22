import { Injectable, Inject } from '../../../core/di'
import { TYPES } from '../../../core/di/types'
import { ICotacaoApplicationService } from './ICotacaoApplicationService'
import { ICotacaoRepository } from '../../../infrastructure/repository/ICotacaoRepository'
import { ICotacaoItemRepository } from '../../../infrastructure/repository/ICotacaoItemRepository'
import { IPedidoCompraRepository } from '../../../infrastructure/repository/IPedidoCompraRepository'
import { CreateCotacaoDto } from '../../dto/cotacao/CreateCotacaoDto'
import { CreateCotacaoCompletoDto } from '../../dto/cotacao/CreateCotacaoCompletoDto'
import { UpdateCotacaoDto } from '../../dto/cotacao/UpdateCotacaoDto'
import { UpdateCotacaoCompletoDto } from '../../dto/cotacao/UpdateCotacaoCompletoDto'
import { CotacaoResponseDto } from '../../dto/cotacao/CotacaoResponseDto'
import { CotacaoMapper } from '../../mappers/CotacaoMapper'
import { RequirePermission } from '../../../core/authorization/RequirePermission'
import { Transactional } from '../../../core/unitofwork/Transactional'
import { Auditable } from '../../../core/audit/Auditable'
import { NotFoundException } from '../../../core/exceptions/NotFoundException'
import { BusinessException } from '../../../core/exceptions/BusinessException'
import { getRequestContext } from '../../../core/authorization/helpers'

/**
 * Application Service para Cotacao
 *
 * Implementa CRUD, operacoes master-detail (completo), ranking e selecao.
 */
@Injectable()
export class CotacaoApplicationService implements ICotacaoApplicationService {
  constructor(
    @Inject(TYPES.ICotacaoRepository)
    private cotacaoRepository: ICotacaoRepository,
    @Inject(TYPES.ICotacaoItemRepository)
    private cotacaoItemRepository: ICotacaoItemRepository,
    @Inject(TYPES.IPedidoCompraRepository)
    private pedidoCompraRepository: IPedidoCompraRepository,
    private mapper: CotacaoMapper
  ) {}

  /**
   * Lista cotacoes com paginacao
   */
  @RequirePermission('cotacao.read')
  async list(page: number = 1, limit: number = 10) {
    const result = await this.cotacaoRepository.findAllPaginated(page, limit)
    return {
      data: result.data.map(c => this.mapper.toResponseDto(c)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    }
  }

  /**
   * Busca cotacao por ID
   */
  @RequirePermission('cotacao.read')
  async getById(id: number): Promise<CotacaoResponseDto | null> {
    const cotacao = await this.cotacaoRepository.findById(id)
    if (!cotacao) return null
    return this.mapper.toResponseDto(cotacao)
  }

  /**
   * Busca cotacao por ID com itens, fornecedor e produto inclusos
   */
  @RequirePermission('cotacao.read')
  async getByIdDetalhado(id: number): Promise<CotacaoResponseDto | null> {
    const cotacao = await this.cotacaoRepository.findById(id)
    if (!cotacao) return null

    // Buscar com itens via repositorio com includes
    const cotacoes = await this.cotacaoRepository.findByPedidoCompraComItens(cotacao.pedidoCompraId)
    const cotacaoCompleta = cotacoes.find(c => c.id === id)
    if (!cotacaoCompleta) return null

    return this.mapper.toResponseDto(cotacaoCompleta)
  }

  /**
   * Cria cotacao simples (sem itens)
   */
  @RequirePermission('cotacao.create')
  @Transactional()
  @Auditable('Cotacao')
  async create(dto: CreateCotacaoDto): Promise<CotacaoResponseDto> {
    await this.validarPedidoCompra(dto.pedidoCompraId)
    await this.validarFornecedorUnico(dto.pedidoCompraId, dto.fornecedorId)

    const entity = await this.mapper.toEntity(dto)
    const ctx = getRequestContext()
    ;(entity as any).tenantId = ctx?.getTenantId()

    const cotacao = await this.cotacaoRepository.create(entity as any)

    // Recalcular ranking
    await this.calcularRankingInterno(dto.pedidoCompraId)

    const resultado = await this.cotacaoRepository.findById(cotacao.id)
    return this.mapper.toResponseDto(resultado!)
  }

  /**
   * Cria cotacao com itens atomicamente
   */
  @RequirePermission('cotacao.create')
  @Transactional()
  @Auditable('Cotacao')
  async createCompleto(dto: CreateCotacaoCompletoDto): Promise<CotacaoResponseDto> {
    await this.validarPedidoCompra(dto.pedidoCompraId)
    await this.validarFornecedorUnico(dto.pedidoCompraId, dto.fornecedorId)

    const entity = await this.mapper.toEntity(dto)
    const ctx = getRequestContext()
    const tenantId = ctx?.getTenantId()
    ;(entity as any).tenantId = tenantId

    // Criar parent
    const cotacao = await this.cotacaoRepository.create(entity as any)

    // Criar itens — injetar FK e tenant
    let vlTotalCotacao = 0
    for (const itemDto of dto.itens) {
      const vlTotalItem = Number((Number(itemDto.quantidade) * Number(itemDto.vl_unitario)).toFixed(2))
      vlTotalCotacao += vlTotalItem

      await this.cotacaoItemRepository.create({
        cotacaoId: cotacao.id,
        tenantId,
        itemPedidoCompraId: itemDto.itemPedidoCompraId,
        produtoId: itemDto.produtoId,
        descricao: itemDto.descricao,
        quantidade: itemDto.quantidade,
        vl_unitario: itemDto.vl_unitario,
        vl_total: vlTotalItem,
        observacao: itemDto.observacao || null,
      } as any)
    }

    // Atualizar vl_total da cotacao
    await this.cotacaoRepository.update(cotacao.id, {
      vl_total: Number(vlTotalCotacao.toFixed(2)),
    } as any)

    // Recalcular ranking
    await this.calcularRankingInterno(dto.pedidoCompraId)

    // Retornar com itens
    const cotacoes = await this.cotacaoRepository.findByPedidoCompraComItens(dto.pedidoCompraId)
    const resultado = cotacoes.find(c => c.id === cotacao.id)
    return this.mapper.toResponseDto(resultado!)
  }

  /**
   * Atualiza cotacao simples
   */
  @RequirePermission('cotacao.update')
  @Transactional()
  @Auditable('Cotacao')
  async update(id: number, dto: UpdateCotacaoDto): Promise<CotacaoResponseDto> {
    const cotacao = await this.cotacaoRepository.findById(id)
    if (!cotacao) {
      throw new NotFoundException('Cotacao', String(id))
    }

    const entity = await this.mapper.toEntity(dto)
    await this.cotacaoRepository.update(id, entity as any)

    // Recalcular ranking se necessario
    await this.calcularRankingInterno(cotacao.pedidoCompraId)

    const resultado = await this.cotacaoRepository.findById(id)
    return this.mapper.toResponseDto(resultado!)
  }

  /**
   * Atualiza cotacao com itens (delete-and-recreate)
   */
  @RequirePermission('cotacao.update')
  @Transactional()
  @Auditable('Cotacao')
  async updateCompleto(id: number, dto: UpdateCotacaoCompletoDto): Promise<CotacaoResponseDto> {
    const cotacao = await this.cotacaoRepository.findById(id)
    if (!cotacao) {
      throw new NotFoundException('Cotacao', String(id))
    }

    const entity = await this.mapper.toEntity(dto)
    await this.cotacaoRepository.update(id, entity as any)

    // Delete-and-recreate itens
    if (dto.itens) {
      await this.cotacaoItemRepository.deleteByCotacao(id)

      const ctx = getRequestContext()
      const tenantId = ctx?.getTenantId()
      let vlTotalCotacao = 0

      for (const itemDto of dto.itens) {
        const vlTotalItem = Number((Number(itemDto.quantidade) * Number(itemDto.vl_unitario)).toFixed(2))
        vlTotalCotacao += vlTotalItem

        await this.cotacaoItemRepository.create({
          cotacaoId: id,
          tenantId,
          itemPedidoCompraId: itemDto.itemPedidoCompraId,
          produtoId: itemDto.produtoId,
          descricao: itemDto.descricao,
          quantidade: itemDto.quantidade,
          vl_unitario: itemDto.vl_unitario,
          vl_total: vlTotalItem,
          observacao: itemDto.observacao || null,
        } as any)
      }

      // Atualizar vl_total da cotacao
      await this.cotacaoRepository.update(id, {
        vl_total: Number(vlTotalCotacao.toFixed(2)),
      } as any)
    }

    // Recalcular ranking
    await this.calcularRankingInterno(cotacao.pedidoCompraId)

    const cotacoes = await this.cotacaoRepository.findByPedidoCompraComItens(cotacao.pedidoCompraId)
    const resultado = cotacoes.find(c => c.id === id)
    return this.mapper.toResponseDto(resultado!)
  }

  /**
   * Remove cotacao e recalcula ranking
   */
  @RequirePermission('cotacao.delete')
  @Transactional()
  @Auditable('Cotacao')
  async delete(id: number): Promise<boolean> {
    const cotacao = await this.cotacaoRepository.findById(id)
    if (!cotacao) {
      throw new NotFoundException('Cotacao', String(id))
    }

    if (cotacao.status === 'selecionada') {
      throw new BusinessException(
        'Nao e possivel deletar uma cotacao selecionada como vencedora',
        'COTACAO_SELECIONADA'
      )
    }

    const pedidoCompraId = cotacao.pedidoCompraId
    await this.cotacaoRepository.delete(id)

    // Recalcular ranking das restantes
    await this.calcularRankingInterno(pedidoCompraId)

    return true
  }

  /**
   * Busca cotacoes por pedido de compra com itens
   */
  @RequirePermission('cotacao.read')
  async findByPedidoCompra(pedidoCompraId: number): Promise<CotacaoResponseDto[]> {
    const cotacoes = await this.cotacaoRepository.findByPedidoCompraComItens(pedidoCompraId)
    return cotacoes.map(c => this.mapper.toResponseDto(c))
  }

  /**
   * Calcula e persiste ranking — exposto via API
   */
  @RequirePermission('cotacao.read')
  @Transactional()
  async calcularRanking(pedidoCompraId: number): Promise<CotacaoResponseDto[]> {
    return this.calcularRankingInterno(pedidoCompraId)
  }

  /**
   * Seleciona cotacao vencedora e atualiza PedidoCompra
   */
  @RequirePermission('cotacao.update')
  @Transactional()
  @Auditable('Cotacao')
  async selecionarVencedora(cotacaoId: number): Promise<CotacaoResponseDto> {
    const cotacao = await this.cotacaoRepository.findById(cotacaoId)
    if (!cotacao) {
      throw new NotFoundException('Cotacao', String(cotacaoId))
    }

    if (cotacao.status === 'rejeitada') {
      throw new BusinessException(
        'Nao e possivel selecionar uma cotacao rejeitada',
        'COTACAO_REJEITADA'
      )
    }

    // Verificar PedidoCompra
    const po = await this.pedidoCompraRepository.findById(cotacao.pedidoCompraId)
    if (!po) {
      throw new NotFoundException('Pedido de compra', String(cotacao.pedidoCompraId))
    }
    if (po.status === 'cancelado' || po.status === 'atendido') {
      throw new BusinessException(
        'Nao e possivel selecionar cotacao para pedido cancelado ou atendido',
        'PO_STATUS_INVALIDO'
      )
    }

    // Marcar todas as outras cotacoes do mesmo PO como rejeitadas
    const todasCotacoes = await this.cotacaoRepository.findByPedidoCompra(cotacao.pedidoCompraId)
    for (const c of todasCotacoes) {
      if (c.id === cotacaoId) {
        await this.cotacaoRepository.update(c.id, { status: 'selecionada' } as any)
      } else if (c.status !== 'rejeitada') {
        await this.cotacaoRepository.update(c.id, { status: 'rejeitada' } as any)
      }
    }

    // Atualizar PedidoCompra com cotacao vencedora
    await this.pedidoCompraRepository.update(cotacao.pedidoCompraId, {
      cotacao_vencedora_id: cotacaoId,
      fornecedorId: cotacao.fornecedorId,
    } as any)

    // Retornar cotacao atualizada com includes
    const cotacoes = await this.cotacaoRepository.findByPedidoCompraComItens(cotacao.pedidoCompraId)
    const resultado = cotacoes.find(c => c.id === cotacaoId)
    return this.mapper.toResponseDto(resultado!)
  }

  // ===== Metodos privados =====

  /**
   * Calcula ranking interno (sem decorator de permissao)
   */
  private async calcularRankingInterno(pedidoCompraId: number): Promise<CotacaoResponseDto[]> {
    const cotacoes = await this.cotacaoRepository.findByPedidoCompra(pedidoCompraId)

    // Separar ativas (nao rejeitadas) e rejeitadas
    const ativas = cotacoes.filter(c => c.status !== 'rejeitada' && c.ativo)
    const rejeitadas = cotacoes.filter(c => c.status === 'rejeitada' || !c.ativo)

    // Ordenar ativas por vl_total ASC, desempate por prazo_entrega_dias ASC, depois data_cotacao ASC
    ativas.sort((a, b) => {
      const vlA = Number(a.vl_total) || 0
      const vlB = Number(b.vl_total) || 0
      if (vlA !== vlB) return vlA - vlB

      // Desempate por prazo_entrega_dias (NULL = Infinity)
      const prazoA = a.prazo_entrega_dias ?? Infinity
      const prazoB = b.prazo_entrega_dias ?? Infinity
      if (prazoA !== prazoB) return prazoA - prazoB

      // Desempate por data_cotacao
      const dataA = a.data_cotacao || ''
      const dataB = b.data_cotacao || ''
      return dataA.localeCompare(dataB)
    })

    // Atribuir ranking_posicao
    for (let i = 0; i < ativas.length; i++) {
      await this.cotacaoRepository.update(ativas[i].id, {
        ranking_posicao: i + 1,
      } as any)
    }

    // Limpar ranking das rejeitadas
    for (const c of rejeitadas) {
      if (c.ranking_posicao !== null) {
        await this.cotacaoRepository.update(c.id, {
          ranking_posicao: null,
        } as any)
      }
    }

    // Retornar cotacoes atualizadas
    const atualizadas = await this.cotacaoRepository.findByPedidoCompraComItens(pedidoCompraId)
    return atualizadas.map(c => this.mapper.toResponseDto(c))
  }

  /**
   * Valida que o PedidoCompra existe e nao esta cancelado
   */
  private async validarPedidoCompra(pedidoCompraId: number): Promise<void> {
    const po = await this.pedidoCompraRepository.findById(pedidoCompraId)
    if (!po) {
      throw new NotFoundException('Pedido de compra', String(pedidoCompraId))
    }
    if (po.status === 'cancelado') {
      throw new BusinessException(
        'Nao e possivel criar cotacao para pedido de compra cancelado',
        'PO_CANCELADO'
      )
    }
  }

  /**
   * Valida unicidade de fornecedor por PedidoCompra
   */
  private async validarFornecedorUnico(pedidoCompraId: number, fornecedorId: number, cotacaoId?: number): Promise<void> {
    const cotacoes = await this.cotacaoRepository.findByPedidoCompra(pedidoCompraId)
    const duplicata = cotacoes.find(c =>
      c.fornecedorId === fornecedorId && c.id !== cotacaoId
    )
    if (duplicata) {
      throw new BusinessException(
        'Ja existe uma cotacao deste fornecedor para este pedido de compra',
        'COTACAO_FORNECEDOR_DUPLICADO'
      )
    }
  }
}
