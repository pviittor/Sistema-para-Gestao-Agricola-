import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IPrincipioAtivoController } from './interfaces/IPrincipioAtivoController';
import { IPrincipioAtivoApplicationService } from '../application/services/principioAtivo/IPrincipioAtivoApplicationService';
import { CreatePrincipioAtivoDto } from '../application/dto/principioAtivo/CreatePrincipioAtivoDto';
import { UpdatePrincipioAtivoDto } from '../application/dto/principioAtivo/UpdatePrincipioAtivoDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de princípios ativos
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o PrincipioAtivoApplicationService.
 */
@Injectable()
export class PrincipioAtivoController implements IPrincipioAtivoController {
  constructor(
    @Inject(TYPES.IPrincipioAtivoApplicationService)
    private principioAtivoService: IPrincipioAtivoApplicationService
  ) {}

  /**
   * Lista todas as princípios ativos com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.principioAtivoService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca um princípio ativo por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const principioAtivoId = parseInt(id, 10);
    if (isNaN(principioAtivoId)) {
      throw new NotFoundException('Princípio ativo', id);
    }
    
    const principioAtivo = await this.principioAtivoService.getById(principioAtivoId);
    
    if (!principioAtivo) {
      throw new NotFoundException('Princípio ativo', id);
    }

    res.json(principioAtivo);
  }

  /**
   * Cria um novo princípio ativo
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreatePrincipioAtivoDto;
    
    const principioAtivo = await this.principioAtivoService.create(dto);
    
    res.status(201).json(principioAtivo);
  }

  /**
   * Atualiza um princípio ativo existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdatePrincipioAtivoDto;
    
    const principioAtivoId = parseInt(id, 10);
    if (isNaN(principioAtivoId)) {
      throw new NotFoundException('Princípio ativo', id);
    }
    
    const updatedPrincipioAtivo = await this.principioAtivoService.update(principioAtivoId, dto);
    
    res.json(updatedPrincipioAtivo);
  }

  /**
   * Remove um princípio ativo
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const principioAtivoId = parseInt(id, 10);
    if (isNaN(principioAtivoId)) {
      throw new NotFoundException('Princípio ativo', id);
    }
    
    await this.principioAtivoService.delete(principioAtivoId);

    res.status(204).send();
  }
}

export default PrincipioAtivoController;
