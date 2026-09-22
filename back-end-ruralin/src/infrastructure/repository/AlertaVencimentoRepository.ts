import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IAlertaVencimentoRepository } from './IAlertaVencimentoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import AlertaVencimento from '../../models/AlertaVencimento';

/**
 * Repositório para entidade AlertaVencimento
 *
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de alertas de vencimento.
 */
@Injectable()
export class AlertaVencimentoRepository extends BaseRepository<AlertaVencimento> implements IAlertaVencimentoRepository {
  /**
   * Construtor do repositório
   *
   * Inicializa o BaseRepository com o modelo AlertaVencimento, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(AlertaVencimento, cacheService, tenantService);
  }

  /**
   * Busca alertas por usuário e tenant
   */
  async findByUsuario(usuarioId: number, tenantId: number): Promise<AlertaVencimento[]> {
    const where: any = { usuarioId, tenantId };

    return this.model.findAll({
      where,
      order: [['dataAlerta', 'DESC']],
    });
  }

  /**
   * Busca alertas não lidos por usuário e tenant
   */
  async findNaoLidos(usuarioId: number, tenantId: number): Promise<AlertaVencimento[]> {
    const where: any = { usuarioId, tenantId, lido: false };

    return this.model.findAll({
      where,
      order: [['dataAlerta', 'DESC']],
    });
  }

  /**
   * Verifica se já existe alerta para uma parcela em uma data específica
   */
  async existeAlertaParaParcela(tipoParcela: string, idParcela: number, dataAlerta: string): Promise<boolean> {
    const where: any = { tipoParcela, idParcela, dataAlerta };
    const tenantFilter = this.getTenantFilter();
    if (tenantFilter?.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * Marca um alerta como lido
   */
  async marcarComoLido(id: number): Promise<void> {
    const where: any = { id };
    const tenantFilter = this.getTenantFilter();
    if (tenantFilter?.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    await this.model.update({ lido: true }, { where });
  }
}
