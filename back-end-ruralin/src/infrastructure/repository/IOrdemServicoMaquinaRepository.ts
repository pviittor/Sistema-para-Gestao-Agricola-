import { IRepository } from '../../core/repository/IRepository';
import OrdemServicoMaquina from '../../models/OrdemServicoMaquina';

/**
 * Interface para repositório de OrdemServicoMaquina
 *
 * Repositório filho (child) do padrão master-detail.
 * Estende IRepository e adiciona métodos específicos de busca por ordem de serviço.
 */
export interface IOrdemServicoMaquinaRepository extends IRepository<OrdemServicoMaquina> {
  /**
   * Busca máquinas vinculadas a uma ordem de serviço,
   * incluindo Maquina (as 'maquina'), Maquina (as 'implemento') e Pessoa (as 'operador')
   */
  findByOrdemServico(osId: number): Promise<OrdemServicoMaquina[]>;

  /**
   * Remove todas as máquinas de uma ordem de serviço
   */
  deleteByOrdemServico(osId: number): Promise<number>;
}
