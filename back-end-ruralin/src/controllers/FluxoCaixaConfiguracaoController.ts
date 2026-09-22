import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IFluxoCaixaConfiguracaoController } from './interfaces/IFluxoCaixaConfiguracaoController';
import { IFluxoCaixaConfiguracaoApplicationService } from '../application/services/fluxoCaixaConfiguracao/IFluxoCaixaConfiguracaoApplicationService';
import { UpdateFluxoCaixaConfiguracaoDto } from '../application/dto/fluxoCaixaConfiguracao';
import { BadRequestException } from '../core/exceptions';
import { getRequestContext } from '../core/authorization/helpers';

@Injectable()
export class FluxoCaixaConfiguracaoController implements IFluxoCaixaConfiguracaoController {
  constructor(
    @Inject(TYPES.IFluxoCaixaConfiguracaoApplicationService)
    private configuracaoService: IFluxoCaixaConfiguracaoApplicationService
  ) {}

  private getTenantId(): number {
    const tenantId = getRequestContext()?.getTenantId();
    if (!tenantId) throw new BadRequestException('Tenant não identificado');
    return tenantId;
  }

  async getByTenant(req: Request, res: Response): Promise<void> {
    const tenantId = this.getTenantId();

    const configuracao = await this.configuracaoService.getByTenant(tenantId);

    res.json(configuracao);
  }

  async upsertByTenant(req: Request, res: Response): Promise<void> {
    const tenantId = this.getTenantId();
    const dto = req.body as UpdateFluxoCaixaConfiguracaoDto;

    const configuracao = await this.configuracaoService.upsertByTenant(tenantId, dto);

    res.json(configuracao);
  }
}

export default FluxoCaixaConfiguracaoController;
