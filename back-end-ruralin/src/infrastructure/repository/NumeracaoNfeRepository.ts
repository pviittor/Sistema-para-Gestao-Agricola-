import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { INumeracaoNfeRepository } from './INumeracaoNfeRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import NumeracaoNfe from '../../models/NumeracaoNfe';
import sequelize from '../../config/database';
import { Transaction } from 'sequelize';

/**
 * Repositório para entidade NumeracaoNfe
 */
@Injectable()
export class NumeracaoNfeRepository extends BaseRepository<NumeracaoNfe> implements INumeracaoNfeRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(NumeracaoNfe, cacheService, tenantService);
  }

  async findBySerieModelo(serie: string, modelo: string): Promise<NumeracaoNfe | null> {
    const where: any = { serie, modelo };
    const tenantFilter = this.getTenantFilter();
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;
    return this.model.findOne({ where });
  }

  /**
   * Obtém próximo número sequencial com lock pessimista
   * Se o registro não existir, cria com ultimo_numero=1 e retorna 1
   */
  async proximoNumero(serie: string, modelo: string, tenantId: number): Promise<number> {
    // Tenta usar transação do contexto (@Transactional), senão cria nova
    const transaction = (sequelize as any)._cls?.get('transaction') as Transaction | undefined;

    const executeWithTransaction = async (t: Transaction) => {
      // Lock pessimista (SELECT FOR UPDATE)
      let numeracao = await NumeracaoNfe.findOne({
        where: { serie, modelo, tenantId },
        lock: Transaction.LOCK.UPDATE,
        transaction: t,
      });

      if (!numeracao) {
        // Criar registro com primeiro número
        numeracao = await NumeracaoNfe.create(
          { serie, modelo, tenantId, ultimo_numero: 1, ativo: true },
          { transaction: t }
        );
        return 1;
      }

      // Incrementar
      numeracao.ultimo_numero += 1;
      await numeracao.save({ transaction: t });
      return numeracao.ultimo_numero;
    };

    if (transaction) {
      return executeWithTransaction(transaction);
    }

    // Se não há transação no contexto, cria uma nova
    return sequelize.transaction(async (t) => {
      return executeWithTransaction(t);
    });
  }
}
