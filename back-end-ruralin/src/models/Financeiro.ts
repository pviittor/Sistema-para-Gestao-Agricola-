import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';

interface FinanceiroAttributes {
  id: number;
  tenantId: number;
  usuarioId: number;
  contaId: number;
  historicoId: number;
  planoFinanceiroId: number;
  tipoDocuentoId: number;
  tipoPagamentoId: number;

  contaDesc: string;
  historicoDesc: string;
  planoFinanceiroDesc: string;
  tipoDocuentoDesc: string;
  tipoPagamentoDesc: string;

  dataEmissao: string; // Date or string? Interface says string.
  dataVencimento: string; // Date or string? Interface says string.
  valor: number;
  observacao: string;
}

interface FinanceiroCreationAttributes extends Optional<FinanceiroAttributes, 'id'> {}

class Financeiro extends Model<FinanceiroAttributes, FinanceiroCreationAttributes> implements FinanceiroAttributes {
  public id!: number;
  public tenantId!: number;
  public usuarioId!: number;
  public contaId!: number;
  public historicoId!: number;
  public planoFinanceiroId!: number;
  public tipoDocuentoId!: number;
  public tipoPagamentoId!: number;

  public contaDesc!: string;
  public historicoDesc!: string;
  public planoFinanceiroDesc!: string;
  public tipoDocuentoDesc!: string;
  public tipoPagamentoDesc!: string;

  public dataEmissao!: string;
  public dataVencimento!: string;
  public valor!: number;
  public observacao!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Financeiro.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Será populado na migração de dados, depois será NOT NULL
      comment: 'ID do tenant ao qual o registro financeiro pertence',
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    contaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    historicoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    planoFinanceiroId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tipoDocuentoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tipoPagamentoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    contaDesc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    historicoDesc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    planoFinanceiroDesc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipoDocuentoDesc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipoPagamentoDesc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dataEmissao: {
      type: DataTypes.STRING, // Or STRING
      allowNull: false,
    },
    dataVencimento: {
      type: DataTypes.STRING, // Or STRING
      allowNull: false,
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'financeiros',
  }
);

export default Financeiro;
