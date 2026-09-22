import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { RequirePermission } from '../../../core/authorization/RequirePermission';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { Cacheable } from '../../../core/cache/Cacheable';
import { CacheEvict } from '../../../core/cache/CacheEvict';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BusinessException } from '../../../core/exceptions/BusinessException';
import { IReciboRepository } from '../../../infrastructure/repository/IReciboRepository';
import { INumeracaoReciboRepository } from '../../../infrastructure/repository/INumeracaoReciboRepository';
import { IConfiguracaoReciboRepository } from '../../../infrastructure/repository/IConfiguracaoReciboRepository';
import { ITituloPagarRepository } from '../../../infrastructure/repository/ITituloPagarRepository';
import { ITituloReceberRepository } from '../../../infrastructure/repository/ITituloReceberRepository';
import { IReciboApplicationService } from './IReciboApplicationService';
import { ReciboMapper } from '../../mappers/ReciboMapper';
import { CreateReciboDto, UpdateReciboDto, ReciboResponseDto, CancelarReciboDto, ReciboKpisDto } from '../../dto/recibo';
import { PaginatedResult } from '../../../core/repository/types';
import { getRequestContext } from '../../../core/authorization/helpers';
import { valorPorExtenso } from '../../../utils/valorPorExtenso';
import { Op } from 'sequelize';
import Recibo from '../../../models/Recibo';
import { StatusRecibo } from '../../../models/enums/ReciboEnums';

@Injectable()
export class ReciboApplicationService implements IReciboApplicationService {
  constructor(
    @Inject(TYPES.IReciboRepository) private readonly repository: IReciboRepository,
    @Inject(TYPES.INumeracaoReciboRepository) private readonly numeracaoReciboRepository: INumeracaoReciboRepository,
    @Inject(TYPES.IConfiguracaoReciboRepository) private readonly configuracaoReciboRepository: IConfiguracaoReciboRepository,
    @Inject(TYPES.ITituloPagarRepository) private readonly tituloPagarRepository: ITituloPagarRepository,
    @Inject(TYPES.ITituloReceberRepository) private readonly tituloReceberRepository: ITituloReceberRepository,
    private readonly mapper: ReciboMapper
  ) {}

  @RequirePermission('recibo.read')
  @Cacheable('recibo:list:{0}:{1}', 300)
  async list(page = 1, limit = 100, filtros?: any): Promise<PaginatedResult<ReciboResponseDto>> {
    if (filtros) {
      const where: any = {};

      if (filtros.status) {
        where.status = filtros.status;
      }

      if (filtros.dataEmissaoInicio && filtros.dataEmissaoFim) {
        where.dataEmissao = { [Op.between]: [filtros.dataEmissaoInicio, filtros.dataEmissaoFim] };
      }

      if (filtros.nomeBeneficiario) {
        where.nomeBeneficiario = { [Op.like]: `%${filtros.nomeBeneficiario}%` };
      }

      const result = await this.repository.findAllPaginated(page, limit, { where });
      return { ...result, data: result.data.map((e: any) => this.mapper.toResponseDto(e)) };
    }

    const result = await this.repository.findAllPaginated(page, limit);
    return { ...result, data: result.data.map((e: any) => this.mapper.toResponseDto(e)) };
  }

