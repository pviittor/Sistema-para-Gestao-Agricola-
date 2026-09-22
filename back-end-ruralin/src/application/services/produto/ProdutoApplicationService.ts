import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IProdutoApplicationService } from './IProdutoApplicationService';
import { IProdutoRepository } from '../../../infrastructure/repository/IProdutoRepository';
import { IUnidadeMedidaRepository } from '../../../infrastructure/repository/IUnidadeMedidaRepository';
import { IGrupoProdutoRepository } from '../../../infrastructure/repository/IGrupoProdutoRepository';
import { ISubGrupoProdutoRepository } from '../../../infrastructure/repository/ISubGrupoProdutoRepository';
import { IPrincipioAtivoRepository } from '../../../infrastructure/repository/IPrincipioAtivoRepository';
import { IPessoaRepository } from '../../../infrastructure/repository/IPessoaRepository';
import { IMoedaRepository } from '../../../infrastructure/repository/IMoedaRepository';
import { CreateProdutoDto } from '../../dto/produto/CreateProdutoDto';
import { UpdateProdutoDto } from '../../dto/produto/UpdateProdutoDto';
import { ProdutoResponseDto } from '../../dto/produto/ProdutoResponseDto';
import { ProdutoMapper } from '../../mappers/ProdutoMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, ForbiddenException } from '../../../core/exceptions';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para Produto
 */
@Injectable()
export class ProdutoApplicationService implements IProdutoApplicationService {
  constructor(
    @Inject(TYPES.IProdutoRepository) private produtoRepository: IProdutoRepository,
    @Inject(TYPES.IUnidadeMedidaRepository) private unidadeMedidaRepository: IUnidadeMedidaRepository,
    @Inject(TYPES.IGrupoProdutoRepository) private grupoProdutoRepository: IGrupoProdutoRepository,
    @Inject(TYPES.ISubGrupoProdutoRepository) private subGrupoProdutoRepository: ISubGrupoProdutoRepository,
    @Inject(TYPES.IPrincipioAtivoRepository) private principioAtivoRepository: IPrincipioAtivoRepository,
    @Inject(TYPES.IPessoaRepository) private pessoaRepository: IPessoaRepository,
    @Inject(TYPES.IMoedaRepository) private moedaRepository: IMoedaRepository,
    private mapper: ProdutoMapper
  ) {}

  @RequirePermission('produto.read')
  @Cacheable('produto:listAll', 3600)
  async listAll(): Promise<ProdutoResponseDto[]> {
    const entities = await this.produtoRepository.findAll();
    return entities.map(item => this.mapper.toDto(item));
  }

