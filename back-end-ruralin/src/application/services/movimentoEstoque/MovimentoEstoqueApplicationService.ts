import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IMovimentoEstoqueApplicationService } from './IMovimentoEstoqueApplicationService';
import { IMovimentoEstoqueRepository } from '../../../infrastructure/repository/IMovimentoEstoqueRepository';
import { IHistoricoPrecoRepository } from '../../../infrastructure/repository/IHistoricoPrecoRepository';
import { IProdutoRepository } from '../../../infrastructure/repository/IProdutoRepository';
import { CreateMovimentoEstoqueDto } from '../../dto/movimentoEstoque/CreateMovimentoEstoqueDto';
import { UpdateMovimentoEstoqueDto } from '../../dto/movimentoEstoque/UpdateMovimentoEstoqueDto';
import { MovimentoEstoqueResponseDto } from '../../dto/movimentoEstoque/MovimentoEstoqueResponseDto';
import { SaldoEstoqueDto } from '../../dto/movimentoEstoque/SaldoEstoqueDto';
import { PosicaoEstoqueDto } from '../../dto/movimentoEstoque/PosicaoEstoqueDto';
import { KardexProdutoDto } from '../../dto/movimentoEstoque/KardexProdutoDto';
import { HistoricoPrecoResponseDto } from '../../dto/historicoPreco/HistoricoPrecoResponseDto';
import { MovimentoEstoqueMapper } from '../../mappers/MovimentoEstoqueMapper';
import { HistoricoPrecoMapper } from '../../mappers/HistoricoPrecoMapper';
import { TipoMovimento, OperacaoEstoque } from '../../../models/enums/MovimentoEstoqueEnums';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Tipos de movimento que geram histórico de preço:
 * Pedido de Compra (0), Tomado Empréstimo (3), Estoque Inicial (4)
 */
const TIPOS_GERAM_HISTORICO = [
  TipoMovimento.PEDIDO_COMPRA,
  TipoMovimento.TOMADO_EMPRESTIMO,
  TipoMovimento.ESTOQUE_INICIAL,
];

/**
 * Application Service para MovimentoEstoque
 *
 * Implementa a lógica de negócio para operações de movimentação de estoque,
 * incluindo geração automática de histórico de preços e recálculo de custo médio.
 */
@Injectable()
export class MovimentoEstoqueApplicationService implements IMovimentoEstoqueApplicationService {
  constructor(
    @Inject(TYPES.IMovimentoEstoqueRepository) private movimentoEstoqueRepository: IMovimentoEstoqueRepository,
    @Inject(TYPES.IHistoricoPrecoRepository) private historicoPrecoRepository: IHistoricoPrecoRepository,
    @Inject(TYPES.IProdutoRepository) private produtoRepository: IProdutoRepository,
    private movimentoMapper: MovimentoEstoqueMapper,
    private historicoMapper: HistoricoPrecoMapper
  ) {}

