import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade UnidadeMedida
 */
interface UnidadeMedidaAttributes {
  id_unidade: number;
  tenantId: number;
  descricao_unidade: string;
  abreviatura_unidade?: string | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id_unidade é opcional pois é auto-increment)
 */
interface UnidadeMedidaCreationAttributes extends Optional<UnidadeMedidaAttributes, 'id_unidade' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade UnidadeMedida
 * 
 * Unidades de medida para produtos e insumos
 */
class UnidadeMedida
  extends Model<UnidadeMedidaAttributes, UnidadeMedidaCreationAttributes>
  implements UnidadeMedidaAttributes
{
  public id_unidade!: number;
  public tenantId!: number;
  public descricao_unidade!: string;
  public abreviatura_unidade!: string | null;
  public usercreation!: number;
  public datecreation!: Date;
}

UnidadeMedida.init(
  {
    id_unidade: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da unidade de medida',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId', // Mapear explicitamente para tenantId (não tenant_id)
      comment: 'ID do tenant ao qual a unidade de medida pertence',
    },
    descricao_unidade: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição da unidade de medida',
    },
    abreviatura_unidade: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Abreviatura da unidade de medida',
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
    tableName: 'C005_unidadeMedida',
    timestamps: false, // Usa datecreation ao invés de createdAt/updatedAt
    underscored: false, // Mantém os nomes dos campos como estão
  }
);

// Setup association
UnidadeMedida.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default UnidadeMedida;
