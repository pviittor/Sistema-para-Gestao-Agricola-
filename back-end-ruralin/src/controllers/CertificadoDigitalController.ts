import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { ICertificadoDigitalController } from './interfaces/ICertificadoDigitalController';
import { ICertificadoDigitalApplicationService } from '../application/services/certificado-digital/ICertificadoDigitalApplicationService';
import { CreateCertificadoDigitalDto } from '../application/dto/certificadoDigital/CreateCertificadoDigitalDto';
import { UpdateCertificadoDigitalDto } from '../application/dto/certificadoDigital/UpdateCertificadoDigitalDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';
import { BadRequestException } from '../core/exceptions/BadRequestException';

/**
 * Controller responsável pelo gerenciamento de certificados digitais
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o CertificadoDigitalApplicationService.
 *
 * Response Format B (Unwrapped) — envia res.json(result) diretamente.
 */
@Injectable()
export class CertificadoDigitalController implements ICertificadoDigitalController {
  constructor(
    @Inject(TYPES.ICertificadoDigitalApplicationService)
    private certificadoDigitalService: ICertificadoDigitalApplicationService
  ) {}

  /**
   * Lista todos os certificados digitais com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.certificadoDigitalService.list(page, limit);
    res.json(result);
  }

  /**
   * Busca um certificado digital por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const entityId = parseInt(id, 10);
    if (isNaN(entityId)) {
      throw new NotFoundException('Certificado Digital', id);
    }

    const entity = await this.certificadoDigitalService.getById(entityId);
    if (!entity) {
      throw new NotFoundException('Certificado Digital', id);
    }

    res.json(entity);
  }

  /**
   * Cria um novo certificado digital
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateCertificadoDigitalDto;
    const entity = await this.certificadoDigitalService.create(dto);
    res.status(201).json(entity);
  }

  /**
   * Atualiza um certificado digital existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateCertificadoDigitalDto;
    const entityId = parseInt(id, 10);
    if (isNaN(entityId)) {
      throw new NotFoundException('Certificado Digital', id);
    }

    const updated = await this.certificadoDigitalService.update(entityId, dto);
    res.json(updated);
  }

  /**
   * Remove um certificado digital
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const entityId = parseInt(id, 10);
    if (isNaN(entityId)) {
      throw new NotFoundException('Certificado Digital', id);
    }

    await this.certificadoDigitalService.delete(entityId);
    res.status(204).send();
  }

  /**
   * Define um certificado como padrão do tenant
   */
  async setPadrao(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const entityId = parseInt(id, 10);
    if (isNaN(entityId)) {
      throw new NotFoundException('Certificado Digital', id);
    }

    const result = await this.certificadoDigitalService.setPadrao(entityId);
    res.json(result);
  }

  /**
   * Faz upload de um arquivo .pfx/.p12
   */
  async upload(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new BadRequestException('Arquivo .pfx é obrigatório');
    }

    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    const relativePath = `/uploads/certificados/${tenantId}/${req.file.filename}`;

    res.json({ arquivo_path: relativePath });
  }
}

export default CertificadoDigitalController;
