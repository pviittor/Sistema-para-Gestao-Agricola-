import { IRepository } from '../../core/repository/IRepository';
import ConfiguracaoRecibo from '../../models/ConfiguracaoRecibo';

export interface IConfiguracaoReciboRepository extends IRepository<ConfiguracaoRecibo> {
  findByTenant(): Promise<ConfiguracaoRecibo | null>;
}
