import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IMovimentoEstoqueController } from './interfaces/IMovimentoEstoqueController';
import { IMovimentoEstoqueApplicationService } from '../application/services/movimentoEstoque/IMovimentoEstoqueApplicationService';
import { CreateMovimentoEstoqueDto } from '../application/dto/movimentoEstoque/CreateMovimentoEstoqueDto';
import { UpdateMovimentoEstoqueDto } from '../application/dto/movimentoEstoque/UpdateMovimentoEstoqueDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';
import { BadRequestException } from '../core/exceptions/BadRequestException';
import { OperacaoEstoque } from '../models/enums/MovimentoEstoqueEnums';

/**
 * Controller responsável pelo gerenciamento de movimentos de estoque
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o MovimentoEstoqueApplicationService.
 */
@Injectable()
export class MovimentoEstoqueController implements IMovimentoEstoqueController {
  constructor(
    @Inject(TYPES.IMovimentoEstoqueApplicationService)
    private movimentoEstoqueService: IMovimentoEstoqueApplicationService
  ) {}

  /**
   * Lista todos os movimentos de estoque com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.movimentoEstoqueService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca um movimento de estoque por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const movimentoId = parseInt(id, 10);
    if (isNaN(movimentoId)) {
      throw new NotFoundException('Movimento de estoque', id);
    }

    const movimento = await this.movimentoEstoqueService.getById(movimentoId);

    if (!movimento) {
      throw new NotFoundException('Movimento de estoque', id);
    }

    res.json(movimento);
  }

  /**
   * Cria um novo movimento de estoque
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateMovimentoEstoqueDto;

    const movimento = await this.movimentoEstoqueService.create(dto);

    res.status(201).json(movimento);
  }

  /**
   * Atualiza um movimento de estoque existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateMovimentoEstoqueDto;

    const movimentoId = parseInt(id, 10);
    if (isNaN(movimentoId)) {
      throw new NotFoundException('Movimento de estoque', id);
    }

    const updatedMovimento = await this.movimentoEstoqueService.update(movimentoId, dto);

    res.json(updatedMovimento);
  }

  /**
   * Remove um movimento de estoque
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const movimentoId = parseInt(id, 10);
    if (isNaN(movimentoId)) {
      throw new NotFoundException('Movimento de estoque', id);
    }

    await this.movimentoEstoqueService.delete(movimentoId);

    res.status(204).send();
  }

  /**
   * Retorna o saldo disponível de um produto na fazenda
   */
  async getSaldoProduto(req: Request, res: Response): Promise<void> {
    const { idProduto, idFazenda } = req.params;

    const produtoId = parseInt(idProduto, 10);
    const fazendaId = parseInt(idFazenda, 10);

    if (isNaN(produtoId) || isNaN(fazendaId)) {
      throw new BadRequestException('IDs de produto e fazenda devem ser números válidos');
    }

    const saldo = await this.movimentoEstoqueService.getSaldoProdutoEstoque(produtoId, fazendaId);

    res.json(saldo);
  }

  /**
   * Retorna o saldo por operação
   */
  async getSaldoPorOperacao(req: Request, res: Response): Promise<void> {
    const { idProduto, idFazenda, data, operacao } = req.query;

    if (!idProduto || !idFazenda || !data || !operacao) {
      throw new BadRequestException('Os parâmetros idProduto, idFazenda, data e operacao são obrigatórios');
    }

    const saldo = await this.movimentoEstoqueService.retornaSaldoPorOperacao(
      Number(idProduto),
      Number(idFazenda),
      String(data),
      Number(operacao) as OperacaoEstoque
    );

    res.json({ saldo });
  }

  /**
   * Valida disponibilidade de produto
   */
  async validarDisponibilidade(req: Request, res: Response): Promise<void> {
    const { idProduto, idFazenda, quantidade } = req.body;

    if (!idProduto || !idFazenda || quantidade === undefined) {
      throw new BadRequestException('Os parâmetros idProduto, idFazenda e quantidade são obrigatórios');
    }

    const disponivel = await this.movimentoEstoqueService.validaSaldoDisponivel(
      Number(idProduto),
      Number(idFazenda),
      Number(quantidade)
    );

    res.json({ disponivel });
  }

  /**
   * Relatório de posição de estoque
   */
  async posicaoEstoque(req: Request, res: Response): Promise<void> {
    const resultado = await this.movimentoEstoqueService.getPosicaoEstoqueRelatorio();
    res.json(resultado);
  }

  /**
   * Relatório Kardex de produtos
   */
  async kardex(req: Request, res: Response): Promise<void> {
    const { dtInicio, dtFim } = req.query;

    if (!dtInicio || !dtFim) {
      throw new BadRequestException('Os parâmetros dtInicio e dtFim são obrigatórios');
    }

    const resultado = await this.movimentoEstoqueService.getKardexProdutos(
      String(dtInicio),
      String(dtFim)
    );

    res.json(resultado);
  }

  /**
   * Posição de estoque de um produto específico na fazenda
   */
  async posicaoProduto(req: Request, res: Response): Promise<void> {
    const { idProduto, idFazenda } = req.params;

    const produtoId = parseInt(idProduto, 10);
    const fazendaId = parseInt(idFazenda, 10);

    if (isNaN(produtoId) || isNaN(fazendaId)) {
      throw new BadRequestException('IDs de produto e fazenda devem ser números válidos');
    }

    const resultado = await this.movimentoEstoqueService.getPosicaoEstoqueProduto(produtoId, fazendaId);

    if (!resultado) {
      throw new NotFoundException('Produto', String(produtoId));
    }

    res.json(resultado);
  }

  /**
   * Extrato de movimentos por data
   */
  async extrato(req: Request, res: Response): Promise<void> {
    const { data } = req.query;

    if (!data) {
      throw new BadRequestException('O parâmetro data é obrigatório');
    }

    const resultado = await this.movimentoEstoqueService.getPosicaoEstoqueExtrato(String(data));

    res.json(resultado);
  }

  /**
   * Histórico de preços de um produto
   */
  async historicoPrecos(req: Request, res: Response): Promise<void> {
    const { idProduto } = req.params;

    const produtoId = parseInt(idProduto, 10);
    if (isNaN(produtoId)) {
      throw new BadRequestException('ID do produto deve ser um número válido');
    }

    const resultado = await this.movimentoEstoqueService.getHistoricoPrecos(produtoId);

    res.json(resultado);
  }
}

export default MovimentoEstoqueController;
