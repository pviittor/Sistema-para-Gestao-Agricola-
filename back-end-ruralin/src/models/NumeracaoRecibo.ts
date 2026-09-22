import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface NumeracaoReciboAttributes {
  id: number;
  tenantId: number;
  serie: string;
  ultimoNumero: number;
  ativo: boolean;
}

interface NumeracaoReciboCreationAttributes extends Optional<NumeracaoReciboAttributes, 'id' | 'ativo' | 'ultimoNumero'> {}

class NumeracaoRecibo extends Model<NumeracaoReciboAttributes, NumeracaoReciboCreationAttributes>
  implements NumeracaoReciboAttributes
{
  public id!: number;
  public tenantId!: number;
  public serie!: string;
  public ultimoNumero!: number;
  public ativo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NumeracaoRecibo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da numeração de recibo',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant',
    },
    serie: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Série da numeração do recibo',
    },
    ultimoNumero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Último número utilizado na série',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica se a numeração está ativa',
    },
  },
  {
    sequelize,
    tableName: 'C063_numeracaoRecibo',
    timestamps: true,
    underscored: false,
  }
);

export default NumeracaoRecibo;
