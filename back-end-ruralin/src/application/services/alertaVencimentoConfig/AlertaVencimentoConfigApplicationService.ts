/**
 * AlertaVencimentoConfigApplicationService
 *
 * Gerencia configurações de alerta de vencimento e processamento de alertas automáticos.
 * RN-26 a RN-29
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IAlertaVencimentoConfigApplicationService } from './IAlertaVencimentoConfigApplicationService';
import { IAlertaVencimentoConfigRepository } from '../../../infrastructure/repository/IAlertaVencimentoConfigRepository';
import { IAlertaVencimentoRepository } from '../../../infrastructure/repository/IAlertaVencimentoRepository';
import { IParcelaTituloPagarRepository } from '../../../infrastructure/repository/IParcelaTituloPagarRepository';
import { IParcelaTituloReceberRepository } from '../../../infrastructure/repository/IParcelaTituloReceberRepository';
import { AlertaVencimentoConfigMapper } from '../../mappers/AlertaVencimentoConfigMapper';
import { NotFoundException, BusinessException, ForbiddenException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { CacheEvict } from '../../../core/cache';
import { getRequestContext } from '../../../core/authorization/helpers';
import { IAuditService } from '../../../core/audit/IAuditService';
import { Op } from 'sequelize';

@Injectable()
export class AlertaVencimentoConfigApplicationService implements IAlertaVencimentoConfigApplicationService {
  private mapper: AlertaVencimentoConfigMapper;

  constructor(
    @Inject(TYPES.IAuditService) private auditService: IAuditService,
    @Inject(TYPES.IAlertaVencimentoConfigRepository) private configRepository: IAlertaVencimentoConfigRepository,
    @Inject(TYPES.IAlertaVencimentoRepository) private alertaRepository: IAlertaVencimentoRepository,
    @Inject(TYPES.IParcelaTituloPagarRepository) private parcelaPagarRepository: IParcelaTituloPagarRepository,
    @Inject(TYPES.IParcelaTituloReceberRepository) private parcelaReceberRepository: IParcelaTituloReceberRepository
  ) {
    this.mapper = new AlertaVencimentoConfigMapper();
  }

  @RequirePermission('alertaVencimentoConfig.create')
  @Transactional()
  @Auditable('AlertaVencimentoConfig')
  @CacheEvict('alertaVencimentoConfig:findByUsuario:*', true)
  async create(dto: any): Promise<any> {
    const context = getRequestContext();
    if (!context?.getUserId()) throw new ForbiddenException('Usuário não autenticado.', 'USER_NOT_AUTHENTICATED');
    const userId = context.getUserId()!;
    const tenantId = context.getTenantId();
    if (!tenantId) throw new ForbiddenException('Tenant não identificado.', 'TENANT_NOT_IDENTIFIED');

    // Validar unicidade por (usuarioId, tenantId, tipoTitulo)
    const existentes = await this.configRepository.findByUsuario(userId, tenantId);
    const duplicada = existentes.find(c => c.tipoTitulo === dto.tipoTitulo);
    if (duplicada) {
      throw new BusinessException(
        `Já existe configuração de alerta para tipo ${dto.tipoTitulo}. Use update.`,
        'CONFIG_DUPLICADA'
      );
    }

    // Validar ordem de antecedência
    this.validarOrdemAntecedencia(dto);

    const entity = this.mapper.toEntity(dto, userId, tenantId);
    (entity as any).usercreation = userId;
    (entity as any).datecreation = new Date();

    const created = await this.configRepository.create(entity as any);
    return this.mapper.toDto(created);
  }

  @RequirePermission('alertaVencimentoConfig.update')
  @Transactional()
  @Auditable('AlertaVencimentoConfig')
  @CacheEvict('alertaVencimentoConfig:findByUsuario:*', true)
  async update(id: number | string, dto: any): Promise<any> {
    const existing = await this.configRepository.findById(id);
    if (!existing) throw new NotFoundException('AlertaVencimentoConfig', id);

    this.validarOrdemAntecedencia({ ...existing, ...dto });

    const context = getRequestContext();
    const userId = context?.getUserId() || existing.usuarioId;
    const tenantId = context?.getTenantId() || existing.tenantId;
    const entity = this.mapper.toEntity(dto, userId, tenantId);
    const updated = await this.configRepository.update(id, entity as any);
    return this.mapper.toDto(updated);
  }

  @RequirePermission('alertaVencimentoConfig.delete')
  @Transactional()
  @CacheEvict('alertaVencimentoConfig:findByUsuario:*', true)
  async delete(id: number | string): Promise<boolean> {
    const existing = await this.configRepository.findById(id);
    if (!existing) return false;
    return this.configRepository.delete(id);
  }

  @RequirePermission('alertaVencimentoConfig.read')
  async findByUsuario(): Promise<any[]> {
    const context = getRequestContext();
    const userId = context?.getUserId();
    const tenantId = context?.getTenantId();
    if (!userId || !tenantId) return [];
    const configs = await this.configRepository.findByUsuario(userId, tenantId);
    return configs.map(c => this.mapper.toDto(c));
  }

  /**
   * RN-26: Processamento diário de alertas de vencimento
   */
  async processarAlertasVencimento(dataBase?: Date): Promise<{ lembretes_criados: number; parcelas_processadas: number }> {
    const hoje = dataBase || new Date();
    const hojeStr = hoje.toISOString().split('T')[0];
    const configs = await this.configRepository.findAtivas();
    let lembretes_criados = 0;
    let parcelas_processadas = 0;

    for (const config of configs) {
      const diasAlerta = [
        config.antecedenciaAlerta1Dias,
        config.antecedenciaAlerta2Dias,
        config.antecedenciaAlerta3Dias,
      ].filter(d => d && d > 0) as number[];

      if (config.notificarNoVencimento) diasAlerta.push(0);

      // Processar parcelas a pagar
      if (config.tipoTitulo === 'PAGAR' || config.tipoTitulo === 'AMBOS') {
        const parcelasPagar = await this.parcelaPagarRepository.findVencidas();
        const maxDias = Math.max(...diasAlerta, 0);
        const dataLimite = new Date(hoje);
        dataLimite.setDate(dataLimite.getDate() + maxDias);
        const parcelasAVencer = await this.parcelaPagarRepository.findAVencer(dataLimite);
        const todasParcelas = [...parcelasPagar, ...parcelasAVencer];

        for (const parcela of todasParcelas) {
          parcelas_processadas++;
          const dataVenc = new Date(String(parcela.dataVencimento));
          const diff = Math.floor((dataVenc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

          const deveAlertar = diasAlerta.some(d => d === -diff) ||
            (diff < 0 && config.notificarVencidos);

          if (!deveAlertar) continue;

          // RN-27: Deduplicação
          const existe = await this.alertaRepository.existeAlertaParaParcela('PAGAR', parcela.id, hojeStr);
          if (existe) continue;

          // RN-29: Criar alerta
          const tipoAlerta = diff > 0 ? 'ANTECIPADO' : diff === 0 ? 'NO_VENCIMENTO' : 'VENCIDO';
          const valorSaldo = Number((parcela as any).valorSaldo) || Number(parcela.valorParcela);
          const mensagem = `[VENCIMENTO] PAGAR - Parcela ${parcela.numeroParcela}/${(parcela as any).numeroTotalParcelas || 1} - R$ ${valorSaldo.toFixed(2)}`;

          await this.alertaRepository.create({
            tenantId: config.tenantId,
            usuarioId: config.usuarioId,
            alertaVencimentoConfigId: config.id,
            tipoParcela: 'PAGAR',
            idParcela: parcela.id,
            idTitulo: parcela.idTituloPagar,
            dataVencimentoParcela: parcela.dataVencimento,
            dataAlerta: hojeStr,
            tipoAlerta,
            diasAntecedencia: -diff,
            mensagem,
            valorSaldo,
          } as any);
          lembretes_criados++;
        }
      }

      // Processar parcelas a receber (análogo)
      if (config.tipoTitulo === 'RECEBER' || config.tipoTitulo === 'AMBOS') {
        const parcelasReceber = await this.parcelaReceberRepository.findVencidas();
        const maxDiasR = Math.max(...diasAlerta, 0);
        const dataLimiteR = new Date(hoje);
        dataLimiteR.setDate(dataLimiteR.getDate() + maxDiasR);
        const parcelasAVencer = await this.parcelaReceberRepository.findAVencer(dataLimiteR);
        const todasParcelas = [...parcelasReceber, ...parcelasAVencer];

        for (const parcela of todasParcelas) {
          parcelas_processadas++;
          const dataVenc = new Date(String(parcela.dataVencimento));
          const diff = Math.floor((dataVenc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

          const deveAlertar = diasAlerta.some(d => d === -diff) ||
            (diff < 0 && config.notificarVencidos);

          if (!deveAlertar) continue;

          const existe = await this.alertaRepository.existeAlertaParaParcela('RECEBER', parcela.id, hojeStr);
          if (existe) continue;

          const tipoAlerta = diff > 0 ? 'ANTECIPADO' : diff === 0 ? 'NO_VENCIMENTO' : 'VENCIDO';
          const valorSaldo = Number((parcela as any).valorSaldo) || Number(parcela.valorParcela);
          const mensagem = `[VENCIMENTO] RECEBER - Parcela ${parcela.numeroParcela}/${(parcela as any).numeroTotalParcelas || 1} - R$ ${valorSaldo.toFixed(2)}`;

          await this.alertaRepository.create({
            tenantId: config.tenantId,
            usuarioId: config.usuarioId,
            alertaVencimentoConfigId: config.id,
            tipoParcela: 'RECEBER',
            idParcela: parcela.id,
            idTitulo: (parcela as any).idTituloReceber,
            dataVencimentoParcela: parcela.dataVencimento,
            dataAlerta: hojeStr,
            tipoAlerta,
            diasAntecedencia: -diff,
            mensagem,
            valorSaldo,
          } as any);
          lembretes_criados++;
        }
      }
    }

    return { lembretes_criados, parcelas_processadas };
  }

  private validarOrdemAntecedencia(dto: any): void {
    const a1 = dto.antecedenciaAlerta1Dias || 0;
    const a2 = dto.antecedenciaAlerta2Dias || 0;
    const a3 = dto.antecedenciaAlerta3Dias || 0;

    if (a1 > 0 && a2 > 0 && a1 < a2) {
      throw new BusinessException('antecedencia_alerta_1 deve ser >= antecedencia_alerta_2', 'ORDEM_ANTECEDENCIA_INVALIDA');
    }
    if (a2 > 0 && a3 > 0 && a2 < a3) {
      throw new BusinessException('antecedencia_alerta_2 deve ser >= antecedencia_alerta_3', 'ORDEM_ANTECEDENCIA_INVALIDA');
    }
  }
}
