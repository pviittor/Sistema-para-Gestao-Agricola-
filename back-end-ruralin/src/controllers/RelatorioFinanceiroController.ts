/**
 * RelatorioFinanceiroController - Controller HTTP para Relatórios Financeiros
 * 
 * Controller responsável pelo gerenciamento de relatórios financeiros via HTTP.
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o RelatorioFinanceiroApplicationService. Sua responsabilidade é apenas:
 * - Receber requisições HTTP
 * - Chamar Application Service
 * - Retornar respostas HTTP
 * - Tratar parâmetros de query
 */

import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IRelatorioFinanceiroController } from './interfaces/IRelatorioFinanceiroController';
import { IRelatorioFinanceiroApplicationService } from '../application/services/relatorioFinanceiro/IRelatorioFinanceiroApplicationService';
import { FiltroPlanejadoRealizadoDto, TipoTituloRelatorio } from '../application/dto/relatorio/FiltroPlanejadoRealizadoDto';

/**
 * Controller responsável pelo gerenciamento de relatórios financeiros
 */
@Injectable()
export class RelatorioFinanceiroController implements IRelatorioFinanceiroController {
  constructor(
    @Inject(TYPES.IRelatorioFinanceiroApplicationService)
    private relatorioFinanceiroService: IRelatorioFinanceiroApplicationService
  ) {}

  /**
   * Calcula e retorna relatório de Planejado vs Realizado
   * GET /api/relatorios/planejado-realizado?dataInicio=2024-01-01&dataFim=2024-12-31&...
   */
  async planejadoRealizado(req: Request, res: Response): Promise<void> {
    // Extrair parâmetros da query string
    const { dataInicio, dataFim, idSafra, idFazenda, idPlanoContaGerencial, idCentroCusto, tipo } = req.query;

    // Validar parâmetros obrigatórios
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

    // Construir DTO de filtros
    const filtros: FiltroPlanejadoRealizadoDto = {
      dataInicio,
      dataFim,
    };

    // Adicionar filtros opcionais
    if (idSafra) {
      const safraId = parseInt(idSafra as string, 10);
      if (!isNaN(safraId)) {
        filtros.idSafra = safraId;
      }
    }

    if (idFazenda) {
      const fazendaId = parseInt(idFazenda as string, 10);
      if (!isNaN(fazendaId)) {
        filtros.idFazenda = fazendaId;
      }
    }

    if (idPlanoContaGerencial) {
      const planoContaId = parseInt(idPlanoContaGerencial as string, 10);
      if (!isNaN(planoContaId)) {
        filtros.idPlanoContaGerencial = planoContaId;
      }
    }

    if (idCentroCusto) {
      const centroCustoId = parseInt(idCentroCusto as string, 10);
      if (!isNaN(centroCustoId)) {
        filtros.idCentroCusto = centroCustoId;
      }
    }

    if (tipo) {
      const tipoStr = tipo as string;
      if (Object.values(TipoTituloRelatorio).includes(tipoStr as TipoTituloRelatorio)) {
        filtros.tipo = tipoStr as TipoTituloRelatorio;
      }
    }

    // Chamar service para calcular relatório
    const relatorio = await this.relatorioFinanceiroService.calcularPlanejadoRealizado(filtros);

    res.json(relatorio);
  }

  /**
   * Exporta relatório de Planejado vs Realizado (opcional)
   * GET /api/relatorios/planejado-realizado/exportar?dataInicio=2024-01-01&dataFim=2024-12-31&...
   * 
   * Por enquanto, retorna JSON. Pode ser estendido para exportar em outros formatos (Excel, PDF, etc.)
   */
  async exportarRelatorio(req: Request, res: Response): Promise<void> {
    // Extrair parâmetros da query string (mesmos do planejadoRealizado)
    const { dataInicio, dataFim, idSafra, idFazenda, idPlanoContaGerencial, idCentroCusto, tipo, formato } = req.query;

    // Validar parâmetros obrigatórios
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

    // Construir DTO de filtros
    const filtros: FiltroPlanejadoRealizadoDto = {
      dataInicio,
      dataFim,
    };

    // Adicionar filtros opcionais
    if (idSafra) {
      const safraId = parseInt(idSafra as string, 10);
      if (!isNaN(safraId)) {
        filtros.idSafra = safraId;
      }
    }

    if (idFazenda) {
      const fazendaId = parseInt(idFazenda as string, 10);
      if (!isNaN(fazendaId)) {
        filtros.idFazenda = fazendaId;
      }
    }

    if (idPlanoContaGerencial) {
      const planoContaId = parseInt(idPlanoContaGerencial as string, 10);
      if (!isNaN(planoContaId)) {
        filtros.idPlanoContaGerencial = planoContaId;
      }
    }

    if (idCentroCusto) {
      const centroCustoId = parseInt(idCentroCusto as string, 10);
      if (!isNaN(centroCustoId)) {
        filtros.idCentroCusto = centroCustoId;
      }
    }

    if (tipo) {
      const tipoStr = tipo as string;
      if (Object.values(TipoTituloRelatorio).includes(tipoStr as TipoTituloRelatorio)) {
        filtros.tipo = tipoStr as TipoTituloRelatorio;
      }
    }

    // Chamar service para calcular relatório
    const relatorio = await this.relatorioFinanceiroService.calcularPlanejadoRealizado(filtros);

    // Por enquanto, retorna JSON. Pode ser estendido para outros formatos
    const formatoExportacao = (formato as string) || 'json';

    if (formatoExportacao === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="planejado-realizado-${dataInicio}-${dataFim}.json"`);
      res.json(relatorio);
    } else {
      // Outros formatos (Excel, PDF, etc.) podem ser implementados aqui
      res.status(400).json({
        error: 'Formato de exportação não suportado',
        message: `Formato "${formatoExportacao}" não é suportado. Use "json".`,
      });
    }
  }
}

export default RelatorioFinanceiroController;
