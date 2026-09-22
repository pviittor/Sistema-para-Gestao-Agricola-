import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IMaquinaApplicationService } from './IMaquinaApplicationService';
import { IMaquinaRepository } from '../../../infrastructure/repository/IMaquinaRepository';
import { CreateMaquinaDto } from '../../dto/maquina/CreateMaquinaDto';
import { UpdateMaquinaDto } from '../../dto/maquina/UpdateMaquinaDto';
import { MaquinaResponseDto } from '../../dto/maquina/MaquinaResponseDto';
import { MaquinaMapper } from '../../mappers/MaquinaMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para Maquina
 *
 * Implementa a lógica de negócio para operações com máquinas, veículos e implementos.
 */
@Injectable()
export class MaquinaApplicationService implements IMaquinaApplicationService {
  constructor(
    @Inject(TYPES.IMaquinaRepository) private maquinaRepository: IMaquinaRepository,
    private mapper: MaquinaMapper
  ) {}

  /**
   * Lista todas as máquinas com paginação
   */
  @RequirePermission('maquina.read')
  @Cacheable('maquina:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<MaquinaResponseDto>> {
    const result = await this.maquinaRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca uma máquina por ID
   */
  @RequirePermission('maquina.read')
  @Cacheable('maquina:getById', 3600)
  async getById(id: number | string): Promise<MaquinaResponseDto | null> {
    const maquina = await this.maquinaRepository.findById(id);
    return maquina ? this.mapper.toDto(maquina) : null;
  }

  /**
   * Busca uma máquina pela placa
   */
  @RequirePermission('maquina.read')
  async findByPlaca(placa: string): Promise<MaquinaResponseDto | null> {
    const maquina = await this.maquinaRepository.findByPlaca(placa);
    return maquina ? this.mapper.toDto(maquina) : null;
  }

  /**
   * Busca o motorista associado a uma máquina pela placa
   */
  @RequirePermission('maquina.read')
  async getMotoristaByPlaca(placa: string): Promise<any | null> {
    const maquina = await this.maquinaRepository.findByPlaca(placa);
    if (!maquina) {
      throw new NotFoundException('Máquina não encontrada com a placa informada');
    }

    if (!maquina.idMotorista) {
      return null;
    }

    const dto = this.mapper.toDto(maquina);
    return dto.motorista || null;
  }

  /**
   * Cria uma nova máquina
   */
  @RequirePermission('maquina.create')
  @Auditable('Maquina')
  @CacheEvict('maquina:list')
  @Transactional()
  async create(dto: CreateMaquinaDto): Promise<MaquinaResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto não disponível');
    }

    const userId = context.getUserId();
    const tenantId = context.getTenantId();

    if (!userId || !tenantId) {
      throw new BadRequestException('Usuário não autenticado ou tenant não identificado');
    }

    const entityData = await this.mapper.toEntity(dto);
    (entityData as any).usercreation = userId;
    (entityData as any).tenantId = tenantId;

