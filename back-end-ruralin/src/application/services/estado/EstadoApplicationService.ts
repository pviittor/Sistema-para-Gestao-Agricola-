import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { container } from '../../../core/di/container';
import { IEstadoApplicationService } from './IEstadoApplicationService';
import { IEstadoRepository } from '../../../infrastructure/repository/IEstadoRepository';
import { IMunicipioRepository } from '../../../infrastructure/repository/IMunicipioRepository';
import { EstadoMapper } from '../../mappers/EstadoMapper';
import { CreateEstadoDto, UpdateEstadoDto, EstadoResponseDto } from '../../dto/estado';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, BadRequestException } from '../../../core/exceptions';
import { RequireRole } from '../../../core/authorization/RequireRole';
import { getRequestContext } from '../../../core/authorization/helpers';
import Estado from '../../../models/Estado';

/**
 * Application Service para Estado
 * 
 * Dados globais - não vinculados a tenant
 * - Listagem disponível para todos autenticados
 * - Manutenção (create/update/delete) apenas para GOD
 */
@Injectable()
export class EstadoApplicationService implements IEstadoApplicationService {
  constructor(
    @Inject(TYPES.IEstadoRepository) private repository: IEstadoRepository,
    @Inject(EstadoMapper) private mapper: EstadoMapper
  ) {}

  /**
   * Lista todos os estados paginados (disponível para todos autenticados)
   */
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<EstadoResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map((item: Estado) => this.mapper.toDto(item)),
    };
  }

  /**
   * Lista todos os estados sem paginação (disponível para todos autenticados)
   */
  async listAll(): Promise<EstadoResponseDto[]> {
    const estados = await this.repository.findAll();
    return estados.map((estado) => this.mapper.toDto(estado));
  }

  /**
   * Busca um estado por ID (disponível para todos autenticados)
   */
  async show(id: number): Promise<EstadoResponseDto> {
    const estado = await this.repository.findById(id);
    if (!estado) {
      throw new NotFoundException('Estado não encontrado');
    }
    return this.mapper.toDto(estado);
  }

  /**
   * Busca um estado pela sigla (disponível para todos autenticados)
   */
  async findBySigla(sigla: string): Promise<EstadoResponseDto | null> {
    const estado = await this.repository.findBySigla(sigla);
    if (!estado) {
      return null;
    }
    return this.mapper.toDto(estado);
  }

  /**
   * Cria um novo estado (apenas GOD)
   */
  @RequireRole('GOD')
  async create(dto: CreateEstadoDto): Promise<EstadoResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto não disponível');
    }

    const userId = context.getUserId();
    if (!userId) {
      throw new BadRequestException('Usuário não autenticado');
    }

    // Verificar se já existe estado com a mesma sigla
    const estadoExistente = await this.repository.findBySigla(dto.sigla);
    if (estadoExistente) {
      throw new BadRequestException('Já existe um estado com esta sigla');
    }

    const entity = this.mapper.toEntity(dto, userId);
    const created = await this.repository.create(entity);
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza um estado (apenas GOD)
   */
  @RequireRole('GOD')
  async update(id: number, dto: UpdateEstadoDto): Promise<EstadoResponseDto> {
    const estado = await this.repository.findById(id);
    if (!estado) {
      throw new NotFoundException('Estado não encontrado');
    }

    // Se estiver atualizando a sigla, verificar se já existe outra com a mesma sigla
    if (dto.sigla && dto.sigla.toUpperCase() !== estado.sigla) {
      const estadoExistente = await this.repository.findBySigla(dto.sigla);
      if (estadoExistente && estadoExistente.id !== id) {
        throw new BadRequestException('Já existe um estado com esta sigla');
      }
    }

    const updateData = this.mapper.toUpdateEntity(dto);
    const updated = await this.repository.update(id, updateData);
    return this.mapper.toDto(updated);
  }

  /**
   * Deleta um estado (apenas GOD)
   */
  @RequireRole('GOD')
  async delete(id: number): Promise<boolean> {
    const estado = await this.repository.findById(id);
    if (!estado) {
      throw new NotFoundException('Estado não encontrado');
    }

    // Verificar se existem municípios vinculados ao estado
    const municipioRepository = container.resolve<IMunicipioRepository>(TYPES.IMunicipioRepository);
    const municipios = await municipioRepository.findByEstado(id);

    if (municipios.length > 0) {
      throw new BadRequestException('Não é possível deletar o estado pois existem municípios vinculados');
    }

    return await this.repository.delete(id);
  }
}
