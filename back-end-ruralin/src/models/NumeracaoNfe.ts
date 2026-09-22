import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Atributos da entidade NumeracaoNfe
 */
interface NumeracaoNfeAttributes {
  id: number;
  tenantId: number;
  serie: string;
  modelo: string;
  ultimo_numero: number;
  ativo: boolean;
}

interface NumeracaoNfeCreationAttributes extends Optional<NumeracaoNfeAttributes, 'id' | 'ativo'> {}

/**
 * Modelo Sequelize para controle de numeração sequencial de NF-e
 * por tenant, série e modelo
 */
class NumeracaoNfe
  extends Model<NumeracaoNfeAttributes, NumeracaoNfeCreationAttributes>
  implements NumeracaoNfeAttributes
{
  public id!: number;
  public tenantId!: number;
  public serie!: string;
  public modelo!: string;
  public ultimo_numero!: number;
  public ativo!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NumeracaoNfe.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    serie: {
      type: DataTypes.STRING(5),
      allowNull: false,
      comment: 'Série da NF-e (ex: 1, 2, 100)',
    },
    modelo: {
      type: DataTypes.STRING(2),
      allowNull: false,
      comment: 'Modelo: 55=NF-e, 65=NFC-e',
    },
    ultimo_numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Último número utilizado',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'C055_numeracaoNfe',
    timestamps: true,
    underscored: false,
  }
);

export default NumeracaoNfe;
