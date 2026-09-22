import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IAgreementApplicationService } from './IAgreementApplicationService';
import { IAgreementRepository } from '../../../infrastructure/repository/IAgreementRepository';
import { IAgreementLeaseTermRepository } from '../../../infrastructure/repository/IAgreementLeaseTermRepository';
import { IAgreementPaymentScheduleRepository } from '../../../infrastructure/repository/IAgreementPaymentScheduleRepository';
import { IAgreementFieldRepository } from '../../../infrastructure/repository/IAgreementFieldRepository';
import { AgreementMapper } from '../../mappers/AgreementMapper';
import { CreateAgreementDto } from '../../dto/agreement/CreateAgreementDto';
import { CreateAgreementCompletoDto } from '../../dto/agreement/CreateAgreementCompletoDto';
import { UpdateAgreementDto } from '../../dto/agreement/UpdateAgreementDto';
import { UpdateAgreementCompletoDto } from '../../dto/agreement/UpdateAgreementCompletoDto';
import { AgreementResponseDto } from '../../dto/agreement/AgreementResponseDto';
import { AgreementType } from '../../../models/enums/AgreementEnums';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, BusinessException, ForbiddenException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { getRequestContext } from '../../../core/authorization/helpers';
import { IAuditService } from '../../../core/audit/IAuditService';

@Injectable()
export class AgreementApplicationService implements IAgreementApplicationService {
  private mapper: AgreementMapper;

  constructor(
    @Inject(TYPES.IAuditService)
    private auditService: IAuditService,
    @Inject(TYPES.IAgreementRepository)
    private agreementRepository: IAgreementRepository,
    @Inject(TYPES.IAgreementLeaseTermRepository)
    private leaseTermRepository: IAgreementLeaseTermRepository,
    @Inject(TYPES.IAgreementPaymentScheduleRepository)
    private paymentScheduleRepository: IAgreementPaymentScheduleRepository,
    @Inject(TYPES.IAgreementFieldRepository)
    private agreementFieldRepository: IAgreementFieldRepository
  ) {
    this.mapper = new AgreementMapper();
  }

  private getContext() {
    const context = getRequestContext();
    if (!context || !context.getUserId()) {
      throw new ForbiddenException(
        'Usuário não autenticado. Não é possível operar sem userId.',
        'USER_NOT_AUTHENTICATED'
      );
    }
    const userId = context.getUserId()!;
    const tenantId = context.getTenantId();
    if (!tenantId) {
      throw new ForbiddenException(
        'Tenant não identificado. Não é possível operar sem tenantId.',
        'TENANT_NOT_IDENTIFIED'
      );
    }
    return { userId, tenantId };
  }

  @RequirePermission('agreement.create')
  @Transactional()
  @Auditable('Agreement')
  async create(dto: CreateAgreementDto): Promise<AgreementResponseDto> {
    const { userId, tenantId } = this.getContext();

    const entity = await this.mapper.toEntity(dto);
    (entity as any).tenantId = tenantId;
    (entity as any).usercreation = userId;

    const agreement = await this.agreementRepository.create(entity);

    // Create pivot entries for fields
    const fieldEntries = dto.fieldIds.map(fieldId => ({
      agreementId: agreement.id,
      fieldId,
      tenantId,
    }));
    await this.agreementFieldRepository.bulkCreate(fieldEntries);

    const complete = await this.agreementRepository.findWithLeaseTerms(agreement.id);
    return this.mapper.toDto(complete!);
  }

