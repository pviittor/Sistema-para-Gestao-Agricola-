import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IItemNotaFiscalController } from './interfaces/IItemNotaFiscalController';
import { IItemNotaFiscalApplicationService } from '../application/services/itemNotaFiscal/IItemNotaFiscalApplicationService';
import { CreateItemNotaFiscalDto } from '../application/dto/itemNotaFiscal/CreateItemNotaFiscalDto';
import { UpdateItemNotaFiscalDto } from '../application/dto/itemNotaFiscal/UpdateItemNotaFiscalDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';
import { BadRequestException } from '../core/exceptions/BadRequestException';

/**
 * Controller responsavel pelo gerenciamento de itens de nota fiscal
 *
 * Este controller atua como camada HTTP, delegando toda a logica de negocio
 * para o ItemNotaFiscalApplicationService.
 */
@Injectable()
export class ItemNotaFiscalController implements IItemNotaFiscalController {
  constructor(
    @Inject(TYPES.IItemNotaFiscalApplicationService)
    private itemNotaFiscalService: IItemNotaFiscalApplicationService
  ) {}

  /**
   * Lista todos os itens de nota fiscal com paginacao
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.itemNotaFiscalService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca um item de nota fiscal por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      throw new NotFoundException('Item de nota fiscal', id);
    }

    const item = await this.itemNotaFiscalService.getById(itemId);

    if (!item) {
      throw new NotFoundException('Item de nota fiscal', id);
    }

    res.json(item);
  }

  /**
   * Cria um novo item de nota fiscal
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateItemNotaFiscalDto;

    const item = await this.itemNotaFiscalService.create(dto);

    res.status(201).json(item);
  }

  /**
   * Atualiza um item de nota fiscal existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateItemNotaFiscalDto;

    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      throw new NotFoundException('Item de nota fiscal', id);
    }

    const updatedItem = await this.itemNotaFiscalService.update(itemId, dto);

    res.json(updatedItem);
  }

  /**
   * Remove um item de nota fiscal
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      throw new NotFoundException('Item de nota fiscal', id);
    }

    await this.itemNotaFiscalService.delete(itemId);

    res.status(204).send();
  }

  /**
   * Lista itens de uma nota fiscal especifica
   */
  async findByNotaFiscal(req: Request, res: Response): Promise<void> {
    const { notaFiscalId } = req.params;

    const nfId = parseInt(notaFiscalId, 10);
    if (isNaN(nfId)) {
      throw new BadRequestException('ID da nota fiscal deve ser um numero valido');
    }

    const itens = await this.itemNotaFiscalService.findByNotaFiscal(nfId);

    res.json(itens);
  }

  /**
   * Busca itens por produto
   */
  async findByProduto(req: Request, res: Response): Promise<void> {
    const { produtoId } = req.params;
    const { dataInicio, dataFim } = req.query;

    const prodId = parseInt(produtoId, 10);
    if (isNaN(prodId)) {
      throw new BadRequestException('ID do produto deve ser um numero valido');
    }

    const itens = await this.itemNotaFiscalService.findByProduto(
      prodId,
      dataInicio ? String(dataInicio) : undefined,
      dataFim ? String(dataFim) : undefined
    );

    res.json(itens);
  }

  /**
   * Rastreabilidade por numero de lote
   */
  async findByLote(req: Request, res: Response): Promise<void> {
    const { numeroLote } = req.params;
    const { produtoId } = req.query;

    const itens = await this.itemNotaFiscalService.findByLote(
      numeroLote,
      produtoId ? Number(produtoId) : undefined
    );

    res.json(itens);
  }

  /**
   * Rastreabilidade por numero de serie
   */
  async findByNumeroSerie(req: Request, res: Response): Promise<void> {
    const { numeroSerie } = req.params;

    const item = await this.itemNotaFiscalService.findByNumeroSerie(numeroSerie);

    if (!item) {
      throw new NotFoundException('Item de nota fiscal com numero de serie', numeroSerie);
    }

    res.json(item);
  }

  /**
   * Total vendido por produto em um periodo
   */
  async totalVendidoPorProduto(req: Request, res: Response): Promise<void> {
    const { produtoId } = req.params;
    const { dataInicio, dataFim } = req.query;

    const prodId = parseInt(produtoId, 10);
    if (isNaN(prodId)) {
      throw new BadRequestException('ID do produto deve ser um numero valido');
    }

    if (!dataInicio || !dataFim) {
      throw new BadRequestException('Os parametros dataInicio e dataFim sao obrigatorios');
    }

    const resultado = await this.itemNotaFiscalService.totalVendidoPorProduto(
      prodId,
      String(dataInicio),
      String(dataFim)
    );

    res.json(resultado);
  }
}
