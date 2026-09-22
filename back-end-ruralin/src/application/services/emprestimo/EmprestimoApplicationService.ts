/**
 * EmprestimoApplicationService - Application Service para entidade Emprestimo
 *
 * Contém a lógica de negócio para operações com empréstimos, separando
 * controllers (HTTP) da lógica de aplicação.
 *
 * Responsabilidades:
 * - Validações de negócio
 * - Regras de negócio (validação de tenant, recalcular situação)
 * - Orquestração de repositórios e mappers
 * - Transformações de dados
 *
 * @example
 * ```typescript
 * const service = container.resolve<IEmprestimoApplicationService>(TYPES.IEmprestimoApplicationService);
 *
 * const emprestimo = await service.create({
 *   fazendaId: 1,
 *   parceiroId: 10,
 *   data_emp: '2026-02-28',
 *   tipo_emp: 0,
 * });
 * ```
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IEmprestimoApplicationService } from './IEmprestimoApplicationService';
import { IEmprestimoRepository } from '../../../infrastructure/repository/IEmprestimoRepository';
import { IEmprestimoItemRepository } from '../../../infrastructure/repository/IEmprestimoItemRepository';
import { IEmprestimoItemDevolucaoRepository } from '../../../infrastructure/repository/IEmprestimoItemDevolucaoRepository';
import { IFazendaRepository } from '../../../infrastructure/repository/IFazendaRepository';
import { IPessoaRepository } from '../../../infrastructure/repository/IPessoaRepository';
import { ITenantService } from '../../../core/tenant/ITenantService';
import { EmprestimoMapper } from '../../mappers/EmprestimoMapper';
import { EmprestimoItemMapper } from '../../mappers/EmprestimoItemMapper';
import { CreateEmprestimoDto } from '../../dto/emprestimo/CreateEmprestimoDto';
import { UpdateEmprestimoDto } from '../../dto/emprestimo/UpdateEmprestimoDto';
import { CreateEmprestimoCompletoDto } from '../../dto/emprestimo/CreateEmprestimoCompletoDto';
import { UpdateEmprestimoCompletoDto } from '../../dto/emprestimo/UpdateEmprestimoCompletoDto';
import { EmprestimoResponseDto, EmprestimoDetailResponseDto } from '../../dto/emprestimo/EmprestimoResponseDto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, BusinessException, ForbiddenException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import EmprestimoItem from '../../../models/EmprestimoItem';
import Fazenda from '../../../models/Fazenda';
import Pessoa from '../../../models/Pessoa';
import Produto from '../../../models/Produto';

/**
 * Application Service para entidade Emprestimo
 *
 * Implementa lógica de negócio para operações com empréstimos, usando
 * repositório para acesso a dados e mapper para conversão DTO-Entidade.
 */
@Injectable()
export class EmprestimoApplicationService implements IEmprestimoApplicationService {
  private mapper: EmprestimoMapper;
  private itemMapper: EmprestimoItemMapper;

  constructor(
    @Inject(TYPES.IEmprestimoRepository)
    private repository: IEmprestimoRepository,
    @Inject(TYPES.IEmprestimoItemRepository)
    private itemRepository: IEmprestimoItemRepository,
    @Inject(TYPES.IEmprestimoItemDevolucaoRepository)
    private itemDevolucaoRepository: IEmprestimoItemDevolucaoRepository,
    @Inject(TYPES.IFazendaRepository)
    private fazendaRepository: IFazendaRepository,
    @Inject(TYPES.IPessoaRepository)
    private pessoaRepository: IPessoaRepository,
    @Inject(TYPES.ITenantService)
    private tenantService: ITenantService
  ) {
    this.mapper = new EmprestimoMapper();
    this.itemMapper = new EmprestimoItemMapper();
  }

