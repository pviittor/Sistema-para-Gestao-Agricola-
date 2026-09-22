import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { INotaFiscalController } from './interfaces/INotaFiscalController';
import { INotaFiscalApplicationService } from '../application/services/notaFiscal/INotaFiscalApplicationService';
import { INfeXmlParserService } from '../application/services/nfe/INfeXmlParserService';
import { INfeSefazService } from '../application/services/nfe/INfeSefazService';
import { ICertificadoDigitalRepository } from '../infrastructure/repository/ICertificadoDigitalRepository';
import { CreateNotaFiscalDto } from '../application/dto/notaFiscal/CreateNotaFiscalDto';
import { UpdateNotaFiscalDto } from '../application/dto/notaFiscal/UpdateNotaFiscalDto';
import { CreateNotaFiscalCompletoDto } from '../application/dto/notaFiscal/CreateNotaFiscalCompletoDto';
import { UpdateNotaFiscalCompletoDto } from '../application/dto/notaFiscal/UpdateNotaFiscalCompletoDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';
import { BadRequestException } from '../core/exceptions/BadRequestException';
import * as fs from 'fs';

/**
 * Controller responsavel pelo gerenciamento de notas fiscais
 *
 * Este controller atua como camada HTTP, delegando toda a logica de negocio
 * para o NotaFiscalApplicationService.
 */
@Injectable()
export class NotaFiscalController implements INotaFiscalController {
  constructor(
    @Inject(TYPES.INotaFiscalApplicationService)
    private notaFiscalService: INotaFiscalApplicationService,
    @Inject(TYPES.INfeXmlParserService)
    private nfeXmlParserService: INfeXmlParserService,
    @Inject(TYPES.INfeSefazService)
    private nfeSefazService: INfeSefazService,
    @Inject(TYPES.ICertificadoDigitalRepository)
    private certificadoDigitalRepository: ICertificadoDigitalRepository
  ) {}

  /**
   * Lista todas as notas fiscais com paginacao
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.notaFiscalService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca uma nota fiscal por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const nfId = parseInt(id, 10);
    if (isNaN(nfId)) {
      throw new NotFoundException('Nota fiscal', id);
    }

    const nf = await this.notaFiscalService.getById(nfId);

    if (!nf) {
      throw new NotFoundException('Nota fiscal', id);
    }

    res.json(nf);
  }

  /**
   * Cria uma nova nota fiscal
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateNotaFiscalDto;

    const nf = await this.notaFiscalService.create(dto);

    res.status(201).json(nf);
  }

  /**
   * Atualiza uma nota fiscal existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateNotaFiscalDto;

    const nfId = parseInt(id, 10);
    if (isNaN(nfId)) {
      throw new NotFoundException('Nota fiscal', id);
    }

    const updatedNf = await this.notaFiscalService.update(nfId, dto);

    res.json(updatedNf);
  }

  /**
   * Remove uma nota fiscal
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const nfId = parseInt(id, 10);
    if (isNaN(nfId)) {
      throw new NotFoundException('Nota fiscal', id);
    }

    await this.notaFiscalService.delete(nfId);

    res.status(204).send();
  }

  /**
   * Cancela uma nota fiscal
   */
  async cancelar(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { motivo } = req.body;

    const nfId = parseInt(id, 10);
    if (isNaN(nfId)) {
      throw new NotFoundException('Nota fiscal', id);
    }

    if (!motivo) {
      throw new BadRequestException('Motivo do cancelamento e obrigatorio');
    }

    const nf = await this.notaFiscalService.cancelar(nfId, motivo);

    res.json(nf);
  }

  /**
   * Autoriza uma nota fiscal
   */
  async autorizar(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { chave_acesso, protocolo_autorizacao } = req.body;

    const nfId = parseInt(id, 10);
    if (isNaN(nfId)) {
      throw new NotFoundException('Nota fiscal', id);
    }

    const nf = await this.notaFiscalService.autorizar(nfId, chave_acesso, protocolo_autorizacao);

    res.json(nf);
  }

