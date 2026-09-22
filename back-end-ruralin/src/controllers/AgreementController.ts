import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IAgreementController } from './interfaces/IAgreementController';
import { IAgreementApplicationService } from '../application/services/agreement/IAgreementApplicationService';
import { CreateAgreementDto } from '../application/dto/agreement/CreateAgreementDto';
import { CreateAgreementCompletoDto } from '../application/dto/agreement/CreateAgreementCompletoDto';
import { UpdateAgreementDto } from '../application/dto/agreement/UpdateAgreementDto';
import { UpdateAgreementCompletoDto } from '../application/dto/agreement/UpdateAgreementCompletoDto';
import { NotFoundException } from '../core/exceptions';
import { AgreementType } from '../models/enums/AgreementEnums';

@Injectable()
export class AgreementController implements IAgreementController {
  constructor(
    @Inject(TYPES.IAgreementApplicationService)
    private agreementService: IAgreementApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.agreementService.list(page, limit);

    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const agreementId = parseInt(id, 10);
    if (isNaN(agreementId)) {
      throw new NotFoundException('Agreement', id);
    }

    const agreement = await this.agreementService.getById(agreementId);

    if (!agreement) {
      throw new NotFoundException('Agreement', id);
    }

    res.json(agreement);
  }

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateAgreementDto;

    const agreement = await this.agreementService.create(dto);

    res.status(201).json(agreement);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateAgreementDto;

    const agreementId = parseInt(id, 10);
    if (isNaN(agreementId)) {
      throw new NotFoundException('Agreement', id);
    }

    const updatedAgreement = await this.agreementService.update(agreementId, dto);

    res.json(updatedAgreement);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const agreementId = parseInt(id, 10);
    if (isNaN(agreementId)) {
      throw new NotFoundException('Agreement', id);
    }

    await this.agreementService.delete(agreementId);

    res.status(204).send();
  }

  async findByFazenda(req: Request, res: Response): Promise<void> {
    const { fazendaId } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const id = parseInt(fazendaId, 10);
    if (isNaN(id)) {
      throw new NotFoundException('Fazenda', fazendaId);
    }

    const result = await this.agreementService.findByFazenda(id, page, limit);

    res.json(result);
  }

  async findByType(req: Request, res: Response): Promise<void> {
    const { agreementType } = req.params;
    const fazendaId = req.query.fazendaId ? Number(req.query.fazendaId) : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    if (!Object.values(AgreementType).includes(agreementType as AgreementType)) {
      res.status(400).json({
        error: 'Tipo de acordo inválido',
        message: `Tipo deve ser um dos seguintes valores: ${Object.values(AgreementType).join(', ')}`,
      });
      return;
    }

    if (!fazendaId || isNaN(fazendaId)) {
      res.status(400).json({
        error: 'Parâmetro obrigatório ausente',
        message: 'O parâmetro fazendaId é obrigatório',
      });
      return;
    }

    const result = await this.agreementService.findByType(agreementType as AgreementType, fazendaId, page, limit);

    res.json(result);
  }

  async findByField(req: Request, res: Response): Promise<void> {
    const { fieldId } = req.params;

    const id = parseInt(fieldId, 10);
    if (isNaN(id)) {
      throw new NotFoundException('Talhão', fieldId);
    }

    const result = await this.agreementService.findByField(id);

    res.json(result);
  }

  async findActiveByPeriod(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        error: 'Parâmetros obrigatórios ausentes',
        message: 'Os parâmetros startDate e endDate são obrigatórios',
      });
      return;
    }

    if (typeof startDate !== 'string' || typeof endDate !== 'string') {
      res.status(400).json({
        error: 'Formato de data inválido',
        message: 'startDate e endDate devem ser strings no formato YYYY-MM-DD',
      });
      return;
    }

    const result = await this.agreementService.findActiveByPeriod(startDate, endDate);

    res.json(result);
  }

  async createCompleto(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateAgreementCompletoDto;

    const agreement = await this.agreementService.createCompleto(dto);

    res.status(201).json(agreement);
  }

  async updateCompleto(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateAgreementCompletoDto;

    const agreementId = parseInt(id, 10);
    if (isNaN(agreementId)) {
      throw new NotFoundException('Agreement', id);
    }

    const updatedAgreement = await this.agreementService.updateCompleto(agreementId, dto);

    res.json(updatedAgreement);
  }
}

export default AgreementController;