  @RequirePermission('produto.read')
  @Cacheable('produto:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<ProdutoResponseDto>> {
    const result = await this.produtoRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  @RequirePermission('produto.read')
  @Cacheable('produto:getById', 3600)
  async getById(id: number | string): Promise<ProdutoResponseDto | null> {
    const produto = await this.produtoRepository.findById(id);
    return produto ? this.mapper.toDto(produto) : null;
  }

  @RequirePermission('produto.read')
  @Cacheable('produto:findByGrupo:{0}', 3600)
  async findByGrupo(idGrupo: number): Promise<ProdutoResponseDto[]> {
    const produtos = await this.produtoRepository.findByGrupo(idGrupo);
    return produtos.map(item => this.mapper.toDto(item));
  }

  @RequirePermission('produto.read')
  @Cacheable('produto:findBySubGrupo:{0}', 3600)
  async findBySubGrupo(idSubGrupo: number): Promise<ProdutoResponseDto[]> {
    const produtos = await this.produtoRepository.findBySubGrupo(idSubGrupo);
    return produtos.map(item => this.mapper.toDto(item));
  }

  @RequirePermission('produto.create')
  @Auditable('Produto')
  @CacheEvict('produto:list:*', true)
  @CacheEvict('produto:findByGrupo:*', true)
  @CacheEvict('produto:findBySubGrupo:*', true)
  @Transactional()
  async create(dto: CreateProdutoDto): Promise<ProdutoResponseDto> {
    const context = getRequestContext();
    if (!context || !context.getUserId() || !context.getTenantId()) {
      throw new ForbiddenException(
        'Usuário não autenticado ou tenant não identificado.',
        'USER_NOT_AUTHENTICATED'
      );
    }
    const userId = context.getUserId()!;
    const tenantId = context.getTenantId()!;

    // Validar cross-tenant para todas as entidades relacionadas obrigatórias
    await this.validateCrossTenantRelations(dto, tenantId);

    const entityData = await this.mapper.toEntity(dto);
    
    const entityWithAudit = {
      ...entityData,
      usercreation: userId,
      datecreation: new Date(),
    };

    const produto = await this.produtoRepository.create(entityWithAudit);
    return this.mapper.toDto(produto);
  }

  @RequirePermission('produto.update')
  @Auditable('Produto')
  @CacheEvict('produto:list:*', true)
  @CacheEvict('produto:getById:*', true)
  @CacheEvict('produto:findByGrupo:*', true)
  @CacheEvict('produto:findBySubGrupo:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateProdutoDto): Promise<ProdutoResponseDto> {
    const produto = await this.produtoRepository.findById(id);
    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    const context = getRequestContext();
    if (!context || !context.getTenantId()) {
      throw new ForbiddenException('Tenant não identificado');
    }
    const tenantId = context.getTenantId()!;

    // Validar cross-tenant apenas para campos que estão sendo atualizados
    await this.validateCrossTenantRelations(dto, tenantId);

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.produtoRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  @RequirePermission('produto.delete')
  @Auditable('Produto')
  @CacheEvict('produto:list:*', true)
  @CacheEvict('produto:getById:*', true)
  @CacheEvict('produto:findByGrupo:*', true)
  @CacheEvict('produto:findBySubGrupo:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const produto = await this.produtoRepository.findById(id);
    if (!produto) {
      return false;
    }
    
    await this.produtoRepository.delete(id);
    return true;
  }

  /**
   * Valida se todas as entidades relacionadas pertencem ao mesmo tenant
   * 
   * O método findById já aplica filtro de tenant, então se retornar null,
   * significa que a entidade não existe ou não pertence ao tenant atual.
   */
  private async validateCrossTenantRelations(
    dto: CreateProdutoDto | UpdateProdutoDto,
    tenantId: number
  ): Promise<void> {
    // Validar UnidadeMedida
    if (dto.idUnidadeMedida !== undefined) {
      const unidadeMedida = await this.unidadeMedidaRepository.findById(dto.idUnidadeMedida);
      if (!unidadeMedida) {
        throw new NotFoundException('Unidade de medida não encontrada ou não pertence ao tenant atual');
      }
    }

    // Validar GrupoProduto
    if (dto.idGrupo !== undefined) {
      const grupo = await this.grupoProdutoRepository.findById(dto.idGrupo);
      if (!grupo) {
        throw new NotFoundException('Grupo de produto não encontrado ou não pertence ao tenant atual');
      }
    }

    // Validar SubGrupoProduto
    if (dto.idSubGrupo !== undefined) {
      const subGrupo = await this.subGrupoProdutoRepository.findById(dto.idSubGrupo);
      if (!subGrupo) {
        throw new NotFoundException('Subgrupo de produto não encontrado ou não pertence ao tenant atual');
      }
    }

    // Validar PrincipioAtivo (opcional)
    if (dto.idPrincipioAtivo !== undefined && dto.idPrincipioAtivo !== null) {
      const principioAtivo = await this.principioAtivoRepository.findById(dto.idPrincipioAtivo);
      if (!principioAtivo) {
        throw new NotFoundException('Princípio ativo não encontrado ou não pertence ao tenant atual');
      }
    }

    // Validar Pessoa/Fabricante (opcional)
    if (dto.idFabricante !== undefined && dto.idFabricante !== null) {
      const fabricante = await this.pessoaRepository.findById(dto.idFabricante);
      if (!fabricante) {
        throw new NotFoundException('Fabricante não encontrado ou não pertence ao tenant atual');
      }
    }

    // Validar Moeda/Indexador (opcional)
    if (dto.idIndexador !== undefined && dto.idIndexador !== null) {
      const indexador = await this.moedaRepository.findById(dto.idIndexador);
      if (!indexador) {
        throw new NotFoundException('Indexador (moeda) não encontrado ou não pertence ao tenant atual');
      }
    }
  }
}
