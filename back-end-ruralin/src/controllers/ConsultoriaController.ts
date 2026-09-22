import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IConsultoriaController } from './interfaces/IConsultoriaController';
import { IConsultoriaApplicationService } from '../application/services/consultoria/IConsultoriaApplicationService';
import { ITenantRepository } from '../infrastructure/repository/ITenantRepository';
import { CreateConsultoriaDto } from '../application/dto/consultoria/CreateConsultoriaDto';
import { UpdateConsultoriaDto } from '../application/dto/consultoria/UpdateConsultoriaDto';
import { ConsultoriaResponseDto } from '../application/dto/consultoria/ConsultoriaResponseDto';
import { NotFoundException } from '../core/exceptions';
import { TenantMapper } from '../application/mappers/TenantMapper';
import { TenantResponseDto } from '../application/dto/tenant/TenantResponseDto';

/**
 * Controller responsável pelo gerenciamento de consultorias
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o ConsultoriaApplicationService.
 */
@Injectable()
export class ConsultoriaController implements IConsultoriaController {
  private tenantMapper: TenantMapper;

  constructor(
    @Inject(TYPES.IConsultoriaApplicationService)
    private consultoriaService: IConsultoriaApplicationService,
    @Inject(TYPES.ITenantRepository)
    private tenantRepository: ITenantRepository
  ) {
    this.tenantMapper = new TenantMapper();
  }

  async index(req: Request, res: Response) {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.consultoriaService.list(page, limit);

    return res.json(result);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    
    const consultoria = await this.consultoriaService.getById(id);
    
    if (!consultoria) {
      throw new NotFoundException('Consultoria', id);
    }

    return res.json(consultoria);
  }

  async create(req: Request, res: Response) {
    const dto = req.body as CreateConsultoriaDto;
    
    const consultoria = await this.consultoriaService.create(dto);
    
    return res.status(201).json(consultoria);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const dto = req.body as UpdateConsultoriaDto;
    
    const updatedConsultoria = await this.consultoriaService.update(id, dto);
    
    return res.json(updatedConsultoria);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    
    await this.consultoriaService.delete(id);
    
    return res.status(204).send();
  }

  async desativar(req: Request, res: Response) {
    const { id } = req.params;
    
    const consultoria = await this.consultoriaService.desativar(Number(id));
    
    return res.json(consultoria);
  }

  async ativar(req: Request, res: Response) {
    const { id } = req.params;
    
    const consultoria = await this.consultoriaService.ativar(Number(id));
    
    return res.json(consultoria);
  }

  async aumentarLimiteTenants(req: Request, res: Response) {
    const { id } = req.params;
    const { novoLimite } = req.body;
    
    if (!novoLimite || typeof novoLimite !== 'number' || novoLimite < 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'novoLimite deve ser um número maior que 0',
        },
      });
    }
    
    const consultoria = await this.consultoriaService.aumentarLimiteTenants(Number(id), novoLimite);
    
    return res.json(consultoria);
  }

  async listarTenants(req: Request, res: Response) {
    const { id } = req.params;
    
    // Verificar se consultoria existe
    const consultoria = await this.consultoriaService.getById(id);
    if (!consultoria) {
      throw new NotFoundException('Consultoria', id);
    }
    
    // Buscar tenants da consultoria
    const tenants = await this.tenantRepository.findByConsultoria(Number(id));
    
    const tenantsDto: TenantResponseDto[] = tenants.map(tenant => this.tenantMapper.toDto(tenant));
    
    return res.json({
      data: tenantsDto,
      total: tenantsDto.length,
    });
  }
}
