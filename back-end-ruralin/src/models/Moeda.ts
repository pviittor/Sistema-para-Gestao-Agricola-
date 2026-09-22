import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade Moeda
 */
interface MoedaAttributes {
  id_moeda: number;
  tenantId: number;
  descricao_moeda: string;
  simbolo_moeda?: string | null;
  codigoIntegracaoBancoCentral?: string | null;
  siglabc_moeda?: string | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id_moeda é opcional pois é auto-increment)
 */
interface MoedaCreationAttributes extends Optional<MoedaAttributes, 'id_moeda' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade Moeda
 * 
 * Moedas utilizadas no sistema
 */
class Moeda
  extends Model<MoedaAttributes, MoedaCreationAttributes>
  implements MoedaAttributes
{
  public id_moeda!: number;
  public tenantId!: number;
  public descricao_moeda!: string;
  public simbolo_moeda!: string | null;
  public codigoIntegracaoBancoCentral!: string | null;
  public siglabc_moeda!: string | null;
  public usercreation!: number;
  public datecreation!: Date;
}

Moeda.init(
  {
    id_moeda: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da moeda',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual a moeda pertence',
    },
    descricao_moeda: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição da moeda',
    },
    simbolo_moeda: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Símbolo da moeda (ex: R$, $, €)',
    },
    codigoIntegracaoBancoCentral: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Código de integração com Banco Central',
    },
    siglabc_moeda: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Sigla da moeda no Banco Central',
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuário que criou o registro',
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    datecreation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de criação do registro',
    },
  },
  {
    sequelize,
    tableName: 'C006_moeda',
    timestamps: false,
    underscored: false,
  }
);

// Setup association
Moeda.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default Moeda;