  @RequirePermission('agreement.create')
  @Transactional()
  @Auditable('Agreement')
  async createCompleto(dto: CreateAgreementCompletoDto): Promise<AgreementResponseDto> {
    const { userId, tenantId } = this.getContext();

    // Validate RENT_LEASE requires leaseTerms
    if (dto.agreementType === AgreementType.RENT_LEASE) {
      if (!dto.leaseTerms || dto.leaseTerms.length === 0) {
        throw new BusinessException(
          'Acordos do tipo RENT_LEASE devem ter pelo menos um termo de arrendamento.',
          'LEASE_TERMS_REQUIRED'
        );
      }
      if (dto.endYear !== undefined && dto.startYear !== undefined && dto.endYear < dto.startYear) {
        throw new BusinessException(
          'Ano de fim deve ser maior ou igual ao ano de início.',
          'INVALID_YEAR_RANGE'
        );
      }
    }

    // Create master Agreement
    const entity = await this.mapper.toEntity(dto);
    (entity as any).tenantId = tenantId;
    (entity as any).usercreation = userId;

    const agreement = await this.agreementRepository.create(entity);

    // Create pivot entries for fields
    const fieldEntries = dto.fieldIds.map(fieldId => ({
      agreementId: agreement.id,
      fieldId,
      tenantId,
    }));
    await this.agreementFieldRepository.bulkCreate(fieldEntries);

    // Create payment schedules
    if (dto.paymentSchedules && dto.paymentSchedules.length > 0) {
      for (const scheduleDto of dto.paymentSchedules) {
        await this.paymentScheduleRepository.create({
          ...scheduleDto,
          startDate: scheduleDto.startDate ? new Date(scheduleDto.startDate) : undefined,
          endDate: scheduleDto.endDate ? new Date(scheduleDto.endDate) : undefined,
          agreementId: agreement.id,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    // Create lease terms (RENT_LEASE only)
    if (dto.leaseTerms && dto.leaseTerms.length > 0) {
      for (const termDto of dto.leaseTerms) {
        await this.leaseTermRepository.create({
          ...termDto,
          agreementId: agreement.id,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    // Fetch complete record
    const complete = await this.agreementRepository.findWithLeaseTerms(agreement.id);
    return this.mapper.toDto(complete!);
  }

  @RequirePermission('agreement.update')
  @Transactional()
  @Auditable('Agreement')
  async update(id: number, dto: UpdateAgreementDto): Promise<AgreementResponseDto> {
    const { userId, tenantId } = this.getContext();

    const existing = await this.agreementRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Agreement', String(id));
    }

    const entity = await this.mapper.toEntity(dto);
    const updated = await this.agreementRepository.update(id, entity);

    // Update fields if provided
    if (dto.fieldIds) {
      await this.agreementFieldRepository.deleteByAgreement(id);
      const fieldEntries = dto.fieldIds.map(fieldId => ({
        agreementId: id,
        fieldId,
        tenantId,
      }));
      await this.agreementFieldRepository.bulkCreate(fieldEntries);
    }

    const complete = await this.agreementRepository.findWithLeaseTerms(id);
    return this.mapper.toDto(complete!);
  }

  @RequirePermission('agreement.update')
  @Transactional()
  @Auditable('Agreement')
  async updateCompleto(id: number, dto: UpdateAgreementCompletoDto): Promise<AgreementResponseDto> {
    const { userId, tenantId } = this.getContext();

    const existing = await this.agreementRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Agreement', String(id));
    }

    // Update master fields
    const entity = await this.mapper.toEntity(dto);
    await this.agreementRepository.update(id, entity);

    // Delete-and-recreate fields if provided
    if (dto.fieldIds) {
      await this.agreementFieldRepository.deleteByAgreement(id);
      const fieldEntries = dto.fieldIds.map(fieldId => ({
        agreementId: id,
        fieldId,
        tenantId,
      }));
      await this.agreementFieldRepository.bulkCreate(fieldEntries);
    }

    // Delete-and-recreate payment schedules if provided
    if (dto.paymentSchedules) {
      await this.paymentScheduleRepository.deleteByAgreement(id);
      for (const scheduleDto of dto.paymentSchedules) {
        await this.paymentScheduleRepository.create({
          ...scheduleDto,
          startDate: scheduleDto.startDate ? new Date(scheduleDto.startDate) : undefined,
          endDate: scheduleDto.endDate ? new Date(scheduleDto.endDate) : undefined,
          agreementId: id,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    // Delete-and-recreate lease terms if provided
    if (dto.leaseTerms) {
      await this.leaseTermRepository.deleteByAgreement(id);
      for (const termDto of dto.leaseTerms) {
        await this.leaseTermRepository.create({
          ...termDto,
          agreementId: id,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    const complete = await this.agreementRepository.findWithLeaseTerms(id);
    return this.mapper.toDto(complete!);
  }

  @RequirePermission('agreement.delete')
  @Transactional()
  @Auditable('Agreement')
  async delete(id: number | string): Promise<boolean> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    const existing = await this.agreementRepository.findById(numericId);
    if (!existing) {
      throw new NotFoundException('Agreement', String(id));
    }

    // Children cascade via DB onDelete: CASCADE
    return await this.agreementRepository.delete(numericId);
  }

  @RequirePermission('agreement.read')
  async getById(id: number | string): Promise<AgreementResponseDto | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    const agreement = await this.agreementRepository.findWithLeaseTerms(numericId);
    if (!agreement) return null;

    return this.mapper.toDto(agreement);
  }

  @RequirePermission('agreement.read')
  async list(page?: number, limit?: number): Promise<PaginatedResult<AgreementResponseDto>> {
    const p = page || 1;
    const l = limit || 10;

    const result = await this.agreementRepository.findAllPaginated(p, l);

    return {
      data: result.data.map(a => this.mapper.toDto(a)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @RequirePermission('agreement.read')
  async findByFazenda(fazendaId: number, page?: number, limit?: number): Promise<PaginatedResult<AgreementResponseDto>> {
    const agreements = await this.agreementRepository.findByFazenda(fazendaId);

    const p = page || 1;
    const l = limit || 10;
    const start = (p - 1) * l;
    const paged = agreements.slice(start, start + l);

    return {
      data: paged.map(a => this.mapper.toDto(a)),
      total: agreements.length,
      page: p,
      limit: l,
      totalPages: Math.ceil(agreements.length / l),
    };
  }

  @RequirePermission('agreement.read')
  async findByType(type: AgreementType, fazendaId: number, page?: number, limit?: number): Promise<PaginatedResult<AgreementResponseDto>> {
    const agreements = await this.agreementRepository.findByType(type, fazendaId);

    const p = page || 1;
    const l = limit || 10;
    const start = (p - 1) * l;
    const paged = agreements.slice(start, start + l);

    return {
      data: paged.map(a => this.mapper.toDto(a)),
      total: agreements.length,
      page: p,
      limit: l,
      totalPages: Math.ceil(agreements.length / l),
    };
  }

  @RequirePermission('agreement.read')
  async findByField(fieldId: number): Promise<AgreementResponseDto[]> {
    const agreements = await this.agreementRepository.findByField(fieldId);
    return agreements.map(a => this.mapper.toDto(a));
  }

  @RequirePermission('agreement.read')
  async findActiveByPeriod(startDate: string, endDate: string): Promise<AgreementResponseDto[]> {
    const agreements = await this.agreementRepository.findActiveByPeriod(
      new Date(startDate),
      new Date(endDate)
    );
    return agreements.map(a => this.mapper.toDto(a));
  }
}
