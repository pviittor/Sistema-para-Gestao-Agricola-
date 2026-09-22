import { IRepository } from '../../core/repository/IRepository';
import NumeracaoRecibo from '../../models/NumeracaoRecibo';

export interface INumeracaoReciboRepository extends IRepository<NumeracaoRecibo> {
  findBySerieAtiva(): Promise<NumeracaoRecibo | null>;
  proximoNumero(serieId: number, tenantId: number): Promise<number>;
}
