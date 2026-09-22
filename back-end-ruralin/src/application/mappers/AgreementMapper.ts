import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Agreement from '../../models/Agreement';
import { CreateAgreementDto } from '../dto/agreement/CreateAgreementDto';
import { UpdateAgreementDto } from '../dto/agreement/UpdateAgreementDto';
import { AgreementResponseDto } from '../dto/agreement/AgreementResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

@Injectable()
export class AgreementMapper implements IMapper<Agreement, AgreementResponseDto, CreateAgreementDto, UpdateAgreementDto> {
  async toEntity(dto: CreateAgreementDto | UpdateAgreementDto): Promise<Partial<Agreement>> {
    const entity: any = {};

    if ('fazendaId' in dto && dto.fazendaId !== undefined) entity.fazendaId = dto.fazendaId;
    if ('agreementType' in dto && dto.agreementType !== undefined) entity.agreementType = dto.agreementType;
    if ('notes' in dto && dto.notes !== undefined) entity.notes = dto.notes;
    if ('ativo' in dto && dto.ativo !== undefined) entity.ativo = dto.ativo;

    // LOAN + NON_CROP_REVENUE shared
    if ('startDate' in dto && dto.startDate !== undefined) entity.startDate = dto.startDate ? new Date(dto.startDate) : null;
    if ('termLength' in dto && dto.termLength !== undefined) entity.termLength = dto.termLength;
    if ('termUnit' in dto && dto.termUnit !== undefined) entity.termUnit = dto.termUnit;

    // LOAN
    if ('lenderName' in dto && dto.lenderName !== undefined) entity.lenderName = dto.lenderName;
    if ('loanType' in dto && dto.loanType !== undefined) entity.loanType = dto.loanType;
    if ('paymentMethod' in dto && dto.paymentMethod !== undefined) entity.paymentMethod = dto.paymentMethod;
    if ('originalBalance' in dto && dto.originalBalance !== undefined) entity.originalBalance = dto.originalBalance;
    if ('interestRate' in dto && dto.interestRate !== undefined) entity.interestRate = dto.interestRate;

    // RENT_LEASE
    if ('startYear' in dto && dto.startYear !== undefined) entity.startYear = dto.startYear;
    if ('endYear' in dto && dto.endYear !== undefined) entity.endYear = dto.endYear;
    if ('idArrendador' in dto && dto.idArrendador !== undefined) entity.idArrendador = dto.idArrendador;
    if ('currencyUnit' in dto && dto.currencyUnit !== undefined) entity.currencyUnit = dto.currencyUnit;
    if ('cotacaoValor' in dto && dto.cotacaoValor !== undefined) entity.cotacaoValor = dto.cotacaoValor;

    // NON_CROP_REVENUE
    if ('revenueSource' in dto && dto.revenueSource !== undefined) entity.revenueSource = dto.revenueSource;

    // fieldIds NOT mapped here — service handles pivot table
    return entity;
  }

  private formatDate(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    if (typeof date === 'string') return date.split('T')[0];
    if (date instanceof Date) return date.toISOString().split('T')[0];
    return null;
  }

  toDto(entity: Agreement): AgreementResponseDto {
    const dto: AgreementResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      fazendaId: entity.fazendaId,
      agreementType: entity.agreementType,
      notes: entity.notes,
      ativo: entity.ativo,
      startDate: this.formatDate(entity.startDate as any),
      termLength: entity.termLength,
      termUnit: entity.termUnit,
      lenderName: entity.lenderName,
      loanType: entity.loanType,
      paymentMethod: entity.paymentMethod,
      originalBalance: entity.originalBalance,
      interestRate: entity.interestRate,
      startYear: entity.startYear,
      endYear: entity.endYear,
      idArrendador: entity.idArrendador,
      currencyUnit: entity.currencyUnit,
      cotacaoValor: entity.cotacaoValor,
      revenueSource: entity.revenueSource,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    if (entity.fazenda) {
      dto.fazenda = {
        id: entity.fazenda.id,
        descricao: entity.fazenda.descricao,
      };
    }

    if (entity.arrendador) {
      dto.arrendador = {
        id_pessoa: entity.arrendador.id_pessoa,
        nomerazao_pessoa: entity.arrendador.nomerazao_pessoa,
      };
    }

    if (entity.usuarioCriador) {
      dto.usuarioCriador = {
        id: entity.usuarioCriador.id,
        nome: entity.usuarioCriador.nome,
      };
    }

    if ((entity as any).leaseTerms && Array.isArray((entity as any).leaseTerms)) {
      dto.leaseTerms = (entity as any).leaseTerms.map((term: any) => ({
        id: term.id,
        termType: term.termType,
        expenseCategory: term.expenseCategory,
        tenantCostAllocation: term.tenantCostAllocation,
      }));
    }

    if ((entity as any).paymentSchedules && Array.isArray((entity as any).paymentSchedules)) {
      dto.paymentSchedules = (entity as any).paymentSchedules.map((schedule: any) => {
        const scheduleDto = {
          id: schedule.id,
          paymentInterval: schedule.paymentInterval,
          paymentPeriod: schedule.paymentPeriod,
          paymentDay: schedule.paymentDay,
          amount: schedule.amount,
          amountRate: schedule.amountRate,
          startDate: this.formatDate(schedule.startDate),
          endDate: this.formatDate(schedule.endDate),
          status: schedule.status || null,
          dataLiquidacao: this.formatDate(schedule.dataLiquidacao) || null,
        };
        adicionarCamposFormatados(scheduleDto, ['amount']);
        return scheduleDto;
      });
    }

    if ((entity as any).agreementFields && Array.isArray((entity as any).agreementFields)) {
      dto.agreementFields = (entity as any).agreementFields.map((field: any) => ({
        agreementId: field.agreementId,
        fieldId: field.fieldId,
        talhao: field.talhao ? {
          id_talhao: field.talhao.id_talhao,
          descricao: field.talhao.descricao,
          area: field.talhao.area,
        } : undefined,
      }));
    }

    adicionarCamposFormatados(dto, ['originalBalance']);

    return dto;
  }
}
