import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IItemBaixaPedidoCompraController } from './interfaces/IItemBaixaPedidoCompraController';
import { IItemBaixaPedidoCompraApplicationService } from '../application/services/itemBaixaPedidoCompra/IItemBaixaPedidoCompraApplicationService';
import { CreateItemBaixaPedidoCompraDto } from '../application/dto/itemBaixaPedidoCompra/CreateItemBaixaPedidoCompraDto';
import { UpdateItemBaixaPedidoCompraDto } from '../application/dto/itemBaixaPedidoCompra/UpdateItemBaixaPedidoCompraDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';
import { BadRequestException } from '../core/exceptions/BadRequestException';

@Injectable()
export class ItemBaixaPedidoCompraController implements IItemBaixaPedidoCompraController {
  constructor(
    @Inject(TYPES.IItemBaixaPedidoCompraApplicationService)
    private itemBaixaPedidoCompraService: IItemBaixaPedidoCompraApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await this.itemBaixaPedidoCompraService.list(page, limit);
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      throw new NotFoundException('Item de baixa de pedido de compra', id);
    }
    const item = await this.itemBaixaPedidoCompraService.getById(itemId);
    if (!item) {
      throw new NotFoundException('Item de baixa de pedido de compra', id);
    }
    res.json(item);
  }

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateItemBaixaPedidoCompraDto;
    const item = await this.itemBaixaPedidoCompraService.create(dto);
    res.status(201).json(item);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateItemBaixaPedidoCompraDto;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      throw new NotFoundException('Item de baixa de pedido de compra', id);
    }
    const updatedItem = await this.itemBaixaPedidoCompraService.update(itemId, dto);
    res.json(updatedItem);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      throw new NotFoundException('Item de baixa de pedido de compra', id);
    }
    await this.itemBaixaPedidoCompraService.delete(itemId);
    res.status(204).send();
  }

  async findByBaixaPedidoCompra(req: Request, res: Response): Promise<void> {
    const { baixaPedidoCompraId } = req.params;
    const id = parseInt(baixaPedidoCompraId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('O parametro baixaPedidoCompraId deve ser um numero valido');
    }
    const result = await this.itemBaixaPedidoCompraService.findByBaixaPedidoCompra(id);
    res.json(result);
  }

  async findByItemPedidoCompra(req: Request, res: Response): Promise<void> {
    const { itemPedidoCompraId } = req.params;
    const id = parseInt(itemPedidoCompraId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('O parametro itemPedidoCompraId deve ser um numero valido');
    }
    const result = await this.itemBaixaPedidoCompraService.findByItemPedidoCompra(id);
    res.json(result);
  }
}