  @RequirePermission('recibo.read')
  async findById(id: number): Promise<ReciboResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException('Recibo não encontrado');
    return this.mapper.toResponseDto(entity);
  }

  @RequirePermission('recibo.create')
  @Transactional()
  @CacheEvict('recibo:*', true)
  async create(dto: CreateReciboDto): Promise<ReciboResponseDto> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    const userId = context?.getUserId();

    // Buscar série ativa de numeração
    const serieAtiva = await this.numeracaoReciboRepository.findBySerieAtiva();
    if (!serieAtiva) {
      throw new BusinessException('Nenhuma série de numeração ativa encontrada. Cadastre uma série antes de emitir recibos.');
    }

    // Obter próximo número
    const numero = await this.numeracaoReciboRepository.proximoNumero(serieAtiva.id, tenantId!);
    const serie = serieAtiva.serie;
    const numeroFormatado = `${serie}-${String(numero).padStart(6, '0')}`;

    // Gerar valor por extenso
    const valorExtenso = valorPorExtenso(dto.valor);

    // Construir entidade
    const entity = this.mapper.toEntity(dto);
    (entity as any).tenantId = tenantId;
    (entity as any).usercreation = userId;
    (entity as any).status = StatusRecibo.EMITIDO;
    (entity as any).serie = serie;
    (entity as any).numero = numero;
    (entity as any).numeroFormatado = numeroFormatado;
    (entity as any).valorExtenso = valorExtenso;

    const created = await this.repository.create(entity as any);

    // Buscar registro completo com associações
    const complete = await this.repository.findById(created.id);
    return this.mapper.toResponseDto(complete!);
  }

  @RequirePermission('recibo.update')
  @Transactional()
  @CacheEvict('recibo:*', true)
  async update(id: number, dto: UpdateReciboDto): Promise<ReciboResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Recibo não encontrado');

    if (existing.status === StatusRecibo.CANCELADO) {
      throw new BusinessException('Recibo cancelado não pode ser editado');
    }

    const entity = this.mapper.toEntity(dto);

    // Regenerar valor por extenso se valor foi alterado
    if (dto.valor !== undefined) {
      (entity as any).valorExtenso = valorPorExtenso(dto.valor);
    }

    await this.repository.update(id, entity as any);
    const updated = await this.repository.findById(id);
    return this.mapper.toResponseDto(updated!);
  }

  @RequirePermission('recibo.delete')
  @Transactional()
  @CacheEvict('recibo:*', true)
  async delete(id: number): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Recibo não encontrado');

    if (existing.status === StatusRecibo.CANCELADO) {
      throw new BusinessException('Recibo cancelado não pode ser deletado');
    }

    return this.repository.delete(id);
  }

  @RequirePermission('recibo.cancel')
  @Transactional()
  @CacheEvict('recibo:*', true)
  async cancelar(id: number, dto: CancelarReciboDto): Promise<ReciboResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Recibo não encontrado');

    if (existing.status !== StatusRecibo.EMITIDO) {
      throw new BusinessException('Apenas recibos emitidos podem ser cancelados');
    }

    const context = getRequestContext();
    const userId = context?.getUserId();

    await this.repository.update(id, {
      status: StatusRecibo.CANCELADO,
      motivoCancelamento: dto.motivoCancelamento,
      usuarioCancelamentoId: userId,
      dataCancelamento: new Date(),
    } as any);

    const updated = await this.repository.findById(id);
    return this.mapper.toResponseDto(updated!);
  }

  @RequirePermission('recibo.read')
  async getKpis(dataInicio?: string, dataFim?: string): Promise<ReciboKpisDto> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    const where: any = { tenantId };

    if (dataInicio && dataFim) {
      where.dataEmissao = { [Op.between]: [dataInicio, dataFim] };
    }

    const recibos = await Recibo.findAll({ where });

    let totalEmitidos = 0;
    let totalCancelados = 0;
    let valorTotalEmitido = 0;
    const quantidadePorFormaPagamento: Record<string, number> = {};

    for (const recibo of recibos) {
      if (recibo.status === StatusRecibo.EMITIDO) {
        totalEmitidos++;
        valorTotalEmitido += Number(recibo.valor) || 0;

        const forma = recibo.formaPagamento || 'OUTROS';
        quantidadePorFormaPagamento[forma] = (quantidadePorFormaPagamento[forma] || 0) + 1;
      } else if (recibo.status === StatusRecibo.CANCELADO) {
        totalCancelados++;
      }
    }

    const kpis = new ReciboKpisDto();
    kpis.totalEmitidos = totalEmitidos;
    kpis.totalCancelados = totalCancelados;
    kpis.valorTotalEmitido = valorTotalEmitido;
    kpis.quantidadePorFormaPagamento = quantidadePorFormaPagamento;

    return kpis;
  }

  @RequirePermission('recibo.read')
  async prePreencherDeParcela(parcelaId: number, tipoParcela: string): Promise<Partial<CreateReciboDto>> {
    if (tipoParcela === 'TITULO_PAGAR') {
      const titulo = await this.tituloPagarRepository.findById(parcelaId);
      if (!titulo) throw new NotFoundException('Título a pagar não encontrado');

      return {
        tipoVinculo: 'TITULO_PAGAR',
        tituloPagarId: titulo.id,
        valor: (titulo as any).valor,
        nomeBeneficiario: (titulo as any).nomeBeneficiario || (titulo as any).fornecedor?.nome,
        descricao: (titulo as any).descricao || (titulo as any).historico,
      } as Partial<CreateReciboDto>;
    }

    if (tipoParcela === 'TITULO_RECEBER') {
      const titulo = await this.tituloReceberRepository.findById(parcelaId);
      if (!titulo) throw new NotFoundException('Título a receber não encontrado');

      return {
        tipoVinculo: 'TITULO_RECEBER',
        tituloReceberId: titulo.id,
        valor: (titulo as any).valor,
        nomeBeneficiario: (titulo as any).nomeBeneficiario || (titulo as any).cliente?.nome,
        descricao: (titulo as any).descricao || (titulo as any).historico,
      } as Partial<CreateReciboDto>;
    }

    throw new BusinessException('Tipo de parcela inválido. Use TITULO_PAGAR ou TITULO_RECEBER.');
  }
}
