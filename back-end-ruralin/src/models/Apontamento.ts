import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import ConfiguradorCiclo from './ConfiguradorCiclo';
import AtividadeAgricola from './AtividadeAgricola';
import AtividadeOperacao from './AtividadeOperacao';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade Apontamento
 */
interface ApontamentoAttributes {
  id_apt: number;
  tenantId: number;
  idConfiguracao: number;
  idAtividade: number;
  idOperacao: number;
  dataInicio?: string | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criacao (id_apt e opcional pois e auto-increment)
 */
interface ApontamentoCreationAttributes extends Optional<ApontamentoAttributes, 'id_apt' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade Apontamento
 *
 * Registro de apontamentos de atividades agricolas
 */
class Apontamento
  extends Model<ApontamentoAttributes, ApontamentoCreationAttributes>
  implements ApontamentoAttributes
{
  public id_apt!: number;
  public tenantId!: number;
  public idConfiguracao!: number;
  public idAtividade!: number;
  public idOperacao!: number;
  public dataInicio!: string | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public configuracao?: ConfiguradorCiclo;
  public atividade?: AtividadeAgricola;
  public operacao?: AtividadeOperacao;
  public usuarioCriador?: Usuario;
}

Apontamento.init(
  {
    id_apt: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID unico do apontamento',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o apontamento pertence',
    },
    idConfiguracao: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da configuracao do ciclo',
      references: {
        model: 'C035_configuradorCiclo',
        key: 'id_cfg',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idAtividade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da atividade agricola',
      references: {
        model: 'C036_atividadeAgricola',
        key: 'id_atv',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idOperacao: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da operacao da atividade',
      references: {
        model: 'C037_atividadeOperacao',
        key: 'id_op',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    dataInicio: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de inicio do apontamento (se futura = planejado)',
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuario que criou o registro',
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
      comment: 'Data de criacao do registro',
    },
  },
  {
    sequelize,
    tableName: 'C038_apontamento',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idConfiguracao'],
      },
      {
        fields: ['idAtividade'],
      },
      {
        fields: ['idOperacao'],
      },
      {
        fields: ['dataInicio'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
Apontamento.belongsTo(ConfiguradorCiclo, { foreignKey: 'idConfiguracao', as: 'configuracao' });
Apontamento.belongsTo(AtividadeAgricola, { foreignKey: 'idAtividade', as: 'atividade' });
Apontamento.belongsTo(AtividadeOperacao, { foreignKey: 'idOperacao', as: 'operacao' });
Apontamento.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default Apontamento;
