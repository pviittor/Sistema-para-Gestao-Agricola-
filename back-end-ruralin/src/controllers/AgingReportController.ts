import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IAgingReportController } from './interfaces/IAgingReportController';
import { IAgingReportService, AgingFiltrosDto } from '../application/services/aging/IAgingReportService';
import { getRequestContext } from '../core/authorization/helpers';

@Injectable()
export class AgingReportController implements IAgingReportController {
  constructor(
    @Inject(TYPES.IAgingReportService)
    private agingService: IAgingReportService
  ) {}

  async gerarAging(req: Request, res: Response): Promise<void> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();

    if (!tenantId) {
      res.status(400).json({ success: false, error: { message: 'Tenant não identificado.' } });
      return;
    }

    const filtros: AgingFiltrosDto = {
      tipo: (req.query.tipo as string) as AgingFiltrosDto['tipo'] || 'AMBOS',
      idFazenda: req.query.idFazenda ? Number(req.query.idFazenda) : undefined,
      idSafra: req.query.idSafra ? Number(req.query.idSafra) : undefined,
      idFornecedorCliente: req.query.idFornecedorCliente ? Number(req.query.idFornecedorCliente) : undefined,
      idPlanoContaGerencial: req.query.idPlanoContaGerencial ? Number(req.query.idPlanoContaGerencial) : undefined,
      dataBase: req.query.dataBase as string | undefined,
    };

    const result = await this.agingService.gerarAging(tenantId, filtros);
    res.json(result);
  }
}

export default AgingReportController;
