import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { INumeracaoReciboRepository } from './INumeracaoReciboRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import NumeracaoRecibo from '../../models/NumeracaoRecibo';
import sequelize from '../../config/database';
import { Transaction } from 'sequelize';

@Injectable()
export class NumeracaoReciboRepository extends BaseRepository<NumeracaoRecibo> implements INumeracaoReciboRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(NumeracaoRecibo, cacheService, tenantService);
  }

  async findBySerieAtiva(): Promise<NumeracaoRecibo | null> {
    const where: any = { ativo: true };
    const tenantFilter = this.getTenantFilter();
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;
    return this.model.findOne({ where });
  }

  async proximoNumero(serieId: number, tenantId: number): Promise<number> {
    const transaction = (sequelize as any)._cls?.get('transaction') as Transaction | undefined;

    const executeWithTransaction = async (t: Transaction) => {
      const numeracao = await NumeracaoRecibo.findOne({
        where: { id: serieId, tenantId },
        lock: Transaction.LOCK.UPDATE,
        transaction: t,
      });

      if (!numeracao) {
        throw new Error('Série de numeração não encontrada');
      }

      numeracao.ultimoNumero += 1;
      await numeracao.save({ transaction: t });
      return numeracao.ultimoNumero;
    };

    if (transaction) return executeWithTransaction(transaction);
    return sequelize.transaction(async (t) => executeWithTransaction(t));
  }
}
