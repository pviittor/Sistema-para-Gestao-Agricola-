import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Interface para atributos da entidade FluxoCaixaConfiguracao
 */
interface FluxoCaixaConfiguracaoAttributes {
  id: number;
  tenantId: number;
  saldoMinimoAlerta: number;
  diasProjecaoPadrao: number;
  periodicidadePadrao: string;
  incluirAgreements: boolean;
  incluirTitulos: boolean;
  incluirRecorrentes: boolean;
  contasBancariasFiltro: number[] | null;
  coresConfiguracao: { entrada: string; saida: string; saldo: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface FluxoCaixaConfiguracaoCreationAttributes extends Optional<FluxoCaixaConfiguracaoAttributes,
  'id' | 'saldoMinimoAlerta' | 'diasProjecaoPadrao' | 'periodicidadePadrao' | 'incluirAgreements' | 'incluirTitulos' | 'incluirRecorrentes' | 'contasBancariasFiltro' | 'coresConfiguracao' | 'createdAt' | 'updatedAt'
> {}

/**
 * Modelo Sequelize para a entidade FluxoCaixaConfiguracao
 *
 * Configurações do fluxo de caixa por tenant (uma configuração por tenant).
 */
class FluxoCaixaConfiguracao
  extends Model<FluxoCaixaConfiguracaoAttributes, FluxoCaixaConfiguracaoCreationAttributes>
  implements FluxoCaixaConfiguracaoAttributes
{
  public id!: number;
  public tenantId!: number;
  public saldoMinimoAlerta!: number;
  public diasProjecaoPadrao!: number;
  public periodicidadePadrao!: string;
  public incluirAgreements!: boolean;
  public incluirTitulos!: boolean;
  public incluirRecorrentes!: boolean;
  public contasBancariasFiltro!: number[] | null;
  public coresConfiguracao!: { entrada: string; saida: string; saldo: string } | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FluxoCaixaConfiguracao.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da configuração do fluxo de caixa',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual a configuração pertence',
    },
    saldoMinimoAlerta: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Saldo mínimo para disparo de alerta',
    },
    diasProjecaoPadrao: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      comment: 'Quantidade de dias padrão para projeção do fluxo de caixa',
    },
    periodicidadePadrao: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'DIARIO',
      comment: 'Periodicidade padrão para agrupamento do fluxo (DIARIO, SEMANAL, MENSAL)',
    },
    incluirAgreements: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Se deve incluir agreements na projeção do fluxo de caixa',
    },
    incluirTitulos: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Se deve incluir títulos a pagar/receber na projeção',
    },
    incluirRecorrentes: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Se deve incluir lançamentos recorrentes na projeção',
    },
    contasBancariasFiltro: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      comment: 'Array de IDs de contas bancárias para filtro (null = todas)',
    },
    coresConfiguracao: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      comment: 'Configuração de cores para o gráfico (entrada, saida, saldo)',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de criação do registro',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data da última atualização do registro',
    },
  },
  {
    sequelize,
    tableName: 'C060_fluxoCaixaConfiguracao',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['tenantId'],
      },
    ],
  }
);

// Sem associações — entidade standalone

export default FluxoCaixaConfiguracao;
