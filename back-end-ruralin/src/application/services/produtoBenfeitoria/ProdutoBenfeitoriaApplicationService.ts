import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IProdutoBenfeitoriaApplicationService } from './IProdutoBenfeitoriaApplicationService';
import { IProdutoBenfeitoriaRepository } from '../../../infrastructure/repository/IProdutoBenfeitoriaRepository';
import { IBenfeitoriaRepository } from '../../../infrastructure/repository/IBenfeitoriaRepository';
import { IMovimentoEstoqueRepository } from '../../../infrastructure/repository/IMovimentoEstoqueRepository';
import { CreateProdutoBenfeitoriaDto } from '../../dto/produtoBenfeitoria/CreateProdutoBenfeitoriaDto';
import { UpdateProdutoBenfeitoriaDto } from '../../dto/produtoBenfeitoria/UpdateProdutoBenfeitoriaDto';
import { ProdutoBenfeitoriaResponseDto } from '../../dto/produtoBenfeitoria/ProdutoBenfeitoriaResponseDto';
import { ProdutoBenfeitoriaMapper } from '../../mappers/ProdutoBenfeitoriaMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { BusinessException } from '../../../core/exceptions/BusinessException';
import { getRequestContext } from '../../../core/authorization/helpers';
import MovimentoEstoque from '../../../models/MovimentoEstoque';
import sequelize from '../../../config/database';

/**
 * Application Service para ProdutoBenfeitoria
 *
 * Implementa a lógica de negócio para operações de produto benfeitoria.
 * Na criação, valida saldo disponível e gera movimentos de estoque negativos.
 * Na exclusão, remove os movimentos de estoque vinculados.
 */
@Injectable()
export class ProdutoBenfeitoriaApplicationService implements IProdutoBenfeitoriaApplicationService {
  constructor(
    @Inject(TYPES.IProdutoBenfeitoriaRepository) private produtoBenfeitoriaRepository: IProdutoBenfeitoriaRepository,
    @Inject(TYPES.IBenfeitoriaRepository) private benfeitoriaRepository: IBenfeitoriaRepository,
    @Inject(TYPES.IMovimentoEstoqueRepository) private movimentoEstoqueRepository: IMovimentoEstoqueRepository,
    private mapper: ProdutoBenfeitoriaMapper
  ) {}

  /**
   * Lista todos os produtos benfeitoria com paginação
   */
  @RequirePermission('produtoBenfeitoria.read')
  @Cacheable('produtoBenfeitoria:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<ProdutoBenfeitoriaResponseDto>> {
    const result = await this.produtoBenfeitoriaRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca um produto benfeitoria por ID
   */
  @RequirePermission('produtoBenfeitoria.read')
  @Cacheable('produtoBenfeitoria:getById', 3600)
  async getById(id: number | string): Promise<ProdutoBenfeitoriaResponseDto | null> {
    const produtoBenfeitoria = await this.produtoBenfeitoriaRepository.findById(id);
    return produtoBenfeitoria ? this.mapper.toDto(produtoBenfeitoria) : null;
  }

  /**
   * Cria um novo produto benfeitoria
   *
   * Lógica de negócio:
   * 1. Busca a benfeitoria para obter idFazenda
   * 2. Valida saldo disponível do produto na fazenda
   * 3. Cria o registro de produto benfeitoria
   * 4. Gera 2 MovimentoEstoque com quantidade NEGATIVA:
   *    - Mov1: tipomov=1 (ESTOQUE_FISICO), operacao=7 (DISPONIVEL)
   *    - Mov2: tipomov=1 (ESTOQUE_FISICO), operacao=1 (ESTOQUE_FISICO)
   */
  @RequirePermission('produtoBenfeitoria.create')
  @Auditable('ProdutoBenfeitoria')
  @CacheEvict('produtoBenfeitoria:list')
  @Transactional()
  async create(dto: CreateProdutoBenfeitoriaDto): Promise<ProdutoBenfeitoriaResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto não disponível');
    }

    const userId = context.getUserId();
    const tenantId = context.getTenantId();

