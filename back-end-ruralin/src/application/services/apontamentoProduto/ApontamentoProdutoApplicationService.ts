import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IApontamentoProdutoApplicationService } from './IApontamentoProdutoApplicationService';
import { IApontamentoProdutoRepository } from '../../../infrastructure/repository/IApontamentoProdutoRepository';
import { IApontamentoRepository } from '../../../infrastructure/repository/IApontamentoRepository';
import { IConfiguradorCicloRepository } from '../../../infrastructure/repository/IConfiguradorCicloRepository';
import { ITalhaoRepository } from '../../../infrastructure/repository/ITalhaoRepository';
import { IMovimentoEstoqueRepository } from '../../../infrastructure/repository/IMovimentoEstoqueRepository';
import { CreateApontamentoProdutoDto } from '../../dto/apontamentoProduto/CreateApontamentoProdutoDto';
import { UpdateApontamentoProdutoDto } from '../../dto/apontamentoProduto/UpdateApontamentoProdutoDto';
import { ApontamentoProdutoResponseDto } from '../../dto/apontamentoProduto/ApontamentoProdutoResponseDto';
import { ApontamentoProdutoMapper } from '../../mappers/ApontamentoProdutoMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para ApontamentoProduto
 *
 * Implementa a lógica de negócio para operações de apontamento de produto.
 * Na criação, gera automaticamente um MovimentoEstoque.
 */
@Injectable()
export class ApontamentoProdutoApplicationService implements IApontamentoProdutoApplicationService {
  constructor(
    @Inject(TYPES.IApontamentoProdutoRepository) private apontamentoProdutoRepository: IApontamentoProdutoRepository,
    @Inject(TYPES.IApontamentoRepository) private apontamentoRepository: IApontamentoRepository,
    @Inject(TYPES.IConfiguradorCicloRepository) private configuradorCicloRepository: IConfiguradorCicloRepository,
    @Inject(TYPES.ITalhaoRepository) private talhaoRepository: ITalhaoRepository,
    @Inject(TYPES.IMovimentoEstoqueRepository) private movimentoEstoqueRepository: IMovimentoEstoqueRepository,
    private mapper: ApontamentoProdutoMapper
  ) {}

  /**
   * Lista todos os apontamentos de produto com paginação
   */
  @RequirePermission('apontamentoProduto.read')
  @Cacheable('apontamentoProduto:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<ApontamentoProdutoResponseDto>> {
    const result = await this.apontamentoProdutoRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca um apontamento de produto por ID
   */
  @RequirePermission('apontamentoProduto.read')
  @Cacheable('apontamentoProduto:getById', 3600)
  async getById(id: number | string): Promise<ApontamentoProdutoResponseDto | null> {
    const apontamentoProduto = await this.apontamentoProdutoRepository.findById(id);
    return apontamentoProduto ? this.mapper.toDto(apontamentoProduto) : null;
  }

  /**
   * Cria um novo apontamento de produto
   *
   * Lógica de negócio:
   * 1. Cria o registro de apontamento de produto
   * 2. Gera automaticamente um MovimentoEstoque (tipo ESTOQUE_FISICO, operação DISPONIVEL)
   */
  @RequirePermission('apontamentoProduto.create')
  @Auditable('ApontamentoProduto')
  @CacheEvict('apontamentoProduto:list')
  @Transactional()
  async create(dto: CreateApontamentoProdutoDto): Promise<ApontamentoProdutoResponseDto> {
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

    const apontamentoProduto = await this.apontamentoProdutoRepository.create(entityData);

    // Após criar o apontamento de produto, gerar MovimentoEstoque
    try {
      const apontamento = await this.apontamentoRepository.findById(dto.idApontamento);
      if (apontamento) {
        const configuracao = await this.configuradorCicloRepository.findById((apontamento as any).idConfiguracao);
        if (configuracao) {
          const talhao = await this.talhaoRepository.findById((configuracao as any).idTalhao);
          const idFazenda = talhao ? (talhao as any).idFazenda : null;

          if (idFazenda) {
            await this.movimentoEstoqueRepository.create({
              tenantId,
              idProduto: dto.idProduto,
              idFazenda,
              idApontamentoProduto: apontamentoProduto.id_aptprod,
              tipomov: 1, // TipoMovimento.ESTOQUE_FISICO
              operacao: 7, // OperacaoEstoque.DISPONIVEL
              quantidade: dto.quantidade,
              data: dto.data,
              valor: dto.valor,
              usercreation: userId,
            } as any);
          }
        }
      }
    } catch {
      // Não falhar o apontamento se a criação do MovimentoEstoque falhar
    }

    return this.mapper.toDto(apontamentoProduto);
  }

  /**
   * Atualiza um apontamento de produto existente
   */
  @RequirePermission('apontamentoProduto.update')
  @Auditable('ApontamentoProduto')
  @CacheEvict('apontamentoProduto:list:*', true)
  @CacheEvict('apontamentoProduto:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateApontamentoProdutoDto): Promise<ApontamentoProdutoResponseDto> {
    const apontamentoProduto = await this.apontamentoProdutoRepository.findById(id);
    if (!apontamentoProduto) {
      throw new NotFoundException('ApontamentoProduto', String(id));
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.apontamentoProdutoRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um apontamento de produto
   */
  @RequirePermission('apontamentoProduto.delete')
  @Auditable('ApontamentoProduto')
  @CacheEvict('apontamentoProduto:list:*', true)
  @CacheEvict('apontamentoProduto:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const apontamentoProduto = await this.apontamentoProdutoRepository.findById(id);
    if (!apontamentoProduto) {
      return false;
    }

    await this.apontamentoProdutoRepository.delete(id);
    return true;
  }
}
