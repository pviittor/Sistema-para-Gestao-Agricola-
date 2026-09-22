import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import AtividadeAgricola from './AtividadeAgricola';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade AtividadeOperacao
 */
interface AtividadeOperacaoAttributes {
  id_op: number;
  tenantId: number;
  descricao: string;
  idAtividade: number;
  financeiro: boolean;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id_op é opcional pois é auto-increment)
 */
interface AtividadeOperacaoCreationAttributes extends Optional<AtividadeOperacaoAttributes, 'id_op' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade AtividadeOperacao
 *
 * Cadastro de operações de atividades agrícolas
 */
class AtividadeOperacao
  extends Model<AtividadeOperacaoAttributes, AtividadeOperacaoCreationAttributes>
  implements AtividadeOperacaoAttributes
{
  public id_op!: number;
  public tenantId!: number;
  public descricao!: string;
  public idAtividade!: number;
  public financeiro!: boolean;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public atividadeAgricola?: AtividadeAgricola;
  public usuarioCriador?: Usuario;
}

AtividadeOperacao.init(
  {
    id_op: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da operação',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual a operação pertence',
    },
    descricao: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição da operação',
    },
    idAtividade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da atividade agrícola',
      references: {
        model: 'C036_atividadeAgricola',
        key: 'id_atv',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    financeiro: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se a operação é financeira',
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
    tableName: 'C037_atividadeOperacao',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idAtividade'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
AtividadeOperacao.belongsTo(AtividadeAgricola, { foreignKey: 'idAtividade', as: 'atividadeAgricola' });
AtividadeOperacao.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default AtividadeOperacao;
