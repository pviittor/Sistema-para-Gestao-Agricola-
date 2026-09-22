import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IPlanoContaGerencialController } from './interfaces/IPlanoContaGerencialController';
import { IPlanoContaGerencialApplicationService } from '../application/services/planoContaGerencial/IPlanoContaGerencialApplicationService';
import { CreatePlanoContaGerencialDto } from '../application/dto/planoContaGerencial/CreatePlanoContaGerencialDto';
import { UpdatePlanoContaGerencialDto } from '../application/dto/planoContaGerencial/UpdatePlanoContaGerencialDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de contas do plano de contas gerencial
 */
@Injectable()
export class PlanoContaGerencialController implements IPlanoContaGerencialController {
  constructor(
    @Inject(TYPES.IPlanoContaGerencialApplicationService)
    private planoContaGerencialService: IPlanoContaGerencialApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.planoContaGerencialService.list(page, limit);
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const contaId = parseInt(id, 10);
    if (isNaN(contaId)) {
      throw new NotFoundException('Conta', id);
    }

    const conta = await this.planoContaGerencialService.getById(contaId);
    if (!conta) {
      throw new NotFoundException('Conta', id);
    }

    res.json(conta);
  }

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreatePlanoContaGerencialDto;
    const conta = await this.planoContaGerencialService.create(dto);
    res.status(201).json(conta);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdatePlanoContaGerencialDto;
    const contaId = parseInt(id, 10);
    if (isNaN(contaId)) {
      throw new NotFoundException('Conta', id);
    }

    const updatedConta = await this.planoContaGerencialService.update(contaId, dto);
    res.json(updatedConta);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const contaId = parseInt(id, 10);
    if (isNaN(contaId)) {
      throw new NotFoundException('Conta', id);
    }

    await this.planoContaGerencialService.delete(contaId);
    res.status(204).send();
  }

  async findByNivel(req: Request, res: Response): Promise<void> {
    const { nivel } = req.params;
    const nivelNum = parseInt(nivel, 10);
    if (isNaN(nivelNum) || nivelNum < 1 || nivelNum > 4) {
      throw new NotFoundException('Nível inválido', nivel);
    }

    const contas = await this.planoContaGerencialService.findByNivel(nivelNum);
    res.json(contas);
  }

  async findByTipo(req: Request, res: Response): Promise<void> {
    const { tipo } = req.params;
    if (tipo !== 'SINTETICA' && tipo !== 'ANALITICA') {
      throw new NotFoundException('Tipo inválido', tipo);
    }

    const contas = await this.planoContaGerencialService.findByTipo(tipo);
    res.json(contas);
  }

  async findByContaPai(req: Request, res: Response): Promise<void> {
    const { contaPaiId } = req.params;
    const paiId = parseInt(contaPaiId, 10);
    if (isNaN(paiId)) {
      throw new NotFoundException('Conta pai', contaPaiId);
    }

    const contas = await this.planoContaGerencialService.findByContaPai(paiId);
    res.json(contas);
  }

  async findArvore(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const contaId = parseInt(id, 10);
    if (isNaN(contaId)) {
      throw new NotFoundException('Conta', id);
    }

    const conta = await this.planoContaGerencialService.findArvore(contaId);
    if (!conta) {
      throw new NotFoundException('Conta', id);
    }

    res.json(conta);
  }
  async findByTipoFluxo(req: Request, res: Response): Promise<void> {
    const { tipoFluxo } = req.params;
    if (tipoFluxo !== 'RECEITA' && tipoFluxo !== 'DESPESA') {
      throw new NotFoundException('Tipo de fluxo inválido', tipoFluxo);
    }

    const apenasAnaliticas = req.query.apenasAnaliticas === 'true';
    const apenasAtivas = req.query.ativo !== 'false'; // default true

    const contas = await this.planoContaGerencialService.findByTipoFluxo(tipoFluxo, apenasAnaliticas, apenasAtivas);
    res.json(contas);
  }
}

export default PlanoContaGerencialController;
