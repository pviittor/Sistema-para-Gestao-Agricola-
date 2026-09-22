/**
 * TituloReceberController - Controller HTTP para Títulos a Receber
 * 
 * Controller responsável pelo gerenciamento de títulos a receber via HTTP.
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o TituloReceberApplicationService. Sua responsabilidade é apenas:
 * - Receber requisições HTTP
 * - Chamar Application Service
 * - Retornar respostas HTTP
 * - Tratar parâmetros de query e path
 */

import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { ITituloReceberController } from './interfaces/ITituloReceberController';
import { ITituloReceberApplicationService } from '../application/services/tituloReceber/ITituloReceberApplicationService';
import { CreateTituloReceberDto } from '../application/dto/tituloReceber/CreateTituloReceberDto';
import { CreateTituloReceberCompletoDto } from '../application/dto/tituloReceber/CreateTituloReceberCompletoDto';
import { UpdateTituloReceberDto } from '../application/dto/tituloReceber/UpdateTituloReceberDto';
import { TituloReceberResponseDto } from '../application/dto/tituloReceber/TituloReceberResponseDto';
import { NotFoundException } from '../core/exceptions';
import { StatusTituloReceber } from '../models/TituloReceber';

/**
 * Controller responsável pelo gerenciamento de títulos a receber
 */
@Injectable()
export class TituloReceberController implements ITituloReceberController {
  constructor(
    @Inject(TYPES.ITituloReceberApplicationService)
    private tituloReceberService: ITituloReceberApplicationService
  ) {}

  /**
   * Lista todos os títulos a receber com paginação
   * GET /api/titulosReceber?page=1&limit=10
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.tituloReceberService.list(page, limit);
    
    res.json(result);
  }

  /**
   * Busca um título a receber por ID
   * GET /api/titulosReceber/:id
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const tituloReceberId = parseInt(id, 10);
    if (isNaN(tituloReceberId)) {
      throw new NotFoundException('Título a receber', id);
    }
    
    const tituloReceber = await this.tituloReceberService.getById(tituloReceberId);
    
    if (!tituloReceber) {
      throw new NotFoundException('Título a receber', id);
    }

    res.json(tituloReceber);
  }

  /**
   * Cria um novo título a receber
   * POST /api/titulosReceber
   */
  async create(req: Request, res: Response): Promise<void> {
    // req.body já está validado e tipado como CreateTituloReceberDto
    const dto = req.body as CreateTituloReceberDto;
    
    // Chamar service para criar (service aplica validações de negócio)
    const tituloReceber = await this.tituloReceberService.create(dto);
    
    res.status(201).json(tituloReceber);
  }

  /**
   * Atualiza um título a receber existente
   * PUT /api/titulosReceber/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    // req.body já está validado e tipado como UpdateTituloReceberDto
    const dto = req.body as UpdateTituloReceberDto;
    
    const tituloReceberId = parseInt(id, 10);
    if (isNaN(tituloReceberId)) {
      throw new NotFoundException('Título a receber', id);
    }
    
    // Chamar service para atualizar (service aplica validações de negócio e autorização)
    const updatedTituloReceber = await this.tituloReceberService.update(tituloReceberId, dto);
    
    res.json(updatedTituloReceber);
  }

  /**
   * Remove um título a receber
   * DELETE /api/titulosReceber/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const tituloReceberId = parseInt(id, 10);
    if (isNaN(tituloReceberId)) {
      throw new NotFoundException('Título a receber', id);
    }
    
    // Chamar service para remover
    await this.tituloReceberService.delete(tituloReceberId);

    res.status(204).send();
  }

  /**
   * Busca títulos a receber por safra
   * GET /api/titulosReceber/safra/:idSafra?page=1&limit=10
   */
  async findBySafra(req: Request, res: Response): Promise<void> {
    const { idSafra } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const safraId = parseInt(idSafra, 10);
    if (isNaN(safraId)) {
      throw new NotFoundException('Safra', idSafra);
    }
    
    const result = await this.tituloReceberService.findBySafra(safraId, page, limit);
    
    res.json(result);
  }