  /**
   * Inutiliza uma nota fiscal
   */
  async inutilizar(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { motivo } = req.body;

    const nfId = parseInt(id, 10);
    if (isNaN(nfId)) {
      throw new NotFoundException('Nota fiscal', id);
    }

    if (!motivo) {
      throw new BadRequestException('Motivo da inutilizacao e obrigatorio');
    }

    const nf = await this.notaFiscalService.inutilizar(nfId, motivo);

    res.json(nf);
  }

  /**
   * Movimenta estoque a partir de uma nota fiscal
   */
  async movimentarEstoque(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const nfId = parseInt(id, 10);
    if (isNaN(nfId)) {
      throw new NotFoundException('Nota fiscal', id);
    }

    const nf = await this.notaFiscalService.movimentarEstoque(nfId);

    res.json(nf);
  }

  /**
   * Gera lancamentos financeiros a partir de uma nota fiscal
   */
  async gerarFinanceiro(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const nfId = parseInt(id, 10);
    if (isNaN(nfId)) {
      throw new NotFoundException('Nota fiscal', id);
    }

    const nf = await this.notaFiscalService.gerarFinanceiro(nfId);

    res.json(nf);
  }

  /**
   * Lista notas fiscais por periodo
   */
  async findByPeriodo(req: Request, res: Response): Promise<void> {
    const { dataInicio, dataFim, tipo, status } = req.query;

    if (!dataInicio || !dataFim) {
      throw new BadRequestException('Os parametros dataInicio e dataFim sao obrigatorios');
    }

    const result = await this.notaFiscalService.findByPeriodo(
      String(dataInicio),
      String(dataFim),
      tipo ? String(tipo) : undefined,
      status ? String(status) : undefined
    );

    res.json(result);
  }

  /**
   * Lista notas pendentes de movimentacao de estoque
   */
  async findPendentesMovimentacao(req: Request, res: Response): Promise<void> {
    const { tipo } = req.query;

    const result = await this.notaFiscalService.findPendentesMovimentacao(
      tipo ? String(tipo) : undefined
    );

    res.json(result);
  }

  /**
   * Lista notas pendentes de geracao financeira
   */
  async findPendentesFinanceiro(req: Request, res: Response): Promise<void> {
    const { tipo } = req.query;

    const result = await this.notaFiscalService.findPendentesFinanceiro(
      tipo ? String(tipo) : undefined
    );

    res.json(result);
  }

  /**
   * Retorna totais por periodo
   */
  async totalPorPeriodo(req: Request, res: Response): Promise<void> {
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      throw new BadRequestException('Os parametros dataInicio e dataFim sao obrigatorios');
    }

    const result = await this.notaFiscalService.totalPorPeriodo(
      String(dataInicio),
      String(dataFim)
    );

