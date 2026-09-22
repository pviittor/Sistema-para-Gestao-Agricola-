import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IFazendaApplicationService } from './IFazendaApplicationService';
import { IFazendaRepository } from '../../../infrastructure/repository/IFazendaRepository';
import { IPessoaRepository } from '../../../infrastructure/repository/IPessoaRepository';
import { IMunicipioRepository } from '../../../infrastructure/repository/IMunicipioRepository';
import { FazendaMapper } from '../../mappers/FazendaMapper';
import { CreateFazendaDto, UpdateFazendaDto, FazendaResponseDto } from '../../dto/fazenda';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, BadRequestException, ForbiddenException } from '../../../core/exceptions';
import { RequirePermission } from '../../../core/authorization';
import { getRequestContext } from '../../../core/authorization/helpers';
import Fazenda from '../../../models/Fazenda';

/**
 * Application Service para Fazenda
 */
@Injectable()
export class FazendaApplicationService implements IFazendaApplicationService {
  constructor(
    @Inject(TYPES.IFazendaRepository) private repository: IFazendaRepository,
    @Inject(TYPES.IPessoaRepository) private pessoaRepository: IPessoaRepository,
    @Inject(TYPES.IMunicipioRepository) private municipioRepository: IMunicipioRepository,
    @Inject(FazendaMapper) private mapper: FazendaMapper
  ) {}

  /**
   * Valida se área cultivada não é maior que área total
   */
  private validarAreas(areaTotal: number, areaCultivada: number): void {
    if (areaCultivada > areaTotal) {
      throw new BadRequestException('Área cultivada não pode ser maior que área total');
    }
  }

  /**
   * Valida se dataFim é posterior a dataInicio
   */
  private validarDatasArrendamento(dataInicio?: string | null, dataFim?: string | null): void {
    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);

