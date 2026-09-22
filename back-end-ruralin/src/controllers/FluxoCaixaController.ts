import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IFluxoCaixaController } from './interfaces/IFluxoCaixaController';
import { IFluxoCaixaCalculadorService } from '../application/services/fluxoCaixa/IFluxoCaixaCalculadorService';
import { IFluxoCaixaConfiguracaoApplicationService } from '../application/services/fluxoCaixaConfiguracao/IFluxoCaixaConfiguracaoApplicationService';
import { BadRequestException } from '../core/exceptions';
import { getRequestContext } from '../core/authorization/helpers';

@Injectable()
export class FluxoCaixaController implements IFluxoCaixaController {
  constructor(
    @Inject(TYPES.IFluxoCaixaCalculadorService)
    private calculadorService: IFluxoCaixaCalculadorService,
    @Inject(TYPES.IFluxoCaixaConfiguracaoApplicationService)
    private configuracaoService: IFluxoCaixaConfiguracaoApplicationService
  ) {}

  private getTenantId(): number {
    const tenantId = getRequestContext()?.getTenantId();
    if (!tenantId) throw new BadRequestException('Tenant não identificado');
    return tenantId;
  }

  private parseQueryParams(req: Request) {
    const { dataInicio, dataFim, periodicidade, contaBancariaIds } = req.query;

    if (!dataInicio || !dataFim || !periodicidade) {
      throw new BadRequestException('Parâmetros obrigatórios: dataInicio, dataFim, periodicidade');
    }

    const periodicidades = ['diario', 'semanal', 'mensal', 'safra'];
    if (!periodicidades.includes(periodicidade as string)) {
      throw new BadRequestException(`Periodicidade deve ser: ${periodicidades.join(', ')}`);
    }

    let parsedContaBancariaIds: number[] | undefined;
    if (contaBancariaIds && typeof contaBancariaIds === 'string') {
      parsedContaBancariaIds = contaBancariaIds.split(',').map(id => {
        const num = parseInt(id.trim(), 10);
        if (isNaN(num)) throw new BadRequestException(`contaBancariaId inválido: ${id}`);
        return num;
      });
    }

    return {
      dataInicio: dataInicio as string,
      dataFim: dataFim as string,
      periodicidade: periodicidade as 'diario' | 'semanal' | 'mensal' | 'safra',
      contaBancariaIds: parsedContaBancariaIds,
    };
  }

  async consolidado(req: Request, res: Response): Promise<void> {
    const tenantId = this.getTenantId();
    const params = this.parseQueryParams(req);

    const resultado = await this.calculadorService.calcularConsolidado(tenantId, params);

    res.json(resultado);
  }

  async realizado(req: Request, res: Response): Promise<void> {
    const tenantId = this.getTenantId();
    const params = this.parseQueryParams(req);

    const resultado = await this.calculadorService.calcularRealizado(tenantId, params);

    res.json(resultado);
  }

  async projetado(req: Request, res: Response): Promise<void> {
    const tenantId = this.getTenantId();
    const params = this.parseQueryParams(req);

    const resultado = await this.calculadorService.calcularProjetado(tenantId, params);

    res.json(resultado);
  }

  async saldosPorConta(req: Request, res: Response): Promise<void> {
    const tenantId = this.getTenantId();
    const params = this.parseQueryParams(req);

    const resultado = await this.calculadorService.calcularConsolidado(tenantId, params);

    res.json(resultado.saldosPorConta);
  }

  async alertas(req: Request, res: Response): Promise<void> {
    const tenantId = this.getTenantId();
    const params = this.parseQueryParams(req);

    const resultado = await this.calculadorService.calcularConsolidado(tenantId, params);

    res.json(resultado.alertas);
  }

  async autocompleteProjetados(req: Request, res: Response): Promise<void> {
    const tenantId = this.getTenantId();
    const { dataInicio, dataFim, search } = req.query;

    if (!dataInicio || !dataFim) {
      throw new BadRequestException('Parâmetros obrigatórios: dataInicio, dataFim');
    }

    const params = {
      dataInicio: dataInicio as string,
      dataFim: dataFim as string,
      periodicidade: 'diario' as const,
      contaBancariaIds: undefined,
    };

    const resultado = await this.calculadorService.calcularProjetado(tenantId, params);

    // Flatten all entries from all periods
    let entries = resultado.periodos.flatMap(p => p.lancamentos);

    // Filter by search term if provided
    if (search && typeof search === 'string' && search.trim()) {
      const termo = search.toLowerCase().trim();
      entries = entries.filter(e => e.descricao.toLowerCase().includes(termo));
    }

    // Limit to 50 results
    entries = entries.slice(0, 50);

    res.json(entries);
  }
}

export default FluxoCaixaController;