    res.json(result);
  }

  /**
   * Cria uma nota fiscal completa com itens em uma unica operacao atomica
   */
  async createCompleto(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateNotaFiscalCompletoDto;
    const notaFiscal = await this.notaFiscalService.createCompleto(dto);
    res.status(201).json(notaFiscal);
  }

  /**
   * Atualiza uma nota fiscal completa com itens (delete-and-recreate) em operacao atomica
   */
  async updateCompleto(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const dto = req.body as UpdateNotaFiscalCompletoDto;
    const notaFiscal = await this.notaFiscalService.updateCompleto(id, dto);
    res.status(200).json(notaFiscal);
  }

  /**
   * Importa NF-e a partir de arquivo XML via upload
   *
   * Recebe arquivo XML via multer, faz parsing e retorna ParsedNfeDto
   * para preenchimento automático no frontend.
   */
  async importarXml(req: Request, res: Response): Promise<void> {
    const file = (req as any).file;

    if (!file) {
      throw new BadRequestException('Arquivo XML é obrigatório');
    }

    // Ler conteúdo do arquivo XML
    const xmlContent = fs.readFileSync(file.path, 'utf-8');

    // Fazer parsing do XML
    const parsedNfe = await this.nfeXmlParserService.parseXml(xmlContent);

    // Remover arquivo temporário após parsing
    try {
      fs.unlinkSync(file.path);
    } catch {
      // Ignorar erro ao remover temp file
    }

    res.json(parsedNfe);
  }

  /**
   * Emite NF-e/NFC-e: gera XML → assina → transmite para SEFAZ
   */
  async emitir(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new NotFoundException('Nota fiscal', req.params.id);
    }

    const { certificadoId } = req.body;
    const resultado = await this.notaFiscalService.emitir(id, certificadoId);

    res.json(resultado);
  }

  /**
   * Inutiliza faixa de numeração na SEFAZ
   */
  async inutilizarFaixa(req: Request, res: Response): Promise<void> {
    const { cnpj, serie, numInicial, numFinal, justificativa, certificadoId, uf, ambiente } = req.body;

    if (!cnpj || !justificativa) {
      throw new BadRequestException('CNPJ e justificativa são obrigatórios');
    }

    const resultado = await this.notaFiscalService.inutilizarFaixa(
      cnpj,
      serie || '1',
      Number(numInicial),
      Number(numFinal),
      justificativa,
      Number(certificadoId),
      uf || 'SP',
      ambiente || 'homologacao'
    );

    res.json(resultado);
  }

  /**
   * Ativa modo de contingência para o tenant
   */
  async ativarContingencia(req: Request, res: Response): Promise<void> {
    const { tipo, justificativa } = req.body;
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;

    if (!tipo || !justificativa) {
      throw new BadRequestException('Tipo e justificativa são obrigatórios');
    }

    await this.nfeSefazService.ativarContingencia(tipo, justificativa, tenantId);

    res.json({ mensagem: `Contingência ${tipo} ativada com sucesso` });
  }

  /**
   * Desativa modo de contingência
   */
  async desativarContingencia(req: Request, res: Response): Promise<void> {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;

    await this.nfeSefazService.desativarContingencia(tenantId);

    res.json({ mensagem: 'Contingência desativada com sucesso' });
  }

  /**
   * Consulta status de contingência do tenant
   */
  async statusContingencia(req: Request, res: Response): Promise<void> {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;

    const ativa = await this.nfeSefazService.isContingenciaAtiva(tenantId);

    res.json({ contingenciaAtiva: ativa });
  }

  /**
   * Consulta status do serviço SEFAZ
   */
  async statusServico(req: Request, res: Response): Promise<void> {
    const { uf, ambiente } = req.query;

    const status = await this.nfeSefazService.consultarStatusServico(
      String(uf || 'SP'),
      String(ambiente || 'homologacao')
    );

    res.json(status);
  }

  /**
   * Consulta NF-e na SEFAZ pela chave de acesso
   *
   * Recebe chaveAcesso e certificadoId (opcional) no body.
   * Retorna ParsedNfeDto com dados da NF-e consultada.
   */
  async consultarSefaz(req: Request, res: Response): Promise<void> {
    const { chaveAcesso, certificadoId } = req.body;

    if (!chaveAcesso) {
      throw new BadRequestException('Chave de acesso é obrigatória');
    }

    // Resolver certificado: usar o informado ou buscar o padrão do tenant
    let certId = certificadoId;
    if (!certId) {
      const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
      if (tenantId) {
        const certPadrao = await this.certificadoDigitalRepository.findPadraoByTenant(tenantId);
        if (certPadrao) {
          certId = certPadrao.id;
        }
      }
      if (!certId) {
        throw new BadRequestException(
          'Nenhum certificado digital configurado. Faça upload de um certificado digital ou informe o ID.'
        );
      }
    }

    const parsedNfe = await this.nfeSefazService.consultarPorChave(
      chaveAcesso,
      certId
    );

    res.json(parsedNfe);
  }
}
