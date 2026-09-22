/**
 * TituloPagarController - Controller HTTP para Títulos a Pagar
 * 
 * Controller responsável pelo gerenciamento de títulos a pagar via HTTP.
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o TituloPagarApplicationService. Sua responsabilidade é apenas:
 * - Receber requisições HTTP
 * - Chamar Application Service
 * - Retornar respostas HTTP
 * - Tratar parâmetros de query e path
 */

import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { ITituloPagarController } from './interfaces/ITituloPagarController';
import { ITituloPagarApplicationService } from '../application/services/tituloPagar/ITituloPagarApplicationService';
import { CreateTituloPagarDto } from '../application/dto/tituloPagar/CreateTituloPagarDto';
import { CreateTituloPagarCompletoDto } from '../application/dto/tituloPagar/CreateTituloPagarCompletoDto';
import { UpdateTituloPagarDto } from '../application/dto/tituloPagar/UpdateTituloPagarDto';
import { TituloPagarResponseDto } from '../application/dto/tituloPagar/TituloPagarResponseDto';
import { NotFoundException } from '../core/exceptions';
import { StatusTituloPagar } from '../models/TituloPagar';

/**
 * Controller responsável pelo gerenciamento de títulos a pagar
 */
@Injectable()
export class TituloPagarController implements ITituloPagarController {
  constructor(
    @Inject(TYPES.ITituloPagarApplicationService)
    private tituloPagarService: ITituloPagarApplicationService
  ) {}

  /**
   * Lista todos os títulos a pagar com paginação
   * GET /api/titulosPagar?page=1&limit=10
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.tituloPagarService.list(page, limit);
    
    res.json(result);
  }

  /**
   * Busca um título a pagar por ID
   * GET /api/titulosPagar/:id
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const tituloPagarId = parseInt(id, 10);
    if (isNaN(tituloPagarId)) {
      throw new NotFoundException('Título a pagar', id);
    }
    
    const tituloPagar = await this.tituloPagarService.getById(tituloPagarId);
    
    if (!tituloPagar) {
      throw new NotFoundException('Título a pagar', id);
    }

    res.json(tituloPagar);
  }

  /**
   * Cria um novo título a pagar
   * POST /api/titulosPagar
   */
  async create(req: Request, res: Response): Promise<void> {
    // req.body já está validado e tipado como CreateTituloPagarDto
    const dto = req.body as CreateTituloPagarDto;
    
    // Chamar service para criar (service aplica validações de negócio)
    const tituloPagar = await this.tituloPagarService.create(dto);
    
    res.status(201).json(tituloPagar);
  }

  /**
   * Atualiza um título a pagar existente
   * PUT /api/titulosPagar/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    // req.body já está validado e tipado como UpdateTituloPagarDto
    const dto = req.body as UpdateTituloPagarDto;
    
    const tituloPagarId = parseInt(id, 10);
    if (isNaN(tituloPagarId)) {
      throw new NotFoundException('Título a pagar', id);
    }
    
    // Chamar service para atualizar (service aplica validações de negócio e autorização)
    const updatedTituloPagar = await this.tituloPagarService.update(tituloPagarId, dto);
    
    res.json(updatedTituloPagar);
  }

  /**
   * Remove um título a pagar
   * DELETE /api/titulosPagar/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const tituloPagarId = parseInt(id, 10);
    if (isNaN(tituloPagarId)) {
      throw new NotFoundException('Título a pagar', id);
    }
    
    // Chamar service para remover
    await this.tituloPagarService.delete(tituloPagarId);

    res.status(204).send();
  }

  /**
   * Busca títulos a pagar por safra
   * GET /api/titulosPagar/safra/:idSafra?page=1&limit=10
   */
  async findBySafra(req: Request, res: Response): Promise<void> {
    const { idSafra } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const safraId = parseInt(idSafra, 10);
    if (isNaN(safraId)) {
      throw new NotFoundException('Safra', idSafra);
    }
    
    const result = await this.tituloPagarService.findBySafra(safraId, page, limit);
    
    res.json(result);
  }

  /**
   * Busca títulos a pagar por fazenda
   * GET /api/titulosPagar/fazenda/:idFazenda?page=1&limit=10
   */
  async findByFazenda(req: Request, res: Response): Promise<void> {
    const { idFazenda } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const fazendaId = parseInt(idFazenda, 10);
    if (isNaN(fazendaId)) {
      throw new NotFoundException('Fazenda', idFazenda);
    }
    
    const result = await this.tituloPagarService.findByFazenda(fazendaId, page, limit);
    
    res.json(result);
  }

  /**
   * Busca títulos a pagar por fornecedor
   * GET /api/titulosPagar/fornecedor/:idFornecedor?page=1&limit=10
   */
  async findByFornecedor(req: Request, res: Response): Promise<void> {
    const { idFornecedor } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const fornecedorId = parseInt(idFornecedor, 10);
    if (isNaN(fornecedorId)) {
      throw new NotFoundException('Fornecedor', idFornecedor);
    }
    
    const result = await this.tituloPagarService.findByFornecedor(fornecedorId, page, limit);
    
    res.json(result);
  }

  /**
   * Busca títulos a pagar por status
   * GET /api/titulosPagar/status/:status?page=1&limit=10
   */
  async findByStatus(req: Request, res: Response): Promise<void> {
    const { status } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    // Validar se status é válido
    if (!Object.values(StatusTituloPagar).includes(status as StatusTituloPagar)) {
      res.status(400).json({
        error: 'Status inválido',
        message: `Status deve ser um dos seguintes valores: ${Object.values(StatusTituloPagar).join(', ')}`,
      });
      return;
    }
    
    const result = await this.tituloPagarService.findByStatus(status as StatusTituloPagar, page, limit);
    
    res.json(result);
  }

  /**
   * Busca títulos a pagar por período de lançamento
   * GET /api/titulosPagar/dataLancamento?dataInicio=2024-01-01&dataFim=2024-12-31&page=1&limit=10
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
    
    const result = await this.tituloPagarService.findByDataLancamento(dataInicio, dataFim, page, limit);
    
    res.json(result);
  }

  /**
   * Cancela um título a pagar
   * POST /api/titulosPagar/:id/cancelar
   */
  async cancelar(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const tituloPagarId = parseInt(id, 10);
    if (isNaN(tituloPagarId)) {
      throw new NotFoundException('Título a pagar', id);
    }
    
    // Chamar service para cancelar
    const tituloPagar = await this.tituloPagarService.cancelar(tituloPagarId);
    
    res.json(tituloPagar);
  }

  /**
   * Retorna KPIs consolidados dos títulos a pagar
   * GET /api/titulosPagar/kpis
   */
  async getKpis(req: Request, res: Response): Promise<void> {
    const idFazenda = req.query.idFazenda ? Number(req.query.idFazenda) : undefined;
    const idSafra = req.query.idSafra ? Number(req.query.idSafra) : undefined;

    const kpis = await this.tituloPagarService.getKpis({ idFazenda, idSafra });

    res.json(kpis);
  }

  /**
   * Cria um título a pagar completo com parcelas e rateios em uma única requisição
   * POST /api/titulosPagar/completo
   */
  async createCompleto(req: Request, res: Response): Promise<void> {
    // req.body já está validado e tipado como CreateTituloPagarCompletoDto
    const dto = req.body as CreateTituloPagarCompletoDto;
    
    // Chamar service para criar completo (service aplica validações de negócio)
    const tituloPagar = await this.tituloPagarService.createCompleto(dto);
    
    res.status(201).json(tituloPagar);
  }
}

export default TituloPagarController;
