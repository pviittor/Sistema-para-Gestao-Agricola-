import { Request, Response } from "express";
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IFinanceiroController } from './interfaces/IFinanceiroController';
import { IFinanceiroApplicationService } from '../application/services/financeiro/IFinanceiroApplicationService';
import { CreateFinanceiroDto } from '../application/dto/financeiro/CreateFinanceiroDto';
import { UpdateFinanceiroDto } from '../application/dto/financeiro/UpdateFinanceiroDto';
import { FinanceiroResponseDto } from '../application/dto/financeiro/FinanceiroResponseDto';
import { NotFoundException } from '../core/exceptions';

/**
 * Controller responsável pelo gerenciamento de registros financeiros
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o FinanceiroApplicationService. Sua responsabilidade é apenas:
 * - Receber requisições HTTP
 * - Chamar Application Service
 * - Retornar respostas HTTP
 */
@Injectable()
export class FinanceiroController implements IFinanceiroController {
  constructor(
    @Inject(TYPES.IFinanceiroApplicationService)
    private financeiroService: IFinanceiroApplicationService
  ) {}

  async index(req: Request, res: Response) {
    const userId = req.userId;

    if (!userId) {
      throw new NotFoundException('Usuário');
    }

    // Usar service para listar registros financeiros
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    // TODO: Service deveria filtrar por usuarioId, por enquanto filtramos manualmente
    const result = await this.financeiroService.list(page, limit);
    const itensDoUsuario = result.data.filter(item => item.usuarioId === Number(userId));

    return res.json({
      ...result,
      data: itensDoUsuario,
    });
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    
    // Usar service para buscar registro financeiro
    const item = await this.financeiroService.getById(id);

    if (!item) {
      throw new NotFoundException('Registro financeiro', id);
    }

    return res.json(item);
  }

  async create(req: Request, res: Response) {
    const userId = req.userId;

    if (!userId) {
      throw new NotFoundException('Usuário');
    }

    // req.body já está validado e tipado como CreateFinanceiroDto
    const dto = req.body as CreateFinanceiroDto;
    
    // Usar service para criar registro financeiro (service aplica validações de negócio)
    // TODO: Service deveria receber usuarioId, por enquanto adicionamos manualmente
    const item = await this.financeiroService.create({ ...dto, usuarioId: Number(userId) } as any);
    
    return res.status(201).json(item);
  }

  async update(req: Request, res: Response) {
    const userId = req.userId;

    if (!userId) {
      throw new NotFoundException('Usuário');
    }

    const { id } = req.params;
    // req.body já está validado e tipado como UpdateFinanceiroDto
    const dto = req.body as UpdateFinanceiroDto;
    
    // Usar service para atualizar registro financeiro (service aplica validações de negócio)
    const updatedItem = await this.financeiroService.update(id, dto);
    
    return res.json(updatedItem);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    
    // Usar service para remover registro financeiro
    const deleted = await this.financeiroService.delete(id);

    if (!deleted) {
      throw new NotFoundException('Registro financeiro', id);
    }

    return res.status(204).send();
  }
}

export default FinanceiroController;
