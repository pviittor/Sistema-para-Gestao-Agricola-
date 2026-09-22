import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Benfeitoria from './Benfeitoria';
import ServicoAgricola from './ServicoAgricola';
import Pessoa from './Pessoa';
import Moeda from './Moeda';
import TituloPagar from './TituloPagar';
import Safra from './Safra';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade ServicoBenfeitoria
 */
interface ServicoBenfeitoriaAttributes {
  id_srvbenf: number;
  tenantId: number;
  idBenfeitoria: number;
  idServico: number;
  idResponsavel: number;
  idMoeda?: number | null;
  idPagar?: number | null;
  data: string;
  valor: number;
  tempo: number;
  observacao?: string | null;
  idSafra?: number | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criacao (id_srvbenf e opcional pois e auto-increment)
 */
interface ServicoBenfeitoriaCreationAttributes extends Optional<ServicoBenfeitoriaAttributes, 'id_srvbenf' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade ServicoBenfeitoria
 *
 * Registro de servicos realizados em benfeitorias
 */
class ServicoBenfeitoria
  extends Model<ServicoBenfeitoriaAttributes, ServicoBenfeitoriaCreationAttributes>
  implements ServicoBenfeitoriaAttributes
{
  public id_srvbenf!: number;
  public tenantId!: number;
  public idBenfeitoria!: number;
  public idServico!: number;
  public idResponsavel!: number;
  public idMoeda!: number | null;
  public idPagar!: number | null;
  public data!: string;
  public valor!: number;
  public tempo!: number;
  public observacao!: string | null;
  public idSafra!: number | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public benfeitoria?: Benfeitoria;
  public servico?: ServicoAgricola;
  public responsavel?: Pessoa;
  public moeda?: Moeda;
  public tituloPagar?: TituloPagar;
  public safra?: Safra;
  public usuarioCriador?: Usuario;
}

ServicoBenfeitoria.init(
  {
    id_srvbenf: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID unico do servico de benfeitoria',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o registro pertence',
    },
    idBenfeitoria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da benfeitoria relacionada',
      references: {
        model: 'C042_benfeitoria',
        key: 'id_benf',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idServico: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do servico agricola',
      references: {
        model: 'C010_servico',
        key: 'id_srv',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idResponsavel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do responsavel pelo servico (pessoa)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idMoeda: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da moeda utilizada',
      references: {
        model: 'C006_moeda',
        key: 'id_moeda',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idPagar: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do titulo a pagar relacionado',
      references: {
        model: 'C019_tituloPagar',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data do servico',
    },
    valor: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Valor do servico',
    },
    tempo: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Tempo gasto no servico',
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observacoes adicionais',
    },
    idSafra: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da safra',
      references: {
        model: 'C017_safra',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
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
    tableName: 'C044_servicoBenfeitoria',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idBenfeitoria'],
      },
      {
        fields: ['idServico'],
      },
      {
        fields: ['data'],
      },
    ],
  }
);

// Setup associations
ServicoBenfeitoria.belongsTo(Benfeitoria, { foreignKey: 'idBenfeitoria', as: 'benfeitoria' });
ServicoBenfeitoria.belongsTo(ServicoAgricola, { foreignKey: 'idServico', as: 'servico' });
ServicoBenfeitoria.belongsTo(Pessoa, { foreignKey: 'idResponsavel', as: 'responsavel' });
ServicoBenfeitoria.belongsTo(Moeda, { foreignKey: 'idMoeda', as: 'moeda' });
ServicoBenfeitoria.belongsTo(TituloPagar, { foreignKey: 'idPagar', as: 'tituloPagar' });
ServicoBenfeitoria.belongsTo(Safra, { foreignKey: 'idSafra', as: 'safra' });
ServicoBenfeitoria.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default ServicoBenfeitoria;
