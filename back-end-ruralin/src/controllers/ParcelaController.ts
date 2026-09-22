/**
 * ParcelaController - Controller HTTP para Baixa de Parcelas
 * 
 * Controller responsável pelo gerenciamento de baixa de parcelas via HTTP.
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o ParcelaApplicationService. Sua responsabilidade é apenas:
 * - Receber requisições HTTP
 * - Chamar Application Service
 * - Retornar respostas HTTP
 * - Tratar parâmetros de query e path
 */

import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IParcelaController } from './interfaces/IParcelaController';
import { IParcelaApplicationService } from '../application/services/parcela/IParcelaApplicationService';
import { BaixaParcelaTituloPagarDto } from '../application/dto/parcelaTituloPagar/BaixaParcelaTituloPagarDto';
import { BaixaParcelaTituloReceberDto } from '../application/dto/parcelaTituloReceber/BaixaParcelaTituloReceberDto';
import { NotFoundException } from '../core/exceptions';

/**
 * Controller responsável pelo gerenciamento de baixa de parcelas
 */
@Injectable()
export class ParcelaController implements IParcelaController {
  constructor(
    @Inject(TYPES.IParcelaApplicationService)
    private parcelaService: IParcelaApplicationService
  ) {}

  /**
   * Baixa uma parcela de título a pagar
   * POST /api/parcelas/tituloPagar/:idParcela/baixar
   */
  async baixarParcelaTituloPagar(req: Request, res: Response): Promise<void> {
    const { idParcela } = req.params;
    
    const parcelaId = parseInt(idParcela, 10);
    if (isNaN(parcelaId)) {
      throw new NotFoundException('Parcela de título a pagar', idParcela);
    }
    
    // req.body já está validado e tipado como BaixaParcelaTituloPagarDto
    const dto = req.body as BaixaParcelaTituloPagarDto;
    
    // Chamar service para baixar parcela (service aplica validações de negócio)
    const parcela = await this.parcelaService.baixarParcelaTituloPagar(parcelaId, dto);
    
    res.status(200).json(parcela);
  }

  /**
   * Baixa uma parcela de título a receber
   * POST /api/parcelas/tituloReceber/:idParcela/baixar
   */
  async baixarParcelaTituloReceber(req: Request, res: Response): Promise<void> {
    const { idParcela } = req.params;
    
    const parcelaId = parseInt(idParcela, 10);
    if (isNaN(parcelaId)) {
      throw new NotFoundException('Parcela de título a receber', idParcela);
    }
    
    // req.body já está validado e tipado como BaixaParcelaTituloReceberDto
    const dto = req.body as BaixaParcelaTituloReceberDto;
    
    // Chamar service para baixar parcela (service aplica validações de negócio)
    const parcela = await this.parcelaService.baixarParcelaTituloReceber(parcelaId, dto);
    
    res.status(200).json(parcela);
  }

  /**
   * Consulta movimentos financeiros de uma parcela de título a pagar
   * GET /api/parcelas/tituloPagar/:idParcela/movimentos
   */
  async consultarMovimentosParcelaTituloPagar(req: Request, res: Response): Promise<void> {
    const { idParcela } = req.params;
    
    const parcelaId = parseInt(idParcela, 10);
    if (isNaN(parcelaId)) {
      throw new NotFoundException('Parcela de título a pagar', idParcela);
    }
    
    // Chamar service para consultar movimentos
    const movimentos = await this.parcelaService.consultarMovimentosParcelaTituloPagar(parcelaId);
    
    res.json(movimentos);
  }

  /**
   * Consulta movimentos financeiros de uma parcela de título a receber
   * GET /api/parcelas/tituloReceber/:idParcela/movimentos
   */
  async consultarMovimentosParcelaTituloReceber(req: Request, res: Response): Promise<void> {
    const { idParcela } = req.params;
    
    const parcelaId = parseInt(idParcela, 10);
    if (isNaN(parcelaId)) {
      throw new NotFoundException('Parcela de título a receber', idParcela);
    }
    
    // Chamar service para consultar movimentos
    const movimentos = await this.parcelaService.consultarMovimentosParcelaTituloReceber(parcelaId);
    
    res.json(movimentos);
  }
}

export default ParcelaController;