  /**
   * Cria um novo empréstimo
   *
   * @param dto - DTO com dados para criação
   * @returns Promise que resolve com o DTO do empréstimo criado
   * @throws NotFoundException se fazenda ou parceiro não forem encontrados
   * @throws ForbiddenException se fazenda ou parceiro não pertencerem ao tenant atual
   * @throws ForbiddenException se usuário não tiver permissão 'emprestimo.create'
   */
  @RequirePermission('emprestimo.create')
  @Transactional()
  @Auditable('Emprestimo')
  @CacheEvict('emprestimo:list:*', true)
  @CacheEvict('emprestimo:findByParceiro:*', true)
  @CacheEvict('emprestimo:findByFazenda:*', true)
  @CacheEvict('emprestimo:findBySituacao:*', true)
  async create(dto: CreateEmprestimoDto): Promise<EmprestimoResponseDto> {
    const currentTenantId = this.tenantService.getCurrentTenantId();

    // Validação cross-tenant: verificar se fazenda pertence ao tenant atual
    const fazenda = await this.fazendaRepository.findById(dto.fazendaId);
    if (!fazenda) {
      throw new NotFoundException('Fazenda', dto.fazendaId);
    }
    if (currentTenantId && (fazenda as any).tenantId !== currentTenantId) {
      throw new ForbiddenException(
        'Fazenda não pertence ao tenant atual',
        'CROSS_TENANT_ACCESS_DENIED'
      );
    }

    // Validação cross-tenant: verificar se parceiro pertence ao tenant atual
    const parceiro = await this.pessoaRepository.findById(dto.parceiroId);
    if (!parceiro) {
      throw new NotFoundException('Parceiro', dto.parceiroId);
    }
    if (currentTenantId && (parceiro as any).tenantId !== currentTenantId) {
      throw new ForbiddenException(
        'Parceiro não pertence ao tenant atual',
        'CROSS_TENANT_ACCESS_DENIED'
      );
    }

    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);

    // Calcular data_limite_devolucao se prazo_dias informado
    if (dto.prazo_dias && dto.data_emp) {
      (entity as any).data_limite_devolucao = this.calcularDataLimite(dto.data_emp, dto.prazo_dias);
    }

    // Criar via repositório
    const created = await this.repository.create(entity as any);

    // Retornar como DTO
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza um empréstimo existente
   *
   * @param id - ID do empréstimo
   * @param dto - DTO com dados para atualização
   * @returns Promise que resolve com o DTO do empréstimo atualizado
   * @throws NotFoundException se empréstimo não for encontrado
   * @throws ForbiddenException se usuário não tiver permissão 'emprestimo.update'
   */
  @RequirePermission('emprestimo.update')
  @Transactional()
  @Auditable('Emprestimo')
  @CacheEvict('emprestimo:getById:{0}')
  @CacheEvict('emprestimo:list:*', true)
  @CacheEvict('emprestimo:findByParceiro:*', true)
  @CacheEvict('emprestimo:findByFazenda:*', true)
  @CacheEvict('emprestimo:findBySituacao:*', true)
  async update(id: number | string, dto: UpdateEmprestimoDto): Promise<EmprestimoResponseDto> {
    // Verificar se empréstimo existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Emprestimo', id);
    }

    const currentTenantId = this.tenantService.getCurrentTenantId();

    // Validação cross-tenant: verificar se fazenda pertence ao tenant atual (se fornecida)
    if (dto.fazendaId) {
      const fazenda = await this.fazendaRepository.findById(dto.fazendaId);
      if (!fazenda) {
        throw new NotFoundException('Fazenda', dto.fazendaId);
      }
      if (currentTenantId && (fazenda as any).tenantId !== currentTenantId) {
        throw new ForbiddenException(
          'Fazenda não pertence ao tenant atual',
          'CROSS_TENANT_ACCESS_DENIED'
        );
      }
    }

