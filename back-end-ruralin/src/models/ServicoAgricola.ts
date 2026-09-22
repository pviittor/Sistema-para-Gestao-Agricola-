import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade ServicoAgricola
 */
interface ServicoAgricolaAttributes {
  id_srv: number;
  tenantId: number;
  descricao_srv: string;
  financeiro_srv: boolean;
  observacao_srv?: string | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id_srv é opcional pois é auto-increment)
 */
interface ServicoAgricolaCreationAttributes extends Optional<ServicoAgricolaAttributes, 'id_srv' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade ServicoAgricola
 * 
 * Serviços agrícolas do sistema
 */
class ServicoAgricola
  extends Model<ServicoAgricolaAttributes, ServicoAgricolaCreationAttributes>
  implements ServicoAgricolaAttributes
{
  public id_srv!: number;
  public tenantId!: number;
  public descricao_srv!: string;
  public financeiro_srv!: boolean;
  public observacao_srv!: string | null;
  public usercreation!: number;
  public datecreation!: Date;
}

ServicoAgricola.init(
  {
    id_srv: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do serviço agrícola',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o serviço pertence',
    },
    descricao_srv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição do serviço agrícola',
    },
    financeiro_srv: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o serviço gera movimento financeiro (futuro)',
    },
    observacao_srv: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações sobre o serviço',
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
    tableName: 'C010_servico',
    timestamps: false,
    underscored: false,
  }
);

// Setup associations
ServicoAgricola.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default ServicoAgricola;
