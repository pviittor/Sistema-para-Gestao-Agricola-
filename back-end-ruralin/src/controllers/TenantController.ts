import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { ITenantController } from './interfaces/ITenantController';
import { ITenantApplicationService } from '../application/services/tenant/ITenantApplicationService';
import { CreateTenantDto } from '../application/dto/tenant/CreateTenantDto';
import { UpdateTenantDto } from '../application/dto/tenant/UpdateTenantDto';
import { TenantResponseDto } from '../application/dto/tenant/TenantResponseDto';
import { NotFoundException } from '../core/exceptions';

/**
 * Controller responsável pelo gerenciamento de tenants
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o TenantApplicationService.
 */
@Injectable()
export class TenantController implements ITenantController {
  constructor(
    @Inject(TYPES.ITenantApplicationService)
    private tenantService: ITenantApplicationService
  ) {}

  async index(req: Request, res: Response) {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.tenantService.list(page, limit);

    return res.json(result);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    
    const tenant = await this.tenantService.getById(id);
    
    if (!tenant) {
      throw new NotFoundException('Tenant', id);
    }

    return res.json(tenant);
  }

  async create(req: Request, res: Response) {
    const dto = req.body as CreateTenantDto;
    
    const tenant = await this.tenantService.create(dto);
    
    return res.status(201).json(tenant);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const dto = req.body as UpdateTenantDto;
    
    const updatedTenant = await this.tenantService.update(id, dto);
    
    return res.json(updatedTenant);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    
    await this.tenantService.delete(id);
    
    return res.status(204).send();
  }

  async desativar(req: Request, res: Response) {
    const { id } = req.params;
    
    const tenant = await this.tenantService.desativar(Number(id));
    
    return res.json({
      success: true,
      message: 'Tenant desativado com sucesso',
      data: tenant,
    });
  }

  async ativar(req: Request, res: Response) {
    const { id } = req.params;
    
    const tenant = await this.tenantService.ativar(Number(id));
    
    return res.json({
      success: true,
      message: 'Tenant ativado com sucesso',
      data: tenant,
    });
  }

  async getStatus(req: Request, res: Response) {
    const { id } = req.params;
    
    const status = await this.tenantService.getStatus(Number(id));
    
    if (!status) {
      throw new NotFoundException('Tenant', id);
    }

    return res.json({
      success: true,
      data: status,
    });
  }
}
