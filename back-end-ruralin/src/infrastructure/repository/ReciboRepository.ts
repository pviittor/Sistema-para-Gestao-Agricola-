import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IReciboRepository } from './IReciboRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Recibo from '../../models/Recibo';
import TituloPagar from '../../models/TituloPagar';
import TituloReceber from '../../models/TituloReceber';
import { Op } from 'sequelize';

@Injectable()
export class ReciboRepository extends BaseRepository<Recibo> implements IReciboRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Recibo, cacheService, tenantService);
  }

  async findById(id: number): Promise<Recibo | null> {
    const where: any = { id };
    const tenantFilter = this.getTenantFilter();
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;
    return this.model.findOne({
      where,
      include: [
        { model: TituloPagar, as: 'tituloPagar' },
        { model: TituloReceber, as: 'tituloReceber' },
      ],
    });
  }

  async findByBeneficiario(nome: string): Promise<Recibo[]> {
    const where: any = { nomeBeneficiario: { [Op.like]: `%${nome}%` } };
    const tenantFilter = this.getTenantFilter();
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;
    return this.model.findAll({ where, order: [['id', 'DESC']] });
  }

  async findByPeriodo(dataInicio: string, dataFim: string): Promise<Recibo[]> {
    const where: any = { dataEmissao: { [Op.between]: [dataInicio, dataFim] } };
    const tenantFilter = this.getTenantFilter();
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;
    return this.model.findAll({ where, order: [['dataEmissao', 'DESC']] });
  }

  async findByTituloPagar(tituloPagarId: number): Promise<Recibo[]> {
    const where: any = { tituloPagarId };
    const tenantFilter = this.getTenantFilter();
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;
    return this.model.findAll({ where, order: [['id', 'DESC']] });
  }

  async findByTituloReceber(tituloReceberId: number): Promise<Recibo[]> {
    const where: any = { tituloReceberId };
    const tenantFilter = this.getTenantFilter();
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;
    return this.model.findAll({ where, order: [['id', 'DESC']] });
  }
}
