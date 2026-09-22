import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IEmprestimoController } from './interfaces/IEmprestimoController';
import { IEmprestimoApplicationService } from '../application/services/emprestimo/IEmprestimoApplicationService';
import { IIntegracaoFinanceiraService } from '../application/services/integracao/IIntegracaoFinanceiraService';
import { CreateEmprestimoDto } from '../application/dto/emprestimo/CreateEmprestimoDto';
import { UpdateEmprestimoDto } from '../application/dto/emprestimo/UpdateEmprestimoDto';
import { CreateEmprestimoCompletoDto } from '../application/dto/emprestimo/CreateEmprestimoCompletoDto';
import { UpdateEmprestimoCompletoDto } from '../application/dto/emprestimo/UpdateEmprestimoCompletoDto';
import { NotFoundException } from '../core/exceptions';
import { getRequestContext } from '../core/authorization/helpers';

/**
 * Controller responsável pelo gerenciamento de empréstimos
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o EmprestimoApplicationService. Sua responsabilidade é apenas:
 * - Receber requisições HTTP
 * - Chamar Application Service
 * - Retornar respostas HTTP
 *
 * O enriquecimento com relacionamentos (fazenda, parceiro, itens) é feito
 * pelo serviço/mapper, não pelo controller.
 */
@Injectable()
export class EmprestimoController implements IEmprestimoController {
  constructor(
    @Inject(TYPES.IEmprestimoApplicationService)
    private emprestimoService: IEmprestimoApplicationService,
    @Inject(TYPES.IIntegracaoFinanceiraService)
    private integracaoFinanceiraService: IIntegracaoFinanceiraService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    // O serviço/mapper é responsável pelo enriquecimento com relacionamentos
    const result = await this.emprestimoService.list(page, limit);
    res.status(200).json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    // O serviço/mapper é responsável pelo enriquecimento com relacionamentos e itens
    const emprestimo = await this.emprestimoService.getByIdDetalhado(id);
    if (!emprestimo) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Empréstimo não encontrado' } });
      return;
    }
    res.status(200).json(emprestimo);
  }

  async create(req: Request, res: Response) {
    // req.body já está validado e tipado como CreateEmprestimoDto
    const dto = req.body as CreateEmprestimoDto;

    const emprestimo = await this.emprestimoService.create(dto);

    return res.status(201).json(emprestimo);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    // req.body já está validado e tipado como UpdateEmprestimoDto
    const dto = req.body as UpdateEmprestimoDto;

    const updatedEmprestimo = await this.emprestimoService.update(id, dto);

    return res.json(updatedEmprestimo);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const deleted = await this.emprestimoService.delete(id);

    if (!deleted) {
      throw new NotFoundException('Emprestimo', id);
    }

    return res.status(204).send();
  }

  async findByParceiro(req: Request, res: Response) {
    const { parceiroId } = req.params;

    const emprestimos = await this.emprestimoService.findByParceiro(Number(parceiroId));

    return res.json(emprestimos);
  }

  async findByFazenda(req: Request, res: Response) {
    const { fazendaId } = req.params;

    const emprestimos = await this.emprestimoService.findByFazenda(Number(fazendaId));

    return res.json(emprestimos);
  }

  async findBySituacao(req: Request, res: Response) {
    const { situacao } = req.params;

    const emprestimos = await this.emprestimoService.findBySituacao(Number(situacao));

    return res.json(emprestimos);
  }

  /**
   * Cria um empréstimo completo com itens em uma única requisição
   * POST /api/emprestimos/completo
   */
  async createCompleto(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateEmprestimoCompletoDto;
    const emprestimo = await this.emprestimoService.createCompleto(dto);
    res.status(201).json(emprestimo);
  }

  /**
   * Atualiza um empréstimo completo com itens em uma única requisição
   * PUT /api/emprestimos/:id/completo
   */
  async updateCompleto(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const dto = req.body as UpdateEmprestimoCompletoDto;
    const emprestimo = await this.emprestimoService.updateCompleto(id, dto);
    res.status(200).json(emprestimo);
  }

  /**
   * Gera título a receber para empréstimo vencido
   * POST /api/emprestimos/:id/gerar-financeiro
   */
  async gerarFinanceiro(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const context = getRequestContext();
    const tenantId = context?.getTenantId() || 0;
    const titulo = await this.integracaoFinanceiraService.gerarTituloDeEmprestimoVencido(id, tenantId);
    res.status(201).json(titulo);
  }
}

export default EmprestimoController;