    if (!userId || !tenantId) {
      throw new BadRequestException('Usuário não autenticado ou tenant não identificado');
    }

    // 1. Buscar benfeitoria para obter idFazenda
    const benfeitoria = await this.benfeitoriaRepository.findById(dto.idBenfeitoria);
    if (!benfeitoria) {
      throw new NotFoundException('Benfeitoria', String(dto.idBenfeitoria));
    }
    const idFazenda = (benfeitoria as any).idFazenda;

    // 2. Validar saldo disponível
    const saldoResult = await MovimentoEstoque.findAll({
      where: {
        idProduto: dto.idProduto,
        idFazenda,
        operacao: 7, // DISPONIVEL
        tenantId,
      },
      attributes: [[sequelize.fn('SUM', sequelize.col('quantidade')), 'totalDisponivel']],
      raw: true,
    });
    const saldoDisponivel = Number((saldoResult[0] as any)?.totalDisponivel || 0);
    if (saldoDisponivel < dto.quantidade) {
      throw new BusinessException(`Saldo disponível insuficiente. Disponível: ${saldoDisponivel}, Solicitado: ${dto.quantidade}`);
    }

    // 3. Criar ProdutoBenfeitoria
    const entityData = await this.mapper.toEntity(dto);
    (entityData as any).usercreation = userId;
    (entityData as any).tenantId = tenantId;
    const produtoBenfeitoria = await this.produtoBenfeitoriaRepository.create(entityData);

    // 4. Criar 2 MovimentoEstoque com quantidade NEGATIVA
    const quantidadeNegativa = dto.quantidade * -1;

    // Mov1: DISPONIVEL
    await this.movimentoEstoqueRepository.create({
      tenantId,
      idProduto: dto.idProduto,
      idFazenda,
      idProdutoBenfeitoria: produtoBenfeitoria.id_prodbenf,
      tipomov: 1, // ESTOQUE_FISICO
      operacao: 7, // DISPONIVEL
      quantidade: quantidadeNegativa,
      data: dto.data,
      valor: dto.unitario,
      usercreation: userId,
    } as any);

    // Mov2: ESTOQUE_FISICO
    await this.movimentoEstoqueRepository.create({
      tenantId,
      idProduto: dto.idProduto,
      idFazenda,
      idProdutoBenfeitoria: produtoBenfeitoria.id_prodbenf,
      tipomov: 1, // ESTOQUE_FISICO
      operacao: 1, // ESTOQUE_FISICO
      quantidade: quantidadeNegativa,
      data: dto.data,
      valor: dto.unitario,
      usercreation: userId,
    } as any);

    return this.mapper.toDto(produtoBenfeitoria);
  }

  /**
   * Atualiza um produto benfeitoria existente
   */
  @RequirePermission('produtoBenfeitoria.update')
  @Auditable('ProdutoBenfeitoria')
  @CacheEvict('produtoBenfeitoria:list:*', true)
  @CacheEvict('produtoBenfeitoria:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateProdutoBenfeitoriaDto): Promise<ProdutoBenfeitoriaResponseDto> {
    const produtoBenfeitoria = await this.produtoBenfeitoriaRepository.findById(id);
    if (!produtoBenfeitoria) {
      throw new NotFoundException('ProdutoBenfeitoria', String(id));
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.produtoBenfeitoriaRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um produto benfeitoria
   *
   * Lógica de negócio:
   * 1. Remove todos os MovimentoEstoque vinculados (idProdutoBenfeitoria)
   * 2. Remove o registro de ProdutoBenfeitoria
   */
  @RequirePermission('produtoBenfeitoria.delete')
  @Auditable('ProdutoBenfeitoria')
  @CacheEvict('produtoBenfeitoria:list:*', true)
  @CacheEvict('produtoBenfeitoria:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const produtoBenfeitoria = await this.produtoBenfeitoriaRepository.findById(id);
    if (!produtoBenfeitoria) {
      return false;
    }

    // Remove linked MovimentoEstoque records
    await MovimentoEstoque.destroy({
      where: { idProdutoBenfeitoria: id } as any,
    });

    await this.produtoBenfeitoriaRepository.delete(id);
    return true;
  }
}
