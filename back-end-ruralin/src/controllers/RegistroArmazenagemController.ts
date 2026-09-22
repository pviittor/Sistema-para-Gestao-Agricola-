import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { IRegistroArmazenagemController } from './interfaces/IRegistroArmazenagemController';
import { IRegistroArmazenagemApplicationService } from '../application/services/registroArmazenagem/IRegistroArmazenagemApplicationService';
import { CreateRegistroArmazenagemDto } from '../application/dto/registroArmazenagem/CreateRegistroArmazenagemDto';
import { UpdateRegistroArmazenagemDto } from '../application/dto/registroArmazenagem/UpdateRegistroArmazenagemDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';
import { BadRequestException } from '../core/exceptions/BadRequestException';

/**
 * Controller responsável pelo gerenciamento de registros de armazenagem
 */
@Injectable()
export class RegistroArmazenagemController implements IRegistroArmazenagemController {
  constructor(
    @Inject(Symbol.for('IRegistroArmazenagemApplicationService'))
    private registroArmazenagemService: IRegistroArmazenagemApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.registroArmazenagemService.list(page, limit);
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const registroId = parseInt(id, 10);
    if (isNaN(registroId)) {
      throw new NotFoundException('RegistroArmazenagem', id);
    }

    const registro = await this.registroArmazenagemService.getById(registroId);
    if (!registro) {
      throw new NotFoundException('RegistroArmazenagem', id);
    }

    res.json(registro);
  }

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateRegistroArmazenagemDto;
    const registro = await this.registroArmazenagemService.create(dto);
    res.status(201).json(registro);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateRegistroArmazenagemDto;
    const registroId = parseInt(id, 10);
    if (isNaN(registroId)) {
      throw new NotFoundException('RegistroArmazenagem', id);
    }

    const updatedRegistro = await this.registroArmazenagemService.update(registroId, dto);
    res.json(updatedRegistro);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const registroId = parseInt(id, 10);
    if (isNaN(registroId)) {
      throw new NotFoundException('RegistroArmazenagem', id);
    }

    await this.registroArmazenagemService.delete(registroId);
    res.status(204).send();
  }

  async findByUnidadeDeposito(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const unidadeDepositoId = parseInt(id, 10);
    if (isNaN(unidadeDepositoId)) {
      throw new NotFoundException('UnidadeDeposito', id);
    }

    const registros = await this.registroArmazenagemService.findByUnidadeDeposito(unidadeDepositoId);
    res.json(registros);
  }

  async findByPeriodo(req: Request, res: Response): Promise<void> {
    const dataInicio = req.query.dataInicio as string;
    const dataFim = req.query.dataFim as string;

    if (!dataInicio || !dataFim) {
      throw new BadRequestException('Parâmetros dataInicio e dataFim são obrigatórios');
    }

    const registros = await this.registroArmazenagemService.findByPeriodo(dataInicio, dataFim);
    res.json(registros);
  }

  async findByProduto(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const produtoId = parseInt(id, 10);
    if (isNaN(produtoId)) {
      throw new NotFoundException('Produto', id);
    }

    const registros = await this.registroArmazenagemService.findByProduto(produtoId);
    res.json(registros);
  }

  async getSaldoByUnidade(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const unidadeDepositoId = parseInt(id, 10);
    if (isNaN(unidadeDepositoId)) {
      throw new NotFoundException('UnidadeDeposito', id);
    }

    const saldo = await this.registroArmazenagemService.getSaldoByUnidade(unidadeDepositoId);
    res.json({ saldo });
  }
}

export default RegistroArmazenagemController;