    const maquina = await this.maquinaRepository.create(entityData);
    return this.mapper.toDto(maquina);
  }

  /**
   * Atualiza uma máquina existente
   */
  @RequirePermission('maquina.update')
  @Auditable('Maquina')
  @CacheEvict('maquina:list:*', true)
  @CacheEvict('maquina:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateMaquinaDto): Promise<MaquinaResponseDto> {
    const maquina = await this.maquinaRepository.findById(id);
    if (!maquina) {
      throw new NotFoundException('Máquina não encontrada');
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.maquinaRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove uma máquina
   */
  @RequirePermission('maquina.delete')
  @Auditable('Maquina')
  @CacheEvict('maquina:list:*', true)
  @CacheEvict('maquina:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const maquina = await this.maquinaRepository.findById(id);
    if (!maquina) {
      return false;
    }

    await this.maquinaRepository.delete(id);
    return true;
  }

  /**
   * Atualiza um campo de horímetro da máquina
   *
   * Só atualiza se o novo valor for maior que o valor atual.
   * Também atualiza ultimoHorimetro se o novo valor for maior.
   */
  @RequirePermission('maquina.update')
  @Auditable('Maquina')
  @CacheEvict('maquina:list:*', true)
  @CacheEvict('maquina:getById:*', true)
  @Transactional()
  async atualizarHorimetro(id: number | string, campo: string, valor: number): Promise<MaquinaResponseDto> {
    const camposPermitidos = ['horimetroAbastecimento', 'horimetroManutencao', 'horimetroApontamento'];
    if (!camposPermitidos.includes(campo)) {
      throw new BadRequestException(`Campo de horímetro inválido. Campos permitidos: ${camposPermitidos.join(', ')}`);
    }

    const maquina = await this.maquinaRepository.findById(id);
    if (!maquina) {
      throw new NotFoundException('Máquina não encontrada');
    }

    const valorAtual = Number((maquina as any)[campo]) || 0;
    if (valor <= valorAtual) {
      throw new BadRequestException(`O novo valor do horímetro (${valor}) deve ser maior que o valor atual (${valorAtual})`);
    }

    const updateData: any = { [campo]: valor };

    // Atualizar ultimoHorimetro se o novo valor for maior
    const ultimoHorimetro = Number(maquina.ultimoHorimetro) || 0;
    if (valor > ultimoHorimetro) {
      updateData.ultimoHorimetro = valor;
    }

    const updated = await this.maquinaRepository.update(id, updateData);
    return this.mapper.toDto(updated);
  }

  /**
   * Calcula a depreciação da máquina
   *
   * depreciacao = (valorAtual - (valorAtual * percsucata / 100)) / vidaUtil
   * depreciacaoPorHora = depreciacao / horaUtilAno
   */
  @RequirePermission('maquina.read')
  async calcularDepreciacao(id: number | string): Promise<{ depreciacaoAnual: number; depreciacaoPorHora: number }> {
    const maquina = await this.maquinaRepository.findById(id);
    if (!maquina) {
      throw new NotFoundException('Máquina não encontrada');
    }

    const valorAtual = Number(maquina.valorAtual) || 0;
    const percsucata = Number(maquina.percsucata) || 0;
    const vidaUtil = Number(maquina.vidaUtil) || 0;
    const horaUtilAno = Number(maquina.horaUtilAno) || 0;

    if (vidaUtil === 0) {
      return { depreciacaoAnual: 0, depreciacaoPorHora: 0 };
    }

    const depreciacaoAnual = (valorAtual - (valorAtual * percsucata / 100)) / vidaUtil;
    const depreciacaoPorHora = horaUtilAno === 0 ? 0 : depreciacaoAnual / horaUtilAno;

    return {
      depreciacaoAnual: Number(depreciacaoAnual.toFixed(4)),
      depreciacaoPorHora: Number(depreciacaoPorHora.toFixed(4)),
    };
  }

  /**
   * Calcula o custo da máquina por hora
   *
   * Se custoFixo === true: retorna valorCustoFixo + valorConsumoFixo
   * Caso contrário, soma condicional:
   *   - custoDepreciacao: depreciacaoAnual / horaUtilAno
   *   - custoManutencao: custo manutenção/hora
   *   - custoCombustivel: custo combustível/hora
   */
  @RequirePermission('maquina.read')
  async calcularCustoMaquina(id: number | string): Promise<{ custoHora: number }> {
    const maquina = await this.maquinaRepository.findById(id);
    if (!maquina) {
      throw new NotFoundException('Máquina não encontrada');
    }

    if (maquina.custoFixo === true) {
      const valorCustoFixo = Number(maquina.valorCustoFixo) || 0;
      const valorConsumoFixo = Number(maquina.valorConsumoFixo) || 0;
      return { custoHora: Number((valorCustoFixo + valorConsumoFixo).toFixed(4)) };
    }

    let custoHora = 0;
    const horaUtilAno = Number(maquina.horaUtilAno) || 0;

    // Custo depreciação
    if (maquina.custoDepreciacao === true) {
      const depreciacaoAnual = Number(maquina.depreciacaoAnual) || 0;
      if (horaUtilAno > 0) {
        custoHora += depreciacaoAnual / horaUtilAno;
      }
    }

    // Custo manutenção
    if (maquina.custoManutencao === true) {
      custoHora += Number(maquina.valorHoraDepreciacao) || 0;
    }

    // Custo combustível
    if (maquina.custoCombustivel === true) {
      custoHora += Number(maquina.consumoEstimadoCombustivel) || 0;
    }

    return { custoHora: Number(custoHora.toFixed(4)) };
  }
}
