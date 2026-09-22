import { IApplicationService } from '../IApplicationService';
import { CreateMaquinaDto } from '../../dto/maquina/CreateMaquinaDto';
import { UpdateMaquinaDto } from '../../dto/maquina/UpdateMaquinaDto';
import { MaquinaResponseDto } from '../../dto/maquina/MaquinaResponseDto';

/**
 * Interface para Application Service de Maquina
 *
 * Define os métodos disponíveis para operações de negócio com máquinas.
 */
export interface IMaquinaApplicationService extends IApplicationService<MaquinaResponseDto, CreateMaquinaDto, UpdateMaquinaDto> {
  /**
   * Busca uma máquina pela placa
   */
  findByPlaca(placa: string): Promise<MaquinaResponseDto | null>;

  /**
   * Busca o motorista associado a uma máquina pela placa
   */
  getMotoristaByPlaca(placa: string): Promise<any | null>;

  /**
   * Atualiza um campo de horímetro da máquina
   * Só atualiza se o novo valor for maior que o atual
   */
  atualizarHorimetro(id: number | string, campo: string, valor: number): Promise<MaquinaResponseDto>;

  /**
   * Calcula a depreciação da máquina
   */
  calcularDepreciacao(id: number | string): Promise<{ depreciacaoAnual: number; depreciacaoPorHora: number }>;

  /**
   * Calcula o custo da máquina por hora
   */
  calcularCustoMaquina(id: number | string): Promise<{ custoHora: number }>;
}