    // Validação cross-tenant: verificar se parceiro pertence ao tenant atual (se fornecido)
    if (dto.parceiroId) {
      const parceiro = await this.pessoaRepository.findById(dto.parceiroId);
      if (!parceiro) {
        throw new NotFoundException('Parceiro', dto.parceiroId);
      }
      if (currentTenantId && (parceiro as any).tenantId !== currentTenantId) {
        throw new ForbiddenException(
          'Parceiro não pertence ao tenant atual',
          'CROSS_TENANT_ACCESS_DENIED'
        );
      }
    }

    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);

    // Recalcular data_limite_devolucao se prazo_dias mudou
    if (dto.prazo_dias !== undefined) {
      const dataEmp = dto.data_emp || existing.data_emp;
      (entity as any).data_limite_devolucao = dto.prazo_dias
        ? this.calcularDataLimite(dataEmp, dto.prazo_dias)
        : null;
    }

    // Atualizar via repositório
    const updated = await this.repository.update(id, entity as any);

    // Retornar como DTO
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um empréstimo
   *
   * @param id - ID do empréstimo
   * @returns Promise que resolve com true se removido, false caso contrário
   * @throws BusinessException se o empréstimo possuir itens cadastrados
   * @throws ForbiddenException se usuário não tiver permissão 'emprestimo.delete'
   */
  @RequirePermission('emprestimo.delete')
  @Transactional()
  @Auditable('Emprestimo')
  @CacheEvict('emprestimo:getById:{0}')
  @CacheEvict('emprestimo:list:*', true)
  @CacheEvict('emprestimo:findByParceiro:*', true)
  @CacheEvict('emprestimo:findByFazenda:*', true)
  @CacheEvict('emprestimo:findBySituacao:*', true)
  async delete(id: number | string): Promise<boolean> {
    // Verificar se empréstimo existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      return false;
    }

    // Verificar se o empréstimo possui itens cadastrados (via repository)
    const itens = await this.itemRepository.findByEmprestimo(Number(id));

    if (itens.length > 0) {
      throw new BusinessException(
        'Não é possível excluir um empréstimo que possui itens cadastrados. Remova os itens primeiro.'
      );
    }

    // Remover via repositório
    return await this.repository.delete(id);
  }

  /**
   * Busca um empréstimo por ID
   *
   * @param id - ID do empréstimo
   * @returns Promise que resolve com o DTO do empréstimo encontrado ou null
   * @throws ForbiddenException se usuário não tiver permissão 'emprestimo.read'
   */
  @RequirePermission('emprestimo.read')
  @Cacheable('emprestimo:getById:{0}', 1800)
  async getById(id: number | string): Promise<EmprestimoResponseDto | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Lista empréstimos com paginação
   *
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   * @throws ForbiddenException se usuário não tiver permissão 'emprestimo.read'
   */
  @RequirePermission('emprestimo.read')
  @Cacheable('emprestimo:list:{0}:{1}', 1800)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<EmprestimoResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit, {
      include: [
        { model: Fazenda, as: 'fazenda', required: false },
        { model: Pessoa, as: 'parceiro', required: false },
        {
          model: EmprestimoItem,
          as: 'itens',
          required: false,
          include: [{ model: Produto, as: 'produto', required: false }],
        },
      ],
      order: [['data_emp', 'DESC']],
    });
    return {
      ...result,
      data: result.data.map(entity => this.mapper.toDto(entity)),
    };
  }

  /**
   * Busca empréstimos por parceiro
   *
   * @param parceiroId - ID do parceiro (pessoa)
   * @returns Promise que resolve com array de DTOs de empréstimos do parceiro
   * @throws ForbiddenException se usuário não tiver permissão 'emprestimo.read'
   */
  @RequirePermission('emprestimo.read')
  @Cacheable('emprestimo:findByParceiro:{0}', 1800)
  async findByParceiro(parceiroId: number): Promise<EmprestimoResponseDto[]> {
    const entities = await this.repository.findByParceiro(parceiroId);
    return entities.map(entity => this.mapper.toDto(entity));
  }

  /**
   * Busca empréstimos por fazenda
   *
   * @param fazendaId - ID da fazenda
   * @returns Promise que resolve com array de DTOs de empréstimos da fazenda
   * @throws ForbiddenException se usuário não tiver permissão 'emprestimo.read'
   */
  @RequirePermission('emprestimo.read')
  @Cacheable('emprestimo:findByFazenda:{0}', 1800)
  async findByFazenda(fazendaId: number): Promise<EmprestimoResponseDto[]> {
    const entities = await this.repository.findByFazenda(fazendaId);
    return entities.map(entity => this.mapper.toDto(entity));
  }

  /**
   * Busca empréstimos por situação
   *
   * @param situacao - Situação do empréstimo (0=Em aberto, 1=Parcialmente devolvido, 2=Concluído)
   * @returns Promise que resolve com array de DTOs de empréstimos na situação informada
   * @throws ForbiddenException se usuário não tiver permissão 'emprestimo.read'
   */
  @RequirePermission('emprestimo.read')
  @Cacheable('emprestimo:findBySituacao:{0}', 1800)
  async findBySituacao(situacao: number): Promise<EmprestimoResponseDto[]> {
    const entities = await this.repository.findBySituacao(situacao);
    return entities.map(entity => this.mapper.toDto(entity));
  }

  /**
   * Recalcula a situação de um empréstimo com base nas devoluções dos itens
   *
   * Regras:
   * - Se todos os itens foram completamente devolvidos → situacao_emp = 2 (Concluído)
   * - Se alguns itens foram devolvidos parcialmente → situacao_emp = 1 (Parcialmente devolvido)
   * - Se nenhum item foi devolvido → situacao_emp = 0 (Em aberto)
   *
   * @param emprestimoId - ID do empréstimo
   * @returns Promise que resolve quando a situação for atualizada
   * @throws NotFoundException se o empréstimo não for encontrado
   */
  @Transactional()
  @CacheEvict('emprestimo:getById:{0}')
  @CacheEvict('emprestimo:list:*', true)
  @CacheEvict('emprestimo:findByParceiro:*', true)
  @CacheEvict('emprestimo:findByFazenda:*', true)
  @CacheEvict('emprestimo:findBySituacao:*', true)
  async recalcularSituacao(emprestimoId: number): Promise<void> {
    // Verificar se empréstimo existe
    const emprestimo = await this.repository.findById(emprestimoId);
    if (!emprestimo) {
      throw new NotFoundException('Emprestimo', emprestimoId);
    }

    // Buscar todos os itens do empréstimo (via repository)
    const itens = await this.itemRepository.findByEmprestimo(emprestimoId);

    if (itens.length === 0) {
      // Sem itens, manter situação em aberto
      return;
    }

    let totalItens = 0;
    let itensComDevolucaoCompleta = 0;
    let itensComAlgumaDevolucao = 0;

    for (const item of itens) {
      totalItens++;

      // Somar todas as devoluções do item (via repository)
      const quantidadeDevolvida = await this.itemDevolucaoRepository.sumQuantidadeDevolvida(item.id);

      if (quantidadeDevolvida >= Number(item.quantidade_empi)) {
        itensComDevolucaoCompleta++;
        itensComAlgumaDevolucao++;
      } else if (quantidadeDevolvida > 0) {
        itensComAlgumaDevolucao++;
      }
    }

    // Determinar nova situação
    let novaSituacao: number;
    if (itensComDevolucaoCompleta === totalItens) {
      novaSituacao = 2; // Concluído
    } else if (itensComAlgumaDevolucao > 0) {
      novaSituacao = 1; // Parcialmente devolvido
    } else {
      novaSituacao = 0; // Em aberto
    }

    // Atualizar situação do empréstimo apenas se mudou
    if (emprestimo.situacao_emp !== novaSituacao) {
      await this.repository.update(emprestimoId, { situacao_emp: novaSituacao } as any);
    }
  }

  /**
   * Cria um empréstimo completo com itens em uma única operação atômica (master-detail pattern)
   *
   * Fluxo:
   * 1. Validar cross-tenant (fazenda + parceiro)
   * 2. Criar registro pai (empréstimo)
   * 3. Criar itens filhos — injetar FK do pai + calcular total_empi
   * 4. Retornar registro completo com todos os detalhes
   */
  @RequirePermission('emprestimo.create')
  @Transactional()
  @Auditable('Emprestimo')
  @CacheEvict('emprestimo:list:*', true)
  @CacheEvict('emprestimo:findByParceiro:*', true)
  @CacheEvict('emprestimo:findByFazenda:*', true)
  @CacheEvict('emprestimo:findBySituacao:*', true)
  async createCompleto(dto: CreateEmprestimoCompletoDto): Promise<EmprestimoDetailResponseDto> {
    const currentTenantId = this.tenantService.getCurrentTenantId();

    // Validação cross-tenant: fazenda
    const fazenda = await this.fazendaRepository.findById(dto.fazendaId);
    if (!fazenda) {
      throw new NotFoundException('Fazenda', dto.fazendaId);
    }
    if (currentTenantId && (fazenda as any).tenantId !== currentTenantId) {
      throw new ForbiddenException(
        'Fazenda não pertence ao tenant atual',
        'CROSS_TENANT_ACCESS_DENIED'
      );
    }

    // Validação cross-tenant: parceiro
    const parceiro = await this.pessoaRepository.findById(dto.parceiroId);
    if (!parceiro) {
      throw new NotFoundException('Parceiro', dto.parceiroId);
    }
    if (currentTenantId && (parceiro as any).tenantId !== currentTenantId) {
      throw new ForbiddenException(
        'Parceiro não pertence ao tenant atual',
        'CROSS_TENANT_ACCESS_DENIED'
      );
    }

    // Criar pai
    const emprestimoEntity = await this.mapper.toEntity(dto);

    // Calcular data_limite_devolucao se prazo_dias informado
    if (dto.prazo_dias && dto.data_emp) {
      (emprestimoEntity as any).data_limite_devolucao = this.calcularDataLimite(dto.data_emp, dto.prazo_dias);
    }

    const createdEmprestimo = await this.repository.create(emprestimoEntity as any);

    // Criar itens filhos — injetar FK do pai
    for (const itemDto of dto.itens) {
      const itemEntity = await this.itemMapper.toEntity({
        ...itemDto,
        emprestimoId: createdEmprestimo.id,
      } as any);
      await this.itemRepository.create(itemEntity as any);
    }

    // Calcular valor_custo_medio_total (soma dos total_empi dos itens)
    const valorCustoMedioTotal = dto.itens.reduce((sum, item) => {
      const total = Number(item.quantidade_empi) * Number(item.unitario_empi);
      return sum + total;
    }, 0);
    await this.repository.update(createdEmprestimo.id, {
      valor_custo_medio_total: valorCustoMedioTotal,
    } as any);

    // Retornar registro completo com detalhes (itens + associações)
    const emprestimoCompleto = await this.repository.findByIdWithDetails(createdEmprestimo.id);
    return this.mapper.toDto(emprestimoCompleto!);
  }

  /**
   * Atualiza um empréstimo completo com itens (delete-and-recreate) em uma única operação atômica
   *
   * Fluxo:
   * 1. Verificar existência do empréstimo
   * 2. Validar cross-tenant (se FKs foram alteradas)
   * 3. Atualizar campos do pai
   * 4. Se itens fornecidos: deletar devoluções dos itens antigos, deletar itens antigos, criar novos itens
   * 5. Recalcular situação do empréstimo
   * 6. Retornar registro completo com todos os detalhes
   */
  @RequirePermission('emprestimo.update')
  @Transactional()
  @Auditable('Emprestimo')
  @CacheEvict('emprestimo:getById:{0}')
  @CacheEvict('emprestimo:list:*', true)
  @CacheEvict('emprestimo:findByParceiro:*', true)
  @CacheEvict('emprestimo:findByFazenda:*', true)
  @CacheEvict('emprestimo:findBySituacao:*', true)
  async updateCompleto(id: number, dto: UpdateEmprestimoCompletoDto): Promise<EmprestimoDetailResponseDto> {
    // Verificar se empréstimo existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Emprestimo', id);
    }

    const currentTenantId = this.tenantService.getCurrentTenantId();

    // Validação cross-tenant: fazenda (se fornecida)
    if (dto.fazendaId) {
      const fazenda = await this.fazendaRepository.findById(dto.fazendaId);
      if (!fazenda) {
        throw new NotFoundException('Fazenda', dto.fazendaId);
      }
      if (currentTenantId && (fazenda as any).tenantId !== currentTenantId) {
        throw new ForbiddenException(
          'Fazenda não pertence ao tenant atual',
          'CROSS_TENANT_ACCESS_DENIED'
        );
      }
    }

    // Validação cross-tenant: parceiro (se fornecido)
    if (dto.parceiroId) {
      const parceiro = await this.pessoaRepository.findById(dto.parceiroId);
      if (!parceiro) {
        throw new NotFoundException('Parceiro', dto.parceiroId);
      }
      if (currentTenantId && (parceiro as any).tenantId !== currentTenantId) {
        throw new ForbiddenException(
          'Parceiro não pertence ao tenant atual',
          'CROSS_TENANT_ACCESS_DENIED'
        );
      }
    }

    // Atualizar campos do pai
    const emprestimoEntity = await this.mapper.toEntity(dto);

    // Recalcular data_limite_devolucao se prazo_dias mudou
    if (dto.prazo_dias !== undefined) {
      const dataEmp = dto.data_emp || existing.data_emp;
      (emprestimoEntity as any).data_limite_devolucao = dto.prazo_dias
        ? this.calcularDataLimite(dataEmp, dto.prazo_dias)
        : null;
    }

    await this.repository.update(id, emprestimoEntity as any);

    // Delete-and-recreate itens (se fornecidos)
    if (dto.itens) {
      // Primeiro deletar devoluções dos itens antigos
      const itensAntigos = await this.itemRepository.findByEmprestimo(id);
      for (const itemAntigo of itensAntigos) {
        await this.itemDevolucaoRepository.deleteByItem(itemAntigo.id);
      }

      // Deletar itens antigos
      await this.itemRepository.deleteByEmprestimo(id);

      // Criar novos itens
      for (const itemDto of dto.itens) {
        const itemEntity = await this.itemMapper.toEntity({
          ...itemDto,
          emprestimoId: id,
        } as any);
        await this.itemRepository.create(itemEntity as any);
      }

      // Recalcular valor_custo_medio_total (soma dos total_empi dos novos itens)
      const valorCustoMedioTotal = dto.itens.reduce((sum, item) => {
        const total = Number(item.quantidade_empi) * Number(item.unitario_empi);
        return sum + total;
      }, 0);
      await this.repository.update(id, {
        valor_custo_medio_total: valorCustoMedioTotal,
      } as any);
    }

    // Recalcular situação do empréstimo com base nos novos itens
    await this.recalcularSituacao(id);

    // Retornar registro completo com detalhes
    const emprestimoCompleto = await this.repository.findByIdWithDetails(id);
    return this.mapper.toDto(emprestimoCompleto!);
  }

  /**
   * Busca um empréstimo por ID com todos os detalhes (itens + devoluções + associações)
   */
  @RequirePermission('emprestimo.read')
  async getByIdDetalhado(id: number): Promise<EmprestimoDetailResponseDto | null> {
    const entity = await this.repository.findByIdWithDetails(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Calcula data limite de devolução: data_emp + prazo_dias
   */
  private calcularDataLimite(dataEmp: string, prazoDias: number): string {
    const date = new Date(dataEmp + 'T00:00:00');
    date.setDate(date.getDate() + prazoDias);
    return date.toISOString().split('T')[0];
  }
}
