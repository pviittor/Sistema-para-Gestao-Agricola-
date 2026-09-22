import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IItemPedidoCompraController } from './interfaces/IItemPedidoCompraController';
import { IItemPedidoCompraApplicationService } from '../application/services/itemPedidoCompra/IItemPedidoCompraApplicationService';
import { CreateItemPedidoCompraDto } from '../application/dto/itemPedidoCompra/CreateItemPedidoCompraDto';
import { UpdateItemPedidoCompraDto } from '../application/dto/itemPedidoCompra/UpdateItemPedidoCompraDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';
import { BadRequestException } from '../core/exceptions/BadRequestException';

@Injectable()
export class ItemPedidoCompraController implements IItemPedidoCompraController {
  constructor(
    @Inject(TYPES.IItemPedidoCompraApplicationService)
    private itemPedidoCompraService: IItemPedidoCompraApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await this.itemPedidoCompraService.list(page, limit);
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      throw new NotFoundException('Item de pedido de compra', id);
    }
    const item = await this.itemPedidoCompraService.getById(itemId);
    if (!item) {
      throw new NotFoundException('Item de pedido de compra', id);
    }
    res.json(item);
  }

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateItemPedidoCompraDto;
    const item = await this.itemPedidoCompraService.create(dto);
    res.status(201).json(item);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateItemPedidoCompraDto;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      throw new NotFoundException('Item de pedido de compra', id);
    }
    const updatedItem = await this.itemPedidoCompraService.update(itemId, dto);
    res.json(updatedItem);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      throw new NotFoundException('Item de pedido de compra', id);
    }
    await this.itemPedidoCompraService.delete(itemId);
    res.status(204).send();
  }

  async findByPedidoCompra(req: Request, res: Response): Promise<void> {
    const { pedidoCompraId } = req.params;
    const id = parseInt(pedidoCompraId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('O parametro pedidoCompraId deve ser um numero valido');
    }
    const result = await this.itemPedidoCompraService.findByPedidoCompra(id);
    res.json(result);
  }

  async findPendentesByPedido(req: Request, res: Response): Promise<void> {
    const { pedidoCompraId } = req.params;
    const id = parseInt(pedidoCompraId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('O parametro pedidoCompraId deve ser um numero valido');
    }
    const result = await this.itemPedidoCompraService.findPendentesByPedido(id);
    res.json(result);
  }

  async findByProduto(req: Request, res: Response): Promise<void> {
    const { produtoId } = req.params;
    const id = parseInt(produtoId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('O parametro produtoId deve ser um numero valido');
    }
    const result = await this.itemPedidoCompraService.findByProduto(id);
    res.json(result);
  }

  async totalCompradoPorProduto(req: Request, res: Response): Promise<void> {
    const { produtoId } = req.params;
    const { dataInicio, dataFim } = req.query;
    const id = parseInt(produtoId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('O parametro produtoId deve ser um numero valido');
    }
    if (!dataInicio || !dataFim) {
      throw new BadRequestException('Os parametros dataInicio e dataFim sao obrigatorios');
    }
    const result = await this.itemPedidoCompraService.totalCompradoPorProduto(
      id,
      String(dataInicio),
      String(dataFim)
    );
    res.json(result);
  }
}
