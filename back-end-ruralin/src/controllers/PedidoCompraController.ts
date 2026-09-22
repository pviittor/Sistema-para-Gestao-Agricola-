import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IPedidoCompraController } from './interfaces/IPedidoCompraController';
import { IPedidoCompraApplicationService } from '../application/services/pedidoCompra/IPedidoCompraApplicationService';
import { IIntegracaoFinanceiraService } from '../application/services/integracao/IIntegracaoFinanceiraService';
import { CreatePedidoCompraDto } from '../application/dto/pedidoCompra/CreatePedidoCompraDto';
import { UpdatePedidoCompraDto } from '../application/dto/pedidoCompra/UpdatePedidoCompraDto';
import { CreatePedidoCompraCompletoDto } from '../application/dto/pedidoCompra/CreatePedidoCompraCompletoDto';
import { UpdatePedidoCompraCompletoDto } from '../application/dto/pedidoCompra/UpdatePedidoCompraCompletoDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';
import { BadRequestException } from '../core/exceptions/BadRequestException';

@Injectable()
export class PedidoCompraController implements IPedidoCompraController {
  constructor(
    @Inject(TYPES.IPedidoCompraApplicationService)
    private pedidoCompraService: IPedidoCompraApplicationService,
    @Inject(TYPES.IIntegracaoFinanceiraService)
    private integracaoFinanceiraService: IIntegracaoFinanceiraService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await this.pedidoCompraService.list(page, limit);
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const pedidoId = parseInt(id, 10);
    if (isNaN(pedidoId)) {
      throw new NotFoundException('Pedido de compra', id);
    }
    const pedido = await this.pedidoCompraService.getById(pedidoId);
    if (!pedido) {
      throw new NotFoundException('Pedido de compra', id);
    }
    res.json(pedido);
  }

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreatePedidoCompraDto;
    const pedido = await this.pedidoCompraService.create(dto);
    res.status(201).json(pedido);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdatePedidoCompraDto;
    const pedidoId = parseInt(id, 10);
    if (isNaN(pedidoId)) {
      throw new NotFoundException('Pedido de compra', id);
    }
    const updatedPedido = await this.pedidoCompraService.update(pedidoId, dto);
    res.json(updatedPedido);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const pedidoId = parseInt(id, 10);
    if (isNaN(pedidoId)) {
      throw new NotFoundException('Pedido de compra', id);
    }
    await this.pedidoCompraService.delete(pedidoId);
    res.status(204).send();
  }

  async aprovar(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const pedidoId = parseInt(id, 10);
    if (isNaN(pedidoId)) {
      throw new NotFoundException('Pedido de compra', id);
    }
    const pedido = await this.pedidoCompraService.aprovar(pedidoId);
    res.json(pedido);
  }

  async cancelar(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { motivo } = req.body;
    const pedidoId = parseInt(id, 10);
    if (isNaN(pedidoId)) {
      throw new NotFoundException('Pedido de compra', id);
    }
    if (!motivo) {
      throw new BadRequestException('Motivo do cancelamento e obrigatorio');
    }
    const pedido = await this.pedidoCompraService.cancelar(pedidoId, motivo);
    res.json(pedido);
  }

  async recalcularTotais(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const pedidoId = parseInt(id, 10);
    if (isNaN(pedidoId)) {
      throw new NotFoundException('Pedido de compra', id);
    }
    await this.pedidoCompraService.recalcularTotais(pedidoId);
    res.json({ message: 'Totais recalculados com sucesso' });
  }

  async findByFornecedor(req: Request, res: Response): Promise<void> {
    const { fornecedorId, status } = req.query;
    if (!fornecedorId) {
      throw new BadRequestException('O parametro fornecedorId e obrigatorio');
    }
    const result = await this.pedidoCompraService.findByFornecedor(
      Number(fornecedorId),
      status ? String(status) : undefined
    );
    res.json(result);
  }

  async findByPeriodo(req: Request, res: Response): Promise<void> {
    const { dataInicio, dataFim, status } = req.query;
    if (!dataInicio || !dataFim) {
      throw new BadRequestException('Os parametros dataInicio e dataFim sao obrigatorios');
    }
    const result = await this.pedidoCompraService.findByPeriodo(
      String(dataInicio),
      String(dataFim),
      status ? String(status) : undefined
    );
    res.json(result);
  }

  async findPendentesEntrega(req: Request, res: Response): Promise<void> {
    const { dataPrevisaoAte } = req.query;
    const result = await this.pedidoCompraService.findPendentesEntrega(
      dataPrevisaoAte ? String(dataPrevisaoAte) : undefined
    );
    res.json(result);
  }

  async findByNumero(req: Request, res: Response): Promise<void> {
    const { numero, empresaId } = req.query;
    if (!numero || !empresaId) {
      throw new BadRequestException('Os parametros numero e empresaId sao obrigatorios');
    }
    const result = await this.pedidoCompraService.findByNumero(
      String(numero),
      Number(empresaId)
    );
    res.json(result);
  }

  async totalPorPeriodo(req: Request, res: Response): Promise<void> {
    const { dataInicio, dataFim } = req.query;
    if (!dataInicio || !dataFim) {
      throw new BadRequestException('Os parametros dataInicio e dataFim sao obrigatorios');
    }
    const result = await this.pedidoCompraService.totalPorPeriodo(
      String(dataInicio),
      String(dataFim)
    );
    res.json(result);
  }

  async createCompleto(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreatePedidoCompraCompletoDto;
    const pedidoCompra = await this.pedidoCompraService.createCompleto(dto);
    res.status(201).json(pedidoCompra);
  }

  async updateCompleto(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const dto = req.body as UpdatePedidoCompraCompletoDto;
    const pedidoCompra = await this.pedidoCompraService.updateCompleto(id, dto);
    res.status(200).json(pedidoCompra);
  }

  async gerarFinanceiro(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const pedidoId = parseInt(id, 10);
    if (isNaN(pedidoId)) {
      throw new NotFoundException('Pedido de compra', id);
    }
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    const titulos = await this.integracaoFinanceiraService.gerarTitulosPagarDePedidoCompra(pedidoId, tenantId);
    res.status(201).json(titulos);
  }
}
