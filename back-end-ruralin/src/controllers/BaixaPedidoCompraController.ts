import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IBaixaPedidoCompraController } from './interfaces/IBaixaPedidoCompraController';
import { IBaixaPedidoCompraApplicationService } from '../application/services/baixaPedidoCompra/IBaixaPedidoCompraApplicationService';
import { CreateBaixaPedidoCompraDto } from '../application/dto/baixaPedidoCompra/CreateBaixaPedidoCompraDto';
import { UpdateBaixaPedidoCompraDto } from '../application/dto/baixaPedidoCompra/UpdateBaixaPedidoCompraDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';
import { BadRequestException } from '../core/exceptions/BadRequestException';

@Injectable()
export class BaixaPedidoCompraController implements IBaixaPedidoCompraController {
  constructor(
    @Inject(TYPES.IBaixaPedidoCompraApplicationService)
    private baixaPedidoCompraService: IBaixaPedidoCompraApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await this.baixaPedidoCompraService.list(page, limit);
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const baixaId = parseInt(id, 10);
    if (isNaN(baixaId)) {
      throw new NotFoundException('Baixa de pedido de compra', id);
    }
    const baixa = await this.baixaPedidoCompraService.getById(baixaId);
    if (!baixa) {
      throw new NotFoundException('Baixa de pedido de compra', id);
    }
    res.json(baixa);
  }

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateBaixaPedidoCompraDto;
    const baixa = await this.baixaPedidoCompraService.create(dto);
    res.status(201).json(baixa);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateBaixaPedidoCompraDto;
    const baixaId = parseInt(id, 10);
    if (isNaN(baixaId)) {
      throw new NotFoundException('Baixa de pedido de compra', id);
    }
    const updatedBaixa = await this.baixaPedidoCompraService.update(baixaId, dto);
    res.json(updatedBaixa);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const baixaId = parseInt(id, 10);
    if (isNaN(baixaId)) {
      throw new NotFoundException('Baixa de pedido de compra', id);
    }
    await this.baixaPedidoCompraService.delete(baixaId);
    res.status(204).send();
  }

  async processar(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const baixaId = parseInt(id, 10);
    if (isNaN(baixaId)) {
      throw new NotFoundException('Baixa de pedido de compra', id);
    }
    const baixa = await this.baixaPedidoCompraService.processar(baixaId);
    res.json(baixa);
  }

  async cancelar(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { motivo } = req.body;
    const baixaId = parseInt(id, 10);
    if (isNaN(baixaId)) {
      throw new NotFoundException('Baixa de pedido de compra', id);
    }
    if (!motivo) {
      throw new BadRequestException('Motivo do cancelamento e obrigatorio');
    }
    const baixa = await this.baixaPedidoCompraService.cancelar(baixaId, motivo);
    res.json(baixa);
  }

  async findByNotaFiscal(req: Request, res: Response): Promise<void> {
    const { notaFiscalId } = req.params;
    const id = parseInt(notaFiscalId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('O parametro notaFiscalId deve ser um numero valido');
    }
    const result = await this.baixaPedidoCompraService.findByNotaFiscal(id);
    res.json(result);
  }

  async findByPedidoCompra(req: Request, res: Response): Promise<void> {
    const { pedidoCompraId } = req.params;
    const id = parseInt(pedidoCompraId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('O parametro pedidoCompraId deve ser um numero valido');
    }
    const result = await this.baixaPedidoCompraService.findByPedidoCompra(id);
    res.json(result);
  }

  async findByFornecedor(req: Request, res: Response): Promise<void> {
    const { fornecedorId } = req.query;
    if (!fornecedorId) {
      throw new BadRequestException('O parametro fornecedorId e obrigatorio');
    }
    const result = await this.baixaPedidoCompraService.findByFornecedor(Number(fornecedorId));
    res.json(result);
  }

  async findPendentes(req: Request, res: Response): Promise<void> {
    const result = await this.baixaPedidoCompraService.findPendentes();
    res.json(result);
  }

  async findByPeriodo(req: Request, res: Response): Promise<void> {
    const { dataInicio, dataFim } = req.query;
    if (!dataInicio || !dataFim) {
      throw new BadRequestException('Os parametros dataInicio e dataFim sao obrigatorios');
    }
    const result = await this.baixaPedidoCompraService.findByPeriodo(String(dataInicio), String(dataFim));
    res.json(result);
  }
}
