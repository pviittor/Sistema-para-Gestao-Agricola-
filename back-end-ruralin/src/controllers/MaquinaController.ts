import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IMaquinaController } from './interfaces/IMaquinaController';
import { IMaquinaApplicationService } from '../application/services/maquina/IMaquinaApplicationService';
import { CreateMaquinaDto } from '../application/dto/maquina/CreateMaquinaDto';
import { UpdateMaquinaDto } from '../application/dto/maquina/UpdateMaquinaDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';
import { BadRequestException } from '../core/exceptions/BadRequestException';

/**
 * Controller responsável pelo gerenciamento de máquinas
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o MaquinaApplicationService.
 */
@Injectable()
export class MaquinaController implements IMaquinaController {
  constructor(
    @Inject(TYPES.IMaquinaApplicationService)
    private maquinaService: IMaquinaApplicationService
  ) {}

  /**
   * Lista todas as máquinas com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.maquinaService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca uma máquina por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const maquinaId = parseInt(id, 10);
    if (isNaN(maquinaId)) {
      throw new NotFoundException('Máquina', id);
    }

    const maquina = await this.maquinaService.getById(maquinaId);

    if (!maquina) {
      throw new NotFoundException('Máquina', id);
    }

    res.json(maquina);
  }

  /**
   * Busca uma máquina pela placa
   */
  async findByPlaca(req: Request, res: Response): Promise<void> {
    const { placa } = req.params;

    const maquina = await this.maquinaService.findByPlaca(placa);

    if (!maquina) {
      throw new NotFoundException('Máquina não encontrada com a placa informada');
    }

    res.json(maquina);
  }

  /**
   * Busca o motorista de uma máquina pela placa
   */
  async getMotoristaByPlaca(req: Request, res: Response): Promise<void> {
    const { placa } = req.params;

    const motorista = await this.maquinaService.getMotoristaByPlaca(placa);

    res.json({ motorista });
  }

  /**
   * Calcula a depreciação de uma máquina
   */
  async calcularDepreciacao(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const maquinaId = parseInt(id, 10);
    if (isNaN(maquinaId)) {
      throw new NotFoundException('Máquina', id);
    }

    const result = await this.maquinaService.calcularDepreciacao(maquinaId);

    res.json(result);
  }

  /**
   * Calcula o custo de uma máquina por hora
   */
  async calcularCustoMaquina(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const maquinaId = parseInt(id, 10);
    if (isNaN(maquinaId)) {
      throw new NotFoundException('Máquina', id);
    }

    const result = await this.maquinaService.calcularCustoMaquina(maquinaId);

    res.json(result);
  }

  /**
   * Cria uma nova máquina
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateMaquinaDto;

    const maquina = await this.maquinaService.create(dto);

    res.status(201).json(maquina);
  }

  /**
   * Atualiza uma máquina existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateMaquinaDto;

    const maquinaId = parseInt(id, 10);
    if (isNaN(maquinaId)) {
      throw new NotFoundException('Máquina', id);
    }

    const updatedMaquina = await this.maquinaService.update(maquinaId, dto);

    res.json(updatedMaquina);
  }

  /**
   * Atualiza um campo de horímetro de uma máquina
   */
  async atualizarHorimetro(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { campo, valor } = req.body;

    const maquinaId = parseInt(id, 10);
    if (isNaN(maquinaId)) {
      throw new NotFoundException('Máquina', id);
    }

    if (!campo || valor === undefined || valor === null) {
      throw new BadRequestException('Os campos "campo" e "valor" são obrigatórios');
    }

    if (typeof valor !== 'number' || valor < 0) {
      throw new BadRequestException('O campo "valor" deve ser um número maior ou igual a zero');
    }

    const updatedMaquina = await this.maquinaService.atualizarHorimetro(maquinaId, campo, valor);

    res.json(updatedMaquina);
  }

  /**
   * Remove uma máquina
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const maquinaId = parseInt(id, 10);
    if (isNaN(maquinaId)) {
      throw new NotFoundException('Máquina', id);
    }

    await this.maquinaService.delete(maquinaId);

    res.status(204).send();
  }
}

export default MaquinaController;
