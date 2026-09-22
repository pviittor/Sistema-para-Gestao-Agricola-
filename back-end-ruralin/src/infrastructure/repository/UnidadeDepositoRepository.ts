import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IUnidadeDepositoRepository } from './IUnidadeDepositoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import UnidadeDeposito from '../../models/UnidadeDeposito';
import UnidadeMedida from '../../models/UnidadeMedida';
import Produto from '../../models/Produto';
import Usuario from '../../models/Usuario';
import sequelize from '../../config/database';
import { QueryTypes } from 'sequelize';

/**
 * Repositório para entidade UnidadeDeposito
 */
@Injectable()
export class UnidadeDepositoRepository extends BaseRepository<UnidadeDeposito> implements IUnidadeDepositoRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(UnidadeDeposito, cacheService, tenantService);
  }

  /**
   * Busca todas as unidades de depósito de um produto específico
   */
  async findByProduto(idProduto: number, tenantId: number): Promise<UnidadeDeposito[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const result = await this.model.findAll({
      where: {
        idProduto,
        ...tenantFilter,
      } as any,
      include: [
        { model: UnidadeMedida, as: 'unidadeMedida' },
        { model: Produto, as: 'produto' },
        { model: Usuario, as: 'usuarioCriador' },
      ],
      order: [['descricao', 'ASC']],
    });

    return result;
  }

  /**
   * Busca todas as unidades de depósito com saldo calculado
   * Calcula: saldo_inicial + SUM(entradas) - SUM(saídas) da tabela C053_registroArmazenagem
   */
  async findComSaldo(tenantId: number): Promise<any[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    try {
      const result = await sequelize.query(
        `SELECT
          ud.*,
          um.descricao_unidade,
          um.abreviatura_unidade,
          p.descricao_prod,
          u.nome AS nome_usuario,
          COALESCE(ud.saldo_inicial, 0) + COALESCE(ra.total_entradas, 0) - COALESCE(ra.total_saidas, 0) AS saldoAtual,
          CASE
            WHEN ud.capacidade_total > 0 THEN
              ROUND(((COALESCE(ud.saldo_inicial, 0) + COALESCE(ra.total_entradas, 0) - COALESCE(ra.total_saidas, 0)) / ud.capacidade_total) * 100, 2)
            ELSE 0
          END AS percentualUtilizado
        FROM C052_unidadeDeposito ud
        LEFT JOIN (
          SELECT
            idUnidadeDeposito,
            SUM(CASE WHEN tipo = 'Descarga' THEN peso_liquido ELSE 0 END) AS total_entradas,
            SUM(CASE WHEN tipo = 'Carga' THEN peso_liquido ELSE 0 END) AS total_saidas
          FROM C053_registroArmazenagem
          WHERE tenantId = :tenantId
          GROUP BY idUnidadeDeposito
        ) ra ON ud.id = ra.idUnidadeDeposito
        LEFT JOIN C005_unidadeMedida um ON ud.idUnidadeMedida = um.id_unidade
        LEFT JOIN C008_produto p ON ud.idProduto = p.id_prod
        LEFT JOIN usuarios u ON ud.usercreation = u.id
        WHERE ud.tenantId = :tenantId
        ORDER BY ud.descricao ASC`,
        {
          replacements: { tenantId: tenantFilter.tenantId },
          type: QueryTypes.SELECT,
        }
      );

      return result;
    } catch {
      const result = await sequelize.query(
        `SELECT
          ud.*,
          um.descricao_unidade,
          um.abreviatura_unidade,
          p.descricao_prod,
          u.nome AS nome_usuario,
          COALESCE(ud.saldo_inicial, 0) AS saldoAtual,
          CASE
            WHEN ud.capacidade_total > 0 THEN
              ROUND((COALESCE(ud.saldo_inicial, 0) / ud.capacidade_total) * 100, 2)
            ELSE 0
          END AS percentualUtilizado
        FROM C052_unidadeDeposito ud
        LEFT JOIN C005_unidadeMedida um ON ud.idUnidadeMedida = um.id_unidade
        LEFT JOIN C008_produto p ON ud.idProduto = p.id_prod
        LEFT JOIN usuarios u ON ud.usercreation = u.id
        WHERE ud.tenantId = :tenantId
        ORDER BY ud.descricao ASC`,
        {
          replacements: { tenantId: tenantFilter.tenantId },
          type: QueryTypes.SELECT,
        }
      );

      return result;
    }
  }
}
