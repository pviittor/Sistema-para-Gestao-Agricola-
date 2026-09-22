import { IRepository } from '../../core/repository/IRepository';
import Cfop from '../../models/Cfop';

export interface ICfopRepository extends IRepository<Cfop> {
  findByCodigo(codigo: string): Promise<Cfop | null>;
  findAllNoPagination(): Promise<Cfop[]>;
}
