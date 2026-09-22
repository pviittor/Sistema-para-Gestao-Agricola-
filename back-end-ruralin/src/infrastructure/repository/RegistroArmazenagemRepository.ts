import { Op, Sequelize } from 'sequelize';
import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IRegistroArmazenagemRepository } from './IRegistroArmazenagemRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import RegistroArmazenagem from '../../models/RegistroArmazenagem';
import Produto from '../../models/Produto';
import UnidadeMedida from '../../models/UnidadeMedida';
import ConfiguradorCiclo from '../../models/ConfiguradorCiclo';
import UnidadeDeposito from '../../models/UnidadeDeposito';
import Pessoa from '../../models/Pessoa';
import Usuario from '../../models/Usuario';
import Talhao from '../../models/Talhao';
import { TipoRegistroArmazenagem } from '../../models/enums/RegistroArmazenagemEnums';
import { PaginatedResult } from '../../core/repository/types';

/**
 * Repositório para entidade RegistroArmazenagem
 */
@Injectable()
export class RegistroArmazenagemRepository extends BaseRepository<RegistroArmazenagem> implements IRegistroArmazenagemRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(RegistroArmazenagem, cacheService, tenantService);
  }

  /**
   * Includes padrão para associações
   */
  private getDefaultIncludes() {
    return [
      { model: Produto, as: 'produto', attributes: ['id_prod', 'descricao_prod'] },
      { model: UnidadeMedida, as: 'unidadeMedida', attributes: ['id_unidade', 'descricao_unidade', 'abreviatura_unidade'] },
      { model: ConfiguradorCiclo, as: 'origem', attributes: ['id_cfg', 'idTalhao', 'idCiclo', 'idCultura'], include: [{ model: Talhao, as: 'talhao', attributes: ['id_talhao', 'descricao'] }] },
      { model: UnidadeDeposito, as: 'unidadeDeposito', attributes: ['id', 'descricao'] },
      { model: Pessoa, as: 'motorista', attributes: ['id_pessoa', 'nomerazao_pessoa'] },
      { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
    ];
  }

  /**
   * Busca registro por ID com associações
   */
  async findById(id: number | string): Promise<RegistroArmazenagem | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const result = await this.model.findOne({
      where: {
        id,
        ...tenantFilter,
      } as any,
      include: this.getDefaultIncludes(),
    });

    return result;
  }

  /**
   * Busca todos os registros com associações principais
   */
  async findAll(options?: any): Promise<RegistroArmazenagem[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    return await this.model.findAll({
      where: {
        ...options?.where,
        ...tenantFilter,
      } as any,
      include: this.getDefaultIncludes(),
      order: [['data', 'DESC'], ['id', 'DESC']],
    });
  }

  /**
   * Override para incluir associações na paginação
   */
  async findAllPaginated(page: number, limit: number, options?: any): Promise<PaginatedResult<RegistroArmazenagem>> {
    return super.findAllPaginated(page, limit, {
      ...options,
      include: options?.include ?? this.getDefaultIncludes(),
      order: options?.order ?? [['data', 'DESC'], ['id', 'DESC']],
    });
  }

  /**
   * Busca todos os registros de uma unidade de depósito específica
   */
  async findByUnidadeDeposito(idUnidadeDeposito: number, tenantId: number): Promise<RegistroArmazenagem[]> {
    const result = await this.model.findAll({
      where: {
        idUnidadeDeposito,
        tenantId,
      } as any,
      include: this.getDefaultIncludes(),
      order: [['data', 'DESC'], ['id', 'DESC']],
    });

    return result;
  }

  /**
   * Busca registros por período
   */
  async findByPeriodo(dataInicio: string, dataFim: string, tenantId: number): Promise<RegistroArmazenagem[]> {
    const result = await this.model.findAll({
      where: {
        data: {
          [Op.between]: [dataInicio, dataFim],
        },
        tenantId,
      } as any,
      include: this.getDefaultIncludes(),
      order: [['data', 'DESC'], ['id', 'DESC']],
    });

    return result;
  }

  /**
   * Busca todos os registros de um produto específico
   */
  async findByProduto(idProduto: number, tenantId: number): Promise<RegistroArmazenagem[]> {
    const result = await this.model.findAll({
      where: {
        idProduto,
        tenantId,
      } as any,
      include: this.getDefaultIncludes(),
      order: [['data', 'DESC'], ['id', 'DESC']],
    });

    return result;
  }

  /**
   * Calcula o saldo atual de uma unidade de depósito
   * Saldo = SUM(peso_liquido WHERE tipo='Descarga') - SUM(peso_liquido WHERE tipo='Carga')
   */
  async getSaldoByUnidade(idUnidadeDeposito: number, tenantId: number): Promise<number> {
    const result = await this.model.findOne({
      where: {
        idUnidadeDeposito,
        tenantId,
      } as any,
      attributes: [
        [
          Sequelize.literal(
            `COALESCE(SUM(CASE WHEN tipo = '${TipoRegistroArmazenagem.Descarga}' THEN peso_liquido ELSE 0 END), 0) - ` +
            `COALESCE(SUM(CASE WHEN tipo = '${TipoRegistroArmazenagem.Carga}' THEN peso_liquido ELSE 0 END), 0)`
          ),
          'saldo',
        ],
      ],
      raw: true,
    });

    const saldo = result ? parseFloat((result as any).saldo) || 0 : 0;
    return saldo;
  }
}