      if (fim < inicio) {
        throw new BadRequestException('Data de fim do arrendamento deve ser posterior à data de início');
      }
    }
  }

  /**
   * Lista todas as fazendas paginadas
   */
  @RequirePermission('fazenda.read')
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<FazendaResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map((item: Fazenda) => this.mapper.toDto(item)),
    };
  }

  /**
   * Lista todas as fazendas sem paginação
   */
  @RequirePermission('fazenda.read')
  async listAll(): Promise<FazendaResponseDto[]> {
    const fazendas = await this.repository.findAll();
    return fazendas.map((fazenda) => this.mapper.toDto(fazenda));
  }

  /**
   * Busca uma fazenda por ID
   */
  @RequirePermission('fazenda.read')
  async show(id: number): Promise<FazendaResponseDto> {
    const fazenda = await this.repository.findById(id);
    if (!fazenda) {
      throw new NotFoundException('Fazenda não encontrada');
    }
    return this.mapper.toDto(fazenda);
  }

  /**
   * Busca fazendas por pessoa (produtor)
   */
  @RequirePermission('fazenda.read')
  async findByPessoa(idPessoa: number): Promise<FazendaResponseDto[]> {
    // Verificar se a pessoa existe
    const pessoa = await this.pessoaRepository.findById(idPessoa);
    if (!pessoa) {
      throw new NotFoundException('Pessoa não encontrada');
    }

    const fazendas = await this.repository.findByPessoa(idPessoa);
    return fazendas.map((fazenda) => this.mapper.toDto(fazenda));
  }

  /**
   * Busca fazendas por município
   */
  @RequirePermission('fazenda.read')
  async findByMunicipio(idMunicipio: number): Promise<FazendaResponseDto[]> {
    // Verificar se o município existe
    const municipio = await this.municipioRepository.findById(idMunicipio);
    if (!municipio) {
      throw new NotFoundException('Município não encontrado');
    }

    const fazendas = await this.repository.findByMunicipio(idMunicipio);
    return fazendas.map((fazenda) => this.mapper.toDto(fazenda));
  }

  /**
   * Cria uma nova fazenda
   */
  @RequirePermission('fazenda.create')
  async create(dto: CreateFazendaDto): Promise<FazendaResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto não disponível');
    }

    const userId = context.getUserId();
    const tenantId = context.getTenantId();

    if (!userId || !tenantId) {
      throw new BadRequestException('Usuário não autenticado ou tenant não identificado');
    }

    // Validar áreas
    this.validarAreas(dto.areaTotal, dto.areaCultivada);

    // Validar datas de arrendamento
    this.validarDatasArrendamento(dto.dataInicio, dto.dataFim);

    // Validar cross-tenant: Pessoa (produtor) deve pertencer ao mesmo tenant
    const pessoa = await this.pessoaRepository.findById(dto.idPessoa);
    if (!pessoa) {
      throw new NotFoundException('Pessoa não encontrada');
    }
    if (pessoa.tenantId !== tenantId) {
      throw new ForbiddenException('Pessoa não pertence ao mesmo tenant');
    }

    // Validar cross-tenant: Pessoa (arrendador) deve pertencer ao mesmo tenant se fornecida
    if (dto.idPessoaArrendamento) {
      const pessoaArrendamento = await this.pessoaRepository.findById(dto.idPessoaArrendamento);
      if (!pessoaArrendamento) {
        throw new NotFoundException('Pessoa arrendadora não encontrada');
      }
      if (pessoaArrendamento.tenantId !== tenantId) {
        throw new ForbiddenException('Pessoa arrendadora não pertence ao mesmo tenant');
      }
    }

    const entity = this.mapper.toEntity(dto, userId, tenantId);
    const created = await this.repository.create(entity);
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza uma fazenda
   */
  @RequirePermission('fazenda.update')
  async update(id: number, dto: UpdateFazendaDto): Promise<FazendaResponseDto> {
    const fazenda = await this.repository.findById(id);
    if (!fazenda) {
      throw new NotFoundException('Fazenda não encontrada');
    }

    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto não disponível');
    }

    const tenantId = context.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant não identificado');
    }

    // Validar áreas (usar valores do DTO ou da entidade existente)
    const areaTotal = dto.areaTotal !== undefined ? dto.areaTotal : Number(fazenda.areaTotal);
    const areaCultivada = dto.areaCultivada !== undefined ? dto.areaCultivada : Number(fazenda.areaCultivada);
    this.validarAreas(areaTotal, areaCultivada);

    // Validar datas de arrendamento
    const dataInicio = dto.dataInicio !== undefined ? dto.dataInicio : (fazenda.dataInicio ? fazenda.dataInicio.toISOString().split('T')[0] : null);
    const dataFim = dto.dataFim !== undefined ? dto.dataFim : (fazenda.dataFim ? fazenda.dataFim.toISOString().split('T')[0] : null);
    this.validarDatasArrendamento(dataInicio, dataFim);

    // Validar cross-tenant: se idPessoa for fornecido, verificar se pertence ao mesmo tenant
    if (dto.idPessoa !== undefined) {
      const pessoa = await this.pessoaRepository.findById(dto.idPessoa);
      if (!pessoa) {
        throw new NotFoundException('Pessoa não encontrada');
      }
      if (pessoa.tenantId !== tenantId) {
        throw new ForbiddenException('Pessoa não pertence ao mesmo tenant');
      }
    }

    // Validar cross-tenant: se idPessoaArrendamento for fornecido, verificar se pertence ao mesmo tenant
    if (dto.idPessoaArrendamento !== undefined) {
      const pessoaArrendamento = await this.pessoaRepository.findById(dto.idPessoaArrendamento);
      if (!pessoaArrendamento) {
        throw new NotFoundException('Pessoa arrendadora não encontrada');
      }
      if (pessoaArrendamento.tenantId !== tenantId) {
        throw new ForbiddenException('Pessoa arrendadora não pertence ao mesmo tenant');
      }
    }

    const updateData = this.mapper.toUpdateEntity(dto);
    const updated = await this.repository.update(id, updateData);
    return this.mapper.toDto(updated);
  }

  /**
   * Deleta uma fazenda
   */
  @RequirePermission('fazenda.delete')
  async delete(id: number): Promise<boolean> {
    const fazenda = await this.repository.findById(id);
    if (!fazenda) {
      throw new NotFoundException('Fazenda não encontrada');
    }

    return await this.repository.delete(id);
  }
}
