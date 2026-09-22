import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade AtividadeAgricola
 */
interface AtividadeAgricolaAttributes {
  id_atv: number;
  tenantId: number;
  descricao: string;
  tipo: number;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id_atv é opcional pois é auto-increment)
 */
interface AtividadeAgricolaCreationAttributes extends Optional<AtividadeAgricolaAttributes, 'id_atv' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade AtividadeAgricola
 *
 * Cadastro de atividades agrícolas (produção, manutenção de máquinas, administrativas)
 */
class AtividadeAgricola
  extends Model<AtividadeAgricolaAttributes, AtividadeAgricolaCreationAttributes>
  implements AtividadeAgricolaAttributes
{
  public id_atv!: number;
  public tenantId!: number;
  public descricao!: string;
  public tipo!: number;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public usuarioCriador?: Usuario;
}

AtividadeAgricola.init(
  {
    id_atv: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da atividade agrícola',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual a atividade pertence',
    },
    descricao: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição da atividade agrícola',
    },
    tipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Tipo da atividade (0=Produção, 1=Manutenção Máquinas, 2=Administrativas)',
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
    tableName: 'C036_atividadeAgricola',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['tipo'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
AtividadeAgricola.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default AtividadeAgricola;
