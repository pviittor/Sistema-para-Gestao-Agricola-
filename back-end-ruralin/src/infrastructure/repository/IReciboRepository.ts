import { IRepository } from '../../core/repository/IRepository';
import Recibo from '../../models/Recibo';

export interface IReciboRepository extends IRepository<Recibo> {
  findByBeneficiario(nome: string): Promise<Recibo[]>;
  findByPeriodo(dataInicio: string, dataFim: string): Promise<Recibo[]>;
  findByTituloPagar(tituloPagarId: number): Promise<Recibo[]>;
  findByTituloReceber(tituloReceberId: number): Promise<Recibo[]>;
}
