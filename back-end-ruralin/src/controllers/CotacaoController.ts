import { Request, Response } from 'express'
import { Injectable, Inject } from '../core/di'
import { TYPES } from '../core/di/types'
import { ICotacaoController } from './interfaces/ICotacaoController'
import { ICotacaoApplicationService } from '../application/services/cotacao/ICotacaoApplicationService'
import { CreateCotacaoDto } from '../application/dto/cotacao/CreateCotacaoDto'
import { UpdateCotacaoDto } from '../application/dto/cotacao/UpdateCotacaoDto'
import { CreateCotacaoCompletoDto } from '../application/dto/cotacao/CreateCotacaoCompletoDto'
import { UpdateCotacaoCompletoDto } from '../application/dto/cotacao/UpdateCotacaoCompletoDto'
import { NotFoundException } from '../core/exceptions/NotFoundException'

/**
 * Controller responsavel pelo gerenciamento de cotacoes
 *
 * Response Format B (Unwrapped): res.json(result) diretamente.
 */
@Injectable()
export class CotacaoController implements ICotacaoController {
  constructor(
    @Inject(TYPES.ICotacaoApplicationService)
    private cotacaoService: ICotacaoApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1
    const limit = req.query.limit ? Number(req.query.limit) : 10
    const result = await this.cotacaoService.list(page, limit)
    res.json(result)
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const cotacaoId = parseInt(id, 10)
    if (isNaN(cotacaoId)) {
      throw new NotFoundException('Cotacao', id)
    }
    const cotacao = await this.cotacaoService.getByIdDetalhado(cotacaoId)
    if (!cotacao) {
      throw new NotFoundException('Cotacao', id)
    }
    res.json(cotacao)
  }

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateCotacaoDto
    const cotacao = await this.cotacaoService.create(dto)
    res.status(201).json(cotacao)
  }

  async createCompleto(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateCotacaoCompletoDto
    const cotacao = await this.cotacaoService.createCompleto(dto)
    res.status(201).json(cotacao)
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const dto = req.body as UpdateCotacaoDto
    const cotacaoId = parseInt(id, 10)
    if (isNaN(cotacaoId)) {
      throw new NotFoundException('Cotacao', id)
    }
    const updatedCotacao = await this.cotacaoService.update(cotacaoId, dto)
    res.json(updatedCotacao)
  }

  async updateCompleto(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const dto = req.body as UpdateCotacaoCompletoDto
    const cotacao = await this.cotacaoService.updateCompleto(id, dto)
    res.json(cotacao)
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const cotacaoId = parseInt(id, 10)
    if (isNaN(cotacaoId)) {
      throw new NotFoundException('Cotacao', id)
    }
    await this.cotacaoService.delete(cotacaoId)
    res.status(204).send()
  }

  async findByPedidoCompra(req: Request, res: Response): Promise<void> {
    const { pedidoCompraId } = req.params
    const id = parseInt(pedidoCompraId, 10)
    if (isNaN(id)) {
      throw new NotFoundException('Pedido de compra', pedidoCompraId)
    }
    const cotacoes = await this.cotacaoService.findByPedidoCompra(id)
    res.json(cotacoes)
  }

  async ranking(req: Request, res: Response): Promise<void> {
    const { pedidoCompraId } = req.params
    const id = parseInt(pedidoCompraId, 10)
    if (isNaN(id)) {
      throw new NotFoundException('Pedido de compra', pedidoCompraId)
    }
    const cotacoes = await this.cotacaoService.calcularRanking(id)
    res.json(cotacoes)
  }

  async selecionar(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const cotacaoId = parseInt(id, 10)
    if (isNaN(cotacaoId)) {
      throw new NotFoundException('Cotacao', id)
    }
    const cotacao = await this.cotacaoService.selecionarVencedora(cotacaoId)
    res.json(cotacao)
  }
}