  /**
   * Lista todos os movimentos de estoque com paginação
   */
  @RequirePermission('movimentoEstoque.read')
  @Cacheable('movimentoEstoque:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<MovimentoEstoqueResponseDto>> {
    const result = await this.movimentoEstoqueRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.movimentoMapper.toDto(item)),
    };
  }

  /**
   * Busca um movimento de estoque por ID
   */
  @RequirePermission('movimentoEstoque.read')
  @Cacheable('movimentoEstoque:getById', 3600)
  async getById(id: number | string): Promise<MovimentoEstoqueResponseDto | null> {
    const movimento = await this.movimentoEstoqueRepository.findById(id);
    return movimento ? this.movimentoMapper.toDto(movimento) : null;
  }

  /**
   * Cria um novo movimento de estoque
   *
   * Lógica de negócio:
   * 1. Inserir movimento
   * 2. Se tipomov in [0, 3, 4] → gerar HistoricoPreco (buscar Produto.idIndexador para moeda)
   * 3. Recalcular custo médio: custoMedio = SUM(valor) / SUM(quantidade) das entradas → atualizar Produto.precomedio_prod
   */
  @RequirePermission('movimentoEstoque.create')
  @Auditable('MovimentoEstoque')
  @CacheEvict('movimentoEstoque:list')
  @Transactional()
  async create(dto: CreateMovimentoEstoqueDto): Promise<MovimentoEstoqueResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto não disponível');
    }

    const userId = context.getUserId();
    const tenantId = context.getTenantId();

    if (!userId || !tenantId) {
      throw new BadRequestException('Usuário não autenticado ou tenant não identificado');
    }

    const entityData = await this.movimentoMapper.toEntity(dto);
    (entityData as any).usercreation = userId;
    (entityData as any).tenantId = tenantId;

    // 1. Inserir movimento
    const movimento = await this.movimentoEstoqueRepository.create(entityData);

    // 2. Se tipomov gera histórico de preço
    if (TIPOS_GERAM_HISTORICO.includes(dto.tipomov)) {
      try {
        // Buscar produto para obter idIndexador (moeda)
        const produto = await this.produtoRepository.findById(dto.idProduto);
        const idMoeda = produto?.idIndexador || null;

        // Calcular preço unitário
        const quantidade = Number(dto.quantidade);
        const valor = Number(dto.valor);
        const precoUnitario = quantidade !== 0 ? valor / quantidade : 0;

        await this.historicoPrecoRepository.create({
          tenantId,
          idProduto: dto.idProduto,
          idFazenda: dto.idFazenda,
          idMovimentoEstoque: movimento.id_mov,
          preco: precoUnitario,
          quantidade,
          data: dto.data,
          idMoeda,
          valorMoedaPadrao: valor,
          usercreation: userId,
        } as any);
      } catch {
        // Não falhar o movimento se a criação do histórico falhar
      }
    }

    // 3. Recalcular custo médio do produto
    try {
      const somaEntradas = await this.movimentoEstoqueRepository.getSomaEntradas(dto.idProduto, dto.idFazenda);
      if (somaEntradas.totalQuantidade > 0) {
        const custoMedio = Number((somaEntradas.totalValor / somaEntradas.totalQuantidade).toFixed(4));
        await this.produtoRepository.update(dto.idProduto, {
          precomedio_prod: custoMedio,
          valorultimaentrada_prod: Number(dto.valor),
          dataultimaentrada_prod: new Date(dto.data),
        } as any);
      }
    } catch {
      // Não falhar o movimento se a atualização do custo médio falhar
    }

    return this.movimentoMapper.toDto(movimento);
  }

  /**
   * Atualiza um movimento de estoque existente
   */
  @RequirePermission('movimentoEstoque.update')
  @Auditable('MovimentoEstoque')
  @CacheEvict('movimentoEstoque:list:*', true)
  @CacheEvict('movimentoEstoque:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateMovimentoEstoqueDto): Promise<MovimentoEstoqueResponseDto> {
    const movimento = await this.movimentoEstoqueRepository.findById(id);
    if (!movimento) {
      throw new NotFoundException('Movimento de estoque não encontrado');
    }

    const entityData = await this.movimentoMapper.toEntity(dto);
    const updated = await this.movimentoEstoqueRepository.update(id, entityData);
    return this.movimentoMapper.toDto(updated);
  }

  /**
   * Remove um movimento de estoque
   */
  @RequirePermission('movimentoEstoque.delete')
  @Auditable('MovimentoEstoque')
  @CacheEvict('movimentoEstoque:list:*', true)
  @CacheEvict('movimentoEstoque:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const movimento = await this.movimentoEstoqueRepository.findById(id);
    if (!movimento) {
      return false;
    }

    await this.movimentoEstoqueRepository.delete(id);
    return true;
  }

  /**
   * Retorna saldo por operação
   */
  @RequirePermission('movimentoEstoque.read')
  async retornaSaldoPorOperacao(idProduto: number, idFazenda: number, data: string, operacao: OperacaoEstoque): Promise<number> {
    return await this.movimentoEstoqueRepository.retornaSaldoPorOperacao(idProduto, idFazenda, data, operacao);
  }

  /**
   * Retorna saldo por operação e produtor
   */
  @RequirePermission('movimentoEstoque.read')
  async retornaSaldoPorOperacaoProdutor(idProduto: number, idFazenda: number, data: string, operacao: OperacaoEstoque, idProdutor: number): Promise<number> {
    return await this.movimentoEstoqueRepository.retornaSaldoPorOperacaoProdutor(idProduto, idFazenda, data, operacao, idProdutor);
  }

  /**
   * Retorna saldo disponível do produtor
   */
  @RequirePermission('movimentoEstoque.read')
  async retornaSaldoProdutor(idProduto: number, idFazenda: number, idProdutor: number): Promise<number> {
    return await this.movimentoEstoqueRepository.retornaSaldoProdutor(idProduto, idFazenda, idProdutor);
  }

  /**
   * Retorna saldo geral disponível do produto na fazenda
   */
  @RequirePermission('movimentoEstoque.read')
  async getSaldoProdutoEstoque(idProduto: number, idFazenda: number): Promise<SaldoEstoqueDto> {
    const disponivel = await this.movimentoEstoqueRepository.getSaldoProdutoEstoque(idProduto, idFazenda);

    return {
      idProduto,
      idFazenda,
      saldo: disponivel,
      disponivel,
    };
  }

  /**
   * Valida se há saldo disponível para a quantidade solicitada
   */
  @RequirePermission('movimentoEstoque.read')
  async validaSaldoDisponivel(idProduto: number, idFazenda: number, quantidade: number): Promise<boolean> {
    const saldo = await this.movimentoEstoqueRepository.getSaldoProdutoEstoque(idProduto, idFazenda);
    return saldo >= quantidade;
  }

  /**
   * Verifica se produto tem disponibilidade (saldo > 0)
   */
  @RequirePermission('movimentoEstoque.read')
  async produtoDisponivel(idProduto: number, idFazenda: number): Promise<boolean> {
    const saldo = await this.movimentoEstoqueRepository.getSaldoProdutoEstoque(idProduto, idFazenda);
    return saldo > 0;
  }

  /**
   * Relatório de posição de estoque
   */
  @RequirePermission('movimentoEstoque.read')
  async getPosicaoEstoqueRelatorio(): Promise<PosicaoEstoqueDto[]> {
    const movimentos = await this.movimentoEstoqueRepository.findAll();

    // Agrupar por produto + fazenda
    const posicaoMap = new Map<string, PosicaoEstoqueDto>();

    for (const mov of movimentos) {
      if (Number(mov.operacao) !== OperacaoEstoque.DISPONIVEL) continue;

      const key = `${mov.idProduto}-${mov.idFazenda}`;
      if (!posicaoMap.has(key)) {
        posicaoMap.set(key, {
          idProduto: mov.idProduto,
          descricaoProduto: (mov as any).produto?.descricao_prod || '',
          idFazenda: mov.idFazenda,
          descricaoFazenda: (mov as any).fazenda?.descricao || '',
          saldoDisponivel: 0,
          custoMedio: 0,
          valorTotal: 0,
        });
      }

      const posicao = posicaoMap.get(key)!;
      posicao.saldoDisponivel += Number(mov.quantidade);
      posicao.valorTotal += Number(mov.valor);
    }

    // Calcular custo médio
    for (const posicao of posicaoMap.values()) {
      if (posicao.saldoDisponivel !== 0) {
        posicao.custoMedio = Number((posicao.valorTotal / posicao.saldoDisponivel).toFixed(4));
      }
    }

    return Array.from(posicaoMap.values());
  }

  /**
   * Relatório Kardex de produtos
   */
  @RequirePermission('movimentoEstoque.read')
  async getKardexProdutos(dataInicio: string, dataFim: string): Promise<KardexProdutoDto[]> {
    const movimentos = await this.movimentoEstoqueRepository.findByPeriodo(dataInicio, dataFim);

    return movimentos.map(mov => ({
      id_mov: mov.id_mov,
      data: mov.data,
      tipomov: mov.tipomov,
      operacao: mov.operacao,
      quantidade: Number(mov.quantidade),
      valor: Number(mov.valor),
      produto: (mov as any).produto ? {
        id_prod: (mov as any).produto.id_prod,
        descricao_prod: (mov as any).produto.descricao_prod,
      } : null,
      fazenda: (mov as any).fazenda ? {
        id: (mov as any).fazenda.id,
        descricao: (mov as any).fazenda.descricao,
      } : null,
      produtor: (mov as any).produtor ? {
        id_pessoa: (mov as any).produtor.id_pessoa,
        nomerazao_pessoa: (mov as any).produtor.nomerazao_pessoa,
      } : null,
    }));
  }

  /**
   * Posição de estoque de um produto específico na fazenda
   */
  @RequirePermission('movimentoEstoque.read')
  async getPosicaoEstoqueProduto(idProduto: number, idFazenda: number): Promise<PosicaoEstoqueDto | null> {
    const disponivel = await this.movimentoEstoqueRepository.getSaldoProdutoEstoque(idProduto, idFazenda);
    const somaEntradas = await this.movimentoEstoqueRepository.getSomaEntradas(idProduto, idFazenda);

    const produto = await this.produtoRepository.findById(idProduto);
    if (!produto) {
      return null;
    }

    const custoMedio = somaEntradas.totalQuantidade > 0
      ? Number((somaEntradas.totalValor / somaEntradas.totalQuantidade).toFixed(4))
      : 0;

    return {
      idProduto,
      descricaoProduto: produto.descricao_prod,
      idFazenda,
      descricaoFazenda: '',
      saldoDisponivel: disponivel,
      custoMedio,
      valorTotal: Number((disponivel * custoMedio).toFixed(4)),
    };
  }

  /**
   * Extrato de movimentos por data
   */
  @RequirePermission('movimentoEstoque.read')
  async getPosicaoEstoqueExtrato(data: string): Promise<MovimentoEstoqueResponseDto[]> {
    const movimentos = await this.movimentoEstoqueRepository.findByPeriodo(data, data);
    return movimentos.map(item => this.movimentoMapper.toDto(item));
  }

  /**
   * Histórico de preços de um produto
   */
  @RequirePermission('movimentoEstoque.read')
  async getHistoricoPrecos(idProduto: number): Promise<HistoricoPrecoResponseDto[]> {
    const historicos = await this.historicoPrecoRepository.findByProduto(idProduto);
    return historicos.map(item => this.historicoMapper.toDto(item));
  }
}