  /**
   * Busca títulos a receber por fazenda
   * GET /api/titulosReceber/fazenda/:idFazenda?page=1&limit=10
   */
  async findByFazenda(req: Request, res: Response): Promise<void> {
    const { idFazenda } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const fazendaId = parseInt(idFazenda, 10);
    if (isNaN(fazendaId)) {
      throw new NotFoundException('Fazenda', idFazenda);
    }
    
    const result = await this.tituloReceberService.findByFazenda(fazendaId, page, limit);
    
    res.json(result);
  }

  /**
   * Busca títulos a receber por cliente
   * GET /api/titulosReceber/cliente/:idCliente?page=1&limit=10
   */
  async findByCliente(req: Request, res: Response): Promise<void> {
    const { idCliente } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const clienteId = parseInt(idCliente, 10);
    if (isNaN(clienteId)) {
      throw new NotFoundException('Cliente', idCliente);
    }
    
    const result = await this.tituloReceberService.findByCliente(clienteId, page, limit);
    
    res.json(result);
  }

  /**
   * Busca títulos a receber por status
   * GET /api/titulosReceber/status/:status?page=1&limit=10
   */
  async findByStatus(req: Request, res: Response): Promise<void> {
    const { status } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    // Validar se status é válido
    if (!Object.values(StatusTituloReceber).includes(status as StatusTituloReceber)) {
      res.status(400).json({
        error: 'Status inválido',
        message: `Status deve ser um dos seguintes valores: ${Object.values(StatusTituloReceber).join(', ')}`,
      });
      return;
    }
    
    const result = await this.tituloReceberService.findByStatus(status as StatusTituloReceber, page, limit);
    
    res.json(result);
  }

  /**
   * Busca títulos a receber por período de lançamento
   * GET /api/titulosReceber/dataLancamento?dataInicio=2024-01-01&dataFim=2024-12-31&page=1&limit=10
   */
  async findByDataLancamento(req: Request, res: Response): Promise<void> {
    const { dataInicio, dataFim } = req.query;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    if (!dataInicio || !dataFim) {
      res.status(400).json({
        error: 'Parâmetros obrigatórios ausentes',
        message: 'Os parâmetros dataInicio e dataFim são obrigatórios',
      });
      return;
    }
    
    if (typeof dataInicio !== 'string' || typeof dataFim !== 'string') {
      res.status(400).json({
        error: 'Formato de data inválido',
        message: 'dataInicio e dataFim devem ser strings no formato YYYY-MM-DD',
      });
      return;
    }
    
    const result = await this.tituloReceberService.findByDataLancamento(dataInicio, dataFim, page, limit);
    
    res.json(result);
  }

  /**
   * Cancela um título a receber
   * POST /api/titulosReceber/:id/cancelar
   */
  async cancelar(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const tituloReceberId = parseInt(id, 10);
    if (isNaN(tituloReceberId)) {
      throw new NotFoundException('Título a receber', id);
    }

    // Chamar service para cancelar
    const tituloReceber = await this.tituloReceberService.cancelar(tituloReceberId);

    res.json(tituloReceber);
  }

  /**
   * Retorna KPIs consolidados dos títulos a receber
   * GET /api/titulosReceber/kpis
   */
  async getKpis(req: Request, res: Response): Promise<void> {
    const idFazenda = req.query.idFazenda ? Number(req.query.idFazenda) : undefined;
    const idSafra = req.query.idSafra ? Number(req.query.idSafra) : undefined;

    const kpis = await this.tituloReceberService.getKpis({ idFazenda, idSafra });

    res.json(kpis);
  }

  /**
   * Cria um título a receber completo com parcelas e rateios em uma única requisição
   * POST /api/titulosReceber/completo
   */
  async createCompleto(req: Request, res: Response): Promise<void> {
    // req.body já está validado e tipado como CreateTituloReceberCompletoDto
    const dto = req.body as CreateTituloReceberCompletoDto;

    // Chamar service para criar completo (service aplica validações de negócio)
    const tituloReceber = await this.tituloReceberService.createCompleto(dto);

    res.status(201).json(tituloReceber);
  }
}

export default TituloReceberController;
