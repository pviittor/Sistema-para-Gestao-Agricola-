import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade GrupoEquipamento
 */
interface GrupoEquipamentoAttributes {
  id_grpequip: number;
  tenantId: number;
  descricao_grpequip: string;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface GrupoEquipamentoCreationAttributes extends Optional<GrupoEquipamentoAttributes, 'id_grpequip' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade GrupoEquipamento
 *
 * Grupos de equipamentos para organização e categorização de máquinas
 */
class GrupoEquipamento
  extends Model<GrupoEquipamentoAttributes, GrupoEquipamentoCreationAttributes>
  implements GrupoEquipamentoAttributes
{
  public id_grpequip!: number;
  public tenantId!: number;
  public descricao_grpequip!: string;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public usuarioCriador?: Usuario;
}

GrupoEquipamento.init(
  {
    id_grpequip: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do grupo de equipamento',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o grupo de equipamento pertence',
    },
    descricao_grpequip: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição do grupo de equipamento',
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuário que criou o registro',
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
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
    tableName: 'C029_grupoEquipamento',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
GrupoEquipamento.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default GrupoEquipamento;
