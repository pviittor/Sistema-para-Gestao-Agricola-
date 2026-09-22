import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IServicoBenfeitoriaApplicationService } from './IServicoBenfeitoriaApplicationService';
import { IServicoBenfeitoriaRepository } from '../../../infrastructure/repository/IServicoBenfeitoriaRepository';
import { IServicoAgricolaRepository } from '../../../infrastructure/repository/IServicoAgricolaRepository';
import { IBenfeitoriaRepository } from '../../../infrastructure/repository/IBenfeitoriaRepository';
import { ITituloPagarRepository } from '../../../infrastructure/repository/ITituloPagarRepository';
import { CreateServicoBenfeitoriaDto } from '../../dto/servicoBenfeitoria/CreateServicoBenfeitoriaDto';
import { UpdateServicoBenfeitoriaDto } from '../../dto/servicoBenfeitoria/UpdateServicoBenfeitoriaDto';
import { ServicoBenfeitoriaResponseDto } from '../../dto/servicoBenfeitoria/ServicoBenfeitoriaResponseDto';
import { ServicoBenfeitoriaMapper } from '../../mappers/ServicoBenfeitoriaMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para ServicoBenfeitoria
 *
 * Implementa a logica de negocio para operacoes de servico de benfeitoria.
 * Inclui logica de criacao automatica de TituloPagar quando o servico tem financeiro_srv == true.
 */
@Injectable()
export class ServicoBenfeitoriaApplicationService implements IServicoBenfeitoriaApplicationService {
  constructor(
    @Inject(TYPES.IServicoBenfeitoriaRepository) private servicoBenfeitoriaRepository: IServicoBenfeitoriaRepository,
    @Inject(TYPES.IBenfeitoriaRepository) private benfeitoriaRepository: IBenfeitoriaRepository,
    @Inject(TYPES.IServicoAgricolaRepository) private servicoAgricolaRepository: IServicoAgricolaRepository,
    @Inject(TYPES.ITituloPagarRepository) private tituloPagarRepository: ITituloPagarRepository,
    private mapper: ServicoBenfeitoriaMapper
  ) {}

  /**
   * Lista todos os servicos de benfeitoria com paginacao
   */
  @RequirePermission('servicoBenfeitoria.read')
  @Cacheable('servicoBenfeitoria:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<ServicoBenfeitoriaResponseDto>> {
    const result = await this.servicoBenfeitoriaRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca um servico de benfeitoria por ID
   */
  @RequirePermission('servicoBenfeitoria.read')
  @Cacheable('servicoBenfeitoria:getById', 3600)
  async getById(id: number | string): Promise<ServicoBenfeitoriaResponseDto | null> {
    const servicoBenfeitoria = await this.servicoBenfeitoriaRepository.findById(id);
    return servicoBenfeitoria ? this.mapper.toDto(servicoBenfeitoria) : null;
  }

  /**
   * Cria um novo servico de benfeitoria
   *
   * Se o servico agricola vinculado tiver financeiro_srv == true,
   * cria automaticamente um TituloPagar associado.
   */
  @RequirePermission('servicoBenfeitoria.create')
  @Auditable('ServicoBenfeitoria')
  @CacheEvict('servicoBenfeitoria:list')
  @Transactional()
  async create(dto: CreateServicoBenfeitoriaDto): Promise<ServicoBenfeitoriaResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto nao disponivel');
    }

    const userId = context.getUserId();
    const tenantId = context.getTenantId();

    if (!userId || !tenantId) {
      throw new BadRequestException('Usuario nao autenticado ou tenant nao identificado');
    }

    const entityData = await this.mapper.toEntity(dto);
    (entityData as any).usercreation = userId;
    (entityData as any).tenantId = tenantId;

    // Verificar se o ServicoAgricola vinculado tem financeiro_srv == true
    const servicoAgricola = await this.servicoAgricolaRepository.findById(dto.idServico);

    if (servicoAgricola && (servicoAgricola as any).financeiro_srv === true) {
      // Buscar benfeitoria para informacoes de fazenda e safra
      const benfeitoria = await this.benfeitoriaRepository.findById(dto.idBenfeitoria);
      if (benfeitoria) {
        try {
          // Criar TituloPagar automaticamente
          const tituloPagar = await this.tituloPagarRepository.create({
            tenantId,
            idFornecedor: dto.idResponsavel,
            idPortador: dto.idResponsavel,
            idProdutor: dto.idResponsavel,
            idFazenda: (benfeitoria as any).idFazenda,
            idSafra: dto.idSafra || (benfeitoria as any).idSafra || 1,
            idMoeda: dto.idMoeda || 1,
            dataLancamento: new Date(dto.data),
            numeroTitulo: `BENF-SRV-${Date.now()}`,
            valorTitulo: dto.valor,
            quantidadeParcelas: 1,
            observacao: `Titulo gerado automaticamente - Servico Benfeitoria`,
            impostoRenda: false,
            status: 'ABERTO',
            usercreation: userId,
          } as any);

          (entityData as any).idPagar = tituloPagar.id;
        } catch {
          // Se a criacao do TituloPagar falhar, continua sem ele
        }
      }
    }

    const servicoBenfeitoria = await this.servicoBenfeitoriaRepository.create(entityData);

    return this.mapper.toDto(servicoBenfeitoria);
  }

  /**
   * Atualiza um servico de benfeitoria existente
   */
  @RequirePermission('servicoBenfeitoria.update')
  @Auditable('ServicoBenfeitoria')
  @CacheEvict('servicoBenfeitoria:list:*', true)
  @CacheEvict('servicoBenfeitoria:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateServicoBenfeitoriaDto): Promise<ServicoBenfeitoriaResponseDto> {
    const servicoBenfeitoria = await this.servicoBenfeitoriaRepository.findById(id);
    if (!servicoBenfeitoria) {
      throw new NotFoundException('ServicoBenfeitoria', String(id));
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.servicoBenfeitoriaRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um servico de benfeitoria
   */
  @RequirePermission('servicoBenfeitoria.delete')
  @Auditable('ServicoBenfeitoria')
  @CacheEvict('servicoBenfeitoria:list:*', true)
  @CacheEvict('servicoBenfeitoria:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const servicoBenfeitoria = await this.servicoBenfeitoriaRepository.findById(id);
    if (!servicoBenfeitoria) {
      return false;
    }

    await this.servicoBenfeitoriaRepository.delete(id);
    return true;
  }
}
